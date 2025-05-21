import React from "react";

const HealthMetric = ({ title, value, onUpdate, unit }) => {
  const handleChange = (e) => {
    // Only allow numbers and decimal point
    const numericValue = e.target.value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    if (numericValue.split('.').length > 2) return;
    
    onUpdate(title, numericValue);
  };

  return (
    <div className="bg-teal-50 p-3 rounded-lg w-full">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <div className="mt-1 relative">
          <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            className="w-full text-sm p-2 pr-10 border border-teal-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            placeholder={`Enter ${title.toLowerCase()}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </span>
        </div>
      </label>
    </div>
  );
};

export default HealthMetric;
