import React, { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../helpers/clinicDocumentsHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";

const CATEGORIES = [
  { value: "certificate", label: "Zaświadczenia i orzeczenia" },
  { value: "recommendations", label: "Zalecenia i informacje" },
  { value: "referral", label: "Skierowania" },
  { value: "consent", label: "Zgody i oświadczenia" },
  { value: "administrative", label: "Dokumenty administracyjne" },
  { value: "other", label: "Inne dokumenty" },
];

const emptyForm = {
  name: "",
  code: "",
  category: "certificate",
  description: "",
  doctorAvailability: "all",
  assignedDoctorIds: [],
  fields: [{ key: "content", label: "Treść", type: "textarea", required: true }],
};

function categoryLabel(value) {
  return CATEGORIES.find((row) => row.value === value)?.label || value;
}

export default function ClinicDocumentTemplatesPage() {
  const [rows, setRows] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

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
    if (!editing.name.trim() || !editing.code.trim()) {
      toast.error("Podaj nazwę i kod wzoru.");
      return;
    }
    const fields = (editing.fields || []).filter((field) => field.label.trim()).map((field, index) => ({
      key: field.key || `field_${index + 1}`,
      label: field.label.trim(),
      type: field.type || "textarea",
      required: Boolean(field.required),
    }));
    try {
      await clinicDocumentsHelper.saveTemplate({ ...editing, fields }, editing._id);
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
            onClick={() => setEditing({ ...emptyForm, fields: emptyForm.fields.map((field) => ({ ...field })) })}
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
                  <button type="button" onClick={() => setEditing({ ...row, assignedDoctorIds: (row.assignedDoctorIds || []).map(String) })} className="inline-flex items-center gap-1 text-teal-700 font-medium">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
            <h2 className="font-bold text-lg">{editing._id ? "Edytuj wzór" : "Nowy wzór"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">Nazwa<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
              <label className="text-sm">Kod<input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
            </div>
            <label className="text-sm block">Kategoria
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2">
                {CATEGORIES.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
              </select>
            </label>
            <label className="text-sm block">Opis
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            <div className="text-sm">
              <div className="font-medium mb-1">Dostępność lekarzy</div>
              <label className="flex items-center gap-2"><input type="radio" checked={editing.doctorAvailability !== "specific"} onChange={() => setEditing({ ...editing, doctorAvailability: "all", assignedDoctorIds: [] })} /> Wszyscy lekarze</label>
              <label className="flex items-center gap-2 mt-1"><input type="radio" checked={editing.doctorAvailability === "specific"} onChange={() => setEditing({ ...editing, doctorAvailability: "specific" })} /> Wybrani lekarze</label>
              {editing.doctorAvailability === "specific" && (
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {doctors.map((doctor) => {
                    const id = String(doctor._id);
                    const checked = (editing.assignedDoctorIds || []).includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? editing.assignedDoctorIds.filter((item) => item !== id)
                              : [...(editing.assignedDoctorIds || []), id];
                            setEditing({ ...editing, assignedDoctorIds: next });
                          }}
                        />
                        {doctor.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="text-sm space-y-2">
              <div className="font-medium">Pola dokumentu</div>
              {(editing.fields || []).map((field, index) => (
                <div key={field.key || index} className="grid grid-cols-12 gap-2">
                  <input value={field.label} onChange={(e) => {
                    const fields = editing.fields.slice();
                    fields[index] = { ...field, label: e.target.value };
                    setEditing({ ...editing, fields });
                  }} className="col-span-6 border rounded px-2 py-1" placeholder="Etykieta" />
                  <select value={field.type} onChange={(e) => {
                    const fields = editing.fields.slice();
                    fields[index] = { ...field, type: e.target.value };
                    setEditing({ ...editing, fields });
                  }} className="col-span-3 border rounded px-2 py-1">
                    <option value="text">Tekst</option>
                    <option value="textarea">Akapit</option>
                    <option value="date">Data</option>
                  </select>
                  <label className="col-span-2 text-xs flex items-center gap-1"><input type="checkbox" checked={field.required} onChange={(e) => {
                    const fields = editing.fields.slice();
                    fields[index] = { ...field, required: e.target.checked };
                    setEditing({ ...editing, fields });
                  }} />Wymagane</label>
                  <button type="button" className="text-red-600" onClick={() => setEditing({ ...editing, fields: editing.fields.filter((_, i) => i !== index) })}>×</button>
                </div>
              ))}
              <button type="button" className="text-teal-700 text-xs font-semibold" onClick={() => setEditing({ ...editing, fields: [...(editing.fields || []), { key: `field_${Date.now()}`, label: "", type: "textarea", required: false }] })}>
                + Dodaj pole
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg">Anuluj</button>
              <button type="button" onClick={save} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold">Zapisz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
