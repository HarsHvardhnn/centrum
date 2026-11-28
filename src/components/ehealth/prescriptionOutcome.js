import { accessCodeOf } from "./ehealthStatus.js";

/** What happened to one prescription of a signed batch. */
export function rowState(row) {
  const doc = row?.result;
  if (!doc || doc.status === "failed" || doc.status === "retry") return "rejected";
  if (doc.status === "cancelled") return "cancelled";
  if (doc.status === "draft" || doc.payload?.sandboxOnly) return "draft";
  return accessCodeOf(doc) ? "accepted" : "pending";
}

export const rowError = (row) => row?.error || row?.result?.error?.message || "Recepta nie została przyjęta.";

/** Heading of the window after signing. A refused prescription is never described as sent or issued. */
export function batchOutcome(rows) {
  const states = (rows || []).map(rowState);
  const total = states.length;
  const rejected = states.filter((s) => s === "rejected").length;
  const many = total > 1;
  if (total && rejected === total) {
    return {
      tone: "red",
      allRejected: true,
      kicker: "Odrzucone",
      title: many ? `Nie wystawiono żadnej z ${total} e-recept` : "e-Recepta nie została wystawiona",
    };
  }
  if (rejected) {
    return { tone: "amber", allRejected: false, kicker: "Wystawione częściowo", title: `Odrzucono ${rejected} z ${total} e-recept` };
  }
  if (total && states.every((s) => s === "draft")) {
    return { tone: "amber", allRejected: false, kicker: "Sprawdzone", title: "Nie wysłano do P1" };
  }
  if (states.some((s) => s === "accepted" || s === "cancelled")) {
    return { tone: "green", allRejected: false, kicker: "Przyjęto w P1", title: many ? `Wystawiono ${total} e-recepty` : "e-Recepta wystawiona" };
  }
  return {
    tone: "green",
    allRejected: false,
    kicker: "Przekazano do P1",
    title: many ? `Wysłano ${total} e-recepty — czekamy na kod z P1` : "e-Recepta wysłana — czekamy na kod z P1",
  };
}
