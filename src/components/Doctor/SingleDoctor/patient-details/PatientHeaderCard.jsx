import React from "react";
import { User } from "lucide-react";

const PatientHeaderCard = ({ patient, onShowMoreDetails }) => {
  const name =
    typeof patient?.name === "string"
      ? patient.name
      : [patient?.name?.first, patient?.name?.last].filter(Boolean).join(" ") || "—";
  const age = patient?.age ?? "—";
  const gender =
    patient?.gender === "Male" || patient?.sex === "Male"
      ? "Mężczyzna"
      : patient?.gender === "Female" || patient?.sex === "Female"
      ? "Kobieta"
      : patient?.gender || patient?.sex || "—";
  const patientId = patient?.patientId ?? patient?.patient_id ?? "—";
  const pesel = patient?.govtId || patient?.pesel || patient?.PESEL || "—";

  // Phone: show "—" when empty, only country code (e.g. "+48"), or backend placeholder (_no_phone_*); otherwise ensure area code starts with +
  const rawPhone = patient?.phone != null ? String(patient.phone).trim() : "";
  const isNoPhone =
    !rawPhone ||
    /_no_phone_/i.test(rawPhone) ||
    rawPhone.replace(/\D/g, "").length < 6; // e.g. "+48" or "48" with no subscriber digits, or "+48_no_phone_..."
  const phone = isNoPhone
    ? "—"
    : rawPhone.startsWith("+")
      ? rawPhone
      : rawPhone
        ? `+${rawPhone}`
        : "—";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        {/* Header: avatar + name + age · gender */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-teal-100">
            <User className="w-8 h-8 text-teal-600" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {age} lat · {gender}
            </p>
          </div>
        </div>

        {/* Details: label – value, two-column style */}
        <div className="mt-5 space-y-3">
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-sm text-gray-500">ID:</span>
            <span className="text-sm font-medium text-gray-900 text-right tabular-nums">
              {patientId}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-sm text-gray-500">PESEL:</span>
            <span className="text-sm font-medium text-gray-900 text-right tabular-nums">
              {pesel}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-sm text-gray-500">Telefon:</span>
            <span className="text-sm font-medium text-gray-900 text-right tabular-nums">
              {phone}
            </span>
          </div>
        </div>

        {/* Action: 90% width, teal text, darker gray hover */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => onShowMoreDetails?.()}
            className="w-[90%] px-4 py-2 rounded text-sm font-medium text-teal-600 hover:text-teal-700 bg-gray-50/50 hover:bg-gray-100 transition-colors"
          >
            Pokaż więcej szczegółów
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHeaderCard;
