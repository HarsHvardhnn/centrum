import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Copy, ExternalLink } from "lucide-react";
import {
  createCorrectionSession,
  getSessionByPatient,
  getSessionStatus,
  cancelSession,
  downloadPackage,
  getPdfJobBySession,
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

export default function PatientKioskCorrectionPanel({ patientId, onCompleted }) {
  const kioskUrl = getKioskUrl();
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pdfJob, setPdfJob] = useState(null);

  const refreshStatus = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await getSessionStatus(session.id);
      if (res.session) {
        setSession((prev) => ({ ...prev, ...res.session }));
        if (res.session.status === "completed") {
          setPin(null);
          onCompleted?.(res.session);
        }
      }
    } catch (_) {}
  }, [session?.id, onCompleted]);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setInitialLoading(true);
    getSessionByPatient(patientId)
      .then((res) => {
        if (cancelled) return;
        if (res.session) {
          setSession(res.session);
          if (res.session.status === "completed") {
            onCompleted?.(res.session);
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
  }, [patientId, onCompleted]);

  useEffect(() => {
    if (!session?.id || session.status === "completed" || session.status === "cancelled") return;
    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, [session?.id, session?.status, refreshStatus]);

  useEffect(() => {
    if (!session?.id || session.status !== "completed") return;
    let cancelled = false;
    const pollPdfJob = async () => {
      try {
        const res = await getPdfJobBySession(session.id);
        if (!cancelled) setPdfJob(res.job);
        return res.job?.status;
      } catch {
        return null;
      }
    };
    pollPdfJob();
    const interval = setInterval(async () => {
      const status = await pollPdfJob();
      if (status === "completed" || status === "failed") clearInterval(interval);
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session?.id, session?.status]);

  const handleStart = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await createCorrectionSession(patientId);
      setSession(res.session);
      setPin(res.pin);
      toast.success("Utworzono sesję aktualizacji. Podaj PIN pacjentowi na tablecie.");
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
    try {
      const res = await downloadPackage(session.packageId);
      const url = resolveDocumentOpenUrl(res.downloadUrl || res.documents?.[0]?.pdfUrl);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się pobrać dokumentów.");
    }
  };

  const copyPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    toast.success("PIN skopiowany.");
  };

  if (initialLoading) {
    return (
      <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-500">
        Sprawdzanie sesji aktualizacji danych…
      </div>
    );
  }

  const isActive =
    session &&
    !["completed", "cancelled", "expired"].includes(session.status);

  return (
    <div className="mb-6 p-4 bg-teal-50/60 border border-teal-200 rounded-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-teal-900">Aktualizacja danych na tablecie</h3>
          <p className="text-xs text-teal-800/80 mt-1 max-w-2xl">
            Pacjent może ponownie przejść formularz na iPadzie, zaktualizować dane i podpisać
            dokumenty. System zapisze nową wersję dokumentów (V2, V3…), a poprzednia wersja
            pozostanie w historii.
          </p>
        </div>
        {!isActive && session?.status !== "completed" && (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="shrink-0 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Tworzenie…" : "Wygeneruj PIN aktualizacji"}
          </button>
        )}
      </div>

      {session && (
        <div className="text-sm space-y-3">
          <p>
            <span className="text-gray-600">Status: </span>
            <span className="font-medium">{STATUS_LABELS[session.status] || session.status}</span>
          </p>

          {pin && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-lg border border-teal-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Kod PIN dla pacjenta</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-teal-900">{pin}</p>
              </div>
              <button
                type="button"
                onClick={copyPin}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Copy size={14} />
                Kopiuj PIN
              </button>
            </div>
          )}

          {isActive && (
            <div className="flex flex-wrap gap-3 items-start">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <QRCode value={kioskUrl} size={96} />
                <p className="text-[10px] text-gray-500 mt-2 text-center max-w-[96px]">Kiosk</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={kioskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline"
                >
                  <ExternalLink size={14} />
                  Otwórz kiosk
                </a>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Anuluj sesję
                </button>
              </div>
            </div>
          )}

          {session.status === "completed" && session.packageId && (
            <div className="space-y-2">
              {pdfJob && ["pending", "processing"].includes(pdfJob.status) && (
                <p className="text-xs text-amber-800">Generowanie dokumentów PDF…</p>
              )}
              {pdfJob?.status === "failed" && (
                <p className="text-xs text-red-700">
                  Błąd PDF: {pdfJob.errorMessage || "nieznany błąd"}
                </p>
              )}
              <button
                type="button"
                onClick={handleDownload}
                disabled={pdfJob && pdfJob.status !== "completed"}
                className="text-sm text-teal-700 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Pobierz nową wersję dokumentów
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
