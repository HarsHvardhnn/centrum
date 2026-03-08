import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

const LifeParamsCard = ({ patient, onShowAdditional, onLifeParamsChange }) => {
  const [showMore, setShowMore] = useState(false);

  const weight = patient?.weight ?? "";
  const height = patient?.height ?? "";
  const temp = patient?.temperature ?? "";

  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (Number.isFinite(w) && Number.isFinite(h) && h > 0) return (w / (h * h)).toFixed(1);
    return "";
  }, [weight, height]);

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors";
  const readOnlyClass =
    "w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800";

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    onLifeParamsChange?.({ [field]: value === "" ? null : value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Parametry życiowe</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Waga (kg)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="—"
            value={weight === null || weight === undefined ? "" : weight}
            onChange={handleChange("weight")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Wzrost (cm)</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="—"
            value={height === null || height === undefined ? "" : height}
            onChange={handleChange("height")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">BMI</label>
          <div className={readOnlyClass}>{bmi || "—"}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Temperatura (°C)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="—"
            value={temp === null || temp === undefined ? "" : temp}
            onChange={handleChange("temperature")}
            className={inputClass}
          />
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
