import React from "react";
import { FileText, Printer, ShieldCheck, Trash2, AlertTriangle } from "lucide-react";
import { STATUS_LABELS } from "./ehealthStatus";
import { formatDateTime, formatPeriod } from "./ezlaFormat";

const INSTITUTIONS = { KRUS: "KRUS", INNE_W_POLSCE: "inny ubezpieczyciel w Polsce", W_INNYM_PANSTWIE: "ubezpieczyciel w innym państwie" };

/**
 * The window after an e-ZLA was sent. Everything shown comes from the saved document: a number, a date
 * or a delivery to the payer is stated only when it really exists.
 */
export default function EZlaIssuedView({ result, days, busy, onPreview, onPrint, onCancel }) {
  const payload = result.payload || {};
  const refs = payload.refs || {};
  const number = refs.ezlaNumber ? `${refs.ezlaSeries || ""} ${refs.ezlaNumber}`.trim() : "";
  const payer = Array.isArray(payload.payers) ? payload.payers[0] : null;
  const cancelled = result.status === "cancelled";
  const sent = (result.status === "submitted" || result.status === "issued") && !payload.sandboxOnly;
  const noPue = payer?.hasPue === false;
  const paper = sent && Boolean(payer) && (noPue || payload.doNotSend);

  const badge = cancelled
    ? { tone: "bg-rose-100 text-rose-800 border-rose-300", Icon: AlertTriangle, text: "Zaświadczenie zostało anulowane" }
    : !sent
      ? { tone: "bg-amber-100 text-amber-900 border-amber-300", Icon: AlertTriangle, text: payload.sandboxOnly ? "Dokument sprawdzony — nie wysłano do ZUS" : STATUS_LABELS[result.status] || result.status }
      : paper
        ? { tone: "bg-amber-100 text-amber-900 border-amber-300", Icon: Printer, text: noPue ? "Wysłano do ZUS · wymagany wydruk dla pracodawcy (brak profilu PUE)" : "Wysłano do ZUS · bez przekazania płatnikowi, wymagany wydruk" }
        : { tone: "bg-indigo-100 text-indigo-900 border-indigo-200", Icon: ShieldCheck, text: payer ? "Podpisano cyfrowo i przekazano na profil PUE płatnika" : "Podpisano cyfrowo i wysłano do ZUS" };

  const payerName = payer?.name || payer?.id;
  const payerId = payer?.id ? `${payer.type === "2" ? "PESEL" : payer.type === "3" ? "Paszport" : "NIP"}: ${payer.id}` : "";
  const hospital = payload.hospitalFrom && payload.hospitalTo ? formatPeriod(payload.hospitalFrom, payload.hospitalTo) : "";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className={`rounded-2xl border-2 p-6 text-center ${cancelled ? "border-rose-300 bg-rose-50" : "border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white"}`}>
        <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${badge.tone}`}>
          <badge.Icon size={15} />
          <span>{badge.text}</span>
        </div>
        <p className="text-xs font-medium text-slate-500">Elektroniczne Zaświadczenie Lekarskie (e-ZLA) — seria i numer:</p>
        {number ? (
          <div className={`my-3 inline-block rounded-2xl border-2 bg-white px-6 py-3 font-mono text-3xl font-black tracking-wider shadow-inner sm:text-4xl ${cancelled ? "border-rose-200 text-rose-700 line-through" : "border-indigo-300 text-indigo-950"}`}>
            {number}
          </div>
        ) : (
          <p className="my-3 text-sm font-semibold text-amber-800">
            {sent ? "Numer nie został jeszcze pobrany z ZUS. Pojawi się po ponownym otwarciu dokumentu." : result.error?.message || "Brak numeru ZUS."}
          </p>
        )}
        <p className="text-sm font-semibold text-slate-700">Data i godzina wystawienia: {formatDateTime(result.createdAt) || "—"}</p>
        <p className="mx-auto mt-2 max-w-lg text-xs font-medium leading-relaxed text-slate-600">
          {!payer ? (
            <>Ubezpieczenie: {INSTITUTIONS[payload.institution] || "ZUS"}. Płatnik składek nie jest wskazany.</>
          ) : paper || !sent ? (
            <>Płatnik składek: <strong className="text-slate-900">{payerName}</strong> ({payerId}).{paper ? " Pacjent musi dostarczyć pracodawcy podpisany wydruk zaświadczenia." : ""}</>
          ) : (
            <>Dokument został przekazany na profil płatnika składek: <strong className="text-slate-900">{payerName}</strong> ({payerId}). Pacjent nie musi dostarczać wydruku pracodawcy.</>
          )}
        </p>
        {cancelled && payload.cancellationReason && (
          <p className="mx-auto mt-3 max-w-md rounded-xl border border-rose-200 bg-white p-3 text-xs text-rose-800">Powód anulowania: {payload.cancellationReason}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={onPreview} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <FileText size={16} /> Otwórz podgląd (PDF)
        </button>
        <button type="button" onClick={onPrint} className={`flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 ${paper ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}>
          <Printer size={16} /> Wydrukuj zaświadczenie
        </button>
        <button type="button" disabled={busy || cancelled} onClick={onCancel} className="flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">
          <Trash2 size={16} /> {cancelled ? "Zwolnienie anulowane" : "Anuluj e-ZLA (Korekta)"}
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-xs">
        <h3 className="border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-800">Podsumowanie parametrów formalnych e-ZLA</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <span className="block text-slate-500">Okres niezdolności do pracy:</span>
            <strong className="font-mono text-sm text-slate-900">{formatPeriod(payload.from, payload.to) || "—"}</strong>
            <span className="mt-0.5 block text-[11px] text-slate-500">Łącznie dni: {days}</span>
          </div>
          <div>
            <span className="block text-slate-500">Wskazanie lekarskie:</span>
            <strong className="text-slate-900">{payload.suggestion === "1" ? "1 — Chory powinien leżeć" : "2 — Chory może chodzić"}</strong>
            <span className="mt-0.5 block text-[11px] text-slate-500">Pobyt w szpitalu: {hospital || "NIE"}</span>
          </div>
          <div>
            <span className="block text-slate-500">Rozpoznanie ICD-10:</span>
            <strong className="font-mono text-slate-900">{payload.icd10 || "—"}</strong>
            <span className="mt-0.5 block text-[11px] text-slate-500">{payload.icdName || ""}</span>
          </div>
        </div>
        {payload.familyMemberCode && (
          <p className="border-t border-slate-100 pt-2 text-slate-600">
            Opieka nad członkiem rodziny: {[payload.relationship, payload.familyName].filter(Boolean).join(", ")}
            {payload.familyMemberDate ? `, data urodzenia: ${String(payload.familyMemberDate).slice(0, 10)}` : ""}
          </p>
        )}
        {payload.issuingPlace?.name && <p className="text-slate-600">Miejsce udzielania świadczeń: {payload.issuingPlace.name}</p>}
      </div>
    </div>
  );
}
