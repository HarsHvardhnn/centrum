# PowerShell Script to Test SEO Fixes
# Run this in PowerShell: .\test-seo-fixes.ps1

$BASE_URL = "https://centrummedyczne7.pl"

Write-Host "🧪 Testing SEO Fixes for $BASE_URL" -ForegroundColor Cyan
Write-Host ""

# Test 1: Homepage
Write-Host "1️⃣ Testing Homepage..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Homepage: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Homepage: FAILED ($($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Homepage: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Bot Detection
Write-Host ""
Write-Host "2️⃣ Testing Bot Detection..." -ForegroundColor Yellow
try {
    $headers = @{
        "User-Agent" = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -Headers $headers -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Bot Detection: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Bot Detection: FAILED ($($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Bot Detection: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Trailing Slash Redirect
Write-Host ""
Write-Host "3️⃣ Testing Trailing Slash Redirect..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/uslugi/" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "⚠️ Trailing Slash: No redirect (might be OK)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        if ($location -and $location -notmatch "/uslugi/$") {
            Write-Host "✅ Trailing Slash Redirect: OK (redirects to $location)" -ForegroundColor Green
        } else {
            Write-Host "❌ Trailing Slash Redirect: Still has trailing slash" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Trailing Slash Redirect: ERROR" -ForegroundColor Red
    }
}

# Test 4: Canonical URL
Write-Host ""
Write-Host "4️⃣ Testing Canonical URL..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -UseBasicParsing
    $content = $response.Content
    if ($content -match 'rel="canonical" href="([^"]+)"') {
        $canonical = $matches[1]
        if ($canonical -eq "$BASE_URL/" -or $canonical -eq "$BASE_URL") {
            Write-Host "✅ Canonical URL: OK ($canonical)" -ForegroundColor Green
        } else {
            Write-Host "❌ Canonical URL: FAILED (got: $canonical)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Canonical URL: Not found in HTML" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Canonical URL: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Sitemap
Write-Host ""
Write-Host "5️⃣ Testing Sitemap..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/sitemap.xml" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sitemap: OK (200)" -ForegroundColor Green
        # Check if it's valid XML
        if ($response.Content -match "<urlset") {
            Write-Host "   Valid XML format" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Sitemap: FAILED ($($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Sitemap: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Robots.txt
Write-Host ""
Write-Host "6️⃣ Testing Robots.txt..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/robots.txt" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Robots.txt: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Robots.txt: FAILED ($($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Robots.txt: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: 404 Handling
Write-Host ""
Write-Host "7️⃣ Testing 404 Handling..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/nonexistent-page-12345" -Method GET -UseBasicParsing
    Write-Host "❌ 404 Handling: Should return 404, got $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ 404 Handling: OK (404)" -ForegroundColor Green
    } else {
        Write-Host "❌ 404 Handling: Got $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 8: Check Meta Tags
Write-Host ""
Write-Host "8️⃣ Testing SEO Meta Tags..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -UseBasicParsing
    $content = $response.Content
    
    $hasTitle = $content -match '<title>([^<]+)</title>'
    $hasDescription = $content -match '<meta\s+name="description"\s+content="([^"]+)"'
    $hasOgTitle = $content -match '<meta\s+property="og:title"\s+content="([^"]+)"'
    
    if ($hasTitle -and $hasDescription -and $hasOgTitle) {
        Write-Host "✅ SEO Meta Tags: OK" -ForegroundColor Green
        Write-Host "   Title: $($matches[1])" -ForegroundColor Gray
    } else {
        Write-Host "❌ SEO Meta Tags: Missing some tags" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ SEO Meta Tags: ERROR" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check server logs for bot detection messages" -ForegroundColor White
Write-Host "2. Test in Google Search Console URL Inspection tool" -ForegroundColor White
Write-Host "3. Request indexing for important pages" -ForegroundColor White

