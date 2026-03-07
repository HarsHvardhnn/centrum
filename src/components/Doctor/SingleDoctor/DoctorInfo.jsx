import React from "react";

const formatDateLong = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const s = new Date(date).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const DoctorInfoCard = ({ doctor, dailySummary, selectedDate }) => {
  const { name, timeSlot, avatarUrl } = doctor || {};
  const liczbaWizyt = dailySummary?.liczbaWizyt ?? 0;
  const pozostaloWizyt = dailySummary?.pozostaloWizyt ?? 0;
  const workingHours = timeSlot || "—";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-200">
      {/* Left: Doctor details */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          <img
            src={avatarUrl}
            alt={name || "Lekarz"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{name || ""}</h1>
          {selectedDate && (
            <p className="text-sm text-gray-500 mt-0.5">{formatDateLong(selectedDate)}</p>
          )}
        </div>
      </div>

      {/* Right: Daily summary – three cards */}
      <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto sm:flex-shrink-0">
        {/* GODZINY PRACY – teal card */}
        <div className="flex-1 min-w-[140px] rounded-xl px-4 py-3 bg-teal-50 border border-teal-100">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Godziny pracy</p>
          <p className="text-lg font-bold text-teal-800 mt-0.5">{workingHours}</p>
        </div>
        <div className="flex-1 min-w-[120px] rounded-xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{liczbaWizyt}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mt-0.5">Wizyt dziś</p>
        </div>
        <div className="flex-1 min-w-[120px] rounded-xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{pozostaloWizyt}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mt-0.5">Pozostało</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoCard;
