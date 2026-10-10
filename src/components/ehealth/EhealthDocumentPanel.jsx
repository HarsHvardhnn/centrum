import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import EPrescriptionIssueModal from "./EPrescriptionIssueModal";
import ReferralForm from "./ReferralForm";
import EzlaForm from "./EzlaForm";
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

function drugKey(drug) {
  return String(drug?.ean || drug?.id || drug?.name || "");
}

export function DrugSuggestions({ historyDrugs = [], catalogDrugs = [], showHistory = false, onPick }) {
  const historyKeys = new Set(historyDrugs.map(drugKey));
  const catalog = catalogDrugs.filter((drug) => !historyKeys.has(drugKey(drug)));
  if ((!showHistory || historyDrugs.length === 0) && catalog.length === 0) return null;

  const renderDrug = (drug) => (
    <button
      key={drugKey(drug)}
      type="button"
      onClick={() => onPick(drug)}
      className="w-full text-left p-3 border rounded-lg hover:border-teal-600"
    >
      <div className="font-medium text-sm">{drug.name}</div>
      <div className="text-xs text-gray-500">
        {[drug.activeSubstance, drug.package, drug.ean ? `EAN ${drug.ean}` : ""].filter(Boolean).join(" · ")}
      </div>
    </button>
  );

  return (
    <div className="space-y-3">
      {showHistory && historyDrugs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Z historii wizyt</p>
          {historyDrugs.map(renderDrug)}
        </div>
      )}
      {catalog.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Baza leków</p>
          {catalog.map(renderDrug)}
        </div>
      )}
    </div>
  );
}

const EhealthDocumentPanel = ({
  open,
  onClose,
  service,
  visitId,
  patientId,
  onDocumentsChanged,
  initialPayload,
  diagnoses,
  patient,
}) => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  if (!open) return null;

  const title = SERVICE_LABELS[service] || service;
  const reset = () => {
    setResult(null);
    setSubmitError(null);
  };

  const notifyChanged = () => onDocumentsChanged?.();

  const handleClose = () => {
    reset();
    onClose?.();
  };

  if (service === "prescription") {
    return (
      <EPrescriptionIssueModal
        open
        onClose={handleClose}
        visitId={visitId}
        patientId={patientId}
        patient={patient}
        initialPayload={initialPayload}
        onDocumentsChanged={notifyChanged}
      />
    );
  }

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

  const submit = async (payload) => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    try {
      setBusy(true);
      setSubmitError(null);
      const common = { visitId, patientId, payload };
      const res =
        service === "referral"
          ? await ehealthHelper.submitReferral(common)
          : await ehealthHelper.submitEzla(common);
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      if (res.licenseWarning) toast.warning(res.licenseWarning);
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
          {service === "referral" && !result && (
            <ReferralForm busy={busy} onIssue={submit} diagnoses={diagnoses} initialPayload={initialPayload} />
          )}

          {service === "ezla" && !result && (
            <EzlaForm busy={busy} patientId={patientId} onIssue={submit} initialPayload={initialPayload} />
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
