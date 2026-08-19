import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import {
  createSession,
  getSessionByVisit,
  getSessionStatus,
  cancelSession,
  downloadPackage,
} from "../../helpers/kioskHelper";
import {
  KIOSK_STATUS_LABELS as STATUS_LABELS,
  KIOSK_TERMINAL_STATUSES as TERMINAL_STATUSES,
  KIOSK_RESTARTABLE_STATUSES as RESTARTABLE_STATUSES,
  KIOSK_STATUS_PILL_CLASS as STATUS_PILL_CLASS,
  interruptReasonLabel,
  formatInterruptTime,
  kioskSessionRestartMessage,
} from "../../helpers/kioskSessionStatus";

const KIOSK_URL = `${window.location.origin}/kiosk`;

export default function IpadSessionPanel({ visitId, onSessionComplete }) {
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const prevStatusRef = useRef(null);

  const refreshStatus = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await getSessionStatus(session.id);
      if (res.session) {
        setSession((prev) => ({ ...prev, ...res.session }));
        if (res.session.status === "completed") {
          setPin(null);
          onSessionComplete?.(res.session);
        }
        if (TERMINAL_STATUSES.includes(res.session.status) && res.session.status !== "completed") {
          setPin(null);
        }
      }
    } catch (_) {}
  }, [session?.id, onSessionComplete]);

  useEffect(() => {
    if (!visitId) return;
    let cancelled = false;
    setInitialLoading(true);
    getSessionByVisit(visitId)
      .then((res) => {
        if (cancelled) return;
        if (res.session) {
          setSession(res.session);
          prevStatusRef.current = res.session.status;
          if (res.session.status === "completed") {
            onSessionComplete?.(res.session);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visitId, onSessionComplete]);

  // Live-poll while session is in-flight (including until it becomes expired)
  useEffect(() => {
    if (!session?.id || TERMINAL_STATUSES.includes(session.status)) return;
    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, [session?.id, session?.status, refreshStatus]);

  // Notify reception when status flips to cancelled / expired
  useEffect(() => {
    if (!session?.status) return;
    const prev = prevStatusRef.current;
    const next = session.status;
    if (prev && prev !== next) {
      if (next === "abandoned") {
        toast.warning("Sesja iPad została przerwana. Możesz uruchomić rejestrację ponownie.");
        setPin(null);
      } else if (next === "expired") {
        toast.warning("Sesja iPad wygasła. Możesz uruchomić rejestrację ponownie.");
        setPin(null);
      } else if (next === "cancelled") {
        toast.info("Sesja iPad została anulowana.");
        setPin(null);
      } else if (next === "completed") {
        toast.success("Rejestracja na iPadzie zakończona.");
      }
    }
    prevStatusRef.current = next;
  }, [session?.status]);

  const handleStart = async () => {
    if (!visitId) {
      toast.error("Brak identyfikatora wizyty.");
      return;
    }
    setLoading(true);
    try {
      const res = await createSession(visitId);
      setSession(res.session);
      setPin(res.pin);
      prevStatusRef.current = res.session?.status || "pending";
      toast.success("Sesja iPad utworzona. Podaj PIN pacjentowi.");
    } catch (err) {
      const existing = err.response?.data?.session;
      if (existing) {
        setSession(existing);
        prevStatusRef.current = existing.status;
        toast.info(err.response?.data?.message || "Aktywna sesja już istnieje.");
      } else {
        toast.error(err.response?.data?.message || "Nie udało się utworzyć sesji.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    // Create a fresh session + PIN after cancelled/expired/abandoned/locked
    await handleStart();
  };

  const handleCancel = async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      await cancelSession(session.id);
      setSession((prev) => ({ ...prev, status: "cancelled" }));
      setPin(null);
      toast.success("Sesja anulowana.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Błąd anulowania sesji.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!session?.packageId) return;
    setLoading(true);
    try {
      const res = await downloadPackage(session.packageId);
      const docs = res.documents || [];
      if (docs.length > 1) {
        docs.forEach((doc) => {
          if (doc.pdfUrl) window.open(doc.pdfUrl, "_blank");
        });
        toast.success(`Otwarto ${docs.length} dokumentów.`);
      } else if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
        toast.success("Pobieranie dokumentów...");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się pobrać dokumentów.");
    } finally {
      setLoading(false);
    }
  };

  const copyKioskUrl = () => {
    navigator.clipboard?.writeText(KIOSK_URL);
    toast.success("Adres kiosku skopiowany.");
  };

  if (!visitId) return null;

  if (initialLoading) {
    return (
      <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-3 text-sm text-gray-600">
        Sprawdzam sesję iPad...
      </div>
    );
  }

  const isActive = session && !TERMINAL_STATUSES.includes(session.status);
  const canRestart =
    !session ||
    RESTARTABLE_STATUSES.includes(session.status) ||
    (session.status === "completed" && !isActive);
  const showPin = pin && session?.status === "pending";
  const statusClass =
    STATUS_PILL_CLASS[session?.status] || "bg-white border-gray-200 text-gray-800";

  return (
    <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Rejestracja przez iPad</h3>
          <p className="text-xs text-gray-600 truncate">
            Zeskanuj QR lub otwórz{" "}
            <button type="button" onClick={copyKioskUrl} className="text-teal-700 underline font-medium">
              {KIOSK_URL}
            </button>
          </p>
        </div>
        {canRestart && (
          <button
            type="button"
            onClick={session && TERMINAL_STATUSES.includes(session.status) ? handleRestart : handleStart}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 shrink-0"
          >
            {loading
              ? "..."
              : session && RESTARTABLE_STATUSES.includes(session.status)
                ? "Uruchom ponownie"
                : session?.status === "completed"
                  ? "Nowa sesja"
                  : "Uruchom sesję"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-white rounded-lg p-2.5 border border-teal-300 flex flex-col items-center justify-center">
          <p className="text-xs font-medium text-gray-800 mb-1.5">Zeskanuj kod QR</p>
          <QRCode
            value={KIOSK_URL}
            size={96}
            style={{ height: "auto", maxWidth: "96px", width: "96px" }}
            viewBox="0 0 256 256"
            bgColor="white"
            fgColor="#0f766e"
            level="M"
          />
          <button
            type="button"
            onClick={() => setShowLargeQR(true)}
            className="mt-1.5 text-[11px] text-teal-700 hover:text-teal-900 underline"
          >
            Powiększ QR
          </button>
        </div>

        <div className="bg-white rounded-lg border-2 border-teal-300 p-2.5 flex flex-col items-center justify-center text-center min-h-[140px]">
          {showPin ? (
            <>
              <p className="text-xs text-gray-600 mb-1">Kod PIN dla pacjenta</p>
              <p className="text-3xl font-mono font-bold tracking-[0.2em] text-teal-800 leading-none">
                {pin}
              </p>
              <p className="text-[11px] text-gray-500 mt-1.5">PIN ważny 2 godziny</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Brak aktywności na iPadzie: 5 min → sesja przerwana
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500 px-2">
              {kioskSessionRestartMessage(session) ||
                (session
                  ? "PIN widoczny tylko przy statusie „Oczekuje na PIN”."
                  : "Uruchom sesję, aby wygenerować PIN.")}
            </p>
          )}
        </div>
      </div>

      {session && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
                {STATUS_LABELS[session.status] || session.status}
              </span>
              {isActive && (
                <span className="text-gray-400">aktualizacja na żywo</span>
              )}
              {session.mode && (
                <span className="text-gray-500">
                  Tryb: {session.mode === "sign_only" ? "tylko podpis" : "pełna rejestracja"}
                </span>
              )}
              {session.status === "abandoned" && (session.interruptedAt || session.interruptReason) && (
                <span className="text-rose-800">
                  {[
                    formatInterruptTime(session.interruptedAt),
                    interruptReasonLabel(session.interruptReason),
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {isActive && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-xs border border-red-200 bg-white text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50"
                >
                  Anuluj sesję
                </button>
              )}
              {session.status === "completed" && session.packageId && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={loading}
                  className="text-xs bg-teal-700 text-white px-2.5 py-1 rounded-lg hover:bg-teal-800"
                >
                  Pobierz dokumenty
                </button>
              )}
            </div>
          </div>
          {isActive && (
            <p className="text-[11px] text-gray-500">
              Timeout: 5 min bez dotyku na iPadzie → Przerwana. PIN ważny 2 godziny.
              Zamknięcie, odświeżenie, blokada iPada lub utrata połączenia przerywa sesję
              — zgody i dokumenty nie są zapisywane jako finalne.
            </p>
          )}
        </div>
      )}

      {showLargeQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full text-center">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-900">Kod QR do kiosku</h3>
              <button
                type="button"
                onClick={() => setShowLargeQR(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <QRCode
                value={KIOSK_URL}
                size={220}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
                bgColor="white"
                fgColor="#0f766e"
                level="H"
              />
            </div>

            <p className="text-xs font-mono text-teal-700 break-all mb-2">{KIOSK_URL}</p>
            <button
              type="button"
              onClick={copyKioskUrl}
              className="text-xs text-teal-700 underline mb-3"
            >
              Kopiuj link
            </button>

            <button
              type="button"
              onClick={() => setShowLargeQR(false)}
              className="w-full bg-teal-700 text-white py-2 px-4 rounded-lg hover:bg-teal-800 text-sm"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
