# Deployment Steps - Fix Google Search Console 404 Errors

## Summary of Fix

✅ **All API endpoints tested and working**  
✅ **Updated server.js to use correct blog/news endpoints**  
✅ **Blogs now use `/news?isNews=false` parameter**  
✅ **News now use `/news?isNews=true` parameter**  

## Quick Deployment

### Option 1: Standard Deployment

```bash
# 1. Navigate to your project
cd E:\CENTRUM\centrum

# 2. Commit your changes (optional but recommended)
git add server.js
git commit -m "Fix blog/news endpoints - resolve Google 404 errors"

# 3. Deploy to production
./deploy-production.sh
# or use your existing deployment method
```

### Option 2: Manual Deployment (if no script)

```bash
# 1. Stop the current Node.js server
pm2 stop all
# or if running directly:
# Ctrl+C to stop

# 2. Pull latest changes (if using git)
git pull

# 3. Restart the server
pm2 start server.js
# or
node server.js
# or
npm start
```

### Option 3: Using PM2 (Recommended for Production)

```bash
# Restart with latest code
pm2 restart all

# Or restart specific process
pm2 restart centrum-server

# Check logs
pm2 logs

# Check status
pm2 status
```

## Verification Steps

### 1. Local Testing (Before Deployment)

```powershell
# Start your local server
npm start
# or
node server.js

# In another terminal, test the endpoints:
# Test a service page
Invoke-WebRequest -Uri "http://localhost:3000/uslugi/konsultacja-chirurgiczna"

# Test sitemap
Invoke-WebRequest -Uri "http://localhost:3000/sitemap.xml"
```

### 2. Production Testing (After Deployment)

```powershell
# Test service page
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/uslugi/konsultacja-chirurgiczna"

# Test blog page (if you have blogs)
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/poradnik/{blog-slug}"

# Test news page
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/aktualnosci/{news-slug}"

# Test doctor page
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/lekarze/{doctor-slug}"

# Check sitemap
Invoke-WebRequest -Uri "https://centrummedyczne7.pl/sitemap.xml"
```

### 3. Check Server Logs

```bash
# If using PM2
pm2 logs

# Look for these success messages:
# ✅ Data fetched successfully for slug: xxx
# 📡 Fetching data from: https://backend.centrummedyczne7.pl/news/slug/xxx?isNews=false
# 📡 Fetching data from: https://backend.centrummedyczne7.pl/news/slug/xxx?isNews=true

# You should NOT see:
# ❌ Failed to fetch data for /poradnik/xxx
```

## Google Search Console Actions

### 1. Request Re-Indexing

After deployment, manually request re-indexing:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property: `centrummedyczne7.pl`
3. Use **URL Inspection Tool**
4. Enter URLs that were showing 404:
   - `https://centrummedyczne7.pl/uslugi/konsultacja-chirurgiczna`
   - `https://centrummedyczne7.pl/lekarze/{doctor-slug}`
   - etc.
5. Click **Request Indexing**

### 2. Submit Updated Sitemap

1. Go to **Sitemaps** section in Google Search Console
2. Remove old sitemap (if necessary)
3. Submit: `https://centrummedyczne7.pl/sitemap.xml`
4. Wait for Google to process (usually 24-48 hours)

### 3. Monitor Coverage

1. Go to **Coverage** section
2. Check **Excluded** tab
3. Look for decrease in 404 errors over next few days
4. Expected timeline:
   - **Immediate**: New requests return 200 instead of 404
   - **24 hours**: Google starts re-crawling
   - **3-7 days**: 404 errors should decrease significantly
   - **2-4 weeks**: Most errors should be resolved

## Expected Timeline

| Time | Expected Result |
|------|-----------------|
| Immediate | Server returns 200 for valid pages |
| 1 hour | New visitors see correct pages |
| 24 hours | Google starts re-crawling |
| 3 days | 404 count starts decreasing |
| 1 week | Most 404s resolved |
| 2 weeks | Coverage report shows improvement |

## Troubleshooting

### Issue: Server not starting

```bash
# Check for syntax errors
node server.js

# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (Windows)
taskkill /PID <process-id> /F
```

### Issue: Still seeing 404 errors

```bash
# Check server logs
pm2 logs

# Test specific endpoint
curl -I "https://centrummedyczne7.pl/uslugi/konsultacja-chirurgiczna"

# Should see: HTTP/1.1 200 OK
# If you see 404, check:
# 1. Is server using updated code?
# 2. Are backend APIs working?
# 3. Is Nginx configured correctly?
```

### Issue: Sitemap not updating

```bash
# Clear cache
# In Google Search Console, remove and re-submit sitemap

# Check sitemap generation
curl "https://centrummedyczne7.pl/sitemap.xml" | head -50

# Should see URLs like:
# <loc>https://centrummedyczne7.pl/poradnik/xxx</loc>
```

## Rollback Plan

If something goes wrong:

```bash
# Option 1: Git rollback
git log  # Find the previous commit
git checkout <previous-commit-hash> server.js
pm2 restart all

# Option 2: Manual fix
# Edit server.js and change back to previous endpoints
# Then restart server
```

## Success Indicators

You'll know it's working when:

- ✅ All test URLs return HTTP 200
- ✅ Server logs show successful data fetching
- ✅ No more `❌ Failed to fetch` errors in logs
- ✅ Sitemap includes blog URLs
- ✅ Google Search Console 404 count stops increasing
- ✅ Google Search Console 404 count starts decreasing after 3-7 days

## Contact/Support

If you encounter issues:

1. Check server logs: `pm2 logs`
2. Test backend APIs manually (using Postman)
3. Verify Nginx is proxying correctly
4. Check firewall/security settings

## Completion Checklist

- [ ] Code changes committed
- [ ] Server restarted with new code
- [ ] Local testing completed successfully
- [ ] Production deployment completed
- [ ] Production testing shows 200 responses
- [ ] Sitemap submitted to Google Search Console
- [ ] URLs requested for re-indexing
- [ ] Server logs show no errors
- [ ] Monitoring set up for next 2 weeks

---

**Note:** Google Search Console updates are NOT immediate. You should see improvements within 3-7 days, with full resolution taking 2-4 weeks.

