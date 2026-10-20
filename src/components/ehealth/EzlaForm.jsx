import React, { useEffect, useMemo, useState } from "react";
import IcdField from "./IcdField";
import ehealthHelper from "../../helpers/ehealthHelper";

const INSTITUTIONS = [
  { value: "ZUS", label: "ZUS" },
  { value: "KRUS", label: "KRUS" },
  { value: "INNE_W_POLSCE", label: "Inne w Polsce" },
  { value: "W_INNYM_PANSTWIE", label: "W innym państwie" },
];

const KINSHIP = [
  { value: "", label: "Nie dotyczy" },
  { value: "1", label: "1 — dziecko" },
  { value: "2", label: "2 — małżonek, rodzice, ojczym, macocha, teściowie, dziadkowie, wnuki, rodzeństwo" },
  { value: "3", label: "3 — inne osoby" },
];

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const empty = {
  institution: "ZUS",
  from: "",
  to: "",
  suggestion: "",
  icd10: "",
  icdName: "",
  disease1: "",
  disease2: "",
  disease3: "",
  disease4: "",
  hospitalFrom: "",
  hospitalTo: "",
  familyMemberCode: "",
  familyMemberDate: "",
  payers: [{ type: "1", id: "" }],
  reasonInPast: "",
  zoz: false,
  doNotSend: false,
};

function blockers(form, canIssue) {
  const messages = [];
  if (canIssue === false) {
    messages.push("Lekarz nie ma uprawnienia do wystawienia zwolnienia na ten dzień.");
  }
  const payersNeeded = form.institution === "ZUS" || form.institution === "INNE_W_POLSCE";
  const payersForbidden = form.institution === "KRUS" || form.institution === "W_INNYM_PANSTWIE";
  const filledPayers = form.payers.filter((payer) => payer.id.trim());
  const root = String(form.icd10 || "").toUpperCase().replace(/\..*$/, "");
  if (!form.from || !form.to) messages.push("Podaj datę początkową i końcową zwolnienia.");
  if (form.from && form.to && form.to < form.from) {
    messages.push("Data końcowa nie może być wcześniejsza niż data początkowa.");
  }
  if (!["1", "2"].includes(form.suggestion)) {
    messages.push("Wybierz wskazanie: leżeć albo może chodzić.");
  }
  if (!/^[A-Z][0-9]{2}$/.test(root)) {
    messages.push("Wybierz numer statystyczny choroby — kod ICD-10. Do ZUS idzie tylko część przed kropką.");
  }
  if (payersNeeded && filledPayers.length === 0) {
    messages.push("Dla ZUS i ubezpieczenia innego w Polsce podaj co najmniej jednego płatnika.");
  }
  if (payersForbidden && filledPayers.length > 0) {
    messages.push("Dla KRUS i ubezpieczenia w innym państwie nie podaje się płatników.");
  }
  if (form.familyMemberCode && !form.familyMemberDate) {
    messages.push("Opieka nad członkiem rodziny wymaga daty urodzenia tej osoby.");
  }
  const hosp = Boolean(form.hospitalFrom) !== Boolean(form.hospitalTo);
  if (hosp) messages.push("Hospitalizacja wymaga obu dat albo żadnej.");
  if (
    form.hospitalFrom &&
    form.hospitalTo &&
    form.from &&
    form.to &&
    (form.hospitalFrom < form.from || form.hospitalTo > form.to || form.hospitalTo < form.hospitalFrom)
  ) {
    messages.push("Hospitalizacja musi mieścić się w okresie zwolnienia.");
  }
  const backdated = form.from && form.from < todayIso();
  if (backdated && !root.startsWith("F") && !form.reasonInPast.trim()) {
    messages.push("Zwolnienie wsteczne wymaga uzasadnienia. Dla kodów psychiatrycznych (F) uzasadnienia się nie podaje.");
  }
  return messages;
}

function inclusiveDays(from, to) {
  if (!from || !to || to < from) return null;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end - start) / 86400000) + 1;
}

const EzlaForm = ({ busy, patientId, onIssue, initialPayload, diagnoses = [] }) => {
  const [form, setForm] = useState(() => ({ ...empty, ...(initialPayload || {}) }));
  const [suggestedPayers, setSuggestedPayers] = useState([]);
  const [family, setFamily] = useState([]);
  const [canIssue, setCanIssue] = useState(null);
  const issues = useMemo(() => blockers(form, canIssue), [form, canIssue]);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!patientId) return undefined;
    let cancelled = false;
    ehealthHelper
      .ezlaContext(patientId, form.institution)
      .then((res) => {
        if (cancelled || !res?.success) return;
        const data = res.data || {};
        setCanIssue(data.canIssue ?? null);
        setSuggestedPayers(Array.isArray(data.payers) ? data.payers : []);
        setFamily(Array.isArray(data.family) ? data.family : []);
        if (Array.isArray(data.payers) && data.payers.length > 0) {
          setForm((prev) => ({ ...prev, payers: data.payers.map((payer) => ({ type: payer.type, id: payer.id })) }));
        }
      })
      .catch(() => {
        if (!cancelled) setCanIssue(null);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, form.institution]);
  const payersForbidden = form.institution === "KRUS" || form.institution === "W_INNYM_PANSTWIE";
  const root = String(form.icd10 || "").toUpperCase().replace(/\..*$/, "");
  const backdated = form.from && form.from < todayIso() && !root.startsWith("F");
  const dayCount = inclusiveDays(form.from, form.to);

  const issue = () => {
    onIssue({
      institution: form.institution,
      from: form.from,
      to: form.to,
      suggestion: form.suggestion,
      icd10: root,
      disease1: form.disease1,
      disease2: form.disease2,
      disease3: form.disease3,
      disease4: form.disease4,
      hospitalFrom: form.hospitalFrom,
      hospitalTo: form.hospitalTo,
      familyMemberCode: form.familyMemberCode,
      familyMemberDate: form.familyMemberDate,
      payers: payersForbidden ? [] : form.payers.filter((payer) => payer.id.trim()),
      reasonInPast: backdated ? form.reasonInPast.trim() : "",
      zoz: form.zoz,
      doNotSend: form.doNotSend,
    });
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
        Certyfikat ZUS jest w Medfile — CM7MED nie przechowuje PIN ani pliku PFX. Zwolnienie nie wyjdzie, dopóki ten certyfikat nie jest wgrany.
      </div>
      <label className="block">
        Instytucja ubezpieczenia
        <select
          value={form.institution}
          onChange={(e) => {
            const institution = e.target.value;
            const forbidden = institution === "KRUS" || institution === "W_INNYM_PANSTWIE";
            set({ institution, ...(forbidden ? { payers: [] } : {}) });
          }}
          className="mt-1 w-full p-2.5 border rounded-lg"
        >
          {INSTITUTIONS.map((row) => (
            <option key={row.value} value={row.value}>{row.label}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          Od
          <input type="date" value={form.from} onChange={(e) => set({ from: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
        <label className="block">
          Do
          <input type="date" value={form.to} onChange={(e) => set({ to: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
      </div>
      {dayCount != null && <p className="text-sm text-gray-700">Liczba dni zwolnienia: {dayCount}</p>}
      <label className="block">
        Wskazanie
        <select value={form.suggestion} onChange={(e) => set({ suggestion: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          <option value="">Wybierz</option>
          <option value="1">1 — chory powinien leżeć</option>
          <option value="2">2 — chory może chodzić</option>
        </select>
      </label>
      <IcdField
        label="Numer statystyczny choroby (ICD-10)"
        hint="Do ZUS trafia tylko kod główny, bez części po kropce."
        code={form.icd10}
        name={form.icdName}
        diagnoses={diagnoses}
        onPick={(item) => set({ icd10: String(item.code || "").toUpperCase().replace(/\..*$/, ""), icdName: item.name })}
      />
      <div className="grid grid-cols-4 gap-2">
        {["disease1", "disease2", "disease3", "disease4"].map((key, index) => (
          <label key={key} className="block">
            Kod {index + 1}
            <select value={form[key]} onChange={(e) => set({ [key]: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
              <option value="">—</option>
              {["A", "B", "C", "D", "E"].map((letter) => (
                <option key={letter} value={letter}>{letter}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500">Kody literowe choroby są opcjonalne. Dozwolone tylko A–E.</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          Hospitalizacja od
          <input type="date" value={form.hospitalFrom} onChange={(e) => set({ hospitalFrom: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
        <label className="block">
          Hospitalizacja do
          <input type="date" value={form.hospitalTo} onChange={(e) => set({ hospitalTo: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
      </div>
      <label className="block">
        Opieka nad członkiem rodziny
        <select value={form.familyMemberCode} onChange={(e) => set({ familyMemberCode: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          {KINSHIP.map((row) => (
            <option key={row.value || "none"} value={row.value}>{row.label}</option>
          ))}
        </select>
      </label>
      {form.familyMemberCode && family.length > 0 && (
        <label className="block">
          Członek rodziny z ZUS
          <select
            value={form.familyMemberDate}
            onChange={(e) => set({ familyMemberDate: e.target.value })}
            className="mt-1 w-full p-2.5 border rounded-lg"
          >
            <option value="">Wybierz</option>
            {family.map((person) => (
              <option key={`${person.name}-${person.date}`} value={person.date}>
                {person.name} — {person.date}
              </option>
            ))}
          </select>
        </label>
      )}
      {form.familyMemberCode && (
        <label className="block">
          Data urodzenia członka rodziny
          <input type="date" value={form.familyMemberDate} onChange={(e) => set({ familyMemberDate: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
      )}
      {payersForbidden ? (
        <p className="text-sm text-gray-600">Dla KRUS i ubezpieczenia w innym państwie płatników się nie podaje.</p>
      ) : (
        <div className="space-y-2">
          <div className="font-medium">Płatnicy</div>
          {suggestedPayers.length > 0 && (
            <p className="text-xs text-gray-500">Lista z ZUS dla tego pacjenta. Zostaw tylko płatników, których dotyczy zwolnienie.</p>
          )}
          {form.payers.map((payer, index) => (
            <div key={index} className="grid grid-cols-[8rem_1fr_auto] gap-2">
              <select
                value={payer.type}
                onChange={(e) => {
                  const payers = form.payers.slice();
                  payers[index] = { ...payer, type: e.target.value };
                  set({ payers });
                }}
                className="p-2.5 border rounded-lg"
              >
                <option value="1">NIP</option>
                <option value="2">PESEL</option>
                <option value="3">Paszport</option>
              </select>
              <input
                value={payer.id}
                onChange={(e) => {
                  const payers = form.payers.slice();
                  payers[index] = { ...payer, id: e.target.value };
                  set({ payers });
                }}
                className="p-2.5 border rounded-lg"
              />
              <button
                type="button"
                className="px-2 text-red-700"
                onClick={() => set({ payers: form.payers.filter((_, i) => i !== index) })}
              >
                Usuń
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-teal-800 text-sm"
            onClick={() => set({ payers: [...form.payers, { type: "1", id: "" }] })}
          >
            Dodaj płatnika
          </button>
        </div>
      )}
      {backdated && (
        <label className="block">
          Uzasadnienie zwolnienia wstecznego
          <textarea value={form.reasonInPast} onChange={(e) => set({ reasonInPast: e.target.value })} rows={2} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
      )}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.zoz} onChange={(e) => set({ zoz: e.target.checked })} />
        Pacjent zostaje w ośrodku (ZOZ)
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.doNotSend} onChange={(e) => set({ doNotSend: e.target.checked })} />
        Nie wysyłaj informacji płatnikowi automatycznie
      </label>
      {issues.length > 0 && (
        <ul className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm list-disc pl-5 space-y-1">
          {issues.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={busy || issues.length > 0}
        onClick={issue}
        className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50"
      >
        Wystaw e-ZLA
      </button>
    </div>
  );
};

export default EzlaForm;
