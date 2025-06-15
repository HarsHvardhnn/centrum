import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';

const SEO = () => {
  const location = useLocation();
  const params = useParams();
  const [pageData, setPageData] = useState(null);
  const BASE_URL = 'https://centrummedyczne7.pl';

  // Get page data from DOM or API
  const getPageData = () => {
    const dataElement = document.querySelector('script[type="application/json"][data-page-data]');
    return dataElement ? JSON.parse(dataElement.textContent) : null;
  };

  useEffect(() => {
    const data = getPageData();
    if (data) {
      setPageData(data);
    }
  }, [location.pathname]);

  const getMetaInfo = (path) => {
    const currentData = pageData || {};
    const shortDescription = currentData?.news?.shortDescription || 
                            currentData?.service?.shortDescription ||
                            currentData?.shortDescription;

    // Handle dynamic routes with data
    if (path.startsWith('/aktualnosci/') && currentData?.news) {
      return {
        title: `${currentData.news.title} | Aktualności – Centrum Medyczne 7`,
        description: shortDescription || 'Bądź na bieżąco z informacjami w CM7.',
        keywords: 'aktualności, centrum medyczne 7, news, ogłoszenia',
        canonicalUrl: `${BASE_URL}${path}`,
        ogImage: currentData.news.image || '/images/news.jpg'
      };
    }

    if (path.startsWith('/uslugi/') && currentData?.service) {
      return {
        title: `${currentData.service.title} – Centrum Medyczne 7 Skarżysko-Kamienna`,
        description: shortDescription || 'Szczegółowy opis usługi medycznej w Centrum Medycznym 7.',
        keywords: 'usługi medyczne, centrum medyczne 7, ' + currentData.service.title,
        canonicalUrl: `${BASE_URL}${path}`,
        ogImage: currentData.service.images?.[0] || '/images/uslugi.jpg'
      };
    }

    // Static routes
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
      case '/kontakt':
        return {
          title: 'Kontakt – Centrum Medyczne 7 Skarżysko-Kamienna | Rejestracja i telefon',
          description: 'Zadzwoń: 797-097-487. Skontaktuj się z CM7 – telefon, e-mail, godziny otwarcia i rejestracja.',
          keywords: 'kontakt centrum medyczne 7, umów wizytę, telefon cm7, adres Skarżysko-Kamienna, godziny pracy',
          canonicalUrl: `${BASE_URL}/kontakt`,
          ogImage: '/images/contact.jpg'
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
      default:
        return {
          title: 'Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.',
          keywords: 'centrum medyczne, przychodnia, lekarze, Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}${path}`,
          ogImage: '/images/mainlogo.png'
        };
    }
  };

  const { title, description, keywords, canonicalUrl, ogImage } = getMetaInfo(location.pathname);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${BASE_URL}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} />
    </Helmet>
  );
};

export default SEO; 