import { useState, useEffect, useRef } from "react";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import SignaturePad from "./SignaturePad";
import { formatPolishPostalCode } from "../../utils/postalCodeUtils";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../utils/phoneUtils";

const VOIVODESHIPS = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie",
  "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", 
  "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
  "wielkopolskie", "zachodniopomorskie",
];

const DOCUMENT_TYPES = [
  { value: "", label: "Wybierz typ dokumentu" },
  { value: "Passport", label: "Paszport" },
  { value: "ID Card", label: "Dowód osobisty" },
  { value: "Residence Card", label: "Karta pobytu" },
  { value: "Other", label: "Inny dokument" },
];

export default function InternationalRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  loading = false,
}) {
  const [form, setForm] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    documentType: initialData.documentType || "",
    documentNumber: initialData.documentNumber || "",
    documentCountry: initialData.documentCountry || "",
    dateOfBirth: initialData.dateOfBirth
      ? String(initialData.dateOfBirth).slice(0, 10)
      : "",
    sex: initialData.sex || "",
    street: initialData.street || "",
    zipCode: initialData.zipCode || "",
    city: initialData.city || "",
    province: initialData.province || initialData.state || "",
    phoneCode: initialData.phoneCode || "+48",
    phone: initialData.phone || "",
    email: initialData.email || "",
    consentHealthcare: initialData.consentHealthcare !== false,
    consentHealthCampaigns: !!initialData.consentHealthCampaigns,
    consentMarketing: !!initialData.consentMarketing,
    consentExamination: initialData.consentExamination !== false,
    signature: "",
    // ID document photos
    idPhotoFront: "",
    idPhotoBack: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const autoSaveTimer = useRef(null);
  useEffect(() => {
    if (!onAutoSave) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      onAutoSave(form).catch(() => {});
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, onAutoSave]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ ...form, isInternationalPatient: true });
  };

  const handlePhotoCapture = (field) => {
    // Simple file input for now - could be enhanced with camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          update(field, reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {isSignOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm space-y-2">
          <p className="font-medium">Pacjent międzynarodowy już w systemie.</p>
          <p>Sprawdź dane poniżej i podpisz wymagane dokumenty rejestracyjne.</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-gray-800">
            <div><span className="text-gray-500 text-xs">Imię i nazwisko</span><p className="font-medium">{form.firstName} {form.lastName}</p></div>
            <div><span className="text-gray-500 text-xs">Dokument</span><p className="font-medium">{form.documentType} {form.documentNumber}</p></div>
            <div><span className="text-gray-500 text-xs">Telefon</span><p className="font-medium">{form.phoneCode} {form.phone || "—"}</p></div>
            <div><span className="text-gray-500 text-xs">E-mail</span><p className="font-medium">{form.email || "—"}</p></div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dane osobowe</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia *</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Płeć *</label>
            <select
              value={form.sex}
              onChange={(e) => update("sex", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
              required
            >
              <option value="">Wybierz płeć</option>
              <option value="Male">Mężczyzna</option>
              <option value="Female">Kobieta</option>
              <option value="Others">Inna</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dokument tożsamości</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu *</label>
            <select
              value={form.documentType}
              onChange={(e) => update("documentType", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
              required
            >
              {DOCUMENT_TYPES.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numer dokumentu *</label>
            <input
              type="text"
              value={form.documentNumber}
              onChange={(e) => update("documentNumber", e.target.value.toUpperCase())}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kraj wydania dokumentu *</label>
          <input
            type="text"
            value={form.documentCountry}
            onChange={(e) => update("documentCountry", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
            placeholder="np. Niemcy, Francja, USA"
            required
          />
        </div>

        {/* ID Photo Capture */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Zdjęcia dokumentu (wymagane)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Przód dokumentu *</label>
              <button
                type="button"
                onClick={() => handlePhotoCapture("idPhotoFront")}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-600"
              >
                {form.idPhotoFront ? "✓ Zdjęcie dodane" : "📷 Dodaj zdjęcie"}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tył dokumentu</label>
              <button
                type="button"
                onClick={() => handlePhotoCapture("idPhotoBack")}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-600"
              >
                {form.idPhotoBack ? "✓ Zdjęcie dodane" : "📷 Dodaj zdjęcie"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Adres zamieszkania</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ulica i numer *</label>
          <input
            type="text"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy *</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => {
                const formatted = formatPolishPostalCode(e.target.value);
                update("zipCode", formatted);
              }}
              placeholder="00-000"
              maxLength="6"
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Miasto *</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Województwo</label>
            <select
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
            >
              <option value="">Wybierz</option>
              {VOIVODESHIPS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dane kontaktowe</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod kraju</label>
            <select
              value={form.phoneCode}
              onChange={(e) => update("phoneCode", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
            >
              {PHONE_COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(form.phoneCode);
                update("phone", formatted.slice(0, maxLength));
              }}
              placeholder={form.phoneCode === "+48" ? "123456789" : ""}
              maxLength={getRequiredPhoneLength(form.phoneCode)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (opcjonalnie)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
        </div>
      </div>

      {/* Consents */}
      <div className="bg-teal-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Zgody</h3>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-teal-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              <strong>Zgoda na przetwarzanie danych osobowych (wymagana) *</strong><br />
              z organizacją udzielanych świadczeń opieki zdrowotnej (w tym przypomnienie o wizycie)
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.consentHealthCampaigns}
              onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.consentMarketing}
              onChange={(e) => update("consentMarketing", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
          <span className="text-sm text-gray-700">
            z otrzymywaniem newslettera z informacjami marketingowymi
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-teal-200 bg-white cursor-pointer">
          <input
            type="checkbox"
            checked={form.consentExamination}
            onChange={(e) => update("consentExamination", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">
            <strong>Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego (wymagana) *</strong><br />
            Wyrażam zgodę na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego
          </span>
        </label>
      </div>
    </div>

      {/* Signature */}
      <div className="bg-gray-50 rounded-xl p-4">
        <SignaturePad
          label="Podpis pacjenta *"
          onChange={(sig) => update("signature", sig)}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.signature || !form.consentHealthcare || !form.consentExamination || !form.idPhotoFront}
        className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl"
      >
        {loading ? "Zapisywanie..." : "Zakończ rejestrację"}
      </button>
    </form>
  );
}