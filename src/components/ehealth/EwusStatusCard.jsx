import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";

function warsawDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatChecked(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(date);
  if (warsawDay(date) === warsawDay(new Date())) return `dzisiaj, ${time}`;
  const [year, month, day] = warsawDay(date).split("-");
  return `${day}.${month}.${year}, ${time}`;
}

function badgeFor(doc) {
  const status = doc?.status || "not_checked";
  const validUntil = doc?.payload?.validUntil ? new Date(doc.payload.validUntil) : null;
  const expired = validUntil && !Number.isNaN(validUntil.getTime()) && validUntil.getTime() < Date.now();
  if (status === "confirmed" && expired) {
    return { label: "Wygasło", className: "bg-amber-100 text-amber-800" };
  }
  if (status === "confirmed") return { label: "Uprawniony", className: "bg-emerald-100 text-emerald-800" };
  if (status === "not_confirmed") return { label: "Brak uprawnień", className: "bg-red-100 text-red-800" };
  if (status === "unavailable") return { label: "Niedostępne", className: "bg-amber-100 text-amber-800" };
  if (status === "needs_recheck") return { label: "Wymaga sprawdzenia", className: "bg-amber-100 text-amber-800" };
  return { label: "Nie sprawdzono", className: "bg-gray-100 text-gray-600" };
}

const EwusStatusCard = ({ pesel, patientId, visitId, compact = false, variant = "card" }) => {
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);

  const hasPesel = Boolean(pesel && String(pesel).replace(/\D/g, "").length >= 11);

  useEffect(() => {
    if (!patientId || variant !== "patient") return undefined;
    let cancelled = false;
    ehealthHelper
      .history({ patientId, service: "eligibility" })
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && rows[0]) setDoc(rows[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [patientId, variant]);

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

  const badge = badgeFor(doc);
  const checkedAt = doc?.payload?.checkedAt || doc?.createdAt;
  const validUntil = doc?.payload?.validUntil;
  const checkedLabel = formatChecked(checkedAt);
  const validLabel = formatChecked(validUntil);

  const action = (
    <button
      type="button"
      disabled={busy}
      onClick={() => check(doc ? "recheck" : "manual")}
      className={
        variant === "patient"
          ? "text-xs font-medium text-teal-700 hover:text-teal-800 disabled:opacity-50"
          : "px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-medium disabled:opacity-50"
      }
    >
      {busy ? "Sprawdzam…" : doc ? "Sprawdź ponownie" : "Sprawdź uprawnienie"}
    </button>
  );

  const facts = doc && (checkedLabel || validLabel) && (
    <div className={variant === "patient" ? "mt-1 space-y-0.5 text-right" : "mb-2 space-y-0.5"}>
      {checkedLabel && (
        <p className="text-[11px] text-gray-500">Zweryfikowano: {checkedLabel}</p>
      )}
      {validLabel && (
        <p className="text-[11px] text-gray-500">Ważne do: {validLabel}</p>
      )}
    </div>
  );

  if (variant === "patient") {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">Status NFZ (eWUŚ):</span>
          <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {facts}
        {!hasPesel && (
          <p className="mt-1 text-[11px] text-amber-700">Brak PESEL blokuje tylko sprawdzenie, nie opiekę.</p>
        )}
        {(doc?.status === "not_confirmed" || doc?.status === "unavailable") && (
          <p className="mt-1 text-[11px] text-gray-500">Kontynuuj opiekę. To nie jest decyzja prawna NFZ.</p>
        )}
        <div className="mt-1.5 flex justify-end">{action}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-800">Status NFZ (eWUŚ)</h4>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      {facts}
      {!hasPesel && (
        <p className="text-xs text-amber-700 mb-2">Brak PESEL blokuje tylko sprawdzenie, nie opiekę.</p>
      )}
      {(doc?.status === "not_confirmed" || doc?.status === "unavailable") && (
        <p className="text-xs text-gray-600 mb-2">Kontynuuj opiekę. To nie jest decyzja prawna NFZ.</p>
      )}
      {action}
    </div>
  );
};

export default EwusStatusCard;
