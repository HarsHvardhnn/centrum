import React, { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, Pencil, Trash2, X, Printer } from "lucide-react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../helpers/clinicDocumentsHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import ClinicDocumentSheet, { printClinicSheet, SAMPLE_PATIENT } from "../ehealth/ClinicDocumentSheet";

const CATEGORIES = [
  { value: "certificate", label: "Zaświadczenia i orzeczenia" },
  { value: "recommendations", label: "Zalecenia i informacje" },
  { value: "referral", label: "Skierowania" },
  { value: "consent", label: "Zgody i oświadczenia" },
  { value: "administrative", label: "Dokumenty administracyjne" },
  { value: "other", label: "Inne dokumenty" },
];

const FIELD_TYPES = [
  ["text", "Krótki tekst"],
  ["textarea", "Długi tekst"],
  ["date", "Data"],
];

const emptyForm = {
  name: "",
  printTitle: "",
  code: "",
  category: "certificate",
  description: "",
  active: true,
  doctorAvailability: "all",
  assignedDoctorIds: [],
  fields: [{ key: "purpose", label: "Cel wydania zaświadczenia", type: "textarea", required: true }],
};

function codeFromName(name, existing) {
  if (existing) return existing;
  const letters = String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return `${(letters.slice(0, 6) || "DOK")}-${Date.now().toString().slice(-4)}`;
}

function categoryLabel(value) {
  return CATEGORIES.find((row) => row.value === value)?.label || value;
}

export default function ClinicDocumentTemplatesPage() {
  const [rows, setRows] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [fieldDraft, setFieldDraft] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  const load = async () => {
    try {
      setRows(await clinicDocumentsHelper.listTemplates());
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
    doctorStatsHelper.getDoctorsList().then((res) => setDoctors(res?.data || [])).catch(() => setDoctors([]));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => `${row.name} ${row.code} ${row.description}`.toLowerCase().includes(q));
  }, [rows, query]);

  const save = async () => {
    if (!editing.name.trim()) {
      toast.error("Podaj nazwę wzoru.");
      return;
    }
    if (!String(editing.printTitle || "").trim()) {
      toast.error("Podaj tytuł na wydruku.");
      return;
    }
    const fields = (editing.fields || []).filter((field) => field.label.trim()).map((field, index) => ({
      key: field.key || `field_${index + 1}`,
      label: field.label.trim(),
      type: field.type || "textarea",
      required: Boolean(field.required),
    }));
    try {
      await clinicDocumentsHelper.saveTemplate({
        ...editing,
        printTitle: editing.printTitle.trim(),
        code: codeFromName(editing.name, editing.code),
        fields,
      }, editing._id);
      toast.success("Zapisano wzór");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <FileStack size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Szablony dokumentów</h1>
              <p className="text-sm text-slate-500">Twórz wzory dokumentów spoza P1 i przypisuj je lekarzom. {rows.length} wzorów</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedKey("purpose");
              setEditing({ ...emptyForm, fields: emptyForm.fields.map((field) => ({ ...field })) });
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold"
          >
            <Plus size={16} /> Nowy wzór
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj wzoru po nazwie lub opisie..."
          className="w-full mb-5 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <div className="grid md:grid-cols-2 gap-4">
          {visible.map((row) => (
            <article key={row._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-teal-700">[{row.code}] {categoryLabel(row.category)}</div>
              <h2 className="font-semibold text-slate-900 mt-1">{row.name}</h2>
              <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{row.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>
                  Dostępność lekarzy: {row.doctorAvailability === "specific" ? `Wybrani (${row.assignedDoctorIds?.length || 0})` : "Wszyscy lekarze"}
                  {" · "}{row.fields?.length || 0} pól
                </span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => {
                    const next = { ...row, printTitle: row.printTitle || row.name, active: row.active !== false, assignedDoctorIds: (row.assignedDoctorIds || []).map(String) };
                    setSelectedKey(next.fields?.[0]?.key || "");
                    setEditing(next);
                  }} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                    <Pencil size={14} /> Edytuj
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Usunąć ten wzór?")) return;
                      try {
                        await clinicDocumentsHelper.deleteTemplate(row._id);
                        load();
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Usuń"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-[1280px] h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg">Nowy wzór dokumentu</h2>
                <p className="text-sm text-slate-500">Zdefiniuj tytuł i pola, które lekarz uzupełni podczas wystawiania dokumentu.</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Zamknij"><X size={18} /></button>
            </div>
            <div className="flex-1 grid lg:grid-cols-[380px_minmax(0,1fr)] overflow-hidden">
              <div className="overflow-y-auto p-5 space-y-4 border-r border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider">Dane wzoru</h3>
                <label className="block text-xs font-semibold">Nazwa wzoru *
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="np. Zaświadczenie do pracy" className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" />
                  <span className="block font-normal text-slate-500 mt-1">Nazwa administracyjna widoczna na liście wzorów w systemie.</span>
                </label>
                <label className="block text-xs font-semibold">Tytuł na wydruku *
                  <input value={editing.printTitle || ""} onChange={(e) => setEditing({ ...editing, printTitle: e.target.value.toUpperCase() })} placeholder="np. ZAŚWIADCZENIE LEKARSKIE" className="mt-1 w-full border rounded-lg px-3 py-2 font-semibold tracking-wide" />
                  <span className="block font-normal text-slate-500 mt-1">Ten tekst jest wyśrodkowany jako oficjalny nagłówek dokumentu A4.</span>
                </label>
                <label className="block text-xs font-semibold">Kategoria *
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal bg-white">
                    {CATEGORIES.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
                  </select>
                </label>
                <label className="flex items-start gap-3 p-3 bg-slate-50 border rounded-xl text-xs">
                  <input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="mt-0.5" />
                  <span><span className="font-bold block">Wzór aktywny</span><span className="text-slate-500">Aktywny wzór będzie dostępny dla personelu placówki zgodnie z uprawnieniami.</span></span>
                </label>
                <div className="text-xs font-bold">Dostępność dokumentu dla lekarzy</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border ${editing.doctorAvailability !== "specific" ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
                    <input type="radio" className="mr-2" checked={editing.doctorAvailability !== "specific"} onChange={() => setEditing({ ...editing, doctorAvailability: "all", assignedDoctorIds: [] })} />
                    <span className="font-bold">Wszyscy lekarze</span>
                    <span className="block text-slate-500 mt-1">Wzór dostępny dla całego personelu medycznego placówki.</span>
                  </label>
                  <label className={`p-3 rounded-xl border ${editing.doctorAvailability === "specific" ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
                    <input type="radio" className="mr-2" checked={editing.doctorAvailability === "specific"} onChange={() => setEditing({ ...editing, doctorAvailability: "specific" })} />
                    <span className="font-bold">Wybrani lekarze z listy</span>
                    <span className="block text-slate-500 mt-1">Dostępny tylko dla lekarzy wskazanych z listy.</span>
                  </label>
                </div>
                {editing.doctorAvailability === "specific" && (
                  <div className="max-h-28 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {doctors.map((doctor) => {
                      const id = String(doctor._id);
                      const checked = (editing.assignedDoctorIds || []).includes(id);
                      return (
                        <label key={id} className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={checked} onChange={() => {
                            const next = checked ? editing.assignedDoctorIds.filter((item) => item !== id) : [...(editing.assignedDoctorIds || []), id];
                            setEditing({ ...editing, assignedDoctorIds: next });
                          }} />
                          {doctor.name}
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider">Pola dokumentu</h3>
                  <button type="button" onClick={() => setFieldDraft({ key: `field_${Date.now()}`, label: "", type: "textarea", required: true, isNew: true })} className="text-xs font-semibold text-teal-700 border border-teal-300 rounded-lg px-2 py-1">+ Dodaj pole</button>
                </div>
                <p className="text-[11px] text-slate-500">Dodaj informacje, które lekarz ma uzupełnić w treści dokumentu.</p>
                {(editing.fields || []).map((field, index) => (
                  <div key={field.key} id={`field-row-${field.key}`} className={`border rounded-xl p-3 text-xs ${selectedKey === field.key ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
                    <button type="button" className="w-full text-left" onClick={() => {
                      setSelectedKey(field.key);
                      document.getElementById(`a4-section-${field.key}`)?.scrollIntoView({ block: "center" });
                    }}>
                      <div className="font-semibold">{index + 1}. {field.label || "Nowe pole"}</div>
                      <div className="text-slate-500 mt-1">{FIELD_TYPES.find((row) => row[0] === field.type)?.[1] || field.type}{field.required ? " · Wymagane" : ""}{selectedKey === field.key ? " · Wybrana na A4" : ""}</div>
                    </button>
                    <div className="flex gap-3 mt-2">
                      <button type="button" className="text-teal-700 font-semibold" onClick={() => setFieldDraft({ ...field, isNew: false })}>Edytuj</button>
                      <button type="button" className="text-rose-600" onClick={() => {
                        const fields = editing.fields.filter((item) => item.key !== field.key);
                        setEditing({ ...editing, fields });
                        if (selectedKey === field.key) setSelectedKey(fields[0]?.key || "");
                      }}>Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-100 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
                  <span>Interaktywny podgląd arkusza A4 · Kliknij sekcję, aby zaznaczyć pole; dwuklik otwiera edycję</span>
                  <button type="button" onClick={() => setPrintOpen(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white font-semibold"><Printer size={14} /> Podgląd wydruku</button>
                </div>
                <ClinicDocumentSheet
                  mode="admin"
                  title={editing.printTitle || editing.name}
                  fields={editing.fields || []}
                  selectedKey={selectedKey}
                  onSelectField={(key) => {
                    setSelectedKey(key);
                    document.getElementById(`field-row-${key}`)?.scrollIntoView({ block: "nearest" });
                  }}
                  onEditField={(field) => setFieldDraft({ ...field, isNew: false })}
                />
              </div>
            </div>
            <div className="px-6 py-3 border-t flex justify-between">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg">Anuluj</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPrintOpen(true)} className="px-4 py-2 border rounded-lg inline-flex items-center gap-1"><Printer size={14} /> Podgląd i druk</button>
                <button type="button" onClick={save} className="px-4 py-2 bg-emerald-700 text-white rounded-full font-semibold">Zapisz wzór</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fieldDraft && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl">
            <h3 className="font-bold">{fieldDraft.isNew ? "Nowe pole" : "Edytuj pole"}</h3>
            <label className="block text-sm">Etykieta na dokumencie *
              <input value={fieldDraft.label} onChange={(e) => setFieldDraft({ ...fieldDraft, label: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            <label className="block text-sm">Typ
              <select value={fieldDraft.type} onChange={(e) => setFieldDraft({ ...fieldDraft, type: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
                {FIELD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(fieldDraft.required)} onChange={(e) => setFieldDraft({ ...fieldDraft, required: e.target.checked })} /> Pole wymagane</label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFieldDraft(null)} className="px-3 py-2 border rounded-lg">Anuluj</button>
              <button type="button" onClick={() => {
                if (!fieldDraft.label.trim()) { toast.error("Podaj etykietę pola."); return; }
                const next = { key: fieldDraft.key, label: fieldDraft.label.trim(), type: fieldDraft.type || "textarea", required: Boolean(fieldDraft.required) };
                const fields = fieldDraft.isNew
                  ? [...(editing.fields || []), next]
                  : (editing.fields || []).map((field) => (field.key === next.key ? next : field));
                setEditing({ ...editing, fields });
                setSelectedKey(next.key);
                setFieldDraft(null);
              }} className="px-3 py-2 bg-teal-700 text-white rounded-lg">Zapisz pole</button>
            </div>
          </div>
        </div>
      )}

      {printOpen && editing && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 overflow-y-auto p-6">
          <div className="max-w-[900px] mx-auto">
            <div className="flex justify-end gap-2 mb-3">
              <button type="button" onClick={() => printClinicSheet({ title: editing.printTitle || editing.name, fields: editing.fields, patient: SAMPLE_PATIENT, status: "template" })} className="px-4 py-2 bg-white rounded-lg font-semibold inline-flex items-center gap-1"><Printer size={14} /> Drukuj</button>
              <button type="button" onClick={() => setPrintOpen(false)} className="px-4 py-2 bg-white rounded-lg">Zamknij</button>
            </div>
            <ClinicDocumentSheet mode="preview" title={editing.printTitle || editing.name} fields={editing.fields || []} />
          </div>
        </div>
      )}
    </div>
  );
}
