import React, { useEffect } from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';

/**
 * Example component showing how to conditionally load analytics
 * based on cookie consent. This replaces any existing analytics
 * that might be loaded unconditionally.
 */
const AnalyticsWrapper = ({ children }) => {
  const { consentData, hasUserConsent } = useCookieConsent();

  useEffect(() => {
    // Only track page views if analytics consent is given
    if (hasUserConsent && consentData?.analytics && window.gtag) {
      // Track page view
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, [consentData, hasUserConsent]);

  // Custom tracking function that respects consent
  const trackEvent = (eventName, parameters = {}) => {
    if (!hasUserConsent || !consentData?.analytics) {
      console.log('Analytics tracking blocked - no consent');
      return;
    }

    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    if (window.fbq && consentData?.marketing) {
      window.fbq('track', eventName, parameters);
    }
  };

  // Provide tracking function to children via React context or props
  return (
    <div data-analytics-consent={consentData?.analytics}>
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { trackEvent })
          : child
      )}
    </div>
  );
};

export default AnalyticsWrapper;

// Export the tracking function for use in other components
export const useAnalyticsTracking = () => {
  const { consentData, hasUserConsent } = useCookieConsent();

  const trackEvent = (eventName, parameters = {}) => {
    if (!hasUserConsent || !consentData?.analytics) {
      console.log('Analytics tracking blocked - no consent');
      return;
    }

    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    if (window.fbq && consentData?.marketing) {
      window.fbq('track', eventName, parameters);
    }
  };

  return { trackEvent, canTrack: hasUserConsent && consentData?.analytics };
}; 