import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
function removeTrailingSlash(url) {
  return url?.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
}

// API base URL - adjust this to your backend URL  
const API_BASE_URL = removeTrailingSlash('http://localhost:5000/');

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
          ogImage = (dynamicData.images && dynamicData.images[0]) || dynamicData.image || '/images/uslugi.jpg';
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
      } else {
        title = 'Centrum Medyczne 7 Skarżysko-Kamienna';
        description = 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.';
        keywords = 'centrum medyczne, przychodnia, lekarze, Skarżysko-Kamienna';
        ogImage = '/images/mainlogo.png';
      }
  }

  const canonicalUrl = `${BASE_URL}${path}`;
  const fullOgImage = `${BASE_URL}${ogImage}`;

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
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${fullOgImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
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
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RP3DKDVE2M"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        // Initial load without consent
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
        });
        gtag('config', 'G-YOUR_GA4_ID', {
            'anonymize_ip': true
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
    <link rel="stylesheet" crossorigin href="/assets/index-BNdLKOyk.css">
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
    <script type="module" crossorigin src="/assets/index-CQZA0G47.js"></script>
    
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
      endpoint = `${API_BASE_URL}/news/slug/${slug}`;
    } else if (path.startsWith('/poradnik/')) {
      slug = path.replace('/poradnik/', '');
      endpoint = `${API_BASE_URL}/blogs/slug/${slug}`;
    } else if (path.startsWith('/uslugi/')) {
      slug = path.replace('/uslugi/', '');
      endpoint = `${API_BASE_URL}/services/slug/${slug}`;
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

// SEO Middleware - Return SEO HTML for EVERYONE (bots and users)
const seoMiddleware = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;
  
  console.log(`📄 Serving SEO HTML for: ${userAgent.substring(0, 50)}...`);
  console.log(`🔗 Route: ${path}`);
  
  // Fetch dynamic data for dynamic routes
  let dynamicData = null;
  if (path.startsWith('/aktualnosci/') || path.startsWith('/poradnik/') || path.startsWith('/uslugi/')) {
    dynamicData = await fetchDynamicData(path);
  }
  
  const seoHTML = await generateSEOHTML(path, dynamicData);
  return res.send(seoHTML);
};

// Serve static assets (CSS, JS, images) but not HTML files
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));
app.use('/images', express.static(path.join(__dirname, 'dist', 'images')));

// Apply SEO middleware for ALL routes (HTML requests)
app.get('*', seoMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 SEO middleware active for bots`);
  console.log(`📱 React SPA served for regular users`);
}); 