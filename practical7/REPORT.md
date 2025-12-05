# Practical 7: Performance Testing Report

**Student Name:** Tenzin  
**Date:** December 5, 2025  
**Application:** Dog CEO API Browser (Next.js)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Test Environment](#test-environment)
3. [Test Criteria](#test-criteria)
4. [Test Results](#test-results)
5. [Performance Analysis](#performance-analysis)
6. [Recommendations](#recommendations)

---

## Executive Summary

This report presents the results of comprehensive performance testing conducted on the Dog CEO API Browser application using k6. Four types of load tests were executed both locally and on k6 Cloud to evaluate system performance under various conditions.

### Key Findings
- **Average Load**: [To be filled after testing]
- **Spike Load**: [To be filled after testing]
- **Stress Test**: [To be filled after testing]
- **Soak Test**: [To be filled after testing]

---

## Test Environment

### Application Details
- **Framework:** Next.js 16.0.0
- **Runtime:** Node.js
- **APIs Tested:**
  - `GET /` - Homepage
  - `GET /api/dogs` - Random dog image
  - `GET /api/dogs/breeds` - List all breeds
  - `GET /api/dogs?breed={name}` - Specific breed image

### Testing Tools
- **Load Testing Tool:** k6 v1.3.0
- **Local Environment:** Windows
- **Cloud Environment:** k6 Cloud (Grafana)
- **Network Tool:** ngrok (for cloud testing)

### Infrastructure
- **Local Server:** http://localhost:3000
- **Public URL (Cloud Tests):** [To be filled with ngrok URL]

---

## Test Criteria

### 1. Average Load Test

**Purpose:** Evaluate system performance under typical, sustained user load

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Duration** | 9 minutes (2min ramp-up + 5min sustained + 2min ramp-down) | Sufficient time to observe stable performance |
| **Virtual Users** | 15 concurrent users | Represents normal daily traffic |
| **Expected Response Time** | p(95) < 1000ms | Good user experience threshold |
| **Throughput** | ~45-60 requests/second | Based on 15 VUs with 10-15s per iteration |
| **Error Rate** | < 1% | Production-grade reliability |

**Success Criteria:**
- ✅ All API endpoints respond with HTTP 200
- ✅ 95% of requests complete within 1 second
- ✅ Error rate stays below 1%
- ✅ System remains stable throughout test

---

### 2. Spike Load Test

**Purpose:** Test system resilience under sudden extreme traffic increase

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Duration** | 1 minute (10s ramp-up + 40s spike + 10s ramp-down) | Short burst to simulate viral traffic |
| **Peak Virtual Users** | 100 concurrent users | Extreme load (adjust based on laptop capability) |
| **Expected Response Time** | p(95) < 5000ms | Lenient during spike - system survival is priority |
| **Throughput** | Maximum sustainable | Measure system capacity limit |
| **Error Rate** | < 10% | Acceptable degradation during extreme conditions |

**Success Criteria:**
- ✅ System does not crash
- ✅ Error rate stays below 10%
- ✅ System recovers after spike
- ✅ Critical endpoints remain accessible

**Note:** Spike VUs set to 100, but can be adjusted based on laptop performance. The goal is to push your system to its limits.

---

### 3. Stress Test

**Purpose:** Identify system breaking point by gradually increasing load

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Duration** | 5 minutes (1min per stage) | Progressive load increase |
| **Virtual Users** | 10 → 20 → 30 → 40 → 50 | Gradual escalation to find limits |
| **Expected Response Time** | p(95) < 3000ms | More lenient as we approach breaking point |
| **Throughput** | Measure at each stage | Identify when throughput plateaus |
| **Error Rate** | < 20% | Track when failures begin |

**Success Criteria:**
- ✅ Identify maximum sustainable load
- ✅ Document at which stage performance degrades
- ✅ Track error rate increase pattern
- ✅ Measure response time degradation

---

### 4. Soak Test (Endurance Test)

**Purpose:** Detect memory leaks and performance degradation over extended period

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Duration** | 30 minutes (2min ramp-up + 26min soak + 2min ramp-down) | Long enough to detect memory leaks |
| **Virtual Users** | 15 concurrent users (constant) | Moderate sustained load |
| **Expected Response Time** | p(95) < 1000ms (consistent) | Performance should not degrade over time |
| **Throughput** | ~45-60 requests/second (stable) | Consistent throughout test |
| **Error Rate** | < 2% | Strict reliability requirement |

**Success Criteria:**
- ✅ Response times remain consistent over 30 minutes
- ✅ No memory leaks (response time doesn't increase)
- ✅ Error rate stays below 2%
- ✅ System stable at end as at beginning

---

## Test Results

### 1. Average Load Test Results

#### Local Execution
![Average Load Test - Local](screenshots/average-load-local.png)

**Key Metrics:**
- **Duration:** [To be filled]
- **Total Requests:** [To be filled]
- **Virtual Users:** 15
- **HTTP Request Duration:**
  - avg: [To be filled]
  - p(95): [To be filled]
  - p(99): [To be filled]
- **HTTP Request Failed:** [To be filled]%
- **Error Rate:** [To be filled]%
- **Throughput:** [To be filled] req/s

#### k6 Cloud Execution
![Average Load Test - Cloud](screenshots/average-load-cloud.png)

**Cloud-Specific Metrics:**
- **Test Run ID:** [To be filled]
- **Peak RPS:** [To be filled]
- **Data Transferred:** [To be filled]
- **Geographic Distribution:** [To be filled]

**Analysis:**
[To be filled after testing - compare local vs cloud performance, explain any differences]

---

### 2. Spike Load Test Results

#### Local Execution
![Spike Load Test - Local](screenshots/spike-load-local.png)

**Key Metrics:**
- **Peak VUs:** 100
- **Duration:** 1 minute
- **HTTP Request Duration:**
  - avg: [To be filled]
  - p(95): [To be filled]
  - max: [To be filled]
- **HTTP Request Failed:** [To be filled]%
- **Error Rate:** [To be filled]%
- **System Behavior:** [Describe if system crashed, slowed, or survived]

#### k6 Cloud Execution
![Spike Load Test - Cloud](screenshots/spike-load-cloud.png)

**Cloud-Specific Metrics:**
- **Peak RPS:** [To be filled]
- **Error Count:** [To be filled]
- **Recovery Time:** [To be filled]

**Analysis:**
[To be filled - Did system survive the spike? At what point did it start failing? How quickly did it recover?]

---

### 3. Stress Test Results

#### Local Execution
![Stress Test - Local](screenshots/stress-test-local.png)

**Key Metrics:**
- **Duration:** 5 minutes
- **VU Progression:** 10 → 20 → 30 → 40 → 50
- **Breaking Point:** [VU count where significant degradation occurred]
- **HTTP Request Duration by Stage:**
  - Stage 1 (10 VUs): p(95) = [To be filled]
  - Stage 2 (20 VUs): p(95) = [To be filled]
  - Stage 3 (30 VUs): p(95) = [To be filled]
  - Stage 4 (40 VUs): p(95) = [To be filled]
  - Stage 5 (50 VUs): p(95) = [To be filled]
- **Error Rate Progression:** [Describe pattern]

#### k6 Cloud Execution
![Stress Test - Cloud](screenshots/stress-test-cloud.png)

**Analysis:**
[To be filled - At which load level did performance start degrading? What was the breaking point? How did error rates change?]

---

### 4. Soak Test Results

#### Local Execution
![Soak Test - Local](screenshots/soak-test-local.png)

**Key Metrics:**
- **Duration:** 30 minutes
- **Virtual Users:** 15 (constant)
- **Total Iterations:** [To be filled]
- **HTTP Request Duration:**
  - First 5 min avg: [To be filled]
  - Middle (15 min) avg: [To be filled]
  - Last 5 min avg: [To be filled]
- **Response Time Trend:** [Increasing/Stable/Decreasing]
- **Memory Leak Indicators:** [Yes/No - based on response time trend]
- **Error Rate:** [To be filled]%

#### k6 Cloud Execution
![Soak Test - Cloud](screenshots/soak-test-cloud.png)

**Cloud-Specific Metrics:**
- **Total Data Transferred:** [To be filled]
- **Average RPS:** [To be filled]
- **Performance Consistency:** [Stable/Degrading]

**Analysis:**
[To be filled - Did performance degrade over time? Any signs of memory leaks? Was system as performant at minute 30 as minute 1?]

---

## Performance Analysis

### Overall System Performance

#### Strengths
[To be filled after testing - e.g., "System handled average load exceptionally well with p(95) < 500ms"]

#### Weaknesses
[To be filled after testing - e.g., "Spike test revealed vulnerabilities at 100+ concurrent users"]

#### Bottlenecks Identified
[To be filled after testing - e.g., "External Dog CEO API became bottleneck during stress test"]

### Comparison: Local vs Cloud Testing

| Metric | Local | Cloud | Difference |
|--------|-------|-------|------------|
| Average Response Time | [TBF] | [TBF] | [TBF] |
| Peak RPS | [TBF] | [TBF] | [TBF] |
| Error Rate | [TBF] | [TBF] | [TBF] |
| Maximum VUs Supported | [TBF] | [TBF] | [TBF] |

**Analysis:** [Explain differences - network latency, infrastructure capabilities, etc.]

### Test Type Comparison

| Test Type | Duration | Max VUs | p(95) Response | Error Rate | Pass/Fail |
|-----------|----------|---------|----------------|------------|-----------|
| Average Load | 9 min | 15 | [TBF] | [TBF] | [TBF] |
| Spike Load | 1 min | 100 | [TBF] | [TBF] | [TBF] |
| Stress Test | 5 min | 50 | [TBF] | [TBF] | [TBF] |
| Soak Test | 30 min | 15 | [TBF] | [TBF] | [TBF] |

---

## Recommendations

### Immediate Actions
1. [To be filled based on test results]
2. [To be filled based on test results]

### Performance Optimizations
1. [To be filled - e.g., "Implement caching for breeds API to reduce external API calls"]
2. [To be filled - e.g., "Add connection pooling to handle spike loads better"]

### Infrastructure Improvements
1. [To be filled - e.g., "Consider load balancer for >50 concurrent users"]
2. [To be filled - e.g., "Implement CDN for static assets"]

### Monitoring & Alerting
1. [To be filled - e.g., "Set up alerts for response times > 1000ms"]
2. [To be filled - e.g., "Monitor error rates in production"]

---

## Conclusion

[To be filled after all tests complete - overall assessment of application performance, readiness for production, key takeaways]

---

## Appendices

### Appendix A: Test Scripts
- Average Load Test: `tests/k6/average-load-test.js`
- Spike Load Test: `tests/k6/spike-load-test.js`
- Stress Test: `tests/k6/stress-test.js`
- Soak Test: `tests/k6/soak-test.js`

### Appendix B: k6 Commands Used

**Local Testing:**
```bash
npm run test:k6:average
npm run test:k6:spike
npm run test:k6:stress
npm run test:k6:soak
```

**Cloud Testing:**
```bash
npm run test:k6:cloud:average
npm run test:k6:cloud:spike
npm run test:k6:cloud:stress
npm run test:k6:cloud:soak
```

### Appendix C: Screenshots
All test result screenshots are available in the `screenshots/` directory:
- `average-load-local.png`
- `average-load-cloud.png`
- `spike-load-local.png`
- `spike-load-cloud.png`
- `stress-test-local.png`
- `stress-test-cloud.png`
- `soak-test-local.png`
- `soak-test-cloud.png`
