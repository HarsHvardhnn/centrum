/** Units of measure for settlement / invoice line items (brief). */

export const DEFAULT_LINE_ITEM_UNIT = "szt.";

export const LINE_ITEM_UNITS = [
  "szt.",
  "usł.",
  "kpl.",
  "pakiet",
  "badanie",
  "godz.",
  "mies.",
  "dzień",
  "opak.",
];

const ALIAS_TO_UNIT = {
  szt: "szt.",
  "szt.": "szt.",
  pcs: "szt.",
  pc: "szt.",
  usl: "usł.",
  "usł": "usł.",
  "usł.": "usł.",
  kpl: "kpl.",
  "kpl.": "kpl.",
  pakiet: "pakiet",
  badanie: "badanie",
  godz: "godz.",
  "godz.": "godz.",
  mies: "mies.",
  "mies.": "mies.",
  dzien: "dzień",
  "dzień": "dzień",
  opak: "opak.",
  "opak.": "opak.",
};

export function normalizeLineItemUnit(unit) {
  const raw = String(unit || "").trim();
  if (LINE_ITEM_UNITS.includes(raw)) return raw;
  const key = raw.toLowerCase();
  if (ALIAS_TO_UNIT[key]) return ALIAS_TO_UNIT[key];
  const stripped = key.replace(/\.$/, "");
  if (ALIAS_TO_UNIT[stripped]) return ALIAS_TO_UNIT[stripped];
  return DEFAULT_LINE_ITEM_UNIT;
}
