import React, { useEffect, useState } from "react";
import appointmentHelper from "../../helpers/appointmentHelper";

const IcdField = ({ label, kind = "icd10", code, name, onPick, hint }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);

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

  return (
    <div className="text-sm">
      <div className="font-medium text-gray-800">{label}</div>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      {code && (
        <div className="mt-1 text-sm text-teal-800">
          {code} — {name}
        </div>
      )}
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        placeholder="Wpisz kod lub nazwę"
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
                onPick({ code: item.code || "", name: item.name || item.title || "" });
                setQuery("");
                setOpen(false);
                setResults([]);
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
