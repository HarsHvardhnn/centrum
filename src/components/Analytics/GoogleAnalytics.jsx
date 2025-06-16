import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from '../../context/CookieConsentContext';

const GoogleAnalytics = () => {
  const location = useLocation();
  const { consentData, hasUserConsent } = useCookieConsent();

  // Track page views when route changes
  useEffect(() => {
    if (hasUserConsent && consentData?.analytics && window.gtag) {
      // Update consent when user agrees
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });

      // Track page view
      window.gtag('config', 'G-YOUR_GA4_ID', {
        page_title: document.title,
        page_location: window.location.href,
        anonymize_ip: true,
        cookie_flags: 'SameSite=Strict;Secure'
      });

      // Track custom page view event
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname
      });

      console.log('📊 Google Analytics: Page view tracked', location.pathname);
    } else {
      // Ensure tracking is denied if no consent
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }
  }, [location.pathname, consentData, hasUserConsent]);

  return null; // This component doesn't render anything
};

// Custom hook for tracking events throughout the app
export const useGoogleAnalytics = () => {
  const { consentData, hasUserConsent } = useCookieConsent();

  const trackEvent = (eventName, parameters = {}) => {
    if (!hasUserConsent || !consentData?.analytics) {
      console.log('📊 Analytics tracking blocked - no consent');
      return;
    }

    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        // Add default parameters
        timestamp: new Date().toISOString(),
        page_location: window.location.href,
        page_path: window.location.pathname
      });
      console.log('📊 Google Analytics: Event tracked', eventName, parameters);
    }
  };

  const trackAppointmentBooking = (doctorId, serviceType) => {
    trackEvent('appointment_booking', {
      doctor_id: doctorId,
      service_type: serviceType,
      event_category: 'appointment',
      event_label: 'booking_attempt'
    });
  };

  const trackServiceView = (serviceName, servicePrice = null, serviceCategory = null) => {
    trackEvent('service_view', {
      service_name: serviceName,
      service_price: servicePrice,
      service_category: serviceCategory,
      event_category: 'service',
      event_label: 'service_page_view'
    });
  };

  const trackServiceInquiry = (serviceName, servicePrice = null) => {
    trackEvent('service_inquiry', {
      service_name: serviceName,
      service_price: servicePrice,
      event_category: 'service',
      event_label: 'service_inquiry_interest'
    });
  };

  const trackDoctorView = (doctorId, doctorName) => {
    trackEvent('doctor_view', {
      doctor_id: doctorId,
      doctor_name: doctorName,
      event_category: 'doctor',
      event_label: 'doctor_profile_view'
    });
  };

  const trackNewsArticleView = (articleTitle, articleCategory) => {
    trackEvent('article_view', {
      article_title: articleTitle,
      article_category: articleCategory,
      event_category: 'content',
      event_label: 'news_article_read'
    });
  };

  const trackContactForm = (formType) => {
    trackEvent('contact_form_submit', {
      form_type: formType,
      event_category: 'form',
      event_label: 'contact_submission'
    });
  };

  const trackPhoneCall = () => {
    trackEvent('phone_call_click', {
      event_category: 'contact',
      event_label: 'phone_number_click'
    });
  };

  const trackSearch = (searchTerm, resultCount) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
      event_category: 'search',
      event_label: 'site_search'
    });
  };

  return {
    trackEvent,
    trackAppointmentBooking,
    trackServiceView,
    trackServiceInquiry,
    trackDoctorView,
    trackNewsArticleView,
    trackContactForm,
    trackPhoneCall,
    trackSearch,
    canTrack: hasUserConsent && consentData?.analytics
  };
};

export default GoogleAnalytics; 