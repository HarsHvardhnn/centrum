import React, { useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { STATUS_LABELS, statusClass } from "./ehealthStatus";

const EwusStatusCard = ({ pesel, patientId, visitId, compact = false, inline = false }) => {
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);

  const hasPesel = Boolean(pesel && String(pesel).replace(/\D/g, "").length >= 11);

  const check = async (trigger = "manual") => {
    if (!hasPesel) {
      toast.error("Brak PESEL — sprawdzenie zablokowane, rejestracja nadal możliwa");
      return;
    }
    try {
      setBusy(true);
      const res = await ehealthHelper.checkEwus({
        pesel,
        patientId,
        visitId,
        trigger,
      });
      if (!res?.success && !res?.data) {
        throw new Error(res?.error?.message || "Sprawdzenie nieudane");
      }
      setDoc(res.data);
      if (res.data?.status === "not_confirmed" || res.data?.status === "unavailable") {
        toast.message("eWUŚ: opieka nadal możliwa (informacja operacyjna)");
      }
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const status = doc?.status || "not_checked";

  const checkButton = (
    <button
      type="button"
      disabled={busy}
      onClick={() => check(doc ? "recheck" : "manual")}
      className="px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-medium disabled:opacity-50"
    >
      {busy ? "Sprawdzam…" : doc ? "Sprawdź ponownie" : "Sprawdź uprawnienia"}
    </button>
  );

  if (inline) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 shrink-0">eWUŚ — uprawnienia NFZ</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(status)}`}>
          {STATUS_LABELS[status] || status}
        </span>
        {checkButton}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-800">eWUŚ — uprawnienia NFZ</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(status)}`}>
          {STATUS_LABELS[status] || status}
        </span>
      </div>
      {doc?.updatedAt && (
        <p className="text-xs text-gray-500 mb-2">
          {new Date(doc.updatedAt).toLocaleString("pl-PL")}
        </p>
      )}
      {!hasPesel && (
        <p className="text-xs text-amber-700 mb-2">
          Brak PESEL blokuje tylko sprawdzenie, nie opiekę.
        </p>
      )}
      {(status === "not_confirmed" || status === "unavailable") && (
        <p className="text-xs text-gray-600 mb-2">
          Kontynuuj opiekę. To nie jest decyzja prawna NFZ.
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={busy}
          onClick={() => check("manual")}
          className="px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-medium disabled:opacity-50"
        >
          {busy ? "Sprawdzam…" : "Sprawdź uprawnienia"}
        </button>
        {doc && (
          <button
            type="button"
            disabled={busy}
            onClick={() => check("recheck")}
            className="px-3 py-1.5 border border-teal-700 text-teal-700 rounded text-xs"
          >
            Sprawdź ponownie
          </button>
        )}
      </div>
    </div>
  );
};

export default EwusStatusCard;
