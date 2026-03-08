import React, { useEffect, useState } from "react";
import { FileStack, Plus, Pencil, Trash2, X } from "lucide-react";
import visitTemplatesHelper from "../../helpers/visitTemplatesHelper";
import { toast } from "sonner";

const SECTION_KEYS = [
  { key: "interview", label: "Wywiad z pacjentem" },
  { key: "physicalExamination", label: "Badanie przedmiotowe" },
  { key: "treatment", label: "Zastosowane leczenie" },
  { key: "recommendations", label: "Zalecenia" },
  { key: "notes", label: "Notatki" },
];

export default function VisitTemplatesPage() {
  const [activeTab, setActiveTab] = useState("section"); // "section" | "global"
  const [sectionKeys, setSectionKeys] = useState(SECTION_KEYS);
  const [sectionTemplates, setSectionTemplates] = useState([]);
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionFilter, setSectionFilter] = useState(""); // "" = all
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [editingGlobalId, setEditingGlobalId] = useState(null);
  const [formSectionKey, setFormSectionKey] = useState("interview");
  const [formName, setFormName] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSections, setFormSections] = useState({
    interview: "",
    physicalExamination: "",
    treatment: "",
    recommendations: "",
    notes: "",
  });

  const loadSectionKeys = () => {
    visitTemplatesHelper
      .getSectionKeys()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSectionKeys(data);
      })
      .catch(() => {});
  };

  const loadSectionTemplates = () => {
    setLoading(true);
    visitTemplatesHelper
      .listSectionTemplates(sectionFilter || null)
      .then(setSectionTemplates)
      .catch(() => toast.error("Nie udało się pobrać szablonów sekcji"))
      .finally(() => setLoading(false));
  };

  const loadGlobalTemplates = () => {
    setLoading(true);
    visitTemplatesHelper
      .listGlobalTemplates()
      .then(setGlobalTemplates)
      .catch(() => toast.error("Nie udało się pobrać szablonów globalnych"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSectionKeys();
  }, []);

  useEffect(() => {
    if (activeTab === "section") loadSectionTemplates();
    else loadGlobalTemplates();
  }, [activeTab, sectionFilter]);

  const getSectionLabel = (key) => sectionKeys.find((s) => s.key === key)?.label || key;

  const openNewSectionForm = () => {
    setEditingSectionId(null);
    setFormSectionKey("interview");
    setFormName("");
    setFormContent("");
    setShowSectionForm(true);
  };

  const openEditSectionForm = (t) => {
    setEditingSectionId(t._id);
    setFormSectionKey(t.sectionKey);
    setFormName(t.name);
    setFormContent(t.content ?? "");
    setShowSectionForm(true);
  };

  const saveSectionTemplate = async () => {
    if (!formName.trim()) {
      toast.error("Nazwa szablonu jest wymagana");
      return;
    }
    try {
      if (editingSectionId) {
        await visitTemplatesHelper.updateSectionTemplate(editingSectionId, {
          name: formName.trim(),
          content: formContent,
        });
        toast.success("Szablon zaktualizowany");
      } else {
        await visitTemplatesHelper.createSectionTemplate({
          sectionKey: formSectionKey,
          name: formName.trim(),
          content: formContent,
        });
        toast.success("Szablon utworzony");
      }
      setShowSectionForm(false);
      loadSectionTemplates();
    } catch (e) {
      toast.error(e?.message || "Nie udało się zapisać szablonu");
    }
  };

  const deleteSectionTemplate = async (id) => {
    if (!window.confirm("Czy na pewno usunąć ten szablon?")) return;
    try {
      await visitTemplatesHelper.deleteSectionTemplate(id);
      toast.success("Szablon usunięty");
      loadSectionTemplates();
    } catch (e) {
      toast.error(e?.message || "Nie udało się usunąć szablonu");
    }
  };

  const openNewGlobalForm = () => {
    setEditingGlobalId(null);
    setFormName("");
    setFormSections({
      interview: "",
      physicalExamination: "",
      treatment: "",
      recommendations: "",
      notes: "",
    });
    setShowGlobalForm(true);
  };

  const openEditGlobalForm = (t) => {
    setEditingGlobalId(t._id);
    setFormName(t.name ?? "");
    setFormSections({
      interview: t.sections?.interview ?? "",
      physicalExamination: t.sections?.physicalExamination ?? "",
      treatment: t.sections?.treatment ?? "",
      recommendations: t.sections?.recommendations ?? "",
      notes: t.sections?.notes ?? "",
    });
    setShowGlobalForm(true);
  };

  const saveGlobalTemplate = async () => {
    if (!formName.trim()) {
      toast.error("Nazwa szablonu jest wymagana");
      return;
    }
    try {
      if (editingGlobalId) {
        await visitTemplatesHelper.updateGlobalTemplate(editingGlobalId, {
          name: formName.trim(),
          sections: formSections,
        });
        toast.success("Szablon globalny zaktualizowany");
      } else {
        await visitTemplatesHelper.createGlobalTemplate({
          name: formName.trim(),
          sections: formSections,
        });
        toast.success("Szablon globalny utworzony");
      }
      setShowGlobalForm(false);
      loadGlobalTemplates();
    } catch (e) {
      toast.error(e?.message || "Nie udało się zapisać szablonu");
    }
  };

  const deleteGlobalTemplate = async (id) => {
    if (!window.confirm("Czy na pewno usunąć ten szablon globalny?")) return;
    try {
      await visitTemplatesHelper.deleteGlobalTemplate(id);
      toast.success("Szablon usunięty");
      loadGlobalTemplates();
    } catch (e) {
      toast.error(e?.message || "Nie udało się usunąć szablonu");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <FileStack size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Szablony dokumentów</h1>
            <p className="text-sm text-gray-500">
              Szablony sekcji (jedna sekcja) i szablony globalne (cała wizyta) do karty wizyty.
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("section")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "section"
                ? "bg-white border border-b-0 border-gray-200 text-teal-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Szablony sekcji
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("global")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "global"
                ? "bg-white border border-b-0 border-gray-200 text-teal-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Szablony globalne
          </button>
        </div>

        {activeTab === "section" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Wszystkie sekcje</option>
                {sectionKeys.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={openNewSectionForm}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                <Plus size={18} />
                Dodaj szablon sekcji
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 py-8 text-center">Ładowanie…</p>
            ) : sectionTemplates.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Brak szablonów sekcji.</p>
            ) : (
              <ul className="space-y-3">
                {sectionTemplates.map((t) => (
                  <li
                    key={t._id}
                    className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getSectionLabel(t.sectionKey)}
                      </p>
                      {t.content && (
                        <p className="text-sm text-gray-600 mt-1 truncate max-w-xl">
                          {t.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditSectionForm(t)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edytuj"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSectionTemplate(t._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Usuń"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "global" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={openNewGlobalForm}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                <Plus size={18} />
                Dodaj szablon globalny
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 py-8 text-center">Ładowanie…</p>
            ) : globalTemplates.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Brak szablonów globalnych.</p>
            ) : (
              <ul className="space-y-3">
                {globalTemplates.map((t) => (
                  <li
                    key={t._id}
                    className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditGlobalForm(t)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Pencil size={14} /> Edytuj
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGlobalTemplate(t._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Usuń
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Modal: Section template form */}
      {showSectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingSectionId ? "Edytuj szablon sekcji" : "Nowy szablon sekcji"}
              </h3>
              <button type="button" onClick={() => setShowSectionForm(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sekcja</label>
                <select
                  value={formSectionKey}
                  onChange={(e) => setFormSectionKey(e.target.value)}
                  disabled={!!editingSectionId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {sectionKeys.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa szablonu (po polsku)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="np. Wywiad chirurgiczny"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treść</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Tekst szablonu..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowSectionForm(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                Anuluj
              </button>
              <button type="button" onClick={saveSectionTemplate} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Global template form */}
      {showGlobalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingGlobalId ? "Edytuj szablon globalny" : "Nowy szablon globalny"}
              </h3>
              <button type="button" onClick={() => setShowGlobalForm(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa szablonu (po polsku)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="np. Konsultacja chirurgiczna"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              {SECTION_KEYS.map((s) => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                  <textarea
                    value={formSections[s.key] ?? ""}
                    onChange={(e) =>
                      setFormSections((prev) => ({ ...prev, [s.key]: e.target.value }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={`Treść dla ${s.label}...`}
                  />
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowGlobalForm(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                Anuluj
              </button>
              <button type="button" onClick={saveGlobalTemplate} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
