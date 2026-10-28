import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pill, X, Plus, ShieldCheck, Eye, Printer, Mail, Smartphone, Copy, ChevronDown, ChevronUp, AlertTriangle, Info, History, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError, drugsFromHistory, drugMatches } from "../../helpers/ehealthHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import IssuePatientCard, { normalizePatient, patientForDocument } from "./IssuePatientCard";
import PrescriptionHistoryModal from "./PrescriptionHistoryModal";
import { STATUS_LABELS, statusClass, accessCodeOf } from "./ehealthStatus";
import { visitDiagnosisRows } from "./visitIcd";
import IcdCombobox from "./IcdCombobox";
import IssueSummaryBar from "./IssueSummaryBar";
import { classifyDrug } from "./drugClass";
import P1SignDialog from "./P1SignDialog";

const PAYMENTS = [
  { value: "100%", label: "100%" },
  { value: "50%", label: "50%" },
  { value: "30%", label: "30%" },
  { value: "R", label: "Ryczałt" },
  { value: "B", label: "Bezpłatny" },
];

const ENTITLEMENTS = [
  ["", "BRAK — standardowe"],
  ["S", "S — seniorzy 65+"],
  ["DZ", "DZ — dzieci i młodzież do 18 r.ż."],
  ["C", "C — kobiety w ciąży"],
  ["ZK", "ZK — zasłużony dawca krwi"],
  ["IB", "IB — inwalida wojenny"],
  ["IW", "IW — inwalida wojskowy"],
  ["WP", "WP — żołnierz / pracownik wojska"],
  ["DN", "DN — dziecko nieubezpieczone"],
  ["CN", "CN — ciąża, osoba nieubezpieczona"],
  ["IN", "IN — inny tytuł"],
  ["UE", "UE / EKUZ"],
];

const DOC_ENTITLEMENTS = ["ZK", "IB", "IW", "WP", "IN"];

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const RECIPE_FORMS = [
  "Maść (Unguentum)",
  "Krem (Cremor)",
  "Roztwór (Solutio)",
  "Zawiesina (Suspensio)",
  "Krople (Guttae)",
  "Proszki dzielone (Pulveres divisi)",
  "Czopki (Suppositoria)",
];

const RECIPE_PACKS = [
  "do 100 g (1 op. ryczałt)",
  "do 200 g (2 op.)",
  "Płyn do 100 ml",
  "Proszki do 20 szt.",
  "Czopki do 12 szt.",
];

const RECIPE_MODIFIERS = [
  ["none", "Dokładna ilość"],
  ["ad", "ad (dopełni do)"],
  ["aa", "aa (po równo)"],
  ["aa ad", "aa ad (po równo do)"],
  ["q.s.", "q.s. (ile potrzeba)"],
];

const RECIPE_TEMPLATES = [
  {
    name: "Maść z hydrokortyzonem 1% (100 g)",
    form: "Maść (Unguentum)",
    packaging: "do 100 g (1 op. ryczałt)",
    payment: "R",
    dosage: "Smarować chorobowo zmienione miejsca na skórze 2 x dziennie przez 14 dni",
    ingredients: [
      { name: "Hydrocortisonum", amount: "1,0", unit: "g", modifier: "none" },
      { name: "Paraffinum liquidum", amount: "10,0", unit: "g", modifier: "none" },
      { name: "Vaselinum album", amount: "100,0", unit: "g", modifier: "ad" },
    ],
  },
  {
    name: "Maść z mocznikiem 10% (100 g)",
    form: "Maść (Unguentum)",
    packaging: "do 100 g (1 op. ryczałt)",
    payment: "R",
    dosage: "Smarować zrogowaciały naskórek 2 x dziennie po kąpieli przez 14 dni",
    ingredients: [
      { name: "Urea (Mocznik)", amount: "10,0", unit: "g", modifier: "none" },
      { name: "Aqua purificata", amount: "10,0", unit: "g", modifier: "none" },
      { name: "Eucerinum anhydricum", amount: "100,0", unit: "g", modifier: "ad" },
    ],
  },
  {
    name: "Roztwór kwasu salicylowego 2% (100 g)",
    form: "Roztwór (Solutio)",
    packaging: "Płyn do 100 ml",
    payment: "R",
    dosage: "Przemywać zmienione chorobowo miejsca 1 x dziennie na noc",
    ingredients: [
      { name: "Acidum salicylicum", amount: "2,0", unit: "g", modifier: "none" },
      { name: "Ethanolum 70°", amount: "100,0", unit: "g", modifier: "ad" },
    ],
  },
];

const DOSAGE_CHIPS = ["2 x dziennie cienką warstwą", "1 x dziennie na noc", "Do przemywania zmian", "przez 14 dni"];

function emptyIngredient(amount = "1,0", modifier = "none") {
  return {
    key: `ing-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    amount,
    unit: "g",
    modifier,
  };
}

function recipeDefaultsForForm(form) {
  if (/Solutio|Roztwór|Krople|Guttae|Suspensio|Zawiesina/.test(form)) {
    return { recipePackageType: "Butelka z ciemnego szkła", recipeSummary: /Suspensio|Zawiesina/.test(form) ? "M.f. suspensio" : "M.f. solutio" };
  }
  if (/Cremor|Krem/.test(form)) return { recipePackageType: "Tuba z maścią", recipeSummary: "M.f. cremor" };
  if (/Pulveres|Proszki/.test(form)) return { recipePackageType: "Pudełko z tworzywa", recipeSummary: "M.f. pulvis" };
  if (/Suppositoria|Czopki/.test(form)) return { recipePackageType: "Pudełko z tworzywa", recipeSummary: "M.f. suppositorium" };
  return { recipePackageType: "Pudełko z tworzywa", recipeSummary: "M.f. unguentum" };
}

function recipeLines(item) {
  return (Array.isArray(item?.ingredients) ? item.ingredients : [])
    .filter((ingredient) => String(ingredient?.name || "").trim())
    .map((ingredient) => {
      const modifier = ingredient.modifier && ingredient.modifier !== "none" ? `${ingredient.modifier} ` : "";
      return `${String(ingredient.name).trim()} ${modifier}${ingredient.amount || ""} ${ingredient.unit || ""}`.replace(/\s+/g, " ").trim();
    });
}

function recipeDrugName(item) {
  const form = String(item?.recipeForm || "Maść").split(" ")[0];
  const pack = String(item?.recipePackaging || "").replace(/\(.*\)/, "").trim();
  return `Lek recepturowy: ${form}${pack ? ` (${pack})` : ""}`;
}

function syncRecipeItem(item, patch) {
  const next = { ...item, ...patch, annual: false, quantity: "1" };
  next.recipeText = recipeLines(next).join("\n");
  next.drug = { ...(next.drug || {}), name: recipeDrugName(next) };
  if (!next.recipeSummary) Object.assign(next, recipeDefaultsForForm(next.recipeForm));
  return next;
}

function blankRecipe(diagnoses) {
  return syncRecipeItem({
    ...blankItem("recipe"),
    payment: "R",
    recipeForm: RECIPE_FORMS[0],
    recipePackaging: RECIPE_PACKS[0],
    ingredients: [emptyIngredient("1,0", "none"), emptyIngredient("100,0", "ad")],
  }, {});
}

const DOSE_PILLS = [
  { id: "1×1 rano", frequency: "1", periodHours: "24", doseQuantity: "1", timeOfDay: "rano" },
  { id: "1×1 wieczorem", frequency: "1", periodHours: "24", doseQuantity: "1", timeOfDay: "wieczorem" },
  { id: "2×1", frequency: "2", periodHours: "12", doseQuantity: "1", timeOfDay: "rano i wieczorem" },
  { id: "3×1", frequency: "3", periodHours: "8", doseQuantity: "1", timeOfDay: "w trakcie posiłku" },
];

const FREQUENCIES = [
  { value: "", label: "— Wybierz —", hours: "24" },
  { value: "1", label: "1 x dziennie", hours: "24" },
  { value: "2", label: "2 x dziennie", hours: "12" },
  { value: "3", label: "3 x dziennie", hours: "8" },
  { value: "48", label: "co 2 dni", hours: "48", frequency: "1" },
];

const TIMES_OF_DAY = ["", "rano", "rano (przed posiłkiem)", "rano (po posiłku)", "wieczorem", "wieczorem (przed snem)", "rano i wieczorem", "rano i wieczorem (po posiłku)", "w trakcie posiłku"];

function packageUnits(drug) {
  const volume = Number(String(drug?.packageVolume ?? "").replace(",", "."));
  const count = Number(String(drug?.packageCount ?? "").replace(",", "."));
  if (volume > 0 && count > 1) return Math.round(volume * count);
  if (volume > 0) return Math.round(volume);
  const text = String(drug?.package || "");
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(tabl|kaps|szt|amp|saszet|daw)/i);
  if (match) return Math.round(Number(match[1].replace(",", ".")));
  return 0;
}

function packageUnitLabel(drug, fallback = "tabl.") {
  const unit = String(drug?.packageVolumeUnit || "").trim();
  if (unit && !/opak|butel|blist/i.test(unit)) return unit;
  const match = String(drug?.package || "").match(/\d+(?:[.,]\d+)?\s*(tabl\.?|kaps\.?|szt\.?|amp\.?|ml|g)\b/i);
  return match ? match[1] : fallback;
}

const POLISH_ONES = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
const POLISH_TEENS = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
const POLISH_TENS = ["", "dziesięć", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
const POLISH_HUNDREDS = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];
const SUBSTANCE_UNITS = {
  mg: ["miligram", "miligramy", "miligramów", "miligrama"],
  g: ["gram", "gramy", "gramów", "grama"],
  ml: ["mililitr", "mililitry", "mililitrów", "mililitra"],
  mcg: ["mikrogram", "mikrogramy", "mikrogramów", "mikrograma"],
};

function threeDigitsToWords(n) {
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) parts.push(POLISH_HUNDREDS[hundreds]);
  if (rest >= 10 && rest < 20) parts.push(POLISH_TEENS[rest - 10]);
  else {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    if (tens > 0) parts.push(POLISH_TENS[tens]);
    if (ones > 0) parts.push(POLISH_ONES[ones]);
  }
  return parts.join(" ");
}

function integerToPolishWords(n) {
  const value = Math.round(Number(n));
  if (!value) return "zero";
  if (value < 0) return `minus ${integerToPolishWords(Math.abs(value))}`;
  const parts = [];
  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  if (thousands > 0) {
    if (thousands === 1) parts.push("tysiąc");
    else {
      parts.push(threeDigitsToWords(thousands));
      const rem10 = thousands % 10;
      const rem100 = thousands % 100;
      if (rem100 >= 12 && rem100 <= 14) parts.push("tysięcy");
      else if (rem10 >= 2 && rem10 <= 4) parts.push("tysiące");
      else parts.push("tysięcy");
    }
  }
  if (remainder > 0) parts.push(threeDigitsToWords(remainder));
  return parts.join(" ").trim();
}

function polishInflection(value, singular, few, many) {
  const n = Math.abs(Math.round(Number(value)));
  if (n === 1) return singular;
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 12 && rem100 <= 14) return many;
  if (rem10 >= 2 && rem10 <= 4) return few;
  return many;
}

function normalizeSubstanceUnit(raw) {
  const unit = String(raw || "").toLowerCase();
  if (unit === "µg" || unit === "μg" || unit === "mcg") return "mcg";
  if (unit === "mg" || unit === "g" || unit === "ml") return unit;
  return "mg";
}

function fractionPhrase(decimal) {
  const tenths = Math.round(decimal * 10);
  if (Math.abs(decimal * 10 - tenths) < 0.001 && tenths > 0 && tenths < 10) {
    return `${integerToPolishWords(tenths)} ${polishInflection(tenths, "dziesiąta", "dziesiąte", "dziesiątych")}`;
  }
  const hundredths = Math.round(decimal * 100);
  if (!hundredths) return "";
  return `${integerToPolishWords(hundredths)} ${polishInflection(hundredths, "setna", "setne", "setnych")}`;
}

function amountToPolishWords(amount, unit) {
  const value = Number(amount);
  if (!value || value <= 0) return "";
  const forms = SUBSTANCE_UNITS[normalizeSubstanceUnit(unit)] || SUBSTANCE_UNITS.mg;
  const rounded = Math.round(value * 1000) / 1000;
  const intPart = Math.floor(rounded + 1e-9);
  const decimal = Math.round((rounded - intPart) * 1000) / 1000;
  if (decimal >= 0.001) {
    const fraction = fractionPhrase(decimal);
    const head = intPart > 0 ? `${integerToPolishWords(intPart)} i ${fraction}` : fraction;
    return `${head} ${forms[3]}`.replace(/\s+/g, " ").trim();
  }
  return `${integerToPolishWords(intPart)} ${polishInflection(intPart, forms[0], forms[1], forms[2])}`;
}

function formatAmount(value) {
  const rounded = Math.round(Number(value) * 1000) / 1000;
  return Number.isFinite(rounded) ? String(rounded) : "";
}

function doseFormLabel(unit) {
  const clean = String(unit || "").replace(/\.$/, "").toLowerCase();
  if (clean === "tabl") return "tabl.";
  if (clean === "kaps") return "kaps.";
  if (clean === "szt") return "szt.";
  if (clean === "amp") return "amp.";
  return String(unit || "").trim();
}

function extractSubstanceDose(drug) {
  const source = [drug?.strength, drug?.name, drug?.form].filter(Boolean).join(" ");
  const concentration = source.match(/(\d+(?:[.,]\d+)?)\s*(mg|g|mcg|µg|μg)\s*\/\s*ml/i);
  const simple = source.match(/(\d+(?:[.,]\d+)?)\s*(mg|g|ml|mcg|µg|μg)\b/i);
  let amount = 0;
  let unit = "mg";
  let perMl = false;
  if (concentration) {
    amount = Number(concentration[1].replace(",", "."));
    unit = normalizeSubstanceUnit(concentration[2]);
    perMl = true;
  } else if (simple) {
    amount = Number(simple[1].replace(",", "."));
    unit = normalizeSubstanceUnit(simple[2]);
  }
  let unitsCount = 0;
  if (perMl) {
    const ml = String(drug?.package || "").match(/(\d+(?:[.,]\d+)?)\s*ml/i);
    if (ml) unitsCount = Number(ml[1].replace(",", "."));
    else if (/^ml$/i.test(String(drug?.packageVolumeUnit || ""))) unitsCount = Number(drug.packageVolume) || 0;
  }
  if (!unitsCount) unitsCount = packageUnits(drug);
  const formUnit = perMl ? "ml" : doseFormLabel(packageUnitLabel(drug, ""));
  const amountLabel = amount ? String(amount).replace(".", ",") : "";
  const strengthLabel = amount
    ? `${amountLabel} ${unit}${formUnit ? ` / ${formUnit}` : ""}`
    : String(drug?.strength || "").trim();
  return {
    amount,
    unit,
    unitsCount: unitsCount || 0,
    strengthLabel,
    displayName: String(drug?.activeSubstance || "").trim(),
  };
}

function rpwTotal(drug, packs) {
  const dose = extractSubstanceDose(drug);
  const count = Number(packs);
  if (!dose.amount || !dose.unitsCount || !count) return { ...dose, total: 0 };
  return { ...dose, total: Math.round(count * dose.unitsCount * dose.amount * 1000) / 1000 };
}

function substanceNameFor(drug) {
  const dose = extractSubstanceDose(drug);
  if (!dose.displayName) return "";
  if (!dose.strengthLabel || dose.displayName.includes(dose.strengthLabel)) return dose.displayName;
  return `${dose.displayName} (${dose.strengthLabel})`;
}

function shownSubstanceName(item) {
  const stored = String(item?.substanceName || "").trim();
  const dose = extractSubstanceDose(item?.drug);
  if (!stored) return substanceNameFor(item?.drug);
  if (dose.strengthLabel && stored === dose.displayName && !stored.includes(dose.strengthLabel)) {
    return `${stored} (${dose.strengthLabel})`;
  }
  return stored;
}

function syncRpwQuantity(item, quantity) {
  const next = { quantity: String(quantity || "") };
  const before = rpwTotal(item.drug, item.quantity);
  const after = rpwTotal(item.drug, quantity);
  const currentAmount = Number(String(item.substanceQuantity || "").replace(",", "."));
  const followsAmount = !item.substanceQuantity || (before.total > 0 && Math.abs(currentAmount - before.total) < 0.001);
  const previousWords = before.total > 0 ? amountToPolishWords(before.total, item.substanceUnit || before.unit) : "";
  const followsWords = !String(item.substanceWords || "").trim() || item.substanceWords === previousWords;
  if (!String(item.substanceName || "").trim()) {
    const name = substanceNameFor(item.drug);
    if (name) next.substanceName = name;
  }
  if (followsAmount && after.total > 0) {
    next.substanceQuantity = formatAmount(after.total);
    next.substanceUnit = after.unit;
    if (followsWords) next.substanceWords = amountToPolishWords(after.total, after.unit);
  }
  return next;
}

function fillRpwSubstance(item) {
  const dose = rpwTotal(item.drug, item.quantity || 1);
  item.annual = false;
  item.realizationFrom = "";
  if (Number(item.durationDays) > 90) item.durationDays = "90";
  if (!String(item.substanceName || "").trim()) item.substanceName = substanceNameFor(item.drug);
  if (!item.substanceQuantity && dose.total > 0) {
    item.substanceQuantity = formatAmount(dose.total);
    item.substanceUnit = dose.unit;
    item.substanceWords = amountToPolishWords(dose.total, dose.unit);
  } else if (!String(item.substanceWords || "").trim() && item.substanceQuantity) {
    const amount = Number(String(item.substanceQuantity).replace(",", "."));
    item.substanceWords = amountToPolishWords(amount, item.substanceUnit || dose.unit);
  }
  return item;
}

function therapyDays(item, dosesPerDay) {
  const perPack = packageUnits(item.drug) || 30;
  const packs = Number(item.quantity) || 1;
  const perDay = Math.max(1, Number(dosesPerDay) || 1);
  return Math.max(1, Math.floor((perPack * packs) / perDay));
}

/** New duration and dosage text after the number of packs changed, so "Wystarczy na" follows the packs. */
function durationPatchForQuantity(item, quantity, { rpw = false } = {}) {
  const asNeeded = !item.frequency && /doraźnie/i.test(item.dosage || "");
  if (!asNeeded && !Number(item.frequency)) return {};
  const perDay = asNeeded ? 1 : (Number(item.frequency) * (Number(String(item.doseQuantity || "1").replace(",", ".")) || 1)) / (item.periodHours === "48" ? 2 : 1);
  let days = therapyDays({ ...item, quantity }, perDay);
  if (item.annual && days > 360) days = 360;
  if (rpw && days > 90) days = 90;
  const patch = { durationDays: String(days) };
  patch.dosage = asNeeded
    ? `Doraźnie po ${item.doseQuantity || 1} ${item.doseUnit || "tabl."} przez ${days} dni`
    : composeDosage({ ...item, durationDays: String(days) });
  return patch;
}

function composeDosage(item) {
  if (!item.frequency && /doraźnie/i.test(item.dosage || "")) return "Doraźnie";
  const times = Number(item.frequency);
  const dose = String(item.doseQuantity || "").trim();
  const unit = item.doseUnit || "tabl.";
  const parts = [];
  if (item.periodHours === "48" && times === 1) parts.push("co 2 dni");
  else if (times === 1) parts.push("1 x dziennie");
  else if (times > 1) parts.push(`${times} x dziennie`);
  if (dose) parts.push(`po ${dose} ${unit}`);
  if (item.timeOfDay) parts.push(`(${item.timeOfDay})`);
  if (item.durationDays) parts.push(`przez ${item.durationDays} dni`);
  return parts.join(" ");
}

function withDosage(item, patch) {
  const next = { ...item, ...patch };
  if (!Object.prototype.hasOwnProperty.call(patch, "dosage")) next.dosage = composeDosage(next);
  return next;
}

function ageFromPesel(pesel) {
  const digits = String(pesel || "").replace(/\D/g, "");
  if (digits.length !== 11) return "";
  let year = Number(digits.slice(0, 2));
  let month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  if (month > 80) { year += 1800; month -= 80; }
  else if (month > 60) { year += 2200; month -= 60; }
  else if (month > 40) { year += 2100; month -= 40; }
  else if (month > 20) { year += 2000; month -= 20; }
  else year += 1900;
  const born = new Date(year, month - 1, day);
  if (Number.isNaN(born.getTime())) return "";
  let age = new Date().getFullYear() - born.getFullYear();
  const beforeBirthday = new Date().getMonth() < born.getMonth() || (new Date().getMonth() === born.getMonth() && new Date().getDate() < born.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? `${age} lat` : "";
}

function copyItems(payload) {
  const source = Array.isArray(payload?.items) && payload.items.length
    ? payload.items
    : payload?.drug
      ? [payload]
      : [];
  return source.map((item) => ({
    ...blankItem(payload?.form || item.category || "Rp"),
    drug: item.drug || (item.name ? { name: item.name } : null),
    quantity: String(item.quantity || "1"),
    payment: item.payment || "100%",
    refundCode: item.refundCode || "",
    dosage: item.dosage || "",
    frequency: item.frequency || "",
    periodHours: item.periodHours || "24",
    durationDays: item.durationDays || "",
    doseQuantity: item.doseQuantity || "",
    doseUnit: item.doseUnit || "tabl.",
    substanceName: item.substanceName || "",
    substanceQuantity: item.substanceQuantity || "",
    substanceUnit: item.substanceUnit || "g",
    substanceWords: item.substanceWords || "",
    recipeText: item.recipeText || "",
    recipeForm: item.recipeForm || "Maść (Unguentum)",
    recipePackaging: item.recipePackaging || "do 100 g (1 op. ryczałt)",
    recipePackageType: item.recipePackageType || "",
    recipeSummary: item.recipeSummary || "",
    recipeTemplate: item.recipeTemplate || "",
    ingredients: Array.isArray(item.ingredients)
      ? item.ingredients.map((ingredient, index) => ({ ...emptyIngredient(), ...ingredient, key: ingredient.key || `ing-copy-${index}` }))
      : [],
    patientNote: item.infoForPatient || item.patientNote || "",
    pharmacyNote: item.infoForPerformer || item.pharmacyNote || "",
    noSubstitution: item.noSubstitution === true,
    cito: item.cito === true,
    annual: item.annual === true,
    realizationFrom: item.realizationFrom || "",
    timeOfDay: item.timeOfDay || "",
    category: item.category || item.drug?.kdlek || item.drug?.category || "",
    icd10Code: item.icd10Code || "",
    icd10Display: item.icd10Display || "",
  }));
}

function blankItem(form) {
  return {
    key: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    drug: form === "recipe" ? { name: "Receptura własna" } : null,
    quantity: "1",
    payment: "100%",
    refundCode: "",
    dosage: "",
    frequency: "",
    periodHours: "24",
    durationDays: "",
    doseQuantity: "",
    doseUnit: "tabl.",
    substanceName: "",
    substanceQuantity: "",
    substanceUnit: "g",
    substanceWords: "",
    recipeText: "",
    patientNote: "",
    pharmacyNote: "",
    noSubstitution: false,
    cito: false,
    annual: false,
    realizationFrom: "",
    timeOfDay: "",
    category: "",
    icd10Code: "",
    icd10Display: "",
  };
}

function visitDiagnoses(rows) {
  return visitDiagnosisRows(rows).filter((row) => row.code);
}

function catalogClass(drug) {
  return classifyDrug(drug);
}

function itemKind(item, headerForm) {
  if (headerForm === "recipe") return "recipe";
  if (headerForm === "Rpz") return "Rpz";
  const fromDrug = classifyDrug(item?.drug || item);
  if (fromDrug === "Rpw" || fromDrug === "Rpz") return fromDrug;
  const raw = String(item?.category || item?.drug?.kdlek || item?.drug?.category || "").trim();
  if (raw === "Rpw") return "Rpw";
  if (raw === "Rpz") return "Rpz";
  if (headerForm === "Rpw") return "Rpw";
  return raw === "OTC" ? "OTC" : "Rp";
}

function buildPackages(items, headerForm) {
  if (headerForm === "recipe") return items.length ? [{ form: "recipe", items }] : [];
  if (headerForm === "Rpz") return items.length ? [{ form: "Rpz", items: items.slice(0, 1) }] : [];
  const rpw = [];
  const rpz = [];
  const regular = [];
  items.forEach((item) => {
    const kind = itemKind(item, headerForm);
    if (kind === "Rpw") rpw.push(item);
    else if (kind === "Rpz") rpz.push(item);
    else regular.push(item);
  });
  const packages = [];
  rpw.forEach((item) => packages.push({ form: "Rpw", items: [item] }));
  rpz.forEach((item) => packages.push({ form: "Rpz", items: [item] }));
  for (let index = 0; index < regular.length; index += 5) {
    packages.push({ form: "Rp", items: regular.slice(index, index + 5) });
  }
  return packages;
}

function review(header, items, patient) {
  const blocking = [];
  const passed = [];
  if (patient) {
    const pesel = String(patient.pesel || "").replace(/\D/g, "");
    if (pesel.length !== 11) blocking.push("Kto: brak prawidłowego numeru PESEL pacjenta.");
    else passed.push("Kto: pacjent i PESEL są na wizycie.");
    if (!patient.doctorName) blocking.push("Kto: brak lekarza wystawiającego.");
    else passed.push(`Kto: wystawia ${patient.doctorName}.`);
    const street = String(patient.street || "").trim();
    const postalCode = String(patient.postalCode || "").trim();
    const city = String(patient.city || "").trim();
    if (!street || !postalCode || !city) blocking.push("Gdzie: uzupełnij adres pacjenta — ulica, kod pocztowy i miasto.");
    else passed.push("Gdzie: adres pacjenta jest uzupełniony.");
  }
  if (!items.length) blocking.push("Kiedy: dodaj co najmniej jeden lek.");
  if ((header.form === "Rpz" || header.form === "recipe") && items.length > 1) blocking.push("Ten formularz mieści tylko jedną pozycję.");
  if (items.some((item) => itemKind(item, header.form) === "Rpw") && !header.examMode) {
    blocking.push("Recepta Rpw wymaga sposobu badania: osobiste albo teleporada.");
  }
  if (DOC_ENTITLEMENTS.includes(header.entitlement) && !header.entitlementDocument.trim()) {
    blocking.push("Uprawnienie dodatkowe wymaga numeru dokumentu.");
  }
  items.forEach((item, index) => {
    const name = item.drug?.name || `Pozycja ${index + 1}`;
    const kind = itemKind(item, header.form);
    if (header.form !== "recipe" && !item.drug?.ean && !item.drug?.code) blocking.push(`${name}: wybierz lek z bazy.`);
    if (!Number(item.quantity)) blocking.push(`${name}: wybierz liczbę opakowań.`);
    // ICD-10 is optional when the drug is fully paid by the patient (100%).
    if (item.payment !== "100%" && (!String(item.icd10Code || "").trim() || !String(item.icd10Display || "").trim())) {
      blocking.push(`${name}: przypisz rozpoznanie ICD-10 (kod i nazwa).`);
    }
    if (header.form === "recipe") {
      const named = (Array.isArray(item.ingredients) ? item.ingredients : []).filter((ingredient) => String(ingredient.name || "").trim());
      if (!named.length) blocking.push("Receptura wymaga co najmniej jednego surowca farmaceutycznego.");
      named.forEach((ingredient) => {
        if (!String(ingredient.amount || "").trim()) blocking.push(`${ingredient.name}: podaj ilość surowca.`);
      });
      if (!String(item.recipeForm || "").trim()) blocking.push("Wybierz postać leku recepturowego.");
      if (!String(item.recipePackaging || "").trim()) blocking.push("Wybierz ilość opakowania receptury.");
    }
    const dosing = String(item.dosage || "");
    const scheme = item.annual || (item.payment && item.payment !== "100%");
    if (kind === "Rpw" && item.annual) blocking.push(`${name}: recepta Rpw nie może być roczna (maks. 30 dni).`);
    if (header.form === "recipe" && item.annual) blocking.push(`${name}: receptura nie może być receptą na 365 dni.`);
    if (kind === "Rpw" && item.realizationFrom && item.realizationFrom !== todayIso()) {
      blocking.push(`${name}: recepty Rpw nie można odroczyć.`);
    }
    if (kind === "Rpw" && /doraźnie/i.test(dosing)) blocking.push(`${name}: dawkowanie doraźne jest zablokowane na Rpw.`);
    if (item.annual && /doraźnie/i.test(dosing)) blocking.push(`${name}: dawkowanie doraźne jest zablokowane na leku ważnym 365 dni.`);
    if (scheme && header.form !== "recipe") {
      if (!Number(item.frequency) || !Number(item.durationDays) || !Number(item.doseQuantity)) {
        blocking.push(`${name}: uzupełnij schemat dawkowania (ile razy, dawka, liczba dni).`);
      }
    } else if (dosing.trim().length < 3) {
      blocking.push(`${name}: brak dawkowania.`);
    }
    if (kind === "Rpw") {
      if (!String(item.substanceName || item.drug?.activeSubstance || "").trim()) blocking.push(`${name}: podaj nazwę substancji czynnej.`);
      if (!Number(String(item.substanceQuantity || "").replace(",", ".")) || !String(item.substanceUnit || "").trim()) {
        blocking.push(`${name}: podaj łączną ilość substancji czynnej.`);
      }
      if (!/[A-Za-zÀ-ž]/.test(String(item.substanceWords || "")) || String(item.substanceWords || "").trim().length < 3) {
        blocking.push(`${name}: ilość substancji czynnej musi być zapisana słownie.`);
      }
      if (Number(item.durationDays) > 90) blocking.push("Kuracja Rpw może trwać najwyżej 90 dni.");
    }
  });
  if (items.length && !blocking.some((row) => row.startsWith("Kiedy"))) passed.push("Kiedy: daty i ważność nie blokują podpisu.");
  return { blocking, passed };
}

function reviewTabs(header, tabs, patient) {
  const filled = tabs.filter((tab) => tab.items.length);
  if (!filled.length) return review({ ...header, form: tabs[0]?.form || header.form }, [], patient);
  const blocking = [];
  const passed = [];
  filled.forEach((tab, index) => {
    const part = review({
      ...header,
      form: tab.form,
      kind: tab.kind || header.kind,
      examMode: tab.examMode || "",
    }, tab.items, index === 0 ? patient : null);
    part.blocking.forEach((row) => blocking.push(filled.length > 1 ? `${tab.title}: ${row}` : row));
    if (index === 0) passed.push(...part.passed);
  });
  return { blocking, passed };
}

export default function EPrescriptionIssueModal({
  open,
  onClose,
  visitId,
  patientId,
  patient,
  onDocumentsChanged,
  onPatientSaved,
  initialPayload,
  diagnoses = [],
}) {
  const [header, setHeader] = useState(() => ({
    form: initialPayload?.items?.length ? (initialPayload.form || "Rp") : (initialPayload?.form || ""),
    kind: initialPayload?.kind || "ZW",
    examMode: initialPayload?.examMode || "",
    entitlement: initialPayload?.entitlement || "",
    entitlementDocument: initialPayload?.entitlementDocument || "",
  }));
  const [tabs, setTabs] = useState(() => [{
    id: "rx-1",
    title: "e-Recepta #1",
    form: initialPayload?.items?.length ? (initialPayload.form || "Rp") : (initialPayload?.form || ""),
    kind: initialPayload?.kind || "ZW",
    examMode: initialPayload?.examMode || "",
    items: copyItems(initialPayload),
  }]);
  const [activeTabId, setActiveTabId] = useState("rx-1");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
  const items = activeTab?.items || [];
  const setItems = (updater) => {
    setTabs((prev) => prev.map((tab) => {
      if (tab.id !== activeTab?.id) return tab;
      const nextItems = typeof updater === "function" ? updater(tab.items) : updater;
      return { ...tab, items: nextItems };
    }));
  };
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [historyDrugs, setHistoryDrugs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [issued, setIssued] = useState([]);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState(() => normalizePatient(patient));

  useEffect(() => {
    if (!open) return;
    setDetails(normalizePatient(patient));
  }, [open, patientId]);

  useEffect(() => {
    if (!open || !patientId) return undefined;
    let cancelled = false;
    ehealthHelper.history({ patientId }).then((res) => {
      if (!cancelled) setHistoryDrugs(drugsFromHistory(res?.data));
    }).catch(() => {
      if (!cancelled) setHistoryDrugs([]);
    });
    return () => { cancelled = true; };
  }, [open, patientId]);

  useEffect(() => {
    if (!open || header.form === "recipe") return undefined;
    const term = query.trim();
    if (term.length < 2) {
      setCatalog([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await ehealthHelper.searchDrugs(term, "", header.form === "Rpw" ? "Rpw" : "");
        if (!cancelled) setCatalog(res?.data || []);
      } catch (err) {
        if (!cancelled) {
          setCatalog([]);
          toast.error(unwrapEhealthError(err).message);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, header.form]);

  const checks = useMemo(() => reviewTabs(header, tabs, details), [header, tabs, details]);
  const packages = useMemo(
    () => tabs.flatMap((tab) => buildPackages(tab.items, tab.form).map((pack) => ({ ...pack, title: tab.title }))),
    [tabs],
  );

  if (!open) return null;

  const patchHeader = (patch) => setHeader((prev) => ({ ...prev, ...patch }));
  const setActiveForm = (form) => {
    const recipeBlank = header.form === "recipe" && items.every((item) => !(item.ingredients || []).some((ingredient) => String(ingredient.name || "").trim()) && !String(item.dosage || "").trim());
    if (form === header.form) return;
    if (items.length && !recipeBlank && !window.confirm("Zmiana typu recepty usunie leki dodane do tej recepty. Kontynuować?")) return;
    setHeader((prev) => ({ ...prev, form }));
    setTabs((prev) => prev.map((tab) => {
      if (tab.id !== activeTabId) return tab;
      if (form === "recipe") return { ...tab, form, items: [blankRecipe(diagnoses)] };
      return { ...tab, form, items: [] };
    }));
  };
  const selectTab = (id) => {
    const tab = tabs.find((row) => row.id === id);
    setActiveTabId(id);
    if (tab) setHeader((prev) => ({ ...prev, form: tab.form, kind: tab.kind || "ZW", examMode: tab.examMode || "" }));
  };
  const setActiveKind = (kind) => {
    setHeader((prev) => ({ ...prev, kind }));
    setTabs((prev) => prev.map((tab) => (tab.id === activeTabId ? { ...tab, kind } : tab)));
  };
  const setActiveExam = (examMode) => {
    setHeader((prev) => ({ ...prev, examMode }));
    setTabs((prev) => prev.map((tab) => (tab.id === activeTabId ? { ...tab, examMode } : tab)));
  };
  const addPrescription = () => {
    if (!items.length) {
      toast.error("Dodaj najpierw co najmniej 1 lek do bieżącej recepty.");
      return;
    }
    const id = `rx-${Date.now()}`;
    const title = `e-Recepta #${tabs.length + 1}`;
    setTabs((prev) => [...prev, { id, title, form: "", kind: header.kind || "ZW", examMode: "", items: [] }]);
    setActiveTabId(id);
    setHeader((prev) => ({ ...prev, form: "", examMode: "" }));
    setQuery("");
    toast.success(`${title} jest gotowa. Dodaj leki tej recepty.`);
  };
  const closeTab = (id) => {
    if (tabs.length < 2) return;
    const filtered = tabs.filter((tab) => tab.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
      setHeader((prev) => ({ ...prev, form: filtered[0].form, kind: filtered[0].kind || "ZW", examMode: filtered[0].examMode || "" }));
    }
  };
  const patchItem = (key, patch) => setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addDrug = (drug) => {
    if (!header.form) {
      toast.error("Najpierw wybierz typ recepty. Dopiero wtedy można dodać lek.");
      return;
    }
    const klass = catalogClass(drug);
    if (header.form === "Rp" && klass === "Rpw") {
      if (items.length > 0) {
        toast.error("Lek psychotropowy nie może być dodany do recepty Rp. Dodaj nową receptę i wybierz typ Rpw.");
        return;
      }
      const item = blankItem("Rpw");
      item.drug = drug;
      item.category = "Rpw";
      fillRpwSubstance(item);
      item.payment = drug.reimbursed ? "30%" : "100%";
      setHeader((prev) => ({ ...prev, form: "Rpw" }));
      setTabs((prev) => prev.map((tab) => (tab.id !== activeTab?.id ? tab : { ...tab, form: "Rpw", items: [item] })));
      setQuery("");
      setCatalog([]);
      toast.success("To jest lek Rpw. Recepta została przełączona na Rpw.");
      return;
    }
    if (header.form === "Rp" && klass === "Rpz") {
      toast.error("Lek Rpz wymaga osobnej recepty. Dodaj nową receptę i wybierz typ Rpz.");
      return;
    }
    if (header.form === "Rpw" && klass !== "Rpw") {
      toast.error("Na recepcie Rpw można dodać tylko lek odurzający lub psychotropowy.");
      return;
    }
    if (header.form === "Rpz" && klass && klass !== "Rpz") {
      toast.error("Na recepcie Rpz można dodać tylko lek o kategorii Rpz.");
      return;
    }
    if ((header.form === "recipe" || header.form === "Rpz" || header.form === "Rpw") && items.length >= 1) {
      toast.error("Ten formularz mieści tylko jedną pozycję.");
      return;
    }
    if (header.form === "Rp" && items.length >= 5) {
      toast.error("Osiągnięto limit 5 leków. Utwórz nową receptę.");
      return;
    }
    const item = blankItem(header.form);
    item.drug = drug;
    item.category = header.form === "Rpw" ? "Rpw" : header.form === "Rpz" ? "Rpz" : (klass === "OTC" ? "OTC" : "Rp");
    if (header.form === "Rpw") fillRpwSubstance(item);
    else item.substanceName = drug.activeSubstance || "";
    item.payment = drug.reimbursed ? "30%" : "100%";
    setItems((prev) => [...prev, item]);
    setQuery("");
    setCatalog([]);
  };

  const itemFromHistory = (row) => {
    const item = blankItem("Rp");
    item.drug = row.drug || { name: row.name };
    item.category = row.category || "";
    item.quantity = String(row.quantity || "1");
    item.payment = row.payment || "100%";
    item.dosage = row.dosage || "";
    item.frequency = row.frequency || "";
    item.durationDays = row.durationDays || "";
    item.doseQuantity = row.doseQuantity || "";
    item.doseUnit = row.doseUnit || "tabl.";
    item.timeOfDay = row.timeOfDay || "";
    item.annual = row.annual === true;
    item.cito = row.cito === true;
    item.realizationFrom = row.realizationFrom || "";
    item.noSubstitution = row.noSubstitution === true;
    item.substanceName = row.substanceName || row.drug?.activeSubstance || "";
    item.icd10Code = row.icd10Code || "";
    item.icd10Display = row.icd10Display || "";
    return item;
  };

  const repeatFromHistory = (rows) => {
    if (!rows.length) return;
    const stamp = Date.now();
    const kept = tabs.map((tab) => ({ ...tab, items: tab.items.slice() }));
    const rpItems = [];
    const separate = [];
    rows.forEach((row) => {
      const klass = catalogClass(row.drug) || catalogClass({ category: row.category, isRpw: row.isRpw || row.drug?.isRpw });
      const item = itemFromHistory(row);
      if (klass === "Rpw") {
        item.category = "Rpw";
        fillRpwSubstance(item);
        separate.push({ form: "Rpw", item });
      } else if (klass === "Rpz") {
        item.category = "Rpz";
        separate.push({ form: "Rpz", item });
      } else {
        if (item.category === "Rpw" || item.category === "Rpz") item.category = "Rp";
        rpItems.push(item);
      }
    });
    const created = [];
    for (let offset = 0; offset < rpItems.length; offset += 5) {
      created.push({
        id: `rx-${stamp}-rp-${offset}`,
        form: "Rp",
        kind: header.kind || "ZW",
        examMode: "",
        items: rpItems.slice(offset, offset + 5),
      });
    }
    separate.forEach((entry, index) => {
      created.push({
        id: `rx-${stamp}-${entry.form}-${index}`,
        form: entry.form,
        kind: header.kind || "ZW",
        examMode: entry.form === "Rpw" ? (header.examMode || "") : "",
        items: [entry.item],
      });
    });
    if (!created.length) return;
    created.forEach((tab, index) => {
      tab.title = `e-Recepta #${kept.length + index + 1}`;
    });
    const focus = created[0];
    setTabs([...kept, ...created]);
    setActiveTabId(focus.id);
    setHeader((prev) => ({ ...prev, form: focus.form, kind: focus.kind || "ZW", examMode: focus.examMode || "" }));
    setHistoryOpen(false);
    toast.success(created.length === 1 ? "Utworzono nową receptę z historii. Bieżąca recepta została bez zmian." : `Utworzono ${created.length} nowe recepty z historii. Bieżąca recepta została bez zmian.`);
    if (rows.some((row) => !row.dosage)) toast.message("Część leków z P1 nie ma dawkowania. Uzupełnij je przed podpisem.");
  };

  const mapPayloadItem = (item, form) => ({
    drug: form === "recipe" ? { ...(item.drug || {}), name: recipeDrugName(item) } : item.drug,
    category: form === "recipe" ? "Rp" : itemKind(item, form),
    quantity: item.quantity,
    payment: item.payment,
    refundCode: item.refundCode,
    icd10Code: item.icd10Code,
    icd10Display: item.icd10Display,
    dosage: item.dosage,
    frequency: item.frequency,
    periodHours: item.periodHours,
    durationDays: item.durationDays,
    doseQuantity: item.doseQuantity,
    doseUnit: item.doseUnit,
    timeOfDay: item.timeOfDay,
    infoForPatient: item.patientNote,
    infoForPerformer: form === "recipe"
      ? [item.pharmacyNote, item.recipePackageType ? `Opakowanie: ${item.recipePackageType}` : ""].filter(Boolean).join(". ")
      : item.pharmacyNote,
    substanceName: item.substanceName,
    substanceQuantity: item.substanceQuantity,
    substanceUnit: item.substanceUnit,
    substanceWords: item.substanceWords,
    recipeText: form === "recipe" ? (recipeLines(item).join("\n") || item.recipeText) : item.recipeText,
    recipeSummary: item.recipeSummary,
    ingredients: item.ingredients,
    noSubstitution: item.noSubstitution,
    cito: item.cito,
    annual: form === "Rpw" || form === "recipe" ? false : item.annual,
    realizationFrom: form === "Rpw" ? "" : item.realizationFrom,
  });

  const submitSigned = async () => {
    const packs = tabs.flatMap((tab) => buildPackages(tab.items, tab.form).map((pack) => ({
      ...pack,
      kind: tab.kind || "ZW",
      examMode: tab.examMode || "",
    })));
    const rows = [];
    for (const pack of packs) {
      const payload = {
        ...header,
        form: pack.form,
        kind: pack.kind,
        examMode: pack.examMode,
        signConfirmed: true,
        patientForDocument: patientForDocument(details),
        items: pack.items.map((item) => mapPayloadItem(item, pack.form)),
      };
      try {
        const res = await ehealthHelper.submitPrescription({ visitId, patientId, payload });
        if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
        if (res.licenseWarning) toast.warning(res.licenseWarning);
        rows.push({ form: pack.form, items: pack.items, result: res.data, error: "" });
      } catch (err) {
        rows.push({ form: pack.form, items: pack.items, result: null, error: unwrapEhealthError(err).message });
      }
    }
    if (!rows.some((row) => row.result?.id)) {
      throw new Error(rows.find((row) => row.error)?.error || "Wystawianie nieudane");
    }
    onDocumentsChanged?.();
    setIssued(rows);
    const failed = rows.filter((row) => row.error || row.result?.status === "failed");
    if (failed.length) toast.error(failed[0].error || failed[0].result?.error?.message || "Część recept nie została przyjęta.");
    else toast.success(rows.length > 1 ? `Podpisano ${rows.length} recepty. Każda ma osobny kod.` : "E-recepta jest na liście dokumentów tej wizyty.");
  };

  const cancelIssued = async (id, reason) => {
    try {
      const res = await ehealthHelper.cancelDocument("prescription", id, reason);
      setIssued((prev) => prev.map((row) => (row.result?.id === id ? { ...row, result: res?.data || { ...row.result, status: "cancelled" } } : row)));
      onDocumentsChanged?.();
      toast.success("e-Recepta anulowana.");
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[1540px] h-[93vh] max-h-[960px] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#1e7a6f] px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center"><Pill size={20} /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-100/80">Centrum Medyczne 7 • System e-zdrowie (P1)</div>
              <h2 className="text-lg font-semibold">Moduł wystawiania e-recepty</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!issued.length && (
              <button type="button" onClick={() => setHistoryOpen(true)} title="Pobierz historię wystawionych e-recept pacjenta" className="px-3 py-1.5 rounded-lg border border-white/40 text-white text-sm font-semibold inline-flex items-center gap-1 hover:bg-white/10">
                <History size={14} /> Pobierz historię
              </button>
            )}
            {!issued.length && (
              <button type="button" onClick={addPrescription} title="Dodaj nową e-receptę do tej wizyty" className="px-3 py-1.5 rounded-lg border border-white/40 text-white text-sm font-semibold inline-flex items-center gap-1 hover:bg-white/10">
                <Plus size={14} /> Nowa recepta
              </button>
            )}
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Zamknij"><X size={16} /></button>
          </div>
        </div>

        <IssueSummaryBar patientName={details?.name} pesel={details?.pesel} birthDate={details?.birthDate} address={details?.address || "brak adresu"} doctorName={patient?.doctorName} pwz={patient?.pwz} patientId={patientId} visitId={visitId} />

        {issued.length ? (
          <IssuedBatch
            rows={issued}
            patient={details}
            onCancel={cancelIssued}
            onClose={onClose}
            onAnother={() => {
              const id = `rx-${Date.now()}`;
              setIssued([]);
              setTabs([{ id, title: "e-Recepta #1", form: "", kind: "ZW", examMode: "", items: [] }]);
              setActiveTabId(id);
              setHeader((prev) => ({ ...prev, form: "", kind: "ZW", examMode: "" }));
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100/70">
            <aside className="w-full lg:w-[340px] shrink-0 border-r border-slate-200 bg-white p-3.5 overflow-y-auto space-y-3 text-xs">
              <IssuePatientCard patient={details} patientId={patientId} onChange={setDetails} onSavedToRecord={onPatientSaved} />
              <section className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ubezpieczenie i uprawnienia</div>
                <select value={header.entitlement} onChange={(e) => patchHeader({ entitlement: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                  {ENTITLEMENTS.map(([value, label]) => <option key={value || "none"} value={value}>{label}</option>)}
                </select>
                {DOC_ENTITLEMENTS.includes(header.entitlement) && (
                  <input value={header.entitlementDocument} onChange={(e) => patchHeader({ entitlementDocument: e.target.value })} placeholder="Nr dokumentu uprawnienia" className="w-full p-2 border border-slate-300 rounded-lg" />
                )}
              </section>
              <section className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="font-bold uppercase tracking-wider text-slate-500">Kontrola: kto, gdzie, kiedy</div>
                {checks.blocking.map((row) => <p key={row} className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{row}</p>)}
                {checks.passed.map((row) => <p key={row} className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2">{row}</p>)}
                {!checks.blocking.length && tabs.some((tab) => tab.items.length) && <p className="font-semibold text-emerald-800">Brak błędów blokujących podpis.</p>}
              </section>
              {packages.length > 0 && (
                <section className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="font-bold uppercase tracking-wider text-slate-500">Recepty do podpisu</div>
                  {packages.map((pack, index) => (
                    <div key={`${pack.title}-${pack.form}-${index}`} className="bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-800">{pack.title} · {pack.form === "Rpw" ? "Rpw — osobna" : pack.form}</div>
                      {pack.items.map((item) => (
                        <div key={item.key} className="text-slate-600 break-words">
                          {item.drug?.name || "Receptura"}
                          {item.cito ? " · CITO" : ""}
                          {item.annual ? " · 365 dni" : ""}
                          {item.realizationFrom && item.realizationFrom > todayIso() ? ` · od ${item.realizationFrom}` : ""}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              )}
            </aside>

            <main className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab) => (
                  <div key={tab.id} className={`inline-flex items-center rounded-lg border ${tab.id === activeTab.id ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-700 border-slate-300"}`}>
                    <button type="button" onClick={() => selectTab(tab.id)} className="px-3 py-1.5 text-sm font-medium">
                      {tab.title}{tab.items.length ? ` (${tab.items.length})` : ""}
                    </button>
                    {tabs.length > 1 && (
                      <button type="button" onClick={() => closeTab(tab.id)} className="pr-2 opacity-80 hover:opacity-100" aria-label={`Zamknij ${tab.title}`}><X size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
              <section className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Parametry: {activeTab.title}</div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {!header.form ? "Wybierz typ" : header.form === "Rp" ? `${items.length}/5 leków` : header.form === "Rpw" ? "1 lek · 30 dni" : "1 pozycja"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={header.form} onChange={(e) => setActiveForm(e.target.value)} aria-label="Typ recepty" className="p-2 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">Wybierz typ recepty</option>
                    <option value="Rp">Rp — do 5 leków</option>
                    <option value="Rpw">Rpw — 1 lek odurzający / psychotropowy</option>
                    <option value="Rpz">Rpz — 1 pozycja</option>
                    <option value="recipe">Receptura — opis słowny</option>
                  </select>
                  <select value={header.kind} onChange={(e) => setActiveKind(e.target.value)} aria-label="Kontekst recepty" className="p-2 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="ZW">Zwykła</option>
                    <option value="PA">Pro auctore</option>
                    <option value="PF">Pro familiae</option>
                  </select>
                  {(header.form === "Rpw" || items.some((item) => itemKind(item, header.form) === "Rpw")) && (
                    <select value={header.examMode} onChange={(e) => setActiveExam(e.target.value)} aria-label="Sposób badania" className="p-2 border border-slate-300 rounded-lg text-sm bg-white">
                      <option value="">Sposób badania</option>
                      <option value="BADANIE_OSOBISTE">Badanie osobiste</option>
                      <option value="TELEPORADA">Teleporada</option>
                    </select>
                  )}
                </div>
                {header.form === "Rpw" && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">Tryb Rpw: jeden lek, ważność 30 dni, kuracja maksymalnie 90 dni, bez odroczenia realizacji.</p>
                )}
              </section>
              {!header.form ? (
                <div className="border border-dashed border-slate-300 bg-white rounded-xl p-4 text-sm text-slate-600">
                  Wybierz typ recepty powyżej. Wyszukiwanie i dodawanie leków jest dostępne dopiero po wybraniu typu.
                </div>
              ) : header.form === "recipe" ? (
                <RecipeCard
                  item={items[0] || blankRecipe(diagnoses)}
                  diagnoses={visitDiagnoses(diagnoses)}
                  onChange={(patch) => setItems((prev) => [syncRecipeItem(prev[0] || blankRecipe(diagnoses), patch)])}
                  onClear={() => setItems([blankRecipe(diagnoses)])}
                />
              ) : header.form === "Rp" && items.length >= 5 ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-amber-900">Osiągnięto limit 5 leków. Utwórz nową receptę.</p>
                  <button type="button" onClick={addPrescription} className="px-3 py-1.5 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold inline-flex items-center gap-1">
                    <Plus size={14} /> Utwórz nową receptę
                  </button>
                </div>
              ) : (header.form === "Rpw" || header.form === "Rpz") && items.length >= 1 ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-amber-900">Ta recepta mieści jeden lek. Dodaj nową receptę, aby wystawić kolejny.</p>
                  <button type="button" onClick={addPrescription} className="px-3 py-1.5 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold inline-flex items-center gap-1">
                    <Plus size={14} /> Nowa recepta
                  </button>
                </div>
              ) : (
                <>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nazwa leku, substancja, EAN" className="w-full p-3 border border-slate-300 rounded-xl text-sm" />
                  {searching && <p className="text-xs text-slate-500">Szukam w bazie leków…</p>}
                  {header.form === "Rpw" && !searching && catalog.length > 0 && !catalog.some((drug) => catalogClass(drug) === "Rpw") && (
                    <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">Znalezione leki nie są odurzające ani psychotropowe. Na recepcie Rpw można dodać tylko lek typu Rpw.</p>
                  )}
                  {!searching && query.trim().length >= 2 && catalog.length === 0 && (
                    <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">Brak leków w bazie dla „{query.trim()}”.</p>
                  )}
                  <DrugList title="Z historii wizyt" drugs={(query.trim() ? historyDrugs.filter((drug) => drugMatches(drug, query)) : []).filter((drug) => header.form === "Rp" || catalogClass(drug) === header.form)} onAdd={addDrug} />
                  <DrugList title="Baza leków" drugs={catalog.filter((drug) => header.form === "Rp" || catalogClass(drug) === header.form)} onAdd={addDrug} />
                </>
              )}
              {header.form !== "recipe" && items.map((item, index) => (
                <DrugCard
                  key={item.key}
                  item={item}
                  index={index}
                  form={header.form === "Rpw" ? "Rpw" : header.form === "recipe" ? "recipe" : "Rp"}
                  diagnoses={visitDiagnoses(diagnoses)}
                  onChange={(patch) => patchItem(item.key, patch)}
                  onRemove={() => setItems((prev) => prev.filter((row) => row.key !== item.key))}
                />
              ))}
            </main>
          </div>
        )}

        {!issued.length && (
          <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 bg-white">
            <button type="button" onClick={() => setPreviewOpen(true)} className="text-sm font-semibold text-[#0D5C46] inline-flex items-center gap-1"><Eye size={16} /> Podgląd</button>
            <button
              type="button"
              disabled={checks.blocking.length > 0}
              onClick={() => setSignOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0D5C46] text-white text-sm font-semibold disabled:opacity-40"
            >
              Podpisz {packages.length > 1 ? `${packages.length} recepty` : "i wyślij e-receptę"}
            </button>
          </div>
        )}
      </div>

      {previewOpen && (
        <PreviewOverlay
          items={tabs.flatMap((tab) => tab.items)}
          header={{ ...header, form: packages.length > 1 ? `${packages.length} recepty` : header.form }}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      <PrescriptionHistoryModal
        open={historyOpen}
        patientId={patientId}
        patientName={details?.name}
        onClose={() => setHistoryOpen(false)}
        onRepeat={repeatFromHistory}
      />
      <P1SignDialog
        open={signOpen}
        title="Autoryzacja wysyłki do P1"
        actionText="Podpisz i wyślij"
        doctorLine={[patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ") || "Bezpieczny podpis P1"}
        onClose={() => setSignOpen(false)}
        onConfirm={async () => {
          try {
            setBusy(true);
            await submitSigned();
            setSignOpen(false);
          } catch (err) {
            toast.error(unwrapEhealthError(err).message);
            throw err;
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-sm">
          <span>{packages.length <= 1 ? "1 e-recepta" : `${packages.length} e-recepty, każda z osobnym kodem`}</span>
          <button type="button" onClick={() => setPreviewOpen(true)} className="text-slate-700 font-semibold text-xs underline underline-offset-4">Podgląd</button>
        </div>
      </P1SignDialog>
    </div>
  );
}

function Switch({ checked, onClick, onClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onClick}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ${checked ? onClass : "bg-slate-200"}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <span className={`text-xs font-bold ${checked ? "text-slate-900" : "text-slate-700"}`}>{label}</span>
    </div>
  );
}

function IcdPicker({ diagnoses, code, name, onChange, optional }) {
  return <IcdCombobox visitDiagnoses={diagnoses} code={code} name={name} onChange={onChange} optional={optional} />;
}

const COMMON_RAW_MATERIALS = [
  "Hydrocortisonum", "Urea", "Acidum salicylicum", "Acidum boricum", "Eucerinum anhydricum", "Vaselinum album",
  "Paraffinum liquidum", "Lekobaza", "Cholesteroli unguentum", "Aqua purificata", "Ethanolum 70°", "Glycerolum 85%",
  "Zinci oxydum", "Mentholum", "Chloramphenicolum", "Nystatinum", "Prednisolonum", "Metronidazolum",
];

const ingredientCache = new Map();

function foldText(text) {
  return String(text || "").toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function IngredientNameField({ value, onChange, onPick }) {
  const [hits, setHits] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);
  const term = String(value || "").trim();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open || term.length < 2) {
      setHits([]);
      setSearching(false);
      setFailed(false);
      return undefined;
    }
    const key = foldText(term);
    if (ingredientCache.has(key)) {
      setHits(ingredientCache.get(key));
      setSearching(false);
      setFailed(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        setFailed(false);
        const res = await ehealthHelper.searchDrugs(term, "ingredient");
        const rows = Array.isArray(res?.data) ? res.data : [];
        ingredientCache.set(key, rows);
        if (!cancelled) setHits(rows);
      } catch {
        if (!cancelled) {
          setHits([]);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, open]);

  const quick = useMemo(() => {
    const q = foldText(term);
    return COMMON_RAW_MATERIALS.filter((name) => !q || foldText(name).includes(q)).map((name) => ({ name, quick: true }));
  }, [term]);
  const seen = new Set(quick.map((row) => foldText(row.name)));
  const dictionary = hits.filter((row) => {
    const key = `${foldText(row.name)}|${row.producer || ""}|${row.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const flat = [...quick, ...dictionary];

  useEffect(() => { setCursor(0); }, [term, open]);

  const choose = (row) => {
    if (row.quick) onChange(row.name);
    else onPick(row);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setCursor((i) => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && open && flat[cursor] && term) { e.preventDefault(); choose(flat[cursor]); }
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        value={value || ""}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setOpen(true); onChange(e.target.value); }}
        onKeyDown={onKeyDown}
        placeholder="Wpisz lub wybierz surowiec, np. Hydrocortisonum"
        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {quick.length > 0 && (
            <>
              <div className="sticky top-0 border-b border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Najczęstsze surowce</div>
              <ul className="divide-y divide-slate-100">
                {quick.map((row, i) => (
                  <li key={`q-${row.name}`}>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); choose(row); }} onMouseEnter={() => setCursor(i)} className={`w-full px-3 py-1.5 text-left text-xs font-medium text-slate-800 ${cursor === i ? "bg-emerald-50" : ""}`}>
                      {row.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {term.length >= 2 && (
            <>
              <div className="sticky top-0 border-b border-t border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Baza surowców RPL (Medfile)</div>
              <ul className="divide-y divide-slate-100">
                {dictionary.map((drug, j) => {
                  const i = quick.length + j;
                  return (
                    <li key={`d-${drug.id || drug.name}-${j}`}>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); choose(drug); }} onMouseEnter={() => setCursor(i)} className={`w-full px-3 py-1.5 text-left ${cursor === i ? "bg-emerald-50" : ""}`}>
                        <span className="text-xs font-medium text-slate-900">{drug.name}</span>
                        {drug.expired && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">pozwolenie wygasło</span>}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {[drug.polishName || drug.activeSubstance, drug.strength, drug.form, drug.producer, drug.code, drug.unit].filter(Boolean).join(" · ")}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {searching && <li className="px-3 py-2 text-[11px] text-slate-500">Szukam w bazie surowców…</li>}
                {!searching && failed && <li className="px-3 py-2 text-[11px] text-slate-400">Nie udało się przeszukać bazy. Możesz zostawić wpisaną nazwę.</li>}
                {!searching && !failed && dictionary.length === 0 && <li className="px-3 py-2 text-[11px] text-slate-400">Brak w bazie — możesz zostawić wpisaną nazwę.</li>}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ item, diagnoses, onChange, onClear }) {
  const [optionsOpen, setOptionsOpen] = useState(Boolean(item.recipePackageType || item.recipeSummary));
  const ingredients = Array.isArray(item.ingredients) && item.ingredients.length ? item.ingredients : [emptyIngredient(), emptyIngredient("100,0", "ad")];
  const hasNames = ingredients.some((ingredient) => String(ingredient.name || "").trim());

  const updateIngredient = (key, patch) => {
    onChange({ ingredients: ingredients.map((ingredient) => (ingredient.key === key ? { ...ingredient, ...patch } : ingredient)) });
  };

  const applyChip = (chip) => {
    let next = String(item.dosage || "").trim();
    if (chip === "przez 14 dni") {
      next = next.includes(chip) ? next.replace(/\s*przez 14 dni/g, "").trim() : (next ? `${next} przez 14 dni` : chip);
    } else if (next.includes(chip)) {
      next = next.replace(chip, "").replace(/\s+/g, " ").trim();
    } else {
      DOSAGE_CHIPS.filter((row) => row !== "przez 14 dni").forEach((row) => { next = next.replace(row, "").trim(); });
      next = next ? `${chip} ${next}`.replace(/\s+/g, " ").trim() : chip;
    }
    onChange({ dosage: next });
  };

  const loadTemplate = (name) => {
    const template = RECIPE_TEMPLATES.find((row) => row.name === name);
    if (!template) {
      onChange({ recipeTemplate: "" });
      return;
    }
    onChange({
      recipeTemplate: template.name,
      recipeForm: template.form,
      recipePackaging: template.packaging,
      payment: template.payment,
      dosage: template.dosage,
      ingredients: template.ingredients.map((ingredient) => ({ ...ingredient, key: emptyIngredient().key })),
      ...recipeDefaultsForForm(template.form),
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Lek recepturowy (1/1)</h3>
        {hasNames && (
          <button type="button" onClick={onClear} className="text-xs text-rose-700 border border-rose-200 rounded-lg px-2 py-1 inline-flex items-center gap-1">
            <Trash2 size={14} /> Wyczyść skład
          </button>
        )}
      </div>
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-3.5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-900">Skład i parametry leku recepturowego</h4>
          <label className="text-[11px] font-semibold text-slate-600 inline-flex items-center gap-2">
            Szablon receptury:
            <select value={item.recipeTemplate || ""} onChange={(e) => loadTemplate(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800">
              <option value="">— Wybierz gotowy szablon —</option>
              {RECIPE_TEMPLATES.map((template) => <option key={template.name} value={template.name}>{template.name}</option>)}
            </select>
          </label>
        </div>
        <div className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <label className="md:col-span-4 block space-y-1">
              <span className="font-bold text-slate-700">Postać leku recepturowego: *</span>
              <select value={item.recipeForm || RECIPE_FORMS[0]} onChange={(e) => onChange({ recipeForm: e.target.value, ...recipeDefaultsForForm(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg font-medium">
                {RECIPE_FORMS.map((form) => <option key={form} value={form}>{form}</option>)}
              </select>
            </label>
            <label className="md:col-span-3 block space-y-1">
              <span className="font-bold text-slate-700">Ilość / opakowanie: *</span>
              <select value={item.recipePackaging || RECIPE_PACKS[0]} onChange={(e) => onChange({ recipePackaging: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg font-semibold">
                {RECIPE_PACKS.map((pack) => <option key={pack} value={pack}>{pack}</option>)}
              </select>
            </label>
            <label className="md:col-span-2 block space-y-1">
              <span className="font-bold text-slate-700">Odpłatność: *</span>
              <select value={item.payment === "100%" ? "100%" : "R"} onChange={(e) => onChange({ payment: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg font-semibold">
                <option value="R">R — Ryczałt</option>
                <option value="100%">100% — pełnopłatny</option>
              </select>
            </label>
            <div className="md:col-span-3">
              <IcdPicker
                diagnoses={diagnoses}
                code={item.icd10Code}
                name={item.icd10Display}
                optional={item.payment === "100%"}
                onChange={(next) => onChange({ icd10Code: next.code, icd10Display: next.name })}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-800">Rp. — Surowce farmaceutyczne: *</span>
              <span className="text-[10px] text-slate-400">Wymagany skład ilościowo-jakościowy</span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-medium text-slate-500 px-1">
                <div className="col-span-6">Surowiec farmaceutyczny (baza RPL) *</div>
                <div className="col-span-3">Formuła (łac / ad)</div>
                <div className="col-span-2">Ilość / jedn. *</div>
                <div className="col-span-1 text-center">Usuń</div>
              </div>
              {ingredients.map((ingredient) => {
                return (
                  <div key={ingredient.key} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-6">
                      <IngredientNameField
                        value={ingredient.name}
                        onChange={(name) => updateIngredient(ingredient.key, { name })}
                        onPick={(drug) => updateIngredient(ingredient.key, { name: drug.name || drug.activeSubstance || "" })}
                      />
                    </div>
                    <select value={ingredient.modifier || "none"} onChange={(e) => updateIngredient(ingredient.key, { modifier: e.target.value })} className="md:col-span-3 p-2 bg-white border border-slate-300 rounded-lg">
                      {RECIPE_MODIFIERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <span className="md:col-span-2 h-8 flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                      <input value={ingredient.amount || ""} onChange={(e) => updateIngredient(ingredient.key, { amount: e.target.value })} className="w-full px-2 text-right font-medium outline-none" />
                      <select value={ingredient.unit || "g"} onChange={(e) => updateIngredient(ingredient.key, { unit: e.target.value })} className="h-full bg-slate-50 border-l border-slate-200 px-1 font-semibold">
                        {["g", "mg", "ml", "krople"].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </span>
                    <button type="button" disabled={ingredients.length <= 1} onClick={() => onChange({ ingredients: ingredients.filter((row) => row.key !== ingredient.key) })} className="md:col-span-1 justify-self-center text-slate-400 hover:text-rose-600 disabled:opacity-40" aria-label="Usuń składnik">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              <button type="button" onClick={() => onChange({ ingredients: [...ingredients, emptyIngredient()] })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#0D5C46]/40 text-[#0D5C46] rounded-lg font-bold">
                <Plus size={14} /> Dodaj składnik receptury
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold uppercase tracking-wider text-slate-800">Dawkowanie (D.S.): *</span>
              <div className="flex flex-wrap gap-1.5">
                {DOSAGE_CHIPS.map((chip) => {
                  const active = String(item.dosage || "").includes(chip);
                  return (
                    <button key={chip} type="button" onClick={() => applyChip(chip)} className={`px-2.5 py-1 rounded-md border ${active ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-700 border-slate-200"}`}>{chip}</button>
                  );
                })}
              </div>
            </div>
            <input value={item.dosage || ""} onChange={(e) => onChange({ dosage: e.target.value })} placeholder="np. Smarować chorobowo zmienione miejsca na skórze 2 x dziennie przez 14 dni" className="w-full p-2 border border-slate-300 rounded-lg font-medium" />
            <button type="button" onClick={() => setOptionsOpen((open) => !open)} className="inline-flex items-center gap-1 font-semibold text-slate-600">
              {optionsOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
              {optionsOpen ? "Ukryj opcje dodatkowe" : "Opcje dodatkowe (M.f. / rodzaj opakowania / uwaga dla farmaceuty)"}
            </button>
            {optionsOpen && (
              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Rodzaj opakowania aptecznego:</span>
                  <select value={item.recipePackageType || "Pudełko z tworzywa"} onChange={(e) => onChange({ recipePackageType: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-lg">
                    <option>Pudełko z tworzywa</option>
                    <option>Tuba z maścią</option>
                    <option>Butelka z ciemnego szkła</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">Instrukcja dla farmaceuty (M.f.):</span>
                  <input value={item.recipeSummary || ""} onChange={(e) => onChange({ recipeSummary: e.target.value })} placeholder="np. M.f. unguentum" className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono" />
                </label>
                <label className="sm:col-span-2 block space-y-1">
                  <span className="font-bold text-slate-700">Uwaga dla farmaceuty:</span>
                  <input value={item.pharmacyNote || ""} onChange={(e) => onChange({ pharmacyNote: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </label>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function DrugCard({ item, index, form, diagnoses = [], onChange, onRemove }) {
  const [dosageOpen, setDosageOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(Boolean(item.patientNote || item.pharmacyNote));
  const rpw = form === "Rpw";
  const dose = rpw ? extractSubstanceDose(item.drug) : null;
  const wordsMissing = rpw && String(item.substanceWords || "").trim().length < 3;

  useEffect(() => {
    if (!rpw) return;
    const patch = {};
    if (item.annual) patch.annual = false;
    if (item.realizationFrom) patch.realizationFrom = "";
    if (Number(item.durationDays) > 90) {
      patch.durationDays = "90";
      patch.dosage = composeDosage({ ...item, durationDays: "90", dosage: "" });
    }
    const name = shownSubstanceName(item);
    if (!String(item.substanceName || "").trim() && name) patch.substanceName = name;
    if (!item.substanceQuantity) {
      const total = rpwTotal(item.drug, item.quantity || 1);
      if (total.total > 0) {
        patch.substanceQuantity = formatAmount(total.total);
        patch.substanceUnit = total.unit;
        if (!String(item.substanceWords || "").trim()) patch.substanceWords = amountToPolishWords(total.total, total.unit);
      }
    } else if (!String(item.substanceWords || "").trim()) {
      const amount = Number(String(item.substanceQuantity).replace(",", "."));
      const unit = item.substanceUnit || dose?.unit || "mg";
      const words = amountToPolishWords(amount, unit);
      if (words) patch.substanceWords = words;
    }
    if (Object.keys(patch).length) onChange(patch);
  }, [rpw, item.key]);
  const asNeededBlocked = rpw || Boolean(item.annual);
  const over90 = rpw && Number(item.durationDays) > 90;
  const maxDays = rpw ? 90 : item.annual ? 360 : 365;
  const packs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

  const applyStructured = (patch) => {
    const next = withDosage(item, patch);
    onChange({ ...patch, dosage: next.dosage });
  };

  const frequencyValue = item.periodHours === "48" && String(item.frequency) === "1" ? "48" : (item.frequency || "");

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-7 h-7 rounded-full bg-[#0D5C46]/10 text-[#0D5C46] font-bold text-xs flex items-center justify-center shrink-0">{index + 1}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900">{item.drug?.name || "Receptura"}</h4>
              {rpw && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Rpw</span>}
              {item.cito && <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">CITO</span>}
              {item.noSubstitution && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">NZ</span>}
              {item.annual && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">365 dni</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">{[item.drug?.activeSubstance && `Substancja czynna: ${item.drug.activeSubstance}`, item.drug?.package && `Opakowanie: ${item.drug.package}`, item.drug?.ean && `EAN ${item.drug.ean}`].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <button type="button" onClick={onRemove} className="text-xs text-slate-500">Usuń</button>
      </div>

      {rpw && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <label className="md:col-span-4 block space-y-1">
            <span className="text-[11px] font-bold text-amber-900">Substancja czynna (I-N / II-P):</span>
            <input
              value={shownSubstanceName(item)}
              onChange={(e) => onChange({ substanceName: e.target.value })}
              className="w-full h-8 px-2.5 bg-amber-100/60 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950"
            />
          </label>
          <label className="md:col-span-3 block space-y-1">
            <span className="text-[11px] font-bold text-amber-900">Łączna ilość substancji: *</span>
            <span className="h-8 bg-white border border-amber-300 rounded-lg flex items-center px-2.5">
              <input
                type="number"
                min="0.001"
                step="any"
                value={item.substanceQuantity || ""}
                onChange={(e) => {
                  const substanceQuantity = e.target.value;
                  const amount = Number(String(substanceQuantity).replace(",", "."));
                  const unit = item.substanceUnit || dose?.unit || "mg";
                  onChange({
                    substanceQuantity,
                    substanceUnit: unit,
                    substanceWords: amount > 0 ? amountToPolishWords(amount, unit) : "",
                  });
                }}
                className="w-full text-xs font-semibold text-slate-800 outline-none"
              />
              <select
                value={item.substanceUnit || dose?.unit || "mg"}
                onChange={(e) => {
                  const substanceUnit = e.target.value;
                  const amount = Number(String(item.substanceQuantity || "").replace(",", "."));
                  onChange({
                    substanceUnit,
                    substanceWords: amount > 0 ? amountToPolishWords(amount, substanceUnit) : item.substanceWords,
                  });
                }}
                aria-label="Jednostka substancji"
                className="text-amber-800 font-semibold text-[11px] bg-transparent outline-none"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="mcg">mcg</option>
              </select>
            </span>
          </label>
          <label className="md:col-span-5 block space-y-1">
            <span className="text-[11px] font-bold text-amber-900 flex items-center justify-between gap-2">
              <span>Ilość substancji czynnej SŁOWNIE (wymóg P1): *</span>
              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${wordsMissing ? "text-red-700 bg-red-100 border-red-300" : "text-amber-800 bg-amber-100/80 border-amber-300"}`}>Wymagane</span>
            </span>
            <input
              value={item.substanceWords || ""}
              onChange={(e) => onChange({ substanceWords: e.target.value })}
              placeholder="np. sto miligramów"
              className={`w-full h-8 px-2.5 bg-white border rounded-lg text-xs font-semibold text-slate-900 ${wordsMissing ? "border-red-500 bg-red-50/40" : "border-amber-300"}`}
            />
            {wordsMissing && <p className="text-[10px] text-red-600 font-semibold">Pole wymagane przez P1 — zapisz ilość słownie.</p>}
          </label>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-2">
        <label className="text-xs font-semibold text-slate-700">Liczba opakowań *
          <select value={item.quantity || ""} onChange={(e) => onChange({ ...(rpw ? syncRpwQuantity(item, e.target.value) : { quantity: e.target.value }), ...durationPatchForQuantity(item, e.target.value, { rpw }) })} className="mt-1 w-full p-2 border rounded-lg font-medium">
            <option value="">— Wybierz liczbę opakowań —</option>
            {packs.map((qty) => <option key={qty} value={qty}>{qty} op.</option>)}
            {item.quantity && !packs.includes(Number(item.quantity)) && <option value={item.quantity}>{item.quantity} op.</option>}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">Odpłatność *
          <select value={item.payment} onChange={(e) => onChange({ payment: e.target.value })} className="mt-1 w-full p-2 border rounded-lg font-medium">
            {PAYMENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <IcdPicker
          diagnoses={diagnoses}
          code={item.icd10Code}
          name={item.icd10Display}
          optional={item.payment === "100%"}
          onChange={(next) => onChange({ icd10Code: next.code, icd10Display: next.name })}
        />
      </div>
      <Small label="Wskazanie refundacyjne" value={item.refundCode} onChange={(value) => onChange({ refundCode: value })} />

      {form !== "recipe" && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800">Dawkowanie *{item.annual ? " · stały schemat (360 dni)" : ""}</div>
            <div className="flex flex-wrap gap-1.5">
              {DOSE_PILLS.map((pill) => {
                const active = String(item.frequency) === pill.frequency && item.periodHours === pill.periodHours && String(item.doseQuantity) === pill.doseQuantity && (item.timeOfDay || "") === pill.timeOfDay;
                return (
                  <button key={pill.id} type="button" onClick={() => {
                    setDosageOpen(true);
                    let days = therapyDays(item, pill.frequency);
                    if (item.annual && days > 360) days = 360;
                    if (rpw && days > 90) days = 90;
                    applyStructured({
                      frequency: pill.frequency,
                      periodHours: pill.periodHours,
                      doseQuantity: pill.doseQuantity,
                      doseUnit: packageUnitLabel(item.drug, item.doseUnit || "tabl."),
                      timeOfDay: pill.timeOfDay,
                      durationDays: String(days),
                    });
                  }} className={`text-[11px] px-2.5 py-1 rounded-md border ${active ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-600 border-slate-200"}`}>{pill.id}</button>
                );
              })}
              <button
                type="button"
                disabled={asNeededBlocked}
                title={asNeededBlocked ? (rpw ? "Dawkowanie doraźne jest zablokowane na Rpw" : "Dawkowanie doraźne jest zablokowane na leku ważnym 365 dni") : undefined}
                onClick={() => {
                  setDosageOpen(true);
                  const unit = packageUnitLabel(item.drug, item.doseUnit || "tabl.");
                  let days = therapyDays(item, 1);
                  if (item.annual && days > 360) days = 360;
                  onChange({
                    frequency: "",
                    doseQuantity: "1",
                    doseUnit: unit,
                    timeOfDay: "",
                    durationDays: String(days),
                    dosage: `Doraźnie po 1 ${unit} przez ${days} dni`,
                  });
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md border ${asNeededBlocked ? "bg-slate-100 text-slate-400 border-slate-200" : /doraźnie/i.test(item.dosage || "") ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-600 border-slate-200"}`}
              >
                Doraźnie
              </button>
              <button type="button" onClick={() => setDosageOpen((open) => !open)} className="text-[11px] px-2.5 py-1 rounded-md border bg-white text-slate-600 border-slate-200 inline-flex items-center gap-1">
                {dosageOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {dosageOpen ? "Zwiń pola" : "Szczegóły pól"}
              </button>
            </div>
          </div>
          {item.annual && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <AlertTriangle size={14} /> Recepta roczna wymaga dokładnego schematu dawkowania, żeby apteka wydała pełną pulę leku.
            </div>
          )}
          {dosageOpen && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-600">Częstotliwość *
                <select value={frequencyValue} onChange={(e) => {
                  const chosen = FREQUENCIES.find((row) => row.value === e.target.value);
                  applyStructured({ frequency: chosen?.frequency || chosen?.value || "", periodHours: chosen?.hours || "24" });
                }} className="mt-1 h-8 w-full border rounded-lg px-2 text-xs">
                  {FREQUENCIES.map((row) => <option key={row.label} value={row.value}>{row.value === "" ? row.label : row.label}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-semibold text-slate-600">Dawka jednorazowa *
                <span className="mt-1 h-8 flex items-center border rounded-lg px-2 bg-white">
                  <input value={item.doseQuantity || ""} onChange={(e) => applyStructured({ doseQuantity: e.target.value })} className="w-full text-xs outline-none" />
                  <input value={item.doseUnit || "tabl."} onChange={(e) => applyStructured({ doseUnit: e.target.value })} className="w-14 text-[11px] text-slate-500 outline-none" />
                </span>
              </label>
              <label className="text-[10px] font-semibold text-slate-600">Pora dnia / posiłek
                <select value={item.timeOfDay || ""} onChange={(e) => applyStructured({ timeOfDay: e.target.value })} className="mt-1 h-8 w-full border rounded-lg px-2 text-xs">
                  {TIMES_OF_DAY.map((time) => <option key={time || "none"} value={time}>{time || "— brak —"}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-semibold text-slate-600">Czas kuracji / dni *{rpw ? " · maks. 90 dni (Rpw)" : ""}
                <input type="number" min="1" max={maxDays} value={item.durationDays || ""} onChange={(e) => {
                  const durationDays = rpw && Number(e.target.value) > 90 ? "90" : e.target.value;
                  applyStructured({ durationDays });
                }} className={`mt-1 h-8 w-full border rounded-lg px-2 text-xs ${over90 ? "border-red-500" : ""}`} />
              </label>
            </div>
          )}
          <div className="bg-white rounded-lg border border-slate-200 p-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Zapis na recepcie:</span>
            <input value={item.dosage || ""} onChange={(e) => onChange({ dosage: e.target.value })} placeholder="np. 1 x dziennie po 1 tabl. (wieczorem) przez 30 dni" className="flex-1 px-2 py-1 text-xs font-semibold border border-slate-200 rounded-md" />
            <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${over90 ? "text-red-700 bg-red-100" : "text-[#0D5C46] bg-[#0D5C46]/10"}`}>Wystarczy na: {item.durationDays || "—"} dni</span>
          </div>
          {over90 && <p className="text-xs font-semibold text-red-700">Leki na recepcie Rpw można przepisać na maksymalnie 90 dni kuracji.</p>}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
        {rpw ? (
          <div className="flex flex-wrap items-center gap-4">
            <Switch checked={Boolean(item.cito)} onClick={() => onChange({ cito: !item.cito })} onClass="bg-rose-600" label="Cito" />
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Info size={14} /> Wymogi Rpw: recepta ważna 30 dni, kuracja maksymalnie 90 dni, bez możliwości odroczenia daty realizacji.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex flex-wrap items-center gap-4">
              <Switch checked={Boolean(item.cito)} onClick={() => onChange({ cito: !item.cito })} onClass="bg-rose-600" label="Cito" />
              {form !== "recipe" && (
                <Switch
                  checked={Boolean(item.annual)}
                  onClick={() => {
                    const annual = !item.annual;
                    const patch = { annual };
                    if (annual && /doraźnie/i.test(item.dosage || "")) {
                      patch.frequency = "1";
                      patch.periodHours = "24";
                      patch.doseQuantity = item.doseQuantity || "1";
                      patch.timeOfDay = item.timeOfDay || "rano";
                    }
                    if (annual && (!item.durationDays || Number(item.durationDays) > 360)) patch.durationDays = "360";
                    onChange({ ...patch, dosage: composeDosage({ ...item, ...patch, dosage: "" }) });
                  }}
                  onClass="bg-[#0D5C46]"
                  label="e-Recepta roczna (ważna 365 dni)"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Data realizacji od</span>
                <div className="flex gap-1">
                  {[{ label: "Od dzisiaj", days: 0 }, { label: "+28 dni", days: 28 }, { label: "+30 dni", days: 30 }, { label: "+56 dni", days: 56 }].map((chip) => {
                    const target = chip.days === 0 ? "" : offsetDate(chip.days);
                    const active = chip.days === 0
                      ? !item.realizationFrom || item.realizationFrom <= todayIso()
                      : item.realizationFrom === target;
                    return (
                      <button key={chip.label} type="button" onClick={() => onChange({ realizationFrom: target })} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${active ? "bg-[#0D5C46] text-white border-[#0D5C46]" : "bg-white text-slate-700 border-slate-200"}`}>{chip.label}</button>
                    );
                  })}
                </div>
              </div>
              <input type="date" min={todayIso()} value={item.realizationFrom || todayIso()} onChange={(e) => onChange({ realizationFrom: e.target.value && e.target.value > todayIso() ? e.target.value : "" })} className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" checked={Boolean(item.noSubstitution)} onChange={(e) => onChange({ noSubstitution: e.target.checked })} />
          NZ — Nie zamieniać leku w aptece
        </label>
        <button type="button" onClick={() => setNotesOpen((open) => !open)} className="text-slate-500 inline-flex items-center gap-1">
          {notesOpen ? <ChevronUp size={14} /> : <Plus size={14} />}
          {notesOpen ? "Ukryj uwagi" : "Dodaj uwagi (pacjent / apteka)"}
        </button>
      </div>
      {notesOpen && (
        <div className="grid sm:grid-cols-2 gap-2">
          <Small label="Instrukcja dla pacjenta" value={item.patientNote} onChange={(value) => onChange({ patientNote: value })} />
          <Small label="Informacja dla farmaceuty" value={item.pharmacyNote} onChange={(value) => onChange({ pharmacyNote: value })} />
        </div>
      )}
    </article>
  );
}

function Small({ label, value, onChange }) {
  return (
    <label className="text-xs block">{label}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" />
    </label>
  );
}

function DrugList({ title, drugs, onAdd }) {
  if (!drugs?.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-slate-500">{title}</p>
      {drugs.map((drug) => (
        <button key={`${title}-${drug.ean || drug.name}`} type="button" onClick={() => onAdd(drug)} className="w-full text-left bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-[#0D5C46]">
          <div className="text-sm font-medium flex items-center gap-2">
            <span>{drug.name}</span>
            {drug.strength && <span className="text-xs font-bold text-[#0D5C46]">{drug.strength}</span>}
            {classifyDrug(drug) === "Rpw" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Rpw</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">{[classifyDrug(drug) || drug.kdlek, drug.activeSubstance, drug.strength, drug.form, drug.package, drug.ean ? `EAN ${drug.ean}` : ""].filter(Boolean).join(" · ")}</div>
        </button>
      ))}
    </div>
  );
}

function PreviewOverlay({ items, header, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-3">
        <div className="flex justify-between"><h3 className="font-semibold">Podgląd e-recepty</h3><button type="button" onClick={onClose}><X size={16} /></button></div>
        <p className="text-sm text-slate-600">{header.form} · {header.kind}</p>
        {items.map((item) => (
          <div key={item.key} className="text-sm border rounded-lg p-2">
            <div className="font-medium">{item.drug?.name}{item.cito ? " · CITO" : ""}{item.annual ? " · 365 dni" : ""}</div>
            <div className="text-slate-600">{item.quantity} op. · {item.payment} · {item.dosage || `${item.frequency}× / ${item.durationDays} dni`}</div>
            {item.icd10Code && <div className="text-slate-600">{item.icd10Code} — {item.icd10Display}</div>}
            {item.realizationFrom && <div className="text-slate-600">Realizacja od {item.realizationFrom}</div>}
            {item.substanceWords && <div>Słownie: {item.substanceWords}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}


function IssuedBatch({ rows, patient, onCancel, onClose, onAnother }) {
  const [active, setActive] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [cancelFor, setCancelFor] = useState(null);
  const selected = rows[active] || rows[0];
  const selectedId = selected?.result?.id || "";
  const selectedStatus = selected?.result?.status || "";

  useEffect(() => {
    if (!selectedId) {
      setPreviewUrl("");
      return undefined;
    }
    let stop = false;
    let url = "";
    setPreviewError("");
    ehealthHelper.fetchDocumentBlob("prescription", selectedId).then((blob) => {
      const next = URL.createObjectURL(blob);
      if (stop) {
        URL.revokeObjectURL(next);
        return;
      }
      url = next;
      setPreviewUrl(next);
    }).catch((err) => {
      if (!stop) setPreviewError(err.message || "Podgląd wydruku jest niedostępny.");
    });
    return () => {
      stop = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [selectedId, selectedStatus]);

  const messageText = () => {
    const lines = rows.map((row, index) => {
      const code = accessCodeOf(row.result);
      const drugs = row.items.map((item) => item.drug?.name).filter(Boolean).join(", ");
      return `Recepta ${index + 1}${code ? ` — kod ${code}` : ""}${drugs ? `: ${drugs}` : ""}`;
    });
    return `e-Recepta\n${lines.join("\n")}\nW aptece podaj kod i PESEL${patient?.pesel ? ` ${patient.pesel}` : ""}.`;
  };

  const sendSms = () => {
    if (!rows.some((row) => accessCodeOf(row.result))) {
      toast.error("Nie ma jeszcze kodu z P1. SMS można wysłać dopiero po przyjęciu recepty.");
      return;
    }
    if (!patient?.phone) {
      toast.error("Brak numeru telefonu pacjenta.");
      return;
    }
    window.location.href = `sms:${patient.phone}?&body=${encodeURIComponent(messageText())}`;
  };

  const sendEmail = () => {
    if (!rows.some((row) => accessCodeOf(row.result))) {
      toast.error("Nie ma jeszcze kodu z P1. E-mail można wysłać dopiero po przyjęciu recepty.");
      return;
    }
    if (!patient?.email) {
      toast.error("Brak adresu e-mail pacjenta.");
      return;
    }
    const href = `mailto:${patient.email}?subject=${encodeURIComponent("e-Recepta")}&body=${encodeURIComponent(messageText())}`;
    window.location.href = href;
  };

  const printOne = (id) => {
    ehealthHelper.printDocument("prescription", id).catch((err) => toast.error(err.message));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Wystawione e-recepty ({rows.length})</span>
        {rows.map((row, index) => {
          const code = accessCodeOf(row.result);
          const cancelled = row.result?.status === "cancelled";
          return (
            <button key={row.result?.id || index} type="button" onClick={() => setActive(index)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${cancelled ? "border-rose-300 text-rose-800 bg-rose-50" : index === active ? "bg-[#14532d] text-white border-[#14532d]" : "border-emerald-300 text-emerald-900 bg-emerald-50"}`}>
              {row.form === "recipe" ? "Receptura" : row.form === "Rpw" ? "Rpw" : `e-Recepta #${index + 1}`}
              {code ? ` · kod ${code}` : ""}
              {cancelled ? " · anulowana" : ""}
            </button>
          );
        })}
        {rows.filter((row) => row.result?.id).length > 1 && (
          <button type="button" onClick={() => rows.forEach((row) => row.result?.id && printOne(row.result.id))} className="ml-auto px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1">
            <Printer size={14} /> Drukuj wszystkie PDF ({rows.filter((row) => row.result?.id).length})
          </button>
        )}
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-5 overflow-y-auto space-y-3">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#0D5C46] flex items-center justify-center"><ShieldCheck size={22} /></div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Zarejestrowano</div>
                <h2 className="font-bold text-slate-900">{rows.length > 1 ? `Wystawiono ${rows.length} e-recepty` : "e-Recepta wystawiona"}</h2>
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{rows.length > 1 ? "Kody dostępu dla pacjenta" : "Kod dostępu dla pacjenta"}</p>
            {rows.map((row, index) => {
              const code = accessCodeOf(row.result);
              const cancelled = row.result?.status === "cancelled";
              return (
                <button key={row.result?.id || index} type="button" onClick={() => setActive(index)} className={`w-full rounded-2xl border p-4 ${cancelled ? "border-rose-200 bg-rose-50" : index === active ? "border-[#0D5C46] bg-emerald-50/40" : "border-slate-200 bg-slate-50"}`}>
                  <div className="text-[11px] text-slate-500">{row.items.map((item) => item.drug?.name).filter(Boolean).join(", ") || `Recepta ${index + 1}`}</div>
                  <div className={`font-mono text-4xl font-black tracking-widest ${cancelled ? "line-through text-slate-400" : "text-slate-900"}`}>{code || "—"}</div>
                  {code && !cancelled && (
                    <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(code); toast.success("Skopiowano kod"); }} className="text-xs text-[#0D5C46] inline-flex items-center gap-1"><Copy size={14} /> Kopiuj</span>
                  )}
                  {!code && row.result && <p className="text-xs text-slate-500">Kod pojawi się, gdy P1 przyjmie receptę.</p>}
                  {row.error && !row.result && <p className="text-xs text-rose-700">{row.error}</p>}
                  {cancelled && <p className="text-xs text-rose-700">Ta e-recepta została anulowana i nie można jej zrealizować.{row.result?.payload?.cancellationReason ? ` Powód: ${row.result.payload.cancellationReason}` : ""}</p>}
                </button>
              );
            })}
            <p className="text-xs text-slate-500 text-center">W aptece wystarczy kod oraz PESEL{patient?.pesel ? ` (${patient.pesel})` : ""}.</p>
            {selected?.result?.id && selected.result.status !== "cancelled" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={sendSms} className="h-14 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 font-semibold text-xs inline-flex flex-col items-center justify-center gap-1"><Smartphone size={16} /> Wyślij SMS</button>
                  <button type="button" onClick={sendEmail} className="h-14 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs inline-flex flex-col items-center justify-center gap-1"><Mail size={16} /> Wyślij e-mail</button>
                </div>
                <button type="button" onClick={() => printOne(selected.result.id)} className="w-full h-12 rounded-xl bg-[#0D5C46] text-white font-bold text-sm inline-flex items-center justify-center gap-2"><Printer size={16} /> Wydrukuj informację dla pacjenta</button>
                <button type="button" onClick={() => ehealthHelper.previewDocument("prescription", selected.result.id).catch((err) => toast.error(err.message))} className="w-full h-10 rounded-xl border border-slate-300 text-sm font-semibold inline-flex items-center justify-center gap-2"><FileText size={16} /> Otwórz PDF w nowym oknie</button>
                <button type="button" onClick={() => setCancelFor(selected)} className="w-full py-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold inline-flex items-center justify-center gap-2"><Trash2 size={16} /> Anuluj tę receptę</button>
              </div>
            )}
          </section>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onAnother} className="px-3 py-2 rounded-lg bg-[#0D5C46] text-white text-sm inline-flex items-center gap-1"><Plus size={14} /> Wystaw kolejne</button>
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border text-sm">Wróć do wizyty</button>
          </div>
        </div>
        <div className="lg:col-span-7 bg-slate-200/70 rounded-2xl border border-slate-300 overflow-hidden min-h-[420px]">
          {previewUrl ? (
            <iframe title="Podgląd informacji o e-recepcie" src={previewUrl} className="w-full h-full min-h-[420px] bg-white" />
          ) : (
            <p className="p-6 text-sm text-slate-600">{previewError || "Przygotowuję podgląd wydruku…"}</p>
          )}
        </div>
      </div>
      {cancelFor?.result?.id && (
        <CancelPrescriptionModal
          row={cancelFor}
          patient={patient}
          onClose={() => setCancelFor(null)}
          onConfirm={async (reason) => {
            await onCancel(cancelFor.result.id, reason);
            setCancelFor(null);
          }}
        />
      )}
    </div>
  );
}

function CancelPrescriptionModal({ row, patient, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const code = accessCodeOf(row.result);
  const drugs = row.items.map((item) => item.drug?.name).filter(Boolean).join(", ");

  return (
    <P1SignDialog
      open
      isDestructive
      title="Autoryzacja anulowania e-Recepty"
      actionText="Podpisz i anuluj w P1"
      doctorLine={[patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ")}
      onClose={onClose}
      onConfirm={async () => {
        if (reason.trim().length < 5) {
          setReasonError("Powód anulowania musi mieć co najmniej 5 znaków.");
          throw new Error("Powód anulowania musi mieć co najmniej 5 znaków.");
        }
        setReasonError("");
        await onConfirm(reason.trim());
      }}
    >
      <div className="space-y-3.5">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-950">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold text-amber-900 block mb-0.5">Uwaga: Ta operacja trwale wycofa dokument z systemu P1.</strong>
            Wymaga podania powodu oraz autoryzacji kodem PIN certyfikatu.
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span>Kod dostępu / Pacjent:</span>
            <span className="font-mono font-bold text-slate-800">{code || "—"} — {patient?.name || "—"}</span>
          </div>
          {drugs && (
            <div className="flex items-start justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span className="shrink-0 mr-2">Pozycje leków:</span>
              <span className="font-medium text-slate-700 text-right">{drugs}</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Powód anulowania w rejestrze P1 <span className="text-rose-600">*</span></label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
            placeholder="np. Błąd formalny, pomyłka w dawkowaniu leku, zmiana decyzji klinicznej..."
            className={`w-full p-2.5 bg-white border rounded-xl text-xs ${reasonError ? "border-rose-400" : "border-slate-200"}`}
          />
          {reasonError && <p className="text-[11px] text-rose-600 font-medium">{reasonError}</p>}
        </div>
      </div>
    </P1SignDialog>
  );
}
