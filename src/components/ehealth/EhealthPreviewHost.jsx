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
  const print = () => {
    try {
      frame.current?.contentWindow?.focus();
      frame.current?.contentWindow?.print();
    } catch {
      window.open(doc.url, "_blank");
    }
  };
  const ext = String(doc.type || "").includes("pdf") ? "pdf" : "html";
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
        <iframe ref={frame} title={doc.title || "Podgląd dokumentu"} src={doc.url} className="min-h-0 w-full flex-1 bg-slate-100" />
      </div>
    </div>
  );
}
