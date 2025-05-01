import React, { useState } from "react";
import { TestForm } from "./TestForm";

export const TestsSection = ({ tests = [], onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleAddClick = () => {
    setEditingTest(null);
    setEditingIndex(-1);
    setShowForm(true);
  };

  const handleEditClick = (test, index) => {
    setEditingTest(test);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteClick = (index) => {
    const updatedTests = [...tests];
    updatedTests.splice(index, 1);
    onUpdate(updatedTests);
  };

  const handleSave = (testData) => {
    let updatedTests;

    if (editingIndex >= 0) {
      updatedTests = [...tests];
      updatedTests[editingIndex] = testData;
    } else {
      updatedTests = [...tests, testData];
    }

    onUpdate(updatedTests);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Brak";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatResults = (results) => {
    if (!results) return "Brak";
    if (typeof results === "object") {
      return (
        JSON.stringify(results).substring(0, 30) +
        (JSON.stringify(results).length > 30 ? "..." : "")
      );
    }
    return results.substring(0, 30) + (results.length > 30 ? "..." : "");
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Badania</h2>
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
          Dodaj badanie
        </button>
      </div>

      {showForm && (
        <TestForm
          test={editingTest}
          isEditing={!!editingTest}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {tests.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Nie dodano jeszcze żadnych badań.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazwa badania
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wyniki
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tests.map((test, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {test.name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    {formatDate(test.date)}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {formatResults(test.results)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        test.status === "Normalny"
                          ? "bg-green-100 text-green-800"
                          : test.status === "Nieprawidłowy"
                          ? "bg-red-100 text-red-800"
                          : test.status === "Oczekujący"
                          ? "bg-yellow-100 text-yellow-800"
                          : test.status === "Zakończony"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => handleEditClick(test, index)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDeleteClick(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Usuń
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
