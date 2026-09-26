import React, { useState, useEffect, useRef } from "react";
import { Search, Trash2, Plus, Zap } from "lucide-react";
import { TestForm } from "./TestForm";
import FeatureComingSoonModal from "../FeatureComingSoonModal";
import appointmentHelper from "../../../../../helpers/appointmentHelper";

const SECTION_BG = "bg-white";
const INPUT_CLASS = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400";
const DEBOUNCE_MS = 300;

export const TestsSection = ({
  tests = [],
  setTests,
  showForm,
  setShowForm,
  onAddTest,
  onRemoveTest,
  className = "",
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingTest, setEditingTest] = useState(null);
  const [showESkierowanieModal, setShowESkierowanieModal] = useState(false);
  const searchRef = useRef(null);

  // ICD-10 remote search for "Rozpoznanie (ICD-10)" field
  const [icd10Search, setIcd10Search] = useState("");
  const [icd10Results, setIcd10Results] = useState([]);
  const [icd10Loading, setIcd10Loading] = useState(false);
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false);
  const [icd10ActiveIndex, setIcd10ActiveIndex] = useState(null); // index in `tests`

  const filtered = tests.filter(
    (t) => !search || (t.name && t.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ICD-9 remote search (like ProceduresCard)
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const results = await appointmentHelper.searchIcd9(search);
        if (!cancelled) {
          setSearchResults(Array.isArray(results) ? results : []);
        }
      } catch (e) {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  // ICD-10 remote search (for Rozpoznanie field)
  useEffect(() => {
    if (icd10ActiveIndex == null) {
      setIcd10Results([]);
      setShowIcd10Dropdown(false);
      return;
    }

    if (!icd10Search.trim()) {
      setIcd10Results([]);
      setShowIcd10Dropdown(false);
      return;
    }

    let cancelled = false;
    setIcd10Loading(true);
    setShowIcd10Dropdown(true);

    const timer = setTimeout(async () => {
      try {
        const results = await appointmentHelper.searchIcd10(icd10Search);
        if (!cancelled) setIcd10Results(Array.isArray(results) ? results : []);
      } catch (e) {
        if (!cancelled) setIcd10Results([]);
      } finally {
        if (!cancelled) setIcd10Loading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [icd10Search, icd10ActiveIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectIcd9 = (item) => {
    const code = item?.code ?? "";
    const name = item?.name ?? item?.title ?? "";
    const newTest = {
      name: name || "",
      icd9Code: code,
      status: "Oczekujący",
      mode: "Planowe",
    };
    setTests((prev) => [...prev, newTest]);
    setSearch("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSelectIcd10 = (item) => {
    if (icd10ActiveIndex == null) return;
    const code = item?.code ?? "";
    const name = item?.name ?? item?.title ?? "";

    const next = [...tests];
    next[icd10ActiveIndex] = {
      ...next[icd10ActiveIndex],
      diagnosis: name || "",
      icd10Code: code || next[icd10ActiveIndex]?.icd10Code || "",
    };
    setTests(next);

    setIcd10Search(name || "");
    setIcd10Results([]);
    setShowIcd10Dropdown(false);
  };

  const handleSave = (data) => {
    if (editingIndex >= 0) {
      const next = [...tests];
      next[editingIndex] = { ...next[editingIndex], ...data };
      setTests(next);
    } else {
      setTests([...tests, data]);
    }
    setShowForm(false);
    setEditingIndex(-1);
    setEditingTest(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(-1);
    setEditingTest(null);
  };

  const handleAddClick = () => {
    setEditingTest(null);
    setEditingIndex(-1);
    setShowForm(true);
  };

  const handleEdit = (test, index) => {
    setEditingTest(test);
    setEditingIndex(index);
    setShowForm(true);
  };

  return (
    <div className={`${SECTION_BG} rounded border border-gray-200 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-base font-semibold text-gray-800">Badania i skierowania</h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <div className="relative" ref={searchRef}>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj badania wg ICD-9..."
              className={`${INPUT_CLASS} pl-10`}
            />
            {showDropdown && (search.trim() || searchResults.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-3 text-sm text-gray-500">Szukam...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">Brak wyników</div>
                ) : (
                  searchResults.map((item, i) => (
                    <button
                      key={(item?.code ?? "") + "-" + i}
                      type="button"
                      onClick={() => handleSelectIcd9(item)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-teal-800">{item?.code ?? ""}</span>
                      <span className="text-gray-700 ml-2">{item?.name ?? item?.title ?? ""}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {showForm && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <TestForm
                test={editingTest}
                isEditing={!!editingTest}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          )}

          {filtered.map((test) => {
            const fullIndex = tests.indexOf(test);
            return (
            <div
              key={fullIndex}
              className="bg-white border border-gray-200 rounded p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{test.name || "—"}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTest?.(fullIndex)}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div>
                {test.icd9Code && (
                  <div className="text-xs text-gray-600 mb-1">
                    Kod ICD-9: <span className="font-medium">{test.icd9Code}</span>
                  </div>
                )}
                <label className="block text-xs text-gray-500 mb-1">Rozpoznanie (ICD-10)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={icd10ActiveIndex === fullIndex ? icd10Search : (test.diagnosis ?? "")}
                    onFocus={() => {
                      setIcd10ActiveIndex(fullIndex);
                      setIcd10Search(test.diagnosis ?? "");
                      setShowIcd10Dropdown(false);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIcd10Search(val);

                      // Keep diagnosis editable; code will be set only after selecting from dropdown.
                      const next = [...tests];
                      next[fullIndex] = { ...next[fullIndex], diagnosis: val };
                      setTests(next);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowIcd10Dropdown(false), 150);
                    }}
                    className={INPUT_CLASS}
                  />

                  {icd10ActiveIndex === fullIndex && showIcd10Dropdown && (icd10Search.trim() || icd10Results.length > 0) && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[120] max-h-60 overflow-y-auto">
                      {icd10Loading ? (
                        <div className="p-3 text-sm text-gray-500">Szukam...</div>
                      ) : icd10Results.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">Brak wyników</div>
                      ) : (
                        icd10Results.map((item, i) => (
                          <button
                            key={(item?.code ?? "") + "-" + i}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectIcd10(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-teal-800">{item?.code ?? ""}</span>
                            <span className="text-gray-700 ml-2">{item?.name ?? item?.title ?? ""}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kod ICD-10...</label>
                <input
                  type="text"
                  value={test.icd10Code ?? ""}
                  onChange={(e) => {
                    const next = [...tests];
                    next[fullIndex] = { ...next[fullIndex], icd10Code: e.target.value };
                    setTests(next);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tryb wykonania</label>
                <select
                  value={test.mode ?? "Planowe"}
                  onChange={(e) => {
                    const next = [...tests];
                    next[fullIndex] = { ...next[fullIndex], mode: e.target.value };
                    setTests(next);
                  }}
                  className={INPUT_CLASS}
                >
                  <option value="Planowe">Planowe</option>
                  <option value="Pilne">Pilne</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Uzasadnienie</label>
                <textarea
                  value={test.justification ?? ""}
                  onChange={(e) => {
                    const next = [...tests];
                    next[fullIndex] = { ...next[fullIndex], justification: e.target.value };
                    setTests(next);
                  }}
                  placeholder="Uzasadnienie skierowania..."
                  rows={2}
                  className={INPUT_CLASS}
                />
              </div>
              <button
                type="button"
                onClick={() => handleEdit(test, fullIndex)}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Edytuj
              </button>
            </div>
          );})}

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleAddClick}
              className="flex items-center gap-1 text-teal-700 hover:text-teal-800 text-sm font-medium"
            >
              <Plus size={18} />
              Dodaj badanie
            </button>
            <button
              type="button"
              onClick={() => setShowESkierowanieModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-700"
            >
              <Zap size={18} />
              Wystaw e-skierowanie
            </button>
          </div>
        </div>
      )}
      <FeatureComingSoonModal
        isOpen={showESkierowanieModal}
        onClose={() => setShowESkierowanieModal(false)}
        featureName="E-skierowanie"
      />
    </div>
  );
};
