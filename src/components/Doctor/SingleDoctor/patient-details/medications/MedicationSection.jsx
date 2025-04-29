import React, { useState } from "react";
import { MedicationForm } from "./MedicationForm";

export const MedicationsSection = ({ medications = [], onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleAddClick = () => {
    setEditingMedication(null);
    setEditingIndex(-1);
    setShowForm(true);
  };

  const handleEditClick = (medication, index) => {
    setEditingMedication(medication);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteClick = (index) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    onUpdate(updatedMedications);
  };

  const handleSave = (medicationData) => {
    let updatedMedications;

    if (editingIndex >= 0) {
      // Update existing medication
      updatedMedications = [...medications];
      updatedMedications[editingIndex] = medicationData;
    } else {
      // Add new medication
      updatedMedications = [...medications, medicationData];
    }

    onUpdate(updatedMedications);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Medications</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center text-sm bg-[#80c5c5] hover:bg-teal-500 text-white px-3 py-1 rounded-md"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Medication
        </button>
      </div>

      {showForm && (
        <MedicationForm
          medication={editingMedication}
          isEditing={!!editingMedication}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {medications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No medications have been added yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosage
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.map((med, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {med.name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {med.dosage}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {med.frequency}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {formatDate(med.startDate)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {formatDate(med.endDate)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        med.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : med.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : med.status === "Discontinued"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {med.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => handleEditClick(med, index)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
