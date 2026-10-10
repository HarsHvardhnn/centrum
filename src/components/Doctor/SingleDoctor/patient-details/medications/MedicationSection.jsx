import React, { useState } from "react";

const SECTION_BG = "bg-white";

export const MedicationsSection = ({
  visitId,
  patientId,
  onDocumentsChanged,
  onOpenIssue,
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
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-600 mb-3">
            Leki tej wizyty wystawia się w module e-recepty: formularz Rp/Rpw, kontrola kto–gdzie–kiedy i podpis certyfikatem z komputera.
          </p>
          <button
            type="button"
            onClick={onOpenIssue}
            className="px-4 py-2 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold"
          >
            Wystaw e-receptę
          </button>
        </div>
      )}
    </div>
  );
};
