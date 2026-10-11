import React, { useState } from "react";
import VisitIssuedDocuments from "../../../../ehealth/VisitIssuedDocuments";

const SECTION_BG = "bg-white";

export const EzlaSection = ({
  onOpenIssue,
  onCopy,
  visitId,
  patientId,
  patientPhone,
  refreshKey = 0,
  onDocumentsChanged,
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
        <h2 className="text-base font-semibold text-gray-800">e-ZLA</h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onOpenIssue}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800"
            >
              + Nowe e-ZLA
            </button>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase mb-2">Wystawione podczas tej wizyty</p>
            <VisitIssuedDocuments
              service="ezla"
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
