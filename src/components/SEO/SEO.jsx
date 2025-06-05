import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { testSEO } from '../../utils/testSEO';

const SEO = () => {
  const location = useLocation();
  const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : 'https://centrummedyczne7.pl';

  const getMetaInfo = (path) => {
    switch (path) {
      case '/':
        return {
          title: 'CM7 – Przychodnia specjalistyczna Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści. Umów wizytę w Centrum Medyczne 7.',
          canonicalUrl: BASE_URL
        };
      case '/o-nas':
        return {
          title: 'O nas – Centrum Medyczne 7 Skarżysko-Kamienna | Kim jesteśmy',
          description: 'Poznaj Centrum Medyczne 7 w Skarżysku-Kamiennej. Nasza misja, wartości i zespół lekarzy, którym możesz zaufać.',
          canonicalUrl: `${BASE_URL}/o-nas`
        };
      case '/uslugi':
        return {
          title: 'Usługi medyczne – Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'Konsultacja chirurgiczna | Konsultacja online | Konsultacja proktologiczna | Leczenie ran przewlekłych | Neurologia dziecięca',
          canonicalUrl: `${BASE_URL}/uslugi`
        };
      case '/lekarze':
        return {
          title: 'Nasi lekarze – Centrum Medyczne 7 Skarżysko-Kamienna | Zespół specjalistów',
          description: 'Poznaj lekarzy CM7 w Skarżysku-Kamiennej. Doświadczeni specjaliści w różnych dziedzinach medycyny – sprawdź nasz zespół.',
          canonicalUrl: `${BASE_URL}/lekarze`
        };
      case '/aktualnosci':
        return {
          title: 'Aktualności – Centrum Medyczne 7 Skarżysko-Kamienna | Nowości i ogłoszenia',
          description: 'Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty.',
          canonicalUrl: `${BASE_URL}/aktualnosci`
        };
      default:
        return {
          title: 'Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.',
          canonicalUrl: BASE_URL
        };
    }
  };

  const { title, description, canonicalUrl } = getMetaInfo(location.pathname);

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
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    </Helmet>
  );
};

export default SEO; 