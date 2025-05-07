import { useState, useEffect } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const SmsHistory = () => {
  // State for SMS data
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    batchId: "",
    userId: "",
    phone: "",
    startDate: "",
    endDate: "",
    search: "",
    errorCode: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  
  // Selected SMS for detailed view
  const [selectedSms, setSelectedSms] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Fetch SMS data
  const fetchSmsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page);
      queryParams.append("limit", pagination.limit);
      queryParams.append("sortBy", filters.sortBy);
      queryParams.append("sortOrder", filters.sortOrder);
      
      // Add filter parameters if they exist
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.batchId) queryParams.append("batchId", filters.batchId);
      if (filters.userId) queryParams.append("userId", filters.userId);
      if (filters.phone) queryParams.append("phone", filters.phone);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.errorCode) queryParams.append("errorCode", filters.errorCode);
      
      const response = await apiCaller("GET", `/sms-data?${queryParams.toString()}`);
      
      if (response.data && response.data.success) {
        setSmsData(response.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 1,
        });
      } else {
        setError("Nie udało się pobrać historii SMS");
        setSmsData([]);
      }
    } catch (err) {
      console.error("Error fetching SMS data:", err);
      setError(err.message || "Błąd podczas pobierania historii SMS");
      setSmsData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load and when pagination/filters change
  useEffect(() => {
    fetchSmsData();
  }, [pagination.page, pagination.limit]);
  
  // Apply filters
  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchSmsData();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: "",
      batchId: "",
      userId: "",
      phone: "",
      startDate: "",
      endDate: "",
      search: "",
      errorCode: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination({ ...pagination, page: 1 });
    // Fetch data with reset filters
    setTimeout(() => fetchSmsData(), 0);
  };
  
  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };
  
  // View SMS details
  const handleViewDetails = (sms) => {
    setSelectedSms(sms);
    setShowDetails(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm:ss", { locale: pl });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
  
  // Export SMS data to CSV
  const exportToCSV = () => {
    if (smsData.length === 0) {
      return;
    }
    
    // CSV headers
    const headers = [
      'ID wiadomości',
      'Numer telefonu',
      'ID odbiorcy',
      'Treść',
      'Status',
      'Kod błędu',
      'Opis błędu',
      'Data utworzenia',
      'Data wysłania',
      'Data dostarczenia/niepowodzenia'
    ];
    
    // Format data for CSV
    const csvData = smsData.map(sms => [
      sms.messageId || '',
      sms.recipient?.phone || '',
      sms.recipient?.userId || '',
      sms.content || '',
      sms.status || '',
      sms.error?.code || '',
      sms.error?.message || '',
      formatDate(sms.createdAt),
      formatDate(sms.sentAt),
      formatDate(sms.status === 'DELIVERED' ? sms.deliveredAt : sms.failedAt)
    ]);
    
    // Add headers to data
    csvData.unshift(headers);
    
    // Convert to CSV string with proper escaping
    const csvString = csvData.map(row => 
      row.map(cell => {
        // Escape double quotes and wrap in quotes if needed
        const escaped = String(cell).replace(/"/g, '""');
        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    ).join('\n');
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Add date to filename for better organization
    const now = new Date();
    const filename = `sms-history-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Filtry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wszystkie</option>
              <option value="DELIVERED">Dostarczone</option>
              <option value="PENDING">Oczekujące</option>
              <option value="FAILED">Nieudane</option>
            </select>
          </div>
          
          {/* Phone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numer telefonu</label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
              placeholder="Wpisz numer telefonu"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Error Code Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod błędu</label>
            <input
              type="text"
              value={filters.errorCode}
              onChange={(e) => handleFilterChange("errorCode", e.target.value)}
              placeholder="np. UNKNOWN, INVALID_PHONE"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Batch ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID partii</label>
            <input
              type="text"
              value={filters.batchId}
              onChange={(e) => handleFilterChange("batchId", e.target.value)}
              placeholder="Wpisz ID partii"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data od</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Szukaj w treści</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Wpisz frazę"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj według</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Data utworzenia</option>
              <option value="sentAt">Data wysłania</option>
              <option value="deliveredAt">Data dostarczenia</option>
              <option value="failedAt">Data niepowodzenia</option>
              <option value="status">Status</option>
              <option value="error.code">Kod błędu</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kolejność</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Malejąco</option>
              <option value="asc">Rosnąco</option>
            </select>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Zastosuj filtry
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Zresetuj filtry
          </button>
        </div>
      </div>
      
      {/* Refresh Button and Status */}
      <div className="flex justify-between items-center mb-4">
        <div>
          {loading && <span className="text-blue-500">Ładowanie danych...</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={loading || smsData.length === 0}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              loading || smsData.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
            title={smsData.length === 0 ? "Brak danych do eksportu" : "Eksportuj do CSV"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Eksportuj CSV
          </button>
          <button
            onClick={fetchSmsData}
            disabled={loading}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Odśwież
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID wiadomości
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Odbiorca
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Treść
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data utworzenia
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ładowanie...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : smsData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Nie znaleziono wiadomości SMS
                </td>
              </tr>
            ) : (
              smsData.map((sms) => (
                <tr key={sms._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sms.messageId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sms.recipient?.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {sms.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(sms.status)}`}>
                      {sms.status === "DELIVERED" && "Dostarczona"}
                      {sms.status === "PENDING" && "Oczekująca"}
                      {sms.status === "FAILED" && "Nieudana"}
                      {!["DELIVERED", "PENDING", "FAILED"].includes(sms.status) && sms.status}
                    </span>
                    {sms.status === "FAILED" && sms.error && (
                      <div className="mt-1 text-xs text-red-500 truncate max-w-[150px]" title={sms.error.message || "Nieznany błąd"}>
                        {sms.error.code ? `${sms.error.code}: ` : ""}{sms.error.message || "Nieznany błąd"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sms.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(sms)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Szczegóły
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && !error && smsData.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-700">
            Pokazano {smsData.length} z {pagination.total} wiadomości
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
      )}
      
      {/* No Data Message */}
      {!loading && !error && smsData.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">Brak danych do wyświetlenia</p>
          <p className="text-sm text-gray-400">Spróbuj zmienić filtry lub wyślij nowe wiadomości</p>
        </div>
      )}
      
      {/* SMS Details Modal */}
      {showDetails && selectedSms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Szczegóły wiadomości SMS
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ID wiadomości</p>
                  <p className="text-base text-gray-900">{selectedSms.messageId || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ID partii</p>
                  <p className="text-base text-gray-900">{selectedSms.batchId || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Odbiorca</p>
                  <p className="text-base text-gray-900">
                    {selectedSms.recipient?.phone || "N/A"}
                    {selectedSms.recipient?.userId && ` (ID: ${selectedSms.recipient.userId})`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <p className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedSms.status)}`}>
                      {selectedSms.status === "DELIVERED" && "Dostarczona"}
                      {selectedSms.status === "PENDING" && "Oczekująca"}
                      {selectedSms.status === "FAILED" && "Nieudana"}
                      {!["DELIVERED", "PENDING", "FAILED"].includes(selectedSms.status) && selectedSms.status}
                    </span>
                  </p>
                </div>
                
                {/* Error Information (for failed messages) */}
                {selectedSms.status === "FAILED" && selectedSms.error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700 mb-1">Informacje o błędzie</p>
                    {selectedSms.error.code && (
                      <p className="text-sm text-red-600 mb-1">
                        <span className="font-medium">Kod błędu:</span> {selectedSms.error.code}
                      </p>
                    )}
                    {selectedSms.error.message && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Komunikat:</span> {selectedSms.error.message}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Treść wiadomości</p>
                  <p className="text-base text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedSms.content}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Data utworzenia</p>
                    <p className="text-base text-gray-900">{formatDate(selectedSms.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Data wysłania</p>
                    <p className="text-base text-gray-900">{formatDate(selectedSms.sentAt)}</p>
                  </div>
                  
                  {selectedSms.status === "DELIVERED" ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Data dostarczenia</p>
                      <p className="text-base text-gray-900">{formatDate(selectedSms.deliveredAt)}</p>
                    </div>
                  ) : selectedSms.status === "FAILED" ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Data niepowodzenia</p>
                      <p className="text-base text-gray-900">{formatDate(selectedSms.failedAt)}</p>
                    </div>
                  ) : null}
                </div>
                
                {/* Provider Response (if available) */}
                {selectedSms.providerResponse && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Odpowiedź dostawcy SMS</p>
                    <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                      {typeof selectedSms.providerResponse === 'object'
                        ? JSON.stringify(selectedSms.providerResponse, null, 2)
                        : selectedSms.providerResponse}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsHistory; 