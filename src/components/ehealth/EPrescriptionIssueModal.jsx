import React, { useEffect, useMemo, useState } from "react";
import { Pill, X, Plus, ShieldCheck, Eye, Printer, Mail, Smartphone, Copy } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError, drugsFromHistory, drugMatches } from "../../helpers/ehealthHelper";
import { STATUS_LABELS, statusClass, accessCodeOf } from "./ehealthStatus";

const PAYMENTS = [
  { value: "100%", label: "100%" },
  { value: "50%", label: "50%" },
  { value: "30%", label: "30%" },
  { value: "R", label: "Ryczałt" },
  { value: "B", label: "Bezpłatny" },
];

const ENTITLEMENTS = [
  ["", "BRAK — standardowe"],
  ["S", "S — seniorzy 65+"],
  ["DZ", "DZ — dzieci i młodzież do 18 r.ż."],
  ["C", "C — kobiety w ciąży"],
  ["ZK", "ZK — zasłużony dawca krwi"],
  ["IB", "IB — inwalida wojenny"],
  ["IW", "IW — inwalida wojskowy"],
  ["WP", "WP — żołnierz / pracownik wojska"],
  ["DN", "DN — dziecko nieubezpieczone"],
  ["CN", "CN — ciąża, osoba nieubezpieczona"],
  ["IN", "IN — inny tytuł"],
  ["UE", "UE / EKUZ"],
];

const DOC_ENTITLEMENTS = ["ZK", "IB", "IW", "WP", "IN"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ageFromPesel(pesel) {
  const digits = String(pesel || "").replace(/\D/g, "");
  if (digits.length !== 11) return "";
  let year = Number(digits.slice(0, 2));
  let month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  if (month > 80) { year += 1800; month -= 80; }
  else if (month > 60) { year += 2200; month -= 60; }
  else if (month > 40) { year += 2100; month -= 40; }
  else if (month > 20) { year += 2000; month -= 20; }
  else year += 1900;
  const born = new Date(year, month - 1, day);
  if (Number.isNaN(born.getTime())) return "";
  let age = new Date().getFullYear() - born.getFullYear();
  const beforeBirthday = new Date().getMonth() < born.getMonth() || (new Date().getMonth() === born.getMonth() && new Date().getDate() < born.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? `${age} lat` : "";
}

function birthFromPesel(pesel) {
  const digits = String(pesel || "").replace(/\D/g, "");
  if (digits.length !== 11) return "";
  let year = Number(digits.slice(0, 2));
  let month = Number(digits.slice(2, 4));
  const day = digits.slice(4, 6);
  if (month > 80) { year += 1800; month -= 80; }
  else if (month > 60) { year += 2200; month -= 60; }
  else if (month > 40) { year += 2100; month -= 40; }
  else if (month > 20) { year += 2000; month -= 20; }
  else year += 1900;
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}

function blankItem(form) {
  return {
    key: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    drug: form === "recipe" ? { name: "Receptura własna" } : null,
    quantity: "1",
    payment: "100%",
    refundCode: "",
    dosage: "",
    frequency: "",
    periodHours: "24",
    durationDays: "",
    doseQuantity: "",
    doseUnit: "tabl.",
    substanceName: "",
    substanceQuantity: "",
    substanceUnit: "g",
    substanceWords: "",
    recipeText: "",
    patientNote: "",
    pharmacyNote: "",
    noSubstitution: false,
  };
}

function review(header, items, patient) {
  const blocking = [];
  const passed = [];
  if (patient) {
    const pesel = String(patient.pesel || "").replace(/\D/g, "");
    if (pesel.length !== 11) blocking.push("Kto: brak prawidłowego numeru PESEL pacjenta.");
    else passed.push("Kto: pacjent i PESEL są na wizycie.");
    if (!patient.doctorName) blocking.push("Kto: brak lekarza wystawiającego.");
    else passed.push(`Kto: wystawia ${patient.doctorName}.`);
    if (!patient.address) blocking.push("Gdzie: brak adresu pacjenta.");
    else passed.push("Gdzie: adres pacjenta jest uzupełniony.");
  }
  if (!items.length) blocking.push("Kiedy: dodaj co najmniej jeden lek.");
  if (header.form === "Rpw" && items.length > 1) blocking.push("Recepta Rpw może zawierać tylko jeden lek.");
  if ((header.form === "Rpz" || header.form === "recipe") && items.length > 1) blocking.push("Ten formularz mieści tylko jedną pozycję.");
  if (header.form === "Rp" && items.length > 5) blocking.push("Pakiet Rp mieści najwyżej 5 leków.");
  if (header.form === "Rpw" && header.annual) blocking.push("Kiedy: recepta Rpw nie może być roczna (maks. 30 dni).");
  if (header.form === "Rpw" && header.realizationFrom && header.realizationFrom !== todayIso()) {
    blocking.push("Kiedy: recepty Rpw nie można odroczyć.");
  }
  if (header.form === "Rpw" && !header.examMode) blocking.push("Recepta Rpw wymaga sposobu badania: osobiste albo teleporada.");
  if (DOC_ENTITLEMENTS.includes(header.entitlement) && !header.entitlementDocument.trim()) {
    blocking.push("Uprawnienie dodatkowe wymaga numeru dokumentu.");
  }
  items.forEach((item, index) => {
    const name = item.drug?.name || `Pozycja ${index + 1}`;
    if (header.form !== "recipe" && !item.drug?.ean && !item.drug?.code) blocking.push(`${name}: wybierz lek z bazy.`);
    if (!Number(item.quantity)) blocking.push(`${name}: wybierz liczbę opakowań.`);
    if (header.form === "recipe" && !String(item.recipeText || "").trim()) blocking.push("Receptura wymaga opisu składu.");
    const dosing = String(item.dosage || "");
    const scheme = header.annual || (item.payment && item.payment !== "100%");
    if (header.form === "Rpw" && /doraźnie/i.test(dosing)) blocking.push(`${name}: dawkowanie doraźne jest zablokowane na Rpw.`);
    if (header.annual && /doraźnie/i.test(dosing)) blocking.push(`${name}: dawkowanie doraźne jest zablokowane na recepcie 365 dni.`);
    if (scheme && header.form !== "recipe") {
      if (!Number(item.frequency) || !Number(item.durationDays) || !Number(item.doseQuantity)) {
        blocking.push(`${name}: uzupełnij schemat dawkowania (ile razy, dawka, liczba dni).`);
      }
    } else if (dosing.trim().length < 3) {
      blocking.push(`${name}: brak dawkowania.`);
    }
    if (header.form === "Rpw") {
      if (!String(item.substanceName || item.drug?.activeSubstance || "").trim()) blocking.push(`${name}: podaj substancję czynną.`);
      if (!/[A-Za-zÀ-ž]/.test(String(item.substanceWords || ""))) blocking.push(`${name}: ilość substancji czynnej musi być zapisana słownie.`);
      if (Number(item.durationDays) > 90) blocking.push("Kuracja Rpw może trwać najwyżej 90 dni.");
    }
  });
  if (items.length && !blocking.some((row) => row.startsWith("Kiedy"))) passed.push("Kiedy: daty i ważność nie blokują podpisu.");
  return { blocking, passed };
}

export default function EPrescriptionIssueModal({
  open,
  onClose,
  visitId,
  patientId,
  patient,
  onDocumentsChanged,
  initialPayload,
}) {
  const [header, setHeader] = useState(() => ({
    form: initialPayload?.form || "Rp",
    kind: initialPayload?.kind || "ZW",
    cito: Boolean(initialPayload?.cito),
    annual: Boolean(initialPayload?.annual),
    realizationFrom: initialPayload?.realizationFrom || "",
    examMode: initialPayload?.examMode || "",
    entitlement: initialPayload?.entitlement || "",
    entitlementDocument: initialPayload?.entitlementDocument || "",
  }));
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [historyDrugs, setHistoryDrugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !patientId) return undefined;
    let cancelled = false;
    ehealthHelper.history({ patientId }).then((res) => {
      if (!cancelled) setHistoryDrugs(drugsFromHistory(res?.data));
    }).catch(() => {
      if (!cancelled) setHistoryDrugs([]);
    });
    return () => { cancelled = true; };
  }, [open, patientId]);

  useEffect(() => {
    if (!open || header.form === "recipe") return undefined;
    const term = query.trim();
    if (term.length < 2) {
      setCatalog([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await ehealthHelper.searchDrugs(term);
        if (!cancelled) setCatalog(res?.data || []);
      } catch (err) {
        if (!cancelled) {
          setCatalog([]);
          toast.error(unwrapEhealthError(err).message);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, header.form]);

  const checks = useMemo(() => review(header, items, patient), [header, items, patient]);

  if (!open) return null;

  const maxItems = header.form === "Rp" ? 5 : 1;
  const patchHeader = (patch) => setHeader((prev) => ({ ...prev, ...patch }));
  const patchItem = (key, patch) => setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addDrug = (drug) => {
    if (header.form === "Rp" && (drug.kdlek === "Rpw" || drug.category === "Rpw")) {
      toast.error("Lek Rpw wymaga osobnej recepty Rpw.");
      return;
    }
    if (header.form === "Rpw" && items.length >= 1) {
      const current = items[0];
      setItems([{
        ...current,
        drug,
        substanceName: drug.activeSubstance || "",
        dosage: "",
        frequency: "",
        durationDays: "",
        doseQuantity: "",
      }]);
      toast.message(`Podmieniono lek Rpw na ${drug.name}. Uzupełnij dawkowanie.`);
      setQuery("");
      setCatalog([]);
      return;
    }
    if (items.length >= maxItems) {
      toast.error(header.form === "Rpw" ? "Recepta Rpw mieści tylko jeden lek." : "Ten formularz nie mieści kolejnej pozycji.");
      return;
    }
    const item = blankItem(header.form);
    item.drug = drug;
    item.substanceName = drug.activeSubstance || "";
    item.payment = drug.reimbursed ? "30%" : "100%";
    setItems((prev) => [...prev, item]);
    setQuery("");
    setCatalog([]);
  };

  const submitSigned = async () => {
    const payload = {
      ...header,
      signConfirmed: true,
      items: items.map((item) => ({
        drug: item.drug,
        category: header.form === "Rp" ? "Rp" : header.form === "recipe" ? "Rp" : header.form,
        quantity: item.quantity,
        payment: item.payment,
        refundCode: item.refundCode,
        dosage: item.dosage,
        frequency: item.frequency,
        periodHours: item.periodHours,
        durationDays: item.durationDays,
        doseQuantity: item.doseQuantity,
        doseUnit: item.doseUnit,
        infoForPatient: item.patientNote,
        infoForPerformer: item.pharmacyNote,
        substanceName: item.substanceName,
        substanceQuantity: item.substanceQuantity,
        substanceUnit: item.substanceUnit,
        substanceWords: item.substanceWords,
        recipeText: item.recipeText,
        noSubstitution: item.noSubstitution,
      })),
      noSubstitution: items.some((item) => item.noSubstitution),
    };
    const res = await ehealthHelper.submitPrescription({ visitId, patientId, payload });
    if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
    setResult(res.data);
    onDocumentsChanged?.();
    if (res.licenseWarning) toast.warning(res.licenseWarning);
  };

  const cancelResult = async () => {
    if (!result?.id) return;
    try {
      const res = await ehealthHelper.cancelDocument("prescription", result.id);
      setResult(res?.data || { ...result, status: "cancelled" });
      onDocumentsChanged?.();
      toast.success("e-Recepta anulowana w CM7MED.");
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    }
  };

  const code = accessCodeOf(result);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[1540px] h-[93vh] max-h-[960px] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#1e7a6f] px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center"><Pill size={20} /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-100/80">Centrum Medyczne 7 • System e-zdrowie (P1)</div>
              <h2 className="text-lg font-semibold">Moduł wystawiania e-recepty</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Zamknij"><X size={16} /></button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-3 text-xs text-slate-700">
          <span><span className="text-slate-500">Pacjent:</span> <strong>{patient?.name || "—"}</strong> · PESEL {patient?.pesel || "—"} · {patient?.age || ageFromPesel(patient?.pesel) || "—"}</span>
          <span><span className="text-slate-500">Wystawiający:</span> <strong>{patient?.doctorName || "—"}</strong> {patient?.pwz ? `(PWZ ${patient.pwz})` : ""}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">eWUŚ: sprawdzenie z wizyty</span>
        </div>

        {result ? (
          <IssuedPane result={result} code={code} items={items} patient={patient} onPrint={() => ehealthHelper.printDocument("prescription", result.id).catch((err) => toast.error(err.message))} onCancel={cancelResult} onAnother={() => { setResult(null); setItems([]); }} />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100/70">
            <aside className="w-full lg:w-[340px] shrink-0 border-r border-slate-200 bg-white p-3.5 overflow-y-auto space-y-3 text-xs">
              <section className="border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Świadczeniobiorca</div>
                <div className="mt-2 font-bold text-slate-900">{patient?.name || "—"}</div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Meta label="PESEL" value={patient?.pesel} />
                  <Meta label="Data urodzenia" value={patient?.birthDate || birthFromPesel(patient?.pesel)} />
                </div>
                <Meta label="Adres zamieszkania" value={patient?.address || "Brak adresu na karcie"} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Meta label="Telefon" value={patient?.phone} />
                  <Meta label="E-mail" value={patient?.email} />
                </div>
              </section>
              <section className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ubezpieczenie i uprawnienia</div>
                <select value={header.entitlement} onChange={(e) => patchHeader({ entitlement: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                  {ENTITLEMENTS.map(([value, label]) => <option key={value || "none"} value={value}>{label}</option>)}
                </select>
                {DOC_ENTITLEMENTS.includes(header.entitlement) && (
                  <input value={header.entitlementDocument} onChange={(e) => patchHeader({ entitlementDocument: e.target.value })} placeholder="Nr dokumentu uprawnienia" className="w-full p-2 border border-slate-300 rounded-lg" />
                )}
              </section>
              <section className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Formularz</div>
                <select value={header.form} onChange={(e) => patchHeader({ form: e.target.value, annual: e.target.value === "Rpw" || e.target.value === "recipe" ? false : header.annual })} className="w-full p-2 border border-slate-300 rounded-lg">
                  <option value="Rp">Rp — do 5 leków</option>
                  <option value="Rpw">Rpw — 1 lek odurzający / psychotropowy</option>
                  <option value="Rpz">Rpz — 1 pozycja</option>
                  <option value="recipe">Receptura — opis słowny</option>
                </select>
                <select value={header.kind} onChange={(e) => patchHeader({ kind: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                  <option value="ZW">Zwykła</option>
                  <option value="PA">Pro auctore</option>
                  <option value="PF">Pro familiae</option>
                </select>
                <label className="flex items-center gap-2"><input type="checkbox" checked={header.cito} onChange={(e) => patchHeader({ cito: e.target.checked })} /> CITO</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={header.annual} disabled={header.form === "Rpw" || header.form === "recipe"} onChange={(e) => patchHeader({ annual: e.target.checked })} /> Recepta na 365 dni</label>
                <label className="block">Realizacja od
                  <input type="date" value={header.realizationFrom} onChange={(e) => patchHeader({ realizationFrom: e.target.value })} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" />
                </label>
                {header.form === "Rpw" && (
                  <select value={header.examMode} onChange={(e) => patchHeader({ examMode: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                    <option value="">Sposób badania</option>
                    <option value="BADANIE_OSOBISTE">Badanie osobiste</option>
                    <option value="TELEPORADA">Teleporada</option>
                  </select>
                )}
              </section>
            </aside>

            <main className="flex-1 overflow-y-auto p-4 space-y-3">
              {header.form === "recipe" ? (
                <textarea value={items[0]?.recipeText || ""} onChange={(e) => {
                  const text = e.target.value;
                  setItems((prev) => [{ ...(prev[0] || blankItem("recipe")), recipeText: text }]);
                }} rows={6} placeholder="Skład receptury, każdy składnik w osobnej linii" className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
              ) : (
                <>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nazwa leku, substancja, EAN" className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                  {searching && <p className="text-xs text-slate-500">Szukam w bazie leków…</p>}
                  <DrugList title="Z historii wizyt" drugs={query.trim() ? historyDrugs.filter((drug) => drugMatches(drug, query)) : []} onAdd={addDrug} />
                  <DrugList title="Baza leków" drugs={catalog} onAdd={addDrug} />
                </>
              )}
              {items.map((item) => (
                <article key={item.key} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">{item.drug?.name || "Receptura"}</div>
                      <div className="text-xs text-slate-500">{[item.drug?.activeSubstance, item.drug?.strength, item.drug?.package, item.drug?.ean && `EAN ${item.drug.ean}`].filter(Boolean).join(" · ")}</div>
                    </div>
                    <button type="button" onClick={() => setItems((prev) => prev.filter((row) => row.key !== item.key))} className="text-xs text-slate-500">Usuń</button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <label className="text-xs">Opakowania<input value={item.quantity} onChange={(e) => patchItem(item.key, { quantity: e.target.value })} className="mt-1 w-full p-2 border rounded-lg" /></label>
                    <label className="text-xs">Odpłatność
                      <select value={item.payment} onChange={(e) => patchItem(item.key, { payment: e.target.value })} className="mt-1 w-full p-2 border rounded-lg">
                        {PAYMENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs">Wskazanie refundacyjne<input value={item.refundCode} onChange={(e) => patchItem(item.key, { refundCode: e.target.value })} className="mt-1 w-full p-2 border rounded-lg" /></label>
                  </div>
                  {(header.annual || item.payment !== "100%") && header.form !== "recipe" ? (
                    <div className="grid sm:grid-cols-4 gap-2">
                      <Small label="Ile razy" value={item.frequency} onChange={(value) => patchItem(item.key, { frequency: value })} />
                      <Small label="Co ile godzin" value={item.periodHours} onChange={(value) => patchItem(item.key, { periodHours: value })} />
                      <Small label="Przez ile dni" value={item.durationDays} onChange={(value) => patchItem(item.key, { durationDays: value })} />
                      <Small label="Dawka" value={item.doseQuantity} onChange={(value) => patchItem(item.key, { doseQuantity: value })} />
                    </div>
                  ) : (
                    <label className="text-xs block">Dawkowanie<input value={item.dosage} onChange={(e) => patchItem(item.key, { dosage: e.target.value })} placeholder="np. 1x1 rano" className="mt-1 w-full p-2 border rounded-lg" /></label>
                  )}
                  {header.form === "Rpw" && (
                    <div className="grid sm:grid-cols-2 gap-2 border-t pt-2">
                      <Small label="Substancja czynna" value={item.substanceName} onChange={(value) => patchItem(item.key, { substanceName: value })} />
                      <Small label="Ilość słownie" value={item.substanceWords} onChange={(value) => patchItem(item.key, { substanceWords: value })} />
                      <Small label="Ilość" value={item.substanceQuantity} onChange={(value) => patchItem(item.key, { substanceQuantity: value })} />
                      <Small label="Jednostka" value={item.substanceUnit} onChange={(value) => patchItem(item.key, { substanceUnit: value })} />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.noSubstitution} onChange={(e) => patchItem(item.key, { noSubstitution: e.target.checked })} /> NZ — nie zamieniać</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Small label="Instrukcja dla pacjenta" value={item.patientNote} onChange={(value) => patchItem(item.key, { patientNote: value })} />
                    <Small label="Informacja dla farmaceuty" value={item.pharmacyNote} onChange={(value) => patchItem(item.key, { pharmacyNote: value })} />
                  </div>
                </article>
              ))}
            </main>

            <aside className="w-full lg:w-[300px] shrink-0 border-l border-slate-200 bg-white p-3.5 overflow-y-auto text-xs space-y-3">
              <div className="font-bold uppercase tracking-wider text-slate-500">Kontrola: kto, gdzie, kiedy</div>
              {checks.blocking.map((row) => <p key={row} className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{row}</p>)}
              {checks.passed.map((row) => <p key={row} className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2">{row}</p>)}
              {!checks.blocking.length && items.length > 0 && <p className="font-semibold text-emerald-800">Brak błędów blokujących podpis.</p>}
            </aside>
          </div>
        )}

        {!result && (
          <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 bg-white">
            <button type="button" onClick={() => setPreviewOpen(true)} className="text-sm font-semibold text-[#0D5C46] inline-flex items-center gap-1"><Eye size={16} /> Podgląd</button>
            <button
              type="button"
              disabled={checks.blocking.length > 0}
              onClick={() => setSignOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold disabled:opacity-40"
            >
              Podpisz i wyślij e-receptę
            </button>
          </div>
        )}
      </div>

      {previewOpen && <PreviewOverlay items={items} header={header} onClose={() => setPreviewOpen(false)} />}
      {signOpen && (
        <SignModal
          count={items.length}
          onClose={() => setSignOpen(false)}
          onPreview={() => setPreviewOpen(true)}
          onConfirm={async () => {
            try {
              setBusy(true);
              await submitSigned();
              setSignOpen(false);
            } catch (err) {
              toast.error(unwrapEhealthError(err).message);
            } finally {
              setBusy(false);
            }
          }}
          busy={busy}
        />
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="mt-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-xs font-semibold text-slate-800 mt-0.5">{value || "—"}</div>
    </div>
  );
}

function Small({ label, value, onChange }) {
  return (
    <label className="text-xs block">{label}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" />
    </label>
  );
}

function DrugList({ title, drugs, onAdd }) {
  if (!drugs?.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-slate-500">{title}</p>
      {drugs.map((drug) => (
        <button key={`${title}-${drug.ean || drug.name}`} type="button" onClick={() => onAdd(drug)} className="w-full text-left bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-[#0D5C46]">
          <div className="text-sm font-medium">{drug.name}</div>
          <div className="text-[11px] text-slate-500">{[drug.kdlek, drug.activeSubstance, drug.package, drug.ean].filter(Boolean).join(" · ")}</div>
        </button>
      ))}
    </div>
  );
}

function PreviewOverlay({ items, header, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-3">
        <div className="flex justify-between"><h3 className="font-semibold">Podgląd e-recepty</h3><button type="button" onClick={onClose}><X size={16} /></button></div>
        <p className="text-sm text-slate-600">{header.form} · {header.kind}{header.cito ? " · CITO" : ""}{header.annual ? " · 365 dni" : ""}</p>
        {items.map((item) => (
          <div key={item.key} className="text-sm border rounded-lg p-2">
            <div className="font-medium">{item.drug?.name}</div>
            <div className="text-slate-600">{item.quantity} op. · {item.payment} · {item.dosage || `${item.frequency}× / ${item.durationDays} dni`}</div>
            {item.substanceWords && <div>Słownie: {item.substanceWords}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignModal({ count, onClose, onConfirm, onPreview, busy }) {
  const [fileName, setFileName] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const pin = digits.join("");

  const setDigit = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 3) document.getElementById(`rx-pin-${index + 1}`)?.focus();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0D5C46] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} /> Autoryzacja wysyłki do P1</div>
          <button type="button" onClick={onClose} disabled={busy}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-sm">
            <span>{count === 1 ? "1 e-recepta" : `${count} pozycji`}</span>
            <button type="button" onClick={onPreview} className="text-[#0D5C46] font-semibold text-xs inline-flex items-center gap-1"><Eye size={14} /> Podgląd</button>
          </div>
          <label className="border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold truncate">{fileName || "Wybierz certyfikat ZUS z komputera (.p12 / .pfx)"}</span>
            <span className="text-xs text-slate-500 shrink-0 ml-3">Zmień plik</span>
            <input type="file" accept=".p12,.pfx,.cer" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
          </label>
          <p className="text-xs text-slate-500">Plik zostaje na tym komputerze. Nie jest wysyłany do CM7MED ani do Medfile. PIN nie jest zapisywany.</p>
          <div className="text-center">
            <div className="text-sm text-slate-500 mb-3">Wprowadź 4-cyfrowy PIN certyfikatu</div>
            <div className="flex justify-center gap-3">
              {digits.map((digit, index) => (
                <input id={`rx-pin-${index}`} key={index} type="password" maxLength={1} value={digit} onChange={(e) => setDigit(index, e.target.value)} className="w-14 h-16 text-center text-2xl border border-slate-200 rounded-xl bg-slate-50" />
              ))}
            </div>
            {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!fileName) { setError("Wybierz plik certyfikatu ZUS z pendrive lub dysku."); return; }
              if (pin.length < 4) { setError("Kod PIN musi składać się z 4 cyfr."); return; }
              setError("");
              onConfirm();
            }}
            className="w-full py-3 rounded-xl bg-[#0D5C46] text-white font-semibold disabled:opacity-50"
          >
            {busy ? "Sprawdzam receptę…" : "Podpisz i wyślij"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IssuedPane({ result, code, items, patient, onPrint, onCancel, onAnother }) {
  const send = (channel) => {
    if (!code) {
      toast.error("Nie ma jeszcze kodu z P1. SMS i e-mail można wysłać dopiero po przyjęciu recepty.");
      return;
    }
    const text = `Kod e-recepty: ${code}`;
    if (channel === "sms" && patient?.phone) window.location.href = `sms:${patient.phone}?&body=${encodeURIComponent(text)}`;
    if (channel === "email" && patient?.email) window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent("Kod e-recepty")}&body=${encodeURIComponent(text)}`;
  };
  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-6 space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusClass(result.status)}`}>{STATUS_LABELS[result.status] || result.status}</span>
        {code ? (
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs text-slate-500">Kod dostępu</div>
              <div className="text-2xl font-mono font-bold">{code}</div>
            </div>
            <button type="button" onClick={() => { navigator.clipboard.writeText(code); toast.success("Skopiowano kod"); }} className="text-[#0D5C46]"><Copy size={16} /></button>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Kodu dostępu jeszcze nie ma. Pojawi się, gdy P1 przyjmie receptę. {result.error?.message || ""}</p>
        )}
        <ul className="text-sm text-slate-700">{items.map((item) => <li key={item.key}>{item.drug?.name} · {item.quantity} op. · {item.payment}</li>)}</ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onPrint} className="px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-1"><Printer size={14} /> Drukuj</button>
          <button type="button" onClick={() => send("sms")} className="px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-1"><Smartphone size={14} /> SMS</button>
          <button type="button" onClick={() => send("email")} className="px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-1"><Mail size={14} /> E-mail</button>
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 text-sm">Anuluj</button>
          <button type="button" onClick={onAnother} className="px-3 py-2 rounded-lg bg-[#0D5C46] text-white text-sm inline-flex items-center gap-1"><Plus size={14} /> Nowa</button>
        </div>
      </div>
    </div>
  );
}
