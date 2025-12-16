# How to Check Doctor Pages Indexing

This guide explains multiple methods to verify if your static doctor pages are being indexed by Google and other search engines.

## Method 1: Google Search Console (Recommended - Most Reliable)

### Setup (First Time Only)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://centrummedyczne7.pl`
3. Verify ownership (DNS, HTML file, or meta tag method)

### Check Indexing Status

#### Option A: URL Inspection Tool (Best for Single Pages)
1. Go to Search Console → **URL Inspection** (left sidebar)
2. Enter the full URL: `https://centrummedyczne7.pl/lekarze/jan-kowalski` (replace with your doctor slug)
3. Click **Enter**
4. You'll see:
   - **Coverage Status**: "URL is on Google" = indexed ✅
   - **Last Crawl**: When Google last visited the page
   - **Sitemap**: Whether it's in your sitemap
   - **Mobile Usability**: Mobile-friendly status
   - **Page Experience**: Core Web Vitals

#### Option B: Coverage Report (Best for Multiple Pages)
1. Go to Search Console → **Coverage** (left sidebar)
2. Click on **Valid** section
3. Filter by URL pattern: `lekarze/`
4. See all indexed doctor pages

#### Option C: Sitemap Report
1. Go to Search Console → **Sitemaps** (left sidebar)
2. Submit your sitemap: `https://centrummedyczne7.pl/sitemap.xml`
3. Check submitted URLs count
4. Monitor indexing progress

### Request Indexing (For New/Updated Pages)
1. Use **URL Inspection** tool
2. Enter your doctor page URL
3. Click **Request Indexing**
4. Google will crawl within a few minutes to hours

---

## Method 2: Manual Google Search

### Search for Specific Page
```
site:centrummedyczne7.pl/lekarze/jan-kowalski
```

**Expected Result:**
- If indexed: Shows the page in search results
- If not indexed: "No results found"

### Search for All Doctor Pages
```
site:centrummedyczne7.pl/lekarze
```

**Expected Result:**
- Shows all indexed doctor pages
- Count of results = number of indexed pages

### Search with Doctor Name
```
"Dr. Jan Kowalski" site:centrummedyczne7.pl
```

---

## Method 3: Google Search Operators

### Find All Indexed Doctor Pages
```
site:centrummedyczne7.pl inurl:/lekarze/
```

### Check if Specific Doctor is Indexed
```
site:centrummedyczne7.pl "Jan Kowalski" chirurgia
```

### Check for Structured Data
```
site:centrummedyczne7.pl/lekarze/ "@type": "Physician"
```

---

## Method 4: Browser DevTools (Check Page Source)

### Verify Static Content is Served
1. Visit: `https://centrummedyczne7.pl/lekarze/jan-kowalski`
2. Right-click → **View Page Source**
3. Check for:
   - ✅ Meta tags (`<meta name="description"`, `<title>`)
   - ✅ Structured data (`<script type="application/ld+json">`)
   - ✅ Canonical URL (`<link rel="canonical"`)
   - ✅ SEO content in HTML (even if hidden)

### Verify Static File is Being Used
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for:
   - Response headers should show static file path
   - Check response time (static files load faster)
   - Response should contain full HTML, not just `<div id="root"></div>`

---

## Method 5: Server Logs Check

### Check if Googlebot Visited
Look in your server logs for:
```
Googlebot
Googlebot-Mobile
Googlebot-Image
```

Example log entry:
```
GET /lekarze/jan-kowalski HTTP/1.1
User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

---

## Method 6: Rich Results Test (Structured Data)

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter URL: `https://centrummedyczne7.pl/lekarze/jan-kowalski`
3. Click **Test URL**

**Expected Results:**
- ✅ **Valid**: Structured data is detected
- ✅ **Physician** schema detected
- Shows preview of how it appears in search results

---

## Method 7: Mobile-Friendly Test

1. Go to [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
2. Enter URL: `https://centrummedyczne7.pl/lekarze/jan-kowalski`
3. Click **Test URL**

**Expected Result:**
- ✅ Page is mobile-friendly
- Shows screenshot of mobile view

---

## Method 8: Screaming Frog SEO Spider (Advanced)

1. Download [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/)
2. Enter URL: `https://centrummedyczne7.pl`
3. Configure filters:
   - Include: `/lekarze/`
   - Exclude: `/assets/`, `/images/`
4. Run crawl
5. Check:
   - **Status Codes**: All should be 200
   - **Meta Titles**: Should be unique for each doctor
   - **Meta Descriptions**: Should be unique
   - **Structured Data**: Should detect Physician schema

---

## Method 9: curl Command (Quick Check)

### Check if Static HTML is Served
```bash
curl -I https://centrummedyczne7.pl/lekarze/jan-kowalski
```

**Expected Headers:**
- `HTTP/1.1 200 OK`
- `Content-Type: text/html; charset=utf-8`

### Fetch Full HTML Content
```bash
curl https://centrummedyczne7.pl/lekarze/jan-kowalski | grep -i "Physician"
```

**Expected Result:**
- Should find `"@type": "Physician"` in the HTML

### Simulate Googlebot Request
```bash
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://centrummedyczne7.pl/lekarze/jan-kowalski > doctor-page.html
```

Then open `doctor-page.html` to see what Google sees.

---

## Method 10: Automated Script (Check All Doctor Pages)

Create a script to check all doctor pages:

```javascript
// check-indexing.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://centrummedyczne7.pl';
const lekarzeDir = path.join(process.cwd(), 'dist', 'lekarze');

// Read index.json to get all doctor slugs
const indexData = JSON.parse(fs.readFileSync(path.join(lekarzeDir, 'index.json'), 'utf8'));

console.log(`Checking indexing for ${indexData.slugs.length} doctor pages...\n`);

for (const slug of indexData.slugs) {
  const url = `${BASE_URL}/lekarze/${slug}`;
  
  try {
    // Check if page is accessible
    const response = await axios.get(url, { 
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status
    });
    
    if (response.status === 200) {
      // Check if static content is present
      const hasStructuredData = response.data.includes('"@type": "Physician"');
      const hasMetaTags = response.data.includes('<meta name="description"');
      const hasTitle = response.data.includes('<title>');
      
      if (hasStructuredData && hasMetaTags && hasTitle) {
        console.log(`✅ ${slug}: OK (Status: ${response.status})`);
      } else {
        console.log(`⚠️  ${slug}: Missing SEO content (Status: ${response.status})`);
      }
    } else {
      console.log(`❌ ${slug}: Failed (Status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ ${slug}: Error - ${error.message}`);
  }
}
```

Run with:
```bash
node check-indexing.js
```

---

## Quick Checklist

Use this checklist to verify indexing:

- [ ] Page is accessible (200 status code)
- [ ] Page source contains meta tags
- [ ] Page source contains structured data (JSON-LD)
- [ ] Page appears in Google Search Console URL Inspection
- [ ] Page shows up in `site:centrummedyczne7.pl/lekarze/` search
- [ ] Rich Results Test detects Physician schema
- [ ] Mobile-Friendly Test passes
- [ ] Server logs show Googlebot visits
- [ ] Sitemap includes all doctor pages
- [ ] Canonical URLs are correct

---

## Troubleshooting

### Page Not Indexed After 1 Week

1. **Check robots.txt**: Ensure `/lekarze/` paths are not blocked
   ```
   User-agent: *
   Disallow: /admin/
   # Allow: /lekarze/ (should be accessible)
   ```

2. **Check sitemap.xml**: Verify doctor pages are included
   ```bash
   curl https://centrummedyczne7.pl/sitemap.xml | grep lekarze
   ```

3. **Request Indexing**: Use Google Search Console URL Inspection

4. **Check for Errors**: 
   - Server errors (500, 404)
   - Redirect loops
   - Slow page load times

### Page Shows Old Content

1. **Regenerate Static Pages**:
   ```bash
   npm run build:static-doctors
   ```

2. **Clear CDN Cache** (if using CDN)

3. **Request Re-indexing** in Search Console

### Structured Data Not Detected

1. **Validate JSON-LD**:
   - Use [JSON-LD Playground](https://json-ld.org/playground/)
   - Check for syntax errors

2. **Verify Schema.org Format**:
   - Use [Schema Markup Validator](https://validator.schema.org/)

---

## Expected Timeline

- **First Indexing**: 1-7 days after deployment
- **Full Indexing** (all pages): 1-4 weeks
- **Rankings**: 2-8 weeks (depending on competition)

---

## Monitoring

### Weekly Checks
- Review Google Search Console Coverage report
- Check for new indexed pages
- Monitor indexing errors

### Monthly Checks
- Review search performance (impressions, clicks)
- Check rankings for doctor-related keywords
- Analyze which doctor pages get most traffic

---

## Useful Tools Summary

1. **Google Search Console** - Official indexing status
2. **Google Rich Results Test** - Structured data validation
3. **Mobile-Friendly Test** - Mobile optimization
4. **Screaming Frog** - Technical SEO audit
5. **curl** - Quick server response checks
6. **Browser DevTools** - Client-side verification

---

## Quick Test Commands

```bash
# Check if specific page is indexed
curl -I https://centrummedyczne7.pl/lekarze/jan-kowalski

# Check all doctor pages in sitemap
curl https://centrummedyczne7.pl/sitemap.xml | grep -o '/lekarze/[^<]*' | head -20

# Simulate Googlebot request
curl -A "Googlebot" https://centrummedyczne7.pl/lekarze/jan-kowalski > googlebot-view.html

# Check server response time
time curl -o /dev/null -s https://centrummedyczne7.pl/lekarze/jan-kowalski
```

---

## Next Steps After Verification

1. ✅ **If Indexed**: Monitor performance in Search Console
2. ⚠️ **If Partially Indexed**: Request indexing for missing pages
3. ❌ **If Not Indexed**: Check robots.txt, sitemap, and server logs
4. 📊 **Always**: Track indexing progress weekly

