# SEO Fixes - Deployment Guide

## Issues Fixed

1. **404 Errors (66 pages)** - Improved error handling and proper 404 responses
2. **False 404 Errors (62 pages)** - Better API error handling with retry logic
3. **Redirect Chains (13 pages)** - Fixed middleware order and removed duplicate redirects
4. **Canonical URL Issues** - Simplified canonical URL generation
5. **Nginx Configuration** - Added User-Agent forwarding and disabled HTML caching

## Files Changed

1. `server.js` - Multiple improvements to SEO middleware
2. `nginx-production-config-fixed.conf` - New Nginx configuration

## Step-by-Step Deployment

### 1. Update Nginx Configuration

**On your VPS server, update the Nginx config:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/centrum-frontend.conf /etc/nginx/sites-enabled/centrum-frontend.conf.backup

# Copy the new config (upload nginx-production-config-fixed.conf to server first)
sudo cp nginx-production-config-fixed.conf /etc/nginx/sites-enabled/centrum-frontend.conf

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

**Key changes in Nginx config:**
- ✅ Added `proxy_set_header User-Agent $http_user_agent;` - **CRITICAL for bot detection**
- ✅ Disabled caching for HTML pages (`no-cache, no-store, must-revalidate`)
- ✅ Increased timeouts to 60 seconds
- ✅ Disabled proxy buffering for real-time responses

### 2. Update server.js

**On your local machine or VPS:**

```bash
# Make sure you have the latest server.js with all fixes
# The fixes include:
# - Improved 404 handling with proper SEO meta tags
# - Better API error handling (3 retries, 10s timeout)
# - Fixed redirect chains (combined trailing slash handler)
# - Simplified canonical URL generation
# - Better logging for debugging
```

### 3. Restart Your Application

```bash
# Stop current server
pm2 stop centrum-server  # or however you're running it

# Restart with new code
pm2 restart centrum-server  # or npm start / node server.js
```

### 4. Verify the Fixes

**Test 1: Check User-Agent forwarding**
```bash
curl -H "User-Agent: Googlebot/2.1" https://centrummedyczne7.pl/ | grep -i "googlebot"
# Should see the server logs showing bot detection
```

**Test 2: Check 404 handling**
```bash
curl -I https://centrummedyczne7.pl/aktualnosci/nonexistent-slug
# Should return 404 with proper headers
```

**Test 3: Check redirect handling**
```bash
curl -I https://centrummedyczne7.pl/uslugi/test-service/
# Should redirect 301 to /uslugi/test-service (no trailing slash)
```

**Test 4: Check canonical URLs**
```bash
curl https://centrummedyczne7.pl/uslugi/test-service | grep "canonical"
# Should show proper canonical URL
```

### 5. Monitor Server Logs

```bash
# Watch server logs in real-time
pm2 logs centrum-server

# Or if using node directly
tail -f /path/to/your/logs/server.log
```

**Look for:**
- ✅ `📄 Serving SEO HTML for: Googlebot...`
- ✅ `🔗 Canonical URL for /path: ...`
- ✅ `✅ Data fetched successfully for slug: ...`
- ❌ Any errors about API failures or redirects

### 6. Request Re-indexing in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (`centrummedyczne7.pl`)
3. Go to **URL Inspection**
4. Test important URLs:
   - Homepage: `https://centrummedyczne7.pl/`
   - Service pages: `https://centrummedyczne7.pl/uslugi/[service-slug]`
   - Doctor pages: `https://centrummedyczne7.pl/lekarze/[doctor-slug]`
   - News pages: `https://centrummedyczne7.pl/aktualnosci/[news-slug]`
5. Click **Request Indexing** for each URL

### 7. Submit Updated Sitemap

1. Go to Google Search Console → **Sitemaps**
2. Remove old sitemap if needed
3. Add new sitemap: `https://centrummedyczne7.pl/sitemap.xml`
4. Submit it

## Expected Results

After deployment, you should see:

### ✅ Reduced 404 Errors
- **Before:** 66 pages with 404 errors
- **After:** Only real 404s (pages that don't exist)

### ✅ Reduced False 404 Errors
- **Before:** 62 pages with false 404s
- **After:** Better API error handling prevents false 404s

### ✅ Reduced Redirect Chains
- **Before:** 13 pages with redirect issues
- **After:** Clean 301 redirects without chains

### ✅ Proper Canonical URLs
- **Before:** Canonical URL mismatches
- **After:** Every page has self-referencing canonical URL

## Troubleshooting

### Issue: Still seeing 404 errors

**Check:**
1. Server logs for API failures
2. Backend API is accessible: `curl https://backend.centrummedyczne7.pl/news`
3. Slugs in sitemap match actual slugs in database

**Fix:**
- Verify API endpoints are correct
- Check backend API is responding
- Verify slugs in database match slugs in URLs

### Issue: Redirect chains still happening

**Check:**
1. Nginx is not adding extra redirects
2. Server.js middleware order is correct
3. No other redirect rules in Nginx

**Fix:**
- Review Nginx config for duplicate redirect rules
- Check server.js middleware order
- Test with `curl -I` to see redirect chain

### Issue: Canonical URLs still wrong

**Check:**
1. Server logs show correct canonical URL generation
2. HTML source shows correct canonical tag
3. No caching interfering

**Fix:**
- Clear Nginx cache: `sudo systemctl reload nginx`
- Check server.js canonical URL logic
- Verify BASE_URL is correct

### Issue: Bot detection not working

**Check:**
1. Nginx is forwarding User-Agent: `curl -H "User-Agent: Googlebot" https://centrummedyczne7.pl/`
2. Server logs show User-Agent header
3. `isBot()` function is working

**Fix:**
- Verify Nginx config has `proxy_set_header User-Agent $http_user_agent;`
- Check server.js `isBot()` function
- Test with curl using bot User-Agent

## Monitoring

### Check Google Search Console Weekly

1. **Coverage Report** - Check for remaining 404 errors
2. **Indexing** - Monitor pages being indexed
3. **Performance** - Check if SEO improvements help rankings

### Monitor Server Performance

```bash
# Check server response times
curl -w "@-" -o /dev/null -s https://centrummedyczne7.pl/ <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

## Next Steps

1. ✅ Deploy fixes
2. ✅ Monitor logs for 24-48 hours
3. ✅ Request re-indexing in Google Search Console
4. ✅ Submit updated sitemap
5. ⏳ Wait 1-2 weeks for Google to re-crawl
6. ⏳ Check Google Search Console for improvements

## Important Notes

⚠️ **Do NOT cache HTML pages** - Always serve fresh content for SEO
⚠️ **Always forward User-Agent** - Required for bot detection
⚠️ **Test redirects** - Make sure no redirect chains exist
⚠️ **Monitor API health** - If backend API is down, pages will return 404

## Support

If you encounter issues:
1. Check server logs first
2. Test with curl commands above
3. Verify Nginx config with `sudo nginx -t`
4. Check backend API is accessible

