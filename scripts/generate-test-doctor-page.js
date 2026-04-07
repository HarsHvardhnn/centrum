import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'https://backend.centrummedyczne7.pl';
const BASE_URL = 'https://centrummedyczne7.pl';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Utility function to escape HTML
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

// Generate static HTML for a doctor
const generateDoctorHTML = (doctor, slug, cssFile, jsFile) => {
  const doctorName = `${doctor.name?.first || ''} ${doctor.name?.last || ''}`.trim();
  const specializations = doctor.specializations
    ?.map(spec => spec && spec.name ? spec.name : '')
    .filter(name => name)
    .join(", ") || 'Lekarz';
  
  const experience = doctor.experience ? `${doctor.experience} lat doświadczenia` : "";
  
  // Meta title format: {specialization} – Skarżysko-Kamienna | CM7
  const title = `${specializations} – Skarżysko-Kamienna | CM7`;
  
  // Meta description
  const description = doctor.shortDescription || 
    `Umów wizytę z ${doctorName}${specializations ? `, ${specializations.toLowerCase()}` : ''}${experience ? ` z ${experience}` : ""}. ${
      doctor.onlineConsultationPrice !== undefined 
        ? `Konsultacje online od ${doctor.onlineConsultationPrice} zł` 
        : "Konsultacje dostępne"
    } w Centrum Medycznym 7.`;
  
  const keywords = `${doctorName}, ${specializations}, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna`;
  
  const canonicalUrl = `${BASE_URL}/lekarze/${slug}`;
  const ogImage = (doctor.image && (doctor.image.startsWith('http://') || doctor.image.startsWith('https://'))) 
    ? doctor.image 
    : `${BASE_URL}${doctor.image || '/images/doctors1.png'}`;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": doctorName,
    "jobTitle": specializations,
    "worksFor": {
      "@type": "MedicalOrganization",
      "name": "Centrum Medyczne 7",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Powstańców Warszawy 7/1.5",
        "postalCode": "26-110",
        "addressLocality": "Skarżysko-Kamienna",
        "addressCountry": "PL"
      },
      "telephone": "797-097-487"
    },
    "medicalSpecialty": doctor.specializations?.map(spec => spec.name) || [],
    "image": ogImage,
    "description": description,
    "url": canonicalUrl,
    "offers": []
  };
  
  if (doctor.onlineConsultationPrice !== undefined) {
    structuredData.offers.push({
      "@type": "Offer",
      "name": "Konsultacja online",
      "price": doctor.onlineConsultationPrice,
      "priceCurrency": "PLN"
    });
  }
  
  if (doctor.offlineConsultationPrice !== undefined) {
    structuredData.offers.push({
      "@type": "Offer",
      "name": "Konsultacja stacjonarna",
      "price": doctor.offlineConsultationPrice,
      "priceCurrency": "PLN"
    });
  }
  
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
    <meta property="og:type" content="profile">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${escapeHtml(title)}">
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
        <h1>${escapeHtml(doctorName)}</h1>
        <h2>${escapeHtml(specializations)}</h2>
        ${experience ? `<p>Doświadczenie: ${escapeHtml(experience)}</p>` : ''}
        ${doctor.bio ? `<div>${escapeHtml(doctor.bio)}</div>` : ''}
        ${doctor.education ? `<div><strong>Wykształcenie:</strong> ${escapeHtml(doctor.education)}</div>` : ''}
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    ${jsFile ? `<!-- React App JavaScript -->\n    <script type="module" crossorigin src="/assets/${jsFile}"></script>` : '<!-- React App will load dynamically -->'}
    
    <noscript>
        <p>Ta strona wymaga JavaScript do pełnej funkcjonalności.</p>
    </noscript>
</body>
</html>`;
  
  return html;
};

// Main function to generate a test page
const generateTestDoctorPage = async () => {
  try {
    console.log('🧪 Generating test static doctor page...');
    console.log(`🔗 API Base URL: ${API_BASE_URL}`);
    
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    // Create lekarze directory
    const lekarzeDir = path.join(DIST_DIR, 'lekarze');
    if (!fs.existsSync(lekarzeDir)) {
      fs.mkdirSync(lekarzeDir, { recursive: true });
    }
    
    // Try to fetch first doctor from API
    const endpoints = [
      `${API_BASE_URL}/docs`,
      `${API_BASE_URL}/doctors`,
      `${API_BASE_URL}/doctor`
    ];
    
    let doctor = null;
    let slug = 'test-doctor';
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${endpoint}`);
        const response = await axios.get(endpoint, { timeout: 10000 });
        
        // Handle different response structures
        let doctors = [];
        if (Array.isArray(response.data)) {
          doctors = response.data;
        } else if (response.data?.doctors && Array.isArray(response.data.doctors)) {
          doctors = response.data.doctors;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          doctors = response.data.data;
        }
        
        if (doctors.length > 0) {
          doctor = doctors[0];
          console.log(`✅ Found doctor: ${doctor.name?.first} ${doctor.name?.last}`);
          
          // Generate slug
          if (doctor.slug) {
            slug = doctor.slug;
          } else if (doctor.name?.first && doctor.name?.last) {
            const fullName = `${doctor.name.first} ${doctor.name.last}`;
            slug = fullName.toLowerCase()
              .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
              .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
              .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Failed: ${endpoint} - ${error.message}`);
        continue;
      }
    }
    
    if (!doctor) {
      console.log('⚠️ No doctors found in API. Creating sample test page...');
      // Create a sample doctor object for testing
      doctor = {
        name: { first: 'Jan', last: 'Kowalski' },
        specializations: [{ name: 'Chirurgia ogólna' }],
        experience: 15,
        bio: 'Doświadczony chirurg z wieloletnią praktyką.',
        education: 'Uniwersytet Medyczny w Warszawie',
        image: '/images/doctors1.png',
        onlineConsultationPrice: 150,
        offlineConsultationPrice: 200,
        shortDescription: 'Umów wizytę z doświadczonym chirurgiem w Centrum Medycznym 7.'
      };
      slug = 'jan-kowalski';
    }
    
    // Find actual asset filenames
    const { cssFile, jsFile } = findAssetFilenames();
    if (cssFile && jsFile) {
      console.log(`✅ Found assets: ${cssFile}, ${jsFile}`);
    }
    
    // Generate HTML
    const html = generateDoctorHTML(doctor, slug, cssFile, jsFile);
    
    // Write to file
    const filePath = path.join(lekarzeDir, `${slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    
    console.log(`\n✅ Test page generated successfully!`);
    console.log(`📄 File: ${filePath}`);
    console.log(`🔗 URL: ${BASE_URL}/lekarze/${slug}`);
    console.log(`\n🧪 To test indexing:`);
    console.log(`   1. Start your server: npm start`);
    console.log(`   2. Visit: http://localhost:3000/lekarze/${slug}`);
    console.log(`   3. Check the page source to verify static content`);
    console.log(`   4. Submit to Google Search Console for indexing`);
    
  } catch (error) {
    console.error('❌ Error generating test doctor page:', error);
    process.exit(1);
  }
};

// Run if called directly (not imported)
// Check if this file is being run directly by comparing file paths
const filePath = fileURLToPath(import.meta.url);
const runPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (filePath === runPath || runPath.includes('generate-test-doctor-page')) {
  generateTestDoctorPage();
}

export default generateTestDoctorPage;
