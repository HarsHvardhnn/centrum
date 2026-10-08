import React, { useEffect, useState } from "react";
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

const EhealthVisitDocuments = ({ visitId, patientId, refreshKey = 0, onCopy }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [patientRows, setPatientRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    if (!visitId && !patientId) return;
    try {
      setLoading(true);
      const res = await ehealthHelper.history({
        visitId: visitId || undefined,
        patientId: patientId || undefined,
      });
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setRows(res.data || []);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientHistory = async () => {
    if (!patientId) {
      setPatientRows([]);
      return;
    }
    try {
      setHistoryLoading(true);
      const res = await ehealthHelper.history({ patientId });
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setPatientRows(res.data || []);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [visitId, patientId, refreshKey]);

  useEffect(() => {
    if (!historyOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setHistoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [historyOpen]);

  const run = async (id, fn, okMessage) => {
    try {
      setBusyId(id);
      await fn();
      if (okMessage) toast.success(okMessage);
      await load();
      if (historyOpen) await loadPatientHistory();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Dokumenty e-zdrowie tej wizyty</h4>
        <button
          type="button"
          onClick={() => {
            setHistoryOpen(true);
            loadPatientHistory();
          }}
          className="text-xs text-teal-700 hover:underline"
        >
          Pełna historia
        </button>
      </div>
      {loading ? (
        <div className="text-xs text-gray-500">Ładowanie…</div>
      ) : rows.length === 0 ? (
        <div className="text-xs text-gray-400">Brak dokumentów. Wystaw e-receptę, skierowanie lub e-ZLA.</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const busy = busyId === row.id;
            return (
              <li key={row.id} className="border border-gray-100 rounded-lg p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {SERVICE_LABELS[row.service] || row.service}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleString("pl-PL") : "—"}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusClass(row.status)}`}>
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </div>
                {accessCodeOf(row) && (
                  <div className="text-xs mt-1">
                    Kod: <span className="font-mono">{accessCodeOf(row)}</span>
                  </div>
                )}
                {row.error?.message && row.status !== "draft" && (
                  <div className="text-xs text-red-700 mt-1">{row.error.message}</div>
                )}
                {row.status === "draft" && row.error?.message && (
                  <div className="text-xs text-amber-800 mt-1">{row.error.message}</div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {onCopy && row.service !== "eligibility" && (
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] border rounded"
                      onClick={() => onCopy(row)}
                    >
                      Kopiuj
                    </button>
                  )}
                  {canRetry(row) && (
                    <button
                      type="button"
                      disabled={busy}
                      className="px-2 py-1 text-[11px] border border-teal-700 text-teal-700 rounded"
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
                      className="px-2 py-1 text-[11px] border rounded"
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
                      className="px-2 py-1 text-[11px] border border-red-300 text-red-700 rounded"
                      onClick={() => {
                        if (!window.confirm("Anulować ten dokument?")) return;
                        run(
                          row.id,
                          () => ehealthHelper.cancelDocument(row.service, row.id),
                          "Anulowano"
                        );
                      }}
                    >
                      Anuluj
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {historyOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ehealth-patient-history-title"
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b">
              <div>
                <h2 id="ehealth-patient-history-title" className="text-lg font-semibold text-gray-900">
                  Historia dokumentów e-zdrowie
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Dokumenty wystawione temu pacjentowi. Konsultacja pozostaje otwarta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Zamknij
              </button>
            </div>
            <div className="overflow-auto p-4">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left p-3">Typ</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Czas</th>
                      <th className="text-left p-3">Kod / id</th>
                      <th className="text-left p-3">Błąd</th>
                      <th className="text-left p-3">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400">
                          Brak dokumentów tego pacjenta.
                        </td>
                      </tr>
                    )}
                    {patientRows.map((row) => {
                      const busy = busyId === row.id;
                      return (
                        <tr key={row.id} className="border-t align-top">
                          <td className="p-3">{SERVICE_LABELS[row.service] || row.service}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
                              {STATUS_LABELS[row.status] || row.status}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {row.updatedAt ? new Date(row.updatedAt).toLocaleString("pl-PL") : "—"}
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {accessCodeOf(row) || row.externalId || "—"}
                          </td>
                          <td className="p-3 text-xs text-red-700 max-w-xs">
                            {row.status === "draft" ? row.error?.message || "" : row.error?.message || "—"}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
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
                                    run(
                                      row.id,
                                      () => ehealthHelper.cancelDocument(row.service, row.id),
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EhealthVisitDocuments;
