# Testing SEO Fixes - Quick Verification Guide

## 🚀 Quick Tests (Run These First)

### 1. Test Homepage - Basic Functionality
```bash
curl -I https://centrummedyczne7.pl/
```
**Expected:**
- ✅ Status: `200 OK`
- ✅ Headers include: `X-Frame-Options`, `X-Content-Type-Options`
- ✅ No redirects

### 2. Test Bot Detection (CRITICAL)
```bash
# Test with Googlebot User-Agent
curl -I -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://centrummedyczne7.pl/

# Test with regular browser
curl -I -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" https://centrummedyczne7.pl/
```
**Expected:**
- ✅ Both return `200 OK`
- ✅ Server logs should show bot detection working
- ✅ HTML content should be served (check with `curl` without `-I`)

### 3. Test Trailing Slash Redirect
```bash
# Test trailing slash redirect
curl -I https://centrummedyczne7.pl/uslugi/
```
**Expected:**
- ✅ Status: `301 Moved Permanently`
- ✅ Location: `https://centrummedyczne7.pl/uslugi` (no trailing slash)
- ✅ Only ONE redirect (no chain)

### 4. Test 404 Handling
```bash
# Test non-existent page
curl -I https://centrummedyczne7.pl/nonexistent-page-12345
```
**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Response includes HTML with proper meta tags
- ✅ Check response body: `curl https://centrummedyczne7.pl/nonexistent-page-12345 | grep -i "canonical"`

### 5. Test Canonical URLs
```bash
# Test homepage canonical
curl https://centrummedyczne7.pl/ | grep -i "canonical"

# Test service page canonical (if you have a service)
curl https://centrummedyczne7.pl/uslugi/ | grep -i "canonical"
```
**Expected:**
- ✅ Canonical URL points to the current page
- ✅ Format: `<link rel="canonical" href="https://centrummedyczne7.pl/[path]">`
- ✅ No trailing slash in canonical URL

### 6. Test Sitemap
```bash
curl https://centrummedyczne7.pl/sitemap.xml | head -20
```
**Expected:**
- ✅ Returns XML sitemap
- ✅ Contains URLs
- ✅ Valid XML format

### 7. Test Robots.txt
```bash
curl https://centrummedyczne7.pl/robots.txt
```
**Expected:**
- ✅ Returns robots.txt content
- ✅ Should allow Googlebot (not blocking important pages)

---

## 🔍 Detailed Tests

### Test Dynamic Routes (News/Articles)

```bash
# First, get a real slug from your sitemap or API
# Example test (replace with actual slug):
curl -I https://centrummedyczne7.pl/aktualnosci/[actual-slug]

# Check if it returns proper SEO HTML
curl https://centrummedyczne7.pl/aktualnosci/[actual-slug] | grep -i "og:title"
```
**Expected:**
- ✅ Status: `200 OK` for existing pages
- ✅ Contains Open Graph meta tags
- ✅ Contains canonical URL

### Test Service Pages

```bash
# Test service listing
curl -I https://centrummedyczne7.pl/uslugi

# Test specific service (replace with actual slug)
curl -I https://centrummedyczne7.pl/uslugi/[service-slug]
```
**Expected:**
- ✅ Status: `200 OK`
- ✅ Proper SEO meta tags
- ✅ Self-referencing canonical URL

### Test Doctor Pages

```bash
# Test doctor listing
curl -I https://centrummedyczne7.pl/lekarze

# Test specific doctor (replace with actual slug)
curl -I https://centrummedyczne7.pl/lekarze/[doctor-slug]
```
**Expected:**
- ✅ Status: `200 OK` for existing doctors
- ✅ Proper SEO meta tags with doctor name
- ✅ Canonical URL points to doctor page

---

## 🐛 Debug Tests

### Check Server Logs (On VPS)

```bash
# If using PM2
pm2 logs centrum-server --lines 50

# If using node directly
tail -f /path/to/logs/server.log

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Look for:**
- ✅ `📄 Serving SEO HTML for: Googlebot...` (bot detection working)
- ✅ `🔗 Canonical URL for /path: ...` (canonical URLs being generated)
- ✅ `✅ Data fetched successfully for slug: ...` (API calls succeeding)
- ❌ Any errors about API failures or timeouts

### Test API Backend Health

```bash
# Test if backend API is accessible
curl -I https://backend.centrummedyczne7.pl/news

# Test with timeout
curl --max-time 10 https://backend.centrummedyczne7.pl/news
```
**Expected:**
- ✅ Backend responds within 10 seconds
- ✅ Returns valid JSON data
- ✅ No timeouts

### Test Nginx Configuration

```bash
# Test Nginx config syntax
sudo nginx -t

# Check Nginx is forwarding User-Agent
curl -v -H "User-Agent: TestBot/1.0" https://centrummedyczne7.pl/ 2>&1 | grep -i "user-agent"
```

---

## 🌐 Browser-Based Tests

### 1. View Page Source
Visit `https://centrummedyczne7.pl/` and:
- Right-click → View Page Source
- ✅ Check for `<link rel="canonical" href="...">`
- ✅ Check for `<meta property="og:title" content="...">`
- ✅ Check for `<meta name="description" content="...">`

### 2. Test with Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Visit a page
4. Check response headers:
   - ✅ `Cache-Control: no-cache, no-store, must-revalidate` (for HTML)
   - ✅ Status: `200 OK`

### 3. Test Redirects
1. Open Chrome DevTools → Network tab
2. Check "Preserve log"
3. Visit: `https://centrummedyczne7.pl/uslugi/` (with trailing slash)
4. Check redirects:
   - ✅ Only ONE redirect (301 → /uslugi)
   - ✅ No redirect chains

---

## 🤖 Google Search Console Tests

### 1. URL Inspection Tool
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **URL Inspection** (top search bar)
3. Enter: `https://centrummedyczne7.pl/`
4. Click **Test Live URL**
5. Check:
   - ✅ Page is indexable
   - ✅ Canonical URL is correct
   - ✅ No crawl errors

### 2. Test with Googlebot
1. In URL Inspection, click **Test Live URL**
2. Check "Screenshot" - should show your page
3. Check "HTML" - should show proper meta tags

### 3. Request Indexing
1. After testing URL, click **Request Indexing**
2. Google will crawl the page within a few hours
3. Monitor in **Coverage** report

---

## 📊 Automated Test Script

Create a test script `test-seo.sh`:

```bash
#!/bin/bash

BASE_URL="https://centrummedyczne7.pl"

echo "🧪 Testing SEO Fixes for $BASE_URL"
echo ""

# Test 1: Homepage
echo "1️⃣ Testing Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Homepage: OK (200)"
else
    echo "❌ Homepage: FAILED ($STATUS)"
fi

# Test 2: Bot Detection
echo ""
echo "2️⃣ Testing Bot Detection..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: Googlebot/2.1" $BASE_URL/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Bot Detection: OK (200)"
else
    echo "❌ Bot Detection: FAILED ($STATUS)"
fi

# Test 3: Trailing Slash Redirect
echo ""
echo "3️⃣ Testing Trailing Slash Redirect..."
REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" -L $BASE_URL/uslugi/)
if [[ "$REDIRECT" == *"uslugi"* ]] && [[ "$REDIRECT" != *"uslugi/"* ]]; then
    echo "✅ Trailing Slash Redirect: OK"
else
    echo "❌ Trailing Slash Redirect: FAILED"
fi

# Test 4: Canonical URL
echo ""
echo "4️⃣ Testing Canonical URL..."
CANONICAL=$(curl -s $BASE_URL/ | grep -oP 'rel="canonical" href="\K[^"]*')
if [[ "$CANONICAL" == "$BASE_URL/" ]]; then
    echo "✅ Canonical URL: OK ($CANONICAL)"
else
    echo "❌ Canonical URL: FAILED (got: $CANONICAL)"
fi

# Test 5: Sitemap
echo ""
echo "5️⃣ Testing Sitemap..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/sitemap.xml)
if [ "$STATUS" = "200" ]; then
    echo "✅ Sitemap: OK (200)"
else
    echo "❌ Sitemap: FAILED ($STATUS)"
fi

# Test 6: Robots.txt
echo ""
echo "6️⃣ Testing Robots.txt..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/robots.txt)
if [ "$STATUS" = "200" ]; then
    echo "✅ Robots.txt: OK (200)"
else
    echo "❌ Robots.txt: FAILED ($STATUS)"
fi

# Test 7: 404 Handling
echo ""
echo "7️⃣ Testing 404 Handling..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/nonexistent-page-12345)
if [ "$STATUS" = "404" ]; then
    echo "✅ 404 Handling: OK (404)"
else
    echo "❌ 404 Handling: FAILED ($STATUS)"
fi

echo ""
echo "🎉 Testing Complete!"
```

Run it:
```bash
chmod +x test-seo.sh
./test-seo.sh
```

---

## ✅ Success Checklist

After running all tests, verify:

- [ ] Homepage returns 200 OK
- [ ] Bot detection working (User-Agent forwarded)
- [ ] Trailing slashes redirect correctly (single redirect)
- [ ] Canonical URLs are self-referencing
- [ ] 404 pages return proper HTML with meta tags
- [ ] Sitemap is accessible and valid
- [ ] Robots.txt is accessible
- [ ] No redirect chains (only single redirects)
- [ ] Server logs show bot detection
- [ ] API calls succeeding (check logs)
- [ ] Nginx config is correct
- [ ] HTML pages are NOT cached

---

## 🚨 Common Issues & Fixes

### Issue: Bot detection not working
**Check:**
```bash
curl -v -H "User-Agent: Googlebot" https://centrummedyczne7.pl/ 2>&1 | grep -i "user-agent"
```
**Fix:** Verify Nginx has `proxy_set_header User-Agent $http_user_agent;`

### Issue: Still seeing cached 404s
**Fix:** Clear Nginx cache and restart:
```bash
sudo systemctl reload nginx
pm2 restart centrum-server
```

### Issue: Redirect chains
**Check:**
```bash
curl -I -L https://centrummedyczne7.pl/uslugi/ 2>&1 | grep -i "location"
```
**Fix:** Should only see ONE redirect. If multiple, check middleware order in server.js

### Issue: API timeouts
**Check server logs for:**
- `❌ Failed to fetch data`
- `timeout`
**Fix:** Verify backend API is accessible and responding

---

## 📈 Next Steps After Testing

1. ✅ All tests pass → Monitor for 24-48 hours
2. ✅ Check Google Search Console → Request re-indexing
3. ✅ Submit updated sitemap
4. ✅ Monitor server logs for errors
5. ✅ Check Google Search Console Coverage report in 1 week

---

## 🎯 Quick Test Command (Copy-Paste)

Run this single command to test everything:

```bash
echo "🧪 Quick SEO Test" && \
echo "Homepage:" && curl -s -o /dev/null -w "Status: %{http_code}\n" https://centrummedyczne7.pl/ && \
echo "Bot Detection:" && curl -s -o /dev/null -w "Status: %{http_code}\n" -H "User-Agent: Googlebot/2.1" https://centrummedyczne7.pl/ && \
echo "Sitemap:" && curl -s -o /dev/null -w "Status: %{http_code}\n" https://centrummedyczne7.pl/sitemap.xml && \
echo "Canonical:" && curl -s https://centrummedyczne7.pl/ | grep -oP 'rel="canonical" href="\K[^"]*' && \
echo "✅ Tests Complete!"
```

