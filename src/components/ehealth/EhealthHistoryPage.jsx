import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import EhealthDocumentPanel from "./EhealthDocumentPanel";
import { DocumentPreviewModal, DocumentDetailsModal } from "./EhealthDocumentModals";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  statusClass,
  canRetry,
  canCancel,
  canPrint,
  accessCodeOf,
} from "./ehealthStatus";

const EhealthHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const [visitId, setVisitId] = useState(searchParams.get("visitId") || "");
  const [patientId, setPatientId] = useState(searchParams.get("patientId") || "");
  const [service, setService] = useState(searchParams.get("service") || "");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [mine, setMine] = useState(false);
  const [copy, setCopy] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await ehealthHelper.history({
        visitId: visitId || undefined,
        patientId: patientId || undefined,
        service: service || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        q: q || undefined,
        mine: mine ? "1" : undefined,
      });
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setRows(res.data || []);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (id, fn, okMessage) => {
    try {
      setBusyId(id);
      await fn();
      if (okMessage) toast.success(okMessage);
      await load();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-2">Historia e-Zdrowie</h1>
      <p className="text-sm text-gray-500 mb-6">
        Dokumenty z CM7MED. Filtr po wizycie lub pacjencie.
      </p>

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={visitId}
          onChange={(e) => setVisitId(e.target.value)}
          placeholder="ID wizyty"
          className="p-2 border rounded-lg text-sm"
        />
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="ID pacjenta"
          className="p-2 border rounded-lg text-sm"
        />
        <select value={service} onChange={(e) => setService(e.target.value)} className="p-2 border rounded-lg text-sm">
          <option value="">Wszystkie usługi</option>
          <option value="prescription">e-Recepta</option>
          <option value="referral">e-Skierowanie</option>
          <option value="ezla">e-ZLA</option>
          <option value="eligibility">eWUŚ</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded-lg text-sm">
          <option value="">Wszystkie statusy</option>
          <option value="action">Szkice / do działania</option>
          <option value="failed">Błędy / retry</option>
          <option value="issued">Wystawione</option>
          <option value="cancelled">Anulowane</option>
          <option value="draft">Sprawdzone</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 border rounded-lg text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="p-2 border rounded-lg text-sm" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lek, kod, rozpoznanie" className="p-2 border rounded-lg text-sm" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
          Moje
        </label>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
        >
          Filtruj
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-3">Dokument</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Czas</th>
                <th className="text-left p-3">PIN / kod dostępu</th>
                <th className="text-left p-3">Błąd</th>
                <th className="text-left p-3">Podgląd</th>
                <th className="text-left p-3">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    Brak dokumentów. Wystaw je z karty wizyty.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const busy = busyId === row.id;
                return (
                  <tr key={row.id} className="border-t align-top">
                    <td className="p-3">
                      <div>{SERVICE_LABELS[row.service] || row.service}</div>
                      {row.externalId ? <div className="mt-0.5 font-mono text-[11px] text-slate-500 break-all" title="Unikalny numer dokumentu w P1">{row.externalId}</div> : null}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleString("pl-PL") : "—"}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {accessCodeOf(row) ? (
                        <span className="text-sm font-bold tracking-widest text-slate-900" title="PIN, którego pacjent używa np. w aptece">{accessCodeOf(row)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-red-700 max-w-xs">
                      {row.status === "draft" ? "" : row.error?.message || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-1 text-xs">
                        {canPrint(row) && (
                          <button type="button" className="text-teal-700 hover:underline" onClick={() => setPreviewDoc(row)}>
                            Podgląd PDF
                          </button>
                        )}
                        <button type="button" className="text-teal-700 hover:underline" onClick={() => setDetailsDoc(row)}>
                          Szczegóły techniczne
                        </button>
                        {row.visitId ? (
                          <Link
                            className="text-teal-700 hover:underline"
                            to={`/szczegoly-pacjenta/${row.patientId || ""}?appointmentId=${row.visitId}&ehealthDoc=${row.id}`}
                          >
                            Przejdź do wizyty i dokumentu
                          </Link>
                        ) : (
                          <span className="text-slate-400">Brak wizyty</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {row.service !== "eligibility" && row.visitId && row.patientId && (
                          <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => setCopy(row)}>
                            Kopiuj jako szkic
                          </button>
                        )}
                        {canRetry(row) && (
                          <button
                            type="button"
                            disabled={busy}
                            className="px-2 py-1 text-xs border border-teal-700 text-teal-700 rounded"
                            onClick={() =>
                              run(
                                row.id,
                                async () => {
                                  if (row.service === "prescription") await ehealthHelper.retryPrescription(row.id);
                                  else if (row.service === "referral") await ehealthHelper.retryReferral(row.id);
                                  else await ehealthHelper.retryEzla(row.id);
                                },
                                "Ponowiono"
                              )
                            }
                          >
                            Ponów
                          </button>
                        )}
                        {canPrint(row) && (
                          <button
                            type="button"
                            disabled={busy}
                            className="px-2 py-1 text-xs border rounded"
                            onClick={() =>
                              run(row.id, () => ehealthHelper.printDocument(row.service, row.id))
                            }
                          >
                            Drukuj
                          </button>
                        )}
                        {canCancel(row) && (
                          <button
                            type="button"
                            disabled={busy}
                            className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded"
                            onClick={() => {
                              if (!window.confirm("Anulować ten dokument?")) return;
                              const reason = row.service === "prescription" ? window.prompt("Powód anulowania e-recepty (co najmniej 5 znaków)") : "I";
                              if (row.service === "prescription" && (!reason || reason.trim().length < 5)) return;
                              run(
                                row.id,
                                () => ehealthHelper.cancelDocument(row.service, row.id, reason.trim()),
                                "Anulowano"
                              );
                            }}
                          >
                            Anuluj
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      {detailsDoc && <DocumentDetailsModal doc={detailsDoc} onClose={() => setDetailsDoc(null)} />}
      <EhealthDocumentPanel
        open={Boolean(copy)}
        onClose={() => setCopy(null)}
        service={copy?.service || "prescription"}
        visitId={copy?.visitId}
        patientId={copy?.patientId}
        initialPayload={copy?.payload}
        onDocumentsChanged={load}
      />
    </div>
  );
};

export default EhealthHistoryPage;
