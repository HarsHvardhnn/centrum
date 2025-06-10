import React from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';

const CookieSettingsLink = ({ className = '', children = 'Zarządzaj cookies' }) => {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      onClick={openPreferences}
      className={`text-[#008c8c] hover:underline ${className}`}
    >
      {children}
    </button>
  );
};

export default CookieSettingsLink; 