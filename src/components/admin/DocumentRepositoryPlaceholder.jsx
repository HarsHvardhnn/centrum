import React from "react";
import { FileStack } from "lucide-react";

/**
 * Placeholder for Szablony dokumentów (document repository).
 * Future: file/document templates repository.
 */
const DocumentRepositoryPlaceholder = () => (
  <div className="bg-white min-h-screen flex items-center justify-center p-8">
    <div className="max-w-md text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-4">
        <FileStack size={32} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Szablony dokumentów</h1>
      <p className="text-gray-500 mb-6">
        Zarządzanie repozytorium plików i wzorów dokumentacji będzie dostępne wkrótce.
      </p>
      <p className="text-sm text-gray-400">
        Strona w przygotowaniu.
      </p>
    </div>
  </div>
);

export default DocumentRepositoryPlaceholder;
