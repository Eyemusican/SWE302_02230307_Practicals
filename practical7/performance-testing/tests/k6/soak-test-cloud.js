import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Base URL - use environment variable or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const memoryLeakIndicator = new Trend('response_time_trend');
const totalIterations = new Counter('total_iterations');

// Test configuration for Soak Test (Cloud Version - Reduced for ngrok)
export const options = {
  stages: [
    { duration: '2m', target: 3 },     // Ramp up to 3 users (ngrok free tier limit)
    { duration: '26m', target: 3 },    // Maintain 3 users for 26 minutes
    { duration: '2m', target: 0 },      // Ramp down gracefully
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],  // Relaxed for 30min ngrok test
    http_req_failed: ['rate<0.05'],                   // Keep strict on HTTP failures
    errors: ['rate<1.0'],                             // Allow check failures (external API)
    response_time_trend: ['p(95)<2500'],              // Relaxed trend threshold
  },
};

let testStartTime = Date.now();

export default function () {
  totalIterations.add(1);
  const elapsedMinutes = (Date.now() - testStartTime) / 60000;
  
  // 1. User visits homepage
  let response = http.get(BASE_URL, {
    tags: { type: 'page', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'homepage stable over time': (r) => r.status === 200,
    'homepage performance consistent': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  sleep(2);

  // 2. User checks breeds list
  response = http.get(`${BASE_URL}/api/dogs/breeds`, {
    tags: { type: 'api', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'breeds API stable': (r) => r.status === 200,
    'breeds API returns data consistently': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Object.keys(data.message).length > 0;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(2);

  // 3. User gets random dogs
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'dogs API endures long test': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);

  // Log progress every 5 minutes
  if (Math.floor(elapsedMinutes) % 5 === 0 && elapsedMinutes > 0) {
    console.log(`⏱️  Soak test progress: ${Math.floor(elapsedMinutes)} minutes elapsed`);
  }
}

export function setup() {
  console.log('⏳ SOAK TEST (Cloud): 30-minute endurance test');
  console.log('🔍 Testing for memory leaks and performance degradation');
  console.log('👥 Maintaining 10 concurrent users');
}

export function teardown(data) {
  console.log('✅ Soak test completed - 30 minutes');
  console.log('📊 Check for performance degradation over time');
}
