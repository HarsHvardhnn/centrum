import { formatOrderWhen, formatOrderWhenExact, orderStatusMeta } from "../../helpers/clinicFlowHelper";

const FILTER_LABELS = {
  q: "Pacjent",
  status: "Status",
  from: "Utworzono od",
  to: "Utworzono do",
  kind: "Typ",
  exam: "Badanie",
  specialization: "Specjalizacja",
};

const KIND_LABELS = { exam: "Badanie", consultation: "Konsultacja specjalistyczna" };

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filterSummary(filters) {
  return Object.entries(FILTER_LABELS)
    .map(([key, label]) => {
      const value = filters?.[key];
      if (!value || value === "all") return null;
      const shown = key === "kind" ? KIND_LABELS[value] || value : key === "status" ? orderStatusMeta(value).label : value;
      return `${label}: ${shown}`;
    })
    .filter(Boolean);
}

function statusDetail(row) {
  if (row.status === "cancelled") {
    return `Anulował(a): ${row.cancelledByName || "—"}${row.cancelledAt ? `, ${formatOrderWhenExact(row.cancelledAt)}` : ""}`;
  }
  if (row.status === "booked" || row.status === "completed") {
    const day = row.bookedVisitDate ? new Date(row.bookedVisitDate).toLocaleDateString("pl-PL") : "";
    const when = [day, row.bookedVisitStartTime].filter(Boolean).join(", ");
    const by = row.bookedByName ? `Umówił(a): ${row.bookedByName}` : "";
    const at = row.bookedAt ? formatOrderWhenExact(row.bookedAt) : "";
    return [when && `Termin: ${when}`, by, at].filter(Boolean).join(" · ");
  }
  return "";
}

export function buildOrdersReportHtml(rows, filters, user) {
  const counts = rows.reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] || 0) + 1 }), {});
  const summary = ["open", "booked", "completed", "cancelled"]
    .filter((status) => counts[status])
    .map((status) => `${orderStatusMeta(status).label}: ${counts[status]}`)
    .join(" · ");
  const applied = filterSummary(filters);
  const author = typeof user?.name === "string" ? user.name : [user?.name?.first, user?.name?.last].filter(Boolean).join(" ");
  const body = rows
    .map((row) => `<tr>
      <td>${escapeHtml(formatOrderWhen(row.createdAt))}</td>
      <td>${escapeHtml(row.patientName)}</td>
      <td><strong>${escapeHtml(row.exam)}</strong>${row.specialization ? `<br><span class="muted">${escapeHtml(row.specialization)}</span>` : ""}</td>
      <td>${escapeHtml(row.orderedByName || "—")}</td>
      <td>${escapeHtml(row.performingDoctorName || row.requestedDoctorName || (row.anySpecialist ? "Dowolny specjalista" : "—"))}</td>
      <td>${escapeHtml(orderStatusMeta(row.status).label)}${statusDetail(row) ? `<br><span class="muted">${escapeHtml(statusDetail(row))}</span>` : ""}</td>
    </tr>`)
    .join("");
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Raport zleceń wewnętrznych</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .muted { color: #667085; font-size: 10px; }
  .meta { margin: 0 0 12px; color: #444; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #d0d5dd; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #f2f4f7; font-size: 10px; text-transform: uppercase; letter-spacing: .03em; }
  tr { break-inside: avoid; }
</style></head><body>
<h1>Raport zleceń wewnętrznych</h1>
<p class="meta">Wygenerowano: ${escapeHtml(formatOrderWhenExact(new Date()))}${author ? ` · ${escapeHtml(author)}` : ""}<br>
Liczba zleceń: ${rows.length}${summary ? ` (${escapeHtml(summary)})` : ""}${applied.length ? `<br>Filtry: ${escapeHtml(applied.join(" · "))}` : ""}</p>
<table><thead><tr><th>Utworzono</th><th>Pacjent</th><th>Zlecenie</th><th>Zlecił</th><th>Wykonanie</th><th>Status</th></tr></thead><tbody>${body}</tbody></table>
<script>window.onload = function () { window.focus(); window.print(); };</script>
</body></html>`;
}

export function printOrdersReport(rows, filters, user) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(buildOrdersReportHtml(rows, filters, user));
  win.document.close();
}
