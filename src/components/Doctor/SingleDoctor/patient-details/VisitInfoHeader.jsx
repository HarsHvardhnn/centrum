import React from "react";
import { Calendar, Clock } from "lucide-react";
import { translateStatus, getStatusStyle } from "../../../../utils/statusHelper";

const VisitInfoHeader = ({
  appointment,
  consultationData,
  onDateChange,
  onTimeChange,
  onVisitTypeChange,
  readOnly = false,
}) => {
  if (!appointment) return null;

  const dateValue = consultationData?.date || consultationData?.consultationDate || appointment.date;
  const timeValue = consultationData?.time || appointment.startTime;
  const doctorName = appointment.doctor
    ? `${appointment.doctor.name?.first || ""} ${appointment.doctor.name?.last || ""}`.trim() || "—"
    : "—";
  const status = appointment.status;
  const visitType = consultationData?.consultationType || appointment.consultationType || "Wizyta kontrolna";
  const statusClass = getStatusStyle(status);

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
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 shrink-0">Typ wizyty</label>
        <select
          value={visitType}
          onChange={(e) => onVisitTypeChange?.(e.target.value)}
          disabled={readOnly}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm min-w-[160px]"
        >
          <option value="Wizyta kontrolna">Wizyta kontrolna</option>
          <option value="Konsultacja w przychodni">Konsultacja w przychodni</option>
          <option value="Konsultacja online">Konsultacja online</option>
          <option value="Wizyta domowa">Wizyta domowa</option>
        </select>
      </div>
    </header>
  );
};

export default VisitInfoHeader;
