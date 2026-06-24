import { useState, useEffect, useRef } from "react";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import SignaturePad from "./SignaturePad";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";

const VOIVODESHIPS = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie",
  "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", 
  "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
  "wielkopolskie", "zachodniopomorskie",
];

export default function MinorRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  loading = false,
}) {
  const [form, setForm] = useState({
    // Minor patient data
    pesel: initialData.pesel || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
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
    
    // Guardian data
    guardianFirstName: initialData.guardianFirstName || "",
    guardianLastName: initialData.guardianLastName || "",
    guardianPesel: initialData.guardianPesel || "",
    guardianPhoneCode: initialData.guardianPhoneCode || "+48",
    guardianPhone: initialData.guardianPhone || "",
    guardianEmail: initialData.guardianEmail || "",
    guardianRelation: initialData.guardianRelation || "rodzic",
    
    // Consents
    consentHealthcare: initialData.consentHealthcare !== false,
    consentHealthCampaigns: !!initialData.consentHealthCampaigns,
    consentMarketing: !!initialData.consentMarketing,
    
    // Signatures
    signature: "", // Patient signature (only for 16-17 year olds)
    guardianSignature: "", // Guardian signature (required for all minors)
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Determine patient type based on current data
  const patientType = detectPatientType(form);
  const requiresPatientSignature = patientType === PATIENT_TYPES.MINOR_16_17;
  
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
    onSubmit?.(form);
  };

  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {isSignOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm space-y-2">
          <p className="font-medium">Pacjent niepełnoletni już w systemie.</p>
          <p>Sprawdź dane poniżej i podpisz wymagane dokumenty rejestracyjne.</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-gray-800">
            <div><span className="text-gray-500 text-xs">Pacjent</span><p className="font-medium">{form.firstName} {form.lastName}</p></div>
            <div><span className="text-gray-500 text-xs">PESEL</span><p className="font-medium">{form.pesel}</p></div>
            <div><span className="text-gray-500 text-xs">Opiekun</span><p className="font-medium">{form.guardianFirstName} {form.guardianLastName}</p></div>
            <div><span className="text-gray-500 text-xs">Telefon</span><p className="font-medium">{form.phoneCode} {form.phone || "—"}</p></div>
          </div>
        </div>
      )}

      {/* Age Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-lg">👶</span>
          <div>
            <p className="font-medium">
              {patientType === PATIENT_TYPES.MINOR_UNDER_16 
                ? "Pacjent poniżej 16 roku życia"
                : "Pacjent 16-17 lat"
              }
            </p>
            <p>
              {patientType === PATIENT_TYPES.MINOR_UNDER_16
                ? "Wymagana jest tylko zgoda i podpis opiekuna prawnego."
                : "Wymagane są podpisy zarówno pacjenta jak i opiekuna prawnego."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Minor Patient Information */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dane pacjenta</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL *</label>
            <input
              type="text"
              value={form.pesel}
              onChange={(e) => update("pesel", e.target.value.replace(/\D/g, "").slice(0, 11))}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono"
              maxLength={11}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia</label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            readOnly={readOnlyFields}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
          />
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
              onChange={(e) => update("zipCode", e.target.value)}
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
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 9))}
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

      {/* Guardian Information */}
      <div className="bg-yellow-50 rounded-xl p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dane opiekuna prawnego</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię opiekuna *</label>
            <input
              type="text"
              value={form.guardianFirstName}
              onChange={(e) => update("guardianFirstName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko opiekuna *</label>
            <input
              type="text"
              value={form.guardianLastName}
              onChange={(e) => update("guardianLastName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL opiekuna *</label>
            <input
              type="text"
              value={form.guardianPesel}
              onChange={(e) => update("guardianPesel", e.target.value.replace(/\D/g, "").slice(0, 11))}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono"
              maxLength={11}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pokrewieństwo</label>
            <select
              value={form.guardianRelation}
              onChange={(e) => update("guardianRelation", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
            >
              <option value="rodzic">Rodzic</option>
              <option value="opiekun prawny">Opiekun prawny</option>
              <option value="dziadek/babcia">Dziadek/Babcia</option>
              <option value="inny">Inny</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod kraju</label>
            <select
              value={form.guardianPhoneCode}
              onChange={(e) => update("guardianPhoneCode", e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon opiekuna *</label>
            <input
              type="tel"
              value={form.guardianPhone}
              onChange={(e) => update("guardianPhone", e.target.value.replace(/\D/g, "").slice(0, 9))}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail opiekuna (opcjonalnie)</label>
          <input
            type="email"
            value={form.guardianEmail}
            onChange={(e) => update("guardianEmail", e.target.value)}
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
        </div>
      </div>

      {/* Signatures */}
      <div className="space-y-6">
        {requiresPatientSignature && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Blok A - Podpis pacjenta (16-17 lat)
            </h4>
            <SignaturePad
              label="Podpis pacjenta *"
              onChange={(sig) => update("signature", sig)}
            />
          </div>
        )}

        <div className="bg-yellow-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {requiresPatientSignature ? "Blok B - Podpis opiekuna prawnego" : "Podpis opiekuna prawnego"}
          </h4>
          <SignaturePad
            label="Podpis opiekuna prawnego *"
            onChange={(sig) => update("guardianSignature", sig)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={
          loading || 
          !form.guardianSignature || 
          !form.consentHealthcare ||
          (requiresPatientSignature && !form.signature)
        }
        className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl"
      >
        {loading ? "Zapisywanie..." : "Zakończ rejestrację"}
      </button>
    </form>
  );
}