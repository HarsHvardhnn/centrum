import { useState, useEffect } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import { toast } from "sonner";
import SmsHistory from "./SmsHistory";

/**
 * SMS Page Component
 * 
 * Features:
 * - Send bulk SMS messages to selected users
 * - Dynamic SMS templates from backend API
 * - Template management (create, edit, delete, toggle status)
 * - User selection with pagination and filtering
 * - SMS history tracking
 * 
 * API Endpoints used:
 * - GET /api/sms-templates - Fetch all templates
 * - POST /api/sms-templates - Create new template
 * - PUT /api/sms-templates/:id - Update template
 * - DELETE /api/sms-templates/:id - Delete template
 * - PATCH /api/sms-templates/:id/toggle - Toggle template status
 * - POST /sms/send-bulk-sms - Send bulk SMS
 */

const UserMessaging = () => {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  // Add tab state
  const [activeTab, setActiveTab] = useState("send");
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Message templates state - now using backend API
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSubmitting, setTemplateSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", description: "" });
  const [editingTemplate, setEditingTemplate] = useState(null);
  // Bulk permanent delete – SMS templates (admin only)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [showBulkDeleteTemplatesModal, setShowBulkDeleteTemplatesModal] = useState(false);
  const [bulkDeleteTemplatesSubmitting, setBulkDeleteTemplatesSubmitting] = useState(false);
  
  // Character counter state
  const [characterCount, setCharacterCount] = useState(0);

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

  // Load SMS templates from backend
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await apiCaller("GET", "/api/sms-templates");
      
      if (response.data.success) {
        setTemplates(response.data.data);
      } else {
        setError("Nie udało się pobrać szablonów SMS");
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      // Don't show error for template loading as it's not critical
      // setError("Błąd podczas pobierania szablonów SMS");
    } finally {
      setTemplatesLoading(false);
    }
  };

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
    if (activeTab === "send") {
      fetchUsers();
      fetchTemplates(); // Load templates when send tab is active
    }
  }, [pagination.page, pagination.limit, filters.sort, filters.order, activeTab]);

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

  // Update character count when message content changes
  useEffect(() => {
    setCharacterCount(messageContent.length);
  }, [messageContent]);

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

  // Function to convert Polish characters to their non-accented equivalents
  const convertPolishCharacters = (text) => {
    const polishCharMap = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (match) => polishCharMap[match] || match);
  };

  // Handle message content change with validation
  const handleMessageChange = (e) => {
    const value = e.target.value;
    // Convert Polish characters to non-accented equivalents
    const convertedValue = convertPolishCharacters(value);
    // Allow alphanumeric characters, spaces, basic punctuation, and URL characters (/, :, .)
    // But block special characters like &$$$###@@
    const sanitizedValue = convertedValue.replace(/[^\w\s.,!?()-\/:]/g, '');
    setMessageContent(sanitizedValue);
  };

  // Handle template selection
  const handleTemplateSelect = (templateDescription) => {
    setMessageContent(templateDescription);
    setShowTemplates(false);
  };

  // Handle adding new template
  const handleAddTemplate = async () => {
    if (newTemplate.title.trim() && newTemplate.description.trim()) {
      // Convert Polish characters and sanitize content
      const convertedDescription = convertPolishCharacters(newTemplate.description);
      const sanitizedDescription = convertedDescription.replace(/[^\w\s.,!?()-]/g, '');
      
      setTemplateSubmitting(true);
      try {
        if (editingTemplate) {
          // Update existing template
          const response = await apiCaller(
            "PUT",
            `/api/sms-templates/${editingTemplate._id}`,
            {
              title: newTemplate.title,
              description: sanitizedDescription,
              isActive: true
            }
          );

          if (response.data.success) {
            setSuccessMessage("Szablon został zaktualizowany pomyślnie");
            await fetchTemplates(); // Refresh templates
            setEditingTemplate(null);
          } else {
            setError(response.data.message || "Nie udało się zaktualizować szablonu");
          }
        } else {
          // Create new template
          const response = await apiCaller(
            "POST",
            "/api/sms-templates",
            {
              title: newTemplate.title,
              description: sanitizedDescription
            }
          );

          if (response.data.success) {
            setSuccessMessage("Szablon został utworzony pomyślnie");
            await fetchTemplates(); // Refresh templates
          } else {
            setError(response.data.message || "Nie udało się utworzyć szablonu");
          }
        }
        
        setNewTemplate({ title: "", description: "" });
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(err.message || "Błąd podczas operacji na szablonie");
        setTimeout(() => setError(null), 3000);
      } finally {
        setTemplateSubmitting(false);
      }
    }
  };

  // Handle editing template
  const handleEditTemplate = (template) => {
    setNewTemplate({ title: template.title, description: template.description });
    setEditingTemplate(template);
  };

  // Handle deleting template
  const handleDeleteTemplate = async (templateId) => {
    setTemplateSubmitting(true);
    try {
      const response = await apiCaller("DELETE", `/api/sms-templates/${templateId}`);
      
      if (response.data.success) {
        setSuccessMessage("Szablon został usunięty pomyślnie");
        await fetchTemplates(); // Refresh templates
        if (editingTemplate && editingTemplate._id === templateId) {
          setEditingTemplate(null);
          setNewTemplate({ title: "", description: "" });
        }
      } else {
        setError(response.data.message || "Nie udało się usunąć szablonu");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Błąd podczas usuwania szablonu");
      setTimeout(() => setError(null), 3000);
    } finally {
      setTemplateSubmitting(false);
    }
  };

  // Handle template status toggle
  const handleToggleTemplateStatus = async (templateId) => {
    setTemplateSubmitting(true);
    try {
      const response = await apiCaller("PATCH", `/api/sms-templates/${templateId}/toggle`);
      
      if (response.data.success) {
        setSuccessMessage("Status szablonu został zmieniony pomyślnie");
        await fetchTemplates(); // Refresh templates
      } else {
        setError(response.data.message || "Nie udało się zmienić statusu szablonu");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Błąd podczas zmiany statusu szablonu");
      setTimeout(() => setError(null), 3000);
    } finally {
      setTemplateSubmitting(false);
    }
  };

  // Bulk permanent delete – SMS templates (admin only)
  const handleTemplateCheckboxSelect = (templateId) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };
  const handleTemplateSelectAll = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map((t) => t._id));
    }
  };
  const handleBulkDeleteTemplatesConfirm = async () => {
    if (selectedTemplateIds.length === 0) return;
    setBulkDeleteTemplatesSubmitting(true);
    try {
      const response = await apiCaller("POST", "/api/sms-templates/bulk-delete", {
        ids: selectedTemplateIds,
      });
      if (response.data?.success) {
        const count = response.data.deletedCount ?? selectedTemplateIds.length;
        toast.success(response.data.message || `Trwale usunięto ${count} szablonów SMS`);
        setShowBulkDeleteTemplatesModal(false);
        setSelectedTemplateIds([]);
        await fetchTemplates();
        if (editingTemplate && selectedTemplateIds.includes(editingTemplate._id)) {
          setEditingTemplate(null);
          setNewTemplate({ title: "", description: "" });
        }
      } else {
        toast.error(response.data?.message || "Nie udało się trwale usunąć szablonów");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Błąd podczas trwałego usuwania szablonów SMS");
    } finally {
      setBulkDeleteTemplatesSubmitting(false);
    }
  };

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

      //("Sending message data:", messageData);

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

        setTimeout(() => {
          setSuccessMessage("");
          // Switch to history tab after successful sending to show the newly sent messages
          if (response.data.stats.sent > 0) {
            setActiveTab("history");
          }
        }, 3000);
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

  // Calculate SMS segments (1 segment = 160 characters)
  const calculateSmsSegments = () => {
    const characterLimit = 160;
    return Math.ceil(characterCount / characterLimit);
  };

  const translateRoleToPolish = (role) => {
    //("role is", role)
    switch (role) {
      case "patient":
        return "Pacjent";
      case "doctor":
        return "Lekarz";
      case "receptionist":
        return "Recepcjonista";
      case "admin":
        return "Administrator";
      default:
        return "Nieznana rola";
    }
  };
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Wiadomości SMS
        </h2>
        <p className="text-gray-600">Zarządzaj wiadomościami SMS w systemie</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("send")}
            className={`py-3 px-6 font-medium text-center border-b-2 ${
              activeTab === "send"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Wyślij Wiadomości
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-medium text-center border-b-2 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Historia Wiadomości
          </button>
        </nav>
      </div>

      {activeTab === "send" ? (
        // Send Messages Tab Content
        <>
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
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zgoda na SMS
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
                        {translateRoleToPolish(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.smsConsentAgreed ? "Tak" : "Nie"}
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
            
            {/* Message Templates */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  {showTemplates ? "Ukryj szablony" : "Pokaż szablony wiadomości"}
                </button>
                <span className="text-sm text-gray-500">
                  Użyj gotowych szablonów lub stwórz własne
                </span>
              </div>
              
              {showTemplates && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">
                      {editingTemplate ? "Edytuj szablon" : "Dodaj nowy szablon"}
                    </h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTemplate.title}
                        onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                        placeholder="Nazwa szablonu"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddTemplate}
                        disabled={templateSubmitting}
                        className={`px-4 py-2 rounded-lg ${
                          templateSubmitting
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {templateSubmitting ? "Przetwarzanie..." : (editingTemplate ? "Zapisz zmiany" : "Dodaj")}
                      </button>
                    </div>
                    <textarea
                      value={newTemplate.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Convert Polish characters to non-accented equivalents
                        const convertedValue = convertPolishCharacters(value);
                        // Allow alphanumeric characters, spaces, basic punctuation, and URL characters (/, :, .)
                        // But block special characters like &$$$###@@
                        const sanitizedValue = convertedValue.replace(/[^\w\s.,!?()-\/:]/g, '');
                        setNewTemplate({...newTemplate, description: sanitizedValue});
                      }}
                      placeholder="Treść szablonu..."
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Dostępne szablony</h4>
                    {isAdmin && templates.length > 0 && (
                      <div className="flex items-center gap-3 mb-3">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTemplateIds.length === templates.length && templates.length > 0}
                            onChange={handleTemplateSelectAll}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          Zaznacz wszystkie
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowBulkDeleteTemplatesModal(true)}
                          disabled={selectedTemplateIds.length === 0}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            selectedTemplateIds.length === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          Trwale usuń wybrane ({selectedTemplateIds.length})
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templatesLoading ? (
                        <p className="text-gray-500">Ładowanie szablonów...</p>
                      ) : templates.length === 0 ? (
                        <p className="text-gray-500">Brak dostępnych szablonów. Utwórz nowy!</p>
                      ) : (
                        templates.map((template) => (
                          <div key={template._id} className={`border rounded-lg p-3 hover:shadow-md ${
                            template.isActive ? 'bg-white' : 'bg-gray-50'
                          } ${selectedTemplateIds.includes(template._id) ? 'ring-2 ring-red-300' : ''}`}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                {isAdmin && (
                                  <input
                                    type="checkbox"
                                    checked={selectedTemplateIds.includes(template._id)}
                                    onChange={() => handleTemplateCheckboxSelect(template._id)}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 flex-shrink-0"
                                  />
                                )}
                                <h5 className="font-medium">{template.title}</h5>
                                {!template.isActive && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                    Nieaktywny
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTemplate(template)}
                                  disabled={templateSubmitting}
                                  className={`text-sm ${templateSubmitting ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                                >
                                  Edytuj
                                </button>
                                <button
                                  onClick={() => handleDeleteTemplate(template._id)}
                                  disabled={templateSubmitting}
                                  className={`text-sm ${templateSubmitting ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                                >
                                  Usuń
                                </button>
                                <button
                                  onClick={() => handleToggleTemplateStatus(template._id)}
                                  disabled={templateSubmitting}
                                  className={`text-sm ${templateSubmitting ? 'text-gray-400 cursor-not-allowed' : (template.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800')}`}
                                >
                                  {template.isActive ? 'Aktywny' : 'Nieaktywny'}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <button
                              onClick={() => handleTemplateSelect(template.description)}
                              disabled={templateSubmitting}
                              className={`text-sm ${templateSubmitting ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                              Użyj tego szablonu
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <textarea
                value={messageContent}
                onChange={handleMessageChange}
                placeholder="Wprowadź treść wiadomości (linki są dozwolone)..."
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="flex justify-between text-sm mt-2">
                <div className="text-gray-600">
                  <span className={characterCount > 160 ? 'text-yellow-600' : 'text-gray-600'}>
                    Znaki: {characterCount}
                  </span> | 
                  <span className={calculateSmsSegments() > 1 ? 'text-yellow-600 ml-1' : 'text-gray-600 ml-1'}>
                    Segmenty SMS: {calculateSmsSegments()}
                  </span>
                </div>
                <div className="text-gray-500">
                  {characterCount > 160 && 
                    <span className="text-yellow-600">
                      Wiadomość zostanie podzielona na {calculateSmsSegments()} SMS-y
                    </span>
                  }
                </div>
              </div>
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
        </>
      ) : (
        // History Tab Content
        <SmsHistory />
      )}

      {/* Bulk permanent delete – SMS templates confirmation (admin only) */}
      {showBulkDeleteTemplatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Trwałe usunięcie szablonów SMS
            </h3>
            <p className="text-gray-600 mb-4">
              Ta operacja jest <strong>nieodwracalna</strong>. Wybrane szablony SMS ({selectedTemplateIds.length}) zostaną trwale usunięte z bazy danych. Nie będzie można ich przywrócić.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Czy na pewno chcesz kontynuować?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !bulkDeleteTemplatesSubmitting && setShowBulkDeleteTemplatesModal(false)}
                disabled={bulkDeleteTemplatesSubmitting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteTemplatesConfirm}
                disabled={bulkDeleteTemplatesSubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleteTemplatesSubmitting ? "Usuwanie..." : "Tak, trwale usuń"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessaging;
