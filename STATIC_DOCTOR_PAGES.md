# Static Doctor Pages - SEO Optimization

This document explains the static page generation system for doctor profiles, which improves SEO and indexing reliability compared to server-side rendering.

## Overview

Instead of relying solely on server-side rendering (which can have errors and reliability issues), we now generate static HTML files for each doctor at build time. These static files:

- ✅ Are always available (no API dependency at request time)
- ✅ Are fully crawlable by Google and other search engines
- ✅ Have all SEO metadata pre-rendered
- ✅ Include structured data (Schema.org) for rich snippets
- ✅ Fall back to dynamic rendering if static file doesn't exist

## How It Works

1. **Build Time**: During the build process, we fetch all doctors from the API and generate static HTML files
2. **Request Time**: When a request comes in for `/lekarze/{slug}`, the server checks if a static file exists
3. **Static First**: If a static file exists, it's served directly (fast, reliable, SEO-friendly)
4. **Dynamic Fallback**: If no static file exists, the server falls back to the existing dynamic SEO middleware

## Scripts

### Generate All Doctor Pages
```bash
npm run build:static-doctors
```

This script:
- Fetches all doctors from the API
- Generates static HTML files for each doctor
- Saves them to `dist/lekarze/{slug}.html`
- Creates an index file with all generated slugs

### Generate Test Doctor Page
```bash
npm run build:test-doctor
```

This script generates a single test page from the first available doctor, useful for testing before generating all pages.

### Full Build (Recommended)
```bash
npm run build:full
```

This runs `vite build` followed by static doctor page generation. Use this for production builds.

### Production Build
```bash
npm run build:prod
```

This runs the full build and starts the server. Use this for deployment.

## File Structure

```
dist/
├── lekarze/
│   ├── jan-kowalski.html       # Static HTML for doctor with slug "jan-kowalski"
│   ├── maria-nowak.html        # Static HTML for doctor with slug "maria-nowak"
│   └── index.json              # Index of all generated doctor slugs
├── assets/                     # React app assets (CSS, JS)
└── ...
```

## Static HTML Features

Each generated static HTML file includes:

- **SEO Meta Tags**: Title, description, keywords, canonical URL
- **Open Graph Tags**: For Facebook/LinkedIn sharing
- **Twitter Cards**: For Twitter sharing
- **Structured Data**: JSON-LD Schema.org markup for rich snippets
- **Hidden SEO Content**: Text content for crawlers (invisible to users)
- **React App Root**: `<div id="root"></div>` for React hydration

## Server Configuration

The server (`server.js`) has been updated with a middleware that:

1. Checks if the request path matches `/lekarze/{slug}`
2. Looks for a static HTML file at `dist/lekarze/{slug}.html`
3. If found, serves it directly with appropriate headers
4. If not found, falls back to the existing dynamic SEO middleware

## Testing

### 1. Generate a Test Page
```bash
npm run build:test-doctor
```

### 2. Start the Server
```bash
npm start
```

### 3. Visit the Page
Open: `http://localhost:3000/lekarze/{slug}` (replace `{slug}` with the generated slug)

### 4. Verify
- View page source to see the static HTML content
- Check that meta tags are present
- Verify structured data is in the `<script type="application/ld+json">` tag
- Test that the React app still works (hydration should occur)

### 5. Check Google Indexing
- Submit the URL to Google Search Console
- Use "URL Inspection" tool to see how Google renders the page
- Verify that the static content is visible to Google

## Deployment

### Option 1: Generate Static Pages During Build (Recommended)
```bash
npm run build:full
npm start
```

### Option 2: Generate Static Pages Separately
```bash
npm run build
npm run build:static-doctors
npm start
```

### Option 3: Use Production Build Script
```bash
npm run build:prod
```

## Benefits

1. **Reliability**: No dependency on API availability at request time
2. **Performance**: Static files are served instantly without API calls
3. **SEO**: Search engines get fully rendered HTML with all metadata
4. **Indexing**: Google can reliably crawl and index doctor pages
5. **Fallback**: If static generation fails, dynamic rendering still works

## Troubleshooting

### Static pages not being served
- Check that files exist in `dist/lekarze/`
- Verify the slug matches the filename
- Check server logs for errors

### Pages showing old content
- Regenerate static pages: `npm run build:static-doctors`
- Clear server cache if using a CDN
- Check file modification times

### API errors during generation
- Verify API_BASE_URL is correct
- Check API endpoint availability
- Review error messages in console

### React app not hydrating
- Ensure React app assets are in `dist/assets/`
- Check browser console for errors
- Verify the route matches React Router configuration

## Future Improvements

- [ ] Incremental regeneration (only update changed doctors)
- [ ] Scheduled regeneration via cron job
- [ ] CDN integration for static files
- [ ] Add sitemap generation for static pages
- [ ] Add pre-rendering for other dynamic pages (services, news, etc.)

## Notes

- Static pages are generated at build time, so they won't reflect real-time changes
- Regenerate static pages when doctor information changes
- The React app still works normally - static HTML is just for SEO/crawling
- Both static and dynamic approaches can coexist (static takes precedence)
