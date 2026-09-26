export const STATUS_LABELS = {
  draft: "Sprawdzone (nie wysłane do P1)",
  needs_signature: "Wymaga podpisu",
  submitted: "Wysłane",
  issued: "Wystawione",
  failed: "Błąd",
  retry: "Ponów",
  cancelled: "Anulowane",
  confirmed: "Potwierdzone",
  not_confirmed: "Niepotwierdzone",
  not_checked: "Nie sprawdzono",
  unavailable: "Niedostępne",
  needs_recheck: "Wymaga ponownego sprawdzenia",
};

export const SERVICE_LABELS = {
  prescription: "e-Recepta",
  referral: "e-Skierowanie",
  ezla: "e-ZLA",
  eligibility: "eWUŚ",
};

export const ERROR_CODE_LABELS = {
  VALIDATION: "Dane formularza",
  UNAVAILABLE: "Usługa niedostępna",
  AUTH: "Brak uprawnień / certyfikatu",
  REJECTED: "Odrzucone przez dostawcę",
  DUPLICATE: "Duplikat",
  UNKNOWN: "Błąd",
};

export function statusTone(status) {
  if (["issued", "confirmed", "submitted"].includes(status)) return "green";
  if (["failed", "not_confirmed", "cancelled"].includes(status)) return "red";
  if (["needs_signature", "needs_recheck", "unavailable", "retry"].includes(status)) {
    return "amber";
  }
  return "grey";
}

export function statusClass(status) {
  const tone = statusTone(status);
  const map = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    grey: "bg-gray-100 text-gray-700",
  };
  return map[tone];
}

export function canRetry(doc) {
  return doc?.status === "failed" || doc?.status === "retry";
}

export function canCancel(doc) {
  if (!doc?.id || doc.service === "eligibility") return false;
  return doc.status !== "cancelled";
}

export function canPrint(doc) {
  return Boolean(doc?.id) && doc.service !== "eligibility";
}

export function accessCodeOf(doc) {
  return doc?.accessCode || doc?.payload?.accessCode || doc?.payload?.refs?.accessCode || "";
}
