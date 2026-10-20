import React, { useEffect, useState } from "react";
import appointmentHelper from "../../helpers/appointmentHelper";
import { visitDiagnosisRows } from "./visitIcd";

const IcdField = ({
  label,
  kind = "icd10",
  code,
  name,
  onPick,
  hint,
  diagnoses = [],
  emptyHint,
  importLabel = "Pobierz z wizyty",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const visitRows = kind === "icd10" ? visitDiagnosisRows(diagnoses) : [];
  const primary = visitRows.find((row) => row.isPrimary) || visitRows[0];

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSettled(false);
      return undefined;
    }
    let cancelled = false;
    setSettled(false);
    const timer = setTimeout(async () => {
      try {
        const rows =
          kind === "icd9"
            ? await appointmentHelper.searchIcd9(term)
            : await appointmentHelper.searchIcd10(term);
        if (!cancelled) {
          setResults(Array.isArray(rows) ? rows : []);
          setOpen(true);
          setSettled(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setSettled(true);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, kind]);

  const pick = (nextCode, nextName) => {
    onPick({ code: nextCode || "", name: nextName || "" });
    setQuery("");
    setOpen(false);
    setResults([]);
    setSettled(false);
  };

  const clear = () => {
    onPick({ code: "", name: "" });
    setQuery("");
    setOpen(false);
    setResults([]);
    setSettled(false);
  };

  const selected = Boolean(code || name);

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-gray-800">{label}</div>
        {kind === "icd10" && primary?.code && (
          <button type="button" onClick={() => pick(primary.code, primary.name)} className="text-xs font-semibold text-teal-800">
            {importLabel}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      {selected ? (
        <div className="mt-1 flex items-start justify-between gap-2 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1.5">
          <div className="text-sm text-teal-900">
            <span className="font-medium font-mono">{code}</span>
            {name ? <span className="ml-1 text-gray-700">— {name}</span> : null}
          </div>
          <button type="button" onClick={clear} className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
            Usuń
          </button>
        </div>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          {emptyHint || (kind === "icd10" ? "Pole jest puste. Wybierz rozpoznanie z wizyty albo wyszukaj inny kod." : "Pole jest puste. Wyszukaj kod albo nazwę.")}
        </p>
      )}
      {visitRows.length > 0 && (
        <div className="mt-1">
          <p className="text-[11px] text-slate-500 mb-1">Z tej wizyty</p>
          <div className="flex flex-wrap gap-1">
            {visitRows.map((row) => (
              <button
                key={`${row.code}-${row.name}`}
                type="button"
                onClick={() => (row.code === code ? clear() : pick(row.code, row.name))}
                className={`px-2 py-1 rounded-lg border text-left text-xs ${row.code === code ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white hover:bg-teal-50"}`}
              >
                <span className="font-mono font-medium">{row.code}</span>
                {row.name ? <span className="ml-1 text-slate-700">{row.name}</span> : null}
              </button>
            ))}
          </div>
        </div>
      )}
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        placeholder={selected ? "Zamień na inny kod lub nazwę" : "Wpisz kod lub nazwę"}
        className="mt-1 w-full p-2.5 border rounded-lg"
      />
      {open && settled && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-1 text-xs text-slate-500">Brak kodów dla „{query.trim()}”.</p>
      )}
      {open && results.length > 0 && (
        <div className="mt-1 border rounded-lg max-h-40 overflow-y-auto bg-white">
          <button type="button" onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} className="w-full text-right px-3 py-1 text-[11px] font-semibold text-slate-500">Zamknij listę</button>
          {results.map((item, index) => (
            <button
              key={`${item.code || "x"}-${index}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 border-b last:border-0"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(item.code || "", item.name || item.title || "");
              }}
            >
              <span className="font-medium text-teal-800">{item.code}</span>
              <span className="text-gray-700 ml-2">{item.name || item.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IcdField;
