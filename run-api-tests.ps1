# PowerShell script to run API response tests
Write-Host "🧪 Running API Response Structure Tests..." -ForegroundColor Cyan
Write-Host ""

# Run the test script
node test-api-responses.js

# Check if results file was created
if (Test-Path "api-test-results.json") {
    Write-Host ""
    Write-Host "✅ Test results saved to api-test-results.json" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Quick summary:" -ForegroundColor Yellow
    Write-Host "   - Check api-test-results.json for full results"
    Write-Host "   - Look for 'recommendations' in each test"
    Write-Host "   - Compare response structures across endpoints"
} else {
    Write-Host "❌ Test results file not created" -ForegroundColor Red
}

