import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice about cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === null) {
      // If no choice has been made yet, show the banner
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto p-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-gray-800 text-sm sm:text-base mb-4 sm:mb-0 max-w-2xl">
          <p>
            Nasza strona wykorzystuje pliki cookies, aby zapewnić Ci najlepsze doświadczenia. 
            Kontynuując korzystanie z naszej strony, zgadzasz się na wykorzystanie plików cookies 
            zgodnie z naszą polityką prywatności.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={rejectCookies}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Odrzuć
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 bg-[#008c8c] text-white rounded-md hover:bg-[#007777] transition"
          >
            Akceptuj
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 