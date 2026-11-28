import React, { useEffect, useState } from "react";
import { Eye, FileCheck, FileSpreadsheet, FileText, Files, Pill, Printer, Search, X } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../../../helpers/ehealthHelper";
import ClinicDocumentSheet, { printClinicSheet } from "../../../ehealth/ClinicDocumentSheet";
import { VisitFilePreview, printVisitFile, sheetProps } from "./VisitClinicDocuments";
import { CATEGORY_TABS } from "./visitDocuments";
import { formatDateTime } from "../../../ehealth/ezlaFormat";

const LOOK = {
  REC: { Icon: Pill, icon: "bg-emerald-50 text-emerald-600 border-emerald-200", card: "border-emerald-200/80 hover:border-emerald-300", code: "text-emerald-800 bg-emerald-50 border-emerald-200", copy: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  SKI: { Icon: FileSpreadsheet, icon: "bg-blue-50 text-blue-600 border-blue-200", card: "border-blue-200/70 hover:border-blue-300", code: "text-blue-800 bg-blue-50 border-blue-200", copy: "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200" },
  ZLA: { Icon: FileCheck, icon: "bg-indigo-50 text-indigo-600 border-indigo-200", card: "border-indigo-200/70 hover:border-indigo-300" },
  VISIT_CARD: { Icon: FileText, icon: "bg-slate-100 text-slate-700 border-slate-200", card: "border-slate-200 hover:border-slate-300" },
  INTERNAL: { Icon: FileText, icon: "bg-amber-50 text-amber-600 border-amber-200", card: "border-slate-200 hover:border-slate-300" },
};

const TONES = {
  green: ["bg-emerald-50 text-emerald-700 border-emerald-200", "bg-emerald-500"],
  amber: ["bg-amber-50 text-amber-700 border-amber-200", "bg-amber-500"],
  red: ["bg-rose-50 text-rose-700 border-rose-200", "bg-rose-500"],
};

const ACTION = "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-sm disabled:opacity-50";

/** Slide-over list of everything issued or attached during one visit. */
export default function VisitDocumentsDrawer({ visit, documents, loading, patient, onClose, onCopy, onOpenVisit }) {
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [sheet, setSheet] = useState(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (file) setFile(null);
      else if (sheet) setSheet(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [file, sheet, onClose]);

  const term = search.trim().toLowerCase();
  const shown = documents.filter(
    (doc) =>
      (tab === "ALL" || doc.category === tab) &&
      (!term || [doc.name, doc.code, doc.number].some((value) => String(value || "").toLowerCase().includes(term)))
  );

  const preview = (doc) => {
    if (doc.row) ehealthHelper.previewDocument(doc.row.service, doc.row.id).catch((err) => toast.error(unwrapEhealthError(err).message));
    else if (doc.clinic) setSheet(doc);
    else setFile(doc);
  };

  const print = (doc) => {
    if (doc.row) ehealthHelper.printDocument(doc.row.service, doc.row.id).catch((err) => toast.error(unwrapEhealthError(err).message));
    else if (doc.clinic) printClinicSheet(sheetProps(doc.clinic, patient, doc.clinic.createdByName, "", ""));
    else printVisitFile(doc.url);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" role="dialog" aria-modal="true" aria-label={`Dokumenty wizyty ${visit.date}`}>
      <div className="fixed inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-12">
        <div className="flex w-screen max-w-3xl flex-col border-l border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50"><FileText size={16} className="text-teal-600" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">Dokumenty wizyty – {visit.date}</h2>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${visit.statusClass}`}>{visit.status}</span>
                  {visit.unverified && <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Do weryfikacji</span>}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{visit.type} • Powiązane dokumenty: {documents.length}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700" aria-label="Zamknij"><X size={20} /></button>
          </div>

          <div className="space-y-3 border-b border-slate-200/80 p-4">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj po nazwie lub nr..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm focus:border-slate-400 focus:bg-white focus:outline-none" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORY_TABS.map(({ key, label, dot }) => {
                const active = tab === key;
                const count = key === "ALL" ? documents.length : documents.filter((doc) => doc.category === key).length;
                return (
                  <button key={key} type="button" onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"}`}>
                    {dot && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : dot}`} />}
                    <span>{label}</span>
                    <span className="text-[11px] font-semibold opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50/50 p-5">
            {loading && !documents.length && <p className="py-12 text-center text-xs text-slate-400">Pobieranie dokumentów…</p>}
            {!loading && !shown.length && <p className="py-12 text-center text-xs text-slate-400">Nie znaleziono dokumentów spełniających podane kryteria.</p>}
            {shown.map((doc) => {
              const look = LOOK[doc.category];
              const [pill, dot] = TONES[doc.tone] || TONES.green;
              const cancelled = doc.cancelled;
              return (
                <div key={doc.key} className={`flex flex-col justify-between gap-3 rounded-xl border bg-white p-3.5 shadow-sm sm:flex-row sm:items-center ${cancelled ? "border-slate-200/70 opacity-80" : look.card}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${cancelled ? "border-slate-200 bg-slate-100 text-slate-400" : look.icon}`}><look.Icon size={16} /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold ${cancelled ? "text-slate-500 line-through" : "text-slate-800"}`}>{doc.name}</span>
                        {doc.code && look.code && <span className={`rounded border px-1.5 py-0.5 font-mono text-[11px] font-bold ${look.code}`}>Kod: {doc.code}</span>}
                        {doc.number && <span className="max-w-[16rem] truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500" title={doc.number}>{doc.number}</span>}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">{doc.dateLabel}: {formatDateTime(doc.date) || "—"}</p>
                      {doc.error && <p className="mt-0.5 text-[11px] text-rose-700">{doc.error}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {doc.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onCopy && doc.row && look.copy && !cancelled && (
                        <button type="button" onClick={() => { onCopy(doc.row); onClose(); }} className={`${ACTION} ${look.copy}`} title="Powiel jako szablon do bieżącej wizyty">
                          <Files size={14} /> Powiel
                        </button>
                      )}
                      <button type="button" onClick={() => preview(doc)} className={`${ACTION} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}><Eye size={14} className="text-slate-500" /> Podgląd PDF</button>
                      <button type="button" onClick={() => print(doc)} className={`${ACTION} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}><Printer size={14} className="text-slate-500" /> Drukuj</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
            <span className="text-xs font-medium text-slate-500">Łącznie dokumentów w tej wizycie: <strong className="text-slate-700">{documents.length}</strong></span>
            <div className="flex gap-2">
              {onOpenVisit && (
                <button type="button" onClick={onOpenVisit} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Przejdź do tej wizyty</button>
              )}
              <button type="button" onClick={onClose} className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900">Zamknij szufladę</button>
            </div>
          </div>
        </div>
      </div>

      {file && <VisitFilePreview title={file.name} url={file.url} onClose={() => setFile(null)} />}
      {sheet && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-900/60 p-3">
          <div className="flex h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-bold">{sheet.name}</h3>
              <button type="button" onClick={() => setSheet(null)} aria-label="Zamknij podgląd"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              <ClinicDocumentSheet {...sheetProps(sheet.clinic, patient, sheet.clinic.createdByName, "", "")} />
            </div>
            <div className="flex justify-end border-t px-5 py-3">
              <button type="button" onClick={() => print(sheet)} className="inline-flex items-center gap-1 rounded-lg bg-[#1b766a] px-4 py-2 font-semibold text-white"><Printer size={14} /> Drukuj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
