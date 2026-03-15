import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

const LifeParamsCard = ({ patient, onShowAdditional, onLifeParamsChange }) => {
  const [showMore, setShowMore] = useState(false);

  const weight = patient?.weight ?? "";
  const height = patient?.height ?? "";
  const temp = patient?.temperature ?? "";
  const bloodPressureSystolic = patient?.bloodPressureSystolic ?? "";
  const bloodPressureDiastolic = patient?.bloodPressureDiastolic ?? "";
  const pulse = patient?.pulse ?? "";
  const oxygenSaturation = patient?.oxygenSaturation ?? "";

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

  const emptyOr = (v) => (v === null || v === undefined ? "" : v);

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
            value={emptyOr(weight)}
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
            value={emptyOr(height)}
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
            value={emptyOr(temp)}
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
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-teal-200 bg-white text-teal-700 hover:bg-teal-50 text-sm font-medium"
      >
        <ChevronDown size={16} className={showMore ? "rotate-180" : ""} />
        {showMore ? "Ukryj parametry dodatkowe" : "Pokaż parametry dodatkowe"}
      </button>

      {showMore && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ciśnienie skurczowe</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="mmHg"
                value={emptyOr(bloodPressureSystolic)}
                onChange={handleChange("bloodPressureSystolic")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ciśnienie rozkurczowe</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="mmHg"
                value={emptyOr(bloodPressureDiastolic)}
                onChange={handleChange("bloodPressureDiastolic")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tętno (bpm)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="—"
                value={emptyOr(pulse)}
                onChange={handleChange("pulse")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Saturacja (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="—"
                value={emptyOr(oxygenSaturation)}
                onChange={handleChange("oxygenSaturation")}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeParamsCard;
