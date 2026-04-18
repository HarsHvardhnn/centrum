import React, { useEffect, useState, useRef } from "react";
import { FileStack, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import visitTemplatesHelper from "../../helpers/visitTemplatesHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { toast } from "sonner";

const DEBOUNCE_MS = 300;

const SECTION_KEYS = [
  { key: "interview", label: "Patient interview" },
  { key: "physicalExamination", label: "Physical examination" },
  { key: "treatment", label: "Treatment given" },
  { key: "recommendations", label: "Recommendations" },
  { key: "notes", label: "Notes" },
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
  const [formDiagnoses, setFormDiagnoses] = useState([]); // { code, name, isPrimary }[]
  const [formProcedures, setFormProcedures] = useState([]); // { code, name }[]
  // ICD-10 search (Rozpoznanie)
  const [icd10SearchValue, setIcd10SearchValue] = useState("");
  const [icd10SearchResults, setIcd10SearchResults] = useState([]);
  const [icd10SearchLoading, setIcd10SearchLoading] = useState(false);
  const [icd10ShowDropdown, setIcd10ShowDropdown] = useState(false);
  const icd10DropdownRef = useRef(null);
  // ICD-9 search (Procedury)
  const [icd9SearchValue, setIcd9SearchValue] = useState("");
  const [icd9SearchResults, setIcd9SearchResults] = useState([]);
  const [icd9SearchLoading, setIcd9SearchLoading] = useState(false);
  const [icd9ShowDropdown, setIcd9ShowDropdown] = useState(false);
  const icd9DropdownRef = useRef(null);

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
      .catch(() => toast.error("Failed to load section templates"))
      .finally(() => setLoading(false));
  };

  const loadGlobalTemplates = () => {
    setLoading(true);
    visitTemplatesHelper
      .listGlobalTemplates()
      .then(setGlobalTemplates)
      .catch(() => toast.error("Failed to load global templates"))
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
      toast.error("Template name is required");
      return;
    }
    try {
      if (editingSectionId) {
        await visitTemplatesHelper.updateSectionTemplate(editingSectionId, {
          name: formName.trim(),
          content: formContent,
        });
        toast.success("Template updated");
      } else {
        await visitTemplatesHelper.createSectionTemplate({
          sectionKey: formSectionKey,
          name: formName.trim(),
          content: formContent,
        });
        toast.success("Template created");
      }
      setShowSectionForm(false);
      loadSectionTemplates();
    } catch (e) {
      toast.error(e?.message || "Failed to save template");
    }
  };

  const deleteSectionTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await visitTemplatesHelper.deleteSectionTemplate(id);
      toast.success("Template deleted");
      loadSectionTemplates();
    } catch (e) {
      toast.error(e?.message || "Failed to delete template");
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
    setFormDiagnoses([]);
    setFormProcedures([]);
    setIcd10SearchValue("");
    setIcd10SearchResults([]);
    setIcd10ShowDropdown(false);
    setIcd9SearchValue("");
    setIcd9SearchResults([]);
    setIcd9ShowDropdown(false);
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
    setFormDiagnoses(Array.isArray(t.diagnoses) ? t.diagnoses.map((d) => ({ code: d.code ?? "", name: d.name ?? "", isPrimary: !!d.isPrimary })) : []);
    setFormProcedures(Array.isArray(t.procedures) ? t.procedures.map((p) => ({ code: p.code ?? "", name: p.name ?? "" })) : []);
    setIcd10SearchValue("");
    setIcd10SearchResults([]);
    setIcd10ShowDropdown(false);
    setIcd9SearchValue("");
    setIcd9SearchResults([]);
    setIcd9ShowDropdown(false);
    setShowGlobalForm(true);
  };

  const removeDiagnosis = (index) => setFormDiagnoses((prev) => prev.filter((_, i) => i !== index));
  const updateDiagnosis = (index, field, value) =>
    setFormDiagnoses((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));

  const removeProcedure = (index) => setFormProcedures((prev) => prev.filter((_, i) => i !== index));

  // Debounced ICD-10 search
  useEffect(() => {
    if (!showGlobalForm || !icd10SearchValue.trim()) {
      setIcd10SearchResults([]);
      setIcd10ShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIcd10SearchLoading(true);
      setIcd10ShowDropdown(true);
      try {
        const results = await appointmentHelper.searchIcd10(icd10SearchValue);
        setIcd10SearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        setIcd10SearchResults([]);
      } finally {
        setIcd10SearchLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [showGlobalForm, icd10SearchValue]);

  // Debounced ICD-9 search
  useEffect(() => {
    if (!showGlobalForm || !icd9SearchValue.trim()) {
      setIcd9SearchResults([]);
      setIcd9ShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIcd9SearchLoading(true);
      setIcd9ShowDropdown(true);
      try {
        const results = await appointmentHelper.searchIcd9(icd9SearchValue);
        setIcd9SearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        setIcd9SearchResults([]);
      } finally {
        setIcd9SearchLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [showGlobalForm, icd9SearchValue]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (icd10DropdownRef.current && !icd10DropdownRef.current.contains(e.target)) setIcd10ShowDropdown(false);
      if (icd9DropdownRef.current && !icd9DropdownRef.current.contains(e.target)) setIcd9ShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addDiagnosisFromSearch = (item) => {
    setFormDiagnoses((prev) => [...prev, { code: item.code, name: item.name || item.title || "", isPrimary: prev.length === 0 }]);
    setIcd10SearchValue("");
    setIcd10SearchResults([]);
    setIcd10ShowDropdown(false);
  };

  const addProcedureFromSearch = (item) => {
    setFormProcedures((prev) => [...prev, { code: item.code, name: item.name || item.title || "" }]);
    setIcd9SearchValue("");
    setIcd9SearchResults([]);
    setIcd9ShowDropdown(false);
  };

  const saveGlobalTemplate = async () => {
    if (!formName.trim()) {
      toast.error("Template name is required");
      return;
    }
    const diagnoses = formDiagnoses
      .map((d) => ({ code: (d.code ?? "").trim(), name: (d.name ?? "").trim(), isPrimary: !!d.isPrimary }))
      .filter((d) => d.code || d.name);
    const procedures = formProcedures
      .map((p) => ({ code: (p.code ?? "").trim(), name: (p.name ?? "").trim() }))
      .filter((p) => p.code || p.name);
    try {
      if (editingGlobalId) {
        await visitTemplatesHelper.updateGlobalTemplate(editingGlobalId, {
          name: formName.trim(),
          sections: formSections,
          diagnoses,
          procedures,
        });
        toast.success("Global template updated");
      } else {
        await visitTemplatesHelper.createGlobalTemplate({
          name: formName.trim(),
          sections: formSections,
          diagnoses,
          procedures,
        });
        toast.success("Global template created");
      }
      setShowGlobalForm(false);
      loadGlobalTemplates();
    } catch (e) {
      toast.error(e?.message || "Failed to save template");
    }
  };

  const deleteGlobalTemplate = async (id) => {
    if (!window.confirm("Delete this global template?")) return;
    try {
      await visitTemplatesHelper.deleteGlobalTemplate(id);
      toast.success("Template deleted");
      loadGlobalTemplates();
    } catch (e) {
      toast.error(e?.message || "Failed to delete template");
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
            <h1 className="text-xl font-bold text-gray-900">Document templates</h1>
            <p className="text-sm text-gray-500">
              Section templates (single section) and global templates (full visit) for the visit note.
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
            Section templates
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
            Global templates
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
                <option value="">All sections</option>
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
                Add section template
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 py-8 text-center">Loading…</p>
            ) : sectionTemplates.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No section templates.</p>
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
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSectionTemplate(t._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
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
                Add global template
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 py-8 text-center">Loading…</p>
            ) : globalTemplates.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No global templates.</p>
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
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGlobalTemplate(t._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
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
                {editingSectionId ? "Edit section template" : "New section template"}
              </h3>
              <button type="button" onClick={() => setShowSectionForm(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Template name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Surgical history"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Template text..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowSectionForm(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={saveSectionTemplate} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Save
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
                {editingGlobalId ? "Edit global template" : "New global template"}
              </h3>
              <button type="button" onClick={() => setShowGlobalForm(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Surgical consultation"
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
                    placeholder={`Content for ${s.label}...`}
                  />
                </div>
              ))}

              {/* Rozpoznanie (ICD-10) – search API, select from dropdown */}
              <div className="border-t border-gray-200 pt-4" ref={icd10DropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis (ICD-10)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={icd10SearchValue}
                    onChange={(e) => setIcd10SearchValue(e.target.value)}
                    onFocus={() => icd10SearchResults.length > 0 && setIcd10ShowDropdown(true)}
                    placeholder="Search by ICD-10 code or disease name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                  {icd10ShowDropdown && (icd10SearchValue.trim() || icd10SearchResults.length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {icd10SearchLoading ? (
                        <div className="p-3 text-sm text-gray-500">Searching...</div>
                      ) : icd10SearchResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No results</div>
                      ) : (
                        icd10SearchResults.map((item, i) => (
                          <button
                            key={(item.code || "") + i}
                            type="button"
                            onClick={() => addDiagnosisFromSearch(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-teal-800">{item.code}</span>
                            <span className="text-gray-700 ml-2">{item.name || item.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formDiagnoses.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {formDiagnoses.map((d, index) => (
                      <li key={index} className="flex flex-wrap items-center gap-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
                        <span className="text-xs font-medium text-teal-800 px-2 py-0.5 rounded bg-teal-100">
                          {d.isPrimary ? "Primary" : "Secondary"}
                        </span>
                        <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{d.code} {d.name}</span>
                        <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!d.isPrimary}
                            onChange={(e) => updateDiagnosis(index, "isPrimary", e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          primary
                        </label>
                        <button type="button" onClick={() => removeDiagnosis(index)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-1">Type a code or name and pick from the list to add a diagnosis.</p>
              </div>

              {/* Procedury (ICD-9) – search API, select from dropdown */}
              <div className="border-t border-gray-200 pt-4" ref={icd9DropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Procedures (ICD-9)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={icd9SearchValue}
                    onChange={(e) => setIcd9SearchValue(e.target.value)}
                    onFocus={() => icd9SearchResults.length > 0 && setIcd9ShowDropdown(true)}
                    placeholder="Search by ICD-9 code or procedure name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                  {icd9ShowDropdown && (icd9SearchValue.trim() || icd9SearchResults.length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {icd9SearchLoading ? (
                        <div className="p-3 text-sm text-gray-500">Searching...</div>
                      ) : icd9SearchResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No results</div>
                      ) : (
                        icd9SearchResults.map((item, i) => (
                          <button
                            key={(item.code || "") + i}
                            type="button"
                            onClick={() => addProcedureFromSearch(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-teal-800">{item.code}</span>
                            <span className="text-gray-700 ml-2">{item.name || item.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formProcedures.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {formProcedures.map((p, index) => (
                      <li key={index} className="flex flex-wrap items-center gap-2 p-2 bg-teal-50 rounded-lg border border-teal-100">
                        <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{p.code} {p.name}</span>
                        <button type="button" onClick={() => removeProcedure(index)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-1">Type a code or name and pick from the list to add a procedure.</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowGlobalForm(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={saveGlobalTemplate} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
