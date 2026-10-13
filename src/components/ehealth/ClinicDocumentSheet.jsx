import React, { useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
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
.clinic-pages .patient-details dd { margin: 0; color: #1f1f1f; font-size: 10.5pt; font-weight: 500; white-space: pre-wrap; }
.clinic-pages .document-content { margin: 6mm 0; }
.clinic-pages .document-content > .document-section + .document-section { margin-top: 6mm; }
.clinic-pages .document-section__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 2mm; margin: 0 0 1.5mm; }
.clinic-pages .document-section__label { margin: 0; color: #27272a; font-size: 9.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.35; }
.clinic-pages .document-section { max-width: 100%; min-width: 0; }
.clinic-pages .document-section__value { margin: 0; color: #18181b; font-size: 10.5pt; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; max-width: 100%; }
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

function todayLabel() {
  return new Date().toLocaleDateString("pl-PL");
}

const PAGE_GAP = 16;
const SIGNATURE_BOTTOM_MM = 22;
const FOOTER_RESERVE_MM = 18;
const PAGE_TOP_MM = 14;

function clearPageBreaks(root) {
  root.querySelectorAll(".sheet-page-break").forEach((node) => node.remove());
}

function makePageBreak(height) {
  const spacer = document.createElement("span");
  spacer.className = "sheet-page-break";
  spacer.setAttribute("contenteditable", "false");
  spacer.setAttribute("aria-hidden", "true");
  spacer.style.height = `${Math.round(height)}px`;
  return spacer;
}

function textLines(block) {
  const hosts = [...block.querySelectorAll(".document-section__value, .sheet-write")];
  const lines = [];
  hosts.forEach((host) => {
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest(".sheet-page-break")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let textNode;
    while ((textNode = walker.nextNode())) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      [...range.getClientRects()].forEach((rect) => {
        if (rect.height >= 1) lines.push({ node: textNode, top: rect.top, bottom: rect.bottom });
      });
    }
  });
  return lines;
}

function splitOffset(node, viewportTop) {
  const text = node.textContent || "";
  let low = 0;
  let high = text.length;
  const range = document.createRange();
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    range.setStart(node, mid);
    range.setEnd(node, Math.min(text.length, mid + 1));
    const rect = range.getBoundingClientRect();
    if (!rect.height || rect.top < viewportTop - 0.5) low = mid + 1;
    else high = mid;
  }
  return low;
}

function insertPageBreak(node, offset, height) {
  const extra = Math.round(height);
  if (extra < 1 || !node?.parentNode) return false;
  const grow = (spacer) => {
    const current = parseFloat(spacer.style.height) || 0;
    const next = Math.round(current + extra);
    if (next - current < 1) return false;
    spacer.style.height = `${next}px`;
    return true;
  };
  if (offset <= 0) {
    if (node.previousSibling?.classList?.contains("sheet-page-break")) return grow(node.previousSibling);
    node.parentNode.insertBefore(makePageBreak(extra), node);
    return true;
  }
  if (offset >= (node.textContent || "").length) return false;
  const after = node.splitText(offset);
  if (after.previousSibling?.classList?.contains("sheet-page-break")) return grow(after.previousSibling);
  after.parentNode.insertBefore(makePageBreak(extra), after);
  return true;
}

function pageBudget(page, metrics, signaturePage, ceilings) {
  const signatureBudget = metrics.pageH - metrics.signatureCut;
  const footerBudget = metrics.pageH - metrics.footerReserve;
  let budget = page === signaturePage ? signatureBudget : footerBudget;
  if (ceilings.has(page)) budget = Math.min(budget, ceilings.get(page));
  return budget;
}

function fragmentBlock(block, origin, metrics, signaturePage, ceilings) {
  const { pageH, stride, topInset } = metrics;
  for (let guard = 0; guard < 24; guard += 1) {
    const lines = textLines(block);
    let moved = false;
    for (const line of lines) {
      const top = line.top - origin;
      const bottom = line.bottom - origin;
      const page = Math.floor(Math.max(0, top) / stride);
      const limit = page * stride + pageBudget(page, metrics, signaturePage, ceilings);
      if (bottom <= limit + 1) continue;
      const nextStart = (page + 1) * stride + topInset;
      const gap = nextStart - top;
      if (gap < 1) continue;
      moved = insertPageBreak(line.node, splitOffset(line.node, line.top), gap);
      break;
    }
    if (!moved) break;
  }
}

function layoutPass(root, metrics, signaturePage, ceilings) {
  const { stride, topInset } = metrics;
  const blocks = [...root.querySelectorAll(".sheet-block")];
  clearPageBreaks(root);
  blocks.forEach((block) => { block.style.marginTop = ""; });
  blocks.forEach((block) => {
    const top = block.offsetTop;
    const height = block.offsetHeight;
    const page = Math.floor(Math.max(0, top) / stride);
    const limit = page * stride + pageBudget(page, metrics, signaturePage, ceilings);
    const remaining = limit - top;
    const fitsOnNext = height <= pageBudget(page + 1, metrics, signaturePage, ceilings) - topInset;
    const startsTooLow = remaining < 36;
    if ((startsTooLow || fitsOnNext) && top + height > limit - 4 && top > page * stride + 24) {
      const nextTop = (page + 1) * stride + topInset;
      const shift = Math.round(nextTop - top);
      if (shift > 2) block.style.marginTop = `${shift}px`;
    }
    fragmentBlock(block, root.getBoundingClientRect().top, metrics, signaturePage, ceilings);
  });
}

function lastContentPage(root, stride) {
  let last = 0;
  root.querySelectorAll(".sheet-block").forEach((block) => {
    const bottom = block.offsetTop + block.offsetHeight;
    last = Math.max(last, Math.floor(Math.max(0, bottom - 1) / stride));
  });
  return last;
}

function layoutA4(root) {
  const ruler = root.parentElement?.querySelector("[data-page-ruler]");
  const pageH = ruler?.offsetHeight || Math.round((297 / 25.4) * 96);
  const mm = (value) => (value / 297) * pageH;
  const signatureH = root.parentElement?.querySelector("[data-sheet-signature]")?.offsetHeight || mm(70);
  const metrics = {
    pageH,
    stride: pageH + PAGE_GAP,
    topInset: Math.round(mm(PAGE_TOP_MM)),
    footerReserve: mm(FOOTER_RESERVE_MM),
    signatureCut: mm(SIGNATURE_BOTTOM_MM) + signatureH + mm(8),
  };
  if (!root.querySelector(".sheet-block")) return 1;

  let signaturePage = -1;
  let pages = 1;
  const ceilings = new Map();
  for (let pass = 0; pass < 8; pass += 1) {
    layoutPass(root, metrics, signaturePage, ceilings);
    const last = lastContentPage(root, metrics.stride);
    if (signaturePage < 0) {
      signaturePage = last;
      continue;
    }
    if (last > signaturePage) {
      ceilings.set(signaturePage, metrics.pageH - metrics.signatureCut);
      signaturePage = last;
      continue;
    }
    pages = Math.max(last, signaturePage) + 1;
    return pages;
  }
  return Math.max(lastContentPage(root, metrics.stride), signaturePage, 0) + 1;
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
  const contentRef = useRef(null);
  const [pages, setPages] = useState(1);
  const layoutKey = `${heading}|${fields.map((field) => `${field.key}:${field.label}:${values[field.key] || ""}`).join("|")}|${person.name}|${person.pesel}|${person.birthDate}|${person.address}|${mode}`;

  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    let frame = 0;
    const placeCaret = (offset) => {
      if (offset == null) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.parentElement?.closest(".sheet-page-break") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      let left = offset;
      let node;
      while ((node = walker.nextNode())) {
        if (left <= node.textContent.length) {
          const range = document.createRange();
          range.setStart(node, left);
          range.collapse(true);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        left -= node.textContent.length;
      }
    };
    const caretOffset = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount || !root.contains(selection.anchorNode)) return null;
      const range = document.createRange();
      range.selectNodeContents(root);
      range.setEnd(selection.anchorNode, selection.anchorOffset);
      const holder = document.createElement("div");
      holder.appendChild(range.cloneContents());
      holder.querySelectorAll(".sheet-page-break").forEach((node) => node.remove());
      return holder.textContent.length;
    };
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = caretOffset();
        const next = layoutA4(root);
        setPages((current) => (current === next ? current : next));
        placeCaret(offset);
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
    <div className="clinic-pages relative mx-auto w-[210mm]" style={{ position: "relative", width: "210mm", height: `calc(${pages} * 297mm + ${(pages - 1) * PAGE_GAP}px)` }}>
      <style>{SHEET_CSS}</style>
      <div data-page-ruler className="absolute top-0 left-0 h-[297mm] w-px opacity-0 pointer-events-none" style={{ position: "absolute", top: 0, left: 0, height: "297mm", width: "1px" }} />
      {Array.from({ length: pages }, (_, index) => (
        <article
          key={index}
          className="absolute left-0 w-[210mm] h-[297mm] bg-white"
          style={{ position: "absolute", left: 0, width: "210mm", height: "297mm", background: "#fff", top: `calc(${index} * 297mm + ${index * PAGE_GAP}px)`, boxShadow: "0 2px 16px rgba(0, 0, 0, 0.12)" }}
        >
          {index === pages - 1 && (
            <div data-sheet-signature className="absolute z-30 bg-white" style={{ position: "absolute", zIndex: 30, background: "#fff", right: "15mm", bottom: `${SIGNATURE_BOTTOM_MM}mm`, width: "78mm" }}>
              <p className="doctor-signature__label">Lekarz orzekający / wystawiający</p>
              <p className="doctor-signature__name">{sign.line || "—"}</p>
              <p className="doctor-signature__pwz">PWZ: {sign.pwz || "—"}</p>
              {sign.specialty ? <p className="doctor-signature__specialty">{sign.specialty}</p> : null}
              <div className="doctor-signature__stamp-space" aria-hidden="true" />
              <div className="doctor-signature__line" />
              <p className="doctor-signature__caption">podpis i pieczątka lekarza</p>
            </div>
          )}
          <footer className="sheet-page-footer absolute z-30 bg-white" style={{ position: "absolute", zIndex: 30, background: "#fff", left: "15mm", right: "15mm", bottom: "6mm" }}>
            Strona {index + 1} z {pages}
          </footer>
        </article>
      ))}
      <div ref={contentRef} className="relative z-10" style={{ position: "relative", zIndex: 10, padding: `${PAGE_TOP_MM}mm 15mm 4mm`, minWidth: 0, overflowWrap: "anywhere" }}>
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
      const breaks = host.querySelectorAll(".sheet-page-break").length;
      const key = `${articles}:${blocks}:${breaks}`;
      stableFrames = key === previous && articles > 0 && blocks > 0 ? stableFrames + 1 : 0;
      previous = key;
      if (stableFrames >= 4 || performance.now() - started > 2000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function whenReady(popup) {
  const links = [...popup.document.querySelectorAll('link[rel="stylesheet"]')];
  const styles = Promise.all(links.map((link) => new Promise((resolve) => {
    if (link.sheet) resolve();
    else {
      link.onload = () => resolve();
      link.onerror = () => resolve();
    }
  })));
  const fonts = popup.document.fonts?.ready || Promise.resolve();
  return Promise.all([styles, fonts]);
}

export async function printClinicSheet({ title, fields, values, patient, doctorName, doctorTitle, doctorPwz, documentNumber, status }) {
  const popup = window.open("", "_blank");
  if (!popup) {
    toast.error("Przeglądarka zablokowała okno wydruku. Zezwól na wyskakujące okna.");
    return false;
  }
  const notice = toast.loading("Otwieram okno wydruku…");
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
    sheet.style.position = "relative";
    sheet.style.width = "210mm";
    sheet.style.margin = "0";
    articles.forEach((article, index) => {
      article.style.position = "absolute";
      article.style.left = "0";
      article.style.width = "210mm";
      article.style.height = "297mm";
      article.style.background = "#fff";
      article.style.boxShadow = "none";
      article.style.top = `calc(${index} * 297mm + ${index * PAGE_GAP}px)`;
    });
    const pageHeight = articles[0].offsetHeight;
    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((node) => node.outerHTML).join("\n");
    const pages = articles.map((_, index) => (
      `<section class="print-page"><div style="margin-top:-${index * (pageHeight + PAGE_GAP)}px">${sheet.outerHTML}</div></section>`
    )).join("");
    const heading = escapeHtml(title || "Dokument");
    popup.document.open();
    popup.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${heading}</title>${styles}
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .print-page { width: 210mm; height: 297mm; overflow: hidden; break-after: page; page-break-after: always; }
        .print-page:last-child { break-after: auto; page-break-after: auto; }
      </style></head><body>${pages}</body></html>`);
    popup.document.close();
    await whenReady(popup);
    popup.focus();
    popup.print();
    popup.onafterprint = () => popup.close();
    toast.success("Okno wydruku jest otwarte.", { id: notice });
    return true;
  } catch (err) {
    console.error(err);
    popup.close();
    toast.error("Nie udało się otworzyć okna wydruku.", { id: notice });
    return false;
  } finally {
    root.unmount();
    host.remove();
  }
}
