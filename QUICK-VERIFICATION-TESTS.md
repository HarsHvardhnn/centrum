# Quick Website Verification Tests

## ✅ Immediate Tests (Do These Now)

### 1. Test Homepage
**Visit:** `https://centrummedyczne7.pl/`

**Check:**
- ✅ Page loads without errors
- ✅ View source (Ctrl+U) → Search for `canonical`
- ✅ Should see: `<link rel="canonical" href="https://centrummedyczne7.pl/">`

### 2. Test Doctor Page (Most Important - Was Failing)
**Visit:** `https://centrummedyczne7.pl/lekarze/anna-grabowska`

**Check:**
- ✅ Page loads (not 404)
- ✅ Shows doctor name and details
- ✅ View source → Search for `og:title`
- ✅ Should see doctor's name in meta tags
- ✅ No errors in browser console (F12)

### 3. Test Service Page
**Visit:** `https://centrummedyczne7.pl/uslugi/konsultacja-chirurgiczna`

**Check:**
- ✅ Page loads
- ✅ Shows service details
- ✅ View source → Has canonical URL

### 4. Test Trailing Slash Redirect
**Visit:** `https://centrummedyczne7.pl/uslugi/` (with trailing slash)

**Check:**
- ✅ Redirects to `/uslugi` (no trailing slash)
- ✅ Only ONE redirect (check in Network tab)

### 5. Test 404 Page
**Visit:** `https://centrummedyczne7.pl/nonexistent-page-12345`

**Check:**
- ✅ Shows 404 page
- ✅ Has proper HTML (not JSON error)
- ✅ Has meta tags

## 🔍 Check Server Logs

**On your VPS:**
```bash
pm2 logs centrum-client-frontend --lines 50
```

**Look for:**
- ✅ `📦 Using success wrapper structure (doctors)` - when visiting doctor pages
- ✅ `📦 Using direct data structure` - when visiting other pages
- ✅ `✅ Data fetched successfully` - API calls working
- ❌ No `TypeError` or `Cannot read properties` errors

## 🌐 Browser DevTools Tests

### 1. Check Network Tab
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Visit a page
4. Check:
   - ✅ Status: 200 OK
   - ✅ Response has HTML content
   - ✅ No failed requests

### 2. Check Console
1. Open Console tab (F12)
2. Visit pages
3. Check:
   - ✅ No red errors
   - ✅ No `TypeError` messages

### 3. Check Response Headers
1. Network tab → Click on request
2. Check Headers:
   - ✅ Status: 200
   - ✅ Content-Type: text/html
   - ✅ No redirect chains

## 🤖 Google Search Console Test

1. Go to: https://search.google.com/search-console
2. Click **URL Inspection**
3. Test: `https://centrummedyczne7.pl/`
4. Click **Test Live URL**
5. Check:
   - ✅ Page is indexable
   - ✅ Canonical URL is correct
   - ✅ No crawl errors

## 📊 Quick PowerShell Test

Run this in PowerShell:

```powershell
# Test homepage
$response = Invoke-WebRequest -Uri "https://centrummedyczne7.pl/"
Write-Host "Homepage Status: $($response.StatusCode)" -ForegroundColor Green

# Test doctor page
$response = Invoke-WebRequest -Uri "https://centrummedyczne7.pl/lekarze/anna-grabowska"
Write-Host "Doctor Page Status: $($response.StatusCode)" -ForegroundColor Green

# Check canonical URL
$canonical = ($response.Content | Select-String 'rel="canonical"').Matches.Value
Write-Host "Canonical: $canonical" -ForegroundColor Cyan
```

## ✅ Success Checklist

After testing, verify:

- [ ] Homepage loads (200 OK)
- [ ] Doctor pages load (not 404)
- [ ] Service pages load
- [ ] Canonical URLs present in HTML
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Trailing slashes redirect correctly
- [ ] 404 pages show proper HTML
- [ ] Google Search Console URL Inspection works

## 🚨 If You See Errors

### Error: "Cannot read properties of null"
**Check:** Server logs for `📦 Response structure` messages
**Fix:** Restart server if needed

### Error: "Cannot set property path"
**Check:** Already fixed - should not appear
**Fix:** If it appears, restart server

### Doctor Pages Return 404
**Check:** Server logs for API endpoint
**Fix:** Verify API endpoint is correct

### No Canonical URLs
**Check:** View page source
**Fix:** Verify SEO middleware is running

## 🎯 Most Important Tests

**Priority 1:**
1. ✅ Doctor pages work (`/lekarze/anna-grabowska`)
2. ✅ No errors in server logs
3. ✅ Canonical URLs present

**Priority 2:**
4. ✅ Service pages work
5. ✅ News/Blog pages work
6. ✅ Redirects work correctly

**Priority 3:**
7. ⏳ Google Search Console test
8. ⏳ Monitor for 24 hours

## 📝 Test Results

After testing, note:
- ✅ What works
- ❌ What doesn't work
- 📋 Any errors in logs
- 🔍 Response structure logs (for doctor pages)

Share results if anything fails!

