// components/SpecializationModal.jsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { useSpecializations } from "../../context/SpecializationContext";

const SpecializationModal = ({ isOpen, onClose }) => {
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

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

      const specializationData = {
        name,
        description,
      };

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
    if (
      window.confirm("Czy na pewno chcesz usunąć tę specjalizację?")
    ) {
      const result = await deleteSpecialization(id);
      if (result.success) {
        toast.success("Specjalizacja została usunięta pomyślnie");
      } else {
        toast.error(result.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-main">
            Zarządzaj Specjalizacjami
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edytuj Specjalizację" : "Dodaj Nową Specjalizację"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Nazwa
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="Wprowadź nazwę specjalizacji"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-gray-700 mb-1"
                >
                  Opis
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="Wprowadź opis"
                  rows="4"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-main text-white px-4 py-2 rounded-md hover:bg-main/90 flex items-center gap-1"
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Anuluj
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Wszystkie Specjalizacje</h3>
            {loading ? (
              <p className="text-center py-4">Ładowanie...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : specializations.length === 0 ? (
              <p className="text-center py-4">Nie znaleziono specjalizacji</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {specializations.map((spec) => (
                  <div
                    key={spec._id}
                    className="mb-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{spec.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(spec)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edytuj"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(spec._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Usuń"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {spec.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializationModal;
