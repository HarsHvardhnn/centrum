import React, { useState } from "react";
import { Search, Trash2, Plus, Zap } from "lucide-react";
import { TestForm } from "./TestForm";

const SECTION_BG = "bg-white";
const INPUT_CLASS = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400";

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
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingTest, setEditingTest] = useState(null);

  const filtered = tests.filter(
    (t) => !search || (t.name && t.name.toLowerCase().includes(search.toLowerCase()))
  );

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
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj badania wg ICD-9..."
              className={`${INPUT_CLASS} pl-10`}
            />
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
                <label className="block text-xs text-gray-500 mb-1">Rozpoznanie (ICD-10)</label>
                <input
                  type="text"
                  value={test.diagnosis ?? ""}
                  onChange={(e) => {
                    const next = [...tests];
                    next[fullIndex] = { ...next[fullIndex], diagnosis: e.target.value };
                    setTests(next);
                  }}
                  className={INPUT_CLASS}
                />
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
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-700"
            >
              <Zap size={18} />
              Wystaw e-skierowanie
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
