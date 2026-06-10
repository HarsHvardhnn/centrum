import { BadgeCheck, Cake, Mail, MapPin, Phone, CreditCard } from "lucide-react";
import { formatKioskAddress, formatKioskDate, formatKioskDocumentLabel } from "./kioskConstants";

export default function KioskPatientSummaryCard({ form, onEdit, verified = true }) {
  const fullName = `${form.firstName || ""} ${form.lastName || ""}`.trim() || "—";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
            {verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full">
                <BadgeCheck size={14} />
                Zweryfikowany
              </span>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 text-sm font-medium"
          >
            Edytuj dane
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {form.isInternationalPatient ? (
          <>
            <SummaryItem
              icon={CreditCard}
              label="Dokument"
              value={formatKioskDocumentLabel(form) || "—"}
            />
            <SummaryItem icon={CreditCard} label="Kraj wydania" value={form.documentCountry || "—"} />
          </>
        ) : (
          <SummaryItem icon={CreditCard} label="PESEL" value={form.pesel || "—"} />
        )}
        <SummaryItem
          icon={Cake}
          label="Data urodzenia"
          value={formatKioskDate(form.dateOfBirth)}
        />
        <SummaryItem
          icon={Phone}
          label="Telefon"
          value={form.phone ? `${form.phoneCode || "+48"} ${form.phone}` : "—"}
        />
        <SummaryItem icon={Mail} label="Email" value={form.email || "—"} />
        <SummaryItem
          icon={MapPin}
          label="Adres zamieszkania"
          value={formatKioskAddress(form) || "—"}
          className="sm:col-span-2 lg:col-span-2"
        />
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
