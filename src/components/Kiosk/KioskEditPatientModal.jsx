import { X } from "lucide-react";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import { DOCUMENT_TYPES } from "./kioskConstants";
import { VOIVODESHIPS } from "./kioskShared";
import KioskDateInput from "./KioskDateInput";

export default function KioskEditPatientModal({ form, onChange, onClose, onSave, readOnlyPesel = true }) {
  const update = (field, value) => onChange({ ...form, [field]: value });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Edytuj dane pacjenta</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Imię" value={form.firstName} onChange={(v) => update("firstName", v)} />
            <Field label="Nazwisko" value={form.lastName} onChange={(v) => update("lastName", v)} />
          </div>
          {form.isInternationalPatient ? (
            <>
              <Field label="Kraj wydania dokumentu" value={form.documentCountry} onChange={(v) => update("documentCountry", v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu</label>
                <select
                  value={form.documentType || ""}
                  onChange={(e) => update("documentType", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                >
                  {DOCUMENT_TYPES.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Numer dokumentu" value={form.documentNumber} onChange={(v) => update("documentNumber", v)} />
            </>
          ) : (
            <Field
              label="PESEL"
              value={form.pesel}
              onChange={(v) => update("pesel", v)}
              readOnly={readOnlyPesel}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data urodzenia</label>
            <KioskDateInput
              value={form.dateOfBirth ? String(form.dateOfBirth).slice(0, 10) : ""}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              readOnly={!form.isInternationalPatient}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kod kraju</label>
              <select
                value={form.phoneCode}
                onChange={(e) => update("phoneCode", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
              >
                {PHONE_COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Field
                label="Telefon"
                value={form.phone}
                onChange={(v) =>
                  update("phone", v.replace(/\D/g, "").slice(0, form.isInternationalPatient ? 15 : 9))
                }
              />
            </div>
          </div>
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
          <Field label="Ulica" value={form.street} onChange={(v) => update("street", v)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kod pocztowy" value={form.zipCode} onChange={(v) => update("zipCode", v)} />
            <Field label="Miasto" value={form.city} onChange={(v) => update("city", v)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Województwo</label>
            <select
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
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

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800 font-medium"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", maxLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        readOnly={readOnly}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 ${
          readOnly ? "bg-gray-50 text-gray-600" : ""
        }`}
      />
    </div>
  );
}
