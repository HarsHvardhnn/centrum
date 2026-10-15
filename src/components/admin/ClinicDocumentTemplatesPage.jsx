import React, { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, Pencil, Trash2, X, Printer, Eye, Copy, MoreVertical, EyeOff, Users, Check } from "lucide-react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../helpers/clinicDocumentsHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import { useUser } from "../../context/userContext";
import { apiCaller } from "../../utils/axiosInstance";
import ClinicDocumentSheet, { ISSUE_DATE_VALUE, localIsoDate, previewFieldValues, printClinicSheet, SAMPLE_PATIENT } from "../ehealth/ClinicDocumentSheet";

const CATEGORIES = [
  { value: "certificate", label: "Zaświadczenia i orzeczenia" },
  { value: "recommendations", label: "Zalecenia i informacje" },
  { value: "referral", label: "Skierowania" },
  { value: "consent", label: "Zgody i oświadczenia" },
  { value: "administrative", label: "Dokumenty administracyjne" },
  { value: "other", label: "Inne dokumenty" },
];

function toCamelKey(label) {
  const ascii = String(label || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/gi, "l");
  const parts = ascii.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!parts.length) return "";
  return parts[0] + parts.slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

const FIELD_TYPES = [
  ["text", "Krótki tekst"],
  ["textarea", "Długi tekst"],
  ["date", "Data"],
  ["select", "Lista wyboru"],
  ["checkbox", "Checkbox Tak/Nie"],
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

function personName(user) {
  if (!user) return "";
  if (typeof user.name === "string") return user.name.trim();
  return `${user.name?.first || ""} ${user.name?.last || ""}`.trim();
}

function signatureFromUser(user, { allowAnyRole = false } = {}) {
  if (!user) return {};
  if (!allowAnyRole && user.role !== "doctor") return {};
  const name = personName(user);
  const title = user.professionalTitle || "";
  const pwz = user.npwz || user.pwz || "";
  if (!name && !title && !pwz) return {};
  return { doctorName: name, doctorTitle: title, doctorPwz: pwz };
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DoctorAccessModal({ templateName, templateCode, doctors, query, onQuery, selectedIds, onChange, onClose, onSave }) {
  const q = query.trim().toLowerCase();
  const visible = doctors.filter((doctor) => !q || `${doctor.name} ${doctor.npwz} ${(doctor.specializations || []).join(" ")}`.toLowerCase().includes(q));
  const selected = new Set(selectedIds.map(String));
  const toggle = (id) => {
    const key = String(id);
    onChange(selected.has(key) ? selectedIds.filter((item) => String(item) !== key) : [...selectedIds, key]);
  };
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[86vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-teal-700">{templateCode ? `[${templateCode}] ` : ""}Dostępność wzoru dla lekarzy</div>
            <p className="text-xs text-slate-500 mt-1">Wybierz lekarzy z kartoteki placówki, którzy mogą użyć tego wzoru.</p>
            <p className="text-sm font-semibold mt-1">Wzór: „{templateName}”</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={18} /></button>
        </div>
        <div className="px-5 py-3 space-y-2 border-b">
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={doctors.length > 0 && doctors.every((doctor) => selected.has(String(doctor._id)))}
              onChange={(e) => onChange(e.target.checked ? doctors.map((doctor) => String(doctor._id)) : [])}
            />
            <span>
              <span className="font-semibold block">Udostępnij wszystkim aktywnym lekarzom</span>
              <span className="text-slate-500">Lista pochodzi z kont lekarzy w systemie, a nie z przykładowych nazwisk.</span>
            </span>
          </label>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Szukaj lekarza..." className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div className="flex items-center justify-between text-xs">
            <span>Wybrano: {selectedIds.length} z {doctors.length}</span>
            <span className="flex gap-3">
              <button type="button" className="text-teal-700 font-semibold" onClick={() => onChange(visible.map((doctor) => String(doctor._id)))}>Zaznacz widocznych</button>
              <button type="button" className="text-slate-500" onClick={() => onChange([])}>Wyczyść wybór</button>
            </span>
          </div>
          {selectedIds.length === 0 && (
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2">Wzór będzie niedostępny dla lekarzy. Żaden lekarz nie będzie mógł wybrać tego wzoru.</p>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-2 flex-1">
          {visible.length === 0 && <p className="text-sm text-slate-500 py-6">Brak lekarzy w systemie. Dodaj lekarza w Kontach i wpisz numer PWZ.</p>}
          {visible.map((doctor) => {
            const id = String(doctor._id);
            return (
              <label key={id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 text-sm">
                <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} />
                <span className="w-8 h-8 rounded-full bg-slate-100 text-[11px] font-bold flex items-center justify-center shrink-0">{initials(doctor.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold block truncate">{doctor.name}</span>
                  <span className="text-xs text-slate-500 block truncate">{(doctor.specializations || []).join(" / ") || "Brak specjalizacji"}</span>
                </span>
                <span className={`text-xs shrink-0 ${doctor.npwz ? "text-slate-600" : "text-amber-700"}`}>{doctor.npwz ? `PWZ: ${doctor.npwz}` : "Brak PWZ"}</span>
              </label>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Anuluj</button>
          <button type="button" onClick={() => (onSave ? onSave() : onClose())} className="px-4 py-2 bg-teal-700 text-white rounded-lg font-semibold">Zapisz dostępność</button>
        </div>
      </div>
    </div>
  );
}

function codeFromName(name, existing) {
  if (existing) return existing;
  const letters = String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return `${(letters.slice(0, 6) || "DOK")}-${Date.now().toString().slice(-4)}`;
}

function categoryLabel(value) {
  return CATEGORIES.find((row) => row.value === value)?.label || value;
}

function fieldCountLabel(count) {
  const n = Number(count) || 0;
  if (n === 1) return "1 pole";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} pola`;
  return `${n} pól`;
}

export default function ClinicDocumentTemplatesPage({ personal = false }) {
  const { user, updateUserField } = useUser();
  const [signer, setSigner] = useState(() => signatureFromUser(user, { allowAnyRole: personal }));
  const [rows, setRows] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [fieldDraft, setFieldDraft] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [menuFor, setMenuFor] = useState("");
  const [previewRow, setPreviewRow] = useState(null);
  const [accessTarget, setAccessTarget] = useState(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [clinicRows, setClinicRows] = useState([]);

  useEffect(() => {
    const next = signatureFromUser(user, { allowAnyRole: personal });
    setSigner((current) => ({
      doctorName: next.doctorName || current.doctorName || "",
      doctorTitle: next.doctorTitle || current.doctorTitle || "",
      doctorPwz: next.doctorPwz || current.doctorPwz || "",
    }));
  }, [user?.id, user?.role, user?.name, user?.npwz, user?.pwz, user?.professionalTitle, personal]);

  useEffect(() => {
    let cancelled = false;
    apiCaller("GET", "/auth/profile/user")
      .then((response) => {
        const data = response?.data?.data;
        if (cancelled || !data) return;
        const next = signatureFromUser(
          { ...user, ...data, name: personName(data) || personName(user) },
          { allowAnyRole: personal || data.role === "doctor" }
        );
        if (next.doctorName || next.doctorPwz || next.doctorTitle) setSigner(next);
        if (data.npwz) updateUserField("npwz", data.npwz);
        if (data.professionalTitle) updateUserField("professionalTitle", data.professionalTitle);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, personal]);

  const load = async () => {
    try {
      setRows(await clinicDocumentsHelper.listTemplates({ manage: personal }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
    if (!personal) doctorStatsHelper.getDoctorsList().then((res) => setDoctors(res?.data || [])).catch(() => setDoctors([]));
  }, [personal]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => `${row.name} ${row.code} ${row.description}`.toLowerCase().includes(q));
  }, [rows, query]);

  const openEditor = (row) => {
    const next = { ...row, printTitle: row.printTitle || row.name, active: row.active !== false, assignedDoctorIds: (row.assignedDoctorIds || []).map(String) };
    setSelectedKey(next.fields?.[0]?.key || "");
    setEditing(next);
    setMenuFor("");
  };

  const duplicateTemplate = async (row) => {
    const name = `${row.name} (kopia)`;
    try {
      await clinicDocumentsHelper.saveTemplate({
        name,
        printTitle: row.printTitle || row.name,
        code: codeFromName(name, ""),
        category: row.category,
        description: row.description || "",
        active: row.active !== false,
        personal,
        doctorAvailability: row.doctorAvailability || "all",
        assignedDoctorIds: row.assignedDoctorIds || [],
        fields: (row.fields || []).map((field) => ({ ...field })),
      });
      toast.success("Utworzono kopię wzoru");
      setMenuFor("");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleHidden = async (row) => {
    const hidden = row.active === false;
    try {
      await clinicDocumentsHelper.saveTemplate({ active: hidden }, row._id);
      toast.success(personal
        ? (hidden ? "Wzór jest znów na liście przy wystawianiu" : "Wzór ukryty na liście przy wystawianiu")
        : (hidden ? "Wzór jest znów widoczny dla lekarzy" : "Wzór ukryty dla lekarzy"));
      setMenuFor("");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

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
      options: Array.isArray(field.options) ? field.options : [],
      defaultValue: field.defaultValue || "",
      helpText: field.helpText || "",
      placeholder: field.placeholder || "",
      printWhenFilled: Boolean(field.printWhenFilled),
    }));
    try {
      await clinicDocumentsHelper.saveTemplate({
        ...editing,
        personal,
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
              <h1 className="text-xl font-bold text-slate-900">{personal ? "Moje wzory dokumentów" : "Szablony dokumentów"}</h1>
              <p className="text-sm text-slate-500">{personal ? "Wzory widoczne tylko na Twojej liście przy wystawianiu dokumentu z wizyty." : "Twórz wzory dokumentów spoza P1 i przypisuj je lekarzom."} {rows.length} wzorów</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {personal && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const catalog = await clinicDocumentsHelper.listTemplates();
                    setClinicRows(catalog.filter((row) => !row.ownerId));
                    setCopyOpen(true);
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-teal-700 text-teal-800 text-sm font-semibold"
              >
                <Copy size={16} /> Skopiuj wzór placówki
              </button>
            )}
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
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj wzoru po nazwie lub opisie..."
          className="w-full mb-5 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <div className="grid md:grid-cols-2 gap-4">
          {visible.length === 0 && (
            <p className="text-sm text-slate-500">{personal ? "Nie masz jeszcze własnych wzorów. Utwórz nowy albo skopiuj wzór placówki." : "Brak wzorów."}</p>
          )}
          {visible.map((row) => (
            <article key={row._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[11px] font-bold text-teal-700">[{row.code}] {categoryLabel(row.category)}</div>
              <h2 className="font-semibold text-slate-900 mt-1">{row.name}</h2>
              <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{row.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500 gap-2">
                <span>
                  {personal
                    ? (row.active === false ? "Ukryty przy wystawianiu" : "Widoczny przy wystawianiu")
                    : `Dostępność lekarzy: ${row.active === false ? "Ukryty" : row.doctorAvailability === "specific" ? `Wybrani (${row.assignedDoctorIds?.length || 0})` : "Wszyscy lekarze"}`}
                  {" · "}{fieldCountLabel(row.fields?.length)}
                </span>
                <span className="flex items-center gap-1 relative">
                  <button type="button" onClick={() => openEditor(row)} className="inline-flex items-center gap-1 text-teal-700 font-semibold px-2 py-1 rounded-lg hover:bg-teal-50">
                    <Pencil size={14} /> Edytuj
                  </button>
                  <button type="button" aria-label="Więcej" onClick={() => setMenuFor(menuFor === row._id ? "" : row._id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                    <MoreVertical size={16} />
                  </button>
                  {menuFor === row._id && (
                    <>
                      <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Zamknij menu" onClick={() => setMenuFor("")} />
                      <div className="absolute right-0 top-8 z-20 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-sm text-slate-800">
                        <button type="button" onClick={() => { setPreviewRow(row); setMenuFor(""); }} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2"><Eye size={14} /> Podgląd wzoru</button>
                        <button type="button" onClick={() => openEditor(row)} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2"><Pencil size={14} /> Edytuj wzór</button>
                        <button type="button" onClick={() => duplicateTemplate(row)} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2"><Copy size={14} /> Duplikuj wzór</button>
                        {!personal && (
                          <button type="button" onClick={() => { setAccessTarget({ ...row, assignedDoctorIds: (row.assignedDoctorIds || []).map(String) }); setDoctorQuery(""); setMenuFor(""); }} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2"><Users size={14} /> Dostępność lekarzy</button>
                        )}
                        <button type="button" onClick={() => toggleHidden(row)} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2 text-amber-800"><EyeOff size={14} /> {row.active === false ? (personal ? "Pokaż przy wystawianiu" : "Pokaż lekarzom") : (personal ? "Ukryj przy wystawianiu" : "Ukryj dla lekarzy")}</button>
                        <button type="button" onClick={async () => {
                          if (!window.confirm("Usunąć ten wzór?")) return;
                          try {
                            await clinicDocumentsHelper.deleteTemplate(row._id);
                            setMenuFor("");
                            load();
                          } catch (err) {
                            toast.error(err.message);
                          }
                        }} className="w-full px-3 py-2 text-left hover:bg-slate-50 inline-flex items-center gap-2 text-rose-700"><Trash2 size={14} /> Usuń wzór</button>
                      </div>
                    </>
                  )}
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
                  <span><span className="font-bold block">Wzór aktywny</span><span className="text-slate-500">{personal ? "Aktywny wzór pojawi się na Twojej liście przy wystawianiu dokumentu." : "Aktywny wzór będzie dostępny dla personelu placówki zgodnie z uprawnieniami."}</span></span>
                </label>
                {!personal && <div className="text-xs font-bold">Dostępność dokumentu dla lekarzy</div>}
                {!personal && <div className="grid grid-cols-2 gap-2 text-xs">
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
                </div>}
                {!personal && editing.doctorAvailability === "specific" && (
                  <div className="space-y-2">
                    <button type="button" onClick={() => { setDoctorQuery(""); setDoctorPickerOpen(true); }} className="w-full text-left border border-teal-300 rounded-xl px-3 py-2 text-xs">
                      <span className="font-semibold text-teal-800">Wybierz lekarzy z systemu</span>
                      <span className="block text-slate-500 mt-0.5">
                        {(editing.assignedDoctorIds || []).length
                          ? `${editing.assignedDoctorIds.length} wybranych`
                          : "Żaden lekarz nie jest jeszcze wskazany"}
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-1">
                      {(editing.assignedDoctorIds || []).map((id) => {
                        const doctor = doctors.find((row) => String(row._id) === String(id));
                        if (!doctor) return null;
                        return <span key={id} className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">{doctor.name}{doctor.npwz ? ` · PWZ ${doctor.npwz}` : ""}</span>;
                      })}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider">Pola dokumentu</h3>
                  <button type="button" onClick={() => setFieldDraft({ key: "", label: "", type: "text", required: false, printWhenFilled: false, helpText: "", placeholder: "", defaultValue: "", options: [], isNew: true, keyTouched: false })} className="text-xs font-semibold text-teal-700 border border-teal-300 rounded-lg px-2 py-1">+ Dodaj pole</button>
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
                      <button type="button" className="text-teal-700 font-semibold" onClick={() => setFieldDraft({ ...field, isNew: false, keyTouched: true, originalKey: field.key })}>Edytuj</button>
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
                  values={previewFieldValues(editing.fields)}
                  {...signer}
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

      {accessTarget && (
        <DoctorAccessModal
          templateName={accessTarget.name || "wzór"}
          templateCode={accessTarget.code}
          doctors={doctors}
          query={doctorQuery}
          onQuery={setDoctorQuery}
          selectedIds={accessTarget.assignedDoctorIds || []}
          onChange={(ids) => setAccessTarget({ ...accessTarget, assignedDoctorIds: ids })}
          onClose={() => setAccessTarget(null)}
          onSave={async () => {
            try {
              const ids = accessTarget.assignedDoctorIds || [];
              const everyone = doctors.length > 0 && ids.length === doctors.length;
              await clinicDocumentsHelper.saveTemplate({
                doctorAvailability: everyone ? "all" : "specific",
                assignedDoctorIds: everyone ? [] : ids,
              }, accessTarget._id);
              toast.success("Zapisano dostępność lekarzy");
              setAccessTarget(null);
              load();
            } catch (err) {
              toast.error(err.message);
            }
          }}
        />
      )}

      {copyOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Skopiuj wzór placówki</h3>
              <button type="button" onClick={() => setCopyOpen(false)} aria-label="Zamknij"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {clinicRows.length === 0 && <p className="text-sm text-slate-500">Brak wzorów placówki przypisanych do Ciebie.</p>}
              {clinicRows.map((row) => (
                <button
                  key={row._id}
                  type="button"
                  className="w-full text-left border rounded-lg p-3 hover:border-teal-400"
                  onClick={async () => {
                    try {
                      await clinicDocumentsHelper.saveTemplate({
                        name: `${row.name} (mój)`,
                        printTitle: row.printTitle || row.name,
                        code: codeFromName(`${row.name} moj`, ""),
                        category: row.category,
                        description: row.description || "",
                        personal: true,
                        active: true,
                        fields: (row.fields || []).map((field) => ({ ...field })),
                      });
                      toast.success("Wzór skopiowany do Twojej listy");
                      setCopyOpen(false);
                      load();
                    } catch (err) {
                      toast.error(err.message);
                    }
                  }}
                >
                  <div className="text-[11px] font-bold text-teal-700">[{row.code}]</div>
                  <div className="font-semibold text-sm">{row.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewRow && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 overflow-y-auto p-6">
          <div className="max-w-[900px] mx-auto">
            <div className="flex justify-between items-center mb-3 text-white">
              <div>
                <div className="text-xs font-bold">[{previewRow.code}] Podgląd wzoru</div>
                <div className="font-semibold">{previewRow.name}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { printClinicSheet({ title: previewRow.printTitle || previewRow.name, fields: previewRow.fields, values: previewFieldValues(previewRow.fields), patient: SAMPLE_PATIENT, status: "template", ...signer }); }} className="px-4 py-2 bg-white text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"><Printer size={14} /> Drukuj</button>
                <button type="button" onClick={() => setPreviewRow(null)} className="px-4 py-2 bg-white text-slate-800 rounded-lg">Zamknij</button>
              </div>
            </div>
            <ClinicDocumentSheet mode="preview" title={previewRow.printTitle || previewRow.name} fields={previewRow.fields || []} values={previewFieldValues(previewRow.fields)} patient={SAMPLE_PATIENT} {...signer} />
          </div>
        </div>
      )}

      {doctorPickerOpen && editing && (
        <DoctorAccessModal
          templateName={editing.name || "wzór"}
          templateCode={editing.code}
          doctors={doctors}
          query={doctorQuery}
          onQuery={setDoctorQuery}
          selectedIds={editing.assignedDoctorIds || []}
          onChange={(ids) => setEditing({ ...editing, assignedDoctorIds: ids, doctorAvailability: "specific" })}
          onClose={() => setDoctorPickerOpen(false)}
        />
      )}

      {fieldDraft && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">{fieldDraft.isNew ? "Dodaj pole" : "Edytuj pole"}</h3>
              <button type="button" onClick={() => setFieldDraft(null)} aria-label="Zamknij"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm font-medium">Nazwa pola widoczna dla lekarza *
                <input
                  value={fieldDraft.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const next = { ...fieldDraft, label };
                    if (fieldDraft.isNew && !fieldDraft.keyTouched) next.key = toCamelKey(label);
                    setFieldDraft(next);
                  }}
                  placeholder="np. Zalecenia ogólne i postępowanie dietetyczno-ruchowe"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal"
                />
              </label>
              <label className="block text-sm font-medium">Identyfikator techniczny *
                <input
                  value={fieldDraft.key || ""}
                  onChange={(e) => setFieldDraft({ ...fieldDraft, key: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""), keyTouched: true })}
                  placeholder="np. zaleceniaOgolne"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">Automatycznie generowany jako camelCase. Widoczny tylko w konfiguracji wzoru.</span>
              </label>
              <label className="block text-sm font-medium">Typ pola *
                <select
                  value={fieldDraft.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const options = type === "select" && !(fieldDraft.options || []).length ? ["Opcja 1", "Opcja 2"] : (fieldDraft.options || []);
                    let defaultValue = fieldDraft.defaultValue || "";
                    if (type === "checkbox") defaultValue = defaultValue === "tak" || defaultValue === "nie" ? defaultValue : "";
                    else if (type === "select") defaultValue = options.includes(defaultValue) ? defaultValue : "";
                    else if (type === "date") defaultValue = defaultValue === ISSUE_DATE_VALUE || /^\d{4}-\d{2}-\d{2}$/.test(defaultValue) ? defaultValue : "";
                    else if (fieldDraft.type === "checkbox" || fieldDraft.type === "select" || fieldDraft.type === "date") defaultValue = "";
                    setFieldDraft({ ...fieldDraft, type, options, defaultValue });
                  }}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-normal"
                >
                  {FIELD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Tekst pomocniczy
                <input value={fieldDraft.helpText || ""} onChange={(e) => setFieldDraft({ ...fieldDraft, helpText: e.target.value })} placeholder="Widoczny tylko lekarzowi podczas wystawiania dokumentu (opcjonalny)" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" />
              </label>
              {fieldDraft.type !== "checkbox" && fieldDraft.type !== "date" && (
                <label className="block text-sm font-medium">Placeholder
                  <input value={fieldDraft.placeholder || ""} onChange={(e) => setFieldDraft({ ...fieldDraft, placeholder: e.target.value })} placeholder="np. Wpisz szczegółowe zalecenia..." className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" />
                </label>
              )}
              {fieldDraft.type === "select" ? (
                <label className="block text-sm font-medium">Domyślna wartość
                  <select value={fieldDraft.defaultValue || ""} onChange={(e) => setFieldDraft({ ...fieldDraft, defaultValue: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-normal">
                    <option value="">Brak</option>
                    {(fieldDraft.options || []).filter((option) => option.trim()).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ) : fieldDraft.type === "checkbox" ? (
                <label className="block text-sm font-medium">Domyślna wartość
                  <select value={fieldDraft.defaultValue === "tak" || fieldDraft.defaultValue === "nie" ? fieldDraft.defaultValue : ""} onChange={(e) => setFieldDraft({ ...fieldDraft, defaultValue: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-normal">
                    <option value="">Brak — pole nie pojawi się na wydruku</option>
                    <option value="tak">Tak</option>
                    <option value="nie">Nie</option>
                  </select>
                </label>
              ) : fieldDraft.type === "date" ? (
                <div>
                  <label className="block text-sm font-medium">Domyślna wartość
                    <select
                      value={fieldDraft.defaultValue === ISSUE_DATE_VALUE ? ISSUE_DATE_VALUE : fieldDraft.defaultValue ? "fixed" : ""}
                      onChange={(e) => {
                        const mode = e.target.value;
                        const fixed = /^\d{4}-\d{2}-\d{2}$/.test(fieldDraft.defaultValue || "") ? fieldDraft.defaultValue : localIsoDate();
                        setFieldDraft({ ...fieldDraft, defaultValue: mode === ISSUE_DATE_VALUE ? ISSUE_DATE_VALUE : mode === "fixed" ? fixed : "" });
                      }}
                      className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-normal"
                    >
                      <option value="">Brak</option>
                      <option value={ISSUE_DATE_VALUE}>Data wystawienia (bieżąca data systemu)</option>
                      <option value="fixed">Wybrana data</option>
                    </select>
                  </label>
                  {fieldDraft.defaultValue === ISSUE_DATE_VALUE ? (
                    <p className="mt-1 text-xs font-normal text-slate-500">W dniu wystawienia dokumentu pole otrzyma datę z systemu. Lekarz może ją zmienić.</p>
                  ) : fieldDraft.defaultValue ? (
                    <input type="date" value={fieldDraft.defaultValue} onChange={(e) => setFieldDraft({ ...fieldDraft, defaultValue: e.target.value })} className="mt-2 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" />
                  ) : null}
                </div>
              ) : (
                <label className="block text-sm font-medium">Domyślna wartość
                  <input type="text" value={fieldDraft.defaultValue || ""} onChange={(e) => setFieldDraft({ ...fieldDraft, defaultValue: e.target.value })} placeholder="Wprowadź opcjonalną domyślną wartość..." className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal" />
                </label>
              )}
              {fieldDraft.type === "select" && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opcje listy *</span>
                    <button type="button" onClick={() => setFieldDraft({ ...fieldDraft, options: [...(fieldDraft.options || []), ""] })} className="text-xs font-semibold text-teal-700">+ Dodaj opcję</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(fieldDraft.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-5 text-sm text-slate-500">{index + 1}.</span>
                        <input
                          value={option}
                          onChange={(e) => {
                            const options = [...(fieldDraft.options || [])];
                            options[index] = e.target.value;
                            setFieldDraft({ ...fieldDraft, options, defaultValue: options.includes(fieldDraft.defaultValue) ? fieldDraft.defaultValue : "" });
                          }}
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
                        />
                        <button type="button" aria-label="Usuń opcję" onClick={() => {
                          const options = (fieldDraft.options || []).filter((_, item) => item !== index);
                          setFieldDraft({ ...fieldDraft, options, defaultValue: options.includes(fieldDraft.defaultValue) ? fieldDraft.defaultValue : "" });
                        }} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(fieldDraft.required)} onChange={(e) => setFieldDraft({ ...fieldDraft, required: e.target.checked })} /> Pole wymagane</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(fieldDraft.printWhenFilled)} onChange={(e) => setFieldDraft({ ...fieldDraft, printWhenFilled: e.target.checked })} /> Pokaż na wydruku, gdy posiada wartość</label>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setFieldDraft(null)} className="px-4 py-2 border border-slate-300 rounded-lg">Anuluj</button>
              <button type="button" onClick={() => {
                if (!fieldDraft.label.trim()) { toast.error("Podaj nazwę pola."); return; }
                const key = (fieldDraft.key || toCamelKey(fieldDraft.label)).trim();
                if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(key)) { toast.error("Identyfikator musi zaczynać się od litery."); return; }
                const originalKey = fieldDraft.originalKey || (fieldDraft.isNew ? "" : fieldDraft.key);
                if ((editing.fields || []).some((field) => field.key === key && field.key !== originalKey)) { toast.error("Taki identyfikator już istnieje w tym wzorze."); return; }
                const options = fieldDraft.type === "select" ? [...new Set((fieldDraft.options || []).map((option) => option.trim()).filter(Boolean))] : [];
                if (fieldDraft.type === "select" && options.length < 1) { toast.error("Dodaj co najmniej jedną opcję listy."); return; }
                const rawDefault = String(fieldDraft.defaultValue || "").trim();
                const defaultValue = fieldDraft.type === "checkbox"
                  ? (rawDefault === "tak" || rawDefault === "nie" ? rawDefault : "")
                  : fieldDraft.type === "select"
                    ? (options.includes(rawDefault) ? rawDefault : "")
                    : fieldDraft.type === "date"
                      ? (rawDefault === ISSUE_DATE_VALUE || /^\d{4}-\d{2}-\d{2}$/.test(rawDefault) ? rawDefault : "")
                      : rawDefault;
                const next = {
                  key,
                  label: fieldDraft.label.trim(),
                  type: fieldDraft.type || "text",
                  required: Boolean(fieldDraft.required),
                  options,
                  defaultValue,
                  helpText: String(fieldDraft.helpText || "").trim(),
                  placeholder: String(fieldDraft.placeholder || "").trim(),
                  printWhenFilled: Boolean(fieldDraft.printWhenFilled),
                };
                const fields = fieldDraft.isNew
                  ? [...(editing.fields || []), next]
                  : (editing.fields || []).map((field) => (field.key === originalKey ? next : field));
                setEditing({ ...editing, fields });
                setSelectedKey(next.key);
                setFieldDraft(null);
              }} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold inline-flex items-center gap-1">
                <Check size={16} /> {fieldDraft.isNew ? "Dodaj pole" : "Zapisz pole"}
              </button>
            </div>
          </div>
        </div>
      )}

      {printOpen && editing && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 overflow-y-auto p-6">
          <div className="max-w-[900px] mx-auto">
            <div className="flex justify-end gap-2 mb-3">
              <button type="button" onClick={() => { printClinicSheet({ title: editing.printTitle || editing.name, fields: editing.fields, values: previewFieldValues(editing.fields), patient: SAMPLE_PATIENT, status: "template", ...signer }); }} className="px-4 py-2 bg-white rounded-lg font-semibold inline-flex items-center gap-1"><Printer size={14} /> Drukuj</button>
              <button type="button" onClick={() => setPrintOpen(false)} className="px-4 py-2 bg-white rounded-lg">Zamknij</button>
            </div>
            <ClinicDocumentSheet mode="preview" title={editing.printTitle || editing.name} fields={editing.fields || []} values={previewFieldValues(editing.fields)} patient={SAMPLE_PATIENT} {...signer} />
          </div>
        </div>
      )}
    </div>
  );
}
