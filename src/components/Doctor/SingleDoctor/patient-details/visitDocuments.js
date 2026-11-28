import { STATUS_LABELS, accessCodeOf } from "../../../ehealth/ehealthStatus";

export const CATEGORY_TABS = [
  { key: "ALL", label: "Wszystkie" },
  { key: "REC", label: "e-Recepty", dot: "bg-emerald-500" },
  { key: "SKI", label: "e-Skierowania", dot: "bg-blue-500" },
  { key: "ZLA", label: "e-ZLA", dot: "bg-indigo-500" },
  { key: "VISIT_CARD", label: "Karty wizyt" },
  { key: "INTERNAL", label: "Dokumenty wewnętrzne" },
];

const E_CATEGORY = { prescription: "REC", referral: "SKI", ezla: "ZLA" };
const ISSUED_LABEL = { prescription: "Wystawiona w P1", referral: "Wystawione", ezla: "Wystawione w ZUS" };

function eName(row) {
  const payload = row.payload || {};
  if (row.service === "prescription") {
    const items = Array.isArray(payload.items) && payload.items.length ? payload.items : [payload];
    const drugs = items.map((item) => item.drug?.name || item.recipeText || item.name).filter(Boolean).join(", ");
    return drugs ? `e-Recepta: ${drugs}` : "e-Recepta";
  }
  if (row.service === "referral") return payload.title ? `e-Skierowanie: ${payload.title}` : "e-Skierowanie";
  return "Zaświadczenie lekarskie (e-ZLA)";
}

/** The real document number, or nothing: older rows may carry an internal placeholder id. */
function eNumber(row) {
  const refs = row.payload?.refs || {};
  if (row.service === "ezla") return refs.ezlaNumber ? `${refs.ezlaSeries || ""} ${refs.ezlaNumber}`.trim() : "";
  const id = refs.packageKey || refs.referralId || row.externalId || "";
  return /^mf-/.test(id) ? "" : id;
}

function fromEhealth(row) {
  const sent = row.status === "submitted" || row.status === "issued";
  const cancelled = row.status === "cancelled";
  const failed = row.status === "failed";
  return {
    key: `e-${row.id}`,
    category: E_CATEGORY[row.service],
    name: eName(row),
    code: row.service === "ezla" ? "" : accessCodeOf(row),
    number: eNumber(row),
    date: row.createdAt,
    dateLabel: sent || cancelled ? "Wystawiono" : "Utworzono",
    status: sent ? ISSUED_LABEL[row.service] : failed ? "Błąd wysyłki" : STATUS_LABELS[row.status] || row.status,
    tone: sent ? "green" : failed || cancelled ? "red" : "amber",
    cancelled,
    error: failed ? row.error?.message || "" : "",
    row,
  };
}

function fromFile(file, version, versions) {
  const card = file.type === "visit-card";
  return {
    key: `f-${file.id}`,
    category: card ? "VISIT_CARD" : "INTERNAL",
    name: card ? `Karta wizyty lekarskiej${versions > 1 ? ` · wersja ${version}` : ""}` : file.name || "Załącznik",
    date: file.createdAt,
    dateLabel: card ? "Wystawiono" : "Dodano",
    status: card ? "Zatwierdzona" : "Załącznik",
    tone: "green",
    url: file.url,
  };
}

function fromClinic(doc) {
  const issued = doc.status === "issued";
  return {
    key: `c-${doc._id}`,
    category: "INTERNAL",
    name: doc.headerTitle || doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name || "Dokument",
    number: doc.documentNumber || "",
    date: doc.issuedAt || doc.createdAt,
    dateLabel: issued ? "Wystawiono" : "Utworzono",
    status: issued ? "Zatwierdzony" : "Szkic",
    tone: issued ? "green" : "amber",
    clinic: doc,
  };
}

/** Everything of each visit, newest first: Map(visitId -> documents). */
export function documentsByVisit({ ehealth = [], files = [], clinic = [] }) {
  const map = new Map();
  const add = (visitId, doc) => {
    const key = String(visitId || "");
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(doc);
  };
  ehealth.filter((row) => E_CATEGORY[row.service]).forEach((row) => add(row.visitId, fromEhealth(row)));
  const cards = files.filter((file) => file.type === "visit-card").sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  files.forEach((file) => {
    const siblings = cards.filter((card) => String(card.visitId) === String(file.visitId));
    add(file.visitId, fromFile(file, siblings.indexOf(file) + 1, siblings.length));
  });
  clinic.forEach((doc) => add(doc.visitId, fromClinic(doc)));
  map.forEach((list) => list.sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))));
  return map;
}
