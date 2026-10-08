import React, { useState } from "react";
import { toast } from "sonner";
import EzlaForm from "../../../../ehealth/EzlaForm";
import ehealthHelper, { unwrapEhealthError } from "../../../../../helpers/ehealthHelper";
import { ERROR_CODE_LABELS, STATUS_LABELS, statusClass } from "../../../../ehealth/ehealthStatus";

const SECTION_BG = "bg-white";

export const EzlaSection = ({
  visitId,
  patientId,
  onDocumentsChanged,
  className = "",
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const submit = async (payload) => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    try {
      setBusy(true);
      setSubmitError(null);
      const res = await ehealthHelper.submitEzla({ visitId, patientId, payload });
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      setResult(res.data);
      onDocumentsChanged?.();
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      if (res.data?.status === "failed") {
        toast.error(res.data.error?.message || "e-ZLA: błąd");
        return;
      }
      toast.success(`e-ZLA: ${STATUS_LABELS[res.data?.status] || res.data?.status}`);
    } catch (err) {
      const parsed = unwrapEhealthError(err);
      setSubmitError(parsed);
      toast.error(parsed.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${SECTION_BG} rounded border border-gray-200 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-base font-semibold text-gray-800">e-ZLA</h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-5 pb-5">
          {result ? (
            <div className="space-y-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusClass(result.status)}`}>
                {STATUS_LABELS[result.status] || result.status}
              </span>
              {result.error?.message && (
                <p className={`text-sm ${result.status === "draft" ? "text-amber-800" : "text-red-700"}`}>
                  {result.error.message}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSubmitError(null);
                }}
                className="text-sm text-teal-700 hover:underline"
              >
                Wystaw kolejne
              </button>
            </div>
          ) : (
            <>
              <EzlaForm busy={busy} patientId={patientId} onIssue={submit} />
              {submitError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 space-y-1">
                  <div className="font-medium">{ERROR_CODE_LABELS[submitError.code] || "Błąd"}</div>
                  <div>{submitError.message}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
