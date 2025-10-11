# Quick Test Script for API Debugging (PowerShell)
# Run this to quickly test all critical endpoints

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Backend API Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Testing Services List (should work)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) [FAILED]" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Individual Service Pages (CRITICAL)..." -ForegroundColor Yellow

Write-Host "   - Konsultacja chirurgiczna:"
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna" -UseBasicParsing
    Write-Host "     Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "     Status: $($_.Exception.Response.StatusCode.Value__) [FAILED - THIS IS THE PROBLEM!]" -ForegroundColor Red
}

Write-Host "   - Konsultacja proktologiczna:"
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services/slug/konsultacja-proktologiczna" -UseBasicParsing
    Write-Host "     Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "     Status: $($_.Exception.Response.StatusCode.Value__) [FAILED - THIS IS THE PROBLEM!]" -ForegroundColor Red
}

Write-Host "   - Leczenie stopy cukrzycowej:"
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services/slug/leczenie-stopy-cukrzycowej" -UseBasicParsing
    Write-Host "     Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "     Status: $($_.Exception.Response.StatusCode.Value__) [FAILED - THIS IS THE PROBLEM!]" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing Doctors List (should work)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/docs" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) [FAILED]" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Testing News List (should work)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/news" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) [FAILED]" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Testing Blogs List (might fail)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/blogs" -UseBasicParsing
    Write-Host "   Status: $($response.StatusCode) [SUCCESS]" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.Value__) [FAILED - Expected if you do not use blogs]" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Key:" -ForegroundColor White
Write-Host "  200 = Success" -ForegroundColor Green
Write-Host "  404 = Not Found (This is causing Google indexing issues)" -ForegroundColor Red
Write-Host "  500 = Server Error" -ForegroundColor Red
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If you see 404 errors for /services/slug/* endpoints:" -ForegroundColor White
Write-Host "   Your backend needs to implement these endpoints" -ForegroundColor White
Write-Host "2. Share the results with me so I can update server.js" -ForegroundColor White
Write-Host ""
