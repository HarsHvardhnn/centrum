# API Response Structure Debugging

## The Real Issue

Your APIs might be returning data, but in **different response structures**:

1. **Direct structure**: `{title: "...", description: "..."}`
2. **Nested structure**: `{data: {title: "...", description: "..."}}`
3. **Success wrapper**: `{success: true, data: {title: "...", description: "..."}}`

## What I Fixed

1. ✅ **Added response structure detection** - Now checks for nested data
2. ✅ **Added logging** - Shows what structure the API returns
3. ✅ **Handles all structures** - Works with any response format

## How to Debug

### 1. Check Server Logs

After restarting, look for these logs:

```
✅ Data fetched successfully for slug: [slug]
📦 Response structure: {
  hasData: true,
  hasNestedData: true/false,
  keys: ['title', 'description', ...],
  type: 'object'
}
📦 Using nested/direct/success wrapper structure
```

### 2. Test API Endpoints Directly

**Test a doctor endpoint:**
```bash
curl https://backend.centrummedyczne7.pl/docs/profile/slug/anna-grabowska
```

**Test a service endpoint:**
```bash
curl https://backend.centrummedyczne7.pl/services/slug/[service-slug]
```

**Check the response structure:**
- Does it return `{...}` directly?
- Or `{data: {...}}`?
- Or `{success: true, data: {...}}`?

### 3. Use the Test Endpoint

I've added a test endpoint. Visit:

```
https://centrummedyczne7.pl/test-dynamic-data/lekarze/anna-grabowska
```

This will show you:
- What data is returned
- The response structure
- Any errors

## Why It Might Be Null

Even if your API works, `dynamicData` can be null if:

1. **404 Response** - Slug doesn't exist (legitimate 404)
2. **Timeout** - API takes >10 seconds (network issue)
3. **Network Error** - Connection failed
4. **Wrong Endpoint** - Endpoint doesn't exist
5. **Response Structure Mismatch** - API returns data but in unexpected format

## Next Steps

1. **Restart server** with the new code
2. **Check logs** for the `📦 Response structure` messages
3. **Test a known-good slug** - See what structure it returns
4. **Compare with API** - Check if structure matches what API actually returns

## Expected Log Output

For a successful fetch:
```
📡 Fetching data from: https://backend.centrummedyczne7.pl/docs/profile/slug/anna-grabowska
✅ Data fetched successfully for slug: anna-grabowska
📦 Response structure: { hasData: true, hasNestedData: true, keys: ['data', 'success'], type: 'object' }
📦 Using nested data structure
```

For a failed fetch:
```
📡 Fetching data from: https://backend.centrummedyczne7.pl/docs/profile/slug/nonexistent
❌ 404 - Resource not found: https://backend.centrummedyczne7.pl/docs/profile/slug/nonexistent
⚠️ No dynamic data available for /lekarze/nonexistent - returning proper 404
```

## What to Share

If you still see null errors, share:

1. **Server logs** - The `📦 Response structure` output
2. **API response** - What `curl` shows for a working endpoint
3. **Error pattern** - Which routes are failing (doctors, services, news?)

This will help identify the exact issue!

