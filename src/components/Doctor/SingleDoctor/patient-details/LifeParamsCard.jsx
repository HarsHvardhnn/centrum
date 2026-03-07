import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const LifeParamsCard = ({ patient, onShowAdditional }) => {
  const [showMore, setShowMore] = useState(false);

  const weight = patient?.weight ?? "";
  const height = patient?.height ?? "";
  const temp = patient?.temperature ?? "";
  const bmi =
    weight && height
      ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
      : "";

  const fieldClass =
    "w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Parametry życiowe</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Waga (kg)</label>
          <div className={fieldClass}>{weight || "—"}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Wzrost (cm)</label>
          <div className={fieldClass}>{height || "—"}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">BMI</label>
          <div className={fieldClass}>{bmi || "—"}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Temperatura (°C)</label>
          <div className={fieldClass}>{temp || "—"}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setShowMore(!showMore);
          onShowAdditional?.();
        }}
        className="mt-3 flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium"
      >
        Pokaż parametry dodatkowe
        <ChevronDown size={16} className={showMore ? "rotate-180" : ""} />
      </button>
    </div>
  );
};

export default LifeParamsCard;
