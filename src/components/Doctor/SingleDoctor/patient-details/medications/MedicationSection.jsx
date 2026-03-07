import React, { useState } from "react";
import { Search, Trash2, Plus, Zap } from "lucide-react";
import { MedicationForm } from "./MedicationForm";

const SECTION_BG = "bg-white";
const INPUT_CLASS = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400";

export const MedicationsSection = ({
  medications = [],
  setMedications,
  showForm,
  setShowForm,
  onAddMedication,
  onRemoveMedication,
  className = "",
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingMedication, setEditingMedication] = useState(null);

  const filtered = medications.filter(
    (m) =>
      !search ||
      (m.name && m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (data) => {
    if (editingIndex >= 0) {
      const next = [...medications];
      next[editingIndex] = { ...next[editingIndex], ...data };
      setMedications(next);
    } else {
      setMedications([...medications, data]);
    }
    setShowForm(false);
    setEditingIndex(-1);
    setEditingMedication(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(-1);
    setEditingMedication(null);
  };

  const handleAddClick = () => {
    setEditingMedication(null);
    setEditingIndex(-1);
    setShowForm(true);
  };

  const handleEdit = (med, index) => {
    setEditingMedication(med);
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
        <h2 className="text-base font-semibold text-gray-800">Leki</h2>
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
              placeholder="Szukaj: Nazwa, substancja, EAN lub BLOZ..."
              className={`${INPUT_CLASS} pl-10`}
            />
          </div>

          {showForm && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <MedicationForm
                medication={editingMedication}
                isEditing={!!editingMedication}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          )}

          {filtered.map((med) => {
            const fullIndex = medications.indexOf(med);
            return (
            <div
              key={fullIndex}
              className="bg-white border border-gray-200 rounded p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{med.name || "—"}</span>
                <button
                  type="button"
                  onClick={() => onRemoveMedication?.(fullIndex)}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ilość</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={med.quantity ?? 1}
                      onChange={(e) => {
                      const next = [...medications];
                      next[fullIndex] = { ...next[fullIndex], quantity: e.target.value ? Number(e.target.value) : 1 };
                      setMedications(next);
                      }}
                      className={`${INPUT_CLASS} w-16`}
                    />
                    <select
                      value={med.quantityUnit ?? "op"}
                      onChange={(e) => {
                      const next = [...medications];
                      next[fullIndex] = { ...next[fullIndex], quantityUnit: e.target.value };
                      setMedications(next);
                      }}
                      className={`${INPUT_CLASS} w-20`}
                    >
                      <option value="op">op</option>
                      <option value="szt">szt</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Odpłatność</label>
                  <select
                    value={med.payment ?? "100%"}
                    onChange={(e) => {
                      const next = [...medications];
                      next[fullIndex] = { ...next[fullIndex], payment: e.target.value };
                      setMedications(next);
                    }}
                    className={INPUT_CLASS}
                  >
                    <option value="100%">100%</option>
                    <option value="50%">50%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dawkowanie</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={med.dosage ?? ""}
                    onChange={(e) => {
                      const next = [...medications];
                      next[fullIndex] = { ...next[fullIndex], dosage: e.target.value };
                      setMedications(next);
                    }}
                    placeholder="Np. 1 tabl. rano po jedzeniu"
                    className={`${INPUT_CLASS} flex-1`}
                  />
                  <button type="button" className="px-3 py-2 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">1x1</button>
                  <button type="button" className="px-3 py-2 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50">2x1</button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(med, fullIndex)}
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
              Dodaj kolejny lek
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-700"
            >
              <Zap size={18} />
              Wystaw e-receptę
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
