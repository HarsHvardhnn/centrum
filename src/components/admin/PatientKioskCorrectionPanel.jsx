import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Copy, ExternalLink, Tablet, X } from "lucide-react";
import {
  createCorrectionSession,
  getSessionsByPatient,
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

const TERMINAL_STATUSES = ["completed", "cancelled", "expired", "locked"];

const STATUS_PILL_CLASS = {
  pending: "bg-amber-50 border-amber-200 text-amber-900",
  active: "bg-sky-50 border-sky-200 text-sky-900",
  in_progress: "bg-blue-50 border-blue-200 text-blue-900",
  ready_for_signature: "bg-indigo-50 border-indigo-200 text-indigo-900",
  completed: "bg-green-50 border-green-200 text-green-900",
  cancelled: "bg-red-50 border-red-200 text-red-900",
  expired: "bg-orange-50 border-orange-200 text-orange-900",
  locked: "bg-gray-100 border-gray-300 text-gray-800",
};

function getKioskUrl() {
  return `${window.location.origin}/kiosk`;
}

export default function PatientKioskCorrectionPanel({
  patientId,
  onCompleted,
  /** Compact trigger in the patient-form footer; details open in a modal */
  compact = false,
}) {
  const kioskUrl = getKioskUrl();
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pdfJob, setPdfJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const prevStatusRef = useRef(null);

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
        if (
          TERMINAL_STATUSES.includes(res.session.status) &&
          res.session.status !== "completed"
        ) {
          setPin(null);
        }
      }
    } catch (_) {}
  }, [session?.id, onCompleted]);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setInitialLoading(true);
    setSession(null);
    setPin(null);
    setPdfJob(null);
    getSessionsByPatient(patientId)
      .then((res) => {
        if (cancelled) return;
        if (res.session) {
          setSession(res.session);
          prevStatusRef.current = res.session.status;
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
    if (!session?.id || TERMINAL_STATUSES.includes(session.status)) return;
    const tick = () => {
      if (!document.hidden) refreshStatus();
    };
    const interval = setInterval(tick, 8000);
    const onVisible = () => {
      if (!document.hidden) refreshStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session?.id, session?.status, refreshStatus]);

  useEffect(() => {
    if (!session?.status) return;
    const prev = prevStatusRef.current;
    const next = session.status;
    if (prev && prev !== next) {
      if (next === "expired") {
        toast.warning("Sesja wygasła. Możesz wygenerować nowy PIN aktualizacji.");
        setPin(null);
      } else if (next === "cancelled") {
        toast.info("Sesja została anulowana.");
        setPin(null);
      }
    }
    prevStatusRef.current = next;
  }, [session?.status]);

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
      if (document.hidden) return;
      const status = await pollPdfJob();
      if (status === "completed" || status === "failed") clearInterval(interval);
    }, 8000);
    const onVisible = async () => {
      if (document.hidden) return;
      const status = await pollPdfJob();
      if (status === "completed" || status === "failed") clearInterval(interval);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session?.id, session?.status]);

  const handleStart = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await createCorrectionSession(patientId);
      setSession(res.session);
      setPin(res.pin);
      setPdfJob(null);
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

  const isActive = session && !TERMINAL_STATUSES.includes(session.status);
  const statusClass =
    STATUS_PILL_CLASS[session?.status] || "bg-white border-gray-200 text-gray-800";

  const startLabel = loading
    ? "Tworzenie…"
    : session?.status === "completed"
      ? "Wygeneruj kolejny PIN aktualizacji"
      : ["cancelled", "expired", "locked"].includes(session?.status)
        ? "Uruchom ponownie"
        : "Wygeneruj PIN aktualizacji";

  const details = initialLoading ? (
    <p className="text-sm text-gray-500">Sprawdzanie sesji aktualizacji…</p>
  ) : (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <p className="text-sm text-gray-600 max-w-xl">
          Pacjent może ponownie przejść formularz na iPadzie, zaktualizować dane i podpisać
          dokumenty. System zapisze nową wersję dokumentów (V2, V3…), a poprzednia wersja
          pozostanie w historii.
        </p>
        {!isActive && (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium disabled:opacity-50"
          >
            {startLabel}
          </button>
        )}
      </div>

      {session && (
        <div className="text-sm space-y-4">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2.5 py-1 rounded-full border text-sm font-medium ${statusClass}`}>
              {STATUS_LABELS[session.status] || session.status}
            </span>
            {isActive && <span className="text-xs text-gray-400">aktualizacja na żywo</span>}
          </p>
          {["cancelled", "expired"].includes(session.status) && (
            <p className="text-sm text-orange-800">
              {session.status === "expired"
                ? "Sesja wygasła (brak aktywności lub upłynął czas PIN). Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN."
                : "Sesja anulowana. Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN."}
            </p>
          )}

          {pin && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kod PIN dla pacjenta</p>
                <p className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.25em] text-teal-900">
                  {pin}
                </p>
              </div>
              <button
                type="button"
                onClick={copyPin}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
              >
                <Copy size={16} />
                Kopiuj PIN
              </button>
            </div>
          )}

          {isActive && (
            <div className="flex flex-wrap gap-4 items-start">
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <QRCode value={kioskUrl} size={128} />
                <p className="text-xs text-gray-500 mt-2 text-center">Kiosk</p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={kioskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline"
                >
                  <ExternalLink size={16} />
                  Otwórz kiosk
                </a>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50 text-left"
                >
                  Anuluj sesję
                </button>
              </div>
            </div>
          )}

          {session.status === "completed" && session.packageId && (
            <div className="space-y-2">
              {pdfJob && ["pending", "processing"].includes(pdfJob.status) && (
                <p className="text-sm text-amber-800">Generowanie dokumentów PDF…</p>
              )}
              {pdfJob?.status === "failed" && (
                <p className="text-sm text-red-700">
                  Błąd PDF: {pdfJob.errorMessage || "nieznany błąd"}
                </p>
              )}
              <button
                type="button"
                onClick={handleDownload}
                disabled={pdfJob && pdfJob.status !== "completed"}
                className="text-sm text-teal-700 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Pobierz ostatnią wersję dokumentów
              </button>
              <p className="text-xs text-gray-500">
                Aby ponownie zaktualizować dane, kliknij „Wygeneruj kolejny PIN aktualizacji”.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );

  const modal = showModal
    ? createPortal(
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kiosk-correction-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 id="kiosk-correction-title" className="text-lg font-bold text-gray-900">
                  Aktualizacja danych pacjenta
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Sesja na tablecie / iPadzie</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Zamknij"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">{details}</div>
          </div>
        </div>,
        document.body
      )
    : null;

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shrink-0 mx-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium"
        >
          <Tablet size={16} />
          Aktualizacja danych pacjenta
          {isActive && (
            <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium">
              {STATUS_LABELS[session.status] || session.status}
            </span>
          )}
        </button>
        {modal}
      </>
    );
  }

  return (
    <div className="mb-6 p-4 bg-teal-50/60 border border-teal-200 rounded-xl">
      <h3 className="text-sm font-bold text-teal-900 mb-3">Aktualizacja danych na tablecie</h3>
      {details}
    </div>
  );
}
