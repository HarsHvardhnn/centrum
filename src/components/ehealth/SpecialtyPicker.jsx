import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { specialtiesFor } from "./p1Specialties";

/** Picks P1 specializations from the official dictionary (filtered by role); the name fills in by itself. */
export default function SpecialtyPicker({ role, value = [], onChange, disabled = false }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const chosen = new Set(value.map((row) => row.code));
  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return specialtiesFor(role)
      .filter((row) => !chosen.has(row.code))
      .filter((row) => !q || row.code.includes(q) || row.display.toLowerCase().includes(q))
      .slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, term, value]);

  return (
    <div className="space-y-1.5">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((row) => (
            <li key={row.code} className="inline-flex items-center gap-1 rounded-lg border border-teal-300 bg-teal-50 px-2 py-1 text-xs text-slate-800">
              <span className="font-mono font-bold">{row.code}</span>
              <span>{row.display}</span>
              {!disabled && (
                <button type="button" title="Usuń specjalizację" onClick={() => onChange(value.filter((r) => r.code !== row.code))} className="text-slate-400 hover:text-red-600">
                  <X size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          type="text"
          value={term}
          disabled={disabled}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={disabled ? "Nie dotyczy" : "Szukaj specjalizacji (nazwa lub kod)…"}
          className="w-full p-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
        />
        {open && !disabled && rows.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {rows.map((row) => (
              <li key={row.code}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange([...value, { code: row.code, display: row.display }]); setTerm(""); }}
                  className="flex w-full gap-2 px-3 py-1.5 text-left text-sm hover:bg-teal-50"
                >
                  <span className="font-mono font-semibold text-slate-600">{row.code}</span>
                  <span>{row.display}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
