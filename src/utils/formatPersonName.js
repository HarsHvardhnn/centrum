/**
 * Format a person name from string, { first, last }, or nested patient-like objects.
 */
export function formatPersonName(value, fallback = "Pacjent") {
  if (value == null || value === "") return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined") return fallback;
    return trimmed;
  }

  if (typeof value === "object") {
    if (value.name != null && value.name !== value) {
      return formatPersonName(value.name, fallback);
    }
    if (value.firstName != null || value.lastName != null) {
      const fromParts = `${value.firstName || ""} ${value.lastName || ""}`.trim();
      if (fromParts) return fromParts;
    }
    const fromFirstLast = `${value.first || ""} ${value.last || ""}`.trim();
    if (fromFirstLast) return fromFirstLast;
  }

  return fallback;
}
