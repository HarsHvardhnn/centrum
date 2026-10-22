import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { badgeFor, branchLabel, formatChecked, formatValidUntil } from "./EwusStatusCard";

const PILL = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  not_confirmed: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  default: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
};

const BANNER = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_confirmed: "bg-red-50 text-red-700 border-red-200",
  default: "bg-amber-50 text-amber-800 border-amber-200",
};

const DOT = { confirmed: "bg-emerald-600", not_confirmed: "bg-red-600", default: "bg-amber-500" };

/**
 * Patient / issuing doctor / eWUŚ bar shared by the e-prescription, e-referral and e-ZLA modals.
 * The eWUŚ pill opens a popover where the doctor can re-check eligibility without leaving the visit.
 */
function ageOf(birthDate) {
  const born = new Date(birthDate);
  if (!birthDate || Number.isNaN(born.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) years -= 1;
  return years >= 0 && years < 130 ? `${years} lat` : "";
}

export default function IssueSummaryBar({ patientName, pesel, birthDate, address, doctorName, pwz, patientId, visitId }) {
  const [doc, setDoc] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);
  const cleanPesel = String(pesel || "").replace(/\D/g, "");
  const hasPesel = cleanPesel.length === 11;

  useEffect(() => {
    if (!patientId) return undefined;
    let cancelled = false;
    ehealthHelper
      .history({ patientId, service: "eligibility" })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && rows[0]) setDoc(rows[0]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [patientId]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const check = async () => {
    if (!hasPesel) {
      toast.error("Brak PESEL — sprawdzenie eWUŚ zablokowane");
      return;
    }
    try {
      setBusy(true);
      const res = await ehealthHelper.checkEwus({ pesel: cleanPesel, patientId, visitId, trigger: doc ? "recheck" : "manual" });
      if (!res?.success && !res?.data) throw new Error(res?.error?.message || "Sprawdzenie nieudane");
      setDoc(res.data);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const status = doc?.status || "none";
  const badge = badgeFor(doc);
  const tone = status === "confirmed" || status === "not_confirmed" ? status : "default";
  const payload = doc?.payload || {};
  const branch = branchLabel(payload.nfzBranch);

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        <span className="text-slate-500 font-medium">Pacjent:</span>
        <strong className="text-slate-900 font-bold break-words">{patientName || "—"}</strong>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500 font-medium">PESEL:</span>
        <span className="font-mono font-medium">{cleanPesel || "—"}</span>
        {ageOf(birthDate) ? <span className="inline-flex items-center rounded-full border border-slate-300/60 bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{ageOf(birthDate)}</span> : null}
        {address ? <><span className="text-slate-300">·</span><span className="break-words">{address}</span></> : null}
      </div>
      <span className="text-slate-300 hidden md:inline">|</span>
      <div className="flex items-center gap-1.5">
        <span className="text-slate-500 font-medium">Wystawiający:</span>
        <strong className="text-slate-900 font-bold">{doctorName || "—"}</strong>
        {pwz ? <span className="font-mono text-[11px] text-slate-500">(PWZ: {pwz})</span> : null}
      </div>
      <span className="text-slate-300 hidden md:inline">|</span>
      <div ref={boxRef} className="relative flex items-center gap-1.5">
        <span className="text-slate-500 font-medium">eWUŚ:</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Kliknij, aby zobaczyć szczegóły i sprawdzić eWUŚ"
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-colors ${PILL[tone]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone]} ${busy ? "animate-pulse" : ""}`} />
          <span>{busy ? "Sprawdzam…" : badge.label}</span>
          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-[340px] rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xl">
            <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Weryfikacja eWUŚ (NFZ)</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Zamknij"><X size={14} /></button>
            </div>
            <div className={`mb-2.5 flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold ${BANNER[tone]}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
              <span>
                {status === "confirmed" ? "Uprawniony do świadczeń zdrowotnych" : status === "not_confirmed" ? "Brak potwierdzenia uprawnień" : doc ? badge.label : "Uprawnienie jeszcze nie sprawdzone"}
              </span>
            </div>
            {doc && (
              <div className="mb-3 space-y-1 rounded-lg border border-slate-200/70 bg-slate-50 p-2.5 text-slate-600">
                {branch && <div className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">Oddział NFZ:</span><span className="font-bold text-slate-800 text-right">{branch}</span></div>}
                <div className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">Sprawdzono:</span><span className="font-bold text-slate-800">{formatChecked(payload.checkedAt || doc.createdAt) || "—"}</span></div>
                <div className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">Ważne do:</span><span className="font-bold text-slate-800">{formatValidUntil(payload.validUntil) || "—"}</span></div>
                {doc.externalId && <div className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">ID potwierdzenia:</span><span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800">{doc.externalId}</span></div>}
              </div>
            )}
            {!hasPesel && <p className="mb-2 text-[11px] text-amber-700">Brak PESEL blokuje tylko sprawdzenie, nie opiekę.</p>}
            <button
              type="button"
              disabled={busy || !hasPesel}
              onClick={check}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200/80 disabled:opacity-60"
            >
              <RefreshCw size={14} className={busy ? "animate-spin text-emerald-600" : "text-slate-500"} />
              <span>{busy ? "Sprawdzanie w eWUŚ…" : doc ? "Odśwież status teraz" : "Sprawdź uprawnienie teraz"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
