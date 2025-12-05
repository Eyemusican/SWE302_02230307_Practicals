import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const memoryLeakIndicator = new Trend('response_time_trend');
const totalIterations = new Counter('total_iterations');

// Test configuration for Soak Test (Endurance Test)
// Soak test: Extended duration with moderate load to detect memory leaks and degradation
export const options = {
  stages: [
    { duration: '2m', target: 15 },     // Ramp up to 15 users
    { duration: '26m', target: 15 },    // Maintain 15 users for 26 minutes (soak period)
    { duration: '2m', target: 0 },      // Ramp down gracefully
  ],
  // Total duration: 30 minutes
  thresholds: {
    // System should maintain stable performance throughout
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],      // Max 2% failure rate (very strict)
    errors: ['rate<0.02'],                // Max 2% error rate
    // Check that performance doesn't degrade over time
    response_time_trend: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

let testStartTime = Date.now();

export default function () {
  totalIterations.add(1);
  const elapsedMinutes = (Date.now() - testStartTime) / 60000;
  
  // Realistic user journey - repeated for 30 minutes
  
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

  // 3. User gets random dog (most common action)
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'random dog API stable': (r) => r.status === 200,
    'random dog API has data': (r) => {
      try {
        return JSON.parse(r.body).message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(3);

  // 4. User selects specific breed
  const breeds = ['husky', 'corgi', 'retriever', 'bulldog', 'poodle', 'beagle', 'labrador', 'terrier', 'pug', 'boxer'];
  const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
  response = http.get(`${BASE_URL}/api/dogs?breed=${randomBreed}`, {
    tags: { type: 'api', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'breed API stable over time': (r) => r.status === 200,
    'breed API has image': (r) => {
      try {
        return JSON.parse(r.body).message !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  sleep(3);

  // 5. User explores another random dog
  response = http.get(`${BASE_URL}/api/dogs`, {
    tags: { type: 'api', elapsed_min: Math.floor(elapsedMinutes) },
  });
  memoryLeakIndicator.add(response.timings.duration);
  check(response, {
    'second random dog stable': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(4);

  // Log progress every ~5 minutes worth of iterations
  if (totalIterations.value % 20 === 0) {
    console.log(`⏱️  Soak test running: ${elapsedMinutes.toFixed(1)} minutes elapsed`);
  }
}

export function setup() {
  console.log('🏃 SOAK TEST (ENDURANCE TEST): 30-minute sustained load');
  console.log('📊 Load: Constant 15 virtual users');
  console.log('⏱️  Duration: 30 minutes');
  console.log('🎯 Goals:');
  console.log('   - Detect memory leaks');
  console.log('   - Identify performance degradation over time');
  console.log('   - Verify system stability under prolonged use');
  console.log('');
  console.log('☕ Grab a coffee - this will take a while...');
  testStartTime = Date.now();
}

export function teardown(data) {
  const duration = (Date.now() - testStartTime) / 60000;
  console.log('');
  console.log('✅ Soak test completed');
  console.log(`⏱️  Total duration: ${duration.toFixed(1)} minutes`);
  console.log('📈 Key things to check:');
  console.log('   1. Did response times increase over time? (memory leak indicator)');
  console.log('   2. Did error rate increase towards the end? (resource exhaustion)');
  console.log('   3. Was performance consistent throughout?');
}
