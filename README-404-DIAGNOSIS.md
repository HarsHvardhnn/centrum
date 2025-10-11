# 404 Error Diagnosis - Centrum Medyczne 7

## Problem Summary

You're seeing **404 errors** in Google Search Console for service pages and doctor pages. Based on analysis of your API responses, here's what's happening:

### What's Working ✅
- `/docs` - Returns list of doctors
- `/services` - Returns list of 12 services
- `/news` - Returns list of news articles

### What's Likely Broken ❌
- `/services/slug/{slug}` - Individual service pages
- `/docs/profile/slug/{slug}` - Individual doctor pages
- `/news/slug/{slug}` - Individual news pages
- `/blogs` - Blogs endpoint (404)

## The Root Cause

Your `server.js` is trying to fetch individual service/doctor/news pages using these endpoints:

```javascript
// For services
endpoint = `${API_BASE_URL}/services/slug/${slug}`;

// For doctors
endpoint = `${API_BASE_URL}/docs/profile/slug/${slug}`;

// For news
endpoint = `${API_BASE_URL}/news/slug/${slug}`;

// For blogs
endpoint = `${API_BASE_URL}/blogs/slug/${slug}`;
```

**If these endpoints don't exist on your backend**, then:
1. Your sitemap includes URLs like `/uslugi/konsultacja-chirurgiczna`
2. Google tries to visit these URLs
3. Your `server.js` tries to fetch data from backend API
4. Backend returns 404
5. Your `server.js` returns 404 to Google
6. Google reports "404 Not Found" error

## Testing Files Created

I've created several files to help you test:

### 1. PowerShell Script (Recommended for Windows)
**File:** `quick-test-api.ps1`

Run in PowerShell:
```powershell
.\quick-test-api.ps1
```

This will test all critical endpoints and show you which ones are returning 404.

### 2. Bash Script (For Linux/Mac)
**File:** `quick-test-curls.sh`

Run in terminal:
```bash
chmod +x quick-test-curls.sh
./quick-test-curls.sh
```

### 3. Postman Collection
**File:** `Postman-API-Tests.json`

Import this into Postman to manually test each endpoint with a nice UI.

### 4. Detailed Testing Guide
**File:** `API-TESTING-INSTRUCTIONS.md`

Complete instructions on how to diagnose the issue.

### 5. Test Endpoints Reference
**File:** `test-slug-endpoints.md`

List of all curl commands for manual testing.

## How to Run the Tests

### Option A: PowerShell (Easiest)

```powershell
cd E:\CENTRUM\centrum
.\quick-test-api.ps1
```

You'll see output like:
```
Testing Individual Service Pages (CRITICAL)...
   - Konsultacja chirurgiczna:
     Status: 404 ✗ (THIS IS THE PROBLEM!)
```

### Option B: Postman

1. Open Postman
2. Import `Postman-API-Tests.json`
3. Run the "2. Individual Service Pages" folder
4. Check which requests return 404

### Option C: Manual curl

Test one service:
```bash
curl -I "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna"
```

If you see `HTTP/1.1 404 Not Found`, that's the problem!

## Expected Test Results

Based on your API responses, I predict:

### Scenario 1: Backend Missing Slug Endpoints (Most Likely)
```
✅ 200 - /services
✅ 200 - /docs
✅ 200 - /news
❌ 404 - /services/slug/konsultacja-chirurgiczna
❌ 404 - /docs/profile/slug/any-doctor
❌ 404 - /news/slug/any-news
❌ 404 - /blogs
```

**Solution:** Backend needs to implement these endpoints, OR we need to find the correct endpoint format.

### Scenario 2: Different Endpoint Structure
Maybe your backend uses:
- `/services/{id}` instead of `/services/slug/{slug}`
- `/services?slug=konsultacja-chirurgiczna`
- `/service/{slug}` (singular)

**Solution:** Find the correct endpoint format and update `server.js`.

## What to Do Next

1. **Run the test script:**
   ```powershell
   .\quick-test-api.ps1
   ```

2. **Share the results:**
   Tell me which endpoints return 404 and which return 200.

3. **Check your backend code:**
   - Do you have routes for `/services/slug/:slug`?
   - Do you have routes for `/docs/profile/slug/:slug`?
   - What are the actual endpoint URLs?

4. **I'll update server.js:**
   Once I know the correct endpoints, I'll update:
   - `fetchDynamicData()` to use correct endpoints
   - `generateDynamicSitemap()` to use correct endpoints
   - Add proper error handling

## Possible Solutions

### Solution 1: Backend Missing Endpoints
If your backend doesn't have slug-based endpoints, you need to either:
- **Option A:** Add them to your backend
- **Option B:** Use a different endpoint format (like ID-based)
- **Option C:** Remove dynamic pages from your site (not recommended)

### Solution 2: Wrong Endpoint Format
If the endpoints exist but use a different format, just tell me the correct format and I'll update `server.js`.

### Solution 3: Blogs Don't Exist
If you don't actually have a blog/poradnik section:
- Remove `/poradnik` from sitemap
- Remove blog routes from `server.js`
- Remove Poradnik from your frontend navigation

## Quick Diagnosis

Run this one command to see if the issue is confirmed:

```powershell
# Test if individual service endpoint exists
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna"
```

If you get an error like:
```
404 Not Found
```

Then that's 100% your problem! Your backend needs to implement this endpoint.

## Contact Me With

After running the tests, please share:

1. **Status codes** for each endpoint (200, 404, 500)
2. **Working endpoints** (if different from what I assumed)
3. **Backend API documentation** (if you have it)
4. **Sample response** from a working individual endpoint (if any)

Then I can update your `server.js` to fix the Google Search Console errors!

