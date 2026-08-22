import React from "react";
import { createPortal } from "react-dom";
import { Clock, LogOut } from "lucide-react";
import { formatTimeRemaining } from "../../utils/jwtUtils";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2147482999,
};

/**
 * Idle warning — controlled by SessionProvider props (no context).
 */
const InactivityPopup = ({
  open,
  idlePromptRemainingMs,
  isExtending,
  onStayActive,
  onLogout,
}) => {
  if (!open) return null;

  return createPortal(
    <div
      style={overlayStyle}
      data-testid="inactivity-popup"
      onClick={() => {
        if (!isExtending) onStayActive?.();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start mb-4">
          <div className="rounded-full p-3 mr-4 bg-orange-100">
            <Clock className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Brak aktywności wykryty
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nie wykryto żadnej aktywności przez określony czas. Zostaniesz
              automatycznie wylogowany za{" "}
              <strong>
                {formatTimeRemaining(Math.max(0, idlePromptRemainingMs || 0))}
              </strong>
              . Aby pozostać w systemie, kliknij &quot;Pozostań aktywny&quot;.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onStayActive?.()}
            disabled={isExtending}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="mr-2" size={18} />
            {isExtending ? "Przedłużanie..." : "Pozostań aktywny"}
          </button>
          <button
            type="button"
            onClick={() => onLogout?.()}
            disabled={isExtending}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            <LogOut className="mr-2" size={18} />
            Wyloguj się
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InactivityPopup;
