import React from "react";
import { Pill, FilePlus, FileCheck } from "lucide-react";

const ACTIONS = [
  { service: "prescription", label: "E-recepta", icon: Pill },
  { service: "referral", label: "E-skierowanie", icon: FilePlus },
  { service: "ezla", label: "e-ZLA", icon: FileCheck },
];

const EhealthIssueShortcuts = ({ onIssue }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-3">
    <div className="text-xs font-medium text-gray-500 mb-2">Wystaw dla tej wizyty</div>
    <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ service, label, icon: Icon }) => (
        <button
          key={service}
          type="button"
          onClick={() => onIssue(service)}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-1.5 py-3 text-teal-900 hover:bg-teal-100 hover:border-teal-400"
        >
          <Icon size={18} strokeWidth={2} />
          <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default EhealthIssueShortcuts;
