import React, { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const DiagnosisCard = ({ diagnoses = [], onAddDiagnosis, onRemoveDiagnosis }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Rozpoznanie</h3>
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Wyszukaj wg kodu ICD-10 lub nazwy choroby..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
        />
      </div>
      {diagnoses.length > 0 && (
        <div className="space-y-2 mb-4">
          {diagnoses.map((d, i) => (
            <div
              key={d.id || i}
              className="flex items-center flex-wrap gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-100"
            >
              <select
                className="text-xs font-medium text-teal-800 bg-transparent border-0 cursor-pointer"
                defaultValue="main"
              >
                <option value="main">Główne</option>
                <option value="secondary">Dodatkowe</option>
              </select>
              <ChevronDown size={14} className="text-teal-600" />
              <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">
                {d.code} {d.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveDiagnosis?.(d.id ?? i)}
                className="p-1 rounded hover:bg-teal-200/50 text-gray-500 hover:text-gray-700"
                aria-label="Usuń"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => onAddDiagnosis?.()}
        className="text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        + Dodaj rozpoznanie
      </button>
    </div>
  );
};

export default DiagnosisCard;
