import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { translateStatus, getVisitTypeDisplayLabel } from "../../../../utils/statusHelper";
import { isRadiologistAppointment } from "../../../../utils/radiologistVisitHelper";
import ehealthHelper, { unwrapEhealthError } from "../../../../helpers/ehealthHelper";
import clinicDocumentsHelper from "../../../../helpers/clinicDocumentsHelper";
import VisitDocumentsDrawer from "./VisitDocumentsDrawer";
import { documentsByVisit } from "./visitDocuments";

const isDone = (status) => String(status || "").toLowerCase() === "completed";

function statusLook(status) {
  const value = String(status || "").toLowerCase();
  if (value === "completed") return ["bg-emerald-50 text-emerald-700 border-emerald-200", "bg-emerald-500"];
  if (value.startsWith("cancel")) return ["bg-rose-50 text-rose-700 border-rose-200", "bg-rose-500"];
  return ["bg-blue-50 text-blue-700 border-blue-200", "bg-blue-500"];
}

function visitsLabel(count) {
  if (count === 1) return "1 wizyta";
  const mod10 = count % 10;
  const mod100 = count % 100;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? `${count} wizyty` : `${count} wizyt`;
}

const visitDate = (value) => new Date(value).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

const VisitHistoryCard = ({
  appointments,
  currentAppointmentId,
  onSelectVisit,
  patientId,
  patient,
  refreshKey = 0,
  onCopy,
}) => {
  const [sources, setSources] = useState({ ehealth: [], files: [], clinic: [] });
  const [loading, setLoading] = useState(false);
  const [openVisitId, setOpenVisitId] = useState("");

  const loadDocuments = async () => {
    if (!patientId) {
      setSources({ ehealth: [], files: [], clinic: [] });
      return;
    }
    setLoading(true);
    const [ehealth, own] = await Promise.allSettled([
      ehealthHelper.history({ patientId }),
      clinicDocumentsHelper.listForPatient(patientId),
    ]);
    if (ehealth.status === "rejected") toast.error(unwrapEhealthError(ehealth.reason).message);
    if (own.status === "rejected") toast.error(own.reason.message);
    setSources({
      ehealth: Array.isArray(ehealth.value?.data) ? ehealth.value.data : [],
      files: own.value?.files || [],
      clinic: own.value?.clinic || [],
    });
    setLoading(false);
  };

  // Reloaded when the drawer opens, so a visit card or file added a moment ago is already there.
  useEffect(() => {
    loadDocuments();
  }, [patientId, refreshKey, openVisitId]);

  const byVisit = useMemo(() => documentsByVisit(sources), [sources]);
  const rows = appointments || [];

  const describe = (apt) => {
    const [pill, dot] = statusLook(apt.status);
    return {
      id: String(apt._id || apt.id || ""),
      date: visitDate(apt.date),
      type: getVisitTypeDisplayLabel(apt),
      status: translateStatus(apt.status),
      statusClass: pill,
      statusDot: dot,
      unverified: apt.visitTypeVerified === false && !isRadiologistAppointment(apt) && !isDone(apt.status),
    };
  };

  const openApt = rows.find((apt) => String(apt._id || apt.id) === openVisitId);

  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historia wizyt</h3>
        <span className="text-xs text-slate-400">{visitsLabel(rows.length)}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-gray-500">Brak wizyt</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((apt) => {
            const visit = describe(apt);
            const selected = String(currentAppointmentId || "") === visit.id;
            const count = byVisit.get(visit.id)?.length || 0;
            return (
              <button
                type="button"
                key={visit.id}
                onClick={() => setOpenVisitId(visit.id)}
                title="Otwórz dokumenty wizyty"
                className={`group flex w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left shadow-sm transition-colors ${selected ? "border-teal-400 bg-teal-50/80" : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/80"}`}
              >
                <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">{visit.date}</span>
                    {visit.unverified && <span className="rounded border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">Do weryfikacji</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${visit.statusClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${visit.statusDot}`} />
                      {visit.status}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-200/60 bg-slate-100/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                      {count} dok.
                      <ChevronRight size={12} className="text-slate-400 group-hover:text-indigo-600" />
                    </span>
                  </span>
                </span>
                <span className="truncate text-xs text-slate-500">{visit.type}</span>
              </button>
            );
          })}
        </div>
      )}
      {openApt && (
        <VisitDocumentsDrawer
          key={openVisitId}
          visit={describe(openApt)}
          documents={byVisit.get(openVisitId) || []}
          loading={loading}
          patient={patient}
          onClose={() => setOpenVisitId("")}
          onCopy={onCopy}
          onOpenVisit={
            String(currentAppointmentId || "") === openVisitId
              ? undefined
              : () => {
                  onSelectVisit?.(openApt._id || openApt.id);
                  setOpenVisitId("");
                }
          }
        />
      )}
    </div>
  );
};

export default VisitHistoryCard;
