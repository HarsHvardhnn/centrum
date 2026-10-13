import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

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
.clinic-pages .medical-document-header { display: grid; grid-template-columns: minmax(0, 1fr) 56mm; gap: 8mm; align-items: start; padding: 0 0 7mm; border-bottom: 0.5px solid #cbd5e1; }
.clinic-pages .clinic-name { margin: 0 0 1.2mm; color: #0f172a; font-size: 13.5pt; font-weight: 700; letter-spacing: -0.015em; line-height: 1.2; }
.clinic-pages .clinic-legal-name { margin: 0 0 2.2mm; color: #475569; font-size: 8.8pt; font-weight: 600; line-height: 1.35; letter-spacing: 0.03em; text-transform: uppercase; }
.clinic-pages .clinic-address { display: flex; flex-direction: column; margin: 0 0 2.5mm; color: #334155; font-size: 9.3pt; font-style: normal; line-height: 1.4; }
.clinic-pages .clinic-registry-data, .clinic-pages .clinic-registry-number { margin: 0; color: #64748b; font-size: 8.6pt; line-height: 1.45; font-variant-numeric: tabular-nums; }
.clinic-pages .clinic-registry-number { margin-top: 0.8mm; }
.clinic-pages .medical-document-header__meta { width: 56mm; min-width: 56mm; text-align: right; }
.clinic-pages .document-meta-label { margin: 0 0 1.2mm; color: #64748b; font-size: 8pt; font-weight: 600; letter-spacing: 0.08em; line-height: 1.35; text-transform: uppercase; }
.clinic-pages .document-meta-label--number { margin-top: 6mm; }
.clinic-pages .document-meta-value { margin: 0; color: #0f172a; font-size: 10.5pt; font-weight: 700; line-height: 1.35; }
.clinic-pages .document-draft-label { margin: 0 0 1.2mm; color: #475569; font-size: 10pt; font-style: italic; font-weight: 600; line-height: 1.35; }
.clinic-pages .document-draft-note { margin: 0; color: #64748b; font-size: 8.8pt; font-style: italic; line-height: 1.35; }
.clinic-pages .document-title { margin: 9mm 0 10mm; color: #1d1d1d; font-size: 17pt; font-weight: 700; line-height: 1.25; letter-spacing: 0.015em; text-align: center; text-transform: uppercase; }
.clinic-pages .patient-block { margin: 0 0 8mm; padding: 5mm 0; border-top: 0.5px solid #d8d8d8; border-bottom: 0.5px solid #d8d8d8; }
.clinic-pages .patient-block__header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 4mm; }
.clinic-pages .patient-block h2 { margin: 0; color: #2d2d2d; font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; line-height: 1.3; text-transform: uppercase; }
.clinic-pages .patient-name { margin: 0 0 3mm; color: #1f1f1f; font-size: 12pt; font-weight: 600; line-height: 1.35; }
.clinic-pages .patient-details { display: grid; gap: 2mm; margin: 0; }
.clinic-pages .patient-details > div { display: flex; align-items: baseline; gap: 2mm; }
.clinic-pages .patient-details dt { color: #666; font-size: 10.5pt; }
.clinic-pages .patient-details dd { margin: 0; color: #1f1f1f; font-size: 10.5pt; font-weight: 500; }
.clinic-pages .document-content { margin: 6mm 0; }
.clinic-pages .document-content > .document-section + .document-section { margin-top: 6mm; }
.clinic-pages .document-section__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 2mm; margin: 0 0 1.5mm; }
.clinic-pages .document-section__label { margin: 0; color: #27272a; font-size: 9.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.35; }
.clinic-pages .document-section__value { margin: 0; color: #18181b; font-size: 10.5pt; line-height: 1.6; white-space: pre-wrap; }
.clinic-pages .document-section__value.is-empty { color: #a1a1aa; font-style: italic; }
.clinic-pages .doctor-signature__label { margin: 0 0 2mm; color: #666; font-size: 9pt; letter-spacing: 0.08em; line-height: 1.3; text-transform: uppercase; }
.clinic-pages .doctor-signature__name { margin: 0 0 1.5mm; color: #1b1b1b; font-size: 11pt; font-weight: 600; line-height: 1.35; }
.clinic-pages .doctor-signature__pwz, .clinic-pages .doctor-signature__specialty { margin: 0 0 1.5mm; color: #333; font-size: 10pt; line-height: 1.35; }
.clinic-pages .doctor-signature__stamp-space { height: 28mm; }
.clinic-pages .doctor-signature__line { width: 100%; border-top: 0.75px solid #777; }
.clinic-pages .doctor-signature__caption { margin: 2mm 0 0; color: #666; font-size: 9pt; text-align: center; }
.clinic-pages .sheet-page-footer { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 8.5pt; color: #71717a; text-align: center; border-top: 0.5px solid #e4e4e7; padding-top: 3mm; }
.clinic-pages .sheet-write, .clinic-pages .sheet-input { width: 100%; min-height: 1.5em; padding: 1.5mm 2mm; color: #1f1f1f; font: inherit; font-size: 10.5pt; line-height: 1.5; background: rgba(0, 128, 115, 0.045); border: 0; border-bottom: 1px dashed rgba(0, 128, 115, 0.42); border-radius: 2px; outline: none; }
.clinic-pages .sheet-write:focus, .clinic-pages .sheet-input:focus { background: #fff; border-bottom: 2px solid #008073; }
.clinic-pages .sheet-write:empty:before { content: attr(data-placeholder); color: #8b96a3; font-style: italic; }
.clinic-pages .document-help { margin: 0.6mm 0 0; color: #64748b; font-size: 8pt; font-style: italic; font-weight: 400; letter-spacing: 0; text-transform: none; }
`;

function todayLabel() {
  return new Date().toLocaleDateString("pl-PL");
}

const PAGE_GAP = 16;

function layoutA4(root) {
  const ruler = root.parentElement?.querySelector("[data-page-ruler]");
  const pageH = ruler?.offsetHeight || Math.round((297 / 25.4) * 96);
  const footer = 64;
  const signatureH = root.parentElement?.querySelector("[data-sheet-signature]")?.offsetHeight || 260;
  const stride = pageH + PAGE_GAP;
  const blocks = [...root.querySelectorAll(".sheet-block")];
  if (!blocks.length) return 1;
  const applied = blocks.map((block) => parseFloat(block.style.marginTop) || 0);
  let carried = 0;
  const natural = blocks.map((block, index) => {
    carried += applied[index];
    return block.offsetTop - carried;
  });
  const heights = blocks.map((block) => block.offsetHeight);
  const gaps = heights.map((height, index) => (
    index < natural.length - 1 ? Math.max(0, natural[index + 1] - (natural[index] + height)) : 0
  ));
  const pack = (signaturePage) => {
    let cursor = natural[0];
    let page = 0;
    const shifts = [];
    const tops = [];
    heights.forEach((height, index) => {
      const reserve = page === signaturePage ? signatureH : 0;
      const limit = page * stride + pageH - footer - reserve;
      const used = cursor - page * stride;
      let shift = 0;
      if (cursor + height > limit - 4 && used > 48) {
        const nextTop = (page + 1) * stride + 12;
        shift = Math.max(0, nextTop - cursor);
        cursor = nextTop;
        page += 1;
      }
      shifts.push(shift);
      tops.push(cursor);
      cursor += height + gaps[index];
      const bottomPage = Math.floor(Math.max(0, cursor - 1) / stride);
      if (bottomPage > page) page = bottomPage;
    });
    return { shifts, tops, page };
  };
  let signaturePage = 0;
  let laid = pack(signaturePage);
  for (let guard = 0; guard < 6; guard += 1) {
    const ceiling = laid.page * stride + pageH - footer - signatureH;
    const overlaps = laid.tops.some((top, index) => top >= laid.page * stride - 2 && top + heights[index] > ceiling + 2);
    if (!overlaps && laid.page === signaturePage) break;
    if (overlaps && laid.page === signaturePage) break;
    signaturePage = laid.page;
    laid = pack(signaturePage);
  }
  blocks.forEach((block, index) => {
    const desired = laid.shifts[index] > 0 ? Math.round(laid.shifts[index]) : 0;
    const current = parseFloat(block.style.marginTop) || 0;
    if (Math.abs(current - desired) > 1) block.style.marginTop = desired > 0 ? `${desired}px` : "";
  });
  return laid.page + 1;
}

function signatureIdentity({ doctorTitle, doctorName, doctorPwz, sample }) {
  const title = String(doctorTitle || "").trim();
  const name = String(doctorName || "").trim();
  const pwz = String(doctorPwz || "").trim();
  if (sample && !title && !name && !pwz) {
    return { line: "Dr n. med. Jan Kowalski", pwz: "7481920", specialty: "Kardiologia / Choroby wewnętrzne" };
  }
  return { line: [title, name].filter(Boolean).join(" "), pwz, specialty: "" };
}

function InlineText({ id, value, placeholder, multiline, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== (value || "")) {
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
      onInput={(event) => onChange(event.currentTarget.innerText || "")}
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
  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);
  const layoutKey = `${heading}|${fields.map((field) => `${field.key}:${field.label}:${values[field.key] || ""}`).join("|")}|${person.name}|${person.pesel}|${person.birthDate}|${person.address}|${mode}`;

  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = layoutA4(root);
        setPages((current) => (current === next ? current : next));
      });
    };
    run();
    const observer = new ResizeObserver(run);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [layoutKey]);

  return (
    <div className="clinic-pages relative mx-auto w-[210mm]" style={{ height: `calc(${pages} * 297mm + ${(pages - 1) * PAGE_GAP}px)` }}>
      <style>{SHEET_CSS}</style>
      <div data-page-ruler className="absolute top-0 left-0 h-[297mm] w-px opacity-0 pointer-events-none" />
      {Array.from({ length: pages }, (_, index) => (
        <article
          key={index}
          className="absolute left-0 w-[210mm] h-[297mm] bg-white"
          style={{ top: `calc(${index} * 297mm + ${index * PAGE_GAP}px)`, boxShadow: "0 2px 16px rgba(0, 0, 0, 0.12)" }}
        >
          {index === pages - 1 && (
            <div data-sheet-signature className="absolute z-30 bg-white" style={{ right: "15mm", bottom: "16mm", width: "78mm" }}>
              <p className="doctor-signature__label">Lekarz orzekający / wystawiający</p>
              <p className="doctor-signature__name">{sign.line || "—"}</p>
              <p className="doctor-signature__pwz">PWZ: {sign.pwz || "—"}</p>
              {sign.specialty ? <p className="doctor-signature__specialty">{sign.specialty}</p> : null}
              <div className="doctor-signature__stamp-space" aria-hidden="true" />
              <div className="doctor-signature__line" />
              <p className="doctor-signature__caption">podpis i pieczątka lekarza</p>
            </div>
          )}
          <footer className="sheet-page-footer absolute z-30 bg-white" style={{ left: "15mm", right: "15mm", bottom: "6mm" }}>
            Strona {index + 1} z {pages}
          </footer>
        </article>
      ))}
      <div ref={contentRef} className="relative z-10" style={{ padding: "14mm 15mm 4mm" }}>
      <header className="sheet-block medical-document-header">
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
          <p className="document-meta-label">Miejsce i data wystawienia</p>
          <p className="document-meta-value">{CLINIC_LETTERHEAD.city}, {todayLabel()}</p>
          <p className="document-meta-label document-meta-label--number">Numer dokumentu</p>
          {issued && documentNumber ? (
            <p className="document-meta-value" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{documentNumber}</p>
          ) : sample ? (
            <p className="document-draft-note">Wzór formularza</p>
          ) : (
            <>
              <p className="document-draft-label">Szkic roboczy</p>
              <p className="document-draft-note">Numer zostanie nadany po zatwierdzeniu</p>
            </>
          )}
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
          const filled = field.type === "checkbox" ? value === "tak" : Boolean(String(value).trim());
          if (mode !== "admin" && !editable && field.printWhenFilled && !filled) return null;
          const printed = field.type === "checkbox" ? (value === "tak" ? "Tak" : "Nie") : value;
          const checkbox = (
            <label className="inline-flex items-center gap-2 text-[10.5pt]">
              <input
                type="checkbox"
                checked={value === "tak"}
                disabled={!editable}
                onChange={(event) => onChange?.(field.key, event.target.checked ? "tak" : "")}
              />
              {value === "tak" ? "Tak" : "Nie"}
            </label>
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
                <p className={`document-section__value ${printed ? "" : "is-empty"}`}>
                  {printed || "[ wartość uzupełniana przez lekarza ]"}
                </p>
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
    </div>
  );
}

function waitForSheet(host) {
  return new Promise((resolve) => {
    const started = performance.now();
    let previous = "";
    let stableFrames = 0;
    const tick = () => {
      const articles = host.querySelectorAll("article").length;
      const blocks = host.querySelectorAll(".sheet-block").length;
      const key = `${articles}:${blocks}`;
      stableFrames = key === previous && articles > 0 && blocks > 0 ? stableFrames + 1 : 0;
      previous = key;
      if (stableFrames >= 4 || performance.now() - started > 2000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function openPdf(pdf, filename) {
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank");
  if (!popup) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function printClinicSheet({ title, fields, values, patient, doctorName, doctorTitle, doctorPwz, documentNumber, status }) {
  const notice = toast.loading("Przygotowuję plik PDF…");
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:0;top:0;width:210mm;z-index:-1;pointer-events:none;background:#fff;";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    root.render(
      <ClinicDocumentSheet
        mode="preview"
        title={title}
        fields={fields || []}
        values={values || {}}
        patient={patient}
        doctorName={doctorName}
        doctorTitle={doctorTitle}
        doctorPwz={doctorPwz}
        documentNumber={documentNumber}
        status={status}
      />
    );
    await waitForSheet(host);
    const sheet = host.querySelector(".clinic-pages");
    const articles = [...host.querySelectorAll("article")];
    if (!sheet || !articles.length) throw new Error("Podgląd dokumentu jest pusty.");
    articles.forEach((article) => {
      article.style.boxShadow = "none";
      article.style.borderColor = "#ffffff";
    });
    const canvas = await html2canvas(sheet, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: title || "Dokument" });
    const ratio = canvas.width / sheet.offsetWidth;
    const pagePx = Math.round(articles[0].offsetHeight * ratio);
    const gapPx = Math.round(PAGE_GAP * ratio);
    articles.forEach((_, index) => {
      if (index > 0) pdf.addPage();
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = pagePx;
      const ctx = slice.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, index * (pagePx + gapPx), canvas.width, pagePx, 0, 0, canvas.width, pagePx);
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
    });
    const filename = `${String(title || "dokument").replace(/[\\/:*?"<>|]+/g, "").trim() || "dokument"}.pdf`;
    openPdf(pdf, filename);
    toast.success("Plik PDF jest gotowy do wydruku.", { id: notice });
    return true;
  } catch (err) {
    console.error(err);
    toast.error("Nie udało się przygotować pliku PDF.", { id: notice });
    return false;
  } finally {
    root.unmount();
    host.remove();
  }
}
