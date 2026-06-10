import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Copy, ExternalLink, Maximize2, X } from "lucide-react";
import {
  createSession,
  getSessionByVisit,
  getSessionStatus,
  cancelSession,
  downloadPackage,
} from "../../helpers/kioskHelper";
import { resolveDocumentOpenUrl } from "../../utils/documentUrl";

const STATUS_LABELS = {
  pending: "Oczekuje na PIN",
  active: "Aktywna",
  in_progress: "Formularz w trakcie",
  ready_for_signature: "Gotowe do podpisu",
  completed: "Zakończona",
  cancelled: "Anulowana",
  expired: "Wygasła",
  locked: "Zablokowana",
};

function getKioskUrl() {
  return `${window.location.origin}/kiosk`;
}

export default function IpadSessionPanel({ visitId, onSessionComplete }) {
  const kioskUrl = useMemo(() => getKioskUrl(), []);
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showQrEnlarged, setShowQrEnlarged] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await getSessionStatus(session.id);
      if (res.session) {
        setSession((prev) => ({ ...prev, ...res.session }));
        if (res.session.status === "completed") {
          onSessionComplete?.(res.session);
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
          if (res.session.status === "completed") {
            onSessionComplete?.(res.session);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => { cancelled = true; };
  }, [visitId, onSessionComplete]);

  useEffect(() => {
    if (!session?.id || session.status === "completed" || session.status === "cancelled") return;
    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, [session?.id, session?.status, refreshStatus]);

  useEffect(() => {
    if (!showQrEnlarged) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowQrEnlarged(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showQrEnlarged]);

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
      toast.success("Sesja iPad utworzona. Podaj PIN pacjentowi.");
    } catch (err) {
      const existing = err.response?.data?.session;
      if (existing) {
        setSession(existing);
        toast.info(err.response?.data?.message || "Aktywna sesja już istnieje.");
      } else {
        toast.error(err.response?.data?.message || "Nie udało się utworzyć sesji.");
      }
    } finally {
      setLoading(false);
    }
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
          const url = resolveDocumentOpenUrl(doc);
          if (url) window.open(url, "_blank");
        });
        toast.success(`Otwarto ${docs.length} dokumentów.`);
      } else if (res.downloadUrl) {
        const url = resolveDocumentOpenUrl(res.downloadUrl);
        if (url) window.open(url, "_blank");
        toast.success("Pobieranie dokumentów...");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się pobrać dokumentów.");
    } finally {
      setLoading(false);
    }
  };

  const copyKioskUrl = async () => {
    try {
      await navigator.clipboard.writeText(kioskUrl);
      toast.success("Adres kiosku skopiowany.");
    } catch {
      toast.error("Nie udało się skopiować adresu.");
    }
  };

  const openKioskUrl = () => {
    window.open(kioskUrl, "_blank", "noopener,noreferrer");
  };

  if (!visitId) return null;

  if (initialLoading) {
    return (
      <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-5 text-sm text-gray-600">
        Sprawdzam sesję iPad...
      </div>
    );
  }

  const isActive = session && !["completed", "cancelled", "expired", "locked"].includes(session.status);

  return (
    <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h3 className="font-semibold text-gray-900 mb-3">Rejestracja przez iPad</h3>
          <div className="flex flex-wrap items-start gap-4">
            <div className="bg-white border border-teal-200 rounded-xl p-3 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setShowQrEnlarged(true)}
                className="block rounded-lg p-1 hover:bg-teal-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
                title="Kliknij, aby powiększyć kod QR"
                aria-label="Powiększ kod QR kiosku"
              >
                <QRCode
                  value={kioskUrl}
                  size={132}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0c4e54"
                  title="Kod QR — adres kiosku rejestracji"
                />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-2 leading-tight">
                Zeskanuj na tablecie
              </p>
              <button
                type="button"
                onClick={() => setShowQrEnlarged(true)}
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-teal-800 border border-teal-200 bg-teal-50/60 px-2 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <Maximize2 size={12} />
                Powiększ kod QR
              </button>
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <p className="text-sm text-gray-600">
                Otwórz stronę kiosku na tablecie i wpisz kod PIN od recepcji.
              </p>
              <p className="text-xs text-gray-500 break-all font-mono bg-white/80 border border-gray-200 rounded-lg px-3 py-2">
                {kioskUrl}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyKioskUrl}
                  className="inline-flex items-center gap-1.5 text-sm border border-teal-300 bg-white text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50"
                >
                  <Copy size={14} />
                  Kopiuj link
                </button>
                <button
                  type="button"
                  onClick={openKioskUrl}
                  className="inline-flex items-center gap-1.5 text-sm border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <ExternalLink size={14} />
                  Otwórz kiosk
                </button>
              </div>
            </div>
          </div>
        </div>
        {!isActive && session?.status !== "completed" && (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0"
          >
            {loading ? "..." : "Uruchom sesję iPad"}
          </button>
        )}
      </div>

      {session && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-800">
              {STATUS_LABELS[session.status] || session.status}
            </span>
            {session.mode && (
              <span className="text-gray-500">
                Tryb: {session.mode === "sign_only" ? "tylko podpis" : "pełna rejestracja"}
              </span>
            )}
          </div>

          {pin && session.status === "pending" && (
            <div className="bg-white border-2 border-teal-300 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Kod PIN dla pacjenta</p>
              <p className="text-5xl font-mono font-bold tracking-[0.3em] text-teal-800">{pin}</p>
              <p className="text-xs text-gray-500 mt-3">Ważny przez 2 godziny</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isActive && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="text-sm border border-gray-300 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                Anuluj sesję
              </button>
            )}
            {session.status === "completed" && session.packageId && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={loading}
                className="text-sm bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800"
              >
                Pobierz dokumenty pacjenta
              </button>
            )}
            {["completed", "cancelled", "expired", "locked"].includes(session.status) && (
              <button
                type="button"
                onClick={() => { setSession(null); setPin(null); }}
                className="text-sm text-teal-700 hover:underline"
              >
                Nowa sesja
              </button>
            )}
          </div>
        </div>
      )}

      {showQrEnlarged && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowQrEnlarged(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ipad-qr-enlarge-title"
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrEnlarged(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Zamknij"
            >
              <X size={20} />
            </button>
            <h4
              id="ipad-qr-enlarge-title"
              className="text-center text-lg font-semibold text-gray-900 mb-1 pr-8"
            >
              Kod QR kiosku
            </h4>
            <p className="text-center text-sm text-gray-600 mb-5">
              Zeskanuj na tablecie, aby otworzyć stronę rejestracji
            </p>
            <div className="flex justify-center bg-white border border-teal-100 rounded-xl p-4">
              <QRCode
                value={kioskUrl}
                size={280}
                level="M"
                bgColor="#ffffff"
                fgColor="#0c4e54"
              />
            </div>
            <p className="text-center text-xs text-gray-500 break-all font-mono mt-4 px-2">
              {kioskUrl}
            </p>
            <button
              type="button"
              onClick={() => setShowQrEnlarged(false)}
              className="mt-5 w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
