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
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "Error fetching users");
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
      setError("Please select at least one user");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!messageContent.trim()) {
      setError("Please enter a message");
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
          `Successfully sent ${response.data.stats.sent} messages (${response.data.stats.failed} failed)`
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
        setError(response.data.message || "Failed to send message");
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
      setError(err.message || "Error sending message");
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
          Send Message to Users
        </h2>
        <p className="text-gray-600">Select users and compose your message</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              handleFilterChange("sort", sort);
              handleFilterChange("order", order);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name.first-asc">Name (A-Z)</option>
            <option value="name.first-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="email-desc">Email (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-6 overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <span className="ml-2">Select All</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`${
                    isUserSelected(user.id) ? "bg-teal-50" : "hover:bg-gray-50"
                  } cursor-pointer`}
                  onClick={() => handleUserSelection(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={isUserSelected(user.id)}
                      onChange={() => {}} // Handle via row click instead
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "doctor"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "patient"
                          ? "bg-green-100 text-green-800"
                          : user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              pagination.page === 1
                ? "text-gray-300"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              pagination.page === pagination.totalPages
                ? "text-gray-300"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalUsers
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalUsers}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
                  pagination.page === 1
                    ? "text-gray-300"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                    pagination.page === pageNum
                      ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
                  pagination.page === pagination.totalPages
                    ? "text-gray-300"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Selected Users Summary */}
      <div className="mt-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Selected Users ({selectedUsers.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedUsers.length === 0 ? (
            <p className="text-gray-500">No users selected</p>
          ) : (
            selectedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{user.name}</span>
                <button
                  className="ml-2 text-teal-600 hover:text-teal-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id)
                    );
                  }}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Composer */}
      <div className="mt-4">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message Content
        </label>
        <textarea
          id="message"
          rows="4"
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="Type your message here..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        ></textarea>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Message Results */}
      {showResults &&
        (messageResults.sent.length > 0 ||
          messageResults.failed.length > 0) && (
          <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Message Delivery Results
              </h3>
            </div>

            {/* Successfully Sent Messages */}
            {messageResults.sent.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Successfully Sent ({messageResults.sent.length})
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-1 text-left">Phone</th>
                        <th className="py-1 text-left">Message ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {messageResults.sent.map((result, index) => (
                        <tr key={`sent-${index}`} className="text-sm">
                          <td className="py-1">{result.phone}</td>
                          <td className="py-1 text-gray-500">
                            {result.messageId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Failed Messages */}
            {messageResults.failed.length > 0 && (
              <div className="px-4 py-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Failed to Send ({messageResults.failed.length})
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-1 text-left">Phone</th>
                        <th className="py-1 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {messageResults.failed.map((result, index) => (
                        <tr key={`failed-${index}`} className="text-sm">
                          <td className="py-1">{result.phone}</td>
                          <td className="py-1 text-red-600">{result.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Send Button */}
      <div className="mt-6">
        <button
          type="button"
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
            submitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
          onClick={handleSendMessage}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </div>
  );
};

export default UserMessaging;
