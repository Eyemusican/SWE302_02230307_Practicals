import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Base URL - use environment variable or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const degradationRate = new Trend('performance_degradation');

// Test configuration for Stress Test (Cloud Version - Reduced for ngrok)
export const options = {
  stages: [
    { duration: '1m', target: 1 },     // Start low (ngrok free tier limit)
    { duration: '1m', target: 2 },     // Increase slightly
    { duration: '1m', target: 3 },     // Increase to 3
    { duration: '1m', target: 3 },     // Hold at 3
    { duration: '1m', target: 3 },     // Maintain (max for ngrok free tier)
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.20'],
    errors: ['rate<0.25'],
    'http_req_duration{type:api}': ['p(99)<5000'],
  },
};

let startTime = Date.now();

function getPhase(elapsedMinutes) {
  if (elapsedMinutes < 1) return 'normal';
  if (elapsedMinutes < 2) return 'above_normal';
  if (elapsedMinutes < 3) return 'high';
  if (elapsedMinutes < 4) return 'very_high';
  return 'extreme';
}

export default function () {
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - startTime) / 60000;
  
  // 1. Load homepage
  let response = http.get(BASE_URL, {
    tags: { type: 'page', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'homepage loads under stress': (r) => r.status === 200,
    'homepage response acceptable': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
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
        return JSON.parse(r.body).message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  degradationRate.add(response.timings.duration);
  sleep(1);

  // 3. Random dogs API
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api', phase: getPhase(elapsedMinutes) },
  });
  check(response, {
    'dogs API stable under stress': (r) => r.status === 200,
  }) || errorRate.add(1);
  degradationRate.add(response.timings.duration);
  sleep(0.5);
}

export function setup() {
  console.log('💪 STRESS TEST (Cloud): Finding breaking point');
  console.log('📈 Ramping from 5 to 25 users over 5 minutes');
}

export function teardown(data) {
  console.log('✅ Stress test completed');
  console.log('📊 Check performance degradation metrics');
}
