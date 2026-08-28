// navigationConfig.js
import { useNavigate } from "react-router-dom";

// Custom hook that extends the base useNavigate functionality
export const useNavigation = () => {
  const navigate = useNavigate();

  return {
    // Original navigate function
    navigate,

    // Common navigation shortcuts
    goBack: () => navigate(-1),
    goHome: () => navigate("/admin"),
    goToDashboard: () => navigate("/dashboard"),
    goToProfile: () => navigate("/profile"),
    goToSettings: () => navigate("/settings"),

    // Function to navigate with state
    navigateWithState: (path, state) => navigate(path, { state }),

    // Function to navigate with replace (won't add to history)
    navigateReplace: (path) => navigate(path, { replace: true }),

    // Navigate to a page with query parameters
    navigateWithParams: (path, params) => {
      const queryString = new URLSearchParams(params).toString();
      navigate(`${path}?${queryString}`);
    },

    // Navigate to a nested route with an ID
    navigateToResource: (basePath, id) => navigate(`${basePath}/${id}`),
  };
};

// You can also define common route paths here to avoid hardcoding
export const ROUTES = {
  HOME: "/",
  LOGIN: "/logowanie",
  FORGOT_PASSWORD: "/zapomniane-haslo",
  DASHBOARD: "/administracja",
  PROFILE: "/administracja/profil",
  SETTINGS: "/administracja/konta",
  DOCTORS: "/lekarze",
  DOCTOR_APPOINTMENTS: "/lekarze/wizyty",
  DOCTOR_DETAILS: "/szczegoly-lekarza",
  PATIENTS: "/pacjenci",
  PATIENT_DETAILS: "/szczegoly-pacjenta",
  CLINIC: "/klinika",
  APPOINTMENT_CREATE: "/wizyta/utworz",
  ADMIN_SMS: "/administracja/sms",
  DOCTOR_CREATE: "/lekarz/utworz",
  ADMIN_ACCOUNTS: "/administracja/konta",
  ADMIN_SERVICES: "/administracja/uslugi",
  ADMIN_NEWS: "/administracja/aktualnosci",
  DOCTOR_SETTINGS: "/lekarz/ustawienia",
  ADMIN_CALENDAR: "/administracja/kalendarz",
  HELP_CENTER: "/centrum-pomocy",
  ADMIN_DATA: "/administracja/dane",
  ADMIN_BILLING: "/administracja/rozliczenia",
  ADMIN_BILLING_DETAILS: "/administracja/rozliczenia/szczegoly",
  ADMIN_CONTACT_MESSAGES: "/administracja/wiadomosci-kontaktowe",
  ADMIN_IP_CONFIG: "/administracja/konfiguracja-ip",
  ADMIN_SECURITY_2FA: "/administracja/bezpieczenstwo/2fa",
  ADMIN_APPOINTMENT_CONFIG: "/administracja/konfiguracja-wizyt",
  NOT_FOUND: "/404",
};

/** Doctor day calendar. Admins/reception go to the doctor list. */
export function doctorVisitsPath(user) {
  if (!user || user.role === "admin" || user.role === "receptionist") {
    return ROUTES.DOCTORS;
  }
  const id = user.d_id || user.id || user._id;
  if (!id) return ROUTES.DOCTORS;
  return `${ROUTES.DOCTOR_APPOINTMENTS}/${id}`;
}

export function isUsableRouteId(value) {
  if (value == null) return false;
  const str = String(value).trim();
  return str.length > 0 && str !== "undefined" && str !== "null";
}

/** Appointment.doctor is User._id. Prefer a 24-char hex id over d_id (dr-…). */
export function pickMongoDoctorId(...candidates) {
  const values = candidates
    .flat()
    .map((value) => (value == null ? "" : String(value).trim()))
    .filter(Boolean);
  const mongoId = values.find((value) => /^[a-fA-F0-9]{24}$/.test(value));
  return mongoId || values[0] || "";
}

// Optional: Create a router context provider if you want to access these functions without hooks
// This is useful for non-functional components or utility functions
export const createNavigationUtils = (navigate) => ({
  goBack: () => navigate(-1),
  goHome: () => navigate("/administracja"),
  goToDashboard: () => navigate("/administracja"),
  // ... add other navigation functions similar to above
});
