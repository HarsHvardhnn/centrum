import React, { useMemo, useRef, useState, useEffect } from "react";
import { RESORT_CODE_ROWS } from "./resortCodeList";

const BY_CODE = new Map(RESORT_CODE_ROWS.map(([code, name]) => [code, name]));

/** Name for a part VIII code; units treating children use the next odd code (1220 -> 1221). */
export function resortLabel(code) {
  const c = String(code || "");
  if (BY_CODE.has(c)) return BY_CODE.get(c);
  const n = Number(c);
  if (/^\d{4}$/.test(c) && n % 2 === 1) {
    const base = String(n - 1).padStart(4, "0");
    if (BY_CODE.has(base)) return `${BY_CODE.get(base)} (dla dzieci)`;
  }
  return "";
}

/**
 * Specialty of a cell, picked from the official list of 359 codes (part VIII of the ministry code), searchable by
 * name or code. The name fills in by itself; units for children use the next odd code.
 */
export default function ResortSpecialtyPicker({ code, onChange }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    const rows = term ? RESORT_CODE_ROWS.filter(([c, name]) => c.includes(term) || name.toLowerCase().includes(term)) : RESORT_CODE_ROWS;
    return rows.slice(0, 60);
  }, [q]);

  const label = resortLabel(code);
  const n = Number(code);
  const isChild = /^\d{4}$/.test(String(code || "")) && n % 2 === 1 && !BY_CODE.has(String(code));
  const baseCode = isChild ? String(n - 1).padStart(4, "0") : String(code || "");
  const canChild = BY_CODE.has(baseCode) && Number(baseCode) % 2 === 0;

  const pick = (c) => {
    onChange(c, resortLabel(c));
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        placeholder="Szukaj po nazwie lub kodzie (359 specjalności)…"
        value={open ? q : code ? `${code} — ${label}` : ""}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {matches.length === 0 ? (
            <p className="p-2 text-xs text-gray-500">Brak wyników.</p>
          ) : (
            matches.map(([c, name]) => (
              <button key={c} type="button" onClick={() => pick(c)} className="flex w-full gap-2 px-3 py-1.5 text-left text-sm hover:bg-teal-50">
                <span className="w-12 shrink-0 font-mono text-xs text-gray-500">{c}</span>
                <span>{name}</span>
              </button>
            ))
          )}
        </div>
      )}
      {code && canChild && (
        <label className="mt-1 flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={isChild} onChange={(e) => pick(e.target.checked ? String(Number(baseCode) + 1).padStart(4, "0") : baseCode)} />
          Poradnia dla dzieci (kod {String(Number(baseCode) + 1).padStart(4, "0")})
        </label>
      )}
    </div>
  );
}
