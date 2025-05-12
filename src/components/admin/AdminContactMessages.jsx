import React, { useEffect, useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";

const PAGE_SIZE = 10;

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
    fetchMessages();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-5xl mx-auto">
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
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">Brak wiadomości</td>
                  </tr>
                ) : (
                  messages.map((msg, idx) => (
                    <tr key={msg._id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">{msg.name}</td>
                      <td className="px-4 py-3 border-b">{msg.email}</td>
                      <td className="px-4 py-3 border-b">{msg.subject}</td>
                      <td className="px-4 py-3 border-b whitespace-pre-line">{msg.message}</td>
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

export default AdminContactMessages; 