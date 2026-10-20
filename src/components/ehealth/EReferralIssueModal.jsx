import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { STATUS_LABELS, statusClass, accessCodeOf } from "./ehealthStatus";
import P1SignDialog from "./P1SignDialog";
import ReferralHistoryModal from "./ReferralHistoryModal";
import IssuePatientCard, { normalizePatient, patientForDocument } from "./IssuePatientCard";
import {
  ANATOMICAL_SITES,
  NFZ_BRANCHES,
  REFERRAL_TYPES,
  RESORT_CODES,
  RESORT_HINTS,
} from "./eReferralCatalog";
import IcdField from "./IcdField";
import { formatCoded, visitDiagnosisRows } from "./visitIcd";

const inputClass = "w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900";

function parseCoded(value) {
  const text = String(value || "").trim();
  const match = text.match(/^([A-Z][0-9A-Z.*]+)\s*[-—]\s*(.+)$/i);
  if (match) return { code: match[1].trim(), name: match[2].trim() };
  if (/^[A-Z][0-9A-Z.*]+$/i.test(text)) return { code: text, name: "" };
  return { code: "", name: "" };
}

const EReferralIssueModal = ({
  open,
  onClose,
  visitId,
  patientId,
  patient,
  diagnoses = [],
  initialPayload,
  onDocumentsChanged,
  onPatientSaved,
}) => {
  const copied = initialPayload || {};
  const [details, setDetails] = useState(() => normalizePatient(patient));
  const [referralType, setReferralType] = useState(
    copied.type === "02.10REH" ? "rehabilitation" : "specialist_clinic"
  );
  const [priority, setPriority] = useState(copied.cito ? "urgent" : "normal");
  const [isNfzFunded, setIsNfzFunded] = useState(copied.reimbursed === "Y");
  const [nfzBranch, setNfzBranch] = useState(copied.nfzDepartment || "07");
  const [nfzContract, setNfzContract] = useState(copied.nfzContract || "");
  const [targetSearch, setTargetSearch] = useState(
    copied.performerCode && copied.performer ? `${copied.performerCode} - ${copied.performer}` : "1100 - Poradnia kardiologiczna"
  );
  const [targetOpen, setTargetOpen] = useState(false);
  const [primaryIcd10, setPrimaryIcd10] = useState(
    copied.icd10Code ? formatCoded(copied.icd10Code, copied.icd10Display) : ""
  );
  const visitIcd = useMemo(() => visitDiagnosisRows(diagnoses), [diagnoses]);
  const [site, setSite] = useState(copied.bodySite === "L" ? "left" : copied.bodySite === "R" ? "right" : "");
  const [procedures, setProcedures] = useState(
    copied.icd9Code ? [`${copied.icd9Code} - ${copied.icd9Display || ""}`] : [""]
  );
  const [procHits, setProcHits] = useState([]);
  const [procIndex, setProcIndex] = useState(-1);
  const [procQuery, setProcQuery] = useState("");
  const [contraindications, setContraindications] = useState(copied.previousTests || "");
  const [justification, setJustification] = useState(copied.purpose || "");
  const [errors, setErrors] = useState([]);
  const [signOpen, setSignOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");

  const filteredResort = useMemo(() => {
    const q = targetSearch.trim().toLowerCase();
    const matches = (item) => !q || item.full.toLowerCase().includes(q) || item.code.includes(q);
    return {
      matched: RESORT_CODES.filter((item) => item.category === referralType && matches(item)).slice(0, 8),
      others: RESORT_CODES.filter((item) => item.category !== referralType && matches(item)).slice(0, 6),
    };
  }, [referralType, targetSearch]);

  if (!open) return null;

  const typeLabel = REFERRAL_TYPES.find((row) => row.value === referralType)?.label || "Skierowanie";
  const justificationRequired =
    referralType === "hospital_treatment" || referralType === "rehabilitation" || priority === "urgent";
  const code = accessCodeOf(result);
  const doctorLine = [patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ");

  const changeType = (next) => {
    setReferralType(next);
    const first = RESORT_CODES.find((item) => item.category === next);
    if (first) setTargetSearch(first.full);
    if (next === "diagnostic_exam" && procedures.every((row) => !row.trim())) setProcedures([""]);
  };

  const searchProcedure = async (index, value) => {
    const next = procedures.slice();
    next[index] = value;
    setProcedures(next);
    if (value.trim().length < 2) {
      setProcHits([]);
      setProcIndex(-1);
      return;
    }
    setProcIndex(index);
    try {
      const rows = await appointmentHelper.searchIcd9(value.trim());
      const hits = Array.isArray(rows) ? rows.slice(0, 8) : [];
      setProcHits(hits);
      setProcQuery(value.trim());
      setProcIndex(index);
    } catch {
      setProcHits([]);
      setProcIndex(index);
    }
  };

  const validate = () => {
    const next = [];
    const target = parseCoded(targetSearch);
    if (!target.code || !target.name) next.push("Wskaż komórkę docelową w polu Skierowanie do.");
    const icd = parseCoded(primaryIcd10);
    if (!icd.code || !icd.name) next.push("Pole Rozpoznanie główne (ICD-10) jest wymagane (kod i nazwa).");
    if (justificationRequired && !justification.trim()) {
      next.push("Cel skierowania jest wymagany dla szpitala, rehabilitacji albo trybu pilnego.");
    }
    if (referralType === "diagnostic_exam" && !procedures.some((row) => parseCoded(row).code)) {
      next.push("Dla pracowni diagnostycznej wskaż co najmniej jedną procedurę ICD-9.");
    }
    if (isNfzFunded && !nfzBranch) next.push("Pole Oddział NFZ jest wymagane dla skierowania w ramach NFZ.");
    setErrors(next);
    return next.length === 0;
  };

  const submit = async () => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    const target = parseCoded(targetSearch);
    const icd = parseCoded(primaryIcd10);
    const parsedProcedures = procedures.map(parseCoded).filter((row) => row.code && row.name);
    const extra = parsedProcedures.slice(1).map((row) => `${row.code} ${row.name}`).join("; ");
    const notes = [contraindications.trim(), extra ? `Dodatkowe ICD-9: ${extra}` : ""].filter(Boolean).join("\n");
    const payload = {
      type: referralType === "rehabilitation" ? "02.10REH" : "02.10",
      title: `${typeLabel}: ${target.name}`,
      purpose: justification.trim() || "Wskazanie kliniczne w oparciu o stan pacjenta.",
      previousTests: notes,
      icd10Code: icd.code,
      icd10Display: icd.name,
      bodySite: site === "left" ? "L" : site === "right" ? "R" : "",
      icd9Code: parsedProcedures[0]?.code || "",
      icd9Display: parsedProcedures[0]?.name || "",
      performerCode: target.code,
      performer: target.name,
      reimbursed: isNfzFunded ? "Y" : "N",
      nfzDepartment: isNfzFunded ? nfzBranch : "",
      nfzContract: isNfzFunded ? nfzContract.trim() : "",
      cito: priority === "urgent",
      observation: referralType === "rehabilitation" ? justification.trim() : "",
      clientReferralType: referralType,
      anatomicalSite: site,
      doctorName: patient?.doctorName || "",
      patientForDocument: patientForDocument(details),
    };
    try {
      setBusy(true);
      const res = await ehealthHelper.submitReferral({ visitId, patientId, payload });
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      setSignOpen(false);
      onDocumentsChanged?.();
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      if (res.data?.status === "failed") toast.error(res.data.error?.message || "e-Skierowanie zapisane z błędem wysyłki.");
      else toast.success("E-skierowanie jest na liście dokumentów tej wizyty.");
      onClose?.();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const applyHistory = (row) => {
    const payload = row?.payload || {};
    if (payload.type === "02.10REH" || payload.clientReferralType === "rehabilitation") setReferralType("rehabilitation");
    else if (payload.clientReferralType) setReferralType(payload.clientReferralType);
    if (payload.performerCode && payload.performer) setTargetSearch(`${payload.performerCode} - ${payload.performer}`);
    if (payload.icd10Code) setPrimaryIcd10(`${payload.icd10Code} - ${payload.icd10Display || ""}`.trim());
    if (payload.purpose) setJustification(payload.purpose);
    setPriority(payload.cito || payload.priorityCode === "UR" ? "urgent" : "normal");
    setIsNfzFunded(payload.reimbursed === "Y");
    if (payload.nfzDepartment) setNfzBranch(payload.nfzDepartment);
    if (payload.nfzContract) setNfzContract(payload.nfzContract);
    if (payload.icd9Code) setProcedures([`${payload.icd9Code} - ${payload.icd9Display || ""}`]);
    setContraindications(payload.previousTests || "");
    setSite(payload.anatomicalSite || (payload.bodySite === "L" ? "left" : payload.bodySite === "R" ? "right" : ""));
    setResult(null);
    setHistoryOpen(false);
    toast.success("Dane skierowania wstawiono do formularza");
  };

  const sendCode = (kind) => {
    if (!code) {
      toast.error("Kod dostępu pojawi się dopiero po przyjęciu skierowania przez P1.");
      return;
    }
    if (kind === "sms" && patient?.phone) window.location.href = `sms:${patient.phone}?body=${encodeURIComponent(`Kod e-skierowania: ${code}`)}`;
    if (kind === "email" && patient?.email) window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent("e-Skierowanie")}&body=${encodeURIComponent(`Kod dostępu: ${code}`)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-base font-bold">
            {result ? "E-Skierowanie zarejestrowane w CeZ / P1" : "Moduł wystawiania e-Skierowania"}
          </h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setHistoryOpen(true)} className="px-3 py-1.5 rounded-xl border border-white/40 bg-white/10 text-xs font-semibold">
              Historia e-Skierowań
            </button>
            <button type="button" onClick={onClose} className="px-2 py-1 text-lg" aria-label="Zamknij">×</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto text-xs text-slate-700 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="border-2 border-blue-300 rounded-2xl p-6 text-center bg-blue-50">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusClass(result.status)}`}>
                  {STATUS_LABELS[result.status] || result.status}
                </span>
                <p className="mt-3 text-slate-500">Czterocyfrowy kod dostępu do e-skierowania</p>
                <div className="my-3 font-mono text-4xl font-black text-blue-900">{code || "—"}</div>
                {!code && (
                  <p className="text-slate-600">
                    {result.error?.message || "Kod P1 pojawi się po przyjęciu dokumentu. Sprawdzenie bez wysyłki nie nadaje kodu."}
                  </p>
                )}
                {patient?.pesel && <p className="mt-2">Realizacja: kod i PESEL {patient.pesel}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" onClick={() => sendCode("sms")} className="py-2 border rounded-xl font-bold">Wyślij SMS</button>
                <button type="button" onClick={() => sendCode("email")} className="py-2 border rounded-xl font-bold">Wyślij e-mail</button>
                <button type="button" onClick={() => ehealthHelper.printDocument("referral", result.id)} className="py-2 border rounded-xl font-bold">Podgląd / wydruk</button>
                <button
                  type="button"
                  onClick={() => { setCancelReason(""); setCancelReasonError(""); setCancelOpen(true); }}
                  className="py-2 border border-rose-200 text-rose-700 rounded-xl font-bold"
                >
                  Anuluj e-Skierowanie
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold">
                  Wróć do karty wizyty
                </button>
              </div>
            </div>
          ) : (
            <>
              {errors.length > 0 && (
                <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-900">
                  <p className="font-bold">Uzupełnij wymagane pola przed przejściem do podpisu:</p>
                  <ul className="list-disc pl-4 mt-1">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <IssuePatientCard patient={details} patientId={patientId} onChange={setDetails} onSavedToRecord={onPatientSaved} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                    <div className="text-[11px] font-semibold mb-1">Tryb skierowania *</div>
                    <div className="inline-flex border rounded-lg p-0.5 bg-white">
                      <button type="button" onClick={() => setPriority("normal")} className={`px-3 py-1 rounded-md font-semibold ${priority === "normal" ? "bg-blue-600 text-white" : ""}`}>Zwykły</button>
                      <button type="button" onClick={() => setPriority("urgent")} className={`px-3 py-1 rounded-md font-semibold ${priority === "urgent" ? "bg-rose-600 text-white" : ""}`}>Pilny (cito!)</button>
                    </div>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isNfzFunded} onChange={(e) => setIsNfzFunded(e.target.checked)} />
                  <span>Skierowanie do realizacji w ramach NFZ</span>
                </label>
                {isNfzFunded && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    <select value={nfzBranch} onChange={(e) => setNfzBranch(e.target.value)} className={inputClass}>
                      {NFZ_BRANCHES.map((branch) => <option key={branch.code} value={branch.code}>{branch.label}</option>)}
                    </select>
                    <input value={nfzContract} onChange={(e) => setNfzContract(e.target.value)} placeholder="Numer umowy z NFZ (opcjonalnie)" className={inputClass} />
                  </div>
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
                  onChange={(e) => { setTargetSearch(e.target.value); setTargetOpen(true); }}
                  className={inputClass}
                  placeholder="Kod resortowy lub nazwa komórki"
                />
                {targetOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); setTargetOpen(false); }} className="w-full text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">Zamknij listę</button>
                    {filteredResort.matched.map((item) => (
                      <button key={`${item.category}-${item.code}-${item.name}`} type="button" onMouseDown={() => { setTargetSearch(item.full); setTargetOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50">
                        <span className="font-mono font-bold text-blue-700 mr-2">{item.code}</span>{item.name}
                      </button>
                    ))}
                    {filteredResort.others.map((item) => (
                      <button key={`${item.category}-${item.code}-${item.name}`} type="button" onMouseDown={() => { setTargetSearch(item.full); setTargetOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600">
                        <span className="font-mono mr-2">{item.code}</span>{item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
                <div className="grid sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-9">
                    <IcdField
                      label="Rozpoznanie główne (ICD-10) *"
                      code={parseCoded(primaryIcd10).code}
                      name={parseCoded(primaryIcd10).name}
                      diagnoses={visitIcd}
                      importLabel="Pobierz z wizyty"
                      onPick={(item) => setPrimaryIcd10(item.code ? formatCoded(item.code, item.name || item.code) : "")}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <div className="font-medium text-gray-800 text-sm">Strona ciała</div>
                    <select value={site} onChange={(e) => setSite(e.target.value)} className={`${inputClass} mt-1`}>
                      {ANATOMICAL_SITES.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Strona lewa i prawa idzie do P1 jako L albo R. Obie strony zostają w opisie, bo P1 przyjmuje jedną stronę.</p>

                <div className="pt-2 border-t space-y-2">
                  <div className="font-bold">{referralType === "diagnostic_exam" ? "Procedury (ICD-9) *" : "Procedury (ICD-9) — opcjonalnie"}</div>
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
                          <button
                            type="button"
                            onClick={() => {
                              const next = procedures.slice();
                              if (procedures.length === 1) next[0] = "";
                              else next.splice(index, 1);
                              setProcedures(next);
                              setProcIndex(-1);
                            }}
                            className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                          >
                            Usuń
                          </button>
                        ) : null}
                      </div>
                      {procIndex === index && (procHits.length > 0 || value.trim().length >= 2) && (
                        <div className="mt-1 bg-white border rounded-xl max-h-40 overflow-y-auto">
                          {procHits.map((row) => (
                            <button
                              key={`${row.code}-${row.name}`}
                              type="button"
                              onMouseDown={() => {
                                const next = procedures.slice();
                                next[index] = `${row.code} - ${row.name || row.display || ""}`;
                                setProcedures(next);
                                setProcIndex(-1);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50"
                            >
                              <span className="font-mono mr-2">{row.code}</span>{row.name || row.display}
                            </button>
                          ))}
                          {procHits.length === 0 && procQuery === value.trim() && <p className="px-3 py-2 text-slate-500">Brak kodów ICD-9 dla „{value.trim()}”.</p>}
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); setProcIndex(-1); }} className="w-full text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">Zamknij listę</button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setProcedures([...procedures, ""])} className="font-bold text-blue-700">+ Dodaj procedurę (ICD-9)</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-bold">Rozpoznanie opisowe / Przeciwwskazania</span>
                  <textarea rows={3} value={contraindications} onChange={(e) => setContraindications(e.target.value)} className="mt-1 w-full p-2 border rounded-xl" />
                </label>
                <label className="block">
                  <span className="font-bold">Cel skierowania / Uzasadnienie medyczne {justificationRequired ? "*" : ""}</span>
                  <textarea rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} className="mt-1 w-full p-2 border rounded-xl" />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold">Anuluj</button>
                <button type="button" onClick={() => { if (validate()) setSignOpen(true); }} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold">
                  Zapisz i przejdź do podpisu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ReferralHistoryModal
        open={historyOpen}
        patientId={patientId}
        patientName={details?.name || patient?.name}
        pesel={details?.pesel || patient?.pesel}
        onClose={() => setHistoryOpen(false)}
        onDuplicate={applyHistory}
      />

      <P1SignDialog
        open={signOpen}
        title="Autoryzacja wystawienia e-skierowania"
        actionText="Podpisz i wyślij"
        doctorLine={doctorLine}
        onClose={() => setSignOpen(false)}
        onConfirm={submit}
      />
      <P1SignDialog
        open={cancelOpen}
        isDestructive
        title="Autoryzacja anulowania w P1"
        actionText="Podpisz i anuluj w P1"
        doctorLine={doctorLine}
        onClose={() => setCancelOpen(false)}
        onConfirm={async () => {
          if (cancelReason.trim().length < 5) {
            setCancelReasonError("Powód anulowania musi mieć co najmniej 5 znaków.");
            throw new Error("Powód anulowania musi mieć co najmniej 5 znaków.");
          }
          setCancelReasonError("");
          const res = await ehealthHelper.cancelDocument("referral", result.id, cancelReason.trim());
          setResult(res.data || { ...result, status: "cancelled" });
          setCancelOpen(false);
          onDocumentsChanged?.();
          toast.success("Anulowano e-skierowanie");
        }}
      >
        <div className="space-y-3.5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
            <strong className="font-bold text-amber-900 block mb-0.5">Uwaga: Ta operacja trwale wycofa dokument z systemu P1.</strong>
            Wymaga podania powodu oraz autoryzacji kodem PIN certyfikatu.
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Kod dostępu / Pacjent:</span>
              <span className="font-mono font-bold text-slate-800">{code || "—"} — {details?.name || patient?.name || "—"}</span>
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
