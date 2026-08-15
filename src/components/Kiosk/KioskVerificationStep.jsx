import { DOCUMENT_TYPES } from "./kioskConstants";
import KioskNumericEntry from "./KioskNumericEntry";

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
  disabled = false,
}) {
  if (isInternational) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dane dokumentu tożsamości</h2>
          <p className="text-gray-500">Wprowadź dane dokumentu, aby kontynuować rejestrację</p>
        </div>

        <div className="space-y-4 border border-teal-100 rounded-2xl p-5 bg-teal-50/30">
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

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onInternationalChange(false)}
            className="text-sm text-teal-700 hover:text-teal-800 hover:underline font-medium"
          >
            Mam numer PESEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Podaj numer PESEL</h2>
        <p className="text-gray-500 text-sm">Wpisz PESEL, aby kontynuować rejestrację</p>
      </div>

      <KioskNumericEntry
        value={pesel}
        onChange={onPeselChange}
        maxLength={11}
        size="pesel"
        compactKeypad
        showActiveCursor
        disabled={disabled}
        enableHardwareKeyboard
        autoFocus
      />

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onInternationalChange(true)}
          className="text-sm sm:text-base text-gray-600 hover:text-teal-700 hover:underline font-medium px-4 py-2"
        >
          Nie posiadam numeru PESEL (Pacjent zagraniczny)
        </button>
      </div>
    </div>
  );
}
