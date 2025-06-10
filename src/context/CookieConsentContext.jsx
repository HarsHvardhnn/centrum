import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCaller } from '../utils/axiosInstance';
import { useUser } from './userContext';

const CookieConsentContext = createContext();

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
};

export const CookieConsentProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [consentData, setConsentData] = useState({
    necessary: true, // Always true - required for basic functionality
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cookie categories configuration
  const cookieCategories = {
    necessary: {
      name: 'Niezbędne',
      description: 'Te pliki cookie są niezbędne do podstawowego funkcjonowania strony i nie mogą być wyłączone.',
      cookies: ['session', 'csrf', 'auth']
    },
    analytics: {
      name: 'Analityczne',
      description: 'Pomagają nam zrozumieć, jak użytkownicy korzystają z naszej strony.',
      cookies: ['_ga', '_gid', '_gtag']
    },
    marketing: {
      name: 'Marketingowe',
      description: 'Używane do wyświetlania spersonalizowanych reklam.',
      cookies: ['_fbp', '_fbc', 'ads']
    },
    preferences: {
      name: 'Preferencje',
      description: 'Zapamiętują Twoje ustawienia i preferencje.',
      cookies: ['lang', 'theme', 'settings']
    }
  };

  // Load consent data on component mount
  useEffect(() => {
    loadConsentData();
  }, [user, isAuthenticated]);

  const loadConsentData = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated && user?.id) {
        // Load from backend for authenticated users
        try {
          const response = await apiCaller('GET', '/api/cookie-consent');
          if (response.data?.consent) {
            const backendConsent = response.data.consent;
            setConsentData(backendConsent);
            setHasUserConsent(true);
            setShowBanner(false);
          } else {
            setShowBanner(true);
          }
        } catch (error) {
          console.error('Failed to load cookie consent from backend:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage for guest users
        loadFromLocalStorage();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsentData({ ...consentData, ...parsedConsent });
        setHasUserConsent(true);
        setShowBanner(false);
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  };

  const saveConsentData = async (newConsent) => {
    try {
      const consentWithTimestamp = {
        ...newConsent,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      setConsentData(consentWithTimestamp);
      setHasUserConsent(true);
      setShowBanner(false);
      setShowPreferences(false);

      // Save to localStorage
      localStorage.setItem('cookieConsent', JSON.stringify(consentWithTimestamp));

      // Save to backend if user is authenticated
      if (isAuthenticated && user?.id) {
        try {
          await apiCaller('POST', '/api/cookie-consent', {
            consent: consentWithTimestamp
          });
        } catch (error) {
          console.error('Failed to save cookie consent to backend:', error);
          // Continue anyway - localStorage fallback works
        }
      }

      // Apply consent by loading/blocking scripts
      applyConsent(consentWithTimestamp);
    } catch (error) {
      console.error('Error saving consent data:', error);
    }
  };

  const applyConsent = (consent) => {
    // Remove existing analytics scripts
    removeScripts(['google-analytics', 'gtag', 'facebook-pixel']);

    // Load scripts based on consent
    if (consent.analytics) {
      loadAnalyticsScripts();
    }

    if (consent.marketing) {
      loadMarketingScripts();
    }

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: consent
    }));
  };

  const removeScripts = (scriptIds) => {
    scriptIds.forEach(id => {
      const script = document.getElementById(id);
      if (script) {
        script.remove();
      }
    });

    // Clear Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  };

  const loadAnalyticsScripts = () => {
    // Google Analytics 4
    if (!document.getElementById('google-analytics')) {
      const script = document.createElement('script');
      script.id = 'google-analytics';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
          anonymize_ip: true,
          cookie_flags: 'SameSite=Strict;Secure'
        });
      };
    }
  };

  const loadMarketingScripts = () => {
    // Facebook Pixel
    if (!document.getElementById('facebook-pixel') && import.meta.env.VITE_FACEBOOK_PIXEL_ID) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${import.meta.env.VITE_FACEBOOK_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  };

  const acceptAll = () => {
    saveConsentData({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
  };

  const rejectAll = () => {
    saveConsentData({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
  };

  const updateConsent = (category, value) => {
    const newConsent = {
      ...consentData,
      [category]: value
    };
    setConsentData(newConsent);
  };

  const savePreferences = () => {
    saveConsentData(consentData);
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  const closePreferences = () => {
    setShowPreferences(false);
  };

  const withdrawConsent = () => {
    // Reset to default state
    const defaultConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    setConsentData(defaultConsent);
    setHasUserConsent(false);
    setShowBanner(true);
    
    // Clear localStorage
    localStorage.removeItem('cookieConsent');
    
    // Clear backend if authenticated
    if (isAuthenticated && user?.id) {
      apiCaller('DELETE', '/api/cookie-consent').catch(console.error);
    }
    
    // Remove all scripts
    removeScripts(['google-analytics', 'gtag', 'facebook-pixel']);
  };

  const value = {
    consentData,
    showBanner,
    showPreferences,
    hasUserConsent,
    loading,
    cookieCategories,
    acceptAll,
    rejectAll,
    updateConsent,
    savePreferences,
    openPreferences,
    closePreferences,
    withdrawConsent,
    setShowBanner
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export default CookieConsentProvider; 