const express = require('express');
const path = require('path');
const generateSitemap = require('./utils/sitemapGenerator');
const fs = require('fs');
const axios = require('axios');

const app = express();

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://backend.centrummedyczne7.pl';

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Utility: convert slug to readable title
function humanizeSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Utility: escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Utility: render index.html with proper SEO metadata
function renderWithSEO(res, titleText, descriptionText, ogImage = null, additionalMeta = '') {
  try {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const BASE_URL = 'https://centrummedyczne7.pl';
    const fullOgImage = ogImage && (ogImage.startsWith('http://') || ogImage.startsWith('https://'))
      ? ogImage
      : ogImage ? `${BASE_URL}${ogImage}` : `${BASE_URL}/images/mainlogo.png`;

    // Replace existing title tag if present
    if (html.includes('<title>')) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(titleText)}</title>`);
    } else {
      // Inject title before </head> if not present
      html = html.replace('</head>', `  <title>${escapeHtml(titleText)}</title>\n</head>`);
    }

    // Generate other meta tags (excluding title)
    const metaTags = `
    <meta name="description" content="${escapeHtml(descriptionText)}">
    <meta property="og:title" content="${escapeHtml(titleText)}">
    <meta property="og:description" content="${escapeHtml(descriptionText)}">
    <meta property="og:image" content="${escapeHtml(fullOgImage)}">
    <meta property="og:type" content="article">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${escapeHtml(titleText)}">
    <meta property="twitter:description" content="${escapeHtml(descriptionText)}">
    <meta property="twitter:image" content="${escapeHtml(fullOgImage)}">
    ${additionalMeta}`;

    // Inject meta tags before </head>
    html = html.replace('</head>', `${metaTags}\n</head>`);

    // First meaningful content: off-screen SEO block so crawlers see title/description
    // (avoids indexing footer; visible duplicate removed)
    const srOnly = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    const injection = `\n<section id="seo-content" style="${srOnly}" aria-hidden="true">\n  <h1>${escapeHtml(titleText)}</h1>\n  <p>${escapeHtml(descriptionText)}</p>\n</section>\n<div id="root"></div>`;
    html = html.replace('<div id="root"></div>', injection);
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering SEO HTML:', error);
    // Fallback to plain index.html if anything goes wrong
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
}

// Function to fetch article data from API
async function fetchArticleData(slug, isNews) {
  try {
    const endpoint = isNews 
      ? `${API_BASE_URL}/news/slug/${slug}?isNews=true`
      : `${API_BASE_URL}/news/slug/${slug}?isNews=false`;
    
    console.log(`📡 Fetching article data from: ${endpoint}`);
    
    const response = await axios.get(endpoint, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    if (response.status === 200 && response.data) {
      // Handle different response structures
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else if (response.data.data && typeof response.data.data === 'object') {
        return response.data.data;
      } else {
        return response.data;
      }
    }

    if (response.status === 404) {
      console.log(`❌ Article not found: ${slug}`);
      return null;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error fetching article data for ${slug}:`, error.message);
    return null;
  }
}

// SEO: ortopeda dziecięcy – static landing (must be before /uslugi/:slug)
app.get('/uslugi/ortopeda-dzieciecy-skarzysko', (req, res) => {
  const titleText = 'Ortopeda dziecięcy Skarżysko – prywatnie, bez skierowania';
  const descriptionText =
    'Ortopeda dziecięcy Skarżysko – konsultacje dla dzieci i niemowląt. Diagnostyka wad postawy i rozwoju układu ruchu, w tym USG bioderek.';
  const ogImage = '/section1_newpage.png';
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: titleText,
    description: descriptionText,
    url: `https://centrummedyczne7.pl${req.path}`,
  };
  const structuredData = `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`;
  renderWithSEO(res, titleText, descriptionText, ogImage, structuredData);
});

// SEO: inject visible pre-content for dynamic service pages
app.get('/uslugi/:slug', (req, res) => {
  const serviceTitle = humanizeSlug(req.params.slug);
  const titleText = `${serviceTitle} – Skarżysko-Kamienna | Centrum Medyczne 7`;
  const descriptionText = `Szczegóły usługi: ${serviceTitle}. Rejestracja i szybkie terminy w Centrum Medycznym 7 w Skarżysku-Kamiennej.`;
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: titleText,
    description: descriptionText,
    url: `https://centrummedyczne7.pl${req.path}`
  };
  const structuredData = `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`;
  renderWithSEO(res, titleText, descriptionText, null, structuredData);
});

// SEO: inject visible pre-content for dynamic doctor pages
app.get('/lekarze/:slug', (req, res) => {
  const name = humanizeSlug(req.params.slug);
  const titleText = `Lekarz ${name} – Skarżysko-Kamienna | CM7`;
  const descriptionText = `Profil lekarza ${name}. Umów wizytę w Centrum Medycznym 7 w Skarżysku-Kamiennej.`;
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: titleText,
    description: descriptionText,
    url: `https://centrummedyczne7.pl${req.path}`
  };
  const structuredData = `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`;
  renderWithSEO(res, titleText, descriptionText, null, structuredData);
});

// News/blog pages – fetch article data and inject proper metadata
app.get(['/aktualnosci/:slug', '/poradnik/:slug'], async (req, res) => {
  const slug = req.params.slug;
  const isNews = req.path.startsWith('/aktualnosci/');
  
  // Validate slug
  if (!slug || slug === 'undefined' || slug.trim() === '') {
    console.log(`❌ Invalid slug: "${slug}"`);
    const readable = humanizeSlug(slug);
    const titleText = isNews ? `${readable} | Aktualności – CM7` : `${readable} | Poradnik – CM7`;
    const descriptionText = isNews
      ? `Artykuł aktualności: ${readable}. Informacje z Centrum Medycznego 7.`
      : `Artykuł poradnikowy: ${readable}. Porady od specjalistów Centrum Medycznego 7.`;
    return renderWithSEO(res, titleText, descriptionText);
  }

  // Fetch article data from API
  const articleData = await fetchArticleData(slug, isNews);

  if (articleData && articleData.title) {
    // Use actual article data
    const titleText = articleData.title; // Use article title directly as per requirements
    const descriptionText = articleData.shortDescription || articleData.description || 
      (isNews 
        ? `Artykuł aktualności: ${articleData.title}. Informacje z Centrum Medycznego 7.`
        : `Artykuł poradnikowy: ${articleData.title}. Porady od specjalistów Centrum Medycznego 7.`);
    
    const ogImage = articleData.image || (isNews ? '/images/news.jpg' : '/images/blogs.jpg');
    
    // Generate Article Schema (JSON-LD)
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": isNews ? "NewsArticle" : "BlogPosting",
      "headline": articleData.title,
      "description": descriptionText,
      "image": {
        "@type": "ImageObject",
        "url": ogImage.startsWith('http') ? ogImage : `https://centrummedyczne7.pl${ogImage}`,
        "width": 800,
        "height": 600
      },
      "author": {
        "@type": "Person",
        "name": articleData.author || "Centrum Medyczne 7"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Centrum Medyczne 7",
        "url": "https://centrummedyczne7.pl",
        "logo": {
          "@type": "ImageObject",
          "url": "https://centrummedyczne7.pl/images/mainlogo.png",
          "width": 200,
          "height": 60
        }
      },
      "datePublished": articleData.date,
      "dateModified": articleData.updatedAt || articleData.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://centrummedyczne7.pl${req.path}`
      }
    };

    const structuredData = `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`;
    
    renderWithSEO(res, titleText, descriptionText, ogImage, structuredData);
  } else {
    // Fallback to slug-based metadata if API fails
    console.log(`⚠️ No article data found for slug: ${slug}, using fallback metadata`);
    const readable = humanizeSlug(slug);
    const titleText = isNews ? `${readable} | Aktualności – CM7` : `${readable} | Poradnik – CM7`;
    const descriptionText = isNews
      ? `Artykuł aktualności: ${readable}. Informacje z Centrum Medycznego 7.`
      : `Artykuł poradnikowy: ${readable}. Porady od specjalistów Centrum Medycznego 7.`;
    renderWithSEO(res, titleText, descriptionText, isNews ? '/images/news.jpg' : '/images/blogs.jpg');
  }
});

// SEO: Leczenie stopy cukrzycowej - custom meta for page source
app.get('/leczenie-stopy-cukrzycowej', (req, res) => {
  const titleText = 'Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko';
  const descriptionText = 'Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania.';
  const ogImage = '/assets/static-assets/section1-newpage.png';
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: titleText,
    description: descriptionText,
    url: `https://centrummedyczne7.pl${req.path}`
  };
  const structuredData = `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`;
  renderWithSEO(res, titleText, descriptionText, ogImage, structuredData);
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemap());
});

// Handle all other routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
}); 