import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { testSEO } from '../../utils/testSEO';

const SEO = () => {
  const location = useLocation();
  const BASE_URL = import.meta.env.NODE_ENV === 'development' 
    ? 'https://centrummedyczne7.pl' 
    : 'https://centrummedyczne7.pl';

  const getMetaInfo = (path) => {
    switch (path) {
      case '/':
        return {
          title: 'CM7 – Przychodnia specjalistyczna Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści. Umów wizytę w Centrum Medyczne 7.',
          keywords: 'centrum medyczne 7, przychodnia Skarżysko-Kamienna, lekarze specjaliści, wizyta lekarska, opieka medyczna, cm7',
          canonicalUrl: BASE_URL,
          ogImage: '/images/mainlogo.png'
        };
      case '/o-nas':
        return {
          title: 'O nas – Centrum Medyczne 7 Skarżysko-Kamienna | Kim jesteśmy',
          description: 'Poznaj Centrum Medyczne 7 w Skarżysku-Kamiennej. Nasza misja, wartości i zespół lekarzy, którym możesz zaufać.',
          keywords: 'o nas centrum medyczne 7, misja cm7, zespół lekarzy, wartości, Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}/o-nas`,
          ogImage: '/images/abt_us.jpg'
        };
      case '/uslugi':
        return {
          title: 'Usługi medyczne – Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'Konsultacja chirurgiczna | Konsultacja online | Konsultacja proktologiczna | Leczenie ran przewlekłych | Neurologia dziecięca',
          keywords: 'usługi medyczne, konsultacja chirurgiczna, konsultacja online, proktologia, neurologia dziecięca, leczenie ran',
          canonicalUrl: `${BASE_URL}/uslugi`,
          ogImage: '/images/uslugi.jpg'
        };
      case '/lekarze':
        return {
          title: 'Nasi lekarze – Centrum Medyczne 7 Skarżysko-Kamienna | Zespół specjalistów',
          description: 'Poznaj lekarzy CM7 w Skarżysku-Kamiennej. Doświadczeni specjaliści w różnych dziedzinach medycyny – sprawdź nasz zespół.',
          keywords: 'lekarze centrum medyczne 7, specjaliści medycyny, zespół lekarzy, doktorzy Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}/lekarze`,
          ogImage: '/images/doctors1.png'
        };
      case '/aktualnosci':
        return {
          title: 'Aktualności – Centrum Medyczne 7 Skarżysko-Kamienna | Nowości i ogłoszenia',
          description: 'Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty.',
          keywords: 'aktualności centrum medyczne 7, ogłoszenia medyczne, nowości cm7, komunikaty, wydarzenia medyczne',
          canonicalUrl: `${BASE_URL}/aktualnosci`,
          ogImage: '/images/news.jpg'
        };
      case '/kontakt':
        return {
          title: 'Kontakt – Centrum Medyczne 7 Skarżysko-Kamienna | Umów wizytę',
          description: 'Skontaktuj się z Centrum Medyczne 7. Adres, telefon, godziny pracy. Umów wizytę online lub telefonicznie.',
          keywords: 'kontakt centrum medyczne 7, umów wizytę, telefon cm7, adres Skarżysko-Kamienna, godziny pracy',
          canonicalUrl: `${BASE_URL}/kontakt`,
          ogImage: '/images/contact.jpg'
        };
      case '/poradnik':
        return {
          title: 'Poradnik zdrowia – Centrum Medyczne 7 | Porady medyczne',
          description: 'Praktyczne porady zdrowotne od specjalistów CM7. Artykuły medyczne, wskazówki profilaktyczne i informacje o zdrowiu.',
          keywords: 'poradnik zdrowia, porady medyczne, artykuły medyczne, profilaktyka, zdrowie, centrum medyczne 7',
          canonicalUrl: `${BASE_URL}/poradnik`,
          ogImage: '/images/blogs.jpg'
        };
      default:
        return {
          title: 'Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.',
          keywords: 'centrum medyczne, przychodnia, lekarze, Skarżysko-Kamienna',
          canonicalUrl: BASE_URL,
          ogImage: '/images/mainlogo.png'
        };
    }
  };

  const { title, description, keywords, canonicalUrl, ogImage } = getMetaInfo(location.pathname);

  // Structured data for the organization
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Centrum Medyczne 7",
    "alternateName": "CM7",
    "url": BASE_URL,
    "logo": "/images/mainlogo.png",
    "image": "/images/mainlogo.png",
    "description": "Profesjonalna klinika w Skarżysku-Kamiennej oferująca kompleksową opiekę medyczną i specjalistyczne usługi zdrowotne",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Skarżysko-Kamienna",
      "addressRegion": "Świętokrzyskie",
      "addressCountry": "PL"
    },
    "medicalSpecialty": [
      "Medycyna Ogólna",
      "Chirurgia",
      "Proktologia",
      "Neurologia Dziecięca",
      "Leczenie Ran Przewlekłych"
    ],
    "priceRange": "$$",
    "hasMap": `${BASE_URL}/kontakt`,
    "sameAs": [
      "https://www.facebook.com/centrummedyczne7",
      "https://www.instagram.com/centrummedyczne7"
    ]
  };

  // Test SEO in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Wait for Helmet to update the document
      setTimeout(testSEO, 100);
    }
  }, [location.pathname]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Centrum Medyczne 7" />
      <meta name="theme-color" content="#008c8c" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/png" href="/images/fav_new.png" />
      <link rel="apple-touch-icon" href="/images/fav_new.png" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${BASE_URL}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Centrum Medyczne 7" />
      <meta property="og:locale" content="pl_PL" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="language" content="Polish" />
      <meta name="geo.region" content="PL-26" />
      <meta name="geo.placename" content="Skarżysko-Kamienna" />
      
      {/* Mobile App Meta */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="CM7" />
      <meta name="msapplication-TileColor" content="#008c8c" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO; 