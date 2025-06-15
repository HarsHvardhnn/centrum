import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000; // Different port to avoid conflict

// SEO HTML generator
const generateSEOHTML = (path) => {
  const BASE_URL = 'http://localhost:3000';
  
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
      // Handle dynamic routes
      if (path.startsWith('/aktualnosci/')) {
        const slug = path.replace('/aktualnosci/', '');
        title = `${slug.replace(/-/g, ' ')} | Aktualności – Centrum Medyczne 7`;
        description = 'Bądź na bieżąco z informacjami w CM7.';
        keywords = 'aktualności, centrum medyczne 7, news, ogłoszenia';
        ogImage = '/images/news.jpg';
      } else if (path.startsWith('/uslugi/')) {
        const service = path.replace('/uslugi/', '');
        title = `${service.replace(/-/g, ' ')} | Usługi – Centrum Medyczne 7`;
        description = 'Szczegółowy opis usługi medycznej w Centrum Medycznym 7.';
        keywords = 'usługi medyczne, centrum medyczne 7';
        ogImage = '/images/uslugi.jpg';
      } else if (path.startsWith('/poradnik/')) {
        const article = path.replace('/poradnik/', '');
        title = `${article.replace(/-/g, ' ')} | Poradnik – Centrum Medyczne 7`;
        description = 'Sprawdzone porady zdrowotne od specjalistów CM7.';
        keywords = 'poradnik zdrowia, porady medyczne, artykuły medyczne';
        ogImage = '/images/blogs.jpg';
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
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/images/fav_new.png">
    
    <!-- React App CSS -->
    <link rel="stylesheet" crossorigin href="/assets/index-DJBVSEdD.css">
</head>
<body>
    <!-- React App Root -->
    <div id="root"></div>
    
    <!-- React App JavaScript -->
    <script type="module" crossorigin src="/assets/index-DnPMHhBc.js"></script>
</body>
</html>`;
};

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));
app.use('/images', express.static(path.join(__dirname, 'dist', 'images')));

// Serve dynamic HTML with meta tags for all routes
app.get('*', (req, res) => {
  console.log(`📄 Serving route: ${req.path} with dynamic meta tags`);
  const html = generateSEOHTML(req.path);
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✨ Dynamic meta tags enabled for all routes!`);
  console.log(`🔍 View page source to see meta tags`);
}); 