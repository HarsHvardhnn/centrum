import React from "react";
import { X, Construction } from "lucide-react";

/**
 * Modal shown when the doctor clicks e-recepta, e-skierowanie, or similar
 * features that are not yet implemented. Keeps buttons visible but informs
 * that the feature is in development.
 */
const FeatureComingSoonModal = ({ isOpen, onClose, featureName = "Ta funkcja" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-labelledby="feature-coming-soon-title"
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Construction className="w-6 h-6 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="feature-coming-soon-title"
              className="text-lg font-semibold text-gray-900 mb-1"
            >
              {featureName} — w przygotowaniu
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Funkcja jest obecnie w trakcie wdrażania. Administrator poinformuje
              Cię, gdy będzie gotowa do użycia. Dokument nie został wystawiony.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureComingSoonModal;
