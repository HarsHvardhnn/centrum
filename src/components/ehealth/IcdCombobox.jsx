import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Stethoscope, X } from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";

/** Shown straight away when the field opens, so a doctor can pick without typing. */
export const COMMON_ICD10 = [
  { code: "I10", name: "Nadciśnienie samoistne (pierwotne)" },
  { code: "I48", name: "Migotanie i trzepotanie przedsionków" },
  { code: "I25.1", name: "Choroba serca w przebiegu miażdżycy" },
  { code: "I50.9", name: "Niewydolność serca, nieokreślona" },
  { code: "E11", name: "Cukrzyca insulinoniezależna" },
  { code: "E03.9", name: "Niedoczynność tarczycy, nieokreślona" },
  { code: "E78.0", name: "Czysta hipercholesterolemia" },
  { code: "E66", name: "Otyłość" },
  { code: "J06.9", name: "Ostre zakażenie górnych dróg oddechowych, nieokreślone" },
  { code: "J20.9", name: "Ostre zapalenie oskrzeli, nieokreślone" },
  { code: "J02.9", name: "Ostre zapalenie gardła, nieokreślone" },
  { code: "J45", name: "Astma oskrzelowa" },
  { code: "R05", name: "Kaszel" },
  { code: "R51", name: "Ból głowy" },
  { code: "G43.9", name: "Migrena, nieokreślona" },
  { code: "M54.5", name: "Ból okolicy lędźwiowo-krzyżowej" },
  { code: "M17.9", name: "Gonartroza, nieokreślona" },
  { code: "N39.0", name: "Zakażenie układu moczowego o nieokreślonym umiejscowieniu" },
  { code: "K21.0", name: "Refluks żołądkowo-przełykowy z zapaleniem przełyku" },
  { code: "K29.7", name: "Zapalenie żołądka, nieokreślone" },
  { code: "L20.9", name: "Atopowe zapalenie skóry, nieokreślone" },
  { code: "F41.9", name: "Zaburzenia lękowe, nieokreślone" },
  { code: "F32.9", name: "Epizod depresyjny, nieokreślony" },
  { code: "F90.0", name: "Zaburzenie aktywności i uwagi" },
];

const searchCache = new Map();

function fold(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function matches(row, query) {
  const q = fold(query);
  return fold(row.code).includes(q) || fold(row.name).includes(q);
}

function Row({ row, selected, active, onPick, onHover }) {
  return (
    <li>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onPick(row); }}
        onMouseEnter={onHover}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs ${active ? "bg-emerald-50" : "bg-white"} ${selected ? "text-[#0D5C46] font-bold" : "text-slate-700"}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-900">{row.code}</span>
          <span className="truncate">{row.name}</span>
        </span>
        {selected && <Check size={14} className="shrink-0 text-[#0D5C46]" />}
      </button>
    </li>
  );
}

/**
 * One field for ICD-10: opens on focus with the visit's diagnoses and common codes,
 * filters them as you type, and adds matches from the full ICD-10 dictionary.
 */
export default function IcdCombobox({ visitDiagnoses = [], code, name, onChange, optional = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const term = query.trim();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (term.length < 2) {
      setRemote([]);
      setLoading(false);
      return undefined;
    }
    const key = fold(term);
    if (searchCache.has(key)) {
      setRemote(searchCache.get(key));
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const rows = await appointmentHelper.searchIcd10(term);
      const next = Array.isArray(rows) ? rows : [];
      searchCache.set(key, next);
      if (!cancelled) {
        setRemote(next);
        setLoading(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const sections = useMemo(() => {
    const seen = new Set();
    const take = (rows) => rows.filter((row) => {
      const key = row.code;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const visit = take(term ? visitDiagnoses.filter((row) => matches(row, term)) : visitDiagnoses);
    const common = take(term ? COMMON_ICD10.filter((row) => matches(row, term)) : COMMON_ICD10);
    const dictionary = take(remote);
    return [
      visit.length ? { title: "Z tej wizyty", rows: visit } : null,
      common.length ? { title: term ? "Najczęstsze" : "Najczęściej używane", rows: common } : null,
      dictionary.length ? { title: "Słownik ICD-10", rows: dictionary } : null,
    ].filter(Boolean);
  }, [visitDiagnoses, term, remote]);

  const flat = sections.flatMap((section) => section.rows);

  useEffect(() => { setCursor(0); }, [term, open]);

  const pick = (row) => {
    onChange({ code: row.code, name: row.name });
    setQuery("");
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange({ code: "", name: "" });
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setCursor((i) => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (flat[cursor]) pick(flat[cursor]); }
  };

  const primary = visitDiagnoses.find((row) => row.isPrimary) || visitDiagnoses[0];
  const shown = open ? query : code ? `${code} — ${name || ""}` : "";
  let index = -1;

  return (
    <div ref={boxRef} className="relative text-xs font-semibold text-slate-700">
      Rozpoznanie (ICD-10){optional ? " (opcjonalne)" : " *"}
      <div className="relative mt-1 flex items-center">
        <Search size={14} className="pointer-events-none absolute left-2.5 text-slate-400" />
        <input
          ref={inputRef}
          value={shown}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={code ? "Zamień na inny kod lub nazwę" : "Wybierz z listy lub wpisz kod / nazwę, np. I10, cukrzyca"}
          className={`w-full rounded-lg border bg-white py-2 pl-8 pr-8 text-xs font-medium text-slate-900 ${code && !open ? "border-emerald-300 bg-emerald-50" : "border-slate-300"} focus:border-[#0D5C46] focus:outline-none focus:ring-2 focus:ring-[#0D5C46]/20`}
        />
        {code || (open && query) ? (
          <button type="button" onMouseDown={clear} title="Wyczyść rozpoznanie" className="absolute right-2 rounded p-0.5 text-slate-400 hover:text-red-600">
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-slate-400" />
        )}
      </div>
      {!code && !open && primary?.code && (
        <button type="button" onClick={() => pick(primary)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D5C46]">
          <Stethoscope size={12} /> Pobierz z wizyty: {primary.code}
        </button>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="sticky top-0 border-b border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{section.title}</div>
              <ul className="divide-y divide-slate-100">
                {section.rows.map((row) => {
                  index += 1;
                  const own = index;
                  return <Row key={`${section.title}-${row.code}`} row={row} selected={row.code === code} active={own === cursor} onPick={pick} onHover={() => setCursor(own)} />;
                })}
              </ul>
            </div>
          ))}
          {loading && <div className="px-3 py-2 text-center text-[11px] font-normal text-slate-400">Szukam w słowniku ICD-10…</div>}
          {!loading && flat.length === 0 && (
            <div className="px-3 py-3 text-center text-[11px] font-normal text-slate-500">
              {term.length < 2 ? "Wpisz co najmniej 2 znaki." : `Brak kodów ICD-10 dla „${term}”.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
