import React from "react";
import MetaTags from "../../UtilComponents/MetaTags";

const TempPage = () => {
  return (
    <>
      <MetaTags 
        title="Strona tymczasowa"
        description="Strona tymczasowa"
        path="/9173589602"
        robots="noindex"
      />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-gray-800 mb-4">Strona tymczasowa</h1>
          <p className="text-gray-600">Ta strona jest tymczasowa.</p>
        </div>
      </main>
    </>
  );
};

export default TempPage;