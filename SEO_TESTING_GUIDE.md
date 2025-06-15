# 🧪 Complete SEO Testing Guide

After integrating the SEO middleware into your backend, here's how to test everything works properly.

## 🚀 Quick Tests (5 minutes)

### 1. Test Bot Detection with cURL

**Test Homepage (Bot):**
```bash
curl -H "User-Agent: Googlebot/2.1" http://localhost:3000/
```
**Expected:** HTML with `<title>CM7 – Przychodnia specjalistyczna Skarżysko-Kamienna</title>`

**Test Homepage (Regular User):**
```bash
curl -H "User-Agent: Mozilla/5.0 Chrome/91.0" http://localhost:3000/
```
**Expected:** Your normal React SPA HTML (with script tags)

### 2. Test Different Routes

```bash
# Test doctors page
curl -H "User-Agent: Googlebot/2.1" http://localhost:3000/lekarze

# Test contact page  
curl -H "User-Agent: Googlebot/2.1" http://localhost:3000/kontakt

# Test services page
curl -H "User-Agent: Googlebot/2.1" http://localhost:3000/uslugi
```

**Look for:** Different titles and descriptions for each route.

## 🔍 Browser Testing

### 3. Manual Browser Test

**Chrome DevTools Method:**
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Click the gear icon → **More network conditions**
4. **User agent** → Select "Googlebot"
5. Visit your site: `http://localhost:3000/`
6. **View page source** (Ctrl+U)

**Expected:** SEO-optimized HTML instead of React SPA

### 4. Browser Extensions

Install **"User-Agent Switcher"** extension:
1. Switch to "Googlebot" 
2. Visit your routes
3. Check page source for proper meta tags

## 🌐 Online Testing Tools

### 5. Social Media Debuggers

**Facebook Debugger:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URL: `https://yoursite.com/o-nas`
3. Click **Debug**
4. Should show proper title/description

**Twitter Card Validator:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL
3. Should show proper Twitter card preview

**LinkedIn Post Inspector:**
1. Go to: https://www.linkedin.com/post-inspector/
2. Test your URLs

### 6. Google Testing Tools

**Rich Results Test:**
1. Go to: https://search.google.com/test/rich-results
2. Enter your URL
3. Should detect structured data

**Mobile-Friendly Test:**
1. Go to: https://search.google.com/test/mobile-friendly
2. Test your URLs

## 🛠️ Advanced Testing

### 7. Automated Testing Script

Create `test-seo.js`:
```javascript
const axios = require('axios');

const routes = [
  '/',
  '/o-nas', 
  '/lekarze',
  '/uslugi',
  '/aktualnosci',
  '/poradnik',
  '/kontakt'
];

const testRoute = async (route) => {
  console.log(`\n🧪 Testing: ${route}`);
  
  try {
    // Test with bot user agent
    const botResponse = await axios.get(`http://localhost:3000${route}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    // Test with regular user agent
    const userResponse = await axios.get(`http://localhost:3000${route}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Extract titles
    const botTitle = botResponse.data.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'NO TITLE';
    const userTitle = userResponse.data.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'NO TITLE';
    
    // Extract descriptions  
    const botDesc = botResponse.data.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)?.[1] || 'NO DESC';
    const userDesc = userResponse.data.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)?.[1] || 'NO DESC';
    
    console.log(`Bot Title: ${botTitle.substring(0, 60)}...`);
    console.log(`User Title: ${userTitle.substring(0, 60)}...`);
    console.log(`Bot Desc: ${botDesc.substring(0, 80)}...`);
    console.log(`User Desc: ${userDesc.substring(0, 80)}...`);
    
    // Check if different
    const titlesDifferent = botTitle !== userTitle;
    const descsDifferent = botDesc !== userDesc;
    
    console.log(`✅ Titles Different: ${titlesDifferent}`);
    console.log(`✅ Descriptions Different: ${descsDifferent}`);
    
    if (botTitle.includes('Centrum Medyczne 7')) {
      console.log('✅ Bot gets proper SEO title');
    } else {
      console.log('❌ Bot title issue');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting SEO Tests...\n');
  
  for (const route of routes) {
    await testRoute(route);
  }
  
  console.log('\n🏁 Tests Complete!');
};

runTests();
```

Run with: `node test-seo.js`

### 8. Check Server Logs

Add this to your backend to see bot detection in action:
```javascript
// In your seoMiddleware function
if (isCrawler(userAgent)) {
  console.log(`🤖 BOT DETECTED: ${userAgent.substring(0, 50)}... for ${route}`);
} else {
  console.log(`👤 REGULAR USER: ${userAgent.substring(0, 50)}... for ${route}`);
}
```

## ✅ What to Look For

### ✅ Success Indicators:
- **Different HTML** for bots vs users
- **Proper titles** for each route (not generic React app title)
- **Unique descriptions** for each page
- **Open Graph tags** present in bot HTML
- **Structured data** (JSON-LD) in bot HTML
- **Social media previews** work correctly

### ❌ Failure Indicators:
- Same HTML returned for bots and users
- Generic titles like "React App" 
- No meta descriptions
- Social media shows default/broken previews
- Console errors about missing data

## 🐛 Common Issues & Fixes

### Issue: "Bot detection not working"
**Fix:** Check user agent list in `CRAWLER_USER_AGENTS`

### Issue: "Same HTML for bots and users"
**Fix:** Ensure middleware is added BEFORE static file serving

### Issue: "Dynamic routes not working"
**Fix:** Add database queries in the TODO sections

### Issue: "Social media shows old preview"
**Fix:** Use debugger tools to force refresh cache

## 🎯 Production Testing

Before going live:
1. **Test on staging** with your production domain
2. **Update BASE_URL** in the implementation
3. **Test with actual social media platforms**
4. **Monitor server logs** for bot requests
5. **Use Google Search Console** to verify crawling

**Ready to test! 🚀** 