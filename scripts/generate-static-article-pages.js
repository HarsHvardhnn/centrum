/**
 * Static Site Generation for News & Blog Articles
 * Runs at build time: fetches all articles from API and generates static HTML
 * with SEO meta tags (title, description, og, twitter, JSON-LD) for crawlers.
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'https://backend.centrummedyczne7.pl';
const BASE_URL = 'https://centrummedyczne7.pl';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Validate slug
const isValidSlug = (slug) => {
  return slug &&
    slug.trim() !== '' &&
    slug !== 'undefined' &&
    slug !== 'null' &&
    !slug.includes('undefined');
};

// Escape HTML for security
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Fetch all news articles
const fetchNews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news?isNews=true`, { timeout: 15000 });
    const data = response.data;
    return Array.isArray(data) ? data : data?.data || data?.news || [];
  } catch (error) {
    console.error('❌ Failed to fetch news:', error.message);
    return [];
  }
};

// Fetch all blog articles
const fetchBlogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news?isNews=false`, { timeout: 15000 });
    const data = response.data;
    return Array.isArray(data) ? data : data?.data || data?.blogs || [];
  } catch (error) {
    console.error('❌ Failed to fetch blogs:', error.message);
    return [];
  }
};

// Find asset filenames from dist/assets
const findAssetFilenames = () => {
  const assetsPath = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsPath)) {
    return { cssFile: null, jsFile: null };
  }
  const files = fs.readdirSync(assetsPath);
  const cssFile = files.find((f) => f.endsWith('.css') && f.startsWith('index-'));
  const jsFile = files.find((f) => f.endsWith('.js') && f.startsWith('index-') && !f.includes('.map'));
  return { cssFile, jsFile };
};

// Generate static HTML for an article
const generateArticleHTML = (article, isNews, cssFile, jsFile) => {
  const slug = article.slug;
  if (!isValidSlug(slug)) {
    console.log(`⚠️ Skipping article with invalid slug:`, article.title);
    return null;
  }

  const title = article.title || 'Artykuł';
  const description = article.shortDescription || article.description || title;
  const canonicalUrl = `${BASE_URL}/${isNews ? 'aktualnosci' : 'poradnik'}/${slug}`;
  const ogImage = article.image
    ? (article.image.startsWith('http') ? article.image : `${BASE_URL}${article.image.startsWith('/') ? '' : '/'}${article.image}`)
    : `${BASE_URL}/${isNews ? 'images/news.jpg' : 'images/blogs.jpg'}`;

  const schemaType = isNews ? 'NewsArticle' : 'BlogPosting';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: title,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: ogImage,
      width: 800,
      height: 600,
    },
    author: {
      '@type': 'Person',
      name: article.author || 'Centrum Medyczne 7',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Centrum Medyczne 7',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/mainlogo.png`,
        width: 200,
        height: 60,
      },
    },
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <!-- SEO Meta Tags -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${escapeHtml(title)}">
    <meta property="twitter:description" content="${escapeHtml(description)}">
    <meta property="twitter:image" content="${escapeHtml(ogImage)}">
    
    <meta name="author" content="${escapeHtml(article.author || 'Centrum Medyczne 7')}">
    
    <link rel="icon" type="image/png" href="/images/fav_new.png">
    <link rel="apple-touch-icon" href="/images/fav_new.png">
    
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    
    ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : ''}
</head>
<body>
    <div id="seo-content" style="visibility: hidden; position: absolute; width: 1px; height: 1px; overflow: hidden;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
    </div>
    <div id="root"></div>
    ${jsFile ? `<script type="module" crossorigin src="/assets/${jsFile}"></script>` : ''}
    <noscript>Ta strona wymaga JavaScript do pełnej funkcjonalności.</noscript>
</body>
</html>`;

  return { slug, html, isNews };
};

// Main function
const generateStaticArticlePages = async () => {
  try {
    console.log('🚀 Starting static article pages generation...');
    console.log(`📁 Output directory: ${DIST_DIR}`);
    console.log(`🔗 API Base URL: ${API_BASE_URL}`);

    if (!fs.existsSync(DIST_DIR)) {
      console.warn('⚠️ dist folder not found. Run npm run build first.');
      return;
    }

    const { cssFile, jsFile } = findAssetFilenames();
    if (cssFile && jsFile) {
      console.log(`✅ Found assets: ${cssFile}, ${jsFile}`);
    } else {
      console.warn('⚠️ Could not find CSS/JS assets. Static pages may not load correctly.');
    }

    const [news, blogs] = await Promise.all([fetchNews(), fetchBlogs()]);
    console.log(`📰 Fetched ${news.length} news articles`);
    console.log(`📝 Fetched ${blogs.length} blog articles`);

    const aktualnosciDir = path.join(DIST_DIR, 'aktualnosci');
    const poradnikDir = path.join(DIST_DIR, 'poradnik');
    [aktualnosciDir, poradnikDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    let newsCount = 0;
    let blogCount = 0;

    for (const article of news) {
      const result = generateArticleHTML(article, true, cssFile, jsFile);
      if (result) {
        const filePath = path.join(aktualnosciDir, `${result.slug}.html`);
        fs.writeFileSync(filePath, result.html, 'utf8');
        newsCount++;
        console.log(`✅ Generated: /aktualnosci/${result.slug}.html`);
      }
    }

    for (const article of blogs) {
      const result = generateArticleHTML(article, false, cssFile, jsFile);
      if (result) {
        const filePath = path.join(poradnikDir, `${result.slug}.html`);
        fs.writeFileSync(filePath, result.html, 'utf8');
        blogCount++;
        console.log(`✅ Generated: /poradnik/${result.slug}.html`);
      }
    }

    console.log('\n📊 Generation Summary:');
    console.log(`   ✅ News: ${newsCount} pages`);
    console.log(`   ✅ Blogs: ${blogCount} pages`);
    console.log('\n🎉 Static article pages generation completed!');
  } catch (error) {
    console.error('❌ Error generating static article pages:', error);
    process.exit(1);
  }
};

// Run if called directly
const runPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const filePath = fileURLToPath(import.meta.url);
if (filePath === runPath || runPath.includes('generate-static-article-pages')) {
  generateStaticArticlePages();
}

export default generateStaticArticlePages;
