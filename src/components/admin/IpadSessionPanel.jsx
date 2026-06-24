import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  createSession,
  getSessionByVisit,
  getSessionStatus,
  cancelSession,
  downloadPackage,
} from "../../helpers/kioskHelper";

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

const KIOSK_URL = `${window.location.origin}/kiosk`;

export default function IpadSessionPanel({ visitId, onSessionComplete }) {
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
      <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-5 text-sm text-gray-600">
        Sprawdzam sesję iPad...
      </div>
    );
  }

  const isActive = session && !["completed", "cancelled", "expired", "locked"].includes(session.status);

  return (
    <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Rejestracja przez iPad</h3>
          <p className="text-sm text-gray-600">
            Otwórz <button type="button" onClick={copyKioskUrl} className="text-teal-700 underline font-medium">{KIOSK_URL}</button> na tablecie
          </p>
        </div>
        {!isActive && session?.status !== "completed" && (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
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
    </div>
  );
}
