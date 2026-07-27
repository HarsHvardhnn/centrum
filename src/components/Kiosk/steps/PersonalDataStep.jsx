import { useEffect } from "react";
import { getGenderFromPesel } from "../../../utils/peselUtils";
import { formatPolishDate } from "../../../utils/dateUtils";

const VOIVODESHIPS = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie",
  "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", 
  "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
  "wielkopolskie", "zachodniopomorskie",
];

export default function PersonalDataStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Auto-detect gender from PESEL for Polish patients (unless in fallback mode)
  useEffect(() => {
    if (patientType !== 'international' && !formData.peselFallbackMode && formData.pesel && formData.pesel.length === 11) {
      const detectedGender = getGenderFromPesel(formData.pesel);
      if (detectedGender) {
        // Map to the values used in the select options
        const genderValue = detectedGender === "Mężczyzna" ? "Male" : "Female";
        if (formData.sex !== genderValue) {
          update("sex", genderValue);
        }
      }
    }
  }, [formData.pesel, patientType, formData.sex, formData.peselFallbackMode]);

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    if (!formData.firstName?.trim()) errors.push("Imię jest wymagane.");
    if (!formData.lastName?.trim()) errors.push("Nazwisko jest wymagane.");
    if (!formData.sex?.trim()) errors.push("Płeć jest wymagana.");
    
    if (patientType !== 'international') {
      if (!formData.pesel || String(formData.pesel).replace(/\D/g, "").length !== 11) {
        errors.push("PESEL musi mieć 11 cyfr.");
      }
      
      // For PESEL fallback mode, require manual DOB if not auto-extracted
      if (formData.peselFallbackMode && !formData.dateOfBirth) {
        errors.push("Data urodzenia jest wymagana.");
      }
    } else {
      if (!formData.documentCountry?.trim()) errors.push("Kraj wydania dokumentu jest wymagany.");
      if (!formData.documentType?.trim()) errors.push("Typ dokumentu jest wymagany.");
      if (!formData.documentNumber?.trim()) errors.push("Numer dokumentu jest wymagany.");
      if (!formData.documentIssueDate) errors.push("Data wydania dokumentu jest wymagana.");
      if (!formData.documentExpiryDate) errors.push("Data wygaśnięcia dokumentu jest wymagana.");
      if (!formData.dateOfBirth) errors.push("Data urodzenia jest wymagana.");
      
      // Additional validation for document dates
      if (formData.documentIssueDate && formData.documentExpiryDate) {
        const issueDate = new Date(formData.documentIssueDate);
        const expiryDate = new Date(formData.documentExpiryDate);
        const today = new Date();
        
        if (issueDate > today) {
          errors.push("Data wydania dokumentu nie może być w przyszłości.");
        }
        if (expiryDate < today) {
          errors.push("Dokument jest już wygasły.");
        }
        if (issueDate >= expiryDate) {
          errors.push("Data wydania musi być wcześniejsza niż data wygaśnięcia.");
        }
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, patientType, onValidationChange]);

  return (
    <div className="space-y-6">
      {isSignOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
          <p className="font-medium">Pacjent jest już w systemie.</p>
          <p>Sprawdź dane poniżej i przejdź do dalszych kroków.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imię *</label>
          <input
            type="text"
            value={formData.firstName || ""}
            onChange={(e) => update("firstName", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko *</label>
          <input
            type="text"
            value={formData.lastName || ""}
            onChange={(e) => update("lastName", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
      </div>

      {patientType !== 'international' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PESEL *</label>
            <input
              type="text"
              value={formData.pesel || ""}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data urodzenia {formData.peselFallbackMode ? "*" : ""}
            </label>
            {formData.peselFallbackMode ? (
              // Fallback: manually entered DOB takes priority
              <input
                type="date"
                value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ""}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              // Valid PESEL: DOB extracted from PESEL (read-only)
              <input
                type="text"
                value={formatPolishDate(formData.dateOfBirth) || ""}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-lg"
              />
            )}
          </div>
        </div>
      ) : (
        // International patient fields
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kraj wydania dokumentu *</label>
              <input
                type="text"
                value={formData.documentCountry || ""}
                onChange={(e) => update("documentCountry", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Typ dokumentu *</label>
              <select
                value={formData.documentType || ""}
                onChange={(e) => update("documentType", e.target.value)}
                disabled={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Wybierz typ dokumentu</option>
                <option value="Passport">Paszport</option>
                <option value="ID Card">Dowód osobisty</option>
                <option value="Residence Card">Karta pobytu</option>
                <option value="Other">Inny</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numer dokumentu *</label>
              <input
                type="text"
                value={formData.documentNumber || ""}
                onChange={(e) => update("documentNumber", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data urodzenia *</label>
              <input
                type="date"
                value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ""}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Document dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data wydania dokumentu *</label>
              <input
                type="date"
                value={formData.documentIssueDate || ""}
                onChange={(e) => update("documentIssueDate", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data wygaśnięcia dokumentu *</label>
              <input
                type="date"
                value={formData.documentExpiryDate || ""}
                onChange={(e) => update("documentExpiryDate", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Fallback mode notification for Polish patients */}
      {formData.peselFallbackMode && patientType !== 'international' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm">
          <p className="font-medium">Tryb wprowadzania ręcznego</p>
          <p>
            PESEL nie przeszedł walidacji — wprowadź datę urodzenia i płeć ręcznie.
            Te dane mają pierwszeństwo i zostaną sprawdzone przez personel.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Płeć *</label>
        {patientType !== 'international' ? (
          formData.peselFallbackMode ? (
            // Fallback: manually entered gender takes priority
            <select
              value={formData.sex || ""}
              onChange={(e) => update("sex", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Wybierz płeć</option>
              <option value="Male">Mężczyzna</option>
              <option value="Female">Kobieta</option>
              <option value="Others">Inna</option>
            </select>
          ) : (
            // Valid PESEL: gender extracted from PESEL (read-only)
            <input
              type="text"
              value={formData.sex === "Male" ? "Mężczyzna" : formData.sex === "Female" ? "Kobieta" : ""}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-lg"
            />
          )
        ) : (
          // For international patients, allow manual selection
          <select
            value={formData.sex || ""}
            onChange={(e) => update("sex", e.target.value)}
            disabled={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="">Wybierz płeć</option>
            <option value="Male">Mężczyzna</option>
            <option value="Female">Kobieta</option>
            <option value="Others">Inna</option>
          </select>
        )}
      </div>
    </div>
  );
}