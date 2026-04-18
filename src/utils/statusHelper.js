export const translateStatus = (status) => {
  const statusMap = {
    completed: "Completed",
    checkedIn: "In visit",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    booked: "Booked",
    billed: "Billed",
    no_appointment: "No appointment",
    "in-treatment": "In treatment",
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

/** Display label for created-by role. Used in patient list and visit history. */
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
    receptionist: "Reception",
    admin: "Admin",
    doctor: "Doctor",
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

/** Display label for visit mode. Always "Online" or in-person — never "Offline". */
export const getVisitModeLabel = (appointment) => {
  return getVisitMode(appointment) === "online" ? "Online" : "In-person";
};

/** Tailwind classes for visit mode badge. */
export const getVisitModeStyle = (appointment) => {
  return getVisitMode(appointment) === "online"
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800";
};

/**
 * Display label for visit/consultation type in visit history and lists.
 * - re-visit → medical consultation
 * - first-time → first visit
 * - role "patient" + online → online consultation
 * - role "patient" + offline → medical consultation
 * - receptionist/admin, no type (existing patient) → medical consultation
 */
export const getVisitTypeDisplayLabel = (appointment) => {
  const raw = appointment?.visitReason ?? appointment?.consultationType ?? appointment?.metadata?.visitType ?? "";
  const s = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  const lower = s.toLowerCase();
  const role = (appointment?.role ?? appointment?.createdByRole ?? "").toString().trim().toLowerCase();

  if (lower === "re-visit") return "Medical consultation";
  if (lower === "first-time") return "First visit";
  if (role === "patient") return getVisitMode(appointment) === "online" ? "Online consultation" : "Medical consultation";
  if (!s) return "Medical consultation";
  return s;
};

/** Remove Dr / Dr med. / lek / Lekarz (and variants) from start of name for display. Use for headers, lists, visit cards. */
export function stripDoctorTitle(name) {
  if (name == null || typeof name !== "string") return "";
  return name.replace(/^\s*(dr\.?\s*med\.?|dr\.?|lek\.?|doktor|lekarz)\s+/gi, "").trim() || name.trim();
} 