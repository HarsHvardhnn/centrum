import React from 'react';
import MetaTags from '../../UtilComponents/MetaTags';

const TermsPage = () => {
  return (
    <>
      <MetaTags 
        title="Regulamin - Centrum Medyczne 7"
        description="Regulamin świadczenia usług medycznych w Centrum Medycznym 7 w Skarżysku-Kamiennej"
        path="/regulamin"
      />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Regulamin</h1>
            
            {/* PDF Viewer */}
            <div className="w-full h-screen">
              <iframe
                src="/regulamin.pdf"
                className="w-full h-full border-0 rounded-lg"
                title="Regulamin Centrum Medyczne 7"
              />
            </div>
            
            {/* Fallback content if PDF doesn't load */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Jeśli dokument nie wyświetla się poprawnie, możesz go pobrać klikając{' '}
                <a 
                  href="/regulamin.pdf" 
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

export default TermsPage; 