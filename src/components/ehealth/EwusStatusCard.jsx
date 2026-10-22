import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { NFZ_BRANCHES } from "./eReferralCatalog";

export function formatValidUntil(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Warsaw",
  }).format(date);
  if (warsawDay(date) === warsawDay(new Date())) return `dziś, ${time}`;
  const [year, month, day] = warsawDay(date).split("-");
  return `${day}.${month}.${year}, ${time}`;
}

export function branchLabel(code) {
  if (!code) return "";
  return NFZ_BRANCHES.find((branch) => branch.code === code)?.label || code;
}

const DIALOG_BANNER = {
  confirmed: {
    className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    tag: "bg-emerald-700 text-white",
    code: "CWNFZ",
    title: "ŚWIADCZENIOBIORCA POSIADA PRAWO DO ŚWIADCZEŃ",
    text: "Potwierdzone uprawnienie do świadczeń finansowanych ze środków publicznych (CWNFZ).",
  },
  not_confirmed: {
    className: "bg-red-50 border-red-200 text-red-900",
    tag: "bg-red-700 text-white",
    code: "DNZ",
    title: "BRAK POTWIERDZENIA UPRAWNIEŃ DO ŚWIADCZEŃ",
    text: "Kontynuuj opiekę. To nie jest decyzja prawna NFZ.",
  },
  fallback: {
    className: "bg-amber-50 border-amber-200 text-amber-900",
    tag: "bg-amber-600 text-white",
    code: "—",
    title: "STATUS UPRAWNIEŃ NIEPOTWIERDZONY",
    text: "Sprawdź uprawnienie ponownie. Kontynuuj opiekę.",
  },
};

function DetailCard({ label, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="mt-1 text-sm text-gray-900 space-y-0.5">{children}</div>
    </div>
  );
}

function EwusDetailsDialog({ doc, badge, patientName, pesel, busy, onRecheck, onClose }) {
  const payload = doc?.payload || {};
  const banner = DIALOG_BANNER[doc?.status] || DIALOG_BANNER.fallback;
  const branchCode = payload.nfzBranch;
  const branchText = branchLabel(branchCode);
  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="ewus-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] opacity-80">NFZ · eWUŚ · Elektroniczna Weryfikacja Uprawnień</div>
            <h3 id="ewus-details-title" className="text-base font-bold mt-0.5">Uprawnienia pacjenta do świadczeń NFZ</h3>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 text-xl leading-none" aria-label="Zamknij">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className={`rounded-xl border p-4 ${banner.className}`}>
            <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${banner.tag}`}>KOD: {banner.code}</span>
            <div className="mt-2 text-sm font-bold">{banner.title}</div>
            <p className="mt-1 text-xs">{banner.text}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Dane techniczne operacji eWUŚ &amp; weryfikacja NFZ</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailCard label="Dane pacjenta">
                <div className="font-bold">{patientName || "—"}</div>
                <div className="text-xs">PESEL: {pesel || "—"}</div>
              </DetailCard>
              <DetailCard label="Oddział Wojewódzki NFZ">
                <div className="font-bold">{branchText || "—"}</div>
                {branchCode && <div className="text-xs text-gray-600">kod adresata: {branchCode}</div>}
              </DetailCard>
              <DetailCard label="Identyfikator operacji eWUŚ">
                <div className="font-bold break-all">{doc?.externalId || "—"}</div>
                <div className="text-xs text-gray-600">Kod zwrotu: {banner.code}</div>
              </DetailCard>
              <DetailCard label="Ważność i historia weryfikacji">
                <div className="font-bold">Ważne do: {formatValidUntil(payload.validUntil) || "—"}</div>
                <div className="text-xs text-gray-600">Sprawdzono: {formatChecked(payload.checkedAt || doc?.createdAt) || "—"}</div>
              </DetailCard>
            </div>
          </div>
          {doc?.error?.message && <p className="text-xs text-amber-700">{doc.error.message}</p>}
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between gap-2">
          <button type="button" disabled={busy} onClick={onRecheck} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 disabled:opacity-50">
            {busy ? "Sprawdzam…" : "Ponów sprawdzenie w eWUŚ"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-semibold">Zamknij</button>
        </div>
      </div>
    </div>
  );
}

function warsawDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatChecked(iso) {
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

export function badgeFor(doc) {
  const status = doc?.status || "not_checked";
  const validUntil = doc?.payload?.validUntil ? new Date(doc.payload.validUntil) : null;
  const expired = validUntil && !Number.isNaN(validUntil.getTime()) && validUntil.getTime() < Date.now();
  if (status === "confirmed" && expired) {
    return { label: "Wygasło", className: "bg-amber-100 text-amber-800" };
  }
  if (status === "confirmed") return { label: "Uprawniony (CWNFZ)", className: "bg-emerald-100 text-emerald-800" };
  if (status === "not_confirmed") return { label: "Brak uprawnień (DNZ)", className: "bg-red-100 text-red-800" };
  if (status === "unavailable") return { label: "Niedostępne", className: "bg-amber-100 text-amber-800" };
  if (status === "needs_recheck") return { label: "Wymaga sprawdzenia", className: "bg-amber-100 text-amber-800" };
  return { label: "Nie sprawdzono", className: "bg-gray-100 text-gray-600" };
}

const EwusStatusCard = ({ pesel, patientId, patientName, visitId, compact = false, variant = "card" }) => {
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
        <p className="text-[11px] text-gray-500">Sprawdzono: {checkedLabel}</p>
      )}
      {validLabel && (
        <p className="text-[11px] text-gray-500">Ważne do: {validLabel}</p>
      )}
    </div>
  );

  if (variant === "patient") {
    const branch = branchLabel(doc?.payload?.nfzBranch);
    const validShown = formatValidUntil(validUntil);
    return (
      <div className={`mt-4 rounded-lg border p-3 ${doc?.status === "confirmed" ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50/60"}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">Status NFZ (eWUŚ)</span>
          <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {doc && (branch || checkedLabel || validShown) && (
          <dl className="mt-2 space-y-1 text-xs">
            {branch && (
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Oddział NFZ</dt><dd className="font-medium text-gray-800 text-right">{branch}</dd></div>
            )}
            {checkedLabel && (
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Data sprawdzenia</dt><dd className="font-medium text-gray-800 text-right">Sprawdzono: {checkedLabel}</dd></div>
            )}
            {validShown && (
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Ważność uprawnień</dt><dd className="font-medium text-emerald-700 text-right">Ważne do: {validShown}</dd></div>
            )}
          </dl>
        )}
        {!hasPesel && (
          <p className="mt-1 text-[11px] text-amber-700">Brak PESEL blokuje tylko sprawdzenie, nie opiekę.</p>
        )}
        {(doc?.status === "not_confirmed" || doc?.status === "unavailable") && (
          <p className="mt-1 text-[11px] text-gray-500">Kontynuuj opiekę. To nie jest decyzja prawna NFZ.</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => check(doc ? "recheck" : "manual")}
            className="flex-1 whitespace-nowrap px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold disabled:opacity-50"
          >
            {busy ? "Sprawdzam…" : doc ? "Zweryfikuj ponownie" : "Sprawdź uprawnienie"}
          </button>
          {doc && (
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[#0D5C46] text-xs font-semibold"
            >
              Szczegóły
            </button>
          )}
        </div>
        {detailsOpen && (
          <EwusDetailsDialog
            doc={doc}
            badge={badge}
            patientName={patientName}
            pesel={pesel}
            busy={busy}
            onRecheck={() => check("recheck")}
            onClose={() => setDetailsOpen(false)}
          />
        )}
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
