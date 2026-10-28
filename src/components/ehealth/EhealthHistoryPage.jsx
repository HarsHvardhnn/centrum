import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import EhealthDocumentPanel from "./EhealthDocumentPanel";
import { DocumentPreviewModal, DocumentDetailsModal } from "./EhealthDocumentModals";
import { DocumentAccessModal, AuditLogModal } from "./EhealthShareAndAuditModals";
import { useUser } from "../../context/userContext";
import clinicFlowHelper from "../../helpers/clinicFlowHelper";
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

const EMPTY_FILTERS = {
  patient: "", service: "", status: "", visitFrom: "", visitTo: "", visitType: "", visitDoctorId: "",
  from: "", to: "", drug: "", icd10: "", pin: "", documentNumber: "", text: "", mine: false,
};

const EhealthHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    service: searchParams.get("service") || "",
  });
  const visitId = searchParams.get("visitId") || "";
  const patientId = searchParams.get("patientId") || "";
  const [copy, setCopy] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [accessDoc, setAccessDoc] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [drugHits, setDrugHits] = useState([]);
  const requestRef = useRef(0);

  const patch = (partial) => setFilters((prev) => ({ ...prev, ...partial }));

  const load = async (current = filters) => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      const res = await ehealthHelper.history({
        ...current,
        visitId: visitId || undefined,
        patientId: patientId || undefined,
        mine: current.mine ? "1" : undefined,
      });
      if (requestId !== requestRef.current) return;
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setRows(res.data || []);
    } catch (err) {
      if (requestId === requestRef.current) toast.error(unwrapEhealthError(err).message);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  // Live filtering: results follow the fields, no "Filtruj" button.
  useEffect(() => {
    const timer = setTimeout(() => load(filters), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (!isAdmin) return;
    clinicFlowHelper.doctors().then((list) => setDoctors(Array.isArray(list) ? list : [])).catch(() => setDoctors([]));
  }, [isAdmin]);

  // Drug picker: choose a specific medicine from the drug database.
  useEffect(() => {
    const term = filters.drug.trim();
    if (term.length < 3) {
      setDrugHits([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      ehealthHelper.searchDrugs(term).then((res) => {
        if (!cancelled) setDrugHits((Array.isArray(res?.data) ? res.data : []).slice(0, 8));
      }).catch(() => !cancelled && setDrugHits([]));
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [filters.drug]);

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

  const field = "p-2 border rounded-lg text-sm bg-white";
  const label = "block text-[11px] font-semibold text-gray-500 mb-1";

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-teal-700 mb-1">Historia e-Zdrowie</h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? "Dokumenty P1 wszystkich lekarzy." : "Twoje dokumenty P1 oraz dokumenty udostępnione Ci przez innych lekarzy."}
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setAuditOpen(true)} className="rounded-lg border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
            Dziennik zdarzeń P1
          </button>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 space-y-4">
        <input
          value={filters.patient}
          onChange={(e) => patch({ patient: e.target.value })}
          placeholder="Szukaj pacjenta: imię, nazwisko lub PESEL"
          className={`${field} w-full`}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <span className={label}>Usługa</span>
            <select value={filters.service} onChange={(e) => patch({ service: e.target.value })} className={`${field} w-full`}>
              <option value="">Wszystkie usługi</option>
              <option value="prescription">e-Recepta</option>
              <option value="referral">e-Skierowanie</option>
              <option value="ezla">e-ZLA</option>
              <option value="eligibility">eWUŚ</option>
            </select>
          </div>
          <div>
            <span className={label}>Status</span>
            <select value={filters.status} onChange={(e) => patch({ status: e.target.value })} className={`${field} w-full`}>
              <option value="">Wszystkie statusy</option>
              <option value="action">Szkice / do działania</option>
              <option value="failed">Błędy / retry</option>
              <option value="issued">Wystawione</option>
              <option value="cancelled">Anulowane</option>
              <option value="draft">Sprawdzone</option>
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
            <input type="checkbox" checked={filters.mine} onChange={(e) => patch({ mine: e.target.checked })} />
            Tylko wystawione przeze mnie
          </label>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Wizyta</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div><span className={label}>Data wizyty od</span><input type="date" value={filters.visitFrom} onChange={(e) => patch({ visitFrom: e.target.value })} className={`${field} w-full`} /></div>
            <div><span className={label}>Data wizyty do</span><input type="date" value={filters.visitTo} onChange={(e) => patch({ visitTo: e.target.value })} className={`${field} w-full`} /></div>
            <div><span className={label}>Rodzaj wizyty</span><input value={filters.visitType} onChange={(e) => patch({ visitType: e.target.value })} placeholder="np. Konsultacja lekarska" className={`${field} w-full`} /></div>
            {isAdmin && (
              <div>
                <span className={label}>Lekarz prowadzący wizytę</span>
                <select value={filters.visitDoctorId} onChange={(e) => patch({ visitDoctorId: e.target.value })} className={`${field} w-full`}>
                  <option value="">Wszyscy lekarze</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Dokument</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div><span className={label}>Data wystawienia od</span><input type="date" value={filters.from} onChange={(e) => patch({ from: e.target.value })} className={`${field} w-full`} /></div>
            <div><span className={label}>Data wystawienia do</span><input type="date" value={filters.to} onChange={(e) => patch({ to: e.target.value })} className={`${field} w-full`} /></div>
            <div className="relative">
              <span className={label}>Lek (baza leków)</span>
              <input value={filters.drug} onChange={(e) => patch({ drug: e.target.value })} placeholder="np. Medikinet, pantoprazol" className={`${field} w-full`} />
              {drugHits.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-white text-sm shadow-lg">
                  {drugHits.map((hit, index) => (
                    <li key={`${hit.name}-${index}`}>
                      <button type="button" onClick={() => { patch({ drug: hit.name }); setDrugHits([]); }} className="block w-full px-3 py-1.5 text-left hover:bg-teal-50">
                        {hit.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div><span className={label}>Rozpoznanie ICD-10 dokumentu</span><input value={filters.icd10} onChange={(e) => patch({ icd10: e.target.value })} placeholder="kod, np. K21" className={`${field} w-full`} /></div>
            <div><span className={label}>PIN / kod dostępu</span><input value={filters.pin} onChange={(e) => patch({ pin: e.target.value })} className={`${field} w-full`} /></div>
            <div><span className={label}>Numer dokumentu w P1</span><input value={filters.documentNumber} onChange={(e) => patch({ documentNumber: e.target.value })} className={`${field} w-full`} /></div>
            <div className="md:col-span-2"><span className={label}>Szukaj w treści dokumentu</span><input value={filters.text} onChange={(e) => patch({ text: e.target.value })} className={`${field} w-full`} /></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => setFilters({ ...EMPTY_FILTERS })} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
            Wyczyść filtry
          </button>
        </div>
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
                      <div className="font-medium">{SERVICE_LABELS[row.service] || row.service}</div>
                      {row.externalId
                        ? <div className="font-mono text-[11px] text-slate-600 break-all" title="Unikalny numer dokumentu w P1">{row.externalId}</div>
                        : <div className="text-[11px] italic text-slate-400" title="P1 nie nadał numeru (dokument nie został przyjęty)">brak numeru P1</div>}
                      {row.patientName ? <div className="text-xs text-gray-700">{row.patientName}{row.patientPesel ? ` · ${row.patientPesel}` : ""}</div> : null}
                      {row.visitDate ? (
                        <div className="text-[11px] text-gray-500">
                          Wizyta {new Date(row.visitDate).toLocaleDateString("pl-PL")}{row.visitStartTime ? ` ${row.visitStartTime}` : ""}
                          {row.visitType ? ` · ${row.visitType}` : ""}{row.visitDoctorName ? ` · ${row.visitDoctorName}` : ""}
                        </div>
                      ) : null}
                      {!row.ownedByMe && row.doctorName ? <div className="text-[11px] text-amber-700">Udostępnione przez: {row.doctorName}</div> : null}
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
                        {(row.ownedByMe || isAdmin) && row.service !== "eligibility" && (
                          <button type="button" className="text-teal-700 hover:underline" onClick={() => setAccessDoc(row)}>
                            Dostęp{row.sharedWith?.length ? ` (${row.sharedWith.length})` : ""}
                          </button>
                        )}
                        {canPrint(row) && (
                          <button type="button" className="text-teal-700 hover:underline" onClick={() => setPreviewDoc(row)}>
                            Podgląd PDF
                          </button>
                        )}
                        <button type="button" className="text-teal-700 hover:underline" onClick={() => { ehealthHelper.logDocumentAction(row.id, "details"); setDetailsDoc(row); }}>
                          Szczegóły techniczne
                        </button>
                        {row.visitId ? (
                          <Link
                            onClick={() => ehealthHelper.logDocumentAction(row.id, "open_visit")}
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
      {accessDoc && <DocumentAccessModal doc={accessDoc} onClose={() => setAccessDoc(null)} onChanged={() => load()} />}
      {auditOpen && <AuditLogModal onClose={() => setAuditOpen(false)} />}
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
