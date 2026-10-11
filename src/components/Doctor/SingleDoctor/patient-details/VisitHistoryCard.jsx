import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { translateStatus, getStatusStyle, getVisitTypeDisplayLabel } from "../../../../utils/statusHelper";
import { isRadiologistAppointment } from "../../../../utils/radiologistVisitHelper";
import ehealthHelper, { unwrapEhealthError } from "../../../../helpers/ehealthHelper";
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  statusClass,
  canRetry,
  canCancel,
  canPrint,
  accessCodeOf,
} from "../../../ehealth/ehealthStatus";

const ISSUED = new Set(["prescription", "referral", "ezla"]);

function documentCountLabel(count) {
  if (count === 1) return "1 dokument";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} dokumenty`;
  return `${count} dokumentów`;
}

const VisitHistoryCard = ({
  appointments,
  currentAppointmentId,
  onSelectVisit,
  patientId,
  refreshKey = 0,
  onCopy,
}) => {
  const [documents, setDocuments] = useState([]);
  const [openVisitId, setOpenVisitId] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadDocuments = async () => {
    if (!patientId) {
      setDocuments([]);
      return;
    }
    try {
      const res = await ehealthHelper.history({ patientId });
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [patientId, refreshKey]);

  const byVisit = useMemo(() => {
    const map = new Map();
    for (const row of documents) {
      if (!ISSUED.has(row.service) || !row.visitId) continue;
      const key = String(row.visitId);
      const list = map.get(key) || [];
      list.push(row);
      map.set(key, list);
    }
    return map;
  }, [documents]);

  const run = async (id, fn, okMessage) => {
    try {
      setBusyId(id);
      await fn();
      if (okMessage) toast.success(okMessage);
      await loadDocuments();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusyId("");
    }
  };

  const rows = appointments || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Historia wizyt</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">Brak wizyt</p>
      ) : (
        <div className="space-y-2">
          {rows.map((apt) => {
            const visitId = String(apt._id || apt.id || "");
            const isSelected = String(currentAppointmentId || "") === visitId;
            const docs = byVisit.get(visitId) || [];
            const open = openVisitId === visitId;
            return (
              <div
                key={visitId}
                className={`rounded-lg border transition-colors ${
                  isSelected
                    ? "border-teal-400 bg-teal-50/80 shadow-sm"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex items-start gap-2 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onSelectVisit?.(apt._id || apt.id)}
                    className="min-w-0 flex-1 text-left rounded-md hover:bg-white/60"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.date).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{getVisitTypeDisplayLabel(apt)}</p>
                    {apt.visitTypeVerified === false &&
                      !isRadiologistAppointment(apt) &&
                      apt.status !== "completed" &&
                      apt.status !== "Completed" && (
                        <span className="inline-block mt-1 text-xs text-amber-700">Do weryfikacji</span>
                      )}
                  </button>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(apt.status)}`}>
                      {translateStatus(apt.status)}
                    </span>
                    {docs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOpenVisitId(open ? "" : visitId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-teal-800 bg-white border border-teal-200 hover:bg-teal-50"
                        aria-expanded={open}
                      >
                        {documentCountLabel(docs.length)}
                        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                </div>
                {open && (
                  <ul className="mx-3 mb-3 max-h-52 overflow-y-auto space-y-1.5">
                    {docs.map((row) => {
                      const busy = busyId === row.id;
                      return (
                        <li key={row.id} className="rounded-md border border-gray-100 bg-white px-2.5 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-800">
                                {SERVICE_LABELS[row.service] || row.service}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {row.updatedAt ? new Date(row.updatedAt).toLocaleString("pl-PL") : "—"}
                                {accessCodeOf(row) ? ` · ${accessCodeOf(row)}` : ""}
                              </p>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusClass(row.status)}`}>
                              {STATUS_LABELS[row.status] || row.status}
                            </span>
                          </div>
                          {row.error?.message && (
                            <p className={`text-[11px] mt-1 ${row.status === "draft" ? "text-amber-800" : "text-red-700"}`}>
                              {row.error.message}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {onCopy && (
                              <button type="button" className="px-2 py-0.5 text-[11px] border rounded" onClick={() => onCopy(row)}>
                                Kopiuj
                              </button>
                            )}
                            {canRetry(row) && (
                              <button
                                type="button"
                                disabled={busy}
                                className="px-2 py-0.5 text-[11px] border border-teal-700 text-teal-700 rounded disabled:opacity-50"
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
                                className="px-2 py-0.5 text-[11px] border rounded disabled:opacity-50"
                                onClick={() => run(row.id, () => ehealthHelper.previewDocument(row.service, row.id))}
                              >
                                Podgląd
                              </button>
                            )}
                            {canPrint(row) && (
                              <button
                                type="button"
                                disabled={busy}
                                className="px-2 py-0.5 text-[11px] border rounded disabled:opacity-50"
                                onClick={() => run(row.id, () => ehealthHelper.printDocument(row.service, row.id))}
                              >
                                Drukuj
                              </button>
                            )}
                            {canCancel(row) && (
                              <button
                                type="button"
                                disabled={busy}
                                className="px-2 py-0.5 text-[11px] border border-red-300 text-red-700 rounded disabled:opacity-50"
                                onClick={() => {
                                  if (!window.confirm("Anulować ten dokument?")) return;
                                  run(row.id, () => ehealthHelper.cancelDocument(row.service, row.id), "Anulowano");
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
          })}
        </div>
      )}
    </div>
  );
};

export default VisitHistoryCard;
