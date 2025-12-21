import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { usePermanentDelete } from "../../hooks/usePermanentDelete";
import { toast } from "sonner";

const PermanentDeleteDialog = ({ 
  open, 
  onClose, 
  type, 
  id, 
  onSuccess,
  title,
  message,
  confirmText = "DELETE"
}) => {
  const { deleteRecord, loading, error } = usePermanentDelete();
  const [inputText, setInputText] = useState('');

  const handleDelete = async () => {
    if (inputText !== confirmText) {
      toast.error(`Proszę wpisać "${confirmText}" aby potwierdzić`);
      return;
    }

    try {
      const endpointMap = {
        patient: 'patients',
        appointment: 'appointments',
        contact: 'contacts',
        user: 'users',
        invoice: 'invoices'
      };

      const endpoint = endpointMap[type];
      if (!endpoint) {
        throw new Error('Invalid delete type');
      }

      const result = await deleteRecord(endpoint, id);
      
      toast.success(result.message || 'Rekord został trwale usunięty');
      onSuccess?.();
      onClose();
      setInputText('');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Nie udało się usunąć rekordu');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <div className="flex items-start mb-4">
          <div className="rounded-full p-3 mr-4 bg-red-100">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-600 mb-2">{title}</h2>
            <p className="text-gray-700 mb-4">{message}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wpisz <strong className="text-red-600">{confirmText}</strong> aby potwierdzić:
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={confirmText}
            disabled={loading}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || inputText !== confirmText}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Usuwanie...' : 'Trwale usuń'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermanentDeleteDialog;

