import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Base URL - use environment variable or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const totalRequests = new Counter('total_requests');

// Test configuration for Spike Load
// Spike test: Sudden extreme increase in load for 1 minute
export const options = {
  stages: [
    { duration: '10s', target: 5 },      // Start with 5 users
    { duration: '10s', target: 100 },    // Spike to 100 users in 10 seconds (EXTREME)
    { duration: '40s', target: 100 },    // Maintain spike for 40 seconds
    { duration: '10s', target: 0 },      // Drop to 0
  ],
  thresholds: {
    // During spike, we expect degraded performance but system should not crash
    http_req_duration: ['p(95)<5000'],   // 95% under 5s (lenient during spike)
    http_req_failed: ['rate<0.10'],      // Max 10% failure rate
    errors: ['rate<0.15'],                // Max 15% error rate
  },
};

export default function () {
  // Simplified user journey during spike test
  // Focus on core functionality under extreme load

  // 1. Homepage access
  let response = http.get(BASE_URL);
  totalRequests.add(1);
  check(response, {
    'homepage accessible during spike': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(0.5); // Minimal sleep during spike

  // 2. Random dog API (most common action)
  response = http.get(`${BASE_URL}/api/dogs`);
  totalRequests.add(1);
  check(response, {
    'random dog API responds': (r) => r.status === 200,
    'random dog API has data': (r) => {
      try {
        return JSON.parse(r.body).message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(0.5);

  // 3. Breeds API
  response = http.get(`${BASE_URL}/api/dogs/breeds`);
  totalRequests.add(1);
  check(response, {
    'breeds API responds during spike': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);
}

export function setup() {
  console.log('🚀 SPIKE TEST: Prepare for extreme load!');
  console.log('📊 Target: 100 concurrent users (adjust based on your laptop capability)');
  console.log('⏱️  Duration: 1 minute spike');
}

export function teardown(data) {
  console.log('✅ Spike test completed');
  console.log('📈 Check if system recovered after spike');
}
