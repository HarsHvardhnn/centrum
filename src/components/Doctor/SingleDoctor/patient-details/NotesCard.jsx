import React from "react";

const NotesCard = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-800">Notatki</h3>
        <span className="text-xs text-gray-500">Wewnętrzne / z rejestracji online</span>
      </div>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Notatki wewnętrzne lub informacje z rejestracji online..."
        rows={4}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-y min-h-[80px]"
      />
    </div>
  );
};

export default NotesCard;
