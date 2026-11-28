import React, { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Printer, X } from "lucide-react";

export const EHEALTH_PREVIEW_EVENT = "ehealth:preview";

/** One modal for every e-Zdrowie printout (e-recepta, e-skierowanie, e-ZLA): preview with print, download and close. */
export default function EhealthPreviewHost() {
  const [doc, setDoc] = useState(null);
  const frame = useRef(null);

  useEffect(() => {
    const onOpen = (e) => setDoc((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      // A closed "preparing" window stays closed when the document arrives late.
      if (e.detail?.url && !prev) { URL.revokeObjectURL(e.detail.url); return null; }
      return e.detail;
    });
    window.addEventListener(EHEALTH_PREVIEW_EVENT, onOpen);
    return () => window.removeEventListener(EHEALTH_PREVIEW_EVENT, onOpen);
  }, []);

  const close = () => {
    if (doc?.url) URL.revokeObjectURL(doc.url);
    setDoc(null);
  };

  useEffect(() => {
    if (!doc) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!doc) return null;
  if (doc.loading) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 p-3">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-8 shadow-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D5C46]" />
          <p className="text-sm font-semibold text-slate-700">Przygotowuję podgląd wydruku…</p>
          <button type="button" onClick={close} className="text-xs font-semibold text-slate-500">Zamknij</button>
        </div>
      </div>
    );
  }
  const isPdf = String(doc.type || "").includes("pdf");
  // Native print dialog only on "Drukuj": a hidden frame prints the file, the visible one just shows it.
  const print = () => {
    const hidden = document.createElement("iframe");
    hidden.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0";
    hidden.src = doc.url;
    hidden.onload = () => {
      setTimeout(() => {
        try {
          hidden.contentWindow.focus();
          hidden.contentWindow.print();
        } catch {
          window.open(doc.url, "_blank");
        }
        setTimeout(() => hidden.remove(), 60000);
      }, 400);
    };
    document.body.appendChild(hidden);
  };
  const ext = isPdf ? "pdf" : "html";
  // Plain page view: no browser PDF toolbar or thumbnail pane, fitted to the window width.
  const viewSrc = isPdf ? `${doc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH` : doc.url;
  const btn = "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50";
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 p-3" onClick={close}>
      <div className="flex h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
          <h3 className="mr-auto text-sm font-bold text-slate-900">{doc.title || "Podgląd dokumentu"}</h3>
          <button type="button" onClick={print} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D5C46] px-3 py-2 text-xs font-bold text-white"><Printer size={14} /> Drukuj</button>
          <a href={doc.url} download={`${doc.filename || "dokument"}.${ext}`} className={btn}><Download size={14} /> Pobierz</a>
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className={btn}><ExternalLink size={14} /> Nowa karta</a>
          <button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Zamknij"><X size={18} /></button>
        </div>
        <iframe ref={frame} title={doc.title || "Podgląd dokumentu"} src={viewSrc} className="min-h-0 w-full flex-1 bg-slate-100" />
      </div>
    </div>
  );
}
