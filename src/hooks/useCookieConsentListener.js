import { useEffect, useState } from 'react';

/**
 * Hook to listen for cookie consent changes
 * Useful for components that need to react to consent changes
 * (e.g., analytics components, tracking components)
 */
export const useCookieConsentListener = () => {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const handleConsentChange = (event) => {
      setConsent(event.detail);
    };

    // Listen for consent changes
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    // Get initial consent from localStorage
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent) {
      try {
        setConsent(JSON.parse(storedConsent));
      } catch (error) {
        console.error('Error parsing stored consent:', error);
      }
    }

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  return consent;
};

export default useCookieConsentListener; 