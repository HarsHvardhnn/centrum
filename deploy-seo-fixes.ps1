# SEO Fixes Deployment Script (PowerShell)
# This script helps deploy and test all the SEO fixes for tel/mailto URLs and sitemap issues

Write-Host "🚀 Starting SEO Fixes Deployment..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if server is running
Write-Host "`n1. Checking if server is running..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Server not detected. Please start your server first:" -ForegroundColor Yellow
    Write-Host "   npm run start" -ForegroundColor White
    Write-Host "   or" -ForegroundColor White
    Write-Host "   node server.js" -ForegroundColor White
    exit 1
}

# Test external protocol blocking
Write-Host "`n2. Testing external protocol URL blocking..." -ForegroundColor Blue

# Test tel: URL blocking
try {
    $telResponse = Invoke-WebRequest -Uri "http://localhost:3000/tel:+48797097487" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "❌ tel: URLs not blocked properly (got $($telResponse.StatusCode))" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ tel: URLs properly blocked (404)" -ForegroundColor Green
    } else {
        Write-Host "❌ tel: URLs unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test mailto: URL blocking
try {
    $mailtoResponse = Invoke-WebRequest -Uri "http://localhost:3000/mailto:test@example.com" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "❌ mailto: URLs not blocked properly (got $($mailtoResponse.StatusCode))" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ mailto: URLs properly blocked (404)" -ForegroundColor Green
    } else {
        Write-Host "❌ mailto: URLs unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test undefined URL redirects
Write-Host "`n3. Testing undefined URL redirects..." -ForegroundColor Blue
try {
    $undefinedResponse = Invoke-WebRequest -Uri "http://localhost:3000/aktualnosci/undefined" -Method Head -TimeoutSec 5 -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "⚠️ undefined URLs response: $($undefinedResponse.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ undefined URLs properly redirected ($($_.Exception.Response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️ undefined URLs response: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test dynamic sitemap
Write-Host "`n4. Testing dynamic sitemap generation..." -ForegroundColor Blue
try {
    $sitemapResponse = Invoke-WebRequest -Uri "http://localhost:3000/sitemap.xml" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Sitemap endpoint working (200)" -ForegroundColor Green
    
    # Check if sitemap contains dynamic content
    $sitemapContent = $sitemapResponse.Content
    $urlCount = ([regex]::Matches($sitemapContent, "<loc>")).Count
    Write-Host "📊 Sitemap contains $urlCount URLs" -ForegroundColor Green
    
    # Check for problematic URLs in sitemap
    if ($sitemapContent -match "tel:|mailto:|undefined") {
        Write-Host "❌ Sitemap contains problematic URLs" -ForegroundColor Red
    } else {
        Write-Host "✅ Sitemap clean - no problematic URLs found" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Sitemap endpoint not working (error: $($_.Exception.Message))" -ForegroundColor Red
}

# Run comprehensive tests if test script exists
Write-Host "`n5. Running comprehensive tests..." -ForegroundColor Blue
if (Test-Path "test-sitemap.js") {
    Write-Host "Running detailed sitemap tests..." -ForegroundColor Blue
    node test-sitemap.js
} else {
    Write-Host "⚠️ test-sitemap.js not found. Skipping detailed tests." -ForegroundColor Yellow
}

# Check for news slug issues if diagnostic script exists
Write-Host "`n6. Checking for content issues..." -ForegroundColor Blue
if (Test-Path "check-news-slugs.js") {
    Write-Host "Running news slug diagnostic..." -ForegroundColor Blue
    node check-news-slugs.js
} else {
    Write-Host "⚠️ check-news-slugs.js not found. Skipping slug validation." -ForegroundColor Yellow
}

# Summary and next steps
Write-Host "`n7. Summary and Next Steps" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

Write-Host "`n✅ Completed Tests:" -ForegroundColor Green
Write-Host "   - External protocol URL blocking" -ForegroundColor White
Write-Host "   - Undefined URL redirects" -ForegroundColor White
Write-Host "   - Dynamic sitemap generation" -ForegroundColor White
Write-Host "   - URL validation" -ForegroundColor White

Write-Host "`n📋 Manual Actions Needed:" -ForegroundColor Yellow
Write-Host "   1. Submit removal requests in Google Search Console for:" -ForegroundColor White
Write-Host "      - /tel:+48797097487" -ForegroundColor White
Write-Host "      - /mailto:kontakt@centrummedyczne7.pl" -ForegroundColor White
Write-Host "      - /aktualnosci/undefined" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "   2. Submit updated sitemap in GSC:" -ForegroundColor White
Write-Host "      - https://centrummedyczne7.pl/sitemap.xml" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "   3. Monitor GSC for:" -ForegroundColor White
Write-Host "      - Successful URL removals" -ForegroundColor White
Write-Host "      - New content indexing" -ForegroundColor White
Write-Host "      - Reduced crawl errors" -ForegroundColor White

Write-Host "`n📈 Expected Results:" -ForegroundColor Blue
Write-Host "   - Faster discovery of new articles" -ForegroundColor White
Write-Host "   - No more tel:/mailto: URLs in search results" -ForegroundColor White
Write-Host "   - Automatic sitemap updates" -ForegroundColor White
Write-Host "   - Improved SEO performance" -ForegroundColor White

Write-Host "`n🎉 SEO fixes deployment check completed!" -ForegroundColor Green

Write-Host "`nTo run this script again, use:" -ForegroundColor Cyan
Write-Host "   .\deploy-seo-fixes.ps1" -ForegroundColor White 