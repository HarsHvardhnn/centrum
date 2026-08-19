export const KIOSK_STATUS_LABELS = {
  pending: "Oczekuje na PIN",
  active: "Aktywna",
  in_progress: "Formularz w trakcie",
  ready_for_signature: "Gotowe do podpisu",
  completed: "Zakończona",
  cancelled: "Anulowana",
  expired: "Wygasła",
  abandoned: "Przerwana",
  locked: "Zablokowana",
};

export const KIOSK_TERMINAL_STATUSES = [
  "completed",
  "cancelled",
  "expired",
  "abandoned",
  "locked",
];

export const KIOSK_RESTARTABLE_STATUSES = ["cancelled", "expired", "abandoned", "locked"];

export const KIOSK_STATUS_PILL_CLASS = {
  pending: "bg-amber-50 border-amber-200 text-amber-900",
  active: "bg-sky-50 border-sky-200 text-sky-900",
  in_progress: "bg-blue-50 border-blue-200 text-blue-900",
  ready_for_signature: "bg-indigo-50 border-indigo-200 text-indigo-900",
  completed: "bg-green-50 border-green-200 text-green-900",
  cancelled: "bg-red-50 border-red-200 text-red-900",
  expired: "bg-orange-50 border-orange-200 text-orange-900",
  abandoned: "bg-rose-50 border-rose-200 text-rose-900",
  locked: "bg-gray-100 border-gray-300 text-gray-800",
};

const INTERRUPT_REASON_LABELS = {
  interrupted: "zamknięcie, odświeżenie lub powrót",
  device_lock: "blokada iPada",
  idle: "brak aktywności na iPadzie (5 min)",
  inactivity: "utrata połączenia z iPadem",
  connection_lost: "utrata połączenia",
  expired: "upłynął czas PIN (2 godz.)",
};

export function interruptReasonLabel(reason) {
  if (!reason) return null;
  return INTERRUPT_REASON_LABELS[reason] || reason;
}

export function formatInterruptTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("pl-PL");
}

export function kioskSessionRestartMessage(session) {
  if (!session?.status) return "";
  if (session.status === "abandoned") {
    const when = formatInterruptTime(session.interruptedAt);
    const why = interruptReasonLabel(session.interruptReason);
    const details = [when, why].filter(Boolean).join(" — ");
    return details
      ? `Sesja przerwana (${details}). Nie zapisano zgód ani dokumentów. Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN.`
      : "Sesja przerwana. Nie zapisano zgód ani dokumentów. Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN.";
  }
  if (session.status === "expired") {
    return "Sesja wygasła (upłynął czas PIN). Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN.";
  }
  if (session.status === "cancelled") {
    return "Sesja anulowana. Kliknij „Uruchom ponownie”, aby wygenerować nowy PIN.";
  }
  return "";
}
