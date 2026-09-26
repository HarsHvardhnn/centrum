import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const EhealthVisitDocuments = ({ visitId, patientId, refreshKey = 0 }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");

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

  useEffect(() => {
    load();
  }, [visitId, patientId, refreshKey]);

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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Dokumenty e-zdrowie tej wizyty</h4>
        <Link
          to={`/e-zdrowie?visitId=${encodeURIComponent(visitId || "")}&patientId=${encodeURIComponent(patientId || "")}`}
          className="text-xs text-teal-700 hover:underline"
        >
          Pełna historia
        </Link>
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
    </div>
  );
};

export default EhealthVisitDocuments;
