# API Testing Instructions - 404 Error Diagnosis

## Summary of Findings

Based on your API responses:

- ✅ `/docs` - **WORKING** (returns doctors list)
- ✅ `/services` - **WORKING** (returns 12 services)
- ✅ `/news` - **WORKING** (returns news list)
- ❌ `/blogs` - **FAILING** (404 error)

## The Real Problem

The **list endpoints work**, but Google is reporting 404 errors for **individual pages**. This means:

1. Google can see your sitemap
2. Google tries to visit individual service/doctor/news pages
3. Those individual pages are returning 404 because the backend API endpoints for individual items are failing

## What You Need to Test

### Priority 1: Individual Service Pages

Your services have these slugs (from your API response):
```
konsultacja-chirurgiczna
konsultacja-proktologiczna
konsultacja-online
konsultacja-neurologiczna
usuniecie-chirurgiczne-szwow-1
leczenie-ran-przewleklych
leczenie-chirurgiczne-wrastajacych-paznokci
wszywka-alkoholowa-skarzysko-kamienna-disulfiram-esperal-1
wycinanie-zmian-skornych-z-ocena-histopatologiczna
leczenie-stopy-cukrzycowej
specjalistyczne-poradnictwo-zywieniowe
poradnictwo-zywieniowe
```

**Test these URLs in Postman:**

```
GET https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna
GET https://backend.centrummedyczne7.pl/services/slug/konsultacja-proktologiczna
GET https://backend.centrummedyczne7.pl/services/slug/leczenie-stopy-cukrzycowej
```

**Expected Result:** Should return service details (title, description, images, etc.)

**If it fails (404):** This is your problem! The backend doesn't have `/services/slug/:slug` endpoint.

### Priority 2: Individual Doctor Pages

First, get the doctor list:
```
GET https://backend.centrummedyczne7.pl/docs
```

Then look for doctor slugs or names in the response. Then test:
```
GET https://backend.centrummedyczne7.pl/docs/profile/slug/{doctor-slug}
```

**If it fails**, try alternative endpoints:
```
GET https://backend.centrummedyczne7.pl/docs/slug/{doctor-slug}
GET https://backend.centrummedyczne7.pl/doctors/slug/{doctor-slug}
GET https://backend.centrummedyczne7.pl/doctor/slug/{doctor-slug}
```

### Priority 3: Individual News Pages

Get news list:
```
GET https://backend.centrummedyczne7.pl/news
```

Check for slugs in response, then test:
```
GET https://backend.centrummedyczne7.pl/news/slug/{news-slug}
```

### Priority 4: Blogs (Optional)

Since `/blogs` is returning 404:

**Option A:** You don't use blogs - Remove `/poradnik` from sitemap  
**Option B:** Backend needs to implement `/blogs` endpoint

## How to Use the Postman Collection

1. **Import the collection:**
   - Open Postman
   - Click "Import"
   - Select `Postman-API-Tests.json`

2. **Run the tests:**
   - Start with "1. List Endpoints" folder - these should all work
   - Then test "2. Individual Service Pages" - **CRITICAL**
   - Then test "3. Individual Doctor Pages" - **CRITICAL**

3. **Report back:**
   - Which endpoints return 404?
   - Which endpoints work?
   - What's the response structure?

## Expected Issues

I strongly suspect:

### Issue #1: Missing `/services/slug/:slug` endpoint
```
❌ GET /services/slug/konsultacja-chirurgiczna → 404
```

**Solution:** Backend needs to implement this endpoint, OR you need to update `server.js` to use a different endpoint.

### Issue #2: Missing `/docs/profile/slug/:slug` endpoint
```
❌ GET /docs/profile/slug/dr-jan-kowalski → 404
```

**Solution:** Backend needs to implement this endpoint, OR find the correct endpoint format.

### Issue #3: `/blogs` doesn't exist
```
❌ GET /blogs → 404
```

**Solution:** Either:
- Remove blogs/poradnik from your site
- Implement `/blogs` endpoint in backend
- Use a different endpoint for blogs

## Quick Test Commands (PowerShell)

```powershell
# Test services list (should work)
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services" | Select-Object -ExpandProperty Content

# Test individual service (might fail)
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna" | Select-Object -ExpandProperty Content

# Test doctors list (should work)
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/docs" | Select-Object -ExpandProperty Content

# Test news list (should work)
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/news" | Select-Object -ExpandProperty Content

# Test blogs (will fail)
Invoke-WebRequest -Uri "https://backend.centrummedyczne7.pl/blogs" | Select-Object -ExpandProperty Content
```

## Next Steps

1. **Run the Postman tests** (or curl commands)
2. **Identify which individual endpoints are failing**
3. **Report back** with the results
4. I'll update `server.js` to:
   - Use the correct API endpoints
   - Remove non-existent endpoints from sitemap
   - Add proper error handling

## Questions to Answer

1. Does `/services/slug/{slug}` work? ✅ or ❌
2. Does `/news/slug/{slug}` work? ✅ or ❌
3. What's the correct endpoint for individual doctors? `/docs/profile/slug/{slug}` or something else?
4. Do you actually have blogs? Should `/poradnik` exist on your site?


