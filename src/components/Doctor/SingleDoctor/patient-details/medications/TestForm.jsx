import React, { useState, useEffect } from "react";

export const TestForm = ({ test = {}, isEditing = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    results: "",
    status: "Pending",
  });

  useEffect(() => {
    if (isEditing && test) {
      // Format date for the input field
      const testDate = test.date
        ? new Date(test.date).toISOString().split("T")[0]
        : "";

      setFormData({
        name: test.name || "",
        date: testDate,
        results:
          typeof test.results === "object"
            ? JSON.stringify(test.results)
            : test.results || "",
        status: test.status || "Pending",
      });
    }
  }, [isEditing, test]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format the results field based on content
    let formattedData = { ...formData };

    // Try to parse results as JSON if it looks like an object or array
    if (
      formData.results.trim().startsWith("{") ||
      formData.results.trim().startsWith("[")
    ) {
      try {
        formattedData.results = JSON.parse(formData.results);
      } catch (e) {
        // If parsing fails, keep it as string
        console.log("Results parsing failed, keeping as string");
      }
    }

    onSave(formattedData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? "Edit Test" : "Add New Test"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name*
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
              Test Date*
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Results
            </label>
            <textarea
              name="results"
              value={formData.results}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter test results or paste JSON data"
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
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Abnormal">Abnormal</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#80c5c5] hover:bg-teal-500 text-white rounded-md text-sm"
          >
            {isEditing ? "Update Test" : "Add Test"}
          </button>
        </div>
      </form>
    </div>
  );
};
