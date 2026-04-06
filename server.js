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
  
  // Remove any query parameters for canonical URLs
  normalized = normalized.split('?')[0];
  
  // Remove any fragments
  normalized = normalized.split('#')[0];
  
  // DO NOT convert to lowercase - preserve original case for dynamic routes
  // Only convert static routes to lowercase for consistency
  if (normalized === '/' || 
      normalized === '/o-nas' || 
      normalized === '/lekarze' || 
      normalized === '/uslugi' || 
      normalized === '/aktualnosci' || 
      normalized === '/poradnik' || 
      normalized === '/kontakt' || 
      normalized === '/regulamin' || 
      normalized === '/polityka-prywatnosci') {
    normalized = normalized.toLowerCase();
  }
  // For dynamic routes (with slashes), preserve the original case
  // This ensures service pages, doctor pages, and blog articles maintain their proper URLs
  
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
    /telegrambot/i,
    /semrushbot/i,
    /ahrefsbot/i,
    /screaming frog/i
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
};

// Helper function to escape HTML attributes
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// SEO HTML generator
const generateSEOHTML = async (path, dynamicData = null) => {
  const BASE_URL = 'https://centrummedyczne7.pl';
  console.log("BASE_URL", BASE_URL);
  console.log("path", path);
  console.log("dynamicData received:", dynamicData ? "YES (will be ignored for specific route)" : "NO");
  
  // Normalize path for comparison (remove trailing slash)
  const normalizedPath = path.replace(/\/$/, '') || '/';
  console.log("normalizedPath", normalizedPath);
  
  let title, description, keywords, ogImage, ogType = 'website', ogTitle, ogDescription, twitterTitle, twitterDescription;
  
  // EARLY RETURN for specific routes - check BEFORE switch to ensure it's handled
  // This MUST be checked first and MUST skip all dynamic data processing
  // Check multiple variations to be safe
  const isMichalRoute = normalizedPath === '/lekarze/michal-szczubkowski' || 
                        normalizedPath === '/lekarze/michal-szczubkowski/' ||
                        path === '/lekarze/michal-szczubkowski' ||
                        path === '/lekarze/michal-szczubkowski/';
  
  if (isMichalRoute) {
    console.log('✅✅✅ EARLY RETURN: Matched specific case for /lekarze/michal-szczubkowski');
    console.log('✅ IGNORING dynamicData completely - using hardcoded values ONLY');
    console.log('✅ NO API data will be used - all values are hardcoded');
    if (dynamicData) {
      console.log('⚠️ WARNING: dynamicData was passed but will be IGNORED');
    }
    // Force dynamicData to null to prevent any usage
    dynamicData = null;
    
    // Set hardcoded meta tags - NO API data used
    title = 'Lek. Michał Szczubkowski – chirurg, proktolog | Centrum Medyczne 7';
    description = 'Lek. Michał Szczubkowski – chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Leczenie chorób odbytu i schorzeń chirurgicznych.';
    keywords = 'Michał Szczubkowski, chirurg, proktolog, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna';
    ogImage = '/assets/static-assets/mikel_doctor.png';
    ogType = 'profile';
    ogTitle = 'Lek. Michał Szczubkowski – chirurg i proktolog | CM7';
    ogDescription = 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Doświadczenie i indywidualne podejście.';
    twitterTitle = 'Lek. Michał Szczubkowski – chirurg, proktolog | CM7';
    twitterDescription = 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.';
    console.log('✅ Hardcoded Title:', title);
    console.log('✅ Hardcoded Description:', description);
    console.log('✅ Hardcoded OG Title:', ogTitle);
    console.log('✅ Hardcoded Twitter Title:', twitterTitle);
    // Continue to generate HTML with these values (skip switch and default)
  } else {
    console.log('❌ Path does not match /lekarze/michal-szczubkowski, normalizedPath:', normalizedPath);
  
  switch (normalizedPath) {
    case '/':
      title = 'Centrum Medyczne 7 – poradnie specjalistyczne świętokrzyskie';
      description = 'Poradnie CM7: chirurg, proktolog, neurolog dziecięcy, kardiolog, radiolog.  Wizyty prywatne, bez skierowania. Skarżysko-Kamienna, woj. świętokrzyskie.';
      keywords = 'centrum medyczne 7, przychodnia Skarżysko-Kamienna, lekarze specjaliści, wizyta lekarska, opieka medyczna, cm7, poradnie specjalistyczne świętokrzyskie';
      ogImage = '/images/mainlogo.png';
      break;
    case '/o-nas':
      title = 'O nas – Centrum Medyczne 7 | Opieka medyczna oparta na doświadczeniu klinicznym';
      description = 'Centrum Medyczne 7 to placówka prowadzona przez lekarzy z doświadczeniem klinicznym, powstała z myślą o pacjentach z województwa świętokrzyskiego, mazowieckiego i okolic. Zapewniamy rzetelną diagnostykę, wysokie standardy leczenia i indywidualną opiekę w oparciu o aktualną wiedzę medyczną.';
      keywords = 'o nas centrum medyczne 7, misja cm7, zespół lekarzy, wartości, Skarżysko-Kamienna';
      ogImage = '/images/abt_us.jpg';
      break;
    case '/lekarze':
      title = 'Lekarze prywatnie – Skarżysko-Kamienna | Centrum Medyczne 7';
      description = 'Szukasz lekarza prywatnie w Skarżysku-Kamiennej? W Centrum Medycznym 7 przyjmują doświadczeni specjaliści wielu dziedzin. Oferujemy krótkie terminy, wygodną rejestrację i konsultacje bez skierowania.';
      keywords = 'lekarze centrum medyczne 7, specjaliści medycyny, zespół lekarzy, doktorzy Skarżysko-Kamienna';
      ogImage = '/images/Specialities.jpg';
      break;
    case '/uslugi':
      title = 'Usługi Medyczne – Centrum Medyczne 7 Skarżysko-Kamienna';
      description = 'USG, EKG, Holter, proktologia, chirurgia, neurologia dziecięca i inne usługi medyczne – prywatnie, bez skierowania. Skarżysko-Kamienna, Świętokrzyskie. Zobacz.';
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
      title = 'Kontakt – Centrum Medyczne 7 Skarżysko-Kamienna | Rejestracja pacjentów';
      description = 'Skontaktuj się z Centrum Medycznym 7 w Skarżysku-Kamiennej. Rejestracja pacjentów i szybkie terminy wizyt u specjalistów. Telefon: 797-097-487. Dbamy o dostępność i zawsze staramy się znaleźć termin dla pacjentów z regionu świętokrzyskiego i mazowieckiego.';
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
    // Known client-side service routes with predefined meta tags
    case '/uslugi/konsultacja-proktologiczna':
    case '/uslugi/konsultacja-proktologiczna/':
      title = 'Konsultacja proktologiczna prywatnie- Proktolog Świętokrzyskie';
      description = 'Prywatna konsultacja proktologiczna bez skierowania. Doświadczony proktolog, dyskretna wizyta, szybkie terminy. Skarżysko-Kamienna, woj. świętokrzyskie. Cena 300 zł.';
      keywords = 'konsultacja proktologiczna, proktolog, prywatnie, bez skierowania, Skarżysko-Kamienna, świętokrzyskie, centrum medyczne 7';
      ogImage = '/assets/static-assets/section_1_t.png';
      ogType = 'website';
      ogTitle = 'Konsultacja proktologiczna – bez skierowania | CM7';
      ogDescription = 'Dyskretny i profesjonalny przebieg wizyty. Konsultacja proktologiczna bez skierowania – Skarżysko-Kamienna, Centrum Medyczne 7.';
      break;
    case '/proktolog':
      title = 'Proktolog Skarżysko-Kamienna – poradnia proktologiczna CM7';
      description = 'Poradnia proktologiczna świętokrzyskie– leczenie hemoroidów (żylaków odbytu), szczelin odbytu, przetok, krwawień. Doświadczony proktolog. Skarżysko-Kamienna.';
      keywords = 'proktolog, konsultacja proktologiczna, hemoroidy, poradnia proktologiczna, Skarżysko-Kamienna, centrum medyczne 7';
      ogImage = '/assets/static-assets/proktolog_section_1.png';
      break;
    case '/uslugi/usuwanie-zmian-skornych-z-badaniem-histopatologicznym':
      title = 'Usuwanie zmian skórnych z badaniem histopatologicznym | CM7';
      description = 'Chirurgiczne usuwanie zmian skórnych, znamion (pieprzyków), kaszaków, włókniaków z badaniem histopatologicznym. Bez skierowania – Świętokrzyskie, Skarżysko-Kamienna.';
      keywords = 'usuwanie zmian skórnych, znamiona, pieprzyki, kaszaki, włókniaki, badanie histopatologiczne, Skarżysko-Kamienna, centrum medyczne 7';
      ogImage = '/assets/static-assets/Usuwanie-zmian-skórnych.png';
      break;
    case '/uslugi/wszywka-alkoholowa-skarzysko-kamienna':
      title = 'Wszywka Alkoholowa Skarżysko – Esperal Disulfiram | CM7';
      description = 'Wszywka alkoholowa Skarżysko-Kamienna, Świętokrzyskie. Szybkie terminy – nawet z dnia na dzień. Dyskretna implantacja disulfiramu (Esperal) przez chirurga.';
      keywords = 'wszywka alkoholowa, esperal, disulfiram, leczenie uzależnienia, implantacja, Skarżysko-Kamienna, Kielce, Radom, centrum medyczne 7';
      ogImage = '/assets/static-assets/Implantacja _section1.png';
      break;
    case '/uslugi/konsultacja-neurologiczna-dla-dzieci':
      title = 'Konsultacja neurologiczna dla dzieci – Neurolog dziecięcy';
      description = 'Poradnia neurologiczna dla dzieci – woj. świętokrzyskie. Tiki nerwowe, padaczka, opóźniony rozwój mowy. Diagnoza, leczenie. Skarżysko, Kielce, Radom i okolice.';
      keywords = 'neurolog dziecięcy, konsultacja neurologiczna dzieci, neurologia dziecięca, Skarżysko-Kamienna, centrum medyczne 7';
      ogImage = '/assets/static-assets/Konsultacja-neurologiczna-dla-dzieci.png';
      break;
    case '/uslugi/leczenie-stopy-cukrzycowej':
    case '/uslugi/leczenie-stopy-cukrzycowej/':
      title = 'Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko';
      description = 'Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania.';
      keywords = 'stopa cukrzycowa, leczenie stopy cukrzycowej, chirurg Skarżysko-Kamienna, poradnia stopy cukrzycowej, centrum medyczne 7';
      ogImage = '/assets/static-assets/section1-newpage.png';
      ogTitle = 'Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko';
      ogDescription = 'Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania.';
      twitterTitle = 'Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko';
      twitterDescription = 'Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania.';
      break;
    case '/usg-skarzysko-kamienna':
    case '/usg-skarzysko-kamienna/':
    case '/uslugi/usg-skarzysko-kamienna':
    case '/uslugi/usg-skarzysko-kamienna/':
      title = 'USG Skarżysko-Kamienna – prywatnie, bez skierowania';
      description = 'USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy.';
      keywords = 'USG Skarżysko-Kamienna, USG tarczycy, USG jamy brzusznej, USG piersi, badania USG, centrum medyczne 7';
      ogImage = '/assets/static-assets/usg_section1.png';
      ogTitle = 'USG Skarżysko-Kamienna – prywatnie, bez skierowania';
      ogDescription = 'USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy.';
      twitterTitle = 'USG Skarżysko-Kamienna – prywatnie, bez skierowania';
      twitterDescription = 'USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy.';
      break;
    case '/uslugi/ortopeda-dzieciecy-skarzysko':
    case '/uslugi/ortopeda-dzieciecy-skarzysko/':
      title = 'Ortopeda dziecięcy Skarżysko – prywatnie, bez skierowania';
      description =
        'Ortopeda dziecięcy Skarżysko – konsultacje dla dzieci i niemowląt. Diagnostyka wad postawy i rozwoju układu ruchu, w tym USG bioderek.';
      keywords =
        'ortopeda dziecięcy, Skarżysko-Kamienna, USG bioderek, niemowlęta, konsultacja ortopedyczna dziecięca, centrum medyczne 7';
      ogImage = '/section1_newpage.png';
      ogTitle = title;
      ogDescription = description;
      twitterTitle = title;
      twitterDescription = description;
      break;
    default:
      // Handle dynamic routes with real data
      // Check specific routes FIRST before general patterns
      if (normalizedPath.startsWith('/aktualnosci/')) {
        if (dynamicData && typeof dynamicData === 'object' && dynamicData.title) {
          // Meta title should be the same as article title (client requirement)
          title = dynamicData.title;
          // Use shortDescription if available, otherwise fall back to description field
          description = dynamicData.shortDescription || dynamicData.description || 'Bądź na bieżąco z informacjami w CM7.';
          keywords = `aktualności, centrum medyczne 7, news, ${dynamicData.title}`;
          ogImage = (dynamicData && dynamicData.image) ? dynamicData.image : '/images/news.jpg';
        } else {
          title = 'Aktualność – Centrum Medyczne 7 Skarżysko-Kamienna';
          description = 'Bądź na bieżąco z informacjami w CM7.';
          keywords = 'aktualności, centrum medyczne 7, news, ogłoszenia';
          ogImage = '/images/news.jpg';
        }
      } else if (normalizedPath.startsWith('/uslugi/')) {
        // List of routes with explicit static meta tags - don't override with dynamic data
        const staticMetaRoutes = [
          '/uslugi/konsultacja-proktologiczna',
          '/uslugi/usuwanie-zmian-skornych-z-badaniem-histopatologicznym',
          '/uslugi/wszywka-alkoholowa-skarzysko-kamienna',
          '/uslugi/konsultacja-neurologiczna-dla-dzieci',
          '/uslugi/leczenie-stopy-cukrzycowej',
          '/uslugi/usg-skarzysko-kamienna',
          '/uslugi/ortopeda-dzieciecy-skarzysko',
          '/usg-skarzysko-kamienna'
        ];
        
        // If this route has static meta tags defined, skip dynamic data override
        if (staticMetaRoutes.includes(normalizedPath)) {
          // Keep the static meta tags that were set in the switch case above
          // Don't override with dynamic data
        } else if (dynamicData && typeof dynamicData === 'object' && dynamicData.title && dynamicData.shortDescription) {
          // Automatic meta title generation for services
          // Default: {service title} – Skarżysko-Kamienna | Centrum Medyczne 7
          // If total title > ~55 chars: {service title shortened}… – Skarżysko-Kamienna | CM7
          const serviceTitle = dynamicData.title;
          const maxTotalLength = 70; // Maximum total title length (allows some flexibility)
          const suffixFull = ' – Skarżysko-Kamienna | Centrum Medyczne 7';
          const suffixShort = ' – Skarżysko-Kamienna | CM7';
          
          // Calculate total length with full suffix
          const totalLengthWithFull = serviceTitle.length + suffixFull.length;
          
          if (totalLengthWithFull <= maxTotalLength) {
            // Use full brand name - title fits within limit
            title = `${serviceTitle}${suffixFull}`;
          } else {
            // Truncate service title to fit with short suffix (target ~55-60 chars total)
            const targetLength = 60; // Target total length when truncating
            const availableSpace = targetLength - suffixShort.length - 1; // -1 for ellipsis
            const truncatedTitle = serviceTitle.substring(0, Math.max(1, availableSpace)) + '…';
            title = `${truncatedTitle}${suffixShort}`;
          }
          
          description = dynamicData?.shortDescription || dynamicData?.description || '';
          keywords = `usługi medyczne, centrum medyczne 7, ${dynamicData.title}`;
          
          // Handle images with proper null checks and empty array checks
          let serviceImage = '/images/uslugi.jpg'; // Default fallback
          if (dynamicData && dynamicData.images && Array.isArray(dynamicData.images) && dynamicData.images.length > 0) {
            // Use the first image from the array
            serviceImage = dynamicData.images[0];
          } else if (dynamicData && dynamicData.image) {
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
      } else if (normalizedPath.startsWith('/poradnik/')) {
        if (dynamicData && typeof dynamicData === 'object' && dynamicData.title) {
          // Meta title should be the same as article title (client requirement)
          title = dynamicData.title;
          // Use shortDescription if available, otherwise fall back to description field
          description = dynamicData.shortDescription || dynamicData.description || 'Sprawdzone porady zdrowotne od specjalistów CM7.';
          keywords = `poradnik zdrowia, porady medyczne, ${dynamicData.title}`;
          ogImage = (dynamicData && dynamicData.image) ? dynamicData.image : '/images/blogs.jpg';
        } else {
          title = 'Artykuł – CM7 Poradnik medyczny';
          description = 'Sprawdzone porady zdrowotne od specjalistów CM7.';
          keywords = 'poradnik zdrowia, porady medyczne, artykuły medyczne';
          ogImage = '/images/blogs.jpg';
        }
      } else if (normalizedPath.startsWith('/lekarze/') && 
                 normalizedPath !== '/lekarze/michal-szczubkowski' &&
                 path !== '/lekarze/michal-szczubkowski' &&
                 path !== '/lekarze/michal-szczubkowski/') {
        // Note: dynamicData for doctors is already extracted in fetchDynamicData
        // So it's the doctor object directly, not wrapped in {data: {...}}
        // Structure: {name: {first, last}, specializations: [...], ...}
        // SKIP this route - it's handled by early return above
        
        if (dynamicData && 
            typeof dynamicData === 'object' && 
            dynamicData.name && 
            typeof dynamicData.name === 'object' &&
            dynamicData.name.first && 
            dynamicData.name.last &&
            dynamicData.specializations && 
            Array.isArray(dynamicData.specializations)) {
          
          const doctorName = `${dynamicData.name.first} ${dynamicData.name.last}`;
          const specializations = dynamicData.specializations
            .map(spec => spec && spec.name ? spec.name : '')
            .filter(name => name)
            .join(", ");
          const experience = dynamicData.experience ? `${dynamicData.experience} lat doświadczenia` : "";
          
          // Meta title format: Lek. {Name} – {specializations} | Centrum Medyczne 7
          title = `Lek. ${doctorName} – ${specializations || 'lekarz'} | Centrum Medyczne 7`;

          // Use shortDescription as meta description, or generate default
          description = dynamicData.shortDescription || `Lek. ${doctorName} – ${specializations || 'lekarz'}${specializations ? ' przyjmujący pacjentów' : ''} w Centrum Medycznym 7 w Skarżysku-Kamiennej.${experience ? ` ${experience}.` : ''} ${dynamicData.onlineConsultationPrice !== undefined ? `Konsultacje online od ${dynamicData.onlineConsultationPrice} zł.` : 'Konsultacje dostępne.'}`;
          keywords = `${doctorName}, ${specializations || 'lekarz'}, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna`;
          ogImage = (dynamicData && dynamicData.image) ? dynamicData.image : '/images/doctors1.png';
          
          // Set OG type to profile for doctor pages
          ogType = 'profile';
          // OG title: Lek. {Name} – {specializations} | CM7
          ogTitle = `Lek. ${doctorName} – ${specializations || 'lekarz'} | CM7`;
          // OG description: Custom description for doctor pages
          ogDescription = dynamicData.shortDescription || `${specializations || 'Lekarz'} przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.${experience ? ` ${experience}.` : ''} Doświadczenie i indywidualne podejście.`;
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
  } // End of else block for early return check

  // Generate canonical URL - use the actual path, removing trailing slash
  // This ensures consistency and prevents redirect loops
  const cleanPath = path.replace(/\/$/, '') || '/';
  let canonicalUrl = `${BASE_URL}${cleanPath}`;
  // USG page: always use /uslugi/usg-skarzysko-kamienna for sharing and canonical
  const isUsgPage = normalizedPath === '/usg-skarzysko-kamienna' || normalizedPath === '/usg-skarzysko-kamienna/' ||
    normalizedPath === '/uslugi/usg-skarzysko-kamienna' || normalizedPath === '/uslugi/usg-skarzysko-kamienna/';
  if (isUsgPage) {
    canonicalUrl = `${BASE_URL}/uslugi/usg-skarzysko-kamienna`;
  }
  console.log(`🔗 Canonical URL for ${path}: ${canonicalUrl}`);
  
  // Final verification for specific route - FORCE correct values if somehow they got overwritten
  const isMichalRouteFinal = normalizedPath === '/lekarze/michal-szczubkowski' || 
                              normalizedPath === '/lekarze/michal-szczubkowski/' ||
                              path === '/lekarze/michal-szczubkowski' ||
                              path === '/lekarze/michal-szczubkowski/';
  
  if (isMichalRouteFinal) {
    console.log('🔍 FINAL VERIFICATION BEFORE HTML GENERATION');
    console.log('🔍 Current Title:', title);
    console.log('🔍 Current Description:', description);
    
    // FORCE the correct values one more time to ensure they're not overwritten
    if (title !== 'Lek. Michał Szczubkowski – chirurg, proktolog | Centrum Medyczne 7') {
      console.log('⚠️ WARNING: Title was overwritten! Forcing correct value...');
      title = 'Lek. Michał Szczubkowski – chirurg, proktolog | Centrum Medyczne 7';
      description = 'Lek. Michał Szczubkowski – chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Leczenie chorób odbytu i schorzeń chirurgicznych.';
      ogType = 'profile';
      ogTitle = 'Lek. Michał Szczubkowski – chirurg i proktolog | CM7';
      ogDescription = 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Doświadczenie i indywidualne podejście.';
      twitterTitle = 'Lek. Michał Szczubkowski – chirurg, proktolog | CM7';
      twitterDescription = 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.';
      ogImage = '/assets/static-assets/mikel_doctor.png';
    }
    console.log('✅ FINAL Title:', title);
    console.log('✅ FINAL Description:', description);
    console.log('✅ FINAL OG Title:', ogTitle);
    console.log('✅ FINAL Twitter Title:', twitterTitle);
  }
  
  // Handle both absolute and relative image URLs
  const fullOgImage = ogImage && (ogImage.startsWith('http://') || ogImage.startsWith('https://')) 
    ? ogImage 
    : `${BASE_URL}${ogImage}`;

  // Generate service-specific structured data for service pages
  let structuredData = '';
  if (path === '/uslugi/konsultacja-proktologiczna' || path === '/uslugi/konsultacja-proktologiczna/') {
    // Specific structured data for proctology consultation page
    const proctologyStructuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      "name": "Konsultacja proktologiczna",
      "description": "Prywatna konsultacja proktologiczna obejmująca wywiad, badanie oraz plan leczenia chorób odbytu i odbytnicy.",
      "provider": {
        "@type": "MedicalClinic",
        "name": "Centrum Medyczne 7",
        "url": `${BASE_URL}/`
      },
      "medicalSpecialty": "Proctology",
      "availableService": {
        "@type": "MedicalProcedure",
        "name": "Konsultacja proktologiczna prywatna",
        "offers": {
          "@type": "Offer",
          "price": "300",
          "priceCurrency": "PLN"
        }
      },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "Polska"
      }
    };
    structuredData = `<script type="application/ld+json">${JSON.stringify(proctologyStructuredData)}</script>`;
  } else if (
    normalizedPath === '/uslugi/ortopeda-dzieciecy-skarzysko' ||
    normalizedPath === '/uslugi/ortopeda-dzieciecy-skarzysko/'
  ) {
    const orthoChildWebPage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: `${BASE_URL}/uslugi/ortopeda-dzieciecy-skarzysko`,
    };
    structuredData = `<script type="application/ld+json">${JSON.stringify(orthoChildWebPage)}</script>`;
  } else if (path.startsWith('/uslugi/') && dynamicData && typeof dynamicData === 'object' && dynamicData.title) {
    // Service-specific structured data to reinforce meta description
    const serviceStructuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalService",
      "name": dynamicData.title,
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
      }
    };
    structuredData = `<script type="application/ld+json">${JSON.stringify(serviceStructuredData)}</script>`;
  } else {
    // Generic MedicalOrganization for other pages
    const orgStructuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "name": "Centrum Medyczne 7",
      "url": BASE_URL,
      "logo": `${BASE_URL}/images/mainlogo.png`,
      "description": description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Skarżysko-Kamienna",
        "addressCountry": "PL"
      },
      "telephone": "797-097-487"
    };
    structuredData = `<script type="application/ld+json">${JSON.stringify(orgStructuredData)}</script>`;
  }

  return `<!DOCTYPE html>
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
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(ogTitle || title)}">
    <meta property="og:description" content="${escapeHtml(ogDescription || description)}">
    <meta property="og:image" content="${fullOgImage}">
    <meta property="og:site_name" content="Centrum Medyczne 7">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${escapeHtml(twitterTitle || ogTitle || title)}">
    <meta property="twitter:description" content="${escapeHtml(twitterDescription || ogDescription || description)}">
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
    ${structuredData}
    
    <!-- Server-injected SEO meta for React (prevents Helmet from overwriting with defaults) -->
    <script type="application/json" id="__INITIAL_SEO__">${JSON.stringify({
      path: cleanPath,
      title,
      description,
      keywords,
      canonicalUrl,
      ogType: ogType || 'website',
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage: fullOgImage,
      twitterTitle: twitterTitle || ogTitle || title,
      twitterDescription: twitterDescription || ogDescription || description
    }).replace(/<\/script>/gi, '<\\/script>')}</script>
    
    <!-- React App CSS and JS will be injected here -->
    <link rel="stylesheet" crossorigin href="/assets/index-GwyecdAE.css">
</head>
<body>
    <!-- SEO content for crawlers: visible in DOM for snippet selection, not displayed on screen -->
    <!-- Off-screen SEO content for crawlers (avoid clip-only hiding). -->
    <div id="seo-content" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    <!-- React App JavaScript -->
    <script type="module" crossorigin src="/assets/index-DDie0XH4.js"></script>
    
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
      
      // News articles use isNews=true parameter
      endpoint = `${API_BASE_URL}/news/slug/${slug}?isNews=true`;
    } else if (path.startsWith('/poradnik/')) {
      slug = path.replace('/poradnik/', '');
      
      // Validate slug before making API call  
      if (!slug || slug === 'undefined' || slug.trim() === '') {
        console.log(`❌ Invalid slug for poradnik: "${slug}"`);
        return null;
      }
      
      // Blogs use the same /news endpoint with isNews=false parameter
      endpoint = `${API_BASE_URL}/news/slug/${slug}?isNews=false`;
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
      
      // Try multiple possible endpoints for doctor data
      endpoint = `${API_BASE_URL}/docs/profile/slug/${slug}`;
    } else {
      return null;
    }
    
    console.log(`📡 Fetching data from: ${endpoint}`);
    
    // Add retry logic with better error handling
    let retries = 3;
    let response = null;
    let lastError = null;
    
    while (retries >= 0) {
      try {
        response = await axios.get(endpoint, { 
          timeout: 10000, // Increased timeout to 10 seconds
          validateStatus: (status) => status < 500 // Don't throw on 4xx, only 5xx
        });
        
        // Check if response is successful
        if (response.status === 200 && response.data) {
          console.log(`✅ Data fetched successfully for slug: ${slug}`);
          
          // Log response structure for debugging
          console.log(`📦 Response structure:`, {
            hasData: !!response.data,
            hasNestedData: !!response.data.data,
            keys: Object.keys(response.data).slice(0, 5),
            type: typeof response.data
          });
          
          // Handle different response structures
          // Test results show:
          // - Most endpoints: response.data = actual data (direct)
          // - Doctor profile: response.data = {success: true, data: {...}} (nested with success wrapper)
          
          // Check for success wrapper first (doctors endpoint)
          if (response.data.success !== undefined && response.data.data && typeof response.data.data === 'object') {
            // Success wrapper with nested data: {success: true, data: {...}}
            console.log(`📦 Using success wrapper structure (doctors)`);
            return response.data.data;
          } else if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
            // Nested data structure: {data: {...}}
            console.log(`📦 Using nested data structure`);
            return response.data.data;
          } else {
            // Direct data structure: {...} or [...]
            console.log(`📦 Using direct data structure`);
            return response.data;
          }
        }
        
        // If 404, don't retry - it's a real 404
        if (response.status === 404) {
          console.log(`❌ 404 - Resource not found: ${endpoint}`);
          return null;
        }
        
        // Other status codes, throw to retry
        throw new Error(`Unexpected status: ${response.status}`);
      } catch (error) {
        lastError = error;
        
        // If this is a doctor endpoint and it fails, try alternative endpoints
        if (path.startsWith('/lekarze/') && (error.response?.status === 404 || !response)) {
          console.log(`⚠️ Doctor endpoint failed, trying alternative endpoints...`);
          
          // Try alternative doctor endpoints
          const alternativeEndpoints = [
            `${API_BASE_URL}/docs/slug/${slug}`,
            `${API_BASE_URL}/doctors/slug/${slug}`,
            `${API_BASE_URL}/doctor/slug/${slug}`
          ];
          
          for (const altEndpoint of alternativeEndpoints) {
            try {
              console.log(`📡 Trying alternative endpoint: ${altEndpoint}`);
              const altResponse = await axios.get(altEndpoint, { timeout: 5000 });
              if (altResponse.status === 200 && altResponse.data) {
                console.log(`✅ Found doctor data at: ${altEndpoint}`);
                
                // Handle different response structures for doctors
                if (altResponse.data.data && typeof altResponse.data.data === 'object') {
                  return altResponse.data.data;
                } else if (altResponse.data.success && altResponse.data.data) {
                  return altResponse.data.data;
                } else {
                  return altResponse.data;
                }
              }
            } catch (altError) {
              console.log(`❌ Alternative endpoint failed: ${altEndpoint}`);
              continue;
            }
          }
        }
        
        // Retry logic - only retry on network errors or 5xx errors
        if (retries > 0 && (!error.response || error.response.status >= 500)) {
          console.log(`⚠️ Retry attempt for ${endpoint}, ${retries} attempts left`);
          await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds before retry
          retries--;
        } else {
          // Don't retry on 4xx errors (client errors)
          if (error.response && error.response.status < 500) {
            console.log(`❌ Client error (${error.response.status}) - not retrying: ${endpoint}`);
            return null;
          }
          throw error; // Network error or server error - rethrow
        }
      }
    }
    
    // If we get here, all retries failed
    console.log(`❌ All retry attempts failed for ${endpoint}`);
    throw lastError || new Error('All retry attempts and alternative endpoints failed');
  } catch (error) {
    console.log(`❌ Failed to fetch data for ${path}:`, error.message);
    // Log more error details for debugging
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`URL: ${error.config?.url}`);
      if (error.response.data) {
        console.log(`Response data:`, JSON.stringify(error.response.data).substring(0, 200));
      }
    } else if (error.request) {
      console.log(`No response received - network error or timeout`);
      console.log(`Request URL: ${error.config?.url}`);
    }
    return null;
  }
};

// Middleware to normalize and sanitize paths
const normalizePath = (path) => {
  if (!path) return '/';
  
  // Fix double slashes (except at start for protocol)
  path = path.replace(/\/+/g, '/');
  
  // Remove leading/trailing slashes (except root)
  if (path !== '/') {
    path = path.replace(/^\/+|\/+$/g, '');
    path = '/' + path;
  }
  
  return path;
};

// Security middleware - Block common attack paths immediately
const handleSecurityPaths = (req, res, next) => {
  let path = req.path;
  
  // Normalize path first (fix double slashes)
  path = normalizePath(path);
  
  // Store normalized path in custom property (req.path is read-only)
  req.normalizedPath = path;
  
  // Block common attack paths (WordPress, git, etc.)
  const blockedPaths = [
    '/wp-admin', '/wp-includes', '/wp-content', '/wp-login', '/wp-config',
    '/xmlrpc.php', '/wp-trackback', '/wp-cron', '/wp-mail.php',
    '/.git', '/.svn', '/.env', '/.htaccess', '/.htpasswd',
    '/admin', '/administrator', '/phpmyadmin', '/mysql', '/database',
    '/backup', '/backups', '/old', '/temp', '/tmp',
    '/cgi-bin', '/.well-known', '/api', '/api/'
  ];
  
  // Check if path starts with any blocked path
  const isBlocked = blockedPaths.some(blocked => path.startsWith(blocked));
  
  if (isBlocked) {
    console.log(`🚫 Blocking security threat: ${path}`);
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <title>404 - Not Found</title>
        <meta name="robots" content="noindex, nofollow">
      </head>
      <body>
        <h1>404 - Not Found</h1>
      </body>
      </html>
    `);
  }
  
  // Block external protocols
  if (path.startsWith('/tel:') || path.startsWith('/mailto:') || 
      path.includes('tel:') || path.includes('mailto:')) {
    console.log(`🚫 Blocking external protocol URL: ${path}`);
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <title>404 - Not Found</title>
        <meta name="robots" content="noindex, nofollow">
      </head>
      <body>
        <h1>404 - Not Found</h1>
      </body>
      </html>
    `);
  }
  
  next();
};

// Middleware to handle invalid/undefined slugs and trailing slashes
const handleInvalidSlugs = (req, res, next) => {
  const path = req.normalizedPath || req.path;
  
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

// Combined middleware to handle trailing slashes - prevents redirect chains
const handleTrailingSlash = (req, res, next) => {
  const path = req.normalizedPath || req.path;
  
  // Skip if root path
  if (path === '/') {
    return next();
  }
  
  // Remove trailing slash for all paths (except root)
  if (path.endsWith('/')) {
    const redirectTo = path.slice(0, -1);
    console.log(`🔄 Redirecting trailing slash: ${path} -> ${redirectTo}`);
    return res.redirect(301, redirectTo);
  }
  
  next();
};

// Middleware to handle case sensitivity and URL normalization
// Only normalize static routes, preserve dynamic route case
const handleUrlNormalization = (req, res, next) => {
  const path = req.normalizedPath || req.path;
  
  // Only normalize static routes - preserve dynamic routes as-is
  const staticRoutes = ['/', '/o-nas', '/lekarze', '/uslugi', '/aktualnosci', '/poradnik', '/kontakt', '/regulamin', '/polityka-prywatnosci'];
  const isStaticRoute = staticRoutes.includes(path.toLowerCase());
  
  if (isStaticRoute && path !== path.toLowerCase()) {
    const normalizedPath = path.toLowerCase();
    console.log(`🔄 Redirecting to normalized URL: ${path} -> ${normalizedPath}`);
    return res.redirect(301, normalizedPath);
  }
  
  next();
};

// List of known client-side routes (hardcoded in React Router)
// These routes should be served even if API fetch fails
const knownClientSideRoutes = [
  '/proktolog',
  '/uslugi/konsultacja-proktologiczna',
  '/uslugi/usuwanie-zmian-skornych-z-badaniem-histopatologicznym',
  '/uslugi/wszywka-alkoholowa-skarzysko-kamienna',
  '/uslugi/konsultacja-neurologiczna-dla-dzieci',
  '/uslugi/leczenie-stopy-cukrzycowej',
  '/uslugi/ortopeda-dzieciecy-skarzysko'
];

// SEO Middleware - Return SEO HTML for EVERYONE (bots and users)
const seoMiddleware = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  // Use normalized path if available, otherwise normalize current path
  let path = req.normalizedPath || normalizePath(req.path);
  
  // Only log legitimate requests (not attack paths)
  const isAttackPath = path.includes('wp-') || path.includes('.git') || 
                       path.includes('xmlrpc') || path.includes('admin');
  
  if (!isAttackPath) {
    console.log(`📄 Serving SEO HTML for: ${userAgent.substring(0, 50)}...`);
    console.log(`🔗 Route: ${path}`);
  }
  
  // CHECK FOR SPECIFIC ROUTE FIRST - Skip ALL API calls for this route
  const normalizedPathForCheck = path.replace(/\/$/, '') || '/';
  const isSpecificRoute = normalizedPathForCheck === '/lekarze/michal-szczubkowski' ||
                          path === '/lekarze/michal-szczubkowski' ||
                          path === '/lekarze/michal-szczubkowski/';
  
  // Fetch dynamic data for dynamic routes
  let dynamicData = null;
  let dataFetchFailed = false;
  const isKnownClientRoute = knownClientSideRoutes.includes(path);
  
  // FOR SPECIFIC ROUTE: Skip ALL API calls, use hardcoded values only
  if (isSpecificRoute) {
    console.log('🚫🚫🚫 SPECIFIC ROUTE DETECTED: /lekarze/michal-szczubkowski');
    console.log('🚫 SKIPPING ALL API CALLS - Using hardcoded meta tags only');
    console.log('🚫 NO fetchDynamicData will be called for this route');
    dynamicData = null; // Explicitly set to null
  } else if ((path.startsWith('/aktualnosci/') || path.startsWith('/poradnik/') || path.startsWith('/uslugi/') || path.startsWith('/lekarze/'))) {
    console.log(`📄 Processing dynamic route: ${path}`);
    dynamicData = await fetchDynamicData(path);
    
    if (!dynamicData) {
      // If this is a known client-side route, serve React app anyway
      if (isKnownClientRoute) {
        console.log(`📄 Known client-side route without API data: ${path} - serving React app`);
        // Continue to generate SEO HTML with null data - will use defaults
      } else {
        // For unknown routes, check if they're doctor pages or news/blog which should exist in API
        const isDynamicContentRoute = path.startsWith('/aktualnosci/') || path.startsWith('/poradnik/') || path.startsWith('/lekarze/');
        
        if (isDynamicContentRoute) {
          // For dynamic content routes (news, blog, doctors), return 404 if no data found
          console.log(`⚠️ No dynamic data available for ${path} - returning proper 404`);
          dataFetchFailed = true;
          
          // Return proper 404 with SEO meta tags to prevent false 404 errors
          const BASE_URL = 'https://centrummedyczne7.pl';
          const cleanPath = path.replace(/\/$/, '') || '/';
          const canonicalUrl = `${BASE_URL}${cleanPath}`;
          
          return res.status(404).send(`
            <!DOCTYPE html>
            <html lang="pl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>404 - Strona nie została znaleziona | Centrum Medyczne 7</title>
              <meta name="description" content="Strona której szukasz nie została znaleziona. Wróć do strony głównej Centrum Medycznego 7 w Skarżysku-Kamiennej.">
              <meta name="robots" content="noindex, nofollow">
              <link rel="canonical" href="${canonicalUrl}">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #008C8C; }
                a { color: #008C8C; text-decoration: none; }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <h1>404 - Strona nie została znaleziona</h1>
              <p>Przepraszamy, ale strona której szukasz nie istnieje.</p>
              <p><a href="/">Powrót do strony głównej</a></p>
            </body>
            </html>
          `);
        } else {
          // For other /uslugi/ routes, serve React app even without API data
          console.log(`📄 Unknown service route without API data: ${path} - serving React app`);
          // Continue to generate SEO HTML with null data
        }
      }
    } else {
      console.log(`📄 Dynamic data fetched: Success`);
    }
  }
  
  // For specific routes, ALWAYS use null - no dynamic data
  const finalDynamicData = isSpecificRoute ? null : dynamicData;
  
  if (isSpecificRoute) {
    console.log('🔒 CONFIRMED: finalDynamicData is NULL for specific route');
    console.log('🔒 NO backend data will be used - only hardcoded values');
  }
  
  const seoHTML = await generateSEOHTML(path, finalDynamicData);
  
  // Add caching headers
  res.set({
    'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    'Vary': 'User-Agent' // Vary response based on user agent
  });
  
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
      // News articles use isNews=true parameter
      const newsResponse = await axios.get(`${API_BASE_URL}/news?isNews=true`, { timeout: 5000 });
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
      // Blogs use the same /news endpoint with isNews=false parameter
      const blogResponse = await axios.get(`${API_BASE_URL}/news?isNews=false`, { timeout: 5000 });
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
      // Try multiple possible endpoints for doctors
      const doctorEndpoints = [
        `${API_BASE_URL}/docs`,
        `${API_BASE_URL}/doctors`,
        `${API_BASE_URL}/doctor`
      ];
      
      let doctorsResponse = null;
      let workingEndpoint = null;
      
      for (const endpoint of doctorEndpoints) {
        try {
          console.log(`👨‍⚕️ Trying doctor endpoint: ${endpoint}`);
          doctorsResponse = await axios.get(endpoint, { timeout: 5000 });
          workingEndpoint = endpoint;
          console.log(`✅ Found working doctor endpoint: ${endpoint}`);
          break;
        } catch (error) {
          console.log(`❌ Doctor endpoint failed: ${endpoint} - ${error.message}`);
          continue;
        }
      }
      
      if (!doctorsResponse) {
        throw new Error('All doctor endpoints failed');
      }
      
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

// Add redirect tracking middleware
app.use((req, res, next) => {
  const originalUrl = req.originalUrl;
  const referer = req.get('Referer') || 'none';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Override the redirect method
  const originalRedirect = res.redirect;
  res.redirect = function(status, url) {
    if (typeof status === 'string') {
      url = status;
      status = 302;
    }
    
    // Log to console
    console.log(`🔄 Redirect: ${originalUrl} -> ${url} (${status}) | UA: ${userAgent.substring(0, 50)}`);
    
    return originalRedirect.call(this, status, url);
  };
  
  next();
});

// Apply middleware in correct order - IMPORTANT: order matters to prevent redirect chains
app.use(handleSecurityPaths);        // First: security and path normalization (fixes double slashes)
app.use(handleInvalidSlugs);          // Second: handle undefined slugs (redirects to parent pages)
app.use(handleTrailingSlash);         // Third: handle trailing slashes (before normalization)
app.use(handleUrlNormalization);      // Fourth: handle URL normalization and case sensitivity

// Serve static assets (CSS, JS, images, PDFs) BEFORE SEO middleware
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));
app.use('/images', express.static(path.join(__dirname, 'dist', 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware to serve static pages (doctors + articles) when they exist
// Generated at build time for SEO and reliability
const serveStaticPages = (req, res, next) => {
  const requestPath = req.normalizedPath || normalizePath(req.path);
  
  // Check for static article pages (news + blogs only)
  if ((requestPath.startsWith('/aktualnosci/') || requestPath.startsWith('/poradnik/')) 
      && requestPath !== '/aktualnosci' && requestPath !== '/poradnik') {
    const dir = requestPath.startsWith('/aktualnosci/') ? 'aktualnosci' : 'poradnik';
    const slug = requestPath.replace(`/${dir}/`, '').replace(/\/$/, '');
    
    if (slug && slug !== 'undefined' && slug.trim() !== '') {
      const staticFilePath = path.join(__dirname, 'dist', dir, `${slug}.html`);
      
      if (fs.existsSync(staticFilePath)) {
        console.log(`📄 Serving static article page: /${dir}/${slug}`);
        const staticHTML = fs.readFileSync(staticFilePath, 'utf8');
        res.set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Vary': 'User-Agent'
        });
        return res.send(staticHTML);
      }
    }
  }
  
  next();
};

// Apply static pages middleware BEFORE SEO middleware
app.get('*', serveStaticPages);

// Apply SEO middleware for HTML routes only (not for static files)
app.get('*', (req, res, next) => {
  // Skip SEO middleware for static files and assets
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|pdf|xml|txt)$/) || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/images/') || 
      req.path.startsWith('/public/')) {
    return next();
  }
  
  // Apply SEO middleware for HTML routes (fallback if static page not found)
  return seoMiddleware(req, res, next);
});

// Serve static files from public directory AFTER SEO middleware (fallback)
app.use('/', express.static(path.join(__dirname, 'public')));

// Add diagnostic endpoint for debugging
app.get('/seo-diagnostic', (req, res) => {
  const path = req.query.path || '/';
  const userAgent = req.query.ua || req.get('User-Agent');
  
  // Check how the URL would be processed
  const normalizedPath = normalizeUrl(path);
  const isRobotCheck = isBot(userAgent);
  
  res.json({
    original_path: path,
    normalized_path: normalizedPath,
    would_redirect: path !== normalizedPath,
    is_bot: isRobotCheck,
    user_agent: userAgent,
    middleware_checks: {
      external_protocol: path.includes('tel:') || path.includes('mailto:'),
      invalid_slug: path.includes('/undefined'),
      has_trailing_slash: path.endsWith('/') && path.length > 1
    }
  });
});

// Add endpoint to test dynamic data fetching
app.get('/test-dynamic-data/:type/:slug', async (req, res) => {
  const { type, slug } = req.params;
  const path = `/${type}/${slug}`;
  
  try {
    console.log(`🧪 Testing dynamic data fetch for: ${path}`);
    const dynamicData = await fetchDynamicData(path);
    
    res.json({
      path: path,
      success: !!dynamicData,
      data: dynamicData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      path: path,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add API health check endpoint
app.get('/api-health', async (req, res) => {
  const results = {};
  
  try {
    // Check news API
    const newsStart = Date.now();
    const newsResponse = await axios.get(`${API_BASE_URL}/news`, { timeout: 3000 });
    results.news = {
      status: newsResponse.status,
      time: Date.now() - newsStart,
      count: newsResponse.data?.length || 0
    };
  } catch (error) {
    results.news = { error: error.message };
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    api_base_url: API_BASE_URL,
    results
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 SEO middleware active for bots`);
  console.log(`📱 React SPA served for regular users`);
}); 