import React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { formatTimeRemaining } from "../../utils/jwtUtils";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2147483000,
};

/**
 * Banking-style JWT warning — controlled by SessionProvider props (no context).
 */
const TokenExpiryPopup = ({
  open,
  jwtRemainingMs,
  isExtending,
  onExtend,
  onLogout,
}) => {
  if (!open) return null;

  const isExpired = jwtRemainingMs !== null && jwtRemainingMs <= 0;

  return createPortal(
    <div style={overlayStyle} data-testid="token-expiry-popup">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expiry-title"
      >
        <div className="flex items-start mb-4">
          <div
            className={`rounded-full p-3 mr-4 ${
              isExpired ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <AlertCircle
              className={isExpired ? "text-red-600" : "text-amber-600"}
              size={24}
            />
          </div>
          <div className="flex-1">
            <h3
              id="session-expiry-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              {isExpired ? "Sesja wygasła" : "Sesja wkrótce wygaśnie"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isExpired ? (
                "Twoja sesja wygasła. Przedłuż sesję, aby kontynuować pracę, albo wyloguj się."
              ) : (
                <>
                  Twoja sesja wygaśnie za{" "}
                  <strong>
                    {formatTimeRemaining(Math.max(0, jwtRemainingMs || 0))}
                  </strong>
                  . Możesz przedłużyć sesję lub wylogować się.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onExtend?.()}
            disabled={isExtending}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtending ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Przedłużanie...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={18} />
                Przedłuż sesję
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onLogout?.()}
            disabled={isExtending}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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

export default TokenExpiryPopup;
