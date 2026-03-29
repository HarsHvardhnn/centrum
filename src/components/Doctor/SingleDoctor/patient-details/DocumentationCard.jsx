import React from "react";
import { FileText } from "lucide-react";

const DocumentationCard = ({
  title,
  value,
  onChange,
  placeholder,
  templateLabel = "Wybierz szablon…",
  onChooseTemplate,
}) => {
  return (
    <div className="bg-white rounded border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {onChooseTemplate && (
            <button
              type="button"
              onClick={onChooseTemplate}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border-2 border-blue-500 hover:border-blue-600 rounded-md px-3 py-1.5 transition-colors shadow-sm"
            >
              <FileText size={14} />
              {templateLabel}
            </button>
          )}
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
