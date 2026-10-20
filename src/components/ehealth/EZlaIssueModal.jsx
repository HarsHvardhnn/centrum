import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Building2, CheckCircle2, History, Loader2, Plus, Printer, ShieldCheck, X } from "lucide-react";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import P1SignDialog from "./P1SignDialog";
import { patientForDocument } from "./IssuePatientCard";
import { STATUS_LABELS, accessCodeOf } from "./ehealthStatus";
import IcdField from "./IcdField";
import { icdRoot, visitDiagnosisRows } from "./visitIcd";

const INSTITUTIONS = [
  { id: "ZUS", label: "ZUS", hint: "Ubezpieczenie chorobowe", code: "1" },
  { id: "KRUS", label: "KRUS", hint: "Rolnicy", code: "2" },
  { id: "INNE_W_POLSCE", label: "Inne w Polsce", hint: "Inny tytuł w Polsce", code: "3" },
  { id: "W_INNYM_PANSTWIE", label: "Poza Polską", hint: "Inne państwo", code: "4" },
];

const COUNTRIES = ["Niemcy", "Czechy", "Słowacja", "Wielka Brytania", "Holandia", "Norwegia", "Francja", "Irlandia", "Szwecja", "Inny kraj UE/EFTA", "Inny kraj poza UE"];

const RELATIONSHIPS = [
  { label: "Dziecko do lat 14", code: "1" },
  { label: "Dziecko powyżej 14 lat", code: "1" },
  { label: "Dziecko niepełnosprawne do 18 lat", code: "1" },
  { label: "Małżonek", code: "2" },
  { label: "Rodzic (ojciec/matka)", code: "2" },
  { label: "Inny chory członek rodziny", code: "3" },
];

const LETTERS = [
  { id: "A", label: "A — niezdolność po przerwie krótszej niż 60 dni" },
  { id: "B", label: "B — niezdolność w okresie ciąży" },
  { id: "C", label: "C — niezdolność spowodowana nadużyciem alkoholu" },
  { id: "D", label: "D — gruźlica" },
  { id: "E", label: "E — choroba zakaźna (okres wylęgania)" },
];

const emptyForm = {
  institution: "ZUS",
  foreignCountry: "",
  postalCode: "",
  city: "",
  street: "",
  houseNumber: "",
  apartment: "",
  stayAbroad: false,
  stayCountry: "",
  isCare: false,
  relationship: "",
  familyName: "",
  familyBirth: "",
  payers: [],
  selectedPayerId: "",
  doNotSend: false,
  startDate: "",
  endDate: "",
  hospitalStart: "",
  hospitalEnd: "",
  isHospital: false,
  zoz: false,
  suggestion: "2",
  icd10: "",
  icdName: "",
  letters: [],
  reasonInPast: "",
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayCount(from, to) {
  if (!from || !to) return 0;
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

function daysBeforeToday(date) {
  if (!date) return 0;
  const a = new Date(`${date}T12:00:00`);
  const b = new Date(`${todayIso()}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

function malePatient(patient) {
  const gender = String(patient?.gender || patient?.sex || "").toUpperCase();
  if (gender.startsWith("M")) return true;
  if (gender.startsWith("K") || gender.startsWith("F")) return false;
  const pesel = String(patient?.pesel || "").replace(/\D/g, "");
  if (pesel.length !== 11) return false;
  return Number(pesel[9]) % 2 === 1;
}

function parseAddress(patient) {
  const raw = String(patient?.address || patient?.street || "").trim();
  const postal = String(patient?.postalCode || "").match(/\d{2}-\d{3}/)?.[0] || raw.match(/\d{2}-\d{3}/)?.[0] || "";
  const city = String(patient?.city || "").trim() || raw.split(",").map((p) => p.trim()).find((p) => p && !/\d/.test(p) && !/^ul/i.test(p)) || "";
  const streetPart = raw.split(",")[0].replace(/\d{2}-\d{3}/, "").trim();
  const house = streetPart.match(/(\d+[A-Za-z]?)(?:\s*\/\s*(\d+[A-Za-z]?))?$/) || [];
  const street = streetPart.replace(/(\d+[A-Za-z]?)(?:\s*\/\s*(\d+[A-Za-z]?))?$/, "").replace(/^ul\.?\s*/i, "").trim();
  return { postalCode: postal, city, street, houseNumber: house[1] || "", apartment: house[2] || "" };
}

function isCm7Facility(name) {
  const text = String(name || "").toLowerCase();
  return text.includes("centrum medyczne 7") || /\bcm7\b/.test(text);
}

function leaveOrigin(card) {
  return card?.origin === "cm7" ? "cm7" : "other";
}

function buildLeaveCards(clinic, zus) {
  const cards = [];
  const bySeries = new Map();

  for (const row of clinic || []) {
    const payload = row.payload || {};
    const refs = payload.refs || {};
    const series = refs.ezlaSeries || "";
    const number = refs.ezlaNumber || "";
    const key = series && number ? `${series}|${number}` : "";
    const card = {
      origin: "cm7",
      document: row,
      series,
      number: number || row.externalId || "",
      from: String(payload.from || "").slice(0, 10),
      to: String(payload.to || "").slice(0, 10),
      issuedAt: String(row.createdAt || "").slice(0, 10),
      status: STATUS_LABELS[row.status] || row.status || "",
      icd: icdRoot(payload.icd10 || payload.diseaseStatisticalNumber || ""),
      doctorName: payload.doctorName || "",
      pwz: payload.pwz || "",
      facility: "Centrum Medyczne 7",
      place: [payload.city, payload.postalCode].filter(Boolean).join(", "),
      payerId: "",
      hospitalDays: "",
    };
    cards.push(card);
    if (key) bySeries.set(key, card);
  }

  for (const row of zus || []) {
    const key = row.series && row.number ? `${row.series}|${row.number}` : "";
    const existing = key ? bySeries.get(key) : null;
    if (existing) {
      existing.from = existing.from || row.from;
      existing.to = existing.to || row.to;
      existing.issuedAt = existing.issuedAt || row.issuedAt;
      existing.status = existing.status || row.status;
      existing.icd = existing.icd || icdRoot(row.icd);
      existing.doctorName = existing.doctorName || row.doctorName;
      existing.pwz = existing.pwz || row.pwz;
      existing.place = existing.place || row.place;
      existing.payerId = existing.payerId || row.payerId;
      existing.hospitalDays = existing.hospitalDays || row.hospitalDays;
      continue;
    }
    cards.push({
      origin: isCm7Facility(row.facility) ? "cm7" : "other",
      document: null,
      series: row.series || "",
      number: row.number || "",
      from: row.from || "",
      to: row.to || "",
      issuedAt: row.issuedAt || "",
      status: row.status || "",
      icd: icdRoot(row.icd),
      doctorName: row.doctorName || "",
      pwz: row.pwz || "",
      facility: row.facility || (isCm7Facility(row.facility) ? "Centrum Medyczne 7" : ""),
      place: row.place || "",
      payerId: row.payerId || "",
      hospitalDays: row.hospitalDays || "",
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  return cards
    .map((card, index) => {
      const cancelled = /anul|uniewa|cancel/i.test(String(card.status || ""));
      const active = !cancelled && Boolean(card.from) && Boolean(card.to) && card.from <= today && today <= card.to;
      return { ...card, active, key: `${card.origin}|${card.series}|${card.number}|${card.from}|${index}` };
    })
    .sort((a, b) => String(b.from || b.issuedAt).localeCompare(String(a.from || a.issuedAt)));
}

function validate(form, patient) {
  const errors = [];
  if (form.stayAbroad) {
    if (!form.stayCountry.trim()) errors.push("Podaj państwo pobytu w czasie niezdolności.");
    if (!form.postalCode.trim() || form.postalCode.trim().length > 9) errors.push("Podaj zagraniczny kod pocztowy (do 9 znaków).");
  } else if (!/^\d{2}-\d{3}$/.test(form.postalCode)) {
    errors.push("Kod pocztowy pobytu musi mieć postać 00-000.");
  }
  if (!form.city.trim() || !form.street.trim() || !form.houseNumber.trim()) {
    errors.push("Adres pobytu: miejscowość, ulica i numer domu są wymagane.");
  }
  if (!form.startDate || !form.endDate || form.endDate < form.startDate) errors.push("Podaj prawidłowy okres niezdolności.");
  if (form.institution === "ZUS" || form.institution === "INNE_W_POLSCE") {
    if (!form.payers.length || !form.selectedPayerId) errors.push("Wybierz płatnika składek.");
  }
  if (form.institution === "W_INNYM_PANSTWIE" && !form.foreignCountry) errors.push("Wybierz państwo ubezpieczenia.");
  const root = icdRoot(form.icd10);
  if (!/^[A-Z][0-9]{2}$/.test(root)) errors.push("Wybierz kod ICD-10. Do ZUS trafia człon główny, bez części po kropce.");
  if (form.isCare) {
    if (!form.relationship || !form.familyBirth) {
      errors.push("Opieka: podaj pokrewieństwo i datę urodzenia członka rodziny.");
    }
  }
  if (form.isHospital && (!form.hospitalStart || !form.hospitalEnd)) {
    errors.push("Pobyt w szpitalu: podaj obie daty albo odznacz pobyt.");
  }
  if (form.isHospital && form.hospitalStart && form.hospitalEnd) {
    if (form.hospitalEnd < form.hospitalStart || form.hospitalStart < form.startDate || form.hospitalEnd > form.endDate) {
      errors.push("Pobyt w szpitalu musi mieścić się w okresie zwolnienia.");
    }
  }
  const back = form.startDate && form.startDate < todayIso();
  const psychiatry = root.startsWith("F");
  if (back && !psychiatry && form.reasonInPast.trim().length < 3) {
    errors.push("Zwolnienie wstecz wymaga uzasadnienia (poza kodami F).");
  }
  if (form.letters.includes("B") && malePatient(patient)) errors.push("Kod B dotyczy ciąży i nie może być zaznaczony u mężczyzny.");
  if (form.letters.length > 4) errors.push("Można podać najwyżej cztery kody literowe.");
  return errors;
}

const EZlaIssueModal = ({ open, onClose, visitId, patientId, patient, diagnoses, initialPayload, onDocumentsChanged }) => {
  const [form, setForm] = useState(emptyForm);
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [zusRows, setZusRows] = useState([]);
  const [zusError, setZusError] = useState("");
  const [historyBusy, setHistoryBusy] = useState(false);
  const [historyOrigin, setHistoryOrigin] = useState("all");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newPayer, setNewPayer] = useState({ name: "", nip: "", type: "1", hasPue: true });
  const [contextNote, setContextNote] = useState("");

  const pesel = String(patient?.pesel || "").replace(/\D/g, "");
  const male = malePatient(patient);
  const payersForbidden = form.institution === "KRUS" || form.institution === "W_INNYM_PANSTWIE";
  const selectedPayer = form.payers.find((p) => p.id === form.selectedPayerId);
  const days = dayCount(form.startDate, form.endDate);
  const lateDays = daysBeforeToday(form.startDate);
  const errorsByKey = useMemo(() => errors, [errors]);

  const patch = (partial) => {
    setChecked(false);
    setForm((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    if (!open) return;
    const address = parseAddress(patient);
    const seed = initialPayload || {};
    const next = {
      ...emptyForm,
      ...address,
      institution: seed.institution || "ZUS",
      foreignCountry: seed.foreignCountry || "",
      postalCode: seed.postalCode || address.postalCode,
      city: seed.city || address.city,
      street: seed.street || address.street,
      houseNumber: seed.houseNumber || address.houseNumber,
      apartment: seed.apartment || address.apartment,
      isCare: Boolean(seed.familyMemberCode),
      relationship: seed.relationship || RELATIONSHIPS.find((r) => r.code === String(seed.familyMemberCode || ""))?.label || "",
      familyName: seed.familyName || "",
      familyBirth: String(seed.familyMemberDate || "").slice(0, 10),
      startDate: String(seed.from || "").slice(0, 10),
      endDate: String(seed.to || "").slice(0, 10),
      stayAbroad: Boolean(seed.stayAbroad),
      stayCountry: seed.stayCountry || "",
      hospitalStart: String(seed.hospitalFrom || "").slice(0, 10),
      hospitalEnd: String(seed.hospitalTo || "").slice(0, 10),
      isHospital: Boolean(seed.hospitalFrom && seed.hospitalTo),
      zoz: Boolean(seed.zoz),
      suggestion: seed.suggestion === "1" ? "1" : "2",
      icd10: icdRoot(seed.icd10 || seed.diseaseStatisticalNumber || ""),
      icdName: seed.icdName || "",
      letters: [seed.disease1, seed.disease2, seed.disease3, seed.disease4].filter(Boolean),
      reasonInPast: seed.reasonInPast || "",
      doNotSend: Boolean(seed.doNotSend),
      payers: Array.isArray(seed.payers) ? seed.payers.map((p, i) => ({
        id: `p-${p.type || "1"}-${p.identifier || p.id || i}`,
        name: p.name || p.label || p.id,
        nip: String(p.type || "1") === "1" ? (p.nip || p.id) : "",
        identifier: p.identifier || p.id,
        type: String(p.type || "1"),
        hasPue: p.hasPue !== false,
      })) : [],
    };
    next.selectedPayerId = next.payers.find((p) => p.id === seed.selectedPayerId)?.id || next.payers[0]?.id || "";
    setForm(next);
    setChecked(false);
    setErrors([]);
    setResult(null);
  }, [open]);

  useEffect(() => {
    if (!open || !patientId) return;
    let cancelled = false;
    ehealthHelper.ezlaContext(patientId, form.institution).then((res) => {
      if (cancelled) return;
      const data = res?.data || {};
      setContextNote(data.canIssue === false ? (data.message || "Lekarz nie ma uprawnienia do wystawienia zwolnienia na ten dzień.") : "");
      const remote = Array.isArray(data.payers) ? data.payers : [];
      if (remote.length) {
        setForm((prev) => {
          if (prev.payers.length) return prev;
          const payers = remote.map((p, i) => ({
            id: `${p.type || "1"}-${p.id || i}`,
            name: p.label || p.name || `Płatnik ${p.id || i + 1}`,
            nip: String(p.type || "1") === "1" ? p.id : "",
            type: String(p.type || "1"),
            identifier: p.id,
            hasPue: true,
          }));
          return { ...prev, payers, selectedPayerId: payers[0]?.id || "" };
        });
      }
      const family = Array.isArray(data.family) ? data.family : [];
      if (family[0]) {
        setForm((prev) => prev.familyBirth ? prev : ({
          ...prev,
          familyName: family[0].name || prev.familyName,
          familyBirth: String(family[0].date || family[0].birthDate || "").slice(0, 10) || prev.familyBirth,
        }));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [open, patientId, form.institution]);

  const leaveCards = useMemo(() => buildLeaveCards(historyRows, zusRows), [historyRows, zusRows]);
  const visibleLeaveCards = useMemo(
    () => (historyOrigin === "all" ? leaveCards : leaveCards.filter((card) => leaveOrigin(card) === historyOrigin)),
    [leaveCards, historyOrigin],
  );
  const cm7LeaveCards = visibleLeaveCards.filter((card) => leaveOrigin(card) === "cm7");
  const otherLeaveCards = visibleLeaveCards.filter((card) => leaveOrigin(card) === "other");

  if (!open) return null;

  const loadHistory = async () => {
    setHistoryOpen(true);
    setHistoryOrigin("all");
    setHistoryBusy(true);
    try {
      const res = await ehealthHelper.ezlaHistory({ patientId });
      const data = res?.data || {};
      setHistoryRows(Array.isArray(data.clinic) ? data.clinic : []);
      setZusRows(Array.isArray(data.zus) ? data.zus : []);
      setZusError(data.zusError || "");
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
      setHistoryRows([]);
      setZusRows([]);
      setZusError("");
    } finally {
      setHistoryBusy(false);
    }
  };

  const applyHistory = (row) => {
    const p = row?.payload || {};
    patch({
      institution: p.institution || "ZUS",
      foreignCountry: p.foreignCountry || "",
      startDate: String(p.from || "").slice(0, 10),
      endDate: String(p.to || "").slice(0, 10),
      hospitalStart: String(p.hospitalFrom || "").slice(0, 10),
      hospitalEnd: String(p.hospitalTo || "").slice(0, 10),
      isHospital: Boolean(p.hospitalFrom && p.hospitalTo),
      zoz: Boolean(p.zoz),
      stayAbroad: Boolean(p.stayAbroad),
      stayCountry: p.stayCountry || "",
      postalCode: p.postalCode || form.postalCode,
      city: p.city || form.city,
      street: p.street || form.street,
      houseNumber: p.houseNumber || form.houseNumber,
      apartment: p.apartment || form.apartment,
      suggestion: p.suggestion === "1" ? "1" : "2",
      icd10: icdRoot(p.icd10 || p.diseaseStatisticalNumber || ""),
      icdName: p.icdName || "",
      letters: [p.disease1, p.disease2, p.disease3, p.disease4].filter(Boolean),
      isCare: Boolean(p.familyMemberCode),
      relationship: p.relationship || "",
      familyName: p.familyName || "",
      familyBirth: String(p.familyMemberDate || "").slice(0, 10),
      reasonInPast: "",
      doNotSend: Boolean(p.doNotSend),
    });
    setHistoryOpen(false);
    toast.success("Dane zwolnienia wstawiono do formularza. Sprawdź daty przed podpisem.");
  };

  const runCheck = () => {
    const next = validate(form, patient);
    if (contextNote) next.unshift(contextNote);
    setErrors(next);
    setChecked(next.length === 0);
    if (next.length) toast.error(next[0]);
    else toast.success("Dokument sprawdzony. Można podpisać i wysłać do ZUS.");
  };

  const submit = async ({ certFileName }) => {
    const next = validate(form, patient);
    if (contextNote) next.unshift(contextNote);
    if (next.length) {
      setErrors(next);
      setChecked(false);
      throw new Error(next[0]);
    }
    const relation = RELATIONSHIPS.find((r) => r.label === form.relationship);
    const payer = selectedPayer;
    const basePatient = patientForDocument(patient);
    const payload = {
      visitId: visitId || undefined,
      patientId,
      doctorName: patient?.doctorName || "",
      patientForDocument: {
        ...basePatient,
        street: form.street.trim(),
        houseNumber: form.houseNumber.trim(),
        unitId: form.apartment.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        country: form.stayAbroad ? form.stayCountry.trim() : "Polska",
      },
      institution: form.institution,
      foreignCountry: form.foreignCountry,
      from: form.startDate,
      to: form.endDate,
      suggestion: form.suggestion,
      icd10: icdRoot(form.icd10),
      icdName: form.icdName,
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      street: form.street.trim(),
      houseNumber: form.houseNumber.trim(),
      apartment: form.apartment.trim(),
      stayAbroad: form.stayAbroad,
      stayCountry: form.stayAbroad ? form.stayCountry.trim() : "",
      addressOfStay: [form.street, form.houseNumber, form.apartment && `m. ${form.apartment}`, form.postalCode, form.city, form.stayAbroad ? form.stayCountry : ""].filter(Boolean).join(", "),
      hospitalFrom: form.isHospital ? form.hospitalStart : undefined,
      hospitalTo: form.isHospital ? form.hospitalEnd : undefined,
      familyMemberCode: form.isCare ? relation?.code : undefined,
      familyMemberDate: form.isCare ? form.familyBirth : undefined,
      relationship: form.isCare ? form.relationship : "",
      familyName: form.isCare ? form.familyName.trim() : "",
      disease1: form.letters[0] || "",
      disease2: form.letters[1] || "",
      disease3: form.letters[2] || "",
      disease4: form.letters[3] || "",
      reasonInPast: form.reasonInPast.trim(),
      doNotSend: Boolean(form.doNotSend || (payer && payer.hasPue === false)),
      zoz: Boolean(form.zoz),
      payers: payer ? [{ type: payer.type || "1", id: payer.identifier || payer.nip, name: payer.name, hasPue: payer.hasPue !== false }] : [],
      selectedPayerId: form.selectedPayerId,
      clientCertFileName: certFileName || "",
    };
    setBusy(true);
    try {
      const res = await ehealthHelper.submitEzla({ visitId, patientId, payload });
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      const doc = res?.data;
      if (doc?.status === "failed") throw new Error(doc.error?.message || "ZUS odrzucił e-ZLA");
      setResult(doc);
      onDocumentsChanged?.(doc);
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      toast.success("e-ZLA zapisane. Numer i UPO pojawią się po przyjęciu przez ZUS.");
    } catch (err) {
      throw new Error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const cancelIssued = async () => {
    if (cancelReason.trim().length < 3 || !result?.id) return;
    setBusy(true);
    try {
      const res = await ehealthHelper.cancelDocument("ezla", result.id, cancelReason.trim());
      const doc = res?.data || { ...result, status: "cancelled" };
      setResult(doc);
      setCancelOpen(false);
      setCancelReason("");
      onDocumentsChanged?.(doc);
      toast.success("Wysłano anulowanie e-ZLA");
    } catch (err) {
      throw new Error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleLetter = (code) => {
    if (code === "B" && male) return;
    const has = form.letters.includes(code);
    const letters = has ? form.letters.filter((c) => c !== code) : [...form.letters, code].slice(0, 4);
    patch({ letters });
  };

  const addPayer = () => {
    const raw = newPayer.nip.replace(/\s/g, "");
    const type = newPayer.type || "1";
    const identifier = type === "3" ? raw : raw.replace(/\D/g, "");
    if (!newPayer.name.trim()) {
      toast.error("Podaj nazwę płatnika.");
      return;
    }
    if (type === "1" && identifier.length !== 10) {
      toast.error("NIP musi mieć 10 cyfr.");
      return;
    }
    if (type === "2" && identifier.length !== 11) {
      toast.error("PESEL płatnika musi mieć 11 cyfr.");
      return;
    }
    if (type === "3" && !identifier) {
      toast.error("Podaj serię i numer paszportu płatnika.");
      return;
    }
    const row = { id: `${type}-${identifier}`, name: newPayer.name.trim(), nip: type === "1" ? identifier : "", identifier, type, hasPue: newPayer.hasPue };
    patch({ payers: [...form.payers, row], selectedPayerId: row.id, doNotSend: newPayer.hasPue ? form.doNotSend : true });
    setAddOpen(false);
    setNewPayer({ name: "", nip: "", type: "1", hasPue: true });
  };

  const visitIcd = visitDiagnosisRows(diagnoses);

  const series = result?.payload?.refs?.ezlaSeries && result?.payload?.refs?.ezlaNumber
    ? `${result.payload.refs.ezlaSeries} ${result.payload.refs.ezlaNumber}`
    : accessCodeOf(result) || result?.externalId || "";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-[1360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-indigo-800 px-5 py-4 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Centrum Medyczne 7 • Zakład Ubezpieczeń Społecznych</p>
            <h3 className="text-lg font-bold">Moduł wystawiania e-ZLA</h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={loadHistory} className="inline-flex items-center gap-1 rounded-lg border border-indigo-400 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700">
              <History size={14} /> Pobierz historię e-ZLA z ZUS
            </button>
            <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-indigo-700"><X size={18} /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3 text-sm">
          <div>
            <p className="font-bold text-slate-900">{patient?.name || "Pacjent"}</p>
            <p className="text-xs text-slate-500">{pesel.length === 11 ? `PESEL ${pesel}` : "Brak PESEL — e-ZLA wymaga numeru PESEL"}</p>
          </div>
          <p className="text-xs text-slate-600">{patient?.doctorName || "Lekarz wystawiający"}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            <ShieldCheck size={12} /> eWUŚ jest na karcie wizyty
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {result ? (
            <IssuedView
              result={result}
              form={form}
              series={series}
              days={days}
              busy={busy}
              onPrint={() => ehealthHelper.printDocument("ezla", result.id).catch((err) => toast.error(unwrapEhealthError(err).message))}
              onCancel={() => setCancelOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Miejsce ubezpieczenia</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {INSTITUTIONS.map((item) => (
                      <button key={item.id} type="button" onClick={() => patch({ institution: item.id, foreignCountry: item.id === "W_INNYM_PANSTWIE" ? form.foreignCountry : "", payers: item.id === "KRUS" || item.id === "W_INNYM_PANSTWIE" ? [] : form.payers, selectedPayerId: item.id === "KRUS" || item.id === "W_INNYM_PANSTWIE" ? "" : form.selectedPayerId })} className={`rounded-lg border px-3 py-2 text-left ${form.institution === item.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>
                        <span className="block text-sm font-bold">{item.label} <span className="text-[10px] text-slate-400">({item.code})</span></span>
                        <span className="text-[11px] text-slate-500">{item.hint}</span>
                      </button>
                    ))}
                  </div>
                  {form.institution === "W_INNYM_PANSTWIE" && (
                    <label className="mt-3 block text-xs font-semibold text-slate-600">
                      Państwo
                      <select value={form.foreignCountry} onChange={(e) => patch({ foreignCountry: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
                        <option value="">Wybierz państwo</option>
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  )}
                  {form.institution === "W_INNYM_PANSTWIE" && pesel.length === 11 && (
                    <p className="mt-2 text-xs text-amber-800">Pacjent ma polski PESEL. Upewnij się, że tytuł ubezpieczenia jest za granicą.</p>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Adres pobytu w czasie niezdolności</h4>
                    <button type="button" onClick={() => patch(parseAddress(patient))} className="text-xs font-semibold text-indigo-700">Zaczytaj z kartoteki</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label={form.stayAbroad ? "Kod pocztowy zagraniczny" : "Kod pocztowy"} value={form.postalCode} onChange={(v) => patch({ postalCode: v })} placeholder={form.stayAbroad ? "do 9 znaków" : "00-000"} />
                    <Field label="Miejscowość" value={form.city} onChange={(v) => patch({ city: v })} />
                    <Field label="Ulica" value={form.street} onChange={(v) => patch({ street: v })} className="col-span-2" />
                    <Field label="Nr domu" value={form.houseNumber} onChange={(v) => patch({ houseNumber: v })} />
                    <Field label="Nr lokalu" value={form.apartment} onChange={(v) => patch({ apartment: v })} />
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={form.stayAbroad} onChange={(e) => patch({ stayAbroad: e.target.checked, postalCode: "" })} />
                    Pobyt poza Polską (kod pocztowy i państwo z formularza ZUS)
                  </label>
                  {form.stayAbroad && (
                    <label className="mt-2 block text-xs font-semibold text-slate-600">Państwo pobytu
                      <select value={form.stayCountry} onChange={(e) => patch({ stayCountry: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm font-normal">
                        <option value="">Wybierz państwo</option>
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cel zwolnienia</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => patch({ isCare: false })} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${!form.isCare ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>Własna choroba</button>
                    <button type="button" onClick={() => patch({ isCare: true })} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${form.isCare ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>Opieka (Z-15)</button>
                  </div>
                  {form.isCare && (
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-semibold text-slate-600">Pokrewieństwo
                        <select value={form.relationship} onChange={(e) => patch({ relationship: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
                          <option value="">Wybierz</option>
                          {RELATIONSHIPS.map((r) => <option key={r.label}>{r.label}</option>)}
                        </select>
                      </label>
                      <Field label="Imię i nazwisko członka rodziny" value={form.familyName} onChange={(v) => patch({ familyName: v })} />
                      <Field label="Data urodzenia" type="date" value={form.familyBirth} onChange={(v) => patch({ familyBirth: v })} />
                    </div>
                  )}
                </section>

                {!payersForbidden && (
                  <section className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Płatnicy składek</h4>
                      <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700"><Plus size={12} /> Dodaj</button>
                    </div>
                    <div className="space-y-2">
                      {form.payers.map((payer) => (
                        <button key={payer.id} type="button" onClick={() => patch({ selectedPayerId: payer.id, doNotSend: payer.hasPue === false ? true : form.doNotSend })} className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left ${form.selectedPayerId === payer.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200"}`}>
                          <Building2 size={16} className="mt-0.5 text-slate-500" />
                          <span>
                            <span className="block text-sm font-semibold">{payer.name}</span>
                            <span className="text-[11px] text-slate-500">{payer.type === "2" ? "PESEL" : payer.type === "3" ? "Paszport" : "NIP"} {payer.nip || payer.identifier || "—"} · {payer.hasPue === false ? "bez profilu PUE" : "profil PUE"}</span>
                          </span>
                        </button>
                      ))}
                      {!form.payers.length && <p className="text-xs text-slate-500">Brak płatnika z ZUS. Dodaj płatnika z NIP.</p>}
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                      <input type="checkbox" checked={form.doNotSend || selectedPayer?.hasPue === false} disabled={selectedPayer?.hasPue === false} onChange={(e) => patch({ doNotSend: e.target.checked })} />
                      Nie przesyłaj informacji płatnikowi
                    </label>
                    {selectedPayer?.hasPue === false && <p className="mt-2 text-xs text-amber-800">Płatnik nie ma profilu PUE. Po wystawieniu potrzebny jest wydruk papierowy.</p>}
                  </section>
                )}
              </div>

              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Okres niezdolności {days > 0 ? `· ${days} dni` : ""}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Od" type="date" value={form.startDate} onChange={(v) => patch({ startDate: v })} />
                    <Field label="Do" type="date" value={form.endDate} onChange={(v) => patch({ endDate: v })} />
                  </div>
                  {lateDays > 3 && <p className="mt-2 flex items-start gap-1 text-xs text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> Początek jest wcześniejszy niż 3 dni. Dla kodów innych niż F podaj uzasadnienie.</p>}
                  {form.startDate && form.startDate < todayIso() && !icdRoot(form.icd10).startsWith("F") && (
                    <label className="mt-2 block text-xs font-semibold text-slate-600">Uzasadnienie wstecz
                      <textarea value={form.reasonInPast} onChange={(e) => patch({ reasonInPast: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm font-normal" />
                    </label>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Wskazanie lekarskie</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => patch({ suggestion: "1" })} className={`rounded-lg border px-3 py-2 text-sm ${form.suggestion === "1" ? "border-indigo-600 bg-indigo-50 font-semibold" : "border-slate-200"}`}>1 — chory powinien leżeć</button>
                    <button type="button" onClick={() => patch({ suggestion: "2" })} className={`rounded-lg border px-3 py-2 text-sm ${form.suggestion === "2" ? "border-indigo-600 bg-indigo-50 font-semibold" : "border-slate-200"}`}>2 — chory może chodzić</button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-xs text-slate-800">
                    <input type="checkbox" checked={form.isHospital} onChange={(e) => patch({ isHospital: e.target.checked, hospitalStart: e.target.checked ? form.hospitalStart : "", hospitalEnd: e.target.checked ? form.hospitalEnd : "" })} />
                    Pobyt w szpitalu (placówka stacjonarna)
                  </label>
                  {form.isHospital && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Field label="Hospitalizacja od" type="date" value={form.hospitalStart} onChange={(v) => patch({ hospitalStart: v })} />
                      <Field label="Hospitalizacja do" type="date" value={form.hospitalEnd} onChange={(v) => patch({ hospitalEnd: v })} />
                    </div>
                  )}
                  <label className="mt-3 flex items-center gap-2 text-xs text-slate-800">
                    <input type="checkbox" checked={form.zoz} onChange={(e) => patch({ zoz: e.target.checked })} />
                    Pacjent zostaje w ośrodku (ZOZ)
                  </label>
                </section>

                <section className="rounded-xl border border-slate-200 p-4">
                  <IcdField
                    label="Rozpoznanie ICD-10"
                    hint={`Do ZUS idzie kod główny ${form.icd10 || "—"}. Numer statystyczny nie jest pokazywany pracodawcy.`}
                    code={form.icd10}
                    name={form.icdName}
                    diagnoses={visitIcd}
                    importLabel="Pobierz z wizyty"
                    onPick={(item) => patch({ icd10: icdRoot(item.code) || "", icdName: item.name || "" })}
                  />
                  <div className="mt-3 space-y-1">
                    {LETTERS.map((item) => (
                      <label key={item.id} className={`flex items-center gap-2 text-xs ${item.id === "B" && male ? "text-slate-400" : "text-slate-700"}`}>
                        <input type="checkbox" checked={form.letters.includes(item.id)} disabled={item.id === "B" && male} onChange={() => toggleLetter(item.id)} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {!result && errorsByKey.length > 0 && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {errorsByKey.map((err) => <p key={err}>{err}</p>)}
            </div>
          )}
          {!result && checked && <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} /> Dokument sprawdzony — gotowy do podpisu</p>}
        </div>

        <div className="flex items-center justify-between border-t px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">{result ? "Zamknij" : "Anuluj i wróć"}</button>
          {!result && (
            <div className="flex gap-2">
              <button type="button" onClick={runCheck} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Sprawdź dokument</button>
              <button type="button" disabled={!checked || busy} onClick={() => setSignOpen(true)} className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Podpisz i wyślij do ZUS</button>
            </div>
          )}
        </div>
      </div>

      <P1SignDialog
        open={signOpen}
        title="Autoryzacja wystawienia e-ZLA"
        actionText="Podpisz i wyślij do ZUS"
        doctorLine={[patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ")}
        onClose={() => !busy && setSignOpen(false)}
        onConfirm={() => submit({}).then(() => setSignOpen(false))}
      />

      {historyOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h4 className="font-bold">Historia zwolnień e-ZLA</h4>
                <p className="text-xs text-slate-500">{patient?.name} · PESEL {pesel || "—"} · osobno CM7 i inne placówki</p>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)}><X size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1.5 border-b bg-slate-50 px-4 py-2">
              {[
                ["all", `Wszystkie (${leaveCards.length})`],
                ["cm7", `Wystawione w CM7 (${leaveCards.filter((card) => leaveOrigin(card) === "cm7").length})`],
                ["other", `Inne placówki (${leaveCards.filter((card) => leaveOrigin(card) === "other").length})`],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHistoryOrigin(value)}
                  className={`rounded-lg border px-3 py-1 text-xs font-semibold ${historyOrigin === value ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {historyBusy && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={14} className="animate-spin" /> Pobieranie z CM7 i z ZUS…</p>}
              {zusError && <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{zusError}</p>}
              {!historyBusy && visibleLeaveCards.length === 0 && <p className="text-sm text-slate-500">Brak zwolnień w wybranej kategorii.</p>}
              {historyOrigin === "all" && cm7LeaveCards.length > 0 && (
                <LeaveGroup title="Wystawione w CM7" cards={cm7LeaveCards} onDuplicate={applyHistory} />
              )}
              {historyOrigin === "all" && otherLeaveCards.length > 0 && (
                <LeaveGroup title="Wystawione w innych placówkach" cards={otherLeaveCards} onDuplicate={applyHistory} />
              )}
              {historyOrigin !== "all" && visibleLeaveCards.length > 0 && (
                <LeaveGroup
                  title={historyOrigin === "cm7" ? "Wystawione w CM7" : "Wystawione w innych placówkach"}
                  cards={visibleLeaveCards}
                  onDuplicate={applyHistory}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <h4 className="font-bold">Nowy płatnik</h4>
            <div className="mt-3 space-y-2">
              <Field label="Nazwa" value={newPayer.name} onChange={(v) => setNewPayer((p) => ({ ...p, name: v }))} />
              <label className="block text-xs font-semibold text-slate-600">Identyfikator
                <select value={newPayer.type} onChange={(e) => setNewPayer((p) => ({ ...p, type: e.target.value }))} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm font-normal">
                  <option value="1">NIP (10 cyfr)</option>
                  <option value="2">PESEL (11 cyfr)</option>
                  <option value="3">Paszport</option>
                </select>
              </label>
              <Field label={newPayer.type === "2" ? "PESEL" : newPayer.type === "3" ? "Paszport" : "NIP"} value={newPayer.nip} onChange={(v) => setNewPayer((p) => ({ ...p, nip: v }))} />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={newPayer.hasPue} onChange={(e) => setNewPayer((p) => ({ ...p, hasPue: e.target.checked }))} /> Płatnik ma profil PUE</label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setAddOpen(false)} className="rounded-lg px-3 py-2 text-sm">Anuluj</button>
              <button type="button" onClick={addPayer} className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white">Dodaj</button>
            </div>
          </div>
        </div>
      )}

      <P1SignDialog
        open={cancelOpen}
        isDestructive
        title="Autoryzacja anulowania e-ZLA w ZUS"
        actionText="Podpisz i anuluj w ZUS"
        doctorLine={[patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ")}
        onClose={() => setCancelOpen(false)}
        onConfirm={async () => {
          if (cancelReason.trim().length < 5) {
            throw new Error("Powód anulowania musi mieć co najmniej 5 znaków.");
          }
          await cancelIssued();
        }}
      >
        <div className="space-y-3.5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
            <strong className="font-bold text-amber-900 block mb-0.5">Uwaga: Ta operacja trwale wycofa dokument z systemu ZUS.</strong>
            Wymaga podania powodu oraz autoryzacji kodem PIN certyfikatu.
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Powód anulowania zaświadczenia lekarskiego *</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="np. Błąd w dacie początkowej, błędnie wskazany płatnik..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </P1SignDialog>
    </div>
  );
};

function LeaveGroup({ title, cards, onDuplicate }) {
  return (
    <section className="space-y-2">
      <h5 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</h5>
      {cards.map((card) => (
        <LeaveCard key={card.key} card={card} onDuplicate={onDuplicate} />
      ))}
    </section>
  );
}

function LeaveCard({ card, onDuplicate }) {
  const cm7 = leaveOrigin(card) === "cm7";
  return (
    <div className={`rounded-xl border p-3 ${card.active ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{card.from || "—"} — {card.to || "—"}{card.icd ? ` · ${card.icd}` : ""}</p>
          <p className="mt-1 text-xs text-slate-600">
            {[card.series, card.number].filter(Boolean).join(" ") || "bez serii i numeru"}
            {card.issuedAt ? ` · wystawione ${card.issuedAt}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {card.active && <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">Aktywne</span>}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cm7 ? "bg-slate-800 text-white" : "bg-sky-100 text-sky-800"}`}>
            {cm7 ? "CM7" : "Inna placówka"}
          </span>
          {card.status && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{card.status}</span>}
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-xs text-slate-700">
        <p>Wystawił: {card.doctorName || "—"}{card.pwz ? ` · PWZ ${card.pwz}` : ""}</p>
        <p>Miejsce: {[card.facility, card.place].filter(Boolean).join(" · ") || (cm7 ? "Centrum Medyczne 7" : "—")}</p>
        {card.payerId && <p>Płatnik: {card.payerId}</p>}
        {card.hospitalDays && card.hospitalDays !== "0" && <p>Pobyt w szpitalu: {card.hospitalDays} dni</p>}
      </div>
      {card.document && (
        <button type="button" onClick={() => onDuplicate(card.document)} className="mt-2 text-xs font-semibold text-indigo-700">
          Powiel
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className = "" }) {
  return (
    <label className={`block text-xs font-semibold text-slate-600 ${className}`}>
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm font-normal text-slate-900" />
    </label>
  );
}

function IssuedView({ result, form, series, days, busy, onPrint, onCancel }) {
  const cancelled = result.status === "cancelled";
  const paper = form.doNotSend || form.payers.find((p) => p.id === form.selectedPayerId)?.hasPue === false;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className={`rounded-xl border px-4 py-3 ${cancelled ? "border-rose-200 bg-rose-50" : paper ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
        <p className="font-bold">{cancelled ? "Zaświadczenie anulowane" : paper ? "Wymagany wydruk papierowy — płatnik bez PUE albo z wyłączonym przekazaniem" : "Przekazano elektronicznie na profil płatnika w PUE"}</p>
        <p className="mt-1 text-sm">{series ? `Numer / kod: ${series}` : "Numer ZUS pojawi się po przyjęciu dokumentu."} · {STATUS_LABELS[result.status] || result.status}</p>
        {(result.externalId || result.payload?.upo) && <p className="mt-1 text-xs">UPO: {result.payload?.upo || result.externalId}</p>}
      </div>
      <div className="rounded-xl border p-4 text-sm">
        <p>{form.startDate} — {form.endDate} · {days} dni</p>
        <p className="text-slate-600">{form.suggestion === "1" ? "Chory powinien leżeć" : "Chory może chodzić"} · ICD-10 {icdRoot(form.icd10)}{form.letters.length ? ` · kody ${form.letters.join(", ")}` : ""}</p>
        {form.isCare && <p className="text-slate-600">Opieka: {form.relationship}, {form.familyName}</p>}
      </div>
      {!cancelled && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onPrint} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold"><Printer size={14} /> Wydrukuj zaświadczenie</button>
          <button type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Anuluj zaświadczenie</button>
        </div>
      )}
    </div>
  );
}

export default EZlaIssueModal;
