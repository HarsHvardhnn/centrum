import React from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';

const CookieConsent = () => {
  const {
    showBanner,
    acceptAll,
    rejectAll,
    openPreferences
  } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t-2 border-[#008c8c] z-50">
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-3xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Pliki cookies i prywatność
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nasza strona wykorzystuje pliki cookies w celu zapewnienia najlepszego doświadczenia użytkownika. 
              Używamy niezbędnych plików cookies do podstawowego funkcjonowania strony oraz opcjonalnych 
              cookies analitycznych i marketingowych, które pomagają nam ulepszać nasze usługi. 
              Możesz zarządzać swoimi preferencjami lub odrzucić opcjonalne cookies.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Więcej informacji znajdziesz w naszej{' '}
              <a href="/privacy-policy" className="text-[#008c8c] hover:underline">
                polityce prywatności
              </a>
              .
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <button 
              onClick={openPreferences}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              Zarządzaj preferencjami
            </button>
            <button 
              onClick={rejectAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition text-sm font-medium"
            >
              Odrzuć opcjonalne
            </button>
            <button 
              onClick={acceptAll}
              className="px-6 py-2 bg-[#008c8c] text-white rounded-md hover:bg-[#007777] transition text-sm font-medium"
            >
              Akceptuj wszystkie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 