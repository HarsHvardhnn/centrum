import React, { useEffect, useRef } from "react";

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

const TYPE_LABELS = { text: "Krótki tekst", textarea: "Długi tekst", date: "Data" };

function formatBirth(value) {
  const text = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const [year, month, day] = text.split("-");
  return `${day}.${month}.${year}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("pl-PL");
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
  doctorPwz = "",
  documentNumber = "",
  status = "template",
  selectedKey = "",
  mode = "preview",
  onSelectField,
  onEditField,
  onChange,
  visitHint,
}) {
  const sample = mode === "admin";
  const person = sample ? SAMPLE_PATIENT : (patient || {});
  const issued = status === "issued";
  const editable = mode === "fill" && !issued;
  const heading = (title || "DOKUMENT").toUpperCase();

  return (
    <article className="clinic-sheet bg-white text-black w-[210mm] min-h-[297mm] mx-auto shadow-lg border border-slate-200 px-10 py-8 text-[11pt] leading-snug">
      <style>{".sheet-write:empty:before{content:attr(data-placeholder);color:#94a3b8;font-style:italic}"}</style>
      <header className="flex justify-between gap-6 border-b border-black pb-3">
        <div>
          <p className="text-[15pt] font-bold">{CLINIC_LETTERHEAD.name}</p>
          <p className="text-[8pt] uppercase tracking-wide">{CLINIC_LETTERHEAD.legalName}</p>
          <p className="text-[9pt] mt-1">{CLINIC_LETTERHEAD.street}</p>
          <p className="text-[9pt]">{CLINIC_LETTERHEAD.postal} {CLINIC_LETTERHEAD.city}</p>
          <p className="text-[8pt] mt-1">NIP: {CLINIC_LETTERHEAD.nip} · REGON: {CLINIC_LETTERHEAD.regon} · KRS: {CLINIC_LETTERHEAD.krs}</p>
          <p className="text-[8pt]">Nr księgi rejestrowej (RPWDL): {CLINIC_LETTERHEAD.rpwdl}</p>
        </div>
        <div className="text-right text-[9pt] shrink-0">
          <p className="uppercase tracking-wide text-[8pt]">Miejsce i data wystawienia</p>
          <p className="font-semibold">{CLINIC_LETTERHEAD.city},<br />{todayLabel()}</p>
          <p className="uppercase tracking-wide text-[8pt] mt-3">Numer dokumentu</p>
          <p className="font-semibold">{issued && documentNumber ? documentNumber : sample ? "Wzór formularza" : "Szkic roboczy"}</p>
        </div>
      </header>

      <h1 className="text-center text-[16pt] font-bold tracking-wide my-6">{heading}</h1>

      <section className="mb-6">
        <h2 className="text-[9pt] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Dane pacjenta</h2>
        <p className="font-semibold text-[12pt]">{person.name || "—"}</p>
        <p>PESEL: <span className="font-mono">{person.pesel || "—"}</span></p>
        {person.birthDate ? <p>Data urodzenia: {formatBirth(person.birthDate)}</p> : null}
        {person.address ? <p>Adres: {person.address}</p> : null}
      </section>

      <section className="space-y-5">
        {fields.length === 0 && (
          <p className="text-center text-slate-400 italic border border-dashed border-slate-300 rounded-lg py-6">
            Ten wzór nie ma jeszcze pól. Dodaj pierwsze pole w panelu po lewej stronie.
          </p>
        )}
        {fields.map((field) => {
          const selected = selectedKey === field.key;
          const value = values[field.key] || "";
          const hint = visitHint?.(field);
          return (
            <section
              key={field.key}
              id={`a4-section-${field.key}`}
              onClick={() => onSelectField?.(field.key)}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onEditField?.(field);
              }}
              className={`rounded-lg ${onSelectField ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-teal-600 bg-teal-50/50 p-3 -m-3" : onSelectField ? "hover:bg-slate-50 p-2 -m-2" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[10pt] font-bold uppercase tracking-wide">{field.label || "Pole"}</h3>
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
                    className="mt-1 bg-transparent border-0 border-b border-slate-300 text-[11pt] focus:outline-none focus:border-teal-700"
                  />
                ) : (
                  <InlineText
                    id={`field-input-${field.key}`}
                    value={value}
                    multiline={field.type !== "text"}
                    placeholder="Kliknij, aby wpisać treść"
                    onChange={(next) => onChange?.(field.key, next)}
                  />
                )
              ) : (
                <p className={`mt-1 whitespace-pre-wrap ${value ? "" : "italic text-slate-400"}`}>
                  {value || "[ wartość uzupełniana przez lekarza ]"}
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

      <section className="mt-12 text-right">
        <p className="text-[8pt] uppercase tracking-wide text-slate-500">Lekarz orzekający / wystawiający</p>
        <p className="font-semibold mt-6">{doctorName || " "}</p>
        {doctorPwz ? <p className="text-[9pt]">PWZ: {doctorPwz}</p> : null}
        <div className="ml-auto mt-8 w-48 border-t border-black pt-1 text-[8pt]">podpis i pieczątka lekarza</div>
      </section>
      <footer className="mt-10 pt-2 border-t border-slate-200 text-center text-[8pt] text-slate-500">Strona 1 z 1</footer>
    </article>
  );
}

function esc(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

export function printClinicSheet({ title, fields, values, patient, doctorName, doctorPwz, documentNumber, status }) {
  const person = patient || {};
  const heading = esc(title || "DOKUMENT").toUpperCase();
  const blocks = (fields || []).map((field) => {
    const value = esc(values?.[field.key] || "—").replace(/\n/g, "<br/>");
    const label = esc(field.label || "");
    return `<section style="margin:0 0 16px"><h3 style="margin:0 0 4px;font-size:10pt;letter-spacing:.04em;text-transform:uppercase">${label}</h3><p style="margin:0;white-space:pre-wrap">${value}</p></section>`;
  }).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${heading}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      body { font-family: Arial, sans-serif; color: #111; font-size: 11pt; }
      h1 { text-align: center; letter-spacing: .04em; font-size: 16pt; margin: 22px 0; }
      header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 8px; }
      .right { text-align: right; font-size: 9pt; }
      .sign { margin-top: 48px; text-align: right; }
      .line { display: inline-block; width: 190px; border-top: 1px solid #000; padding-top: 4px; font-size: 8pt; }
    </style></head><body>
    <header>
      <div>
        <strong style="font-size:15pt">${CLINIC_LETTERHEAD.name}</strong>
        <div style="font-size:8pt">${CLINIC_LETTERHEAD.legalName}</div>
        <div>${CLINIC_LETTERHEAD.street}<br/>${CLINIC_LETTERHEAD.postal} ${CLINIC_LETTERHEAD.city}</div>
        <div style="font-size:8pt">NIP: ${CLINIC_LETTERHEAD.nip} · REGON: ${CLINIC_LETTERHEAD.regon} · KRS: ${CLINIC_LETTERHEAD.krs}<br/>Nr księgi rejestrowej (RPWDL): ${CLINIC_LETTERHEAD.rpwdl}</div>
      </div>
      <div class="right">
        <div>MIEJSCE I DATA WYSTAWIENIA</div>
        <strong>${CLINIC_LETTERHEAD.city}, ${todayLabel()}</strong>
        <div style="margin-top:10px">NUMER DOKUMENTU</div>
        <strong>${status === "issued" && documentNumber ? documentNumber : "Szkic roboczy"}</strong>
      </div>
    </header>
    <h1>${heading}</h1>
    <h2 style="font-size:9pt;letter-spacing:.06em;border-bottom:1px solid #ccc">DANE PACJENTA</h2>
    <p><strong>${esc(person.name || "—")}</strong><br/>PESEL: ${esc(person.pesel || "—")}${person.birthDate ? `<br/>Data urodzenia: ${esc(formatBirth(person.birthDate))}` : ""}${person.address ? `<br/>Adres: ${esc(person.address)}` : ""}</p>
    ${blocks}
    <div class="sign">
      <div style="font-size:8pt">LEKARZ ORZEKAJĄCY / WYSTAWIAJĄCY</div>
      <div style="margin-top:28px"><strong>${esc(doctorName || "")}</strong>${doctorPwz ? `<br/>PWZ: ${esc(doctorPwz)}` : ""}</div>
      <div class="line">podpis i pieczątka lekarza</div>
    </div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`;
  const popup = window.open("", "_blank");
  if (!popup) return false;
  popup.document.write(html);
  popup.document.close();
  return true;
}
