import React, { useState } from "react";
import VisitIssuedDocuments from "../../../../ehealth/VisitIssuedDocuments";

const SECTION_BG = "bg-white";

export const MedicationsSection = ({
  medications = [],
  onRemoveMedication,
  visitId,
  patientId,
  patientPhone,
  refreshKey = 0,
  onDocumentsChanged,
  onOpenIssue,
  onCopy,
  className = "",
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${SECTION_BG} rounded border border-gray-200 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-base font-semibold text-gray-800">Leki</h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {medications.length > 0 && <span className="text-xs text-gray-500">Z kartoteki:</span>}
              {medications.map((medication, index) => (
                <span key={`${medication.name}-${index}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-800">
                  {[medication.name, medication.dosage].filter(Boolean).join(" ")}
                  <button type="button" onClick={() => onRemoveMedication?.(index)} className="text-gray-400 hover:text-gray-700" aria-label="Usuń z kartoteki">×</button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenIssue}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
            >
              + Nowa e-recepta
            </button>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase mb-2">Wystawione podczas tej wizyty</p>
            <VisitIssuedDocuments
              service="prescription"
              visitId={visitId}
              patientId={patientId}
              patientPhone={patientPhone}
              refreshKey={refreshKey}
              onCopy={onCopy}
              onChanged={onDocumentsChanged}
            />
          </div>
        </div>
      )}
    </div>
  );
};
