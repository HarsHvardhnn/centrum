/** Visit diagnosis rows use several field names depending on the endpoint. */

export function diagnosisCode(row) {
  return String(row?.code || row?.icd10Code || row?.icd10_code || row?.icd10 || "").trim();
}

export function diagnosisName(row) {
  return String(
    row?.name
    || row?.icd10Display
    || row?.icd10_name
    || row?.full_name
    || row?.title
    || row?.display
    || row?.description
    || ""
  ).trim();
}

export function visitDiagnosisRows(rows) {
  const seen = new Set();
  const out = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const code = diagnosisCode(row);
    const name = diagnosisName(row);
    if (!code && !name) continue;
    const key = `${code}|${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      code,
      name,
      isPrimary: Boolean(row?.isPrimary || row?.is_primary),
    });
  }
  return out;
}

export function formatCoded(code, name) {
  const c = String(code || "").trim();
  const n = String(name || "").trim();
  if (c && n) return `${c} - ${n}`;
  return c || n;
}

/** ZUS statistical number is the three-character root, e.g. E11.9 → E11. */
export function icdRoot(code) {
  const match = String(code || "").toUpperCase().match(/[A-Z]\d{2}/);
  return match ? match[0] : "";
}
