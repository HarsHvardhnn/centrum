import React from 'react';
import MetaTags from '../../UtilComponents/MetaTags';

const PrivacyPolicyPage = () => {
  return (
    <>
      <MetaTags 
        title="Polityka Prywatności - Centrum Medyczne 7"
        description="Polityka ochrony danych osobowych w Centrum Medycznym 7 w Skarżysku-Kamiennej"
        path="/polityka-prywatnosci"
      />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Polityka Prywatności</h1>
            
            {/* PDF Viewer */}
            <div className="w-full h-screen">
              <iframe
                src="/polityka-prywatnosci.pdf"
                className="w-full h-full border-0 rounded-lg"
                title="Polityka Prywatności Centrum Medyczne 7"
              />
            </div>
            
            {/* Fallback content if PDF doesn't load */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Jeśli dokument nie wyświetla się poprawnie, możesz go pobrać klikając{' '}
                <a 
                  href="/polityka-prywatnosci.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 underline"
                >
                  tutaj
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage; 