import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import { formatKioskDocumentLabel } from "./kioskConstants";
import { VOIVODESHIPS } from "./kioskShared";
import SignaturePad from "./SignaturePad";
import KioskNumericEntry from "./KioskNumericEntry";
import { formatPolishPostalCode } from "../../utils/postalCodeUtils";
import { getRequiredPhoneLength } from "../../utils/phoneUtils";

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-lg";

export function KioskPersonalStep({ form, onChange, readOnly }) {
  const update = (field, value) => onChange({ ...form, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            readOnly={readOnly}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            readOnly={readOnly}
            className={inputClass}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {form.isInternationalPatient ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dokument</label>
              <input
                type="text"
                value={formatKioskDocumentLabel(form) || ""}
                readOnly
                className={`${inputClass} bg-gray-50`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kraj wydania</label>
              <input
                type="text"
                value={form.documentCountry || ""}
                readOnly
                className={`${inputClass} bg-gray-50`}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL</label>
            <input type="text" value={form.pesel} readOnly className={`${inputClass} bg-gray-50`} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia</label>
          <input
            type={form.isInternationalPatient ? "date" : "text"}
            value={form.dateOfBirth ? String(form.dateOfBirth).slice(0, 10) : ""}
            onChange={
              form.isInternationalPatient
                ? (e) => update("dateOfBirth", e.target.value)
                : undefined
            }
            readOnly={!form.isInternationalPatient}
            className={`${inputClass} ${form.isInternationalPatient ? "bg-white" : "bg-gray-50"}`}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Płeć *</label>
        <select
          value={form.sex}
          onChange={(e) => update("sex", e.target.value)}
          disabled={readOnly}
          className={`${inputClass} bg-white`}
          required
        >
          <option value="">Wybierz płeć</option>
          <option value="Male">Mężczyzna</option>
          <option value="Female">Kobieta</option>
          <option value="Others">Inna</option>
        </select>
      </div>
    </div>
  );
}

export function KioskAddressStep({ form, onChange }) {
  const update = (field, value) => onChange({ ...form, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ulica *</label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => update("street", e.target.value)}
          className={inputClass}
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
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Miejscowość *</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Województwo *</label>
          <select
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            className={`${inputClass} bg-white`}
            required
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
  );
}

export function KioskContactStep({ form, onChange }) {
  const update = (field, value) => onChange({ ...form, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod kraju</label>
          <select
            value={form.phoneCode}
            onChange={(e) => update("phoneCode", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            {PHONE_COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.country}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Telefon *</label>
          <KioskNumericEntry
            value={form.phone}
            onChange={(value) => {
              const maxLength = getRequiredPhoneLength(form.phoneCode || "+48");
              update("phone", value.slice(0, maxLength));
            }}
            maxLength={getRequiredPhoneLength(form.phoneCode || "+48")}
            size="sm"
            compactKeypad
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (opcjonalnie)</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function KioskSignatureStep({ form, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Podpisz poniżej, aby potwierdzić zgody i oświadczenia. Podpis zostanie umieszczony na
        dokumentach rejestracyjnych.
      </p>
      <SignaturePad label="Podpis pacjenta *" onChange={(sig) => onChange({ ...form, signature: sig })} />
    </div>
  );
}
