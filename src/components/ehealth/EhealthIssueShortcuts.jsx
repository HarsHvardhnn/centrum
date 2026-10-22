import React from "react";
import { Pill, FilePlus, FileCheck } from "lucide-react";

const ACTIONS = [
  { service: "prescription", label: "E-recepta", icon: Pill, className: "border-emerald-200 bg-emerald-50 text-[#0D5C46] hover:bg-emerald-100 hover:border-[#0D5C46]" },
  { service: "referral", label: "E-skierowanie", icon: FilePlus, className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-600" },
  { service: "ezla", label: "e-ZLA", icon: FileCheck, className: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-600" },
];

const EhealthIssueShortcuts = ({ onIssue }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-3">
    <div className="text-xs font-medium text-gray-500 mb-2">Wystaw dla tej wizyty</div>
    <div className="grid grid-cols-3 gap-2">
      {ACTIONS.map(({ service, label, icon: Icon, className }) => (
        <button
          key={service}
          type="button"
          onClick={() => onIssue(service)}
          className={`flex flex-col items-center gap-1.5 rounded-lg border px-1.5 py-3 ${className}`}
        >
          <Icon size={18} strokeWidth={2} />
          <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default EhealthIssueShortcuts;
