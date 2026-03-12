import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { translateStatus, getStatusStyle } from "../../../../utils/statusHelper";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import VisitReasonCascadeDropdown from "../../../UtilComponents/VisitReasonCascadeDropdown";
import { toast } from "sonner";

const VisitInfoHeader = ({
  appointment,
  consultationData,
  onDateChange,
  onTimeChange,
  onVisitTypeChange,
  readOnly = false,
}) => {
  const [visitReasonsCategories, setVisitReasonsCategories] = useState([]);
  const [savingVisitType, setSavingVisitType] = useState(false);

  useEffect(() => {
    let cancelled = false;
    appointmentHelper.getVisitReasons().then((res) => {
      if (cancelled) return;
      const data = res?.data ?? res;
      const categories = data?.categories ?? [];
      setVisitReasonsCategories(Array.isArray(categories) ? categories : []);
    }).catch(() => { if (!cancelled) setVisitReasonsCategories([]); });
    return () => { cancelled = true; };
  }, []);

  if (!appointment) return null;

  const dateValue = consultationData?.date || consultationData?.consultationDate || appointment.date;
  const timeValue = consultationData?.time || appointment.startTime;
  const doctorName = appointment.doctor
    ? `${appointment.doctor.name?.first || ""} ${appointment.doctor.name?.last || ""}`.trim() || "—"
    : "—";
  const status = appointment.status;
  const visitType = consultationData?.visitReason || consultationData?.consultationType || appointment.visitReason || appointment.consultationType || "";
  const needsVerification = (consultationData?.visitTypeVerified === false || appointment.visitTypeVerified === false) && appointment.status !== "completed" && appointment.status !== "Completed";
  const statusClass = getStatusStyle(status);
  const appointmentId = appointment.id || appointment._id;
  const isVisitCompleted = appointment.status === "completed" || appointment.status === "Completed";

  const handleVisitTypeSelect = async (newReason) => {
    if (!newReason || !appointmentId) return;
    setSavingVisitType(true);
    try {
      await appointmentHelper.updateConsultation(appointmentId, {
        visitReason: newReason,
        visitTypeVerified: true,
      });
      onVisitTypeChange?.(newReason);
      toast.success("Rodzaj wizyty zaktualizowany");
    } catch (err) {
      console.error("Error updating visit type:", err);
      toast.error(err?.response?.data?.message || "Nie udało się zmienić rodzaju wizyty");
    } finally {
      setSavingVisitType(false);
    }
  };

  const formatTimeForInput = (t) => {
    if (!t) return "";
    if (typeof t === "string" && /^\d{1,2}:\d{2}$/.test(t)) return t;
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return String(t);
  };

  const formatDateForInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-gray-500 shrink-0" />
        <label className="text-sm text-gray-600 shrink-0">Data wizyty</label>
        <input
          type="date"
          value={formatDateForInput(dateValue)}
          onChange={(e) => onDateChange?.(e.target.value)}
          disabled={readOnly}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-gray-500 shrink-0" />
        <label className="text-sm text-gray-600 shrink-0">Godzina</label>
        <input
          type="time"
          value={formatTimeForInput(timeValue)}
          onChange={(e) => onTimeChange?.(e.target.value)}
          disabled={readOnly}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 shrink-0">Lekarz:</span>
        <span className="text-sm font-medium text-gray-900">{doctorName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 shrink-0">Status</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
          <span className="w-2 h-2 rounded-full bg-current opacity-80" />
          {translateStatus(status) || status || "—"}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm text-gray-600 shrink-0">Rodzaj wizyty</label>
        {readOnly || isVisitCompleted ? (
          <>
            <span className="text-sm font-medium text-gray-900">{visitType || "—"}</span>
            {needsVerification && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Do weryfikacji
              </span>
            )}
          </>
        ) : (
          <>
            <VisitReasonCascadeDropdown
              categories={visitReasonsCategories}
              value={visitType}
              onChange={handleVisitTypeSelect}
              disabled={savingVisitType}
              placeholder="Wybierz rodzaj wizyty..."
            />
            {needsVerification && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Do weryfikacji
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default VisitInfoHeader;
