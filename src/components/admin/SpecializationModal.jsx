// components/SpecializationModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import SpecializationManagement from "./SpecializationManagement";

const SpecializationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto shadow-xl">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-[1]">
          <h2 className="text-2xl font-bold text-gray-900">Manage specialties</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          <SpecializationManagement />
        </div>
      </div>
    </div>
  );
};

export default SpecializationModal;
