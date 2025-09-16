import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Utility function to generate URL-friendly slugs
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Replace Polish characters
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
};

// Utility function to normalize URLs for canonical consistency
const normalizeUrl = (url) => {
  if (!url) return '';
  
  // Remove trailing slash except for root
  let normalized = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
  
  // Ensure lowercase for consistency
  normalized = normalized.toLowerCase();
  
  // Remove any query parameters for canonical URLs
  normalized = normalized.split('?')[0];
  
  // Remove any fragments
  normalized = normalized.split('#')[0];
  
  return normalized;
};
function removeTrailingSlash(url) {
  return url?.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
}

// API base URL - adjust this to your backend URL  
const API_BASE_URL = removeTrailingSlash('https://backend.centrummedyczne7.pl/');
// const API_BASE_URL = removeTrailingSlash('https://backend.centrummedyczne7.pl/');

console.log("API_BASE_URL", API_BASE_URL);
// Bot detection function
const isBot = (userAgent) => {
  if (!userAgent) return false;
  const botPatterns = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /rogerbot/i,
    /linkedinbot/i,
    /embedly/i,
    /quora link preview/i,
    /showyoubot/i,
    /outbrain/i,
    /pinterest/i,
    /developers.google.com\/\+\/web\/snippet/i,
    /slackbot/i,
    /vkshare/i,
    /w3c_validator/i,
    /redditbot/i,
    /applebot/i,
    /whatsapp/i,
    /flipboard/i,
    /tumblr/i,
    /bitlybot/i,
    /skypeuripreview/i,
    /nuzzel/i,
    /discordbot/i,
    /google page speed/i,
    /qwantify/i,
    /pinterestbot/i,
    /bitrix link preview/i,
    /xing-contenttabreceiver/i,
    /chrome-lighthouse/i,
    /telegrambot/i
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
};

// SEO HTML generator
const generateSEOHTML = async (path, dynamicData = null) => {
  const BASE_URL = 'https://centrummedyczne7.pl';
  console.log("BASE_URL", BASE_URL);
  console.log("path", path);
  
  let title, description, keywords, ogImage;
  
  switch (path) {
    case '/':
      title = 'CM7 – Przychodnia specjalistyczna Skarżysko-Kamienna';
      description = 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści. Umów wizytę w Centrum Medyczne 7.';
      keywords = 'centrum medyczne 7, przychodnia Skarżysko-Kamienna, lekarze specjaliści, wizyta lekarska, opieka medyczna, cm7';
      ogImage = '/images/mainlogo.png';
      break;
    case '/o-nas':
      title = 'O nas – Centrum Medyczne 7 Skarżysko-Kamienna | Kim jesteśmy';
      description = 'Poznaj Centrum Medyczne 7 w Skarżysku-Kamiennej. Nasza misja, wartości i zespół lekarzy, którym możesz zaufać.';
      keywords = 'o nas centrum medyczne 7, misja cm7, zespół lekarzy, wartości, Skarżysko-Kamienna';
      ogImage = '/images/abt_us.jpg';
      break;
    case '/lekarze':
      title = 'Nasi lekarze – Centrum Medyczne 7 Skarżysko-Kamienna | Zespół specjalistów';
      description = 'Poznaj lekarzy CM7 w Skarżysku-Kamiennej. Doświadczeni specjaliści w różnych dziedzinach medycyny – sprawdź nasz zespół.';
      keywords = 'lekarze centrum medyczne 7, specjaliści medycyny, zespół lekarzy, doktorzy Skarżysko-Kamienna';
      ogImage = '/images/doctors1.png';
      break;
    case '/uslugi':
      title = 'Usługi medyczne – Centrum Medyczne 7 Skarżysko-Kamienna';
      description = 'Konsultacja chirurgiczna | Konsultacja online | Konsultacja proktologiczna | Leczenie ran przewlekłych | Neurologia dziecięca';
      keywords = 'usługi medyczne, konsultacja chirurgiczna, konsultacja online, proktologia, neurologia dziecięca, leczenie ran';
      ogImage = '/images/uslugi.jpg';
      break;
    case '/aktualnosci':
      title = 'Aktualności – Centrum Medyczne 7 Skarżysko-Kamienna | Nowości i ogłoszenia';
      description = 'Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty.';
      keywords = 'aktualności centrum medyczne 7, ogłoszenia medyczne, nowości cm7, komunikaty, wydarzenia medyczne';
      ogImage = '/images/news.jpg';
      break;
    case '/poradnik':
      title = 'CM7 – Artykuły i porady zdrowotne | Poradnik medyczny';
      description = 'Sprawdzone porady zdrowotne i artykuły medyczne od specjalistów CM7 w Skarżysku-Kamiennej. Praktyczna wiedza i wskazówki dla pacjentów.';
      keywords = 'poradnik zdrowia, porady medyczne, artykuły medyczne, profilaktyka, zdrowie, centrum medyczne 7';
      ogImage = '/images/blogs.jpg';
      break;
    case '/kontakt':
      title = 'Kontakt – Centrum Medyczne 7 Skarżysko-Kamienna | Rejestracja i telefon';
      description = 'Zadzwoń: 797-097-487. Skontaktuj się z CM7 – telefon, e-mail, godziny otwarcia i rejestracja.';
      keywords = 'kontakt centrum medyczne 7, umów wizytę, telefon cm7, adres Skarżysko-Kamienna, godziny pracy';
      ogImage = '/images/contact.jpg';
      break;
    case '/regulamin':
      title = 'Regulamin – Centrum Medyczne 7 Skarżysko-Kamienna | Warunki świadczenia usług';
      description = 'Regulamin świadczenia usług medycznych w Centrum Medycznym 7 w Skarżysku-Kamiennej. Zapoznaj się z warunkami korzystania z naszych usług.';
      keywords = 'regulamin centrum medyczne 7, warunki usług medycznych, regulamin cm7, zasady korzystania z usług';
      ogImage = '/images/mainlogo.png';
      break;
    case '/polityka-prywatnosci':
      title = 'Polityka Prywatności – Centrum Medyczne 7 Skarżysko-Kamienna | Ochrona danych';
      description = 'Polityka ochrony danych osobowych w Centrum Medycznym 7 w Skarżysku-Kamiennej. Dowiedz się jak chronimy Twoje dane osobowe.';
      keywords = 'polityka prywatności centrum medyczne 7, ochrona danych osobowych, rodo cm7, prywatność pacjentów';
      ogImage = '/images/mainlogo.png';
      break;
    default:
      // Handle dynamic routes with real data
      if (path.startsWith('/aktualnosci/')) {
        console.log("dynamicData", dynamicData);
        if (dynamicData && dynamicData.title && dynamicData.shortDescription) {
          console.log("dynamicData", dynamicData);
          title = `${dynamicData.title} | Aktualności – Centrum Medyczne 7`;
          description = dynamicData?.shortDescription;
          keywords = `aktualności, centrum medyczne 7, news, ${dynamicData.title}`;
          ogImage = dynamicData.image || '/images/news.jpg';
        } else {
          title = 'Aktualność – Centrum Medyczne 7 Skarżysko-Kamienna';
          description = 'Bądź na bieżąco z informacjami w CM7.';
          keywords = 'aktualności, centrum medyczne 7, news, ogłoszenia';
          ogImage = '/images/news.jpg';
        }
      } else if (path.startsWith('/uslugi/')) {
        if (dynamicData && dynamicData.title && dynamicData.shortDescription) {
          title = `${dynamicData.title} – Centrum Medyczne 7 Skarżysko-Kamienna`;
          description = dynamicData?.shortDescription || dynamicData?.description;
          keywords = `usługi medyczne, centrum medyczne 7, ${dynamicData.title}`;
         // ogImage = (dynamicData.images && dynamicData.images[0]) || dynamicData.image || '/images/uslugi.jpg';
          
          // Handle images with proper null checks and empty array checks
          let serviceImage = '/images/uslugi.jpg'; // Default fallback
          if (dynamicData.images && Array.isArray(dynamicData.images) && dynamicData.images.length > 0) {
            // Use the first image from the array
            serviceImage = dynamicData.images[0];
          } else if (dynamicData.image) {
            // Fallback to single image field
            serviceImage = dynamicData.image;
          }
          
          // Check if the image URL is already absolute (starts with http/https)
          if (serviceImage && (serviceImage.startsWith('http://') || serviceImage.startsWith('https://'))) {
            ogImage = serviceImage; // Use the full URL as is
          } else {
            ogImage = serviceImage; // Will be prepended with BASE_URL later
          }
        } else {
          title = 'Usługa medyczna – Centrum Medyczne 7 Skarżysko-Kamienna';
          description = 'Szczegółowy opis usługi medycznej w Centrum Medycznym 7.';
          keywords = 'usługi medyczne, centrum medyczne 7';
          ogImage = '/images/uslugi.jpg';
        }
      } else if (path.startsWith('/poradnik/')) {
        if (dynamicData && dynamicData.title && dynamicData.shortDescription) {
          title = `${dynamicData.title} | Poradnik – Centrum Medyczne 7`;
          description = dynamicData?.shortDescription;
          keywords = `poradnik zdrowia, porady medyczne, ${dynamicData.title}`;
          ogImage = dynamicData.image || '/images/blogs.jpg';
        } else {
          title = 'Artykuł – CM7 Poradnik medyczny';
          description = 'Sprawdzone porady zdrowotne od specjalistów CM7.';
          keywords = 'poradnik zdrowia, porady medyczne, artykuły medyczne';
          ogImage = '/images/blogs.jpg';
        }
      } else if (path.startsWith('/lekarze/')) {
        // console.log("dynamicData",dynamicData.name& dynamicData.specializations);

        if (dynamicData.data && dynamicData.data.name && dynamicData.data.specializations) {
          const doctorName = `${dynamicData.data.name.first} ${dynamicData.data.name.last}`;
          const specializations = dynamicData.data.specializations.map(spec => spec.name).join(", ");
          const experience = dynamicData.data.experience ? `${dynamicData.data.experience} lat doświadczenia` : "";
          console.log("dynamicData", dynamicData);
          
          title = `${specializations} – ${doctorName} | CM7 Skarżysko-Kamienna`;

          const shortDescription = dynamicData.data.shortDescription || `Umów wizytę z ${doctorName}, ${specializations.toLowerCase()}${experience ? ` z ${experience}` : ""}. ${
            dynamicData.data.onlineConsultationPrice !== undefined 
              ? `Konsultacje online od ${dynamicData.data.onlineConsultationPrice} zł` 
              : "Konsultacje dostępne"
          } w Centrum Medycznym 7.`;
          description = shortDescription;
          keywords = `${doctorName}, ${specializations}, lekarz, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna`;
          ogImage = dynamicData.data.image || '/images/doctors1.png';
        } else {
          title = 'Lekarz – Centrum Medyczne 7 Skarżysko-Kamienna';
          description = 'Profil lekarza w Centrum Medycznym 7. Umów wizytę z doświadczonym specjalistą.';
          keywords = 'lekarz, centrum medyczne 7, wizyta lekarska, specjalista medyczny';
          ogImage = '/images/doctors1.png';
        }
      } else {
        title = 'Centrum Medyczne 7 Skarżysko-Kamienna';
        description = 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.';
        keywords = 'centrum medyczne, przychodnia, lekarze, Skarżysko-Kamienna';
        ogImage = '/images/mainlogo.png';
      }
  }

  // Normalize the path for consistent canonical URLs
  const normalizedPath = normalizeUrl(path);
  const canonicalUrl = `${BASE_URL}${normalizedPath}`;
  
  // Ensure canonical URL is always self-referencing and properly formatted
  const finalCanonicalUrl = canonicalUrl.replace(/\/$/, '') || BASE_URL;
  
  // Handle both absolute and relative image URLs
  const fullOgImage = ogImage && (ogImage.startsWith('http://') || ogImage.startsWith('https://')) 
    ? ogImage 
    : `${BASE_URL}${ogImage}`;

  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <!-- SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <link rel="canonical" href="${finalCanonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${finalCanonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${fullOgImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${finalCanonicalUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${fullOgImage}">
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="Centrum Medyczne 7">
    
    <!-- Favicon and Icons -->
    <link rel="icon" type="image/png" href="/images/fav_new.png">
    <link rel="apple-touch-icon" href="/images/fav_new.png">
    <link rel="shortcut icon" href="/images/fav_new.png">
    
    <!-- Google Analytics 4 - GDPR Compliant Loading -->
    <script>
        // Consent defaults - actual GA loading happens after user consent via CookieConsentContext
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
        });
    </script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "name": "Centrum Medyczne 7",
      "url": "${BASE_URL}",
      "logo": "${BASE_URL}/images/mainlogo.png",
      "description": "${description}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Skarżysko-Kamienna",
        "addressCountry": "PL"
      },
      "telephone": "797-097-487"
    }
    </script>
    
    <!-- React App CSS and JS will be injected here -->
    <link rel="stylesheet" crossorigin href="/assets/index-6FqhkFEx.css">
</head>
<body>
    <!-- SEO Content for crawlers -->
    <div style="display: none;">
        <h1>${title}</h1>
        <p>${description}</p>
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    <!-- React App JavaScript -->
    <script type="module" crossorigin src="/assets/index-DadWpkNG.js"></script>
    
    <noscript>
        <p>Ta strona wymaga JavaScript do pełnej funkcjonalności.</p>
    </noscript>
</body>
</html>`;
};

// Function to fetch dynamic data
const fetchDynamicData = async (path) => {
  try {
    let slug, endpoint;
    
    if (path.startsWith('/aktualnosci/')) {
      slug = path.replace('/aktualnosci/', '');
      
      // Validate slug before making API call
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        console.log(`❌ Invalid slug for aktualnosci: "${slug}"`);
        return null;
      }
      
      endpoint = `${API_BASE_URL}/news/slug/${slug}`;
    } else if (path.startsWith('/poradnik/')) {
      slug = path.replace('/poradnik/', '');
      
      // Validate slug before making API call  
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        console.log(`❌ Invalid slug for poradnik: "${slug}"`);
        return null;
      }
      
      endpoint = `${API_BASE_URL}/blogs/slug/${slug}`;
    } else if (path.startsWith('/uslugi/')) {
      slug = path.replace('/uslugi/', '');
      
      // Validate slug before making API call
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        console.log(`❌ Invalid slug for uslugi: "${slug}"`);
        return null;
      }
      
      endpoint = `${API_BASE_URL}/services/slug/${slug}`;
    } else if (path.startsWith('/lekarze/')) {
      slug = path.replace('/lekarze/', '');
      
      // Validate slug before making API call
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        console.log(`❌ Invalid slug for lekarze: "${slug}"`);
        return null;
      }
      
      endpoint = `${API_BASE_URL}/docs/profile/slug/${slug}`;
    } else {
      return null;
    }
    
    console.log(`📡 Fetching data from: ${endpoint}`);
    const response = await axios.get(endpoint, { timeout: 3000 });
    console.log(`✅ Data fetched successfully for slug: ${slug}`);
    return response.data;
  } catch (error) {
    console.log(`❌ Failed to fetch data for ${path}:`, error.message);
    return null;
  }
};

// Middleware to handle tel: and mailto: URLs that shouldn't be treated as internal routes
const handleExternalProtocols = (req, res, next) => {
  const path = req.path;
  
  // Check if the path starts with tel: or mailto: protocols
  if (path.startsWith('/tel:') || path.startsWith('/mailto:')) {
    console.log(`🚫 Blocking external protocol URL: ${path}`);
    // Return 404 for these URLs as they shouldn't be accessible via HTTP
    return res.status(404).json({ 
      error: 'Not Found',
      message: 'External protocol URLs are not valid HTTP endpoints',
      path: path
    });
  }
  
  // Also handle malformed URLs that might include these protocols
  if (path.includes('tel:') || path.includes('mailto:')) {
    console.log(`🚫 Blocking malformed URL containing external protocol: ${path}`);
    return res.status(404).json({ 
      error: 'Not Found',
      message: 'Malformed URL containing external protocol',
      path: path
    });
  }
  
  next();
};

// Middleware to handle invalid/undefined slugs and trailing slashes
const handleInvalidSlugs = (req, res, next) => {
  const path = req.path;
  
  // Check for undefined slugs in URLs
  if (path === '/aktualnosci/undefined' || 
      path === '/poradnik/undefined' || 
      path === '/uslugi/undefined' ||
      path === '/lekarze/undefined') {
    console.log(`🚫 Redirecting invalid URL: ${path}`);
    return res.redirect(301, path.startsWith('/aktualnosci/') ? '/aktualnosci' : 
                           path.startsWith('/poradnik/') ? '/poradnik' : 
                           path.startsWith('/uslugi/') ? '/uslugi' : '/lekarze');
  }
  
  // Check for empty slugs (trailing slash after section)
  if (path.endsWith('/aktualnosci/') || 
      path.endsWith('/poradnik/') || 
      path.endsWith('/uslugi/') ||
      path.endsWith('/lekarze/')) {
    const redirectTo = path.slice(0, -1); // Remove trailing slash
    console.log(`🚫 Redirecting trailing slash URL: ${path} -> ${redirectTo}`);
    return res.redirect(301, redirectTo);
  }
  
  next();
};

// Middleware to handle trailing slashes for dynamic service pages
const handleServiceTrailingSlash = (req, res, next) => {
  const path = req.path;
  
  // Handle trailing slashes for service pages specifically
  if (path.startsWith('/uslugi/') && path.endsWith('/') && path.length > '/uslugi/'.length) {
    const redirectTo = path.slice(0, -1); // Remove trailing slash
    console.log(`🔄 Redirecting service trailing slash: ${path} -> ${redirectTo}`);
    return res.redirect(301, redirectTo);
  }
  
  // Handle trailing slashes for other dynamic pages
  if ((path.startsWith('/aktualnosci/') || path.startsWith('/poradnik/') || path.startsWith('/lekarze/')) && 
      path.endsWith('/') && path.length > 8) {
    const redirectTo = path.slice(0, -1); // Remove trailing slash
    console.log(`🔄 Redirecting dynamic page trailing slash: ${path} -> ${redirectTo}`);
    return res.redirect(301, redirectTo);
  }
  
  next();
};

// Middleware to handle case sensitivity and URL normalization
const handleUrlNormalization = (req, res, next) => {
  const path = req.path;
  const normalizedPath = normalizeUrl(path);
  
  // If the path was normalized (changed), redirect to the normalized version
  if (path !== normalizedPath) {
    console.log(`🔄 Redirecting to normalized URL: ${path} -> ${normalizedPath}`);
    return res.redirect(301, normalizedPath);
  }
  
  next();
};

// SEO Middleware - Return SEO HTML for EVERYONE (bots and users)
const seoMiddleware = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;
  
  console.log(`📄 Serving SEO HTML for: ${userAgent.substring(0, 50)}...`);
  console.log(`🔗 Route: ${path}`);
  
  // Fetch dynamic data for dynamic routes
  let dynamicData = null;
  if (path.startsWith('/aktualnosci/') || path.startsWith('/poradnik/') || path.startsWith('/uslugi/') || path.startsWith('/lekarze/')) {
    dynamicData = await fetchDynamicData(path);
  }
  
  const seoHTML = await generateSEOHTML(path, dynamicData);
  return res.send(seoHTML);
};

// Dynamic sitemap generator
const generateDynamicSitemap = async () => {
  const BASE_URL = 'https://centrummedyczne7.pl';
  const now = new Date().toISOString();
  
  // Static routes
  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/o-nas', priority: '0.8', changefreq: 'monthly' },
    { url: '/lekarze', priority: '0.8', changefreq: 'weekly' },
    { url: '/uslugi', priority: '0.8', changefreq: 'weekly' },
    { url: '/aktualnosci', priority: '0.8', changefreq: 'daily' },
    { url: '/poradnik', priority: '0.8', changefreq: 'weekly' },
    { url: '/kontakt', priority: '0.7', changefreq: 'monthly' },
    { url: '/regulamin', priority: '0.6', changefreq: 'monthly' },
    { url: '/polityka-prywatnosci', priority: '0.6', changefreq: 'monthly' }
  ];
  
  let dynamicRoutes = [];
  
  try {
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
    
    // Fetch news articles
    try {
      console.log('📰 Fetching news for sitemap...');
      const newsResponse = await axios.get(`${API_BASE_URL}/news`, { timeout: 5000 });
      const newsItems = newsResponse.data || [];
      
      const validNewsUrls = newsItems
        .filter(item => isValidSlug(item.slug))
        .map(item => ({
          url: `/aktualnosci/${item.slug}`,
          lastmod: item.updatedAt || item.date || now,
          priority: '0.6',
          changefreq: 'monthly'
        }));
      
      dynamicRoutes = [...dynamicRoutes, ...validNewsUrls];
      console.log(`✅ Added ${validNewsUrls.length} news articles to sitemap`);
    } catch (newsError) {
      console.log('⚠️ Could not fetch news for sitemap:', newsError.message);
    }
    
    // Fetch blog articles
    try {
      console.log('📝 Fetching blog articles for sitemap...');
      const blogResponse = await axios.get(`${API_BASE_URL}/blogs`, { timeout: 5000 });
      const blogItems = blogResponse.data || [];
      
      const validBlogUrls = blogItems
        .filter(item => isValidSlug(item.slug))
        .map(item => ({
          url: `/poradnik/${item.slug}`,
          lastmod: item.updatedAt || item.date || now,
          priority: '0.6',
          changefreq: 'monthly'
        }));
      
      dynamicRoutes = [...dynamicRoutes, ...validBlogUrls];
      console.log(`✅ Added ${validBlogUrls.length} blog articles to sitemap`);
    } catch (blogError) {
      console.log('⚠️ Could not fetch blogs for sitemap:', blogError.message);
    }
    
    // Fetch services if available
    try {
      console.log('🏥 Fetching services for sitemap...');
      const servicesResponse = await axios.get(`${API_BASE_URL}/services`, { timeout: 5000 });
      const serviceItems = servicesResponse.data || [];
      
      const validServiceUrls = serviceItems
        .filter(item => isValidSlug(item.slug))
        .map(item => ({
          url: `/uslugi/${item.slug}`,
          lastmod: item.updatedAt || item.date || now,
          priority: '0.7',
          changefreq: 'monthly'
        }));
      
      dynamicRoutes = [...dynamicRoutes, ...validServiceUrls];
      console.log(`✅ Added ${validServiceUrls.length} services to sitemap`);
    } catch (serviceError) {
      console.log('⚠️ Could not fetch services for sitemap:', serviceError.message);
    }
    
    // Fetch doctor profiles - Enhanced with better debugging and structure handling
    try {
      console.log('👨‍⚕️ Fetching doctor profiles for sitemap from:', `${API_BASE_URL}/docs`);
      const doctorsResponse = await axios.get(`${API_BASE_URL}/docs`, { timeout: 5000 });
      
      console.log('👨‍⚕️ Doctors API Response status:', doctorsResponse.status);
      console.log('👨‍⚕️ Doctors API Response structure:', {
        hasData: !!doctorsResponse.data,
        dataType: typeof doctorsResponse.data,
        isArray: Array.isArray(doctorsResponse.data),
        hasDataProperty: !!doctorsResponse.data?.data,
        dataDataType: typeof doctorsResponse.data?.data,
        isDataArray: Array.isArray(doctorsResponse.data?.data),
        sampleKeys: doctorsResponse.data ? Object.keys(doctorsResponse.data).slice(0, 5) : []
      });
      
             // Handle different response structures
       let doctorItems = [];
       if (Array.isArray(doctorsResponse.data)) {
         // Direct array response
         doctorItems = doctorsResponse.data;
       } else if (doctorsResponse.data?.data && Array.isArray(doctorsResponse.data.data)) {
         // Nested data structure
         doctorItems = doctorsResponse.data.data;
       } else if (doctorsResponse.data?.docs && Array.isArray(doctorsResponse.data.docs)) {
         // docs array structure
         doctorItems = doctorsResponse.data.docs;
       } else if (doctorsResponse.data?.doctors && Array.isArray(doctorsResponse.data.doctors)) {
         // doctors array structure (actual API response)
         doctorItems = doctorsResponse.data.doctors;
       } else {
         console.log('⚠️ Unexpected doctors API response structure');
         doctorItems = [];
       }
      
      console.log(`👨‍⚕️ Found ${doctorItems.length} doctor items`);
      
             if (doctorItems.length > 0) {
         console.log('👨‍⚕️ Sample doctor item structure:', {
           hasSlug: !!doctorItems[0].slug,
           hasName: !!doctorItems[0].name,
           hasUpdatedAt: !!doctorItems[0].updatedAt,
           keys: Object.keys(doctorItems[0]).slice(0, 10)
         });
       }
       
       const validDoctorUrls = doctorItems
         .filter(item => {
           // Check if doctor has a name to generate slug from
           const hasName = item.name && item.name.trim();
           if (!hasName) {
             console.log('👨‍⚕️ Skipping doctor without name:', {
               id: item._id || item.id,
               name: item.name
             });
             return false;
           }
           return true;
         })
         .map(item => {
           // Generate slug from doctor name if not present
           let doctorSlug = item.slug;
           if (!doctorSlug) {
             doctorSlug = generateSlug(item.name);
             console.log(`👨‍⚕️ Generated slug for ${item.name}: ${doctorSlug}`);
           }
           
           // Validate generated/existing slug
           if (!doctorSlug || !isValidSlug(doctorSlug)) {
             console.log('👨‍⚕️ Invalid slug generated for doctor:', {
               name: item.name,
               generatedSlug: doctorSlug,
               id: item._id || item.id
             });
             return null;
           }
           
           const doctorUrl = {
             url: `/lekarze/${doctorSlug}`,
             lastmod: item.updatedAt || item.createdAt || now,
             priority: '0.8',
             changefreq: 'monthly'
           };
           console.log('👨‍⚕️ Adding doctor to sitemap:', doctorUrl.url);
           return doctorUrl;
         })
         .filter(Boolean); // Remove null entries
      
      dynamicRoutes = [...dynamicRoutes, ...validDoctorUrls];
      console.log(`✅ Added ${validDoctorUrls.length} doctor profiles to sitemap`);
      
             if (validDoctorUrls.length === 0 && doctorItems.length > 0) {
         console.log('⚠️ Warning: Found doctors but none could generate valid URLs. Doctor items:', 
           doctorItems.map(item => ({
             name: item.name,
             existingSlug: item.slug,
             generatedSlug: item.name ? generateSlug(item.name) : 'no-name',
             id: item._id || item.id
           }))
         );
       }
      
    } catch (doctorError) {
      console.error('❌ Error fetching doctor profiles for sitemap:');
      console.error('Error message:', doctorError.message);
      console.error('Error response status:', doctorError.response?.status);
      console.error('Error response data:', doctorError.response?.data);
      console.error('Request URL:', doctorError.config?.url);
    }
    
  } catch (error) {
    console.error('❌ Error generating dynamic sitemap content:', error.message);
    // Continue with static routes only
  }
  
  // Combine all routes
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  
  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod ? new Date(route.lastmod).toISOString() : now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  console.log(`📋 Generated sitemap with ${allRoutes.length} URLs (${staticRoutes.length} static + ${dynamicRoutes.length} dynamic)`);
  return sitemap;
};

// Dynamic sitemap endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    console.log('🗺️ Generating dynamic sitemap...');
    const sitemap = await generateDynamicSitemap();
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    
    // Fallback to static sitemap if dynamic generation fails
    try {
      const staticSitemap = fs.readFileSync(path.join(__dirname, 'public', 'sitemap.xml'), 'utf8');
      res.set('Content-Type', 'application/xml');
      res.send(staticSitemap);
    } catch (fallbackError) {
      console.error('❌ Could not serve fallback sitemap:', fallbackError);
      res.status(500).json({ error: 'Could not generate sitemap' });
    }
  }
});

// Apply middleware in correct order
app.use(handleExternalProtocols);     // First: block external protocols
app.use(handleInvalidSlugs);          // Second: handle undefined slugs
    // Fourth: handle URL normalization and case sensitivity

// Serve static assets (CSS, JS, images, PDFs) BEFORE SEO middleware
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));
app.use('/images', express.static(path.join(__dirname, 'dist', 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Apply SEO middleware for HTML routes only (not for static files)
app.get('*', (req, res, next) => {
  // Skip SEO middleware for static files and assets
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|pdf|xml|txt)$/) || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/images/') || 
      req.path.startsWith('/public/')) {
    return next();
  }
  
  // Apply SEO middleware for HTML routes
  return seoMiddleware(req, res, next);
});

// Serve static files from public directory AFTER SEO middleware (fallback)
app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 SEO middleware active for bots`);
  console.log(`📱 React SPA served for regular users`);
}); 