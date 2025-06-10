import React from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';

const CookiePreferences = () => {
  const {
    showPreferences,
    consentData,
    cookieCategories,
    updateConsent,
    savePreferences,
    closePreferences,
    acceptAll,
    rejectAll
  } = useCookieConsent();

  if (!showPreferences) return null;

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled 
          ? 'bg-gray-300 cursor-not-allowed' 
          : enabled 
            ? 'bg-[#008c8c]' 
            : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Preferencje cookies
            </h2>
            <button
              onClick={closePreferences}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Wybierz kategorie plików cookies, które chcesz zaakceptować. Niezbędne cookies 
              są zawsze aktywne, ponieważ są wymagane do podstawowego funkcjonowania strony.
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(cookieCategories).map(([key, category]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {category.name}
                      {key === 'necessary' && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Zawsze aktywne
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={consentData[key]}
                    disabled={key === 'necessary'}
                    onChange={() => updateConsent(key, !consentData[key])}
                  />
                </div>
                
                <div className="mt-3">
                  <details className="group">
                    <summary className="text-sm text-[#008c8c] cursor-pointer hover:underline">
                      Zobacz szczegóły cookies
                    </summary>
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="mb-1">
                        <strong>Przykładowe cookies:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {category.cookies.map((cookie, index) => (
                          <li key={index}>{cookie}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={rejectAll}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition text-sm font-medium"
              >
                Odrzuć opcjonalne
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 border border-[#008c8c] text-[#008c8c] rounded-md hover:bg-[#008c8c] hover:text-white transition text-sm font-medium"
              >
                Akceptuj wszystkie
              </button>
              <button
                onClick={savePreferences}
                className="px-6 py-2 bg-[#008c8c] text-white rounded-md hover:bg-[#007777] transition text-sm font-medium"
              >
                Zapisz preferencje
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Możesz zmienić swoje preferencje w dowolnym momencie klikając link 
              "Zarządzaj cookies" w stopce strony.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences; 