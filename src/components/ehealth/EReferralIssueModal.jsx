import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { accessCodeOf, canCancel, canPrint } from "./ehealthStatus";
import P1SignDialog from "./P1SignDialog";
import IssueSummaryBar from "./IssueSummaryBar";
import { getIssueCellId } from "./issueCell";
import ReferralHistoryModal from "./ReferralHistoryModal";
import IssuePatientCard, { normalizePatient, patientForDocument } from "./IssuePatientCard";
import { ANATOMICAL_SITES, PURPOSE_HINTS, REFERRAL_TYPES, RESORT_HINTS } from "./eReferralCatalog";
import { useResortCodes } from "./resortCodes";
import IcdMulti, { uniqueExtra } from "./IcdMulti";
import { unusedVisitCodes } from "./IcdCombobox";
import { formatCoded, visitDiagnosisRows } from "./visitIcd";

const inputClass = "w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900";
const missingClass = "!border-rose-500 !bg-rose-50";

function parseCoded(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\S+)\s+[-—–]\s+(.+)$/i);
  if (match) return { code: match[1].trim(), name: match[2].trim() };
  if (/^[0-9A-Z][0-9A-Z.*]*$/i.test(text)) return { code: text, name: "" };
  return { code: "", name: "" };
}

/** Form values from a saved referral ("Powiel"). Never the code, number or NFZ data. */
function fromPayload(payload = {}) {
  const type = payload.type === "02.10REH" ? "rehabilitation" : payload.clientReferralType || "specialist_clinic";
  // Referrals saved before the two text fields were separated kept the descriptive diagnosis in previousTests.
  const separated = payload.clinicalNotes !== undefined;
  const procedures = (Array.isArray(payload.procedures) && payload.procedures.length ? payload.procedures : [payload])
    .filter((row) => row.icd9Code)
    .map((row) => formatCoded(row.icd9Code, row.icd9Display));
  return {
    referralType: type,
    priority: payload.cito || payload.priorityCode === "UR" ? "urgent" : "normal",
    target: payload.performerCode && payload.performer ? `${payload.performerCode} - ${payload.performer}` : "",
    primaryIcd10: payload.icd10Code ? formatCoded(payload.icd10Code, payload.icd10Display) : "",
    extraIcd10: Array.isArray(payload.icd10Extra) ? payload.icd10Extra.map((row) => ({ code: row.icd10Code, name: row.icd10Display })) : [],
    site: payload.anatomicalSite || (payload.bodySite === "L" ? "left" : payload.bodySite === "R" ? "right" : ""),
    procedures: procedures.length ? procedures : [""],
    clinicalNotes: (separated ? payload.clinicalNotes : payload.previousTests) || "",
    previousTests: separated ? payload.previousTests || "" : "",
    justification: payload.purpose || "",
  };
}

const newKey = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const EReferralIssueModal = ({
  open,
  onClose,
  visitId,
  patientId,
  patient,
  diagnoses = [],
  visitProcedures = [],
  initialPayload,
  onDocumentsChanged,
  onPatientSaved,
}) => {
  const [details, setDetails] = useState(() => normalizePatient(patient));
  const [form, setForm] = useState(() => fromPayload(initialPayload || {}));
  const { referralType, priority, target: targetSearch, primaryIcd10, extraIcd10, site, procedures, clinicalNotes, previousTests, justification } = form;
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const [hasNfz, setHasNfz] = useState(false);
  const [isNfzFunded, setIsNfzFunded] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [procHits, setProcHits] = useState([]);
  const [procIndex, setProcIndex] = useState(-1);
  const [procQuery, setProcQuery] = useState("");
  const [errors, setErrors] = useState([]);
  const [missing, setMissing] = useState({});
  const [checked, setChecked] = useState("");
  const [signOpen, setSignOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [historyVersion, setHistoryVersion] = useState(0);
  const { rows: resortRows, versionDate, error: resortError } = useResortCodes();
  const visitIcd = useMemo(() => visitDiagnosisRows(diagnoses), [diagnoses]);
  const visitIcd9 = useMemo(() => visitDiagnosisRows(visitProcedures), [visitProcedures]);

  // Every time the form is opened it starts empty (or from the referral being copied), never from the previous entry.
  useEffect(() => {
    if (!open) return;
    setForm(fromPayload(initialPayload || {}));
    setIsNfzFunded(false);
    setTargetOpen(false);
    setShowAll(false);
    setProcHits([]);
    setProcIndex(-1);
    setErrors([]);
    setMissing({});
    setChecked("");
    setSignOpen(false);
    setResult(null);
    setHistoryOpen(false);
    setCancelTarget(null);
    ehealthHelper.runtime().then((res) => setHasNfz(Boolean(res?.data?.hasNfz))).catch(() => setHasNfz(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Any change after a check makes it out of date, and starts a new send request.
  const snapshot = JSON.stringify([form, isNfzFunded, patientForDocument(details)]);
  const checkedOk = checked === snapshot;
  const changedSinceCheck = Boolean(checked) && !checkedOk;
  const sendKey = useRef({ snapshot: "", key: "" });
  const idempotencyKey = () => {
    if (sendKey.current.snapshot !== snapshot) sendKey.current = { snapshot, key: newKey() };
    return sendKey.current.key;
  };

  const target = parseCoded(targetSearch);
  const targetRow = resortRows.find((row) => row.code === target.code);
  const filteredResort = useMemo(() => {
    const fold = (text) => String(text || "").toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const q = fold(parseCoded(targetSearch).code && targetSearch.includes(" - ") ? "" : targetSearch.trim());
    const matches = (item) => !item.hidden && (!q || fold(item.full).includes(q) || item.code.includes(q));
    return {
      matched: resortRows.filter((item) => item.types.includes(referralType) && matches(item)),
      others: resortRows.filter((item) => !item.types.includes(referralType) && matches(item)),
    };
  }, [referralType, targetSearch, resortRows]);

  if (!open) return null;

  const typeLabel = REFERRAL_TYPES.find((row) => row.value === referralType)?.label || "Skierowanie";
  const code = accessCodeOf(result);
  const accepted = Boolean(code) && (result?.status === "submitted" || result?.status === "issued");
  const doctorLine = [patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ");
  const phone = details?.phone || patient?.phone;
  const email = details?.email || patient?.email;

  const changeType = (next) => {
    set({ referralType: next, target: "" });
    setShowAll(false);
    setTargetOpen(true);
  };

  const searchProcedure = async (index, value) => {
    const next = procedures.slice();
    next[index] = value;
    set({ procedures: next });
    if (value.trim().length < 2) {
      setProcHits([]);
      setProcIndex(-1);
      return;
    }
    setProcIndex(index);
    const rows = await appointmentHelper.searchIcd9(value.trim()).catch(() => []);
    setProcHits(Array.isArray(rows) ? rows.slice(0, 8) : []);
    setProcQuery(value.trim());
  };

  const validate = () => {
    const found = {
      target: !target.code || !target.name,
      icd: !parseCoded(primaryIcd10).code || !parseCoded(primaryIcd10).name,
      purpose: !justification.trim(),
      address: !details?.street || !details?.postalCode || !details?.city,
    };
    const next = [];
    if (found.target) next.push("Wybierz komórkę, do której kierujesz pacjenta.");
    if (found.icd) next.push("Wybierz rozpoznanie: kliknij „Pobierz z wizyty” albo wyszukaj kod ICD-10.");
    if (found.purpose) next.push("Wpisz cel skierowania.");
    if (found.address) next.push("Uzupełnij adres pacjenta – „Popraw dane”.");
    setMissing(found);
    setErrors(next);
    setChecked(next.length ? "" : snapshot);
    return next.length === 0;
  };

  const startSigning = () => {
    if (!validate()) return;
    if (targetRow && !targetRow.types.includes(referralType)
      && !window.confirm(`Ta komórka nie pasuje do typu „${typeLabel}”. Czy na pewno chcesz kierować tutaj?`)) return;
    setSignOpen(true);
  };

  const submit = async () => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    const icd = parseCoded(primaryIcd10);
    const parsedProcedures = procedures
      .map(parseCoded)
      .filter((row, i, all) => row.code && row.name && all.findIndex((other) => other.code === row.code) === i)
      .map((row) => ({ icd9Code: row.code, icd9Display: row.name }));
    const funded = hasNfz && isNfzFunded;
    const payload = {
      cellId: getIssueCellId() || undefined,
      type: referralType === "rehabilitation" ? "02.10REH" : "02.10",
      title: `${typeLabel}: ${target.name}`,
      purpose: justification.trim(),
      clinicalNotes: clinicalNotes.trim(),
      previousTests: previousTests.trim(),
      icd10Code: icd.code,
      icd10Display: icd.name,
      icd10Extra: uniqueExtra(icd.code, extraIcd10).map((row) => ({ icd10Code: row.code, icd10Display: row.name })),
      bodySite: site === "left" ? "L" : site === "right" ? "R" : "",
      anatomicalSite: site,
      procedures: parsedProcedures,
      icd9Code: parsedProcedures[0]?.icd9Code || "",
      icd9Display: parsedProcedures[0]?.icd9Display || "",
      performerCode: target.code,
      performer: target.name,
      reimbursed: funded ? "Y" : "N",
      cito: priority === "urgent",
      observation: referralType === "rehabilitation" ? justification.trim() : "",
      clientReferralType: referralType,
      doctorName: patient?.doctorName || "",
      patientForDocument: patientForDocument(details),
    };
    try {
      const res = await ehealthHelper.submitReferral({ visitId, patientId, payload, idempotencyKey: idempotencyKey() });
      if (!res?.success || !res.data) throw new Error(res?.error?.message || "Brak odpowiedzi o dokumencie.");
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      // The server answered: another attempt is a new request.
      sendKey.current = { snapshot: "", key: "" };
      setSignOpen(false);
      setResult(res.data);
      setHistoryVersion((v) => v + 1);
      onDocumentsChanged?.();
    } catch (err) {
      const info = unwrapEhealthError(err);
      // The signing window shows its own messages (wrong password); everything else goes to the red screen.
      if (/has[łl]o|PIN|certyfikat/i.test(info.message) && !info.offline) throw err;
      if (!info.offline) sendKey.current = { snapshot: "", key: "" };
      setSignOpen(false);
      setResult({
        status: "failed",
        error: { message: info.offline ? "Brak połączenia – skierowanie nie zostało wysłane. Spróbuj ponownie." : info.message, eventId: info.eventId },
        offline: info.offline,
      });
    }
  };

  const duplicate = (row) => {
    setForm(fromPayload(row?.payload || {}));
    setIsNfzFunded(false);
    setChecked("");
    setResult(null);
    setHistoryOpen(false);
    toast.success("Dane skierowania wstawiono do formularza");
  };

  const askCancel = (doc) => {
    setCancelReason("");
    setCancelReasonError("");
    setCancelTarget(doc);
  };

  const confirmCancel = async () => {
    if (cancelReason.trim().length < 5) {
      setCancelReasonError("Powód anulowania musi mieć co najmniej 5 znaków.");
      throw new Error("Powód anulowania musi mieć co najmniej 5 znaków.");
    }
    try {
      const res = await ehealthHelper.cancelDocument("referral", cancelTarget.id, cancelReason.trim());
      if (result?.id === cancelTarget.id) setResult(res.data || { ...result, status: "cancelled" });
      setCancelTarget(null);
      setHistoryVersion((v) => v + 1);
      onDocumentsChanged?.();
      toast.success("Anulowano e-skierowanie");
    } catch (err) {
      throw new Error(`Nie udało się anulować e-skierowania. ${unwrapEhealthError(err).message}`);
    }
  };

  const sendCode = (kind) => {
    if (kind === "sms") window.location.href = `sms:${phone}?body=${encodeURIComponent(`Kod e-skierowania: ${code}`)}`;
    else window.location.href = `mailto:${email}?subject=${encodeURIComponent("e-Skierowanie")}&body=${encodeURIComponent(`Kod dostępu: ${code}`)}`;
  };

  const title = !result ? "Moduł wystawiania e-skierowania"
    : result.status === "failed" ? "E-skierowanie nie zostało wystawione"
      : result.status === "cancelled" ? "E-skierowanie anulowane"
        : accepted ? "E-skierowanie wystawione"
          : result.status === "draft" ? "E-skierowanie sprawdzone, niewysłane" : "E-skierowanie bez kodu z P1";

  const renderResult = () => {
    if (result.status === "failed") {
      return (
        <div className="space-y-4">
          <div className="border-2 border-rose-200 rounded-2xl p-6 text-center bg-rose-50">
            <p className="text-sm font-bold text-rose-800">{result.offline ? result.error.message : "Nie udało się wysłać e-skierowania do P1."}</p>
            {!result.offline && <p className="mt-2 text-rose-700">{result.error?.message || "P1 nie podało przyczyny."} Popraw dane i spróbuj ponownie.</p>}
            {result.error?.eventId && <p className="mt-3 text-[10px] text-slate-500">Numer zdarzenia: {result.error.eventId}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border rounded-xl font-bold">Wróć do karty wizyty</button>
            <button type="button" onClick={() => { setResult(null); if (!result.offline) setChecked(""); }} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold">Popraw skierowanie</button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className={`border-2 rounded-2xl p-6 text-center ${accepted ? "border-blue-300 bg-blue-50" : result.status === "cancelled" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
          {accepted && (
            <>
              <p className="text-slate-600">Kod dostępu: <span className="sr-only">{code}</span></p>
              <div className="my-3 font-mono text-4xl font-black text-blue-900">{code}</div>
              <p className="text-slate-700">Pacjent realizuje je kodem i numerem PESEL{details?.pesel ? ` (${details.pesel})` : ""}.</p>
            </>
          )}
          {result.status === "cancelled" && <p className="text-sm font-bold text-rose-800">To e-skierowanie zostało anulowane w P1.</p>}
          {!accepted && result.status !== "cancelled" && <p className="text-sm text-amber-900">{result.error?.message || "Kod dostępu pojawi się dopiero po przyjęciu dokumentu przez P1."}</p>}
          {result.error?.eventId && <p className="mt-3 text-[10px] text-slate-500">Numer zdarzenia: {result.error.eventId}</p>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {accepted && (
            <>
              <button type="button" disabled={!phone} title={phone ? "" : "Brak telefonu pacjenta"} onClick={() => sendCode("sms")} className="py-2 border rounded-xl font-bold disabled:opacity-40">Wyślij SMS</button>
              <button type="button" disabled={!email} title={email ? "" : "Brak e-maila pacjenta"} onClick={() => sendCode("email")} className="py-2 border rounded-xl font-bold disabled:opacity-40">Wyślij e-mail</button>
            </>
          )}
          {canPrint(result) && (
            <button type="button" onClick={() => ehealthHelper.previewDocument("referral", result.id).catch((err) => toast.error(err.message))} className="py-2 border rounded-xl font-bold">Podgląd / wydruk</button>
          )}
          {canCancel(result) && (
            <button type="button" onClick={() => askCancel(result)} className="py-2 border border-rose-200 text-rose-700 rounded-xl font-bold">Anuluj e-skierowanie</button>
          )}
        </div>
        {accepted && !phone && !email && <p className="text-center text-slate-500">Brak telefonu i e-maila pacjenta – uzupełnij je w kartotece, aby wysłać kod.</p>}
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold">Wróć do karty wizyty</button>
        </div>
      </div>
    );
  };

  const targetBlocks = [
    { title: `Pasuje do: ${typeLabel}`, rows: filteredResort.matched, strong: true },
    ...(showAll ? [{ title: "Pozostałe komórki", rows: filteredResort.others, strong: false }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92dvh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setHistoryOpen(true)} className="px-3 py-1.5 rounded-xl border border-white/40 bg-white/10 text-xs font-semibold">
              Historia e-skierowań
            </button>
            <button type="button" onClick={onClose} className="px-2 py-1 text-lg" aria-label="Zamknij">×</button>
          </div>
        </div>

        <IssueSummaryBar patientName={details?.name || patient?.name} pesel={details?.pesel || patient?.pesel} birthDate={details?.birthDate || patient?.birthDate} doctorName={patient?.doctorName} pwz={patient?.pwz} patientId={patientId} visitId={visitId} issued={Boolean(result?.id)} issuedCellId={result?.payload?.cellId} />

        <div className="p-6 overflow-y-auto text-xs text-slate-700 space-y-4">
          {result ? renderResult() : (
            <>
              {errors.length > 0 && (
                <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-900">
                  <p className="font-bold">Uzupełnij:</p>
                  <ul className="list-disc pl-4 mt-1">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
                </div>
              )}

              <div className={`bg-slate-50 border rounded-xl p-4 space-y-3 ${missing.address ? "border-rose-400" : "border-slate-200"}`}>
                <IssuePatientCard patient={details} patientId={patientId} onChange={setDetails} onSavedToRecord={onPatientSaved} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <div className="text-[11px] font-semibold mb-1">Tryb skierowania *</div>
                  <div className="inline-flex border rounded-lg p-0.5 bg-white">
                    <button type="button" onClick={() => set({ priority: "normal" })} className={`px-3 py-1 rounded-md font-semibold ${priority === "normal" ? "bg-blue-600 text-white" : ""}`}>Zwykły</button>
                    <button type="button" onClick={() => set({ priority: "urgent" })} className={`px-3 py-1 rounded-md font-semibold ${priority === "urgent" ? "bg-rose-600 text-white" : ""}`}>Pilny (cito!)</button>
                  </div>
                </div>
                {hasNfz ? (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={isNfzFunded} onChange={(e) => setIsNfzFunded(e.target.checked)} />
                    <span>Skierowanie do realizacji w ramach NFZ</span>
                  </label>
                ) : referralType === "hospital_treatment" ? (
                  <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-900">Pacjent może zrealizować to skierowanie w szpitalu w ramach NFZ. Skierowanie do szpitala może wystawić każdy lekarz, także w placówce prywatnej.</p>
                ) : (
                  <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">Skierowanie prywatne – pacjent nie zrealizuje go w ramach NFZ. Centrum Medyczne 7 nie ma umowy z NFZ.</p>
                )}
              </div>

              <label className="block font-bold text-slate-800">Typ skierowania *</label>
              <select value={referralType} onChange={(e) => changeType(e.target.value)} className={`${inputClass} h-10`}>
                {REFERRAL_TYPES.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
              </select>

              <div className="relative">
                <div className="flex justify-between mb-1">
                  <label className="font-bold">Skierowanie do *</label>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{RESORT_HINTS[referralType]}</span>
                </div>
                <input
                  value={targetSearch}
                  onFocus={() => setTargetOpen(true)}
                  onBlur={() => setTargetOpen(false)}
                  onKeyDown={(e) => { if (e.key === "Escape") setTargetOpen(false); }}
                  onChange={(e) => { set({ target: e.target.value }); setTargetOpen(true); }}
                  className={`${inputClass} ${missing.target && !target.code ? missingClass : ""}`}
                  placeholder="Kod resortowy lub nazwa komórki"
                />
                {targetRow && !targetRow.types.includes(referralType) && (
                  <p className="mt-1 text-[11px] font-semibold text-amber-700">Ta komórka nie pasuje do typu „{typeLabel}”.</p>
                )}
                {targetOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-80 overflow-y-auto">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-1.5 text-[10px] text-slate-500">
                      <span>{resortError || `Wykaz kodów komórek (cz. VIII kodu resortowego)${versionDate ? `, wersja ${versionDate}` : ""} · ${targetBlocks.reduce((sum, b) => sum + b.rows.length, 0)} pozycji`}</span>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setTargetOpen(false); }} className="font-semibold text-slate-500">Zamknij listę</button>
                    </div>
                    {targetBlocks.map((block) => {
                      const groups = [];
                      block.rows.forEach((item) => {
                        let group = groups[groups.length - 1];
                        if (!group || group.name !== item.group) {
                          group = { name: item.group, rows: [] };
                          groups.push(group);
                        }
                        group.rows.push(item);
                      });
                      return groups.length ? (
                        <div key={block.title}>
                          <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${block.strong ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-500"}`}>{block.title}</div>
                          {groups.map((group) => (
                            <div key={`${block.title}-${group.name}`}>
                              <div className="border-b border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-500">{group.name}</div>
                              {group.rows.map((item) => (
                                <button key={`${block.title}-${item.code}`} type="button" onMouseDown={() => { set({ target: item.full }); setTargetOpen(false); }} className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 ${block.strong ? "" : "text-slate-600"}`}>
                                  <span className="font-mono font-bold text-blue-700 mr-2">{item.code}</span>{item.name}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })}
                    {!targetBlocks.some((b) => b.rows.length) && <div className="px-3 py-3 text-center text-[11px] text-slate-500">Brak komórki o takim kodzie lub nazwie.</div>}
                    <div className="flex items-center justify-between gap-2 border-t bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500">
                      <span>Komórki dla dzieci mają kod nieparzysty, o jeden wyższy (np. 1610 → 1611).</span>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowAll((v) => !v); }} className="shrink-0 font-semibold text-blue-700">{showAll ? "Pokaż tylko pasujące" : "Pokaż wszystkie"}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`bg-slate-50 border rounded-xl p-3 space-y-2 ${missing.icd && !parseCoded(primaryIcd10).code ? "border-rose-400" : ""}`}>
                <div className="grid sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-9">
                    <IcdMulti
                      label="Rozpoznanie główne (ICD-10)"
                      code={parseCoded(primaryIcd10).code}
                      name={parseCoded(primaryIcd10).name}
                      extra={extraIcd10}
                      visitDiagnoses={visitIcd}
                      onChange={(next) => set({ primaryIcd10: next.code ? formatCoded(next.code, next.name || next.code) : "", extraIcd10: next.extra || [] })}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <div className="font-medium text-gray-800 text-sm">Strona ciała</div>
                    <select value={site} onChange={(e) => set({ site: e.target.value })} className={`${inputClass} mt-1`}>
                      {ANATOMICAL_SITES.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Strona lewa i prawa idzie do P1 jako L albo R. „Obie” jest zapisywane w opisie skierowania, bo P1 przyjmuje jedną stronę.</p>

                <div className="pt-2 border-t space-y-2">
                  <div className="font-bold">Procedury (ICD-9) — opcjonalnie</div>
                  {referralType === "diagnostic_exam" && <p className="text-[11px] text-slate-500">Dla pracowni diagnostycznej P1 zaleca podanie procedury ICD-9.</p>}
                  {procedures.map((value, index) => (
                    <div key={index} className="relative">
                      <div className="flex gap-2">
                        <input
                          value={value}
                          onChange={(e) => searchProcedure(index, e.target.value)}
                          onBlur={() => setProcIndex(-1)}
                          onKeyDown={(e) => { if (e.key === "Escape") setProcIndex(-1); }}
                          className={inputClass}
                          placeholder="Kod lub nazwa procedury, np. USG"
                        />
                        {value ? (
                          <button type="button" onClick={() => { set({ procedures: procedures.length === 1 ? [""] : procedures.filter((_v, i) => i !== index) }); setProcIndex(-1); }} className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-800">Usuń</button>
                        ) : null}
                      </div>
                      {procIndex === index && (procHits.length > 0 || value.trim().length >= 2) && (
                        <div className="mt-1 bg-white border rounded-xl max-h-40 overflow-y-auto">
                          {procHits.map((row) => (
                            <button key={`${row.code}-${row.name}`} type="button" onMouseDown={() => { set({ procedures: procedures.map((v, i) => (i === index ? `${row.code} - ${row.name || row.display || ""}` : v)) }); setProcIndex(-1); }} className="w-full text-left px-3 py-2 hover:bg-blue-50">
                              <span className="font-mono mr-2">{row.code}</span>{row.name || row.display}
                            </button>
                          ))}
                          {procHits.length === 0 && procQuery === value.trim() && <p className="px-3 py-2 text-slate-500">Brak kodów ICD-9 dla „{value.trim()}”.</p>}
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); setProcIndex(-1); }} className="w-full text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">Zamknij listę</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {unusedVisitCodes(visitIcd9, procedures.map((value) => parseCoded(value).code)).map((row) => (
                    <button key={row.code} type="button" onClick={() => set({ procedures: [...procedures.filter((value) => value.trim()), formatCoded(row.code, row.name || row.code)] })} className="flex items-center gap-1 text-left text-[11px] font-semibold text-[#0D5C46]">
                      <Stethoscope size={12} /> Pobierz z wizyty: {row.code} {row.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => set({ procedures: [...procedures, ""] })} className="font-bold text-blue-700">+ Dodaj procedurę (ICD-9)</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="font-bold">Cel skierowania / Uzasadnienie medyczne *</span>
                  <textarea rows={3} value={justification} placeholder={PURPOSE_HINTS[referralType]} onChange={(e) => set({ justification: e.target.value })} className={`mt-1 w-full p-2 border rounded-xl ${missing.purpose && !justification.trim() ? missingClass : ""}`} />
                </label>
                <label className="block">
                  <span className="font-bold">Rozpoznanie opisowe / Przeciwwskazania</span>
                  <textarea rows={3} value={clinicalNotes} onChange={(e) => set({ clinicalNotes: e.target.value })} className="mt-1 w-full p-2 border rounded-xl" />
                </label>
                <label className="block">
                  <span className="font-bold">Badania dotychczas wykonane (opcjonalnie)</span>
                  <textarea rows={3} value={previousTests} onChange={(e) => set({ previousTests: e.target.value })} className="mt-1 w-full p-2 border rounded-xl" />
                </label>
              </div>
            </>
          )}
        </div>

        {!result && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-6 py-3">
            {checkedOk && <span className="mr-auto self-center text-xs font-semibold text-emerald-700">Dokument sprawdzony – gotowy do podpisu</span>}
            {changedSinceCheck && <span className="mr-auto self-center text-xs font-semibold text-amber-700">Zmieniono dane – sprawdź dokument ponownie przed podpisem.</span>}
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-xs">Anuluj</button>
            <button type="button" onClick={validate} className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs">Sprawdź dokument</button>
            <button type="button" onClick={startSigning} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-xs">Zapisz i przejdź do podpisu</button>
          </div>
        )}
      </div>

      <ReferralHistoryModal
        open={historyOpen}
        version={historyVersion}
        patientId={patientId}
        patientName={details?.name || patient?.name}
        pesel={details?.pesel || patient?.pesel}
        phone={phone}
        email={email}
        onClose={() => setHistoryOpen(false)}
        onDuplicate={duplicate}
        onCancelDocument={askCancel}
      />

      <P1SignDialog
        open={signOpen}
        title="Autoryzacja wystawienia e-skierowania"
        actionText="Podpisz i wyślij"
        plainText="Potwierdź wystawienie. E-skierowanie zostanie podpisane i wysłane do P1."
        offlineText="Brak połączenia – skierowanie nie zostało wysłane. Spróbuj ponownie."
        doctorLine={doctorLine}
        onClose={() => setSignOpen(false)}
        onConfirm={submit}
      />
      <P1SignDialog
        open={Boolean(cancelTarget)}
        isDestructive
        title="Autoryzacja anulowania w P1"
        actionText="Podpisz i anuluj w P1"
        plainText="Potwierdź anulowanie e-skierowania w P1. Tej operacji nie można cofnąć."
        doctorLine={doctorLine}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      >
        <div className="space-y-3.5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
            <strong className="font-bold text-amber-900 block mb-0.5">Uwaga: Ta operacja trwale wycofa dokument z systemu P1.</strong>
            Wpisz powód anulowania i hasło do certyfikatu ZUS.
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Kod dostępu / Pacjent:</span>
              <span className="font-mono font-bold text-slate-800">{accessCodeOf(cancelTarget) || "—"} — {details?.name || patient?.name || "—"}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Powód anulowania w rejestrze P1 <span className="text-rose-600">*</span></label>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); setCancelReasonError(""); }}
              placeholder="np. Błąd formalny, pomyłka w kodzie ICD-10, zmiana wskazań medycznych..."
              className={`w-full p-2.5 bg-white border rounded-xl text-xs ${cancelReasonError ? "border-rose-400" : "border-slate-200"}`}
            />
            {cancelReasonError && <p className="text-[11px] text-rose-600 font-medium">{cancelReasonError}</p>}
          </div>
        </div>
      </P1SignDialog>
    </div>
  );
};

export default EReferralIssueModal;
