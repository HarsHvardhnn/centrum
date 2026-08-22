/** VAT helpers for settlement / faktura line items (prices are gross). */

export const VAT_RATE_PRESETS = [
  { value: "zw", label: "ZW" },
  { value: "8", label: "8%" },
  { value: "23", label: "23%" },
];

export const DEFAULT_VAT_EXEMPTION_TEXT =
  "Zwolnienie ze względu na rodzaj prowadzonej działalności (art. 43 ust. 1 ustawy o VAT).";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function isZwTax(tax) {
  const t = String(tax ?? "zw").trim().toLowerCase();
  return t === "zw" || t === "0" || t === "";
}

export function normalizeTaxRate(tax) {
  if (isZwTax(tax)) return "zw";
  const n = parseFloat(String(tax).replace("%", "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return "zw";
  return String(n);
}

export function taxSelectValue(tax) {
  const normalized = normalizeTaxRate(tax);
  if (normalized === "zw") return "zw";
  if (normalized === "8") return "8";
  if (normalized === "23") return "23";
  return "custom";
}

export function grossToNetAndTax(gross, tax) {
  const priceGross = round2(gross);
  if (isZwTax(tax)) {
    return { priceNet: priceGross, priceTax: 0, priceGross, tax: "zw" };
  }
  const rate = parseFloat(normalizeTaxRate(tax)) / 100;
  const priceNet = round2(priceGross / (1 + rate));
  const priceTax = round2(priceGross - priceNet);
  return { priceNet, priceTax, priceGross, tax: normalizeTaxRate(tax) };
}

export function lineItemToInvoicePosition(line) {
  const qty = Number(line.quantity) > 0 ? Number(line.quantity) : 1;
  const unitGross = round2(line.finalPrice);
  const unit = grossToNetAndTax(unitGross, line.tax);
  return {
    name: line.name,
    quantity: qty,
    quantityUnit: line.unit || "szt",
    priceNet: unit.priceNet,
    priceGross: unit.priceGross,
    tax: unit.tax,
    priceTax: unit.priceTax,
    totalPriceNet: round2(unit.priceNet * qty),
    totalPriceTax: round2(unit.priceTax * qty),
    totalPriceGross: round2(unit.priceGross * qty),
  };
}
