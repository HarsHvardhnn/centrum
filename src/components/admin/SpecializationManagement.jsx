import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { useSpecializations } from "../../context/SpecializationContext";

/**
 * Add / edit / delete doctor specializations (shared by modal and Ustawienia tab).
 */
const SpecializationManagement = ({ className = "" }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    specializations,
    loading,
    error,
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
  } = useSpecializations();

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !description) {
        toast.error("Proszę wypełnić wszystkie pola");
        return;
      }

      const specializationData = { name, description };
      let result;

      if (editId) {
        result = await updateSpecialization(editId, specializationData);
        if (result.success) {
          toast.success("Specjalizacja została zaktualizowana pomyślnie");
          resetForm();
        } else {
          toast.error("Wystąpił błąd");
        }
      } else {
        result = await addSpecialization(specializationData);
        if (result.success) {
          toast.success("Specjalizacja została dodana pomyślnie");
          resetForm();
        } else {
          toast.error("Wystąpił błąd");
        }
      }
    } catch (err) {
      toast.error("Wystąpił błąd");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (specialization) => {
    setName(specialization.name);
    setDescription(specialization.description);
    setEditId(specialization._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę specjalizację?")) {
      const result = await deleteSpecialization(id);
      if (result.success) {
        toast.success("Specjalizacja została usunięta pomyślnie");
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          {editId ? "Edytuj specjalizację" : "Dodaj nową specjalizację"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="spec-name" className="block text-gray-700 mb-1 text-sm font-medium">
              Nazwa
            </label>
            <input
              type="text"
              id="spec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Wprowadź nazwę specjalizacji"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="spec-description" className="block text-gray-700 mb-1 text-sm font-medium">
              Opis
            </label>
            <textarea
              id="spec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Wprowadź opis"
              rows={4}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isLoading ? (
                "Przetwarzanie..."
              ) : editId ? (
                <>
                  <FaEdit /> Aktualizuj
                </>
              ) : (
                <>
                  <FaPlus /> Dodaj
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Anuluj
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Wszystkie specjalizacje</h3>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Ładowanie...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-600">{error}</p>
        ) : specializations.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Nie znaleziono specjalizacji</p>
        ) : (
          <div className="max-h-[min(480px,60vh)] overflow-y-auto pr-1 space-y-3">
            {specializations.map((spec) => (
              <div
                key={spec._id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50/80"
              >
                <div className="flex justify-between gap-2">
                  <h4 className="font-semibold text-gray-900">{spec.name}</h4>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(spec)}
                      className="text-teal-600 hover:text-teal-800 p-1"
                      title="Edytuj"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(spec._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Usuń"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{spec.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecializationManagement;
