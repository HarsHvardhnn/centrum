import React, { useState, useEffect } from "react";

export const MedicationForm = ({
  medication = {},
  isEditing = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    status: "Aktywny",
  });

  useEffect(() => {
    if (isEditing && medication) {
      // Format dates for the input fields
      const startDate = medication.startDate
        ? new Date(medication.startDate).toISOString().split("T")[0]
        : "";
      const endDate = medication.endDate
        ? new Date(medication.endDate).toISOString().split("T")[0]
        : "";

      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        frequency: medication.frequency || "",
        startDate: startDate,
        endDate: endDate,
        status: medication.status || "Aktywny",
      });
    }
  }, [isEditing, medication]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? "Edytuj lek" : "Dodaj nowy lek"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa leku*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dawkowanie*
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="np. 10mg"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Częstotliwość*
            </label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="np. Dwa razy dziennie"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Aktywny">Aktywny</option>
              <option value="Zakończony">Zakończony</option>
              <option value="Przerwany">Przerwany</option>
              <option value="Wstrzymany">Wstrzymany</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data rozpoczęcia*
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data zakończenia
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#80c5c5] hover:bg-teal-500 text-white rounded-md text-sm"
          >
            {isEditing ? "Aktualizuj lek" : "Dodaj lek"}
          </button>
        </div>
      </form>
    </div>
  );
};
