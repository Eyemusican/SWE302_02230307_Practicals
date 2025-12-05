import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

// Test configuration for Average Load
export const options = {
  stages: [
    { duration: '2m', target: 15 },   // Ramp up to 15 users over 2 minutes
    { duration: '5m', target: 15 },   // Stay at 15 users for 5 minutes (sustained load)
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    // 95% of requests should complete within 1000ms
    http_req_duration: ['p(95)<1000'],
    // 99% of requests should complete within 2000ms
    'http_req_duration{type:api}': ['p(99)<2000'],
    // Error rate should be less than 5% (more realistic for external API dependency)
    errors: ['rate<0.05'],
    // Failed requests should be less than 5%
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate realistic user behavior with average load

  // 1. Load homepage
  let response = http.get(BASE_URL, {
    tags: { type: 'page' },
  });
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in reasonable time': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  sleep(2); // User reads the page

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
  sleep(1); // User reviews breed options

  // 3. Get random dog image
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api' },
  });
  apiResponseTime.add(response.timings.duration);
  check(response, {
    'random dog API status is 200': (r) => r.status === 200,
    'random dog API returns image URL': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(3); // User views the dog image

  // 4. Get specific breed (random selection)
  const breeds = ['husky', 'corgi', 'retriever', 'bulldog', 'poodle', 'beagle', 'labrador'];
  const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
  response = http.get(`${BASE_URL}/api/dogs?breed=${randomBreed}`, {
    tags: { type: 'api' },
  });
  apiResponseTime.add(response.timings.duration);
  check(response, {
    'specific breed API status is 200': (r) => r.status === 200,
    'specific breed API returns image': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(2); // User views breed-specific image
}

// Removed custom handleSummary - using default k6 output
