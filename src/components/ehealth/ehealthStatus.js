export const STATUS_LABELS = {
  draft: "Sprawdzone (nie wysłane do P1)",
  needs_signature: "Wymaga podpisu",
  submitted: "Wysłane",
  issued: "Wystawione",
  failed: "Błąd",
  retry: "Ponów",
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

export function statusTone(status) {
  if (["issued", "confirmed", "submitted"].includes(status)) return "green";
  if (["failed", "not_confirmed"].includes(status)) return "red";
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
