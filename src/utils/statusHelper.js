export const translateStatus = (status) => {
  const statusMap = {
    completed: "Zakończona",
    checkedIn: "W trakcie wizyty",
    cancelled: "Anulowana",
    canceled: "Anulowana",
    booked: "Zarezerwowana",
    billed: "Rozliczona",
    no_appointment: "Brak wizyty",
    "in-treatment": "W trakcie"
  };
  const key = status?.toLowerCase?.();
  return statusMap[key] ?? statusMap[status] ?? status;
};

export const getStatusStyle = (status) => {
  const styleMap = {
    completed: "bg-green-100 text-green-800",
    checkedIn: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    canceled: "bg-red-100 text-red-800",
    booked: "bg-yellow-100 text-yellow-800",
    billed: "bg-purple-100 text-purple-800",
    no_appointment: "bg-gray-100 text-gray-800"
  };
  const key = status?.toLowerCase?.();
  return styleMap[key] ?? styleMap[status] ?? "bg-gray-100 text-gray-800";
};

/** Visit mode from API: visitMode or mode; fallback "offline" per API contract. */
export const getVisitMode = (appointment) => {
  const mode = appointment?.visitMode ?? appointment?.mode ?? "offline";
  return mode === "online" ? "online" : "offline";
};

/** Display label for visit mode (Polish). */
export const getVisitModeLabel = (appointment) => {
  return getVisitMode(appointment) === "online" ? "Online" : "W przychodni";
};

/** Tailwind classes for visit mode badge. */
export const getVisitModeStyle = (appointment) => {
  return getVisitMode(appointment) === "online"
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800";
}; 