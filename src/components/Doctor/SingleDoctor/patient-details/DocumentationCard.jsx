import React from "react";
import { Info } from "lucide-react";

const DocumentationCard = ({
  title,
  value,
  onChange,
  placeholder,
  templateLabel = "Wybierz szablon...",
  onTemplateSelect,
}) => {
  return (
    <div className="bg-white rounded border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <select
            className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            onChange={(e) => onTemplateSelect?.(e.target.value)}
          >
            <option>{templateLabel}</option>
          </select>
          <button
            type="button"
            className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            title="Informacja"
          >
            <Info size={14} />
          </button>
        </div>
      </div>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-y min-h-[100px]"
      />
    </div>
  );
};

export default DocumentationCard;
