import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  ERROR_CODE_LABELS,
  statusClass,
  canRetry,
  canCancel,
  canPrint,
  accessCodeOf,
} from "./ehealthStatus";

const EhealthDocumentPanel = ({
  open,
  onClose,
  service,
  visitId,
  patientId,
  onDocumentsChanged,
}) => {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [drugs, setDrugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [dosage, setDosage] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState("planowe");
  const [ezlaFrom, setEzlaFrom] = useState("");
  const [ezlaTo, setEzlaTo] = useState("");
  const [insurancePlace, setInsurancePlace] = useState("ZUS");
  const [familyCare, setFamilyCare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (!open) return;
    ehealthHelper
      .runtime()
      .then((res) => {
        const row = (res?.data?.services || []).find((s) => s.service === service);
        setIsMock((row?.provider || res?.data?.defaultProvider) === "mock");
      })
      .catch(() => setIsMock(false));
  }, [open, service]);

  if (!open) return null;

  const title = SERVICE_LABELS[service] || service;
  const reset = () => {
    setStep(1);
    setQuery("");
    setDrugs([]);
    setSelectedDrug(null);
    setQuantity("1");
    setDosage("");
    setSpecialty("");
    setReason("");
    setUrgency("planowe");
    setEzlaFrom("");
    setEzlaTo("");
    setInsurancePlace("ZUS");
    setFamilyCare(false);
    setResult(null);
    setSubmitError(null);
  };

  const notifyChanged = () => onDocumentsChanged?.();

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const searchDrugs = async () => {
    try {
      setSearching(true);
      const res = await ehealthHelper.searchDrugs(query);
      if (!res?.success) throw new Error(res?.error?.message || "Szukanie nieudane");
      setDrugs(res.data || []);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setSearching(false);
    }
  };

  const applyResult = (doc) => {
    setResult(doc);
    setSubmitError(null);
    notifyChanged();
    if (doc?.status === "failed") {
      toast.error(doc.error?.message || `${title}: błąd`);
      return;
    }
    toast.success(`${title}: ${STATUS_LABELS[doc?.status] || doc?.status}`);
  };

  const submit = async (simulate) => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    try {
      setBusy(true);
      setSubmitError(null);
      let res;
      const common = { visitId, patientId, simulate };
      if (service === "prescription") {
        res = await ehealthHelper.submitPrescription({
          ...common,
          payload: { drug: selectedDrug, quantity, dosage },
        });
      } else if (service === "referral") {
        res = await ehealthHelper.submitReferral({
          ...common,
          payload: { specialty, reason, urgency },
        });
      } else {
        res = await ehealthHelper.submitEzla({
          ...common,
          payload: { from: ezlaFrom, to: ezlaTo, insurancePlace, familyCare },
        });
      }
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      applyResult(res.data);
    } catch (err) {
      const parsed = unwrapEhealthError(err);
      setSubmitError(parsed);
      toast.error(parsed.message);
    } finally {
      setBusy(false);
    }
  };

  const retry = async () => {
    if (!result?.id) return;
    try {
      setBusy(true);
      let res;
      if (service === "prescription") res = await ehealthHelper.retryPrescription(result.id);
      else if (service === "referral") res = await ehealthHelper.retryReferral(result.id);
      else res = await ehealthHelper.retryEzla(result.id);
      if (!res?.success) throw new Error(res?.error?.message || "Ponowienie nieudane");
      applyResult(res.data);
    } catch (err) {
      const parsed = unwrapEhealthError(err);
      setSubmitError(parsed);
      toast.error(parsed.message);
    } finally {
      setBusy(false);
    }
  };

  const handoff = async () => {
    if (!result?.id) return;
    try {
      setBusy(true);
      const res = await ehealthHelper.handoffEzla(result.id);
      if (!res?.success) throw new Error(res?.error?.message || "Przekazanie nieudane");
      applyResult(res.data);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const printDoc = async () => {
    if (!result?.id) return;
    try {
      setBusy(true);
      await ehealthHelper.printDocument(service, result.id);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const cancelDoc = async () => {
    if (!result?.id) return;
    if (!window.confirm("Anulować ten dokument?")) return;
    try {
      setBusy(true);
      const res = await ehealthHelper.cancelDocument(service, result.id);
      if (!res?.success) throw new Error(res?.error?.message || "Anulowanie nieudane");
      applyResult(res.data);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const draftChecked = result?.status === "draft";
  const failed = result?.status === "failed" || result?.status === "retry";
  const code = result?.error?.code || submitError?.code;
  const errorText = result?.error?.message || submitError?.message;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} aria-hidden />
      <aside className="relative h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-teal-800">{title}</h2>
          <button type="button" onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {service === "prescription" && !result && (
            <>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className={step === 1 ? "font-semibold text-teal-700" : ""}>1. Lek</span>
                <span className={step === 2 ? "font-semibold text-teal-700" : ""}>2. Dawka</span>
                <span className={step === 3 ? "font-semibold text-teal-700" : ""}>3. Potwierdź</span>
              </div>
              {step === 1 && (
                <>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Szukaj leku (np. para)"
                    className="w-full p-3 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={searchDrugs}
                    disabled={searching}
                    className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
                  >
                    {searching ? "Szukam…" : "Szukaj"}
                  </button>
                  <div className="space-y-2">
                    {drugs.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDrug(d);
                          setStep(2);
                        }}
                        className="w-full text-left p-3 border rounded-lg hover:border-teal-600"
                      >
                        <div className="font-medium text-sm">{d.name}</div>
                        <div className="text-xs text-gray-500">
                          {d.activeSubstance} · {d.package} · EAN {d.ean}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="text-sm text-gray-700">{selectedDrug?.name}</div>
                  <label className="block text-sm">
                    Ilość
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 w-full p-3 border rounded-lg"
                    />
                  </label>
                  <label className="block text-sm">
                    Dawkowanie
                    <input
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="np. 1×3"
                      className="mt-1 w-full p-3 border rounded-lg"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(1)} className="px-3 py-2 border rounded-lg text-sm">
                      Wstecz
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-3 py-2 bg-teal-700 text-white rounded-lg text-sm"
                    >
                      Dalej
                    </button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedDrug?.name}<br />
                    Ilość: {quantity}<br />
                    Dawkowanie: {dosage || "—"}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submit()}
                      className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
                    >
                      Wystaw
                    </button>
                    {isMock && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submit("fail")}
                        className="px-3 py-2 border rounded-lg text-sm text-gray-600"
                      >
                        Symuluj błąd
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {service === "referral" && !result && (
            <>
              <label className="block text-sm">
                Specjalizacja / usługa
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="mt-1 w-full p-3 border rounded-lg"
                />
              </label>
              <label className="block text-sm">
                Powód
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full p-3 border rounded-lg"
                  rows={3}
                />
              </label>
              <label className="block text-sm">
                Pilność
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="mt-1 w-full p-3 border rounded-lg"
                >
                  <option value="planowe">Planowe</option>
                  <option value="pilne">Pilne</option>
                </select>
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit()}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
              >
                Wystaw skierowanie
              </button>
            </>
          )}

          {service === "ezla" && !result && (
            <>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">
                Certyfikat ZUS jest w Medfile — CM7MED nie przechowuje PIN/PFX.
              </div>
              <label className="block text-sm">
                Od
                <input type="date" value={ezlaFrom} onChange={(e) => setEzlaFrom(e.target.value)} className="mt-1 w-full p-3 border rounded-lg" />
              </label>
              <label className="block text-sm">
                Do
                <input type="date" value={ezlaTo} onChange={(e) => setEzlaTo(e.target.value)} className="mt-1 w-full p-3 border rounded-lg" />
              </label>
              <label className="block text-sm">
                Miejsce ubezpieczenia
                <select value={insurancePlace} onChange={(e) => setInsurancePlace(e.target.value)} className="mt-1 w-full p-3 border rounded-lg">
                  <option value="ZUS">ZUS</option>
                  <option value="KRUS">KRUS</option>
                  <option value="inne">Inne</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={familyCare} onChange={(e) => setFamilyCare(e.target.checked)} />
                Opieka nad członkiem rodziny
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => submit()}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
              >
                Wystaw e-ZLA
              </button>
            </>
          )}

          {submitError && !result && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 space-y-1">
              <div className="font-medium">{ERROR_CODE_LABELS[submitError.code] || "Błąd"}</div>
              <div>{submitError.message}</div>
              {(submitError.code === "AUTH" || submitError.code === "UNAVAILABLE") && (
                <a href="/administracja/integracje-ezdrowie" className="text-teal-800 underline">
                  Otwórz ustawienia integracji
                </a>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusClass(result.status)}`}>
                {STATUS_LABELS[result.status] || result.status}
              </span>
              {result.externalId && (
                <div className="text-sm text-gray-600">Id zewnętrzny: {result.externalId}</div>
              )}
              {accessCodeOf(result) && (
                <div className="text-sm font-medium text-gray-800">
                  Kod dostępu: <span className="font-mono tracking-widest">{accessCodeOf(result)}</span>
                </div>
              )}
              {draftChecked && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm">
                  {result.error?.message ||
                    "Dokument sprawdzony. Nie wysłano do P1 — tryb wystawiania na żywo jest wyłączony."}
                </div>
              )}
              {failed && errorText && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 space-y-1">
                  <div className="font-medium">{ERROR_CODE_LABELS[code] || "Błąd"}</div>
                  <div>{errorText}</div>
                  {(code === "AUTH" || code === "UNAVAILABLE") && (
                    <a href="/administracja/integracje-ezdrowie" className="text-teal-800 underline">
                      Otwórz ustawienia integracji
                    </a>
                  )}
                </div>
              )}
              {!failed && !draftChecked && result.error?.message && (
                <div className="text-sm text-gray-700">{result.error.message}</div>
              )}
              <div className="flex gap-2 flex-wrap">
                {canRetry(result) && (
                  <button type="button" disabled={busy} onClick={retry} className="px-4 py-2 border border-teal-700 text-teal-700 rounded-lg text-sm">
                    Ponów
                  </button>
                )}
                {service === "ezla" && result.status === "needs_signature" && (
                  <button type="button" disabled={busy} onClick={handoff} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm">
                    Przekaż do podpisu
                  </button>
                )}
                {canPrint(result) && (
                  <button type="button" disabled={busy} onClick={printDoc} className="px-4 py-2 border rounded-lg text-sm">
                    Drukuj
                  </button>
                )}
                {canCancel(result) && (
                  <button type="button" disabled={busy} onClick={cancelDoc} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm">
                    Anuluj
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default EhealthDocumentPanel;
