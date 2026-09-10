import React from "react";
import { FileText, Printer } from "lucide-react";

/**
 * After generating a visit card (first time) or when one already exists:
 * open in a tab, or print without opening (same pattern as invoices).
 */
const VisitCardActionModal = ({
  isOpen,
  onClose,
  mode = "ready",
  onOpen,
  onPrint,
  onGenerateNew,
}) => {
  if (!isOpen) return null;

  const isExists = mode === "exists";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <FileText className="text-teal-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold">
            {isExists ? "Karta wizyty już istnieje" : "Karta wizyty"}
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          {isExists
            ? "Dla tej wizyty została już wygenerowana karta wizyty. Możesz ją otworzyć, wydrukować albo wygenerować nową."
            : "Karta wizyty została wygenerowana. Możesz ją otworzyć albo od razu wydrukować — bez otwierania podglądu."}
        </p>
        <div className="flex flex-nowrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            Anuluj
          </button>
          {isExists && onGenerateNew && (
            <button
              type="button"
              onClick={onGenerateNew}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 whitespace-nowrap"
            >
              Wygeneruj nową
            </button>
          )}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            <Printer size={16} />
            Drukuj
          </button>
          <button
            type="button"
            onClick={() => {
              onOpen();
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
          >
            Otwórz kartę wizyty
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitCardActionModal;
