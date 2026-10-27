import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { SERVICE_LABELS, STATUS_LABELS, accessCodeOf } from "./ehealthStatus";

const shell = "fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4";

/** In-app preview of the document printout (PDF or HTML from P1). */
export function DocumentPreviewModal({ doc, onClose }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setSrc("");
    setError("");
    ehealthHelper
      .fetchDocumentBlob(doc.service, doc.id, { purpose: "preview" })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) URL.revokeObjectURL(objectUrl);
        else setSrc(objectUrl);
      })
      .catch((err) => !cancelled && setError(unwrapEhealthError(err).message || err.message));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, doc.service]);

  return (
    <div className={shell}>
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-bold">Podgląd: {SERVICE_LABELS[doc.service] || doc.service}</h3>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 bg-slate-100 p-2">
          {error ? (
            <p className="p-4 text-sm text-red-700">{error}</p>
          ) : !src ? (
            <p className="p-4 text-sm text-slate-500">Ładowanie podglądu…</p>
          ) : (
            <iframe title="Podgląd dokumentu" src={src} className="h-full w-full rounded-lg border-0 bg-white" />
          )}
        </div>
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <button type="button" onClick={() => ehealthHelper.printDocument(doc.service, doc.id).catch(() => {})} className="rounded-lg border px-3 py-1.5 text-sm">Drukuj</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white">Zamknij</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[170px_1fr] gap-2 border-b border-slate-100 py-1.5 text-xs">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="break-all font-mono text-slate-900">{String(value)}</span>
    </div>
  );
}

/** All technical data and parameters of a document. */
export function DocumentDetailsModal({ doc, onClose }) {
  const when = (value) => (value ? new Date(value).toLocaleString("pl-PL") : "");
  const refs = doc.payload?.refs || {};
  return (
    <div className={shell}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-bold">Szczegóły techniczne: {SERVICE_LABELS[doc.service] || doc.service}</h3>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <Row label="ID dokumentu (CM7MED)" value={doc.id} />
          <Row label="Numer dokumentu w P1" value={doc.externalId} />
          <Row label="PIN / kod dostępu" value={accessCodeOf(doc)} />
          <Row label="Status" value={`${STATUS_LABELS[doc.status] || doc.status} (${doc.status})`} />
          <Row label="ID wizyty" value={doc.visitId} />
          <Row label="ID pacjenta" value={doc.patientId} />
          <Row label="ID lekarza" value={doc.doctorId} />
          <Row label="Utworzono" value={when(doc.createdAt)} />
          <Row label="Zmieniono" value={when(doc.updatedAt)} />
          <Row label="Klucz pakietu recept" value={refs.packageKey} />
          <Row label="Seria e-ZLA" value={refs.ezlaSeries} />
          <Row label="Numer e-ZLA" value={refs.ezlaNumber} />
          <Row label="ID skierowania" value={refs.referralId} />
          <Row label="Tryb P1" value={doc.payload?.sandboxOnly === undefined ? "" : doc.payload.sandboxOnly ? "sandbox (testowy)" : "produkcyjny"} />
          {doc.error?.message && <Row label="Błąd" value={`${doc.error.code ? `${doc.error.code}: ` : ""}${doc.error.message}`} />}
          <h4 className="mb-1 mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Dane wysłane do P1 (payload)</h4>
          <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{JSON.stringify(doc.payload || {}, null, 2)}</pre>
        </div>
        <div className="flex justify-end border-t px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white">Zamknij</button>
        </div>
      </div>
    </div>
  );
}
