import React, { useState } from "react";

const HealthMetric = ({ title, value, percentage, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(title.toLowerCase(), editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-teal-50 p-3 rounded-lg">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{title}</p>
        {!isEditing && (
          <svg
            onClick={handleEdit}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer text-gray-500"
          >
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        )}
      </div>
      <p className="text-xs text-gray-500">{percentage}%</p>
      <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-1">
        <div
          className="absolute h-1.5 bg-[#99d1d1] rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {isEditing ? (
        <div className="mt-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full text-xs p-1 border border-teal-300 rounded"
            autoFocus
          />
          <div className="flex justify-end mt-1 space-x-1">
            <button
              onClick={handleSave}
              className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-xs bg-gray-300 px-2 py-0.5 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs mt-1">{value}</p>
      )}
    </div>
  );
};

export default HealthMetric;
