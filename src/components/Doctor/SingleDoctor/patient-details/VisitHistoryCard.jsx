import React from "react";
import { translateStatus, getStatusStyle } from "../../../../utils/statusHelper";

const VisitHistoryCard = ({ appointments, currentAppointmentId, onSelectVisit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Historia wizyt</h3>
      <div className="space-y-2">
        {(appointments || []).map((apt) => {
          const isSelected = currentAppointmentId === apt._id;
          return (
            <button
              type="button"
              key={apt._id}
              onClick={() => onSelectVisit?.(apt._id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between gap-3 transition-colors border ${
                isSelected
                  ? "border-teal-400 bg-teal-50/80 shadow-sm"
                  : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(apt.date).toLocaleDateString("pl-PL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {apt.consultationType || apt.metadata?.visitType || "Konsultacja standardowa"}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(apt.status)}`}
              >
                {translateStatus(apt.status)}
              </span>
            </button>
          );
        })}
      </div>
      {(!appointments || appointments.length === 0) && (
        <p className="text-sm text-gray-500 py-4">Brak wizyt</p>
      )}
    </div>
  );
};

export default VisitHistoryCard;
