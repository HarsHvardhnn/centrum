# API Response Structure Testing

## Purpose

This script tests all your API endpoints to understand:
1. **What response structure** each endpoint returns
2. **Why `dynamicData` might be null** even when API works
3. **How to fix** the server.js code to handle all structures

## How to Run

### Windows (PowerShell):
```powershell
.\run-api-tests.ps1
```

### Linux/Mac:
```bash
chmod +x run-api-tests.sh
./run-api-tests.sh
```

### Or directly:
```bash
node test-api-responses.js
```

## What It Does

1. **Tests List Endpoints:**
   - `/news?isNews=true` - News list
   - `/news?isNews=false` - Blog list
   - `/services` - Services list
   - `/docs` - Doctors list

2. **Extracts Real Slugs:**
   - Gets actual slugs from the lists
   - Uses them to test individual endpoints

3. **Tests Individual Endpoints:**
   - `/news/slug/{slug}?isNews=true` - News article
   - `/news/slug/{slug}?isNews=false` - Blog article
   - `/services/slug/{slug}` - Service
   - `/docs/profile/slug/{slug}` - Doctor (primary)
   - `/docs/slug/{slug}` - Doctor (alternative 1)
   - `/doctors/slug/{slug}` - Doctor (alternative 2)
   - `/doctor/slug/{slug}` - Doctor (alternative 3)

4. **Analyzes Each Response:**
   - Response structure (direct, nested, success wrapper)
   - Data location
   - Recommendations for how to access it

5. **Saves Results:**
   - Full JSON report: `api-test-results.json`
   - Console summary with recommendations

## Output

### Console Output:
```
🧪 API Response Structure Diagnostic Script
============================================================
📡 API Base URL: https://backend.centrummedyczne7.pl

📡 Testing: News List
✅ News List: OK (200) - 234ms
  Type: object, IsArray: false
  Keys: data, success, count
  Recommendation: Use: response.data.data (nested with success wrapper)

📡 Testing: News Article (by slug)
✅ News Article (by slug): OK (200) - 189ms
  Type: object, IsArray: false
  Keys: title, description, slug
  Recommendation: Use: response.data (direct structure)
```

### JSON Output (`api-test-results.json`):
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "apiBaseUrl": "https://backend.centrummedyczne7.pl",
  "tests": [
    {
      "name": "News List",
      "endpoint": "https://backend.centrummedyczne7.pl/news?isNews=true",
      "success": true,
      "statusCode": 200,
      "responseTime": 234,
      "analysis": {
        "structure": {
          "type": "object",
          "hasNestedData": true,
          "hasSuccess": true,
          "keys": ["data", "success", "count"]
        },
        "recommendations": [
          "Use: response.data.data (nested with success wrapper)"
        ]
      }
    }
  ]
}
```

## Understanding the Results

### Response Structure Types:

1. **Direct Structure:**
   ```json
   {
     "title": "...",
     "description": "..."
   }
   ```
   → Use: `response.data`

2. **Nested Structure:**
   ```json
   {
     "data": {
       "title": "...",
       "description": "..."
     }
   }
   ```
   → Use: `response.data.data`

3. **Success Wrapper:**
   ```json
   {
     "success": true,
     "data": {
       "title": "...",
       "description": "..."
     }
   }
   ```
   → Use: `response.data.data`

## What to Look For

1. **Check `recommendations`** - Shows how to access data
2. **Check `structure.hasNestedData`** - If true, use nested access
3. **Check `statusCode`** - 200 = success, 404 = not found, 500 = server error
4. **Check `responseTime`** - If >5000ms, might timeout

## Common Issues Found

### Issue 1: Different Structures
- List endpoints return: `{success: true, data: [...]}`
- Individual endpoints return: `{title: "...", ...}` directly
- **Fix:** Handle both structures in server.js

### Issue 2: 404 for Valid Slugs
- API returns 404 even for valid slugs
- **Fix:** Check slug format or endpoint path

### Issue 3: Timeouts
- Response time >10 seconds
- **Fix:** Increase timeout or optimize API

### Issue 4: Network Errors
- Connection refused or timeout
- **Fix:** Check API server status

## Next Steps

After running the test:

1. **Review `api-test-results.json`** - See all response structures
2. **Check recommendations** - See how to access data for each endpoint
3. **Update server.js** - Use the recommendations to fix data access
4. **Test again** - Verify fixes work

## Example: Using Results to Fix Code

If test shows:
```json
{
  "recommendations": ["Use: response.data.data (nested with success wrapper)"]
}
```

Then in server.js, use:
```javascript
if (response.data.success && response.data.data) {
  return response.data.data;
}
```

## Troubleshooting

### No slugs found
- Check if API lists are returning data
- Verify API endpoints are correct
- Check API authentication if needed

### All tests fail
- Check API server is running
- Verify API_BASE_URL is correct
- Check network connectivity

### Timeouts
- API might be slow
- Increase timeout in test script
- Check API server performance

