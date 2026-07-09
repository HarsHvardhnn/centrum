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

export default function AdultRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  loading = false,
}) {
  const [form, setForm] = useState({
    pesel: initialData.pesel || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    dateOfBirth: initialData.dateOfBirth
      ? String(initialData.dateOfBirth).slice(0, 10)
      : "",
    street: initialData.street || "",
    zipCode: initialData.zipCode || "",
    city: initialData.city || "",
    province: initialData.province || initialData.state || "",
    phoneCode: initialData.phoneCode || "+48",
    phone: initialData.phone || "",
    email: initialData.email || "",
    sex: initialData.sex || "",
    consentHealthcare: initialData.consentHealthcare !== false,
    consentHealthCampaigns: !!initialData.consentHealthCampaigns,
    consentMarketing: !!initialData.consentMarketing,
    signature: "",
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
    onSubmit?.(form);
  };

  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
      {isSignOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm space-y-2">
          <p className="font-medium">Pacjent jest już w systemie.</p>
          <p>Sprawdź dane poniżej i podpisz wymagane dokumenty rejestracyjne.</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-gray-800">
            <div><span className="text-gray-500 text-xs">Imię i nazwisko</span><p className="font-medium">{form.firstName} {form.lastName}</p></div>
            <div><span className="text-gray-500 text-xs">PESEL</span><p className="font-medium">{form.pesel}</p></div>
            <div><span className="text-gray-500 text-xs">Telefon</span><p className="font-medium">{form.phoneCode} {form.phone || "—"}</p></div>
            <div><span className="text-gray-500 text-xs">E-mail</span><p className="font-medium">{form.email || "—"}</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">PESEL</label>
          <input
            type="text"
            value={form.pesel}
            readOnly
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia</label>
          <input
            type="text"
            value={form.dateOfBirth}
            readOnly
            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-lg"
          />
        </div>
      </div>

      {!isSignOnly && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Płeć <span className="text-red-600">*</span></label>
            <select
              value={form.sex}
              onChange={(e) => update("sex", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
              required
            >
              <option value="">Wybierz płeć</option>
              <option value="Male">Mężczyzna</option>
              <option value="Female">Kobieta</option>
              <option value="Others">Inna</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ulica</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => update("street", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy</label>
              <input
                type="text"
                value={form.zipCode}
                onChange={(e) => {
                  const formatted = formatPolishPostalCode(e.target.value);
                  update("zipCode", formatted);
                }}
                placeholder="00-000"
                maxLength="6"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Miejscowość</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Województwo</label>
              <select
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
                required
              >
                <option value="">Wybierz</option>
                {VOIVODESHIPS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kod kraju</label>
              <select
                value={form.phoneCode}
                onChange={(e) => update("phoneCode", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
              >
                {PHONE_COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
            />
          </div>
        </>
      )}

      <div className="bg-teal-50 rounded-xl p-4 space-y-4 border border-teal-200">
        <h3 className="text-lg font-semibold text-gray-900">Zgody RODO</h3>
        <div className="text-sm text-gray-700 mb-4">
          „Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO 
          i wyrażam zgodę na przetwarzanie moich danych osobowych przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
        </div>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-teal-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
              required
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

      <SignaturePad
        label="Podpis pacjenta *"
        onChange={(sig) => update("signature", sig)}
      />

      <button
        type="submit"
        disabled={loading || !form.signature || !form.consentHealthcare}
        className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl transition-colors"
      >
        {loading ? "Zapisywanie..." : "Zakończ rejestrację"}
      </button>
    </form>
  );
}
