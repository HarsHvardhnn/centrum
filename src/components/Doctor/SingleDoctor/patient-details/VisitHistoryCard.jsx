import React from "react";

const VisitHistoryCard = ({ appointments, currentAppointmentId, onSelectVisit }) => {
  const statusPillClass = (status) => {
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const statusLabel = (status) => {
    if (status === "completed") return "Zakończona";
    if (status === "cancelled") return "Anulowana";
    return "Zaplanowana";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Historia wizyt</h3>
      <div className="space-y-0 divide-y divide-gray-100">
        {(appointments || []).map((apt) => (
          <button
            type="button"
            key={apt._id}
            onClick={() => onSelectVisit?.(apt._id)}
            className={`w-full text-left py-3 first:pt-0 flex items-center justify-between gap-3 transition-colors ${
              currentAppointmentId === apt._id ? "bg-teal-50/50" : "hover:bg-gray-50"
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {new Date(apt.date).toLocaleDateString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {apt.consultationType || "Konsultacja kardiologiczna"}
              </p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusPillClass(apt.status)}`}
            >
              {statusLabel(apt.status)}
            </span>
          </button>
        ))}
      </div>
      {(!appointments || appointments.length === 0) && (
        <p className="text-sm text-gray-500 py-4">Brak wizyt</p>
      )}
    </div>
  );
};

export default VisitHistoryCard;
