import {
  isRadiologistAppointment,
  RADIOLOGIST_VISIT_TYPE_LABEL,
} from "./radiologistVisitHelper";

/** Canonical API status for patient no-show. */
export const APPOINTMENT_STATUS_NO_SHOW = "no_show";

/** Normalize status strings from API/legacy (no_show, no-show, not show, etc.). */
export const normalizeAppointmentStatusKey = (status) => {
  const s = (status ?? "").toString().trim().toLowerCase();
  if (!s) return "";
  if (s === "no_show" || s === "no-show" || s === "noshow" || s === "not show" || s === "not_show") {
    return APPOINTMENT_STATUS_NO_SHOW;
  }
  if (s === "canceled" || s === "cancelled" || s.startsWith("cancel")) return "cancelled";
  if (s === "completed") return "completed";
  if (s === "checkedin") return "checkedIn";
  if (s === "booked") return "booked";
  if (s === "billed") return "billed";
  return (status ?? "").toString().trim();
};

export const appointmentStatusesEqual = (a, b) =>
  normalizeAppointmentStatusKey(a) === normalizeAppointmentStatusKey(b);

export const isNoShowStatus = (statusOrAppointment) => {
  const raw =
    typeof statusOrAppointment === "object" && statusOrAppointment !== null
      ? statusOrAppointment?.status ?? statusOrAppointment?.appointmentStatus
      : statusOrAppointment;
  return normalizeAppointmentStatusKey(raw) === APPOINTMENT_STATUS_NO_SHOW;
};

export const isCancelledStatus = (statusOrAppointment) => {
  const raw =
    typeof statusOrAppointment === "object" && statusOrAppointment !== null
      ? statusOrAppointment?.status ?? statusOrAppointment?.appointmentStatus
      : statusOrAppointment;
  const s = normalizeAppointmentStatusKey(raw);
  return s === "cancelled" || s.startsWith("cancel");
};

/** Statuses available in the "Zmień status" modal (API values). */
export const APPOINTMENT_STATUS_CHANGE_OPTIONS = [
  { value: "booked", apiValue: "booked" },
  { value: "checkedIn", apiValue: "checkedIn" },
  { value: "completed", apiValue: "completed" },
  { value: "cancelled", apiValue: "cancelled" },
  { value: APPOINTMENT_STATUS_NO_SHOW, apiValue: APPOINTMENT_STATUS_NO_SHOW },
];

/** Clinic / visit history status filter radio options (value sent to appointments API). */
export const CLINIC_STATUS_FILTER_OPTIONS = [
  { value: "All", label: "Wszystkie" },
  { value: "booked", label: "Zarezerwowane" },
  { value: "checkedIn", label: "Zameldowany" },
  { value: "Cancelled", label: "Anulowane" },
  { value: "Completed", label: "Zakończone" },
  { value: APPOINTMENT_STATUS_NO_SHOW, label: "Niestawiennictwo" },
  { value: "patientLess", label: "Do rejestracji" },
];

/** Dashboard (administracja) today list status filter. */
export const DASHBOARD_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Wszystkie", apiStatus: undefined },
  { value: "reserved", label: "Zarezerwowane", apiStatus: "booked" },
  { value: "completed", label: "Zakończone", apiStatus: "completed" },
  { value: "cancelled", label: "Anulowane", apiStatus: "cancelled" },
  { value: APPOINTMENT_STATUS_NO_SHOW, label: "Niestawiennictwo", apiStatus: APPOINTMENT_STATUS_NO_SHOW },
];

const STATUS_LABELS_PL = {
  completed: "Zakończona",
  checkedIn: "W trakcie wizyty",
  cancelled: "Anulowana",
  booked: "Zarezerwowana",
  billed: "Rozliczona",
  no_appointment: "Brak wizyty",
  "in-treatment": "W trakcie",
  [APPOINTMENT_STATUS_NO_SHOW]: "Niestawiennictwo",
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800",
  checkedIn: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  booked: "bg-yellow-100 text-yellow-800",
  billed: "bg-purple-100 text-purple-800",
  no_appointment: "bg-gray-100 text-gray-800",
  [APPOINTMENT_STATUS_NO_SHOW]: "bg-gray-100 text-gray-800",
};

export const translateStatus = (status) => {
  const key = normalizeAppointmentStatusKey(status);
  if (key && STATUS_LABELS_PL[key]) return STATUS_LABELS_PL[key];
  const raw = (status ?? "").toString().trim();
  return raw || "—";
};

export const getStatusStyle = (status) => {
  const key = normalizeAppointmentStatusKey(status);
  return STATUS_STYLES[key] ?? "bg-gray-100 text-gray-800";
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

/**
 * Display label for visit/consultation type in visit history and lists.
 * - re-visit → "Konsultacja lekarska"
 * - first-time → "Konsultacja pierwszorazowa"
 * - role "patient" + online → "Konsultacja online"
 * - role "patient" + offline → "Konsultacja lekarska"
 * - receptionist/admin, no type (existing patient) → "Konsultacja lekarska"
 * - receptionist, first-time (no patient id) → "Konsultacja pierwszorazowa" (via visitReason)
 * - literal "consultation" (API/legacy) → "Konsultacja lekarska"
 */
export const getVisitTypeDisplayLabel = (appointment) => {
  if (isRadiologistAppointment(appointment)) {
    return RADIOLOGIST_VISIT_TYPE_LABEL;
  }

  const apiVisitType = appointment?.visitType;
  if (apiVisitType != null && String(apiVisitType).trim() !== "") {
    return String(apiVisitType).trim();
  }
  const raw = appointment?.visitReason ?? appointment?.consultationType ?? appointment?.metadata?.visitType ?? "";
  const s = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  const lower = s.toLowerCase();
  const role = (appointment?.role ?? appointment?.createdByRole ?? "").toString().trim().toLowerCase();

  if (lower === "re-visit") return "Konsultacja lekarska";
  if (lower === "first-time") return "Konsultacja pierwszorazowa";
  if (lower === "consultation") return "Konsultacja lekarska";
  if (role === "patient") return getVisitMode(appointment) === "online" ? "Konsultacja online" : "Konsultacja lekarska";
  if (!s) return "Konsultacja lekarska";
  return s;
};

/** Remove Dr / Dr med. / lek / Lekarz (and variants) from start of name for display. Use for headers, lists, visit cards. */
export function stripDoctorTitle(name) {
  if (name == null || typeof name !== "string") return "";
  return name.replace(/^\s*(dr\.?\s*med\.?|dr\.?|lek\.?|doktor|lekarz)\s+/gi, "").trim() || name.trim();
}
