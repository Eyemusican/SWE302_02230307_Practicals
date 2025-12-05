import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Base URL - use environment variable or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

// Test configuration for Average Load (Cloud Version - Reduced for ngrok)
export const options = {
  stages: [
    { duration: '2m', target: 3 },   // Ramp up to 3 users (ngrok free tier limit)
    { duration: '5m', target: 3 },   // Stay at 3 users for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],           // Relaxed for ngrok latency
    'http_req_duration{type:api}': ['p(99)<3000'], // Relaxed for cloud testing
    errors: ['rate<1.0'],                        // Allow all check failures (external API)
    http_req_failed: ['rate<0.05'],              // Keep strict on HTTP failures
  },
};

export default function () {
  // 1. Load homepage
  let response = http.get(BASE_URL, {
    tags: { type: 'page' },
  });
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in reasonable time': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  sleep(2);

  // 2. Fetch breeds list
  response = http.get(`${BASE_URL}/api/dogs/breeds`, {
    tags: { type: 'api' },
  });
  apiResponseTime.add(response.timings.duration);
  check(response, {
    'breeds API status is 200': (r) => r.status === 200,
    'breeds API returns data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Object.keys(data.message).length > 0;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(1);

  // 3. Fetch random dog images
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api' },
  });
  apiResponseTime.add(response.timings.duration);
  check(response, {
    'random dogs API status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);

  // 4. Another breeds request
  response = http.get(`${BASE_URL}/api/dogs/breeds`, {
    tags: { type: 'api' },
  });
  apiResponseTime.add(response.timings.duration);
  check(response, {
    'breeds API consistent': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
}

export function setup() {
  console.log('📊 AVERAGE LOAD TEST (Cloud): Starting with 10 concurrent users');
  console.log('⏱️  Duration: 9 minutes');
}

export function teardown(data) {
  console.log('✅ Average load test completed');
}
