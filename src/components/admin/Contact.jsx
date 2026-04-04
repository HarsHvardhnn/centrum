import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useUser } from "../../context/userContext";
import PermanentDeleteDialog from "./PermanentDeleteDialog";
import BulkDeleteComponent from "./BulkDeleteComponent";

const PAGE_SIZE = 10;

const AdminmsgsContent = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null
  });

  // Function to convert privacy policy acceptance to Polish
  const getPrivacyPolicyStatus = (accepted) => {
    if (accepted === true) return "Tak";
    if (accepted === false) return "Nie";
    return "Brak danych";
  };

  // Function to get status color
  const getStatusColor = (accepted) => {
    if (accepted === true) return "text-green-600";
    if (accepted === false) return "text-red-600";
    return "text-gray-500";
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCaller("GET", "/api/contact?page=" + page + "&limit=" + PAGE_SIZE);
      setMessages(res.data.data || []);
      setTotal(res.data.count || 0);
    } catch (err) {
      setError("Błąd podczas pobierania wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDeleteClick = (contactId) => {
    setDeleteDialog({
      open: true,
      id: contactId
    });
  };

  const handleDeleteSuccess = async () => {
    await fetchMessages();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wiadomości kontaktowe</h1>
      
      {/* Bulk Delete Component */}
      <div className="mb-6">
        <BulkDeleteComponent 
          type="contact" 
          onSuccess={handleDeleteSuccess}
        />
      </div>
      {loading ? (
        <div className="text-center py-12">Ładowanie...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-12">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-3 border-b text-left">Imię i nazwisko</th>
                  <th className="px-4 py-3 border-b text-left">Email</th>
                  <th className="px-4 py-3 border-b text-left">Temat</th>
                  <th className="px-4 py-3 border-b text-left">Wiadomość</th>
                  <th className="px-4 py-3 border-b text-left">Zgoda RODO</th>
                  <th className="px-4 py-3 border-b text-left">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Brak wiadomości</td>
                  </tr>
                ) : (
                  messages.map((msg, idx) => (
                    <tr key={msg._id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">{msg.name}</td>
                      <td className="px-4 py-3 border-b">{msg.email}</td>
                      <td className="px-4 py-3 border-b">{msg.subject}</td>
                      <td className="px-4 py-3 border-b whitespace-pre-line">{msg.message}</td>
                      <td className={`px-4 py-3 border-b font-medium ${getStatusColor(msg.privacyPolicyAccepted)}`}>
                        {getPrivacyPolicyStatus(msg.privacyPolicyAccepted)}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <button
                          onClick={() => handleDeleteClick(msg._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          title="Trwale usuń wiadomość"
                        >
                          <Trash2 size={16} />
                          Trwale usuń
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Poprzednia
              </button>
              <span className="mx-2">Strona {page} z {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Następna
              </button>
            </div>
          )}
        </>
      )}

      {/* Permanent Delete Dialog */}
      <PermanentDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        type="contact"
        id={deleteDialog.id}
        title="Trwale usuń wiadomość kontaktową?"
        message="Ta operacja jest nieodwracalna. Wiadomość kontaktowa zostanie trwale usunięta z systemu."
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

const Adminmsgs = () => {
  const { user } = useUser();
  if (user?.role === "doctor") {
    return <Navigate to="/administracja" replace />;
  }
  return <AdminmsgsContent />;
};

export default Adminmsgs;