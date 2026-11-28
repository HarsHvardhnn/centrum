const day = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : "";
};

/** "od 27.11.2026 do 06.12.2026", so a period is never two bare dates. */
export function formatPeriod(from, to) {
  return day(from) && day(to) ? `od ${day(from)} do ${day(to)}` : "";
}

/** Date and time in Polish clinic time, e.g. "27.11.2026, 23:56". */
export function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
