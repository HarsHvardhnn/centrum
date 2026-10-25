import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileCode, Printer, X } from "lucide-react";
import { toast } from "sonner";
import clinicFlowHelper from "../../helpers/clinicFlowHelper";

const FILE_STAMP = () => new Date().toISOString().slice(0, 10);

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Internal orders report shown inside the app: PDF preview with print, PDF, CSV and XML. */
export default function OrdersReportDialog({ filters, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const frameRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    setLoading(true);
    setError("");
    clinicFlowHelper
      .orderReport(filters, "pdf")
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => { if (!cancelled) setError("Nie udało się wygenerować raportu. Spróbuj ponownie."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filters]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const download = useCallback(async (format) => {
    setBusy(format);
    try {
      const blob = await clinicFlowHelper.orderReport(filters, format);
      saveBlob(blob, `raport-zlecen-${FILE_STAMP()}.${format}`);
    } catch {
      toast.error("Nie udało się pobrać raportu.");
    } finally {
      setBusy("");
    }
  }, [filters]);

  const print = () => {
    try {
      frameRef.current?.contentWindow?.focus();
      frameRef.current?.contentWindow?.print();
    } catch {
      toast.error("Nie udało się otworzyć okna drukowania. Pobierz plik PDF i wydrukuj go.");
    }
  };

  const buttonClass = "inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-5xl h-[88vh] shadow-xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 id="orders-report-title" className="text-base font-bold text-slate-900">Raport zleceń wewnętrznych</h3>
          <button type="button" onClick={onClose} aria-label="Zamknij" className="text-slate-500 hover:text-slate-800"><X size={20} /></button>
        </div>
        <div className="flex-1 min-h-0 bg-slate-100">
          {loading && <div className="h-full flex items-center justify-center text-sm text-slate-500">Generowanie raportu…</div>}
          {!loading && error && <div className="h-full flex items-center justify-center text-sm text-rose-600 px-6 text-center">{error}</div>}
          {!loading && !error && pdfUrl && (
            <iframe ref={frameRef} title="Podgląd raportu" src={pdfUrl} className="w-full h-full border-0 bg-white" />
          )}
        </div>
        <div className="px-5 py-3 border-t flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onClose} className={buttonClass}>Zamknij</button>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => download("csv")} disabled={Boolean(busy)} className={buttonClass}>
              <FileSpreadsheet size={14} /> {busy === "csv" ? "Pobieranie…" : "Pobierz CSV"}
            </button>
            <button type="button" onClick={() => download("xml")} disabled={Boolean(busy)} className={buttonClass}>
              <FileCode size={14} /> {busy === "xml" ? "Pobieranie…" : "Pobierz XML"}
            </button>
            <button type="button" onClick={() => download("pdf")} disabled={Boolean(busy)} className={buttonClass}>
              <Download size={14} /> {busy === "pdf" ? "Pobieranie…" : "Pobierz PDF"}
            </button>
            <button
              type="button"
              onClick={print}
              disabled={loading || Boolean(error)}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#1b766a] text-white text-xs font-semibold disabled:opacity-50"
            >
              <Printer size={14} /> Drukuj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
