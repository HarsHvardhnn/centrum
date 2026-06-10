import { DOCUMENT_TYPES } from "./kioskConstants";

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-lg";

export default function KioskVerificationStep({
  isInternational,
  onInternationalChange,
  pesel,
  onPeselChange,
  documentCountry,
  documentType,
  documentNumber,
  dateOfBirth,
  onDocumentChange,
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Weryfikacja tożsamości</h2>
        <p className="text-gray-500">
          {isInternational
            ? "Wprowadź dane dokumentu tożsamości"
            : "Wprowadź swój numer PESEL"}
        </p>
      </div>

      <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={isInternational}
          onChange={(e) => onInternationalChange(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
        />
        <span className="text-sm text-gray-800">
          <strong>Pacjent międzynarodowy (bez PESEL)</strong>
          <span className="block text-gray-500 mt-1">
            Zaznacz, jeśli nie posiadasz numeru PESEL i rejestrujesz się dokumentem tożsamości.
          </span>
        </span>
      </label>

      {!isInternational ? (
        <input
          type="text"
          inputMode="numeric"
          maxLength={11}
          value={pesel}
          onChange={(e) => onPeselChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="w-full text-center text-3xl tracking-widest font-mono border-2 border-teal-200 rounded-xl py-5 focus:border-teal-600 focus:outline-none"
          placeholder="00000000000"
          autoFocus
        />
      ) : (
        <div className="space-y-4 border border-teal-100 rounded-2xl p-5 bg-teal-50/30">
          <h3 className="text-sm font-bold uppercase tracking-wide text-teal-800">Dane dokumentu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kraj wydania dokumentu *
              </label>
              <input
                type="text"
                value={documentCountry}
                onChange={(e) => onDocumentChange("documentCountry", e.target.value)}
                placeholder="np. Niemcy, Polska"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu *</label>
              <select
                value={documentType}
                onChange={(e) => onDocumentChange("documentType", e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {DOCUMENT_TYPES.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numer dokumentu *</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => onDocumentChange("documentNumber", e.target.value)}
                placeholder="Numer dokumentu"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia *</label>
              <input
                type="date"
                value={dateOfBirth ? String(dateOfBirth).slice(0, 10) : ""}
                onChange={(e) => onDocumentChange("dateOfBirth", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            PESEL nie dotyczy pacjentów międzynarodowych. Data urodzenia jest wymagana do weryfikacji
            wieku.
          </p>
        </div>
      )}
    </div>
  );
}
