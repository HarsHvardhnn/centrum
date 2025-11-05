# Quick Test Commands for SEO Fixes

## 🚀 Windows PowerShell Commands

### 1. Test Homepage
```powershell
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/" -Method GET | Select-Object StatusCode, StatusDescription
```

### 2. Test Bot Detection (CRITICAL)
```powershell
$headers = @{"User-Agent" = "Mozilla/5.0 (compatible; Googlebot/2.1)"}
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/" -Headers $headers | Select-Object StatusCode
```

### 3. Test Canonical URL
```powershell
$response = Invoke-WebRequest -Uri "https://centrummedyczne7.pl/"
$response.Content | Select-String 'rel="canonical"'
```

### 4. Test Sitemap
```powershell
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/sitemap.xml" | Select-Object StatusCode
```

### 5. Test 404
```powershell
try {
    Invoke-WebRequest -Uri "https://centrummedyczne7.pl/nonexistent-12345"
} catch {
    $_.Exception.Response.StatusCode
}
```

### 6. Run Full Test Suite
```powershell
.\test-seo-fixes.ps1
```

---

## 🐧 Linux/Mac Commands

### 1. Test Homepage
```bash
curl -I https://centrummedyczne7.pl/
```

### 2. Test Bot Detection
```bash
curl -I -H "User-Agent: Googlebot/2.1" https://centrummedyczne7.pl/
```

### 3. Test Canonical URL
```bash
curl -s https://centrummedyczne7.pl/ | grep -i "canonical"
```

### 4. Test Sitemap
```bash
curl -I https://centrummedyczne7.pl/sitemap.xml
```

### 5. Test 404
```bash
curl -I https://centrummedyczne7.pl/nonexistent-12345
```

### 6. Test Trailing Slash Redirect
```bash
curl -I https://centrummedyczne7.pl/uslugi/
# Should redirect to /uslugi (no trailing slash)
```

---

## 🌐 Browser Tests (No Command Line Needed)

### 1. View Page Source
1. Visit: https://centrummedyczne7.pl/
2. Right-click → "View Page Source" (or Ctrl+U)
3. Search for: `canonical`
4. ✅ Should see: `<link rel="canonical" href="https://centrummedyczne7.pl/">`

### 2. Check Meta Tags
1. View Page Source
2. Search for: `og:title`
3. ✅ Should see: `<meta property="og:title" content="...">`

### 3. Test Redirects
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Preserve log"
4. Visit: https://centrummedyczne7.pl/uslugi/
5. ✅ Should see ONE redirect (301) to /uslugi

### 4. Test with Google Search Console
1. Go to: https://search.google.com/search-console
2. Click "URL Inspection"
3. Enter: `https://centrummedyczne7.pl/`
4. Click "Test Live URL"
5. ✅ Should show page is indexable
6. ✅ Check "HTML" tab for meta tags

---

## 📊 Quick Status Check

Run this PowerShell command to see all statuses at once:

```powershell
$urls = @("/", "/uslugi", "/lekarze", "/aktualnosci", "/sitemap.xml")
foreach ($path in $urls) {
    try {
        $response = Invoke-WebRequest -Uri "https://centrummedyczne7.pl$path" -UseBasicParsing
        Write-Host "✅ $path : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $path : $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
```

---

## 🔍 What to Look For

### ✅ Success Indicators:
- Status codes: 200 for pages, 404 for non-existent pages
- Canonical URLs: Self-referencing (point to current page)
- Meta tags: Present in HTML source
- Redirects: Only ONE redirect (301), no chains
- Bot detection: Server logs show bot User-Agents
- Sitemap: Returns valid XML

### ❌ Failure Indicators:
- Multiple redirects (redirect chains)
- Missing canonical URLs
- Missing meta tags
- 404 for pages that should exist
- Cached content (old 404s appearing)
- Bot detection not working (check logs)

---

## 📝 Test Results Checklist

After running tests, mark these:

- [ ] Homepage returns 200 OK
- [ ] Bot detection working (check server logs)
- [ ] Canonical URL is self-referencing
- [ ] Meta tags present (title, description, og:title)
- [ ] Sitemap accessible and valid XML
- [ ] Robots.txt accessible
- [ ] 404 pages return proper HTML
- [ ] Trailing slashes redirect correctly
- [ ] No redirect chains
- [ ] Google Search Console URL Inspection works

---

## 🎯 Most Important Tests

**Priority 1 (Critical):**
1. ✅ Bot detection - Server must detect Googlebot
2. ✅ Canonical URLs - Must be self-referencing
3. ✅ No redirect chains - Only single redirects

**Priority 2 (Important):**
4. ✅ 404 handling - Proper HTML with meta tags
5. ✅ Sitemap - Valid XML with URLs
6. ✅ Meta tags - Present in HTML

**Priority 3 (Monitoring):**
7. ⏳ Google Search Console - Request indexing
8. ⏳ Monitor logs - Check for errors
9. ⏳ Coverage report - Check in 1 week

