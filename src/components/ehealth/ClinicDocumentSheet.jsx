import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../helpers/clinicDocumentsHelper";

export const CLINIC_LETTERHEAD = {
  name: "Centrum Medyczne 7",
  legalName: "CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
  street: "ul. Powstańców Warszawy 7/1.5",
  postal: "26-110",
  city: "Skarżysko-Kamienna",
  nip: "6631891951",
  regon: "541934650",
  krs: "0001177361",
  rpwdl: "000000291119",
};

export const SAMPLE_PATIENT = {
  name: "Anna Lewandowska",
  pesel: "89051403921",
  birthDate: "1989-05-14",
  address: "ul. Grzybowska 4 m. 12, 00-132 Warszawa",
};

const TYPE_LABELS = { text: "Krótki tekst", textarea: "Długi tekst", date: "Data", select: "Lista wyboru", checkbox: "Checkbox Tak/Nie" };

const SHEET_CSS = `
.clinic-pages { color: #202020; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
.clinic-pages .medical-document-header { display: grid; grid-template-columns: minmax(0, 1fr) 68mm; gap: 8mm; align-items: start; padding: 0 0 7mm; border-bottom: 0.5px solid #cbd5e1; text-align: left; }
.clinic-pages .clinic-name { margin: 0 0 1.2mm; color: #0f172a; font-size: 13.5pt; font-weight: 700; letter-spacing: -0.015em; line-height: 1.2; text-align: left; }
.clinic-pages .clinic-legal-name { margin: 0 0 2.2mm; color: #475569; font-size: 8.8pt; font-weight: 600; line-height: 1.35; letter-spacing: 0.03em; text-transform: uppercase; overflow-wrap: anywhere; text-align: left; }
.clinic-pages .clinic-address { display: flex; flex-direction: column; align-items: flex-start; margin: 0 0 2.5mm; color: #334155; font-size: 9.3pt; font-style: normal; line-height: 1.4; text-align: left; }
.clinic-pages .clinic-registry-data, .clinic-pages .clinic-registry-number { margin: 0; color: #64748b; font-size: 8.6pt; line-height: 1.45; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.clinic-pages .clinic-registry-number { margin-top: 0.8mm; }
.clinic-pages .medical-document-header__meta { width: 68mm; min-width: 68mm; text-align: right; margin: 0; }
.clinic-pages .document-meta-label { margin: 0 0 1.2mm; color: #64748b; font-size: 8pt; font-weight: 600; letter-spacing: 0.08em; line-height: 1.35; text-transform: uppercase; }
.clinic-pages .document-meta-label--date { margin-top: 6mm; }
.clinic-pages .document-meta-value { margin: 0; color: #0f172a; font-size: 10.5pt; font-weight: 700; line-height: 1.35; }
.clinic-pages .document-draft-label { margin: 0 0 1.2mm; color: #475569; font-size: 10pt; font-style: italic; font-weight: 600; line-height: 1.35; }
.clinic-pages .document-draft-note { margin: 0; color: #64748b; font-size: 8.8pt; font-style: italic; line-height: 1.35; }
.clinic-pages .document-title { margin: 9mm 0 10mm; color: #1d1d1d; font-size: 17pt; font-weight: 700; line-height: 1.25; letter-spacing: 0.015em; text-align: center; text-transform: uppercase; word-break: normal; overflow-wrap: break-word; }
.clinic-pages .patient-block { margin: 0 0 8mm; padding: 5mm 0; border-top: 0.5px solid #d8d8d8; border-bottom: 0.5px solid #d8d8d8; text-align: left; }
.clinic-pages .patient-block__header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 4mm; }
.clinic-pages .patient-block h2 { margin: 0; color: #2d2d2d; font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; line-height: 1.3; text-transform: uppercase; }
.clinic-pages .patient-name { margin: 0 0 3mm; color: #1f1f1f; font-size: 12pt; font-weight: 600; line-height: 1.35; }
.clinic-pages .patient-details { display: grid; gap: 2mm; margin: 0; }
.clinic-pages .patient-details > div { display: flex; align-items: baseline; gap: 2mm; }
.clinic-pages .patient-details dt { color: #666; font-size: 10.5pt; }
.clinic-pages .patient-details dd { margin: 0; color: #1f1f1f; font-size: 10.5pt; font-weight: 500; white-space: pre-wrap; }
.clinic-pages .document-content { margin: 6mm 0; text-align: left; }
.clinic-pages .document-content > .document-section + .document-section { margin-top: 6mm; }
.clinic-pages .document-section__header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 2mm; margin: 0 0 1.5mm; }
.clinic-pages .document-section__label { margin: 0; color: #27272a; font-size: 9.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.35; }
.clinic-pages .document-section { max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
.clinic-pages .document-section__value { margin: 0; color: #18181b; font-size: 10.5pt; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-all; max-width: 100%; }
.clinic-pages .sheet-page-break { display: block; width: auto; margin: 0 -2mm; padding: 0 2mm; background: #fff; overflow: hidden; pointer-events: none; user-select: none; }
.clinic-pages .document-section__value.is-empty { color: #a1a1aa; font-style: italic; }
.clinic-pages .doctor-signature__label { margin: 0 0 2mm; color: #666; font-size: 9pt; letter-spacing: 0.08em; line-height: 1.3; text-transform: uppercase; }
.clinic-pages .doctor-signature__name { margin: 0 0 1.5mm; color: #1b1b1b; font-size: 11pt; font-weight: 600; line-height: 1.35; }
.clinic-pages .doctor-signature__pwz, .clinic-pages .doctor-signature__specialty { margin: 0 0 1.5mm; color: #333; font-size: 10pt; line-height: 1.35; }
.clinic-pages .doctor-signature__stamp-space { height: 28mm; }
.clinic-pages .doctor-signature__line { width: 100%; border-top: 0.75px solid #777; }
.clinic-pages .doctor-signature__caption { margin: 2mm 0 0; color: #666; font-size: 9pt; text-align: center; }
.clinic-pages .sheet-page-footer { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 8.5pt; color: #71717a; text-align: center; border-top: 0.5px solid #e4e4e7; padding-top: 3mm; }
.clinic-pages .sheet-write, .clinic-pages .sheet-input { width: 100%; max-width: 100%; min-height: 1.5em; padding: 1.5mm 2mm; color: #1f1f1f; font: inherit; font-size: 10.5pt; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; background: rgba(0, 128, 115, 0.045); border: 0; border-bottom: 1px dashed rgba(0, 128, 115, 0.42); border-radius: 2px; outline: none; }
.clinic-pages .sheet-write:focus, .clinic-pages .sheet-input:focus { background: #fff; border-bottom: 2px solid #008073; }
.clinic-pages .sheet-write:empty:before { content: attr(data-placeholder); color: #8b96a3; font-style: italic; }
.clinic-pages .document-help { margin: 0.6mm 0 0; color: #64748b; font-size: 8pt; font-style: italic; font-weight: 400; letter-spacing: 0; text-transform: none; }
`;

const FLOW_CSS = `
.print-sheet { width: 100%; max-width: min(210mm, 100%); min-width: 0; box-sizing: border-box; margin-left: auto; margin-right: auto; padding: 14mm 18mm 12mm; background: #fff; color: #202020; font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif; overflow: visible; }
.print-main { min-width: 0; }
.print-sign { width: 78mm; max-width: 100%; margin: 12mm 0 0 auto; border-collapse: collapse; text-align: center; break-inside: avoid; page-break-inside: avoid; }
.print-sign td { break-inside: avoid; page-break-inside: avoid; text-align: center; }
.print-sign .doctor-signature__stamp-space { display: block; height: 28mm; }
`;

function todayLabel() {
  return new Date().toLocaleDateString("pl-PL");
}

/** Stored on a date field when the value should be the day the document is issued. */
export const ISSUE_DATE_VALUE = "today";

export function localIsoDate(date = new Date()) {
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatSheetDate(value) {
  const raw = String(value || "").trim();
  if (raw === ISSUE_DATE_VALUE) return todayLabel();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return raw;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString("pl-PL");
}

export function initialFieldValue(field) {
  if (field?.type === "checkbox") return field.defaultValue === "tak" || field.defaultValue === "nie" ? field.defaultValue : "";
  if (field?.type === "date" && field.defaultValue === ISSUE_DATE_VALUE) return localIsoDate();
  return field?.defaultValue || "";
}

export function previewFieldValues(fields) {
  const values = {};
  (fields || []).forEach((field) => {
    values[field.key] = initialFieldValue(field);
  });
  return values;
}

function signatureIdentity({ doctorTitle, doctorName, doctorPwz, sample }) {
  const title = String(doctorTitle || "").trim();
  const name = String(doctorName || "").trim();
  const pwz = String(doctorPwz || "").trim();
  if (sample && !title && !name && !pwz) {
    return { line: "Dr n. med. Jan Kowalski", pwz: "7481920" };
  }
  return { line: [title, name].filter(Boolean).join(" "), pwz };
}

function visibleFieldText(element) {
  let text = "";
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest(".sheet-page-break")) continue;
    text += node.textContent;
  }
  return text;
}

function SheetText({ text, className }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (node && visibleFieldText(node) !== text) node.textContent = text;
  }, [text]);
  return <p ref={ref} className={className} />;
}

function InlineText({ id, value, placeholder, multiline, onChange }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (ref.current && document.activeElement !== ref.current && visibleFieldText(ref.current) !== (value || "")) {
      ref.current.innerText = value || "";
    }
  }, [value]);
  return (
    <div
      ref={ref}
      id={id}
      role="textbox"
      aria-multiline={multiline ? "true" : "false"}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      data-placeholder={placeholder || "Kliknij, aby wpisać treść"}
      onInput={(event) => onChange(visibleFieldText(event.currentTarget))}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className={`sheet-write outline-none ${multiline ? "min-h-[72px] whitespace-pre-wrap" : "min-h-[28px]"}`}
    />
  );
}

export default function ClinicDocumentSheet({
  title,
  fields = [],
  values = {},
  patient,
  doctorName = "",
  doctorTitle = "",
  doctorPwz = "",
  documentNumber = "",
  status = "template",
  selectedKey = "",
  mode = "preview",
  onSelectField,
  onEditField,
  onChange,
  onTitleChange,
  onEditPatient,
  onRenameSection,
  visitHint,
}) {
  const sample = mode === "admin";
  const person = sample ? SAMPLE_PATIENT : (patient || {});
  const issued = status === "issued";
  const editable = mode === "fill" && !issued;
  const heading = (title || "DOKUMENT").toUpperCase();
  const sign = signatureIdentity({
    doctorTitle,
    doctorName,
    doctorPwz,
    sample: mode === "admin" || mode === "preview",
  });
  return (
    <article className="print-sheet clinic-pages mx-auto bg-white" style={{ boxShadow: "0 2px 16px rgba(0, 0, 0, 0.12)" }}>
      <style>{`${SHEET_CSS}${FLOW_CSS}`}</style>
      <div className="print-main">
      <header className="medical-document-header">
        <div>
          <p className="clinic-name">{CLINIC_LETTERHEAD.name}</p>
          <p className="clinic-legal-name">{CLINIC_LETTERHEAD.legalName}</p>
          <address className="clinic-address">
            <span>{CLINIC_LETTERHEAD.street}</span>
            <span>{CLINIC_LETTERHEAD.postal} {CLINIC_LETTERHEAD.city}</span>
          </address>
          <p className="clinic-registry-data">NIP: {CLINIC_LETTERHEAD.nip} · REGON: {CLINIC_LETTERHEAD.regon} · KRS: {CLINIC_LETTERHEAD.krs}</p>
          <p className="clinic-registry-number">Nr księgi rejestrowej (RPWDL): {CLINIC_LETTERHEAD.rpwdl}</p>
        </div>
        <div className="medical-document-header__meta">
          <p className="document-meta-label">Numer dokumentu</p>
          {issued && documentNumber ? (
            <p className="document-meta-value" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{documentNumber}</p>
          ) : sample || status === "template" ? (
            <p className="document-draft-note">Wzór formularza</p>
          ) : (
            <>
              <p className="document-draft-label">Szkic roboczy</p>
              <p className="document-draft-note">Numer zostanie nadany po zatwierdzeniu</p>
            </>
          )}
          <p className="document-meta-label document-meta-label--date">Miejsce i data wystawienia</p>
          <p className="document-meta-value">{CLINIC_LETTERHEAD.city}, {todayLabel()}</p>
        </div>
      </header>

      <div className="sheet-block document-title" role="heading" aria-level={1}>
        {editable && onTitleChange ? (
          <InlineText
            value={title || ""}
            placeholder="Tytuł tego dokumentu"
            onChange={(next) => onTitleChange(String(next || "").replace(/[\r\n]+/g, " "))}
          />
        ) : heading}
      </div>

      <section className="sheet-block patient-block">
        <div className="patient-block__header">
          <h2>Dane pacjenta</h2>
          {editable && onEditPatient && (
            <button type="button" onClick={onEditPatient} className="text-[8.5pt] font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-md px-2 py-1">
              Edytuj
            </button>
          )}
        </div>
        <p className="patient-name">{person.name || "—"}</p>
        <dl className="patient-details">
          <div><dt>PESEL:</dt><dd className="font-mono">{person.pesel || "—"}</dd></div>
          <div><dt>Data urodzenia:</dt><dd>{person.birthDate || "—"}</dd></div>
          <div><dt>Adres:</dt><dd className="whitespace-pre-wrap">{person.address || "—"}</dd></div>
        </dl>
      </section>

      <section className="document-content">
        {fields.length === 0 && (
          <p className="sheet-block text-center text-slate-400 italic border border-dashed border-slate-300 rounded-lg py-6">
            Ten wzór nie ma jeszcze pól. Dodaj pierwsze pole w panelu po lewej stronie.
          </p>
        )}
        {fields.map((field) => {
          const selected = selectedKey === field.key;
          const value = values[field.key] || "";
          const hint = visitHint?.(field);
          const checkboxAnswer = value === "tak" || value === "nie" ? value : "";
          const filled = field.type === "checkbox" ? Boolean(checkboxAnswer) : Boolean(String(value).trim());
          if (!editable && mode !== "admin" && status !== "template" && field.type === "checkbox" && !checkboxAnswer) return null;
          if (issued && field.printWhenFilled && !filled) return null;
          const printed = field.type === "checkbox"
            ? (checkboxAnswer === "tak" ? "Tak" : checkboxAnswer === "nie" ? "Nie" : "Tak / Nie")
            : field.type === "date" ? formatSheetDate(value) : value;
          const checkbox = (
            <div className="inline-flex gap-2">
              {[["tak", "Tak"], ["nie", "Nie"]].map(([answer, label]) => (
                <button
                  key={answer}
                  type="button"
                  onClick={() => onChange?.(field.key, checkboxAnswer === answer ? "" : answer)}
                  className={`px-3 py-1 rounded-md border text-[10.5pt] ${checkboxAnswer === answer ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-slate-300 text-slate-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          );
          return (
            <section
              key={field.key}
              id={`a4-section-${field.key}`}
              onClick={() => onSelectField?.(field.key)}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onEditField?.(field);
              }}
              className={`document-section sheet-block rounded-lg ${onSelectField ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-teal-600 bg-teal-50/50 p-3" : onSelectField ? "hover:bg-slate-50 p-2" : ""}`}
            >
              <div className="document-section__header">
                <div>
                  <h3 className="document-section__label">{field.label || "Pole"}</h3>
                  {editable && field.helpText ? <p className="document-help">{field.helpText}</p> : null}
                </div>
                {editable && onRenameSection && (
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onRenameSection(field); }}
                    className="text-[11px] font-bold text-teal-800 bg-white border border-teal-300 rounded px-2 py-0.5"
                  >
                    Zmień nazwę
                  </button>
                )}
                {selected && (
                  <span className="text-[9px] font-semibold text-teal-800 bg-teal-100 border border-teal-300 px-1.5 py-0.5 rounded">Wybrana sekcja</span>
                )}
                {editable && hint && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (value.trim() && !window.confirm("Zastąpić obecną treść danymi z wizyty?")) return;
                      onChange?.(field.key, hint);
                    }}
                    className="text-[11px] text-teal-700 underline"
                  >
                    Wstaw z wizyty
                  </button>
                )}
                {selected && onEditField && (
                  <button type="button" onClick={(event) => { event.stopPropagation(); onEditField(field); }} className="text-[11px] font-bold text-teal-800 bg-white border border-teal-300 rounded px-2 py-0.5">
                    Edytuj
                  </button>
                )}
              </div>
              {editable ? (
                field.type === "date" ? (
                  <input
                    id={`field-input-${field.key}`}
                    type="date"
                    value={value}
                    onChange={(event) => onChange?.(field.key, event.target.value)}
                    className="sheet-input"
                  />
                ) : field.type === "checkbox" ? checkbox : field.type === "select" ? (
                  <select
                    id={`field-input-${field.key}`}
                    value={value}
                    onChange={(event) => onChange?.(field.key, event.target.value)}
                    className="sheet-input max-w-md"
                  >
                    <option value="">{field.placeholder || "Wybierz…"}</option>
                    {value && !(field.options || []).includes(value) ? <option value={value}>{value}</option> : null}
                    {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <InlineText
                    id={`field-input-${field.key}`}
                    value={value}
                    multiline={field.type !== "text"}
                    placeholder={field.placeholder || "Kliknij, aby wpisać treść"}
                    onChange={(next) => onChange?.(field.key, next)}
                  />
                )
              ) : (
                <SheetText
                  text={printed || "[ wartość uzupełniana przez lekarza ]"}
                  className={`document-section__value ${printed ? "" : "is-empty"}`}
                />
              )}
              {selected && (
                <p className="mt-1.5 pt-1 border-t border-teal-200 text-[10px] text-teal-700">
                  Typ: {TYPE_LABELS[field.type] || field.type}{field.required ? " · Wymagane" : ""}
                  <span className="italic"> · Podwójny klik lub „Edytuj”, aby zmienić</span>
                </p>
              )}
            </section>
          );
        })}
      </section>

      </div>
      <div className="print-sign">
        <p className="doctor-signature__label">Lekarz orzekający / wystawiający</p>
        <p className="doctor-signature__name">{sign.line || "—"}</p>
        <p className="doctor-signature__pwz">PWZ: {sign.pwz || "—"}</p>
        <div className="doctor-signature__stamp-space" aria-hidden="true" />
        <div className="doctor-signature__line" />
        <p className="doctor-signature__caption">podpis i pieczątka lekarza</p>
      </div>
    </article>
  );
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function patientAddress(patient) {
  if (!patient) return "";
  if (patient.address) return patient.address;
  const locality = [patient.postalCode, patient.city].filter(Boolean).join(" ");
  return [patient.street, locality].filter(Boolean).join(", ");
}

function printFieldText(field, values, status) {
  const issued = status === "issued";
  const value = values?.[field.key] || "";
  if (field.type === "checkbox") {
    if (value === "tak") return "Tak";
    if (value === "nie") return "Nie";
    if (status === "template") return "Tak / Nie";
    return null;
  }
  const filled = Boolean(String(value).trim());
  if (issued && field.printWhenFilled && !filled) return null;
  const text = field.type === "date" ? formatSheetDate(value) : String(value);
  return text.trim() || "[ wartość uzupełniana przez lekarza ]";
}

const PDF_PAGE_CSS = `
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; width: 100%; max-width: 178mm; }
.print-sheet { width: 100% !important; max-width: 178mm !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; box-shadow: none !important; }
.print-main, .document-section, .document-title, .document-section__label, .patient-name, .patient-details dd { max-width: 100% !important; min-width: 0 !important; word-break: normal !important; overflow-wrap: break-word !important; }
.document-section__value { max-width: 100% !important; min-width: 0 !important; overflow-wrap: anywhere !important; word-break: break-word !important; }
table.print-sign, table.print-sign tr, table.print-sign td { break-inside: avoid !important; page-break-inside: avoid !important; }
table.print-sign { width: 78mm !important; margin: 10mm 0 0 auto !important; }
`;

export function buildClinicSheetHtml({ title, fields, values, patient, doctorName, doctorTitle, doctorPwz, documentNumber, status }) {
  const issued = status === "issued";
  const person = patient || {};
  const sign = signatureIdentity({
    doctorTitle,
    doctorName,
    doctorPwz,
    sample: !doctorName && !doctorTitle && !doctorPwz,
  });
  const heading = escapeHtml((title || "DOKUMENT").toUpperCase());
  const sections = (fields || []).map((field) => {
    const text = printFieldText(field, values, status);
    if (text == null) return "";
    const empty = text.startsWith("[");
    return `<section class="document-section">
      <h3 class="document-section__label">${escapeHtml(field.label || "Pole")}</h3>
      <p class="document-section__value${empty ? " is-empty" : ""}">${escapeHtml(text)}</p>
    </section>`;
  }).join("");
  const numberBlock = issued && documentNumber
    ? `<p class="document-meta-value" style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">${escapeHtml(documentNumber)}</p>`
    : status === "template"
      ? `<p class="document-draft-note">Wzór formularza</p>`
      : `<p class="document-draft-label">Szkic roboczy</p><p class="document-draft-note">Numer zostanie nadany po zatwierdzeniu</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title></title>
    <style>${SHEET_CSS}${FLOW_CSS}${PDF_PAGE_CSS}</style></head><body>
    <article class="print-sheet clinic-pages">
      <div class="print-main">
      <header class="medical-document-header">
        <div>
          <p class="clinic-name">${escapeHtml(CLINIC_LETTERHEAD.name)}</p>
          <p class="clinic-legal-name">${escapeHtml(CLINIC_LETTERHEAD.legalName)}</p>
          <address class="clinic-address">
            <span>${escapeHtml(CLINIC_LETTERHEAD.street)}</span>
            <span>${escapeHtml(CLINIC_LETTERHEAD.postal)} ${escapeHtml(CLINIC_LETTERHEAD.city)}</span>
          </address>
          <p class="clinic-registry-data">NIP: ${escapeHtml(CLINIC_LETTERHEAD.nip)} · REGON: ${escapeHtml(CLINIC_LETTERHEAD.regon)} · KRS: ${escapeHtml(CLINIC_LETTERHEAD.krs)}</p>
          <p class="clinic-registry-number">Nr księgi rejestrowej (RPWDL): ${escapeHtml(CLINIC_LETTERHEAD.rpwdl)}</p>
        </div>
        <div class="medical-document-header__meta">
          <p class="document-meta-label">Numer dokumentu</p>
          ${numberBlock}
          <p class="document-meta-label document-meta-label--date">Miejsce i data wystawienia</p>
          <p class="document-meta-value">${escapeHtml(CLINIC_LETTERHEAD.city)}, ${escapeHtml(todayLabel())}</p>
        </div>
      </header>
      <div class="document-title">${heading}</div>
      <section class="patient-block">
        <div class="patient-block__header"><h2>Dane pacjenta</h2></div>
        <p class="patient-name">${escapeHtml(person.name || "—")}</p>
        <dl class="patient-details">
          <div><dt>PESEL:</dt><dd>${escapeHtml(person.pesel || "—")}</dd></div>
          <div><dt>Data urodzenia:</dt><dd>${escapeHtml(person.birthDate || "—")}</dd></div>
          <div><dt>Adres:</dt><dd>${escapeHtml(patientAddress(person) || "—")}</dd></div>
        </dl>
      </section>
      <section class="document-content">${sections}</section>
      </div>
      <table class="print-sign">
        <tr>
          <td>
            <p class="doctor-signature__label">Lekarz orzekający / wystawiający</p>
            <p class="doctor-signature__name">${escapeHtml(sign.line || "—")}</p>
            <p class="doctor-signature__pwz">PWZ: ${escapeHtml(sign.pwz || "—")}</p>
            <div class="doctor-signature__stamp-space"></div>
            <div class="doctor-signature__line"></div>
            <p class="doctor-signature__caption">podpis i pieczątka lekarza</p>
          </td>
        </tr>
      </table>
    </article>
    </body></html>`;
}

function pdfPageCount(buffer) {
  const raw = new TextDecoder("latin1").decode(buffer);
  return (raw.match(/\/Type\s*\/Page(?!s)/g) || []).length;
}

function stronyLabel(count) {
  if (count === 1) return "1 strona";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} strony`;
  return `${count} stron`;
}

function printPdfUrl(url) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;";
  frame.src = url;
  const cleanup = () => {
    frame.onload = null;
    frame.remove();
  };
  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      frame.contentWindow.onafterprint = cleanup;
      setTimeout(cleanup, 60000);
    } catch {
      cleanup();
      toast.error("Nie udało się otworzyć okna wydruku.");
    }
  };
  document.body.appendChild(frame);
}

export const ClinicSheetPdfView = forwardRef(function ClinicSheetPdfView(props, ref) {
  const frameRef = useRef(null);
  const [src, setSrc] = useState("");
  const [pages, setPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(true);
  const requestKey = JSON.stringify({
    title: props.title,
    fields: props.fields,
    values: props.values,
    patient: props.patient,
    doctorName: props.doctorName,
    doctorTitle: props.doctorTitle,
    doctorPwz: props.doctorPwz,
    documentNumber: props.documentNumber,
    status: props.status,
  });

  useEffect(() => {
    let cancelled = false;
    let localUrl = "";
    setPending(true);
    const timer = setTimeout(async () => {
      try {
        const blob = await clinicDocumentsHelper.previewPdf(buildClinicSheetHtml(JSON.parse(requestKey)));
        const buffer = await blob.arrayBuffer();
        const count = pdfPageCount(buffer);
        localUrl = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
        if (cancelled) {
          URL.revokeObjectURL(localUrl);
          return;
        }
        setPages(count);
        setFailed(false);
        setSrc(localUrl);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setPending(false);
      }
    }, props.debounceMs || 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [requestKey, props.debounceMs]);

  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src);
  }, [src]);

  useImperativeHandle(ref, () => ({
    print() {
      if (!src) {
        toast.error("Podgląd wydruku jeszcze się przygotowuje.");
        return false;
      }
      printPdfUrl(src);
      return true;
    },
  }), [src]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 text-xs font-semibold text-slate-700">
        {pages > 0 ? `Wydruk: ${stronyLabel(pages)}` : pending ? "Przygotowuję podgląd wydruku…" : "Podgląd wydruku"}
        {pending && pages > 0 ? " · odświeżanie…" : ""}
      </p>
      {failed && !src ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-700">Nie udało się przygotować podglądu wydruku.</p>
      ) : src ? (
        <iframe ref={frameRef} title={props.title || "Dokument"} src={`${src}#navpanes=0&view=FitH`} className="min-h-0 w-full flex-1 rounded-lg border-0 bg-neutral-600" />
      ) : (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">Przygotowuję podgląd wydruku…</p>
      )}
    </div>
  );
});

export async function printClinicSheet(props) {
  const notice = toast.loading("Przygotowuję wydruk…");
  try {
    const blob = await clinicDocumentsHelper.previewPdf(buildClinicSheetHtml(props));
    const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    printPdfUrl(objectUrl);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    toast.success("Okno wydruku jest otwarte.", { id: notice });
    return true;
  } catch (err) {
    console.error(err);
    toast.error("Nie udało się przygotować wydruku.", { id: notice });
    return false;
  }
}
