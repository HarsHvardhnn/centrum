import React, { useEffect, useState } from "react";
import appointmentHelper from "../../helpers/appointmentHelper";

const IcdField = ({ label, kind = "icd10", code, name, onPick, hint }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const rows =
          kind === "icd9"
            ? await appointmentHelper.searchIcd9(term)
            : await appointmentHelper.searchIcd10(term);
        if (!cancelled) {
          setResults(Array.isArray(rows) ? rows : []);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults([]);
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
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Wpisz kod lub nazwę"
        className="mt-1 w-full p-2.5 border rounded-lg"
      />
      {open && results.length > 0 && (
        <div className="mt-1 border rounded-lg max-h-40 overflow-y-auto bg-white">
          {results.map((item, index) => (
            <button
              key={`${item.code || "x"}-${index}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 border-b last:border-0"
              onClick={() => {
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
