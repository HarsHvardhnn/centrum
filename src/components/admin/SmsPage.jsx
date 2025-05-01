import { useState, useEffect } from "react";
import { apiCaller } from "../../utils/axiosInstance";

const UserMessaging = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalUsers: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    sort: "createdAt",
    order: "desc",
  });

  // Load users with pagination and filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { page, limit } = pagination;
      const { search, role, sort, order } = filters;

      const queryParams = new URLSearchParams({
        page,
        limit,
        sort,
        order,
        ...(search && { search }),
        ...(role && { role }),
      }).toString();

      const response = await apiCaller("GET", `/admin/users?${queryParams}`);

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.data.pagination.totalPages,
          totalUsers: response.data.data.pagination.totalUsers,
        }));
      } else {
        setError("Nie udało się pobrać użytkowników");
      }
    } catch (err) {
      setError(err.message || "Błąd podczas pobierania użytkowników");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when pagination/filters change
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, filters.sort, filters.order]);

  // Filter change handler with debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search, filters.role]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Handle selection of a user
  const handleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, { id: user.id, name: user.name, phone: user.phone }];
      }
    });
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (!selectAll) {
      const allUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
      }));
      setSelectedUsers(allUsers);
    } else {
      setSelectedUsers([]);
    }
    setSelectAll(!selectAll);
  };

  // Check if user is selected
  const isUserSelected = (userId) => {
    return selectedUsers.some((user) => user.id === userId);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // State for tracking sent/failed messages
  const [messageResults, setMessageResults] = useState({
    sent: [],
    failed: [],
  });
  const [showResults, setShowResults] = useState(false);

  // Handle message sending
  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      setError("Proszę wybrać co najmniej jednego użytkownika");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!messageContent.trim()) {
      setError("Proszę wprowadzić wiadomość");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSubmitting(true);
    setShowResults(false);
    setMessageResults({ sent: [], failed: [] });

    try {
      // Data to send to backend
      const messageData = {
        recipients: selectedUsers.map((user) => ({
          userId: user.id,
          phone: user.phone,
        })),
        content: messageContent,
      };

      console.log("Sending message data:", messageData);

      const response = await apiCaller(
        "POST",
        "/sms/send-bulk-sms",
        messageData
      );

      if (response.data.success) {
        setSuccessMessage(
          `Pomyślnie wysłano ${response.data.stats.sent} wiadomości (${response.data.stats.failed} nie udało się)`
        );
        setMessageResults({
          sent: response.data.sent || [],
          failed: response.data.failed || [],
        });
        setShowResults(true);

        // Only clear form if at least one message was sent successfully
        if (response.data.sent && response.data.sent.length > 0) {
          setMessageContent("");
          // Remove successfully sent users from selection
          const sentUserIds = new Set(
            response.data.sent.map((item) => item.userId)
          );
          setSelectedUsers((prev) =>
            prev.filter((user) => !sentUserIds.has(user.id))
          );
        }

        // If all selected users were processed, clear selection
        if (response.data.stats.total === response.data.stats.sent) {
          setSelectedUsers([]);
          setSelectAll(false);
        }

        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(response.data.message || "Nie udało się wysłać wiadomości");
        // Still record any partial results
        if (response.data.sent || response.data.failed) {
          setMessageResults({
            sent: response.data.sent || [],
            failed: response.data.failed || [],
          });
          setShowResults(true);
        }
      }
    } catch (err) {
      setError(err.message || "Błąd podczas wysyłania wiadomości");
      console.error("SMS sending error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pageNumbers = [];
    const maxPageButtons = 5;

    let startPage = Math.max(1, page - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Wyślij Wiadomość do Użytkowników
        </h2>
        <p className="text-gray-600">Wybierz użytkowników i napisz wiadomość</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Szukaj użytkowników..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie Role</option>
            <option value="patient">Pacjent</option>
            <option value="doctor">Lekarz</option>
            <option value="receptionist">Recepcjonista</option>
          </select>
        </div>
      </div>

      {/* User Selection Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imię i Nazwisko
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rola
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Ładowanie...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Nie znaleziono użytkowników
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`${
                    isUserSelected(user.id) ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isUserSelected(user.id)}
                      onChange={() => handleUserSelection(user)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {user.role}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-700">
          Pokazano {users.length} z {pagination.totalUsers} użytkowników
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded ${
              pagination.page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            Poprzednia
          </button>
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded ${
                pagination.page === pageNum
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-3 py-1 rounded ${
              pagination.page === pagination.totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            Następna
          </button>
        </div>
      </div>

      {/* Message Composition */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Napisz Wiadomość
        </h3>
        <div className="mb-4">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Wprowadź treść wiadomości..."
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Wybrano {selectedUsers.length} użytkowników
          </div>
          <button
            onClick={handleSendMessage}
            disabled={submitting || selectedUsers.length === 0}
            className={`px-6 py-2 rounded-lg ${
              submitting || selectedUsers.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {submitting ? "Wysyłanie..." : "Wyślij Wiadomość"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Message Results */}
      {showResults && (messageResults.sent.length > 0 || messageResults.failed.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Wyniki Wysyłania
          </h3>
          {messageResults.sent.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-green-600 mb-2">
                Pomyślnie Wysłane ({messageResults.sent.length})
              </h4>
              <ul className="text-sm text-gray-600">
                {messageResults.sent.map((result, index) => (
                  <li key={index} className="mb-1">
                    {result.name} ({result.phone})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messageResults.failed.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">
                Nie Udało Się Wysłać ({messageResults.failed.length})
              </h4>
              <ul className="text-sm text-gray-600">
                {messageResults.failed.map((result, index) => (
                  <li key={index} className="mb-1">
                    {result.name} ({result.phone}) - {result.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMessaging;
