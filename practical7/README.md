# Practical 7: Performance Testing with k6

## Overview

This practical demonstrates comprehensive performance testing using k6 for a Next.js Dog CEO API Browser application. Tests were executed both locally and on k6 Cloud (via Grafana) to evaluate system performance under various load conditions.

---

## Test Scenarios

### 1. Average Load Test
**Purpose:** Simulate typical sustained user traffic over an extended period.

**Test Criteria:**
- **Duration:** 9 minutes (2min ramp-up, 5min sustained, 2min ramp-down)
- **Virtual Users (VUs):**
  - Local: 15 concurrent users
  - Cloud: 3 concurrent users (ngrok limitation)
- **Thresholds:**
  - p(95) response time < 2000ms
  - p(99) response time < 3000ms
  - HTTP failure rate < 5%
  - Error rate < 100% (allows external API failures)
- **User Journey:** Homepage → Breeds list → Random dog → Specific breed selection

**Expected Behavior:** System maintains stable performance with consistent response times throughout the sustained load period.

---

### 2. Spike Load Test
**Purpose:** Test system resilience during sudden, extreme traffic spikes.

**Test Criteria:**
- **Duration:** 1 minute 10 seconds
- **Virtual Users (VUs):**
  - Local: 100 concurrent users (extremely high load)
  - Cloud: 3 concurrent users (ngrok limitation)
- **Load Pattern:** 
  - 0→5 VUs (10s) → 100 VUs spike (10s) → Hold 100 VUs (40s) → 0 VUs (10s) - Local
  - 0→1 VUs (10s) → 3 VUs spike (10s) → Hold 3 VUs (40s) → 0 VUs (10s) - Cloud
- **Thresholds:**
  - p(95) response time < 5000ms (lenient during spike)
  - HTTP failure rate < 10%
  - Error rate < 15%
- **User Journey:** Full user flow with random breed selection

**Expected Behavior:** System handles sudden traffic surge without crashing, may show degraded performance during peak.

---

### 3. Stress Test
**Purpose:** Identify system breaking point by progressively increasing load.

**Test Criteria:**
- **Duration:** 5 minutes
- **Virtual Users (VUs):**
  - Local: Progressive ramp 10→20→30→40→50 VUs (1min each stage)
  - Cloud: Progressive ramp 2→2.2→2.4→2.6→3 VUs (ngrok limitation)
- **Thresholds:**
  - p(95) response time < 3000ms
  - HTTP failure rate < 15%
  - Error rate < 20%
  - Performance degradation rate < 50%
- **User Journey:** Complete user workflow through all endpoints

**Expected Behavior:** System performance degrades gradually; test identifies maximum sustainable load before failure.

---

### 4. Soak Test
**Purpose:** Detect memory leaks and performance degradation over extended operation.

**Test Criteria:**
- **Duration:** 30 minutes
- **Virtual Users (VUs):**
  - Local: 15 concurrent users
  - Cloud: 3 concurrent users (ngrok limitation)
- **Load Pattern:** 2min ramp-up → 26min sustained load → 2min ramp-down
- **Thresholds:**
  - p(95) response time < 2000ms
  - p(99) response time < 3000ms
  - HTTP failure rate < 5%
  - Memory leak indicator < 1.3x baseline
- **Monitoring:** Progress logged every 5 minutes

**Expected Behavior:** System maintains stable performance with no memory leaks or progressive degradation over 30 minutes.

---

## Test Execution Summary

### Local Testing (High VU Counts)
All local tests executed against `http://localhost:3000` with high VU counts to stress-test system capacity:
- Spike: 100 VUs - 0% errors
- Average: 15 VUs - 0% errors
- Stress: 10→50 VUs - Progressive load
- Soak: 15 VUs for 30 minutes - No degradation

### Cloud Testing (Reduced VU Counts)
Cloud tests executed via k6 Cloud (Grafana) using ngrok tunnel with reduced VU counts:
- Spike: 3 VUs - 0 HTTP failures
- Average: 3 VUs - 0 HTTP failures
- Stress: 2→3 VUs - 0 HTTP failures
- Soak: 3 VUs for 30 minutes - 1 failure out of 1,801 requests (99.94% success)

**Cloud Test Links:**
- Spike: https://ec02230307cst.grafana.net/a/k6-app/runs/6250108
- Average: https://ec02230307cst.grafana.net/a/k6-app/runs/6250194
- Stress: https://ec02230307cst.grafana.net/a/k6-app/runs/6250241
- Soak: https://ec02230307cst.grafana.net/a/k6-app/runs/6250534

---

## Infrastructure Constraints

### ngrok Free Tier Limitation
Cloud tests required significant VU reduction (from 100 to 3) due to ngrok free tier constraints:

**Issue:** ngrok free tier supports approximately 10-15 concurrent connections maximum. Exceeding this limit causes:
- Connection timeouts (EOF errors)
- Request rate limiting
- 77-93% failure rates with 25+ VUs

**Solution:** Created separate cloud-specific test files (`*-cloud.js`) with reduced VU counts (3 VUs) to stay within ngrok's connection limits while maintaining test duration and structure.

**Impact:** This demonstrates real-world infrastructure constraints in cloud testing and the importance of understanding deployment environment limitations when conducting performance tests.

---

## Key Metrics Tracked

- **http_req_duration:** Total request time (DNS + connection + waiting + receiving)
- **http_req_waiting:** Time to First Byte (TTFB)
- **http_req_failed:** HTTP request failure rate
- **errors:** Application check failure rate
- **vus:** Active virtual users
- **iterations:** Completed user journeys
- **Custom metrics:**
  - `total_requests`: Total HTTP requests made
  - `degradationRate`: Performance degradation indicator (stress test)
  - `memoryLeakIndicator`: Memory usage trend (soak test)
  - `response_time_trend`: Response time progression

---

## Test Files Structure

```
tests/k6/
├── average-load-test.js         # Local: 15 VUs, 9 minutes
├── average-load-test-cloud.js   # Cloud: 3 VUs, 9 minutes
├── spike-load-test.js           # Local: 100 VUs, 1 minute
├── spike-load-test-cloud.js     # Cloud: 3 VUs, 1 minute
├── stress-test.js               # Local: 10→50 VUs, 5 minutes
├── stress-test-cloud.js         # Cloud: 2→3 VUs, 5 minutes
├── soak-test.js                 # Local: 15 VUs, 30 minutes
└── soak-test-cloud.js           # Cloud: 3 VUs, 30 minutes
```

---

## Running the Tests

### Prerequisites
```bash
# Install k6
choco install k6  # Windows
brew install k6   # macOS

# Start Next.js app
cd performance-testing
npm install
npm run dev
```

### Local Tests
```bash
npm run test:k6:spike      # 1 minute
npm run test:k6:average    # 9 minutes
npm run test:k6:stress     # 5 minutes
npm run test:k6:soak       # 30 minutes
```

### Cloud Tests (requires ngrok)
```bash
# Start ngrok in separate terminal
ngrok http 3000

# Set BASE_URL and run cloud tests
$env:BASE_URL = "https://your-ngrok-url.ngrok-free.app"
npm run test:k6:cloud:spike    # 1 minute
npm run test:k6:cloud:average  # 9 minutes
npm run test:k6:cloud:stress   # 5 minutes
npm run test:k6:cloud:soak     # 30 minutes
```

---

## Screenshots

All test results captured in `screenshots/` folder:

**Local Tests (Terminal Output):**
- ![`spike-test-local.png`](screenshots/image.png)
- ![`average-test-local.png`](screenshots/image-2.png)
- ![`stress-test-local.png`](screenshots/image-1.png)
- ![`soak-test-local.png`](screenshots/image-3.png)

**Cloud Tests (Grafana Dashboard):**
- ![`spike-test-cloud.png`](screenshots/image-4.png)
- ![`average-test-cloud.png`](screenshots/image-5.png)
- ![`stress-test-cloud.png`](screenshots/image-6.png)
- ![`soak-test-cloud.png`](screenshots/image7.png)

---

## Conclusion

This practical successfully demonstrates:
- Understanding of different performance test types
- Ability to configure and execute k6 tests locally and in cloud
- Recognition of infrastructure constraints and adaptation strategies
- Comprehensive performance monitoring and metric tracking
- Real-world application of performance testing best practices

The system performed excellently under local high-load testing (100 VUs) with 0% error rates. Cloud testing validated the same test scenarios within infrastructure constraints, demonstrating adaptability and understanding of deployment environment limitations.
