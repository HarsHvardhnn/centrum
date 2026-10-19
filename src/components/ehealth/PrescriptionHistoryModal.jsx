import React, { useEffect, useMemo, useState } from "react";
import { History, X, Search, Check, RotateCcw } from "lucide-react";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { STATUS_LABELS } from "./ehealthStatus";

const RANGES = [
  ["6m", "Ostatnie 6 mies."],
  ["12m", "Ostatnie 12 mies."],
  ["24m", "Ostatnie 24 mies."],
  ["all", "Cała historia"],
];

function statusText(pack) {
  if (pack.source === "p1") return pack.status || "P1";
  return STATUS_LABELS[pack.status] || pack.status || "CM7";
}

export default function PrescriptionHistoryModal({ open, patientId, patientName, onClose, onRepeat }) {
  const [range, setRange] = useState("12m");
  const [source, setSource] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [p1Error, setP1Error] = useState("");
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!open || !patientId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    ehealthHelper.prescriptionHistory({ patientId, range }).then((res) => {
      if (cancelled) return;
      const clinic = res?.data?.clinic || [];
      const p1 = res?.data?.p1 || [];
      setPackages([...clinic, ...p1]);
      setP1Error(res?.data?.p1Error || "");
    }).catch((err) => {
      if (cancelled) return;
      setPackages([]);
      setError(unwrapEhealthError(err).message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, patientId, range]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return packages.filter((pack) => {
      if (source !== "all" && pack.source !== source) return false;
      if (!needle) return true;
      const hay = [pack.code, pack.form, ...pack.drugs.flatMap((drug) => [drug.name, drug.ean, drug.dosage])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [packages, source, query]);

  if (!open) return null;

  const selectedRows = Object.values(selected);
  const toggle = (key, drug) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = drug;
      return next;
    });
  };
  const togglePackage = (pack) => {
    const keys = pack.drugs.map((_, index) => `${pack.id}-${index}`);
    const allOn = keys.every((key) => selected[key]);
    setSelected((prev) => {
      const next = { ...prev };
      pack.drugs.forEach((drug, index) => {
        const key = `${pack.id}-${index}`;
        if (allOn) delete next[key];
        else next[key] = drug;
      });
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[86vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#0D5C46]">
              <History size={16} />
              <h3 className="font-semibold text-slate-900">Historia e-recept</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{patientName || "Pacjent"} · wybrane leki trafią na nową receptę, bieżąca zostaje bez zmian</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center" aria-label="Zamknij"><X size={16} /></button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 space-y-2 bg-slate-50">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lek, EAN lub kod" className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm bg-white">
              {RANGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["all", "Wszystkie"],
              ["cm7", "Wystawione w CM7"],
              ["p1", "Pobrane z P1"],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSource(value)} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${source === value ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-600 border-slate-200"}`}>
                {label}
              </button>
            ))}
          </div>
          {p1Error && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">{p1Error}</p>}
          {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/70">
          {loading && <p className="text-sm text-slate-500">Pobieram historię recept…</p>}
          {!loading && !visible.length && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-sm text-slate-500">
              Nie znaleziono recept w wybranym okresie.
            </div>
          )}
          {visible.map((pack) => {
            const keys = pack.drugs.map((_, index) => `${pack.id}-${index}`);
            const allOn = keys.length > 0 && keys.every((key) => selected[key]);
            return (
              <section key={pack.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pack.source === "p1" ? "bg-sky-100 text-sky-800" : "bg-slate-800 text-white"}`}>{pack.source === "p1" ? "P1" : "CM7"}</span>
                      <span className="font-semibold text-slate-900">{pack.date || "—"}</span>
                      <span>{pack.form}</span>
                      {pack.code && <span className="font-mono">Kod {pack.code}</span>}
                      <span>{statusText(pack)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => togglePackage(pack)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-[#0D5C46] bg-emerald-50">
                    {allOn ? "Odznacz wszystkie" : "Powtórz wszystkie"}
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {pack.drugs.map((drug, index) => {
                    const key = `${pack.id}-${index}`;
                    const on = Boolean(selected[key]);
                    return (
                      <div key={key} className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${on ? "border-[#0D5C46] bg-emerald-50/50" : "border-slate-200"}`}>
                        <div className="min-w-0 text-sm">
                          <div className="font-semibold text-slate-900 break-words">{drug.name}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            {drug.quantity} op.{drug.packaging ? ` · ${drug.packaging}` : ""} · odpłatność {drug.payment}
                            {drug.dosage ? ` · ${drug.dosage}` : ""}
                            {drug.annual ? " · 365 dni" : ""}
                          </div>
                        </div>
                        <button type="button" onClick={() => toggle(key, drug)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 ${on ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-700 border-slate-200"}`}>
                          {on ? <Check size={14} /> : <RotateCcw size={14} />}
                          {on ? "Wybrano" : "Powtórz lek"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Wybrano do kontynuacji: <strong className="text-slate-900">{selectedRows.length}</strong>
            {selectedRows.length > 0 && (
              <button type="button" onClick={() => setSelected({})} className="ml-3 text-rose-700 underline">Odznacz wszystkie</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm">Anuluj</button>
            <button
              type="button"
              disabled={!selectedRows.length}
              onClick={() => onRepeat(selectedRows)}
              className="px-4 py-2 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-1"
            >
              <RotateCcw size={14} /> Powtórz wybrane leki ({selectedRows.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
