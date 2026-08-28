import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { usePermanentDelete } from "../../hooks/usePermanentDelete";
import { toast } from "sonner";

const BulkDeleteComponent = ({ type, status, onSuccess }) => {
  const { deleteRecord, getStats, loading, error } = usePermanentDelete();
  const [stats, setStats] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (confirmText !== 'DELETE ALL') {
      toast.error('Proszę wpisać "DELETE ALL" aby potwierdzić');
      return;
    }

    try {
      const endpointMap = {
        appointment: 'appointments',
        invoice: 'invoices',
        contact: 'contacts'
      };

      const endpoint = endpointMap[type];
      if (!endpoint) {
        throw new Error('Invalid delete type');
      }

      const query = status ? `?bulk=true&status=${status}` : '?bulk=true';
      const result = await deleteRecord(endpoint, null, { query });
      
      toast.success(result.message || `Pomyślnie usunięto ${result.deletedCount || 0} rekord(ów)`);
      setConfirmText('');
      setShowDialog(false);
      fetchStats(); // Refresh stats
      onSuccess?.();
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error(err.message || 'Nie udało się usunąć rekordów');
    }
  };

  const getCount = () => {
    if (!stats) return 0;
    
    if (type === 'appointment') {
      return status === 'cancelled' 
        ? stats.cancelledAppointments || 0
        : stats.completedAppointments || 0;
    }
    if (type === 'invoice') {
      return status === 'cancelled' 
        ? stats.cancelledInvoices || 0
        : stats.paidInvoices || 0;
    }
    if (type === 'contact') {
      return stats.softDeletedContacts || 0;
    }
    return 0;
  };

  const getTypeLabel = () => {
    const labels = {
      appointment: 'Wizyt',
      invoice: 'Faktur',
      contact: 'Wiadomości kontaktowych'
    };
    return labels[type] || type;
  };

  const getStatusLabel = () => {
    const labels = {
      cancelled: 'anulowanych',
      paid: 'opłaconych',
      completed: 'zakończonych'
    };
    return labels[status] || '';
  };

  const count = getCount();

  return (
    <>
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-red-800 flex items-center">
            <Trash2 className="mr-2" size={18} />
            Masowe usuwanie {getTypeLabel()} {getStatusLabel() && `(${getStatusLabel()})`}
          </h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          {count} rekord(ów) może zostać trwale usuniętych
        </p>

        <button
          onClick={() => setShowDialog(true)}
          disabled={loading || count === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Trash2 className="mr-2" size={16} />
          Usuń wszystkie ({count})
        </button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
            <div className="flex items-start mb-4">
              <div className="rounded-full p-3 mr-4 bg-red-100">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Masowe usuwanie
                </h2>
                <p className="text-gray-700 mb-2">
                  Zostanie trwale usuniętych <strong>{count} rekord(ów)</strong>.
                </p>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Ta operacja jest nieodwracalna!
                </p>
                {type === "invoice" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Numery faktur wracają do puli tylko gdy usunięty numer był ostatni w miesiącu.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wpisz <strong className="text-red-600">DELETE ALL</strong> aby potwierdzić:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE ALL"
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
                onClick={() => {
                  setShowDialog(false);
                  setConfirmText('');
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={loading || confirmText !== 'DELETE ALL' || count === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Usuwanie...' : `Usuń wszystkie (${count})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkDeleteComponent;



