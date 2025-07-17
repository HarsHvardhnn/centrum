# Testing Crawler Failures Locally

## Quick Test Steps:

### 1. Test with Network Disabled
1. Start your server: `node server.js`
2. Open browser and go to `http://localhost:3000`
3. Open DevTools (F12)
4. Go to **Network** tab
5. Check "Offline" checkbox
6. Refresh the page
7. Check **Console** tab for any "map is not a function" errors

### 2. Test with Slow Network
1. In DevTools **Network** tab
2. Set throttling to "Slow 3G"
3. Refresh page
4. Check console for errors

### 3. Test PDF Loading
1. Visit `http://localhost:3000/regulamin`
2. Check if PDF loads in iframe
3. Visit `http://localhost:3000/polityka-prywatnosci`
4. Check if PDF loads in iframe

### 4. Test API Failures
1. Disconnect internet
2. Visit `http://localhost:3000`
3. Check console for errors
4. Reconnect and test again

## What to Look For:

✅ **Good Signs:**
- No "map is not a function" errors in console
- Components show loading states or empty states gracefully
- PDFs load correctly
- Site doesn't crash

❌ **Bad Signs:**
- "map is not a function" errors in console
- Components crash or show blank pages
- PDFs show 404 errors
- Site becomes unresponsive

## Expected Behavior:

When API calls fail, your components should:
- Show loading states
- Display empty states gracefully
- Not crash with JavaScript errors
- Still render the basic page structure 