import React, { useEffect, useMemo, useState } from "react";
import { History, X, Search, Copy, CheckCircle2, Printer, Smartphone, Mail, Ban } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { accessCodeOf, canCancel, canPrint } from "./ehealthStatus";
import { REFERRAL_TYPES, SITE_LABELS } from "./eReferralCatalog";
import { formatDateTime } from "./ezlaFormat";

const issuedLike = (status) => ["issued", "submitted", "confirmed"].includes(status);

/** Every referral is in exactly one group, so the counters add up. */
function groupOf(row) {
  if (row.status === "cancelled") return "cancelled";
  return issuedLike(row.status) ? "issued" : "failed";
}

const BADGE = {
  issued: ["Wystawione", "bg-emerald-50 text-emerald-800"],
  cancelled: ["Anulowane", "bg-rose-50 text-rose-700"],
  failed: ["Nieudane – nie wysłano", "bg-amber-50 text-amber-800"],
};

const typeLabel = (payload) => {
  const key = payload.clientReferralType || (payload.type === "02.10REH" ? "rehabilitation" : "");
  return REFERRAL_TYPES.find((row) => row.value === key)?.label || "Skierowanie";
};

const proceduresOf = (payload) =>
  (Array.isArray(payload.procedures) && payload.procedures.length ? payload.procedures : [payload]).filter((row) => row.icd9Code);

function Line({ label, children }) {
  return (
    <p className="text-xs text-slate-700 mt-0.5"><span className="font-semibold">{label}:</span> {children}</p>
  );
}

/** Two lines of the purpose, with the rest on request. */
function Purpose({ text }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 160 || text.includes("\n");
  return (
    <div className="mt-0.5 text-xs text-slate-600">
      <p className={`whitespace-pre-wrap break-words ${open ? "" : "line-clamp-2"}`}><span className="font-semibold text-slate-700">Cel:</span> {text}</p>
      {long && <button type="button" onClick={() => setOpen((v) => !v)} className="font-semibold text-blue-700">{open ? "Pokaż mniej" : "Pokaż więcej"}</button>}
    </div>
  );
}

export default function ReferralHistoryModal({ open, version = 0, patientId, patientName, pesel, phone, email, onClose, onDuplicate, onCancelDocument }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!open || !patientId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    ehealthHelper.history({ patientId, service: "referral" }).then((res) => {
      if (cancelled) return;
      const list = res?.data?.documents || res?.data || [];
      setRows(Array.isArray(list) ? list : []);
    }).catch((err) => {
      if (cancelled) return;
      setRows([]);
      setError(unwrapEhealthError(err).message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, patientId, version]);

  const counts = useMemo(() => rows.reduce((sum, row) => ({ ...sum, [groupOf(row)]: sum[groupOf(row)] + 1 }), { all: rows.length, issued: 0, cancelled: 0, failed: 0 }), [rows]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && groupOf(row) !== filter) return false;
      if (!needle) return true;
      const payload = row.payload || {};
      const hay = [
        accessCodeOf(row), payload.refs?.documentNumber, payload.performerCode, payload.performer, payload.icd10Code, payload.icd10Display,
        ...(payload.icd10Extra || []).flatMap((d) => [d.icd10Code, d.icd10Display]), payload.purpose,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, filter, query]);

  if (!open) return null;

  const act = (fn) => fn.catch((err) => toast.error(unwrapEhealthError(err).message));
  const button = "px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40";

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[86dvh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><History size={18} /></span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-white/80">System e-Zdrowie (P1) · Rejestr skierowań</div>
              <h3 className="text-lg font-semibold">Historia e-skierowań pacjenta: {patientName || "Pacjent"}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center" aria-label="Zamknij"><X size={16} /></button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj po kodzie dostępu, komórce, rozpoznaniu…"
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-full text-sm"
            />
          </div>
          {[["all", "Wszystkie"], ["issued", "Wystawione"], ["cancelled", "Anulowane"], ["failed", "Nieudane / nie wysłane"]].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === value ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-600"}`}>
              {label} ({counts[value]})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading && <p className="text-sm text-slate-500">Pobieram historię skierowań…</p>}
          {error && <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
          {!loading && !visible.length && (
            <p className="text-sm text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center">Brak skierowań w tym widoku.</p>
          )}
          {visible.map((row) => {
            const payload = row.payload || {};
            const group = groupOf(row);
            const code = group === "issued" ? accessCodeOf(row) : "";
            const [label, tone] = BADGE[group];
            const extra = payload.icd10Extra || [];
            const procedures = proceduresOf(payload);
            const cell = payload.issuingCell;
            return (
              <article key={row.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {code && <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">KOD: {code}</span>}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${tone}`}>{group === "issued" && <CheckCircle2 size={12} />}{label}</span>
                    {payload.cito && <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">PILNE (cito)</span>}
                    <span className="text-slate-500">{typeLabel(payload)}</span>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <div>{formatDateTime(row.createdAt)}</div>
                    {payload.doctorName && <div className="mt-1">{payload.doctorName}</div>}
                  </div>
                </div>
                <h4 className="mt-2 font-bold text-slate-900">{[payload.performerCode, payload.performer].filter(Boolean).join(" – ") || payload.title || "e-skierowanie"}</h4>
                {payload.refs?.documentNumber && <Line label="Numer dokumentu"><span className="font-mono">{payload.refs.documentNumber}</span></Line>}
                {payload.icd10Code && <Line label="Rozpoznanie">{payload.icd10Code} – {payload.icd10Display}</Line>}
                {extra.length > 0 && <Line label="Dodatkowe">{extra.map((d) => `${d.icd10Code} – ${d.icd10Display}`).join("; ")}</Line>}
                {procedures.length > 0 && <Line label="ICD-9">{procedures.map((p) => `${p.icd9Code} – ${p.icd9Display}`).join("; ")}</Line>}
                {payload.anatomicalSite && <Line label="Strona ciała">{SITE_LABELS[payload.anatomicalSite] || payload.anatomicalSite}</Line>}
                {cell && <Line label="Komórka wystawiająca">{cell.code} – {cell.name}</Line>}
                <Line label="Finansowanie">{payload.reimbursed === "Y" ? "NFZ" : payload.clientReferralType === "hospital_treatment" ? "prywatne (w szpitalu można zrealizować w ramach NFZ)" : "prywatne"}</Line>
                {payload.purpose && <Purpose text={payload.purpose} />}
                {group === "cancelled" && (
                  <Line label="Anulowano">{[payload.cancelledAt ? formatDateTime(payload.cancelledAt) : formatDateTime(row.updatedAt), payload.cancelledByName, payload.cancellationReason && `powód: ${payload.cancellationReason}`].filter(Boolean).join(" · ")}</Line>
                )}
                {row.error?.message && group !== "cancelled" && (
                  <p className="mt-1 text-xs text-rose-700">{row.error.message}{row.error.eventId ? <span className="text-slate-400"> (zdarzenie {row.error.eventId})</span> : null}</p>
                )}
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  {canPrint(row) && <button type="button" onClick={() => act(ehealthHelper.previewDocument("referral", row.id))} className={button}><Printer size={14} /> Podgląd / wydruk</button>}
                  {code && (
                    <>
                      <button type="button" disabled={!phone} title={phone ? "" : "Brak telefonu pacjenta"} onClick={() => { window.location.href = `sms:${phone}?body=${encodeURIComponent(`Kod e-skierowania: ${code}`)}`; }} className={button}><Smartphone size={14} /> Wyślij SMS</button>
                      <button type="button" disabled={!email} title={email ? "" : "Brak e-maila pacjenta"} onClick={() => { window.location.href = `mailto:${email}?subject=${encodeURIComponent("e-Skierowanie")}&body=${encodeURIComponent(`Kod dostępu: ${code}`)}`; }} className={button}><Mail size={14} /> Wyślij e-mail</button>
                    </>
                  )}
                  {canCancel(row) && <button type="button" onClick={() => onCancelDocument?.(row)} className={`${button} !border-rose-200 !text-rose-700`}><Ban size={14} /> Anuluj</button>}
                  <button type="button" onClick={() => onDuplicate(row)} className={button}><Copy size={14} /> Powiel</button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">PESEL: <span className="font-mono text-slate-800">{pesel || "—"}</span></span>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Zamknij</button>
        </div>
      </div>
    </div>
  );
}
