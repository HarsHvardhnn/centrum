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

/** Display label for created-by role (Polish). Used in patient list and visit history. */
export const getCreatedByRoleLabel = (appointment) => {
  const role =
    appointment?.role != null
      ? appointment.role
      : appointment?.createdByRole != null
        ? appointment.createdByRole
        : typeof appointment?.createdBy === "string"
          ? appointment.createdBy
          : appointment?.createdBy?.role != null
            ? appointment.createdBy.role
            : "online";
  const labels = {
    online: "Online",
    receptionist: "Recepcja",
    admin: "Administracja",
    doctor: "Lekarz",
    patient: "Online",
  };
  return labels[role?.toLowerCase?.()] ?? labels[role] ?? role;
};

/** Visit mode from API: visitMode or mode; fallback "offline" per API contract. Normalized to lowercase. */
export const getVisitMode = (appointment) => {
  const raw = appointment?.visitMode ?? appointment?.mode ?? "offline";
  const mode = typeof raw === "string" ? raw.trim().toLowerCase() : String(raw).toLowerCase();
  return mode === "online" ? "online" : "offline";
};

/** Display label for visit mode. Always "Online" or "Stacjonarna" — never "Offline". */
export const getVisitModeLabel = (appointment) => {
  return getVisitMode(appointment) === "online" ? "Online" : "Stacjonarna";
};

/** Tailwind classes for visit mode badge. */
export const getVisitModeStyle = (appointment) => {
  return getVisitMode(appointment) === "online"
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800";
};

/** Remove Dr / lek / Lekarz (and variants) from start of name for display. Use for headers, lists, visit cards. */
export function stripDoctorTitle(name) {
  if (name == null || typeof name !== "string") return "";
  return name.replace(/^\s*(dr\.?|lek\.?|doktor|lekarz)\s+/i, "").trim() || name.trim();
} 