import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import { testSEO } from '../../utils/testSEO';

const SEO = () => {
  const location = useLocation();
  const params = useParams();
  const BASE_URL = import.meta.env.VITE_NODE_ENV === 'development' 
    ? 'https://centrummedyczne7.pl' 
    : 'https://centrummedyczne7.pl';

  // Get the current page data from the DOM
  const getPageData = () => {
    const pageData = document.querySelector('script[type="application/json"][data-page-data]');
    return pageData ? JSON.parse(pageData.textContent) : null;
  };

  const getMetaInfo = (path) => {
    const pageData = getPageData();
    const shortDescription = pageData?.shortDescription;

    // Handle dynamic routes first
    if (path.startsWith('/aktualnosci/') && params.slug) {
      return {
        title: `${params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} | Aktualności – Centrum Medyczne 7`,
        description: shortDescription || 'Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty.',
        keywords: 'aktualności, centrum medyczne 7, news, ogłoszenia',
        canonicalUrl: `${BASE_URL}${path}`,
        ogImage: '/images/news.jpg'
      };
    }

    if (path.startsWith('/poradnik/') && params.slug) {
      return {
        title: `${params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} | Poradnik – Centrum Medyczne 7`,
        description: shortDescription || 'Sprawdzone porady zdrowotne i artykuły medyczne od specjalistów CM7 w Skarżysku-Kamiennej.',
        keywords: 'poradnik, porady medyczne, zdrowie, centrum medyczne 7',
        canonicalUrl: `${BASE_URL}${path}`,
        ogImage: '/images/blogs.jpg'
      };
    }

    if (path.startsWith('/uslugi/') && params.service) {
      return {
        title: `${params.service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} – Centrum Medyczne 7 Skarżysko-Kamienna`,
        description: shortDescription || 'Szczegółowy opis usługi medycznej w Centrum Medycznym 7 w Skarżysku-Kamiennej.',
        keywords: 'usługi medyczne, centrum medyczne 7, ' + params.service,
        canonicalUrl: `${BASE_URL}${path}`,
        ogImage: '/images/uslugi.jpg'
      };
    }

    // Handle static routes
    switch (path) {
      case '/':
      case '':
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
      case '/poradnik':
        return {
          title: 'CM7 – Artykuły i porady zdrowotne | Poradnik medyczny',
          description: 'Sprawdzone porady zdrowotne i artykuły medyczne od specjalistów CM7 w Skarżysku-Kamiennej. Praktyczna wiedza i wskazówki dla pacjentów.',
          keywords: 'poradnik zdrowia, porady medyczne, artykuły medyczne, profilaktyka, zdrowie, centrum medyczne 7',
          canonicalUrl: `${BASE_URL}/poradnik`,
          ogImage: '/images/blogs.jpg'
        };
      case '/kontakt':
        return {
          title: 'Kontakt – Centrum Medyczne 7 Skarżysko-Kamienna | Rejestracja i telefon',
          description: 'Zadzwoń: 797-097-487. Skontaktuj się z CM7 – telefon, e-mail, godziny otwarcia i rejestracja.',
          keywords: 'kontakt centrum medyczne 7, umów wizytę, telefon cm7, adres Skarżysko-Kamienna, godziny pracy',
          canonicalUrl: `${BASE_URL}/kontakt`,
          ogImage: '/images/contact.jpg'
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
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      // Wait for Helmet to update the document
      setTimeout(testSEO, 100);
    }
  }, [location.pathname]);

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} data-react-helmet="true" />
      <meta name="keywords" content={keywords} data-react-helmet="true" />
      <meta name="author" content="Centrum Medyczne 7" data-react-helmet="true" />
      <meta name="theme-color" content="#008c8c" data-react-helmet="true" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} data-react-helmet="true" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/png" href="/images/fav_new.png" data-react-helmet="true" />
      <link rel="apple-touch-icon" href="/images/fav_new.png" data-react-helmet="true" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} data-react-helmet="true" />
      <meta property="og:description" content={description} data-react-helmet="true" />
      <meta property="og:type" content="website" data-react-helmet="true" />
      <meta property="og:url" content={canonicalUrl} data-react-helmet="true" />
      <meta property="og:image" content={`${BASE_URL}${ogImage}`} data-react-helmet="true" />
      <meta property="og:image:width" content="1200" data-react-helmet="true" />
      <meta property="og:image:height" content="630" data-react-helmet="true" />
      <meta property="og:image:alt" content={title} data-react-helmet="true" />
      <meta property="og:site_name" content="Centrum Medyczne 7" data-react-helmet="true" />
      <meta property="og:locale" content="pl_PL" data-react-helmet="true" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" data-react-helmet="true" />
      <meta name="twitter:title" content={title} data-react-helmet="true" />
      <meta name="twitter:description" content={description} data-react-helmet="true" />
      <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} data-react-helmet="true" />
      <meta name="twitter:image:alt" content={title} data-react-helmet="true" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" data-react-helmet="true" />
      <meta name="viewport" content="width=device-width, initial-scale=1" data-react-helmet="true" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" data-react-helmet="true" />
      <meta name="format-detection" content="telephone=no" data-react-helmet="true" />
      <meta name="language" content="Polish" data-react-helmet="true" />
      <meta name="geo.region" content="PL-26" data-react-helmet="true" />
      <meta name="geo.placename" content="Skarżysko-Kamienna" data-react-helmet="true" />
      
      {/* Mobile App Meta */}
      <meta name="apple-mobile-web-app-capable" content="yes" data-react-helmet="true" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" data-react-helmet="true" />
      <meta name="apple-mobile-web-app-title" content="CM7" data-react-helmet="true" />
      <meta name="msapplication-TileColor" content="#008c8c" data-react-helmet="true" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO; 