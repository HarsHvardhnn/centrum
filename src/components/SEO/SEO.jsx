import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';

const SEO = () => {
  const location = useLocation();
  const params = useParams();
  const [pageData, setPageData] = useState(null);
  const BASE_URL = 'https://centrummedyczne7.pl';

  // Get page data from DOM or API (injected by NewsDetail/ServicesDetail after fetch)
  const getPageData = () => {
    const dataElement = document.querySelector('script[type="application/json"][data-page-data]');
    return dataElement ? JSON.parse(dataElement.textContent) : null;
  };

  // Get server-injected SEO meta (from server.js) - prevents overwriting correct meta with defaults
  const getInitialSEO = () => {
    try {
      const el = document.getElementById('__INITIAL_SEO__');
      if (el && el.textContent) return JSON.parse(el.textContent);
    } catch (_) {}
    return null;
  };

  // IMPORTANT: All hooks must be called before any conditional returns
  // This ensures hooks are always called in the same order (Rules of Hooks)
  useEffect(() => {
    const data = getPageData();
    if (data) {
      setPageData(data);
    }
  }, [location.pathname]);

  // List of routes that have their own MetaTags component - skip SEO component for these
  const routesWithOwnMetaTags = [
    '/lekarze/michal-szczubkowski',
    '/uslugi/konsultacja-proktologiczna',
    '/uslugi',
    '/uslugi/wszywka-alkoholowa-skarzysko-kamienna',
    '/uslugi/ortopeda-dzieciecy-skarzysko',
    '/proktolog'
  ];

  // Normalize path (strip trailing slash) so skip/list and getMetaInfo match server
  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';

  // Skip rendering if this route has its own MetaTags component
  // This check is now AFTER all hooks are called
  if (routesWithOwnMetaTags.includes(normalizedPath)) {
    return null;
  }

  const getMetaInfo = (path) => {
    // Normalize path so switch cases match regardless of trailing slash
    const pathNorm = (path && path.replace(/\/$/, '')) || path || '/';
    // Prefer server-injected meta when present and for this path (avoids overwriting correct meta for crawlers; ignore on client-side nav to other path)
    const initialSEO = getInitialSEO();
    if (initialSEO && initialSEO.title && initialSEO.description && initialSEO.path === pathNorm) {
      return {
        title: initialSEO.title,
        description: initialSEO.description,
        keywords: initialSEO.keywords || 'centrum medyczne 7, Skarżysko-Kamienna',
        canonicalUrl: initialSEO.canonicalUrl || `${BASE_URL}${pathNorm}`,
        ogImage: initialSEO.ogImage || '/images/mainlogo.png',
        ogType: initialSEO.ogType || 'website',
        ogTitle: initialSEO.ogTitle,
        ogDescription: initialSEO.ogDescription,
        twitterTitle: initialSEO.twitterTitle,
        twitterDescription: initialSEO.twitterDescription
      };
    }
    const currentData = pageData || {};
    const shortDescription = currentData?.news?.shortDescription ||
                            currentData?.service?.shortDescription ||
                            currentData?.shortDescription;

    // Handle dynamic routes with data
    if (pathNorm.startsWith('/aktualnosci/') && currentData?.news) {
      return {
        title: `${currentData.news.title} | Aktualności – CM7`,
        description: shortDescription || 'Bądź na bieżąco z informacjami w CM7.',
        keywords: 'aktualności, CM7, news, ogłoszenia',
        canonicalUrl: `${BASE_URL}${pathNorm}`,
        ogImage: currentData.news.image || '/images/news.jpg'
      };
    }

    if (pathNorm.startsWith('/uslugi/') && currentData?.service) {
      return {
        title: `${currentData.service.title} – CM7 Skarżysko-Kamienna`,
        description: shortDescription || 'Szczegółowy opis usługi medycznej w Centrum Medycznym 7.',
        keywords: 'usługi medyczne, CM7, ' + currentData.service.title,
        canonicalUrl: `${BASE_URL}${pathNorm}`,
        ogImage: currentData.service.images?.[0] || '/images/uslugi.jpg'
      };
    }

    // Static routes (use pathNorm so trailing slash doesn't break match)
    switch (pathNorm) {
      case '/':
        return {
          title: 'Centrum Medyczne 7 – poradnie specjalistyczne świętokrzyskie',
          description: 'Poradnie CM7: chirurg, proktolog, neurolog dziecięcy, kardiolog, radiolog.  Wizyty prywatne, bez skierowania. Skarżysko-Kamienna, woj. świętokrzyskie.',
          keywords: 'centrum medyczne 7, przychodnia Skarżysko-Kamienna, lekarze specjaliści, wizyta lekarska, opieka medyczna, cm7, poradnie specjalistyczne świętokrzyskie',
          canonicalUrl: BASE_URL,
          ogImage: '/images/mainlogo.png'
        };
      case '/o-nas':
        return {
          title: 'O nas – CM7 Skarżysko-Kamienna | Kim jesteśmy',
          description: 'Poznaj CM7 w Skarżysku-Kamiennej. Nasza misja, wartości i zespół lekarzy, którym możesz zaufać.',
          keywords: 'o nas CM7, misja cm7, zespół lekarzy, wartości, Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}/o-nas`,
          ogImage: '/images/abt_us.jpg'
        };
      case '/uslugi':
        return {
          title: 'Usługi Medyczne – Centrum Medyczne 7 Skarżysko-Kamienna',
          description: 'USG, EKG, Holter, proktologia, chirurgia, neurologia dziecięca i inne usługi medyczne – prywatnie, bez skierowania. Skarżysko-Kamienna, Świętokrzyskie. Zobacz.',
          keywords: 'usługi medyczne, konsultacja chirurgiczna, konsultacja online, proktologia, neurologia dziecięca, leczenie ran',
          canonicalUrl: `${BASE_URL}/uslugi`,
          ogImage: '/images/uslugi.jpg'
        };
      case '/kontakt':
        return {
          title: 'Kontakt – CM7 Skarżysko-Kamienna | Rejestracja i telefon',
          description: 'Zadzwoń: 797-097-487. Skontaktuj się z CM7 – telefon, e-mail, godziny otwarcia i rejestracja.',
          keywords: 'kontakt CM7, umów wizytę, telefon cm7, adres Skarżysko-Kamienna, godziny pracy',
          canonicalUrl: `${BASE_URL}/kontakt`,
          ogImage: '/images/contact.jpg'
        };
      case '/lekarze':
        return {
          title: 'Nasi lekarze – CM7 Skarżysko-Kamienna | Zespół specjalistów',
          description: 'Poznaj lekarzy CM7 w Skarżysku-Kamiennej. Doświadczeni specjaliści w różnych dziedzinach medycyny – sprawdź nasz zespół.',
          keywords: 'lekarze CM7, specjaliści medycyny, zespół lekarzy, doktorzy Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}/lekarze`,
          ogImage: '/images/doctors1.png'
        };
      case '/lekarze/michal-szczubkowski':
        return {
          title: 'Lek. Michał Szczubkowski – chirurg, proktolog | Centrum Medyczne 7',
          description: 'Lek. Michał Szczubkowski – chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Leczenie chorób odbytu i schorzeń chirurgicznych.',
          keywords: 'Michał Szczubkowski, chirurg, proktolog, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}/lekarze/michal-szczubkowski`,
          ogImage: '/assets/static-assets/mikel_doctor.png',
          ogType: 'profile',
          ogTitle: 'Lek. Michał Szczubkowski – chirurg i proktolog | CM7',
          ogDescription: 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Doświadczenie i indywidualne podejście.',
          twitterTitle: 'Lek. Michał Szczubkowski – chirurg, proktolog | CM7',
          twitterDescription: 'Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.'
        };
      case '/uslugi/wszywka-alkoholowa-skarzysko-kamienna':
        return {
          title: 'Wszywka Alkoholowa Skarżysko – Esperal Disulfiram | CM7',
          description: 'Wszywka alkoholowa Skarżysko-Kamienna, Świętokrzyskie. Szybkie terminy – nawet z dnia na dzień. Dyskretna implantacja disulfiramu (Esperal) przez chirurga.',
          keywords: 'wszywka alkoholowa, esperal, disulfiram, leczenie uzależnienia, implantacja, Skarżysko-Kamienna, Kielce, Radom, centrum medyczne 7',
          canonicalUrl: `${BASE_URL}/uslugi/wszywka-alkoholowa-skarzysko-kamienna`,
          ogImage: '/assets/static-assets/Implantacja _section1.png'
        };
      case '/aktualnosci':
        return {
          title: 'Aktualności – CM7 Skarżysko-Kamienna | Nowości i ogłoszenia',
          description: 'Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty.',
          keywords: 'aktualności CM7, ogłoszenia medyczne, nowości cm7, komunikaty, wydarzenia medyczne',
          canonicalUrl: `${BASE_URL}/aktualnosci`,
          ogImage: '/images/news.jpg'
        };
      case '/poradnik':
        return {
          title: 'CM7 – Artykuły i porady zdrowotne | Poradnik medyczny',
          description: 'Sprawdzone porady zdrowotne i artykuły medyczne od specjalistów CM7 w Skarżysku-Kamiennej. Praktyczna wiedza i wskazówki dla pacjentów.',
          keywords: 'poradnik zdrowia, porady medyczne, artykuły medyczne, profilaktyka, zdrowie, CM7',
          canonicalUrl: `${BASE_URL}/poradnik`,
          ogImage: '/images/blogs.jpg'
        };
      default:
        // Check if it's a doctor route that might need API data
        if (pathNorm.startsWith('/lekarze/')) {
          // For doctor routes, try to get data from DOM or use defaults
          const doctorData = pageData?.doctor || {};
          if (doctorData.name && doctorData.specializations) {
            const doctorName = `${doctorData.name.first} ${doctorData.name.last}`;
            const specializations = doctorData.specializations.map(s => s.name).join(", ");
            return {
              title: `Lek. ${doctorName} – ${specializations} | Centrum Medyczne 7`,
              description: doctorData.shortDescription || `Lek. ${doctorName} – ${specializations} przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.`,
              keywords: `${doctorName}, ${specializations}, centrum medyczne 7, wizyta lekarska, Skarżysko-Kamienna`,
              canonicalUrl: `${BASE_URL}${pathNorm}`,
              ogImage: doctorData.image || '/images/doctors1.png',
              ogType: 'profile',
              ogTitle: `Lek. ${doctorName} – ${specializations} | CM7`,
              ogDescription: doctorData.shortDescription || `${specializations} przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Doświadczenie i indywidualne podejście.`,
              twitterTitle: `Lek. ${doctorName} – ${specializations} | CM7`,
              twitterDescription: doctorData.shortDescription || `${specializations} przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej.`
            };
          }
        }
        return {
          title: 'CM7 Skarżysko-Kamienna',
          description: 'Nowoczesna przychodnia w Skarżysku-Kamiennej. Doświadczeni lekarze specjaliści.',
          keywords: 'centrum medyczne, przychodnia, lekarze, Skarżysko-Kamienna',
          canonicalUrl: `${BASE_URL}${pathNorm}`,
          ogImage: '/images/mainlogo.png'
        };
    }
  };

  const { title, description, keywords, canonicalUrl, ogImage, ogType, ogTitle, ogDescription, twitterTitle, twitterDescription } = getMetaInfo(normalizedPath);

  // Use provided OG values or fallback to defaults
  const finalOgType = ogType || 'website';
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;
  const fullOgImage = (ogImage && (ogImage.startsWith('http://') || ogImage.startsWith('https://'))) ? ogImage : `${BASE_URL}${ogImage || '/images/mainlogo.png'}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:type" content={finalOgType} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:url" content={canonicalUrl} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={fullOgImage} />
    </Helmet>
  );
};

export default SEO; 