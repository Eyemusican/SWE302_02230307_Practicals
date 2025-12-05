# Practical 7 - Testing Guide

## ✅ Setup Complete!

All 4 test scripts have been created:
1. ✅ `tests/k6/average-load-test.js` - 9 minute sustained load test
2. ✅ `tests/k6/spike-load-test.js` - 1 minute extreme spike test
3. ✅ `tests/k6/stress-test.js` - 5 minute progressive stress test
4. ✅ `tests/k6/soak-test.js` - 30 minute endurance test

## 📋 What You Need To Do

### Step 1: Run Local Tests & Take Screenshots

Make sure your Next.js app is running (`npm run dev` in one terminal), then run each test:

```powershell
# Terminal 1: Keep this running
cd C:\Users\Tenzin\SWE302_02230307_Practicals\practical7\performance-testing
npm run dev

# Terminal 2: Run tests one by one
cd C:\Users\Tenzin\SWE302_02230307_Practicals\practical7\performance-testing

# 1. Average Load Test (9 minutes)
npm run test:k6:average
# 📸 Screenshot the final output → save as screenshots/average-load-local.png

# 2. Spike Load Test (1 minute)
npm run test:k6:spike
# 📸 Screenshot the final output → save as screenshots/spike-load-local.png

# 3. Stress Test (5 minutes)
npm run test:k6:stress
# 📸 Screenshot the final output → save as screenshots/stress-test-local.png

# 4. Soak Test (30 minutes - LONGEST!)
npm run test:k6:soak
# 📸 Screenshot the final output → save as screenshots/soak-test-local.png
```

**⏱️ Total Time for Local Tests:** ~45 minutes

---

### Step 2: Setup k6 Cloud & ngrok

#### A. Create k6 Cloud Account
1. Go to https://grafana.com/products/cloud/
2. Sign up for free account
3. Navigate to Testing & Synthetics → Performance → Settings
4. Copy your Personal API Token

#### B. Authenticate k6 Cloud
```powershell
k6 cloud login --token YOUR_TOKEN_HERE
```

#### C. Setup ngrok (for public URL)
1. Download ngrok: https://ngrok.com/download
2. Extract and run:
```powershell
# In a new terminal (keep it running)
ngrok http 3000
```
3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

---

### Step 3: Run Cloud Tests & Take Screenshots

Make sure ngrok is running with your app exposed, then:

```powershell
# Set your public URL as environment variable
$env:BASE_URL = "https://YOUR-NGROK-URL.ngrok.io"

# Run cloud tests
npm run test:k6:cloud:average
# 📸 Screenshot Grafana UI → save as screenshots/average-load-cloud.png

npm run test:k6:cloud:spike
# 📸 Screenshot Grafana UI → save as screenshots/spike-load-cloud.png

npm run test:k6:cloud:stress
# 📸 Screenshot Grafana UI → save as screenshots/stress-test-cloud.png

npm run test:k6:cloud:soak
# 📸 Screenshot Grafana UI → save as screenshots/soak-test-cloud.png
```

**Note:** After running each cloud test, open the Grafana Cloud link in your browser to see the UI and take screenshots.

---

### Step 4: Fill in REPORT.md

Open `REPORT.md` and fill in all sections marked with `[To be filled]`:

1. **Test Results Section:**
   - Add actual metrics from test outputs
   - Fill in response times (avg, p95, p99)
   - Fill in error rates
   - Fill in throughput

2. **Analysis Section:**
   - Describe what you observed
   - Compare local vs cloud performance
   - Identify bottlenecks
   - Note any failures or issues

3. **Recommendations Section:**
   - Based on your results, suggest improvements

---

## 📸 Screenshot Checklist

You need 8 screenshots total:

**Local Tests (Terminal Screenshots):**
- [ ] `screenshots/average-load-local.png`
- [ ] `screenshots/spike-load-local.png`
- [ ] `screenshots/stress-test-local.png`
- [ ] `screenshots/soak-test-local.png`

**Cloud Tests (Grafana UI Screenshots):**
- [ ] `screenshots/average-load-cloud.png`
- [ ] `screenshots/spike-load-cloud.png`
- [ ] `screenshots/stress-test-cloud.png`
- [ ] `screenshots/soak-test-cloud.png`

---

## 📊 What to Screenshot

### For Local Tests (Terminal):
Capture the final summary that shows:
- ✓ checks: percentage
- http_req_duration: avg, min, med, max, p(90), p(95), p(99)
- http_req_failed: percentage
- http_reqs: total count and rate
- vus: virtual users
- iterations: total

### For Cloud Tests (Grafana UI):
Capture the dashboard showing:
- Test overview graph
- Response time metrics
- Error rate
- Virtual users timeline
- Key performance indicators

---

## ⚠️ Important Notes

1. **Test Order:** Run tests from shortest to longest
   - Spike (1 min) ✅
   - Stress (5 min) ✅
   - Average (9 min) ✅
   - Soak (30 min) ✅ Last!

2. **Between Tests:** Wait a few minutes between tests to let your system cool down

3. **Spike Test VUs:** The spike test is set to 100 VUs. If your laptop can't handle it:
   - Monitor CPU/RAM usage
   - If system becomes unresponsive, reduce VUs to 50 or 75
   - Update the test script and document your max capability

4. **Soak Test:** The 30-minute test will take the longest. You can:
   - Run it last
   - Let it run in the background while doing other work
   - Make sure laptop doesn't go to sleep

---

## 🎯 Submission Structure

```
practical7/
├── performance-testing/          # Your Next.js app with all test scripts
│   ├── tests/k6/
│   │   ├── average-load-test.js
│   │   ├── spike-load-test.js
│   │   ├── stress-test.js
│   │   └── soak-test.js
│   ├── src/
│   └── package.json
├── screenshots/                   # All 8 screenshots
│   ├── average-load-local.png
│   ├── average-load-cloud.png
│   ├── spike-load-local.png
│   ├── spike-load-cloud.png
│   ├── stress-test-local.png
│   ├── stress-test-cloud.png
│   ├── soak-test-local.png
│   └── soak-test-cloud.png
└── REPORT.md                      # Completed report with all sections filled
```

---

## 🚀 Quick Start

1. **Make sure app is running:**
   ```powershell
   npm run dev
   ```

2. **Run shortest test first (to verify everything works):**
   ```powershell
   npm run test:k6:spike
   ```

3. **If that works, proceed with all tests!**

Good luck! 🎉
