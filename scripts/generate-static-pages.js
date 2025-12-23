import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'https://backend.centrummedyczne7.pl';
const BASE_URL = 'https://centrummedyczne7.pl';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Utility function to generate URL-friendly slugs (matches server.js)
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

// Find actual asset filenames from dist/assets
const findAssetFilenames = () => {
  const assetsPath = path.join(DIST_DIR, 'assets');
  
  if (!fs.existsSync(assetsPath)) {
    return { cssFile: null, jsFile: null };
  }
  
  const files = fs.readdirSync(assetsPath);
  const cssFile = files.find(file => file.endsWith('.css') && file.startsWith('index-'));
  const jsFile = files.find(file => file.endsWith('.js') && file.startsWith('index-') && !file.includes('.map'));
  
  return { cssFile, jsFile };
};

// Generate static HTML for an article/blog
const generateArticleHTML = (item, slug, type, cssFile, jsFile) => {
  const isNews = type === 'aktualnosci';
  const isBlog = type === 'poradnik';
  
  // Title format: article title | Category – Centrum Medyczne 7
  const title = isNews 
    ? `${item.title} | Aktualności – Centrum Medyczne 7`
    : `${item.title} | Poradnik – Centrum Medyczne 7`;
  
  const description = item.shortDescription || item.description || '';
  const keywords = isNews
    ? `aktualności, centrum medyczne 7, news, ${item.title}`
    : `poradnik zdrowia, porady medyczne, ${item.title}`;
  
  const canonicalUrl = `${BASE_URL}/${type}/${slug}`;
  const ogImage = (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) 
    ? item.image 
    : `${BASE_URL}${item.image || (isNews ? '/images/news.jpg' : '/images/blogs.jpg')}`;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": description,
    "image": ogImage,
    "datePublished": item.date || item.createdAt,
    "dateModified": item.updatedAt || item.date || item.createdAt,
    "author": {
      "@type": "Organization",
      "name": "Centrum Medyczne 7"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Centrum Medyczne 7",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/images/mainlogo.png`
      }
    }
  };
  
  // Generate HTML content
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
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(item.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${escapeHtml(item.title)}">
    <meta property="twitter:description" content="${escapeHtml(description)}">
    <meta property="twitter:image" content="${ogImage}">
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="Centrum Medyczne 7">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/images/fav_new.png">
    <link rel="apple-touch-icon" href="/images/fav_new.png">
    <link rel="shortcut icon" href="/images/fav_new.png">
    
    <!-- Google Analytics 4 -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
        });
    </script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    
    ${cssFile ? `<!-- React App CSS -->\n    <link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : ''}
</head>
<body>
    <!-- SEO Content for crawlers (visible content) -->
    <div id="seo-content" style="visibility: hidden; position: absolute; width: 1px; height: 1px; overflow: hidden;">
        <h1>${escapeHtml(item.title)}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        ${item.content ? `<div>${escapeHtml(item.content.substring(0, 500))}...</div>` : ''}
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    ${jsFile ? `<!-- React App JavaScript -->\n    <script type="module" crossorigin src="/assets/${jsFile}"></script>` : '<!-- React App will load dynamically -->'}
    
    <noscript>
        <p>Ta strona wymaga JavaScript do pełnej funkcjonalności.</p>
    </noscript>
</body>
</html>`;
  
  return { slug, html };
};

// Generate static HTML for a service
const generateServiceHTML = (service, slug, cssFile, jsFile) => {
  // Title format: service title – Centrum Medyczne 7 Skarżysko-Kamienna
  const title = `${service.title} – Centrum Medyczne 7 Skarżysko-Kamienna`;
  
  const description = service.shortDescription || service.description || '';
  const keywords = `usługi medyczne, centrum medyczne 7, ${service.title}`;
  
  const canonicalUrl = `${BASE_URL}/uslugi/${slug}`;
  
  // Handle images - check for array first, then single image
  let serviceImage = '/images/uslugi.jpg';
  if (service.images && Array.isArray(service.images) && service.images.length > 0) {
    serviceImage = service.images[0];
  } else if (service.image) {
    serviceImage = service.image;
  }
  
  const ogImage = (serviceImage && (serviceImage.startsWith('http://') || serviceImage.startsWith('https://'))) 
    ? serviceImage 
    : `${BASE_URL}${serviceImage}`;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalService",
    "name": service.title,
    "description": description,
    "provider": {
      "@type": "MedicalOrganization",
      "name": "Centrum Medyczne 7",
      "url": BASE_URL,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Skarżysko-Kamienna",
        "addressCountry": "PL"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "Skarżysko-Kamienna"
    },
    "image": ogImage
  };
  
  // Generate HTML content
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
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(service.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${escapeHtml(service.title)}">
    <meta property="twitter:description" content="${escapeHtml(description)}">
    <meta property="twitter:image" content="${ogImage}">
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="Centrum Medyczne 7">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/images/fav_new.png">
    <link rel="apple-touch-icon" href="/images/fav_new.png">
    <link rel="shortcut icon" href="/images/fav_new.png">
    
    <!-- Google Analytics 4 -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
        });
    </script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    
    ${cssFile ? `<!-- React App CSS -->\n    <link rel="stylesheet" crossorigin href="/assets/${cssFile}">` : ''}
</head>
<body>
    <!-- SEO Content for crawlers (visible content) -->
    <div id="seo-content" style="visibility: hidden; position: absolute; width: 1px; height: 1px; overflow: hidden;">
        <h1>${escapeHtml(service.title)}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        ${service.description ? `<div>${escapeHtml(service.description.substring(0, 500))}...</div>` : ''}
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    ${jsFile ? `<!-- React App JavaScript -->\n    <script type="module" crossorigin src="/assets/${jsFile}"></script>` : '<!-- React App will load dynamically -->'}
    
    <noscript>
        <p>Ta strona wymaga JavaScript do pełnej funkcjonalności.</p>
    </noscript>
</body>
</html>`;
  
  return { slug, html };
};

// Helper function to validate slug
const isValidSlug = (slug) => {
  return slug && 
         slug.trim() !== '' && 
         slug !== 'undefined' && 
         slug !== 'null' &&
         !slug.includes('undefined') &&
         !slug.includes('tel:') &&
         !slug.includes('mailto:');
};

// Fetch all items from API
const fetchAllItems = async (endpoint, type) => {
  try {
    console.log(`📡 Fetching ${type} from: ${endpoint}`);
    const response = await axios.get(endpoint, { timeout: 10000 });
    
    let items = [];
    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      items = response.data.data;
    } else if (response.data?.articles && Array.isArray(response.data.articles)) {
      items = response.data.articles;
    } else if (response.data?.news && Array.isArray(response.data.news)) {
      items = response.data.news;
    } else if (response.data?.blogs && Array.isArray(response.data.blogs)) {
      items = response.data.blogs;
    } else if (response.data?.services && Array.isArray(response.data.services)) {
      items = response.data.services;
    }
    
    console.log(`✅ Found ${items.length} ${type} items`);
    return items;
  } catch (error) {
    console.log(`❌ Failed to fetch ${type}: ${error.message}`);
    return [];
  }
};

// Main function
const generateStaticPages = async () => {
  try {
    console.log('🚀 Starting static pages generation...');
    console.log(`📁 Output directory: ${DIST_DIR}`);
    console.log(`🔗 API Base URL: ${API_BASE_URL}`);
    
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    // Find actual asset filenames
    const { cssFile, jsFile } = findAssetFilenames();
    if (cssFile && jsFile) {
      console.log(`✅ Found assets: ${cssFile}, ${jsFile}\n`);
    } else {
      console.warn('⚠️  Warning: Could not find CSS/JS assets. Static pages will work but assets may not load correctly.\n');
    }
    
    const results = {
      articles: { total: 0, generated: 0, skipped: 0 },
      blogs: { total: 0, generated: 0, skipped: 0 },
      services: { total: 0, generated: 0, skipped: 0 }
    };
    
    // 1. Generate Articles (aktualnosci)
    console.log('📰 Generating articles (aktualnosci)...');
    const articlesDir = path.join(DIST_DIR, 'aktualnosci');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    const articles = await fetchAllItems(`${API_BASE_URL}/news`, 'articles');
    results.articles.total = articles.length;
    
    const articleSlugs = [];
    for (const article of articles) {
      if (!isValidSlug(article.slug)) {
        results.articles.skipped++;
        continue;
      }
      
      try {
        const { slug, html } = generateArticleHTML(article, article.slug, 'aktualnosci', cssFile, jsFile);
        const filePath = path.join(articlesDir, `${slug}.html`);
        fs.writeFileSync(filePath, html, 'utf8');
        articleSlugs.push(slug);
        results.articles.generated++;
      } catch (error) {
        console.error(`❌ Error generating page for article:`, error.message);
        results.articles.skipped++;
      }
    }
    
    // Save index
    fs.writeFileSync(
      path.join(articlesDir, 'index.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), count: articleSlugs.length, slugs: articleSlugs }, null, 2),
      'utf8'
    );
    console.log(`✅ Generated ${results.articles.generated} article pages\n`);
    
    // 2. Generate Blogs (poradnik)
    console.log('📝 Generating blogs (poradnik)...');
    const blogsDir = path.join(DIST_DIR, 'poradnik');
    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true });
    }
    
    const blogs = await fetchAllItems(`${API_BASE_URL}/blogs`, 'blogs');
    
    results.blogs.total = blogs.length;
    
    const blogSlugs = [];
    for (const blog of blogs) {
      if (!isValidSlug(blog.slug)) {
        results.blogs.skipped++;
        continue;
      }
      
      try {
        const { slug, html } = generateArticleHTML(blog, blog.slug, 'poradnik', cssFile, jsFile);
        const filePath = path.join(blogsDir, `${slug}.html`);
        fs.writeFileSync(filePath, html, 'utf8');
        blogSlugs.push(slug);
        results.blogs.generated++;
      } catch (error) {
        console.error(`❌ Error generating page for blog:`, error.message);
        results.blogs.skipped++;
      }
    }
    
    // Save index
    fs.writeFileSync(
      path.join(blogsDir, 'index.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), count: blogSlugs.length, slugs: blogSlugs }, null, 2),
      'utf8'
    );
    console.log(`✅ Generated ${results.blogs.generated} blog pages\n`);
    
    // 3. Generate Services (uslugi)
    console.log('🏥 Generating services (uslugi)...');
    const servicesDir = path.join(DIST_DIR, 'uslugi');
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
    }
    
    const services = await fetchAllItems(`${API_BASE_URL}/services`, 'services');
    results.services.total = services.length;
    
    const serviceSlugs = [];
    for (const service of services) {
      if (!isValidSlug(service.slug)) {
        results.services.skipped++;
        continue;
      }
      
      try {
        const { slug, html } = generateServiceHTML(service, service.slug, cssFile, jsFile);
        const filePath = path.join(servicesDir, `${slug}.html`);
        fs.writeFileSync(filePath, html, 'utf8');
        serviceSlugs.push(slug);
        results.services.generated++;
      } catch (error) {
        console.error(`❌ Error generating page for service:`, error.message);
        results.services.skipped++;
      }
    }
    
    // Save index
    fs.writeFileSync(
      path.join(servicesDir, 'index.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), count: serviceSlugs.length, slugs: serviceSlugs }, null, 2),
      'utf8'
    );
    console.log(`✅ Generated ${results.services.generated} service pages\n`);
    
    // Summary
    console.log('📊 Generation Summary:');
    console.log(`   Articles: ${results.articles.generated}/${results.articles.total} generated (${results.articles.skipped} skipped)`);
    console.log(`   Blogs: ${results.blogs.generated}/${results.blogs.total} generated (${results.blogs.skipped} skipped)`);
    console.log(`   Services: ${results.services.generated}/${results.services.total} generated (${results.services.skipped} skipped)`);
    console.log(`\n🎉 Static pages generation completed!`);
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
    process.exit(1);
  }
};

// Run if called directly
const filePath = fileURLToPath(import.meta.url);
const runPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (filePath === runPath || runPath.includes('generate-static-pages')) {
  generateStaticPages();
}

export default generateStaticPages;


