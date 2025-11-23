import React, { useEffect, useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

const Adminmsgs = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (contactId) => {
    // Confirm deletion
    if (!window.confirm("Czy na pewno chcesz usunąć tę wiadomość kontaktową? Ta operacja jest nieodwracalna.")) {
      return;
    }

    try {
      setDeletingId(contactId);
      
      const res = await apiCaller("DELETE", `/api/contact/${contactId}`);
      
      if (res.data.success) {
        toast.success("Wiadomość kontaktowa usunięta pomyślnie");
        // Refresh the messages list
        await fetchMessages();
      } else {
        throw new Error(res.data.message || "Nie udało się usunąć wiadomości");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Błąd podczas usuwania wiadomości";
      toast.error(errorMessage);
      console.error("Error deleting contact:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wiadomości kontaktowe</h1>
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
                          onClick={() => handleDelete(msg._id)}
                          disabled={deletingId === msg._id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Usuń wiadomość"
                        >
                          <Trash2 size={16} />
                          {deletingId === msg._id ? "Usuwanie..." : "Usuń"}
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
    </div>
  );
};

export default Adminmsgs; 