export const VOIVODESHIPS = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
];

/** Strip diacritics for fuzzy matching of legacy ASCII values. */
function stripDiacritics(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Normalize województwo to the canonical kiosk spelling (lowercase + Polish diacritics).
 * Handles legacy admin values like "dolnoslaskie" / "Dolnośląskie".
 */
export function normalizeVoivodeship(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const exact = VOIVODESHIPS.find((v) => v === trimmed || v.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const ascii = stripDiacritics(trimmed);
  const matched = VOIVODESHIPS.find((v) => stripDiacritics(v) === ascii);
  return matched || trimmed;
}

export function formatVoivodeshipLabel(value) {
  const normalized = normalizeVoivodeship(value);
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
