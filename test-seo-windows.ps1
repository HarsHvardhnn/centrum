# PowerShell SEO Testing Script for Windows
# Run this after integrating SEO middleware into your backend

Write-Host "🧪 Starting SEO Tests..." -ForegroundColor Green

$baseUrl = "http://localhost:3000"
$routes = @("/", "/o-nas", "/lekarze", "/uslugi", "/aktualnosci", "/poradnik", "/kontakt")

$botUserAgent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
$userUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

foreach ($route in $routes) {
    Write-Host "`n🔍 Testing route: $route" -ForegroundColor Yellow
    
    try {
        # Test with bot user agent
        $botResponse = Invoke-WebRequest -Uri "$baseUrl$route" -UserAgent $botUserAgent -UseBasicParsing
        
        # Test with regular user agent  
        $userResponse = Invoke-WebRequest -Uri "$baseUrl$route" -UserAgent $userUserAgent -UseBasicParsing
        
        # Extract titles
        if ($botResponse.Content -match '<title[^>]*>([^<]+)</title>') {
            $botTitle = $matches[1]
        } else {
            $botTitle = "NO TITLE FOUND"
        }
        
        if ($userResponse.Content -match '<title[^>]*>([^<]+)</title>') {
            $userTitle = $matches[1]
        } else {
            $userTitle = "NO TITLE FOUND"
        }
        
        # Extract descriptions
        if ($botResponse.Content -match '<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\'][^>]*>') {
            $botDesc = $matches[1]
        } else {
            $botDesc = "NO DESCRIPTION FOUND"
        }
        
        if ($userResponse.Content -match '<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\'][^>]*>') {
            $userDesc = $matches[1]
        } else {
            $userDesc = "NO DESCRIPTION FOUND"
        }
        
        # Display results
        Write-Host "  Bot Title: $($botTitle.Substring(0, [Math]::Min(60, $botTitle.Length)))..." -ForegroundColor Cyan
        Write-Host "  User Title: $($userTitle.Substring(0, [Math]::Min(60, $userTitle.Length)))..." -ForegroundColor Magenta
        
        Write-Host "  Bot Desc: $($botDesc.Substring(0, [Math]::Min(80, $botDesc.Length)))..." -ForegroundColor Cyan
        Write-Host "  User Desc: $($userDesc.Substring(0, [Math]::Min(80, $userDesc.Length)))..." -ForegroundColor Magenta
        
        # Check if different
        if ($botTitle -ne $userTitle) {
            Write-Host "  ✅ Titles are different (GOOD)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Titles are the same (BAD)" -ForegroundColor Red
        }
        
        if ($botDesc -ne $userDesc) {
            Write-Host "  ✅ Descriptions are different (GOOD)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Descriptions are the same (BAD)" -ForegroundColor Red
        }
        
        # Check if bot gets proper SEO
        if ($botTitle -like "*Centrum Medyczne 7*") {
            Write-Host "  ✅ Bot gets proper SEO title" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Bot title doesn't contain 'Centrum Medyczne 7'" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ❌ Error testing $route : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Tests Complete!" -ForegroundColor Green
Write-Host "`n📋 Quick Manual Tests:" -ForegroundColor Yellow
Write-Host "1. Visit your site in Chrome" -ForegroundColor White
Write-Host "2. Press F12 → Network tab → Gear icon → User Agent → Googlebot" -ForegroundColor White
Write-Host "3. Refresh page and view source (Ctrl+U)" -ForegroundColor White
Write-Host "4. Should see SEO-optimized HTML instead of React SPA" -ForegroundColor White 