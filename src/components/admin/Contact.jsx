import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Trash2, MailOpen, Eye } from "lucide-react";
import { useUser } from "../../context/userContext";
import PermanentDeleteDialog from "./PermanentDeleteDialog";
import BulkDeleteComponent from "./BulkDeleteComponent";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  new: "Nowa",
  read: "Przeczytana",
  replied: "Odpowiedziano",
};

const AdminmsgsContent = () => {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const isReceptionist = user?.role === "receptionist";

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
  });
  const [softDeleteConfirm, setSoftDeleteConfirm] = useState({
    open: false,
    id: null,
  });

  const getPrivacyPolicyStatus = (accepted) => {
    if (accepted === true) return "Tak";
    if (accepted === false) return "Nie";
    return "Brak danych";
  };

  const getStatusColor = (accepted) => {
    if (accepted === true) return "text-green-600";
    if (accepted === false) return "text-red-600";
    return "text-gray-500";
  };

  const getMessageStatusStyle = (status) => {
    if (status === "new") return "bg-amber-100 text-amber-800";
    if (status === "read") return "bg-teal-100 text-teal-800";
    if (status === "replied") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCaller(
        "GET",
        "/api/contact?page=" + page + "&limit=" + PAGE_SIZE
      );
      setMessages(res.data.data || []);
      setTotal(res.data.total ?? res.data.count ?? 0);
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

  const handleMarkAsRead = async (contactId) => {
    if (!contactId || actionId) return;
    setActionId(contactId);
    try {
      await apiCaller("PATCH", `/api/contact/${contactId}/status`, {
        status: "read",
      });
      toast.success("Oznaczono jako przeczytaną");
      setMessages((prev) =>
        prev.map((m) =>
          m._id === contactId ? { ...m, status: "read" } : m
        )
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Nie udało się oznaczyć jako przeczytaną"
      );
    } finally {
      setActionId(null);
    }
  };

  const handleSoftDelete = async () => {
    const contactId = softDeleteConfirm.id;
    if (!contactId) return;
    setActionId(contactId);
    try {
      await apiCaller("DELETE", `/api/contact/${contactId}`);
      toast.success("Wiadomość została usunięta");
      setSoftDeleteConfirm({ open: false, id: null });
      await fetchMessages();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Nie udało się usunąć wiadomości"
      );
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDeleteClick = (contactId) => {
    setDeleteDialog({ open: true, id: contactId });
  };

  const handleDeleteSuccess = async () => {
    await fetchMessages();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wiadomości kontaktowe</h1>

      {/* Permanent bulk purge — admin only */}
      {isAdmin && (
        <div className="mb-6">
          <BulkDeleteComponent type="contact" onSuccess={handleDeleteSuccess} />
        </div>
      )}

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
                  <th className="px-4 py-3 border-b text-left">Status</th>
                  <th className="px-4 py-3 border-b text-left">Zgoda RODO</th>
                  <th className="px-4 py-3 border-b text-left">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Brak wiadomości
                    </td>
                  </tr>
                ) : (
                  messages.map((msg, idx) => {
                    const isNew = !msg.status || msg.status === "new";
                    const busy = actionId === msg._id;
                    return (
                      <tr
                        key={msg._id || idx}
                        className={`hover:bg-gray-50 ${
                          isNew ? "bg-amber-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3 border-b font-medium">
                          {msg.name}
                        </td>
                        <td className="px-4 py-3 border-b">{msg.email}</td>
                        <td className="px-4 py-3 border-b">{msg.subject}</td>
                        <td className="px-4 py-3 border-b whitespace-pre-line max-w-xs">
                          {msg.message}
                        </td>
                        <td className="px-4 py-3 border-b">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getMessageStatusStyle(
                              msg.status || "new"
                            )}`}
                          >
                            {STATUS_LABELS[msg.status] || STATUS_LABELS.new}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 border-b font-medium ${getStatusColor(
                            msg.privacyPolicyAccepted
                          )}`}
                        >
                          {getPrivacyPolicyStatus(msg.privacyPolicyAccepted)}
                        </td>
                        <td className="px-4 py-3 border-b">
                          <div className="flex flex-wrap items-center gap-2">
                            {isNew && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleMarkAsRead(msg._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors disabled:opacity-50 text-sm"
                                title="Oznacz jako przeczytaną"
                              >
                                <MailOpen size={16} />
                                Przeczytane
                              </button>
                            )}
                            {!isNew && msg.status === "read" && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500 px-1">
                                <Eye size={14} />
                                Przeczytana
                              </span>
                            )}

                            {/* Reception: soft delete */}
                            {isReceptionist && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  setSoftDeleteConfirm({
                                    open: true,
                                    id: msg._id,
                                  })
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
                                title="Usuń wiadomość"
                              >
                                <Trash2 size={16} />
                                Usuń
                              </button>
                            )}

                            {/* Admin: permanent delete */}
                            {isAdmin && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handlePermanentDeleteClick(msg._id)
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                                title="Trwale usuń wiadomość"
                              >
                                <Trash2 size={16} />
                                Trwale usuń
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                type="button"
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Poprzednia
              </button>
              <span className="mx-2">
                Strona {page} z {totalPages}
              </span>
              <button
                type="button"
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

      {/* Soft delete confirm — reception */}
      {softDeleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Usunąć wiadomość?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Wiadomość zostanie usunięta z listy. Tej operacji nie da się
              cofnąć z poziomu recepcji.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setSoftDeleteConfirm({ open: false, id: null })}
                disabled={!!actionId}
              >
                Anuluj
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                onClick={handleSoftDelete}
                disabled={!!actionId}
              >
                {actionId ? "Usuwanie…" : "Usuń"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent delete — admin only */}
      {isAdmin && (
        <PermanentDeleteDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: null })}
          type="contact"
          id={deleteDialog.id}
          title="Trwale usuń wiadomość kontaktową?"
          message="Ta operacja jest nieodwracalna. Wiadomość kontaktowa zostanie trwale usunięta z systemu."
          onSuccess={handleDeleteSuccess}
        />
      )}
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
