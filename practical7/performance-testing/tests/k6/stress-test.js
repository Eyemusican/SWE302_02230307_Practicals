import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const degradationRate = new Trend('performance_degradation');

// Test configuration for Stress Test
// Stress test: Gradually increase load beyond normal capacity to find breaking point
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Normal load
    { duration: '1m', target: 20 },    // Above normal
    { duration: '1m', target: 30 },    // High load
    { duration: '1m', target: 40 },    // Very high load
    { duration: '1m', target: 50 },    // Extreme load (stress point)
  ],
  // Total duration: 5 minutes
  thresholds: {
    // More lenient thresholds as we're pushing beyond capacity
    http_req_duration: ['p(95)<3000'],     // 95% under 3s
    http_req_failed: ['rate<0.20'],        // Max 20% failure rate
    errors: ['rate<0.25'],                  // Max 25% error rate
    // Track if performance degrades over time
    'http_req_duration{type:api}': ['p(99)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

let startTime = Date.now();

export default function () {
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - startTime) / 60000;
  
  // Full user journey under stress
  
  // 1. Load homepage
  let response = http.get(BASE_URL, {
    tags: { type: 'page', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'homepage loads under stress': (r) => r.status === 200,
    'homepage response acceptable': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
  // Track performance degradation over time
  degradationRate.add(response.timings.duration);
  sleep(1);

  // 2. Breeds API
  response = http.get(`${BASE_URL}/api/dogs/breeds`, {
    tags: { type: 'api', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'breeds API responds': (r) => r.status === 200,
    'breeds API has valid data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Object.keys(data.message).length > 0;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(1);

  // 3. Random dog
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'random dog API responds': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);

  // 4. Specific breed (higher load on external API)
  const breeds = ['husky', 'corgi', 'retriever', 'bulldog', 'poodle', 'beagle', 'labrador', 'terrier'];
  const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
  response = http.get(`${BASE_URL}/api/dogs?breed=${randomBreed}`, {
    tags: { type: 'api', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'specific breed API responds': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
}

function getPhase(minutes) {
  if (minutes < 1) return 'normal';
  if (minutes < 2) return 'above_normal';
  if (minutes < 3) return 'high';
  if (minutes < 4) return 'very_high';
  return 'extreme';
}

export function setup() {
  console.log('🔥 STRESS TEST: Gradually increasing load to find breaking point');
  console.log('📊 Load progression: 10 → 20 → 30 → 40 → 50 VUs');
  console.log('⏱️  Duration: 5 minutes');
  console.log('🎯 Goal: Identify system limits and performance degradation');
}

export function teardown(data) {
  console.log('✅ Stress test completed');
  console.log('📈 Review performance degradation metrics');
  console.log('🔍 Check at which load level system started failing');
}
