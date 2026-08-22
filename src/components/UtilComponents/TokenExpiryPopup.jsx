import React from "react";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { formatTimeRemaining } from "../../utils/jwtUtils";
import { useSession } from "../../context/SessionProvider";

/**
 * Banking-style JWT warning — driven by SessionProvider (no local auto-logout).
 */
const TokenExpiryPopup = () => {
  const session = useSession();
  if (!session || session.phase !== "jwtWarning") return null;

  const { jwtRemainingMs, isExtending, extendSession, endSession } = session;
  const isExpired = jwtRemainingMs !== null && jwtRemainingMs <= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
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
            onClick={() => extendSession()}
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
            onClick={() => endSession("manual")}
            disabled={isExtending}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            <LogOut className="mr-2" size={18} />
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiryPopup;
