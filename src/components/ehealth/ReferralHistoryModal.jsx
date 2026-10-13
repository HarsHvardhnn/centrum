import React, { useEffect, useMemo, useState } from "react";
import { History, X, Search, Copy, CheckCircle2, Calendar, User } from "lucide-react";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { STATUS_LABELS, accessCodeOf } from "./ehealthStatus";
import { REFERRAL_TYPES } from "./eReferralCatalog";

function issuedLike(status) {
  return ["issued", "submitted", "confirmed"].includes(status);
}

function typeLabel(payload) {
  const key = payload.clientReferralType || (payload.type === "02.10REH" ? "rehabilitation" : "");
  return REFERRAL_TYPES.find((row) => row.value === key)?.label || "Skierowanie";
}

function cardTitle(payload) {
  if (payload.icd9Display) return payload.icd9Display;
  if (payload.performer) return payload.performer;
  const title = String(payload.title || "e-Skierowanie");
  const split = title.split(": ");
  return split.length > 1 ? split.slice(1).join(": ") : title;
}

function statusBadge(row) {
  if (row.status === "cancelled") return "Anulowane";
  if (issuedLike(row.status) && accessCodeOf(row)) return "Wystawione (P1)";
  if (issuedLike(row.status)) return "Wystawione";
  return STATUS_LABELS[row.status] || row.status || "—";
}

export default function ReferralHistoryModal({ open, patientId, patientName, pesel, onClose, onDuplicate }) {
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
  }, [open, patientId]);

  const counts = useMemo(() => ({
    all: rows.length,
    issued: rows.filter((row) => issuedLike(row.status)).length,
    cancelled: rows.filter((row) => row.status === "cancelled").length,
  }), [rows]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "issued" && !issuedLike(row.status)) return false;
      if (filter === "cancelled" && row.status !== "cancelled") return false;
      if (!needle) return true;
      const payload = row.payload || {};
      const hay = [
        accessCodeOf(row),
        payload.performerCode,
        payload.performer,
        payload.icd10Code,
        payload.icd10Display,
        payload.purpose,
        cardTitle(payload),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, filter, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[86vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><History size={18} /></span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-white/80">System e-Zdrowie (P1) · Rejestr skierowań</div>
              <h3 className="text-lg font-semibold">Historia e-Skierowań pacjenta: {patientName || "Pacjent"}</h3>
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
              placeholder="Szukaj po kodzie PIN, komórce resortowej, rozpoznaniu ICD-10..."
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-full text-sm"
            />
          </div>
          {[
            ["all", `Wszystkie (${counts.all})`],
            ["issued", `Wystawione (${counts.issued})`],
            ["cancelled", `Anulowane (${counts.cancelled})`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === value ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {label}
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
            const code = accessCodeOf(row);
            const issued = issuedLike(row.status);
            const when = row.createdAt ? new Date(row.createdAt).toLocaleDateString("pl-PL") : "";
            return (
              <article key={row.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {code && <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">KOD: {code}</span>}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${row.status === "cancelled" ? "bg-rose-50 text-rose-700" : issued ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {issued && <CheckCircle2 size={12} />}
                      {statusBadge(row)}
                    </span>
                    <span className="text-slate-500">{typeLabel(payload)}</span>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    {when && <div className="inline-flex items-center gap-1"><Calendar size={12} /> {when}</div>}
                    {payload.doctorName && <div className="inline-flex items-center gap-1 mt-1"><User size={12} /> {payload.doctorName}</div>}
                  </div>
                </div>
                <h4 className="mt-2 font-bold text-slate-900">{cardTitle(payload)}</h4>
                {payload.icd10Code && (
                  <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Rozpoznanie:</span> {payload.icd10Code}{payload.icd10Display ? ` - ${payload.icd10Display}` : ""}</p>
                )}
                {payload.purpose && (
                  <p className="text-sm text-slate-600 mt-0.5"><span className="font-semibold text-slate-700">Cel:</span> {payload.purpose}</p>
                )}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDuplicate(row)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50"
                  >
                    <Copy size={14} /> Powiel
                  </button>
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
