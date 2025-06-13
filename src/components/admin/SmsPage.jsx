import { useState, useEffect } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import SmsHistory from "./SmsHistory";

const UserMessaging = () => {
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
  
  // Message templates state
  const [templates, setTemplates] = useState([
    { id: 1, name: "Przypomnienie o wizycie", content: "Przypominamy o wizycie w Centrum Medycznym w dniu [data] o godzinie [godzina]. W razie pytań prosimy o kontakt." },
    { id: 2, name: "Potwierdzenie rejestracji", content: "Dziękujemy za rejestrację w Centrum Medycznym. Twoje konto zostało pomyślnie utworzone." },
    { id: 3, name: "Odwołanie wizyty", content: "Informujemy, że Państwa wizyta w dniu [data] została odwołana. Prosimy o kontakt w celu ustalenia nowego terminu." }
  ]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [editingTemplate, setEditingTemplate] = useState(null);
  
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
    // Only allow alphanumeric characters, spaces, and basic punctuation
    const sanitizedValue = convertedValue.replace(/[^\w\s.,!?()-]/g, '');
    setMessageContent(sanitizedValue);
  };

  // Handle template selection
  const handleTemplateSelect = (templateContent) => {
    setMessageContent(templateContent);
    setShowTemplates(false);
  };

  // Handle adding new template
  const handleAddTemplate = () => {
    if (newTemplate.name.trim() && newTemplate.content.trim()) {
      // Convert Polish characters and sanitize content
      const convertedContent = convertPolishCharacters(newTemplate.content);
      const sanitizedContent = convertedContent.replace(/[^\w\s.,!?()-]/g, '');
      
      if (editingTemplate) {
        // Update existing template
        setTemplates(templates.map(template => 
          template.id === editingTemplate.id 
            ? { ...template, name: newTemplate.name, content: sanitizedContent }
            : template
        ));
        setEditingTemplate(null);
      } else {
        // Add new template
        const newId = Math.max(0, ...templates.map(t => t.id)) + 1;
        setTemplates([...templates, { 
          id: newId, 
          name: newTemplate.name, 
          content: sanitizedContent 
        }]);
      }
      
      setNewTemplate({ name: "", content: "" });
    }
  };

  // Handle editing template
  const handleEditTemplate = (template) => {
    setNewTemplate({ name: template.name, content: template.content });
    setEditingTemplate(template);
  };

  // Handle deleting template
  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter(template => template.id !== templateId));
    if (editingTemplate && editingTemplate.id === templateId) {
      setEditingTemplate(null);
      setNewTemplate({ name: "", content: "" });
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
    console.log("role is", role)
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
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="Nazwa szablonu"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddTemplate}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        {editingTemplate ? "Zapisz zmiany" : "Dodaj"}
                      </button>
                    </div>
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Convert Polish characters to non-accented equivalents
                        const convertedValue = convertPolishCharacters(value);
                        const sanitizedValue = convertedValue.replace(/[^\w\s.,!?()-]/g, '');
                        setNewTemplate({...newTemplate, content: sanitizedValue});
                      }}
                      placeholder="Treść szablonu..."
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium mb-2">Dostępne szablony</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <div key={template.id} className="border rounded-lg p-3 bg-white hover:shadow-md">
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-medium">{template.name}</h5>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTemplate(template)}
                                className="text-blue-600 text-sm hover:text-blue-800"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-600 text-sm hover:text-red-800"
                              >
                                Usuń
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                          <button
                            onClick={() => handleTemplateSelect(template.content)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Użyj tego szablonu
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <textarea
                value={messageContent}
                onChange={handleMessageChange}
                placeholder="Wprowadź treść wiadomości (bez znaków specjalnych)..."
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
    </div>
  );
};

export default UserMessaging;
