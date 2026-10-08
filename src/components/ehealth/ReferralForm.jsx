import React, { useEffect, useMemo, useState } from "react";
import IcdField from "./IcdField";

const CELLS = [
  { cell: "001", specialityCode: "1500", name: "Poradnia Chirurgii Ogólnej" },
  { cell: "002", specialityCode: "1221", name: "Poradnia Neurologiczna dla dzieci" },
  { cell: "003", specialityCode: "1506", name: "Poradnia Proktologiczna" },
  { cell: "004", specialityCode: "7210", name: "Pracownia USG" },
  { cell: "005", specialityCode: "1580", name: "Poradnia Chirurgii Urazowo - Ortopedycznej" },
  { cell: "006", specialityCode: "1370", name: "Poradnia Medycyny Sportowej" },
  { cell: "007", specialityCode: "1100", name: "Poradnia Kardiologiczna" },
  { cell: "008", specialityCode: "1401", name: "Poradnia Pediatryczna" },
  { cell: "009", specialityCode: "1640", name: "Poradnia Urologiczna" },
  { cell: "010", specialityCode: "1220", name: "Poradnia Neurologiczna" },
  { cell: "011", specialityCode: "7234", name: "Pracownia EEG" },
];

const NFZ = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"];

const empty = {
  type: "02.10",
  title: "",
  purpose: "",
  previousTests: "",
  icd10Code: "",
  icd10Display: "",
  bodySite: "",
  icd9Code: "",
  icd9Display: "",
  performerCode: "",
  reimbursed: "N",
  nfzDepartment: "13",
  nfzContract: "",
  patientNfz: "13",
  cito: false,
  observation: "",
  serviceMode: "TS",
  modeOfCommunication: "P",
  physicalFindings: {},
  reasons: [],
  oncologyTreatment: false,
  sanatoriumIn3y: "",
  spaNarrative: "",
  spaPlace: "",
  spaWhen: "",
  socialHistory: "",
};

const SPA_FINDINGS = [
  ["p1_skieruzdro_bp_cts", "Ciśnienie skurczowe"],
  ["p1_skieruzdro_bp_ctr", "Ciśnienie rozkurczowe"],
  ["p1_skieruzdro_bp_mc", "Masa ciała (kg)"],
  ["p1_skieruzdro_bp_wz", "Wzrost (cm)"],
  ["p1_skieruzdro_bp_te", "Tętno"],
  ["p1_skieruzdro_bp_skora_wezly_chlonne", "Skóra i węzły chłonne"],
  ["p1_skieruzdro_bp_uklad_oddechowy_ocw", "Układ oddechowy"],
  ["p1_skieruzdro_bp_uklad_krazenia_ocw_nyha", "Układ krążenia / NYHA"],
  ["p1_skieruzdro_bp_uklad_trawienny", "Układ trawienny"],
  ["p1_skieruzdro_bp_uklad_moczoplciowy_ocw_nerek", "Układ moczowo-płciowy"],
  ["p1_skieruzdro_bp_uklad_ruchu", "Układ ruchu"],
  ["p1_skieruzdro_bp_zdolnosc_samoobslugi", "Zdolność samoobsługi"],
  ["p1_skieruzdro_bp_ocena_sprawnosc_ruchowa", "Sprawność ruchowa"],
  ["p1_skieruzdro_bp_uklad_nerwowy_narzady_zmyslow", "Układ nerwowy i zmysły"],
  ["p1_skieruzdro_bp_przeciwskazania_nat_surowce_lecznicze", "Przeciwwskazania do surowców leczniczych"],
];

function blockers(form) {
  const messages = [];
  if (form.type === "02.10LU") {
    if (!["TS", "TA"].includes(form.serviceMode)) messages.push("Wybierz tryb realizacji uzdrowiska (TS albo TA).");
    if (!["P", "E"].includes(form.modeOfCommunication)) messages.push("Wybierz sposób korespondencji (P albo E).");
    if (!form.nfzContract?.trim()) messages.push("Skierowanie do uzdrowiska wymaga numeru umowy z NFZ.");
    if (SPA_FINDINGS.some(([type]) => !String(form.physicalFindings?.[type] || "").trim())) {
      messages.push("Uzupełnij całe badanie przedmiotowe.");
    }
    if (!form.reasons?.length) messages.push("Zaznacz co najmniej jeden powód skierowania.");
    if (form.serviceMode === "TA" && (!form.spaPlace?.trim() || !form.spaWhen?.trim())) {
      messages.push("Tryb TA wymaga miejscowości i terminu turnusu.");
    }
  }
  if (!form.title.trim()) messages.push("Podaj tytuł skierowania.");
  if (!form.purpose.trim()) messages.push("Podaj cel badania (uzasadnienie).");
  if (!form.icd10Code || !form.icd10Display) messages.push("Wybierz rozpoznanie ICD-10.");
  if (form.type !== "02.10LU" && !form.performerCode) messages.push("Wybierz komórkę realizującą.");
  if ((form.icd9Code && !form.icd9Display) || (!form.icd9Code && form.icd9Display)) {
    messages.push("Procedura ICD-9 wymaga kodu i nazwy.");
  }
  if (form.reimbursed === "Y" && (!form.nfzDepartment || !form.nfzContract.trim())) {
    messages.push("Skierowanie refundowane wymaga oddziału NFZ i numeru umowy z NFZ.");
  }
  if (form.observation.trim() && form.type !== "02.10REH") {
    messages.push("Opis obserwacji jest dozwolony tylko dla rehabilitacji (02.10REH).");
  }
  return messages;
}

const ReferralForm = ({ busy, onIssue, diagnoses = [], initialPayload }) => {
  const [form, setForm] = useState(() => ({ ...empty, ...(initialPayload || {}) }));
  const issues = useMemo(() => blockers(form), [form]);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (form.icd10Code || !diagnoses.length) return;
    const primary = diagnoses.find((row) => row.isPrimary) || diagnoses[0];
    const code = primary.code || primary.icd10Code || "";
    const name = primary.name || primary.icd10Display || primary.title || "";
    if (!code) return;
    set({ icd10Code: code, icd10Display: name });
  }, [diagnoses, form.icd10Code]);
  const cell = CELLS.find((row) => row.specialityCode === form.performerCode);

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-gray-500">
        Pola zgodne z weryfikacją e-skierowania Medfile. Wystawienie jest zablokowane, dopóki brakuje wymaganego pola albo typ jest niedozwolony.
      </p>
      <label className="block">
        Typ dokumentu
        <select
          value={form.type}
          onChange={(e) => set({ type: e.target.value, observation: e.target.value === "02.10REH" ? form.observation : "" })}
          className="mt-1 w-full p-2.5 border rounded-lg"
        >
          <option value="02.10">02.10 — skierowanie</option>
          <option value="02.10REH">02.10REH — rehabilitacja lecznicza</option>
          <option value="02.10LU">02.10LU — leczenie uzdrowiskowe</option>
        </select>
      </label>
      <label className="block">
        Tytuł
        <input value={form.title} onChange={(e) => set({ title: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
      </label>
      <label className="block">
        Cel badania (uzasadnienie)
        <textarea value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} rows={3} className="mt-1 w-full p-2.5 border rounded-lg" />
      </label>
      <label className="block">
        Badania dotychczas wykonane
        <textarea value={form.previousTests} onChange={(e) => set({ previousTests: e.target.value })} rows={2} className="mt-1 w-full p-2.5 border rounded-lg" />
      </label>
      <IcdField
        label="Rozpoznanie ICD-10"
        code={form.icd10Code}
        name={form.icd10Display}
        onPick={(item) => set({ icd10Code: item.code, icd10Display: item.name })}
      />
      <label className="block">
        Strona ciała
        <select value={form.bodySite} onChange={(e) => set({ bodySite: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          <option value="">Nie dotyczy</option>
          <option value="L">Lewa</option>
          <option value="R">Prawa</option>
        </select>
      </label>
      <IcdField
        kind="icd9"
        label="Procedura ICD-9 (opcjonalnie)"
        code={form.icd9Code}
        name={form.icd9Display}
        onPick={(item) => set({ icd9Code: item.code, icd9Display: item.name })}
      />
      <label className="block">
        Komórka realizująca (część VIII)
        <select value={form.performerCode} onChange={(e) => set({ performerCode: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          <option value="">Wybierz</option>
          {CELLS.map((row) => (
            <option key={row.cell} value={row.specialityCode}>
              {row.specialityCode} — {row.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Refundacja
        <select value={form.reimbursed} onChange={(e) => set({ reimbursed: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          <option value="N">N — nierefundowane</option>
          <option value="Y">Y — refundowane</option>
        </select>
      </label>
      {(form.reimbursed === "Y" || form.type === "02.10LU") && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            Oddział NFZ
            <select value={form.nfzDepartment} onChange={(e) => set({ nfzDepartment: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
              {NFZ.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Numer umowy NFZ
            <input value={form.nfzContract} onChange={(e) => set({ nfzContract: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
          </label>
        </div>
      )}
      <label className="block">
        Oddział NFZ pacjenta
        <select value={form.patientNfz} onChange={(e) => set({ patientNfz: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
          {NFZ.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.cito} onChange={(e) => set({ cito: e.target.checked })} />
        Cito (kod pilności UR)
      </label>
      {form.type === "02.10REH" && (
        <label className="block">
          Obserwacja (tylko rehabilitacja)
          <textarea value={form.observation} onChange={(e) => set({ observation: e.target.value })} rows={2} className="mt-1 w-full p-2.5 border rounded-lg" />
        </label>
      )}
      {form.type === "02.10LU" && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-gray-600">Leczenie uzdrowiskowe</p>
          <label className="block">
            Tryb realizacji
            <select value={form.serviceMode} onChange={(e) => set({ serviceMode: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
              <option value="TS">TS</option>
              <option value="TA">TA — z miejscowością i terminem</option>
            </select>
          </label>
          <label className="block">
            Korespondencja
            <select value={form.modeOfCommunication} onChange={(e) => set({ modeOfCommunication: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg">
              <option value="P">P — papier</option>
              <option value="E">E — elektronicznie</option>
            </select>
          </label>
          {SPA_FINDINGS.map(([type, label]) => (
            <label key={type} className="block">
              {label}
              <input
                value={form.physicalFindings?.[type] || ""}
                onChange={(e) => set({ physicalFindings: { ...form.physicalFindings, [type]: e.target.value } })}
                className="mt-1 w-full p-2.5 border rounded-lg"
              />
            </label>
          ))}
          <div className="space-y-1">
            {[
              ["ULA", "ULA"],
              ["PJZ", "PJZ"],
              ["INN", "Inny"],
            ].map(([code, label]) => (
              <label key={code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(form.reasons || []).some((row) => row.code === code)}
                  onChange={(e) => {
                    const reasons = e.target.checked
                      ? [...(form.reasons || []), { code, ...(code === "INN" ? { display: form.reasonOther || "Inny" } : {}) }]
                      : (form.reasons || []).filter((row) => row.code !== code);
                    set({ reasons });
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.oncologyTreatment} onChange={(e) => set({ oncologyTreatment: e.target.checked })} />
            Leczenie onkologiczne
          </label>
          <label className="block">
            Sanatorium w ciągu 3 lat
            <input value={form.sanatoriumIn3y} onChange={(e) => set({ sanatoriumIn3y: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
          </label>
          <label className="block">
            Wywiad
            <textarea value={form.spaNarrative} onChange={(e) => set({ spaNarrative: e.target.value })} rows={2} className="mt-1 w-full p-2.5 border rounded-lg" />
          </label>
          {form.serviceMode === "TA" && (
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                Miejscowość
                <input value={form.spaPlace} onChange={(e) => set({ spaPlace: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
              </label>
              <label className="block">
                Termin
                <input value={form.spaWhen} onChange={(e) => set({ spaWhen: e.target.value })} className="mt-1 w-full p-2.5 border rounded-lg" />
              </label>
            </div>
          )}
        </div>
      )}
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
        onClick={() =>
          onIssue({
            ...form,
            performer: cell?.name || "",
          })
        }
        className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50"
      >
        Wystaw skierowanie
      </button>
    </div>
  );
};

export default ReferralForm;
