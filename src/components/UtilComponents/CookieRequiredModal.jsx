import React from "react";
import { createPortal } from "react-dom";
import { Cookie, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2147483001,
};

/**
 * Shown when the httpOnly refresh cookie is missing — usually cookies blocked
 * or cross-site cookies disabled. Gives recovery steps instead of silent logout.
 */
const CookieRequiredModal = ({
  open,
  issue = "refresh_missing",
  isSecure = true,
  isRetrying,
  onRetry,
  onLogout,
}) => {
  if (!open) return null;

  const documentBlocked = issue === "document_blocked";

  return createPortal(
    <div style={overlayStyle} data-testid="cookie-required-modal">
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-required-title"
      >
        <div className="flex items-start mb-4">
          <div className="rounded-full p-3 mr-4 bg-amber-100">
            <Cookie className="text-amber-700" size={24} />
          </div>
          <div className="flex-1">
            <h3
              id="cookie-required-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              Wymagane pliki cookie do utrzymania sesji
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {documentBlocked
                ? "Przeglądarka blokuje zapisywanie plików cookie. Bez nich nie możemy przedłużyć sesji po wygaśnięciu tokenu."
                : "Aplikacja nie otrzymała tokenu odświeżania sesji (cookie httpOnly). Najczęstsze przyczyny: blokada cookie, tryb prywatny z ograniczeniami, wiele kart lub rozszerzenie blokujące śledzenie."}
            </p>

            {!isSecure && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 mb-3 text-sm text-red-800">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p>
                  Strona nie działa w pełni przez HTTPS. Otwórz aplikację przez
                  bezpieczny adres (https://), nie http:// ani mieszany bookmark.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700 space-y-2">
              <p className="font-medium text-gray-900">Co zrobić:</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Użyj tylko jednej karty z aplikacją (zamknij pozostałe).</li>
                <li>
                  Zezwól na pliki cookie dla tej witryny w ustawieniach przeglądarki
                  (Chrome / Edge: Ustawienia → Prywatność → Pliki cookie → witryny
                  mogą używać cookie).
                </li>
                <li>Wyłącz tymczasowo rozszerzenia blokujące cookie lub reklamy.</li>
                <li>Po zmianie ustawień kliknij „Sprawdź ponownie”.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onRetry?.()}
            disabled={isRetrying}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Sprawdzanie…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={18} />
                Sprawdź ponownie
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onLogout?.()}
            disabled={isRetrying}
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

export default CookieRequiredModal;
