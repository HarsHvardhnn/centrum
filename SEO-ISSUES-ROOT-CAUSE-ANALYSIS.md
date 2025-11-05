# SEO Issues - Root Cause Analysis

## Summary of Issues Found

Based on the Google Search Console report, here are the root causes and fixes:

## 1. 404 Errors (66 pages) - FIXED ✅

### Root Cause:
- **Nginx was caching HTML pages** - When API failed, cached 404s were served
- **API timeout too short (5s)** - Backend API calls were timing out
- **No retry logic** - Single API failure resulted in 404
- **User-Agent not forwarded** - Server couldn't detect bots properly

### Fix:
- ✅ Disabled HTML caching in Nginx (`no-cache, no-store, must-revalidate`)
- ✅ Increased API timeout to 10 seconds
- ✅ Added retry logic (3 retries with 2s delay)
- ✅ Added User-Agent forwarding in Nginx
- ✅ Improved 404 responses with proper SEO meta tags

## 2. False 404 Errors (62 pages) - FIXED ✅

### Root Cause:
- **API failures treated as 404** - Network errors, timeouts, and 5xx errors were all treated as 404
- **No distinction between real 404s and errors** - Server couldn't tell the difference
- **Backend API not responding** - Sometimes API was slow or down

### Fix:
- ✅ Better error handling - Distinguish between 404 (real) and 5xx (error)
- ✅ Retry only on network/5xx errors - Don't retry on real 404s
- ✅ Better logging - See exactly why API calls fail
- ✅ Alternative endpoints for doctors - Try multiple endpoints

## 3. Redirect Chains (13 pages) - FIXED ✅

### Root Cause:
- **Multiple redirect middlewares** - `handleServiceTrailingSlash` and `handleUrlNormalization` both redirecting
- **Middleware order wrong** - Trailing slash redirect happened after normalization
- **Canonical URL redirects** - Server was redirecting to canonical URLs unnecessarily

### Fix:
- ✅ Combined trailing slash handler - Single middleware handles all trailing slashes
- ✅ Fixed middleware order - Trailing slash → Normalization → SEO
- ✅ Removed canonical URL redirects - Canonical is just a meta tag, not a redirect
- ✅ Only normalize static routes - Preserve dynamic route case

## 4. Canonical URL Issues (7 pages) - FIXED ✅

### Root Cause:
- **Complex canonical URL logic** - Multiple normalization steps causing inconsistencies
- **Canonical URL mismatch** - Generated URL didn't match actual URL
- **Redirect to canonical** - Server was redirecting to canonical (wrong!)

### Fix:
- ✅ Simplified canonical URL generation - Just use the actual path
- ✅ Self-referencing canonical - Always points to the current page
- ✅ Removed redirect logic from canonical - Canonical is meta tag only

## 5. Pages Not Indexed (103 pages) - PARTIALLY FIXED ⚠️

### Root Cause:
- **Google hasn't crawled yet** - These are likely pages that exist but haven't been indexed
- **Backend API slow** - Slow API responses cause Google to timeout
- **No proper SEO HTML** - Some pages might not have proper meta tags

### Fix:
- ✅ Improved API response times - Better error handling and retries
- ✅ Proper SEO HTML for all pages - Every page has meta tags
- ⏳ Request re-indexing in Google Search Console
- ⏳ Submit updated sitemap

## 6. Duplicate Pages (99 pages) - NEEDS BACKEND FIX ⚠️

### Root Cause:
- **Multiple URLs for same content** - Different slugs pointing to same content
- **Canonical tags not working** - Google choosing different canonical than user
- **Backend not setting canonical** - Backend might have duplicate content

### Fix:
- ✅ Self-referencing canonical URLs - Every page points to itself
- ⚠️ Check backend for duplicate content - Need to verify slugs are unique
- ⚠️ Check sitemap for duplicates - Ensure sitemap doesn't list duplicates

## 7. Blocked by robots.txt (2 pages) - CHECK ⚠️

### Root Cause:
- **robots.txt blocking pages** - Some pages might be blocked
- **Need to check robots.txt file**

### Fix:
- ⚠️ Check `/public/robots.txt` - Make sure important pages aren't blocked
- ⚠️ Ensure robots.txt is correct

## Technical Details

### Nginx Configuration Issues:

**Before:**
```nginx
# Missing User-Agent forwarding
# HTML pages were being cached
# Short timeouts
```

**After:**
```nginx
# ✅ proxy_set_header User-Agent $http_user_agent;  # CRITICAL
# ✅ No caching for HTML (no-cache, no-store, must-revalidate)
# ✅ Longer timeouts (60s)
# ✅ Disabled buffering for real-time responses
```

### Server.js Issues:

**Before:**
- Single API call with 5s timeout
- No retry logic
- Complex canonical URL logic causing redirects
- Multiple redirect middlewares causing chains

**After:**
- ✅ 3 retries with 10s timeout
- ✅ Smart retry logic (only retry on network/5xx errors)
- ✅ Simplified canonical URL (just use path)
- ✅ Combined trailing slash handler
- ✅ Better error logging

## API Endpoint Issues:

**Potential Issues:**
1. Backend API might be slow or timing out
2. Endpoints might be incorrect
3. Backend might return 404 for valid slugs

**How to Check:**
```bash
# Test backend API
curl https://backend.centrummedyczne7.pl/news
curl https://backend.centrummedyczne7.pl/services
curl https://backend.centrummedyczne7.pl/docs

# Test specific endpoints
curl https://backend.centrummedyczne7.pl/news/slug/[slug]?isNews=true
curl https://backend.centrummedyczne7.pl/services/slug/[slug]
curl https://backend.centrummedyczne7.pl/docs/profile/slug/[slug]
```

## Next Steps:

1. ✅ Deploy fixes (see SEO-FIXES-DEPLOYMENT-GUIDE.md)
2. ⏳ Monitor for 24-48 hours
3. ⏳ Request re-indexing in Google Search Console
4. ⏳ Check backend API health
5. ⏳ Verify robots.txt
6. ⏳ Check for duplicate content in backend

## Expected Timeline:

- **Immediate (0-24h):** Fixes deployed, server running with new code
- **Short-term (1-7 days):** Google starts re-crawling, 404 errors should decrease
- **Medium-term (1-2 weeks):** Most indexing issues should be resolved
- **Long-term (2-4 weeks):** Full re-indexing complete, SEO improvements visible

## Success Metrics:

- ✅ 404 errors: Should drop from 66 → <10 (only real 404s)
- ✅ False 404s: Should drop from 62 → 0
- ✅ Redirect chains: Should drop from 13 → 0
- ✅ Canonical issues: Should drop from 7 → 0
- ⏳ Pages indexed: Should increase over time (103 → more pages indexed)

