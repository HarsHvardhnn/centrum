import React from "react";
import { X } from "lucide-react";
import IcdCombobox, { isIcdRange } from "./IcdCombobox";

export const MAX_DIAGNOSES = 5;

/** Additional diagnoses without repeats and without the main one. */
export function uniqueExtra(code, extra) {
  const seen = new Set([code]);
  return (Array.isArray(extra) ? extra : []).filter((row) => row.code && !seen.has(row.code) && seen.add(row.code));
}

/** Main ICD-10 diagnosis plus any number of additional ones (P1 takes a list of conditions). */
export default function IcdMulti({ visitDiagnoses = [], code, name, extra = [], onChange, optional = false, label }) {
  const list = uniqueExtra(code, extra);
  const taken = [code, ...list.map((row) => row.code)].filter(Boolean);
  const headings = visitDiagnoses.filter((row) => isIcdRange(row.code)).map((row) => row.code);
  return (
    <div className="space-y-1.5">
      <IcdCombobox
        visitDiagnoses={visitDiagnoses}
        code={code}
        name={name}
        optional={optional}
        label={label}
        exclude={list.map((row) => row.code)}
        onChange={(next) => onChange({ code: next.code, name: next.name, extra: next.code ? list.filter((row) => row.code !== next.code) : list })}
      />
      {list.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {list.map((row) => (
            <li key={row.code} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-slate-800">
              <span className="font-mono font-bold">{row.code}</span>
              <span className="max-w-[16rem] truncate">{row.name}</span>
              <button type="button" title="Usuń rozpoznanie" onClick={() => onChange({ code, name, extra: list.filter((r) => r.code !== row.code) })} className="text-slate-400 hover:text-red-600">
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {code && taken.length < MAX_DIAGNOSES && (
        <IcdCombobox
          visitDiagnoses={visitDiagnoses}
          code=""
          name=""
          optional
          label="Dodaj kolejne rozpoznanie (opcjonalne)"
          exclude={taken}
          onChange={(next) => next.code && !taken.includes(next.code) && onChange({ code, name, extra: [...list, { code: next.code, name: next.name }] })}
        />
      )}
      {headings.length > 0 && (
        <p className="text-[11px] font-normal text-amber-700">
          Z wizyty nie można pobrać: {headings.join(", ")}. To zakres kodów, którego P1 nie przyjmuje — wybierz konkretny kod.
        </p>
      )}
    </div>
  );
}
