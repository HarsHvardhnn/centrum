import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import visitTemplatesHelper from "../../../../helpers/visitTemplatesHelper";

const GlobalTemplatePickerModal = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    visitTemplatesHelper
      .listGlobalTemplates()
      .then(setTemplates)
      .catch((e) => setError(e?.message || "Nie udało się pobrać szablonów"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (template) => {
    onSelect?.(template.sections ?? {});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Załaduj szablon globalny
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <p className="text-sm text-gray-500 text-center py-4">Loading…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 py-2">{error}</p>
          )}
          {!loading && !error && templates.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Brak szablonów globalnych. Utwórz je w Ustawienia → Szablony dokumentów.
            </p>
          )}
          {!loading && templates.length > 0 && (
            <ul className="space-y-1">
              {templates.map((t) => (
                <li key={t._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(t)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-500 text-sm text-gray-800"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalTemplatePickerModal;
