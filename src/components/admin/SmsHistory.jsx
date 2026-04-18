import { useState, useEffect } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const SmsHistory = () => {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  // State for SMS data
  const [smsData, setSmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bulk permanent delete – SMS history (admin only)
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
  const [showBulkDeleteHistoryModal, setShowBulkDeleteHistoryModal] = useState(false);
  const [bulkDeleteHistorySubmitting, setBulkDeleteHistorySubmitting] = useState(false);
  
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
        setError("Failed to load SMS history");
        setSmsData([]);
      }
    } catch (err) {
      console.error("Error fetching SMS data:", err);
      setError(err.message || "Error loading SMS history");
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

  // Bulk permanent delete – SMS history (admin only)
  const handleHistorySelect = (id) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleHistorySelectAll = () => {
    if (selectedHistoryIds.length === smsData.length) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(smsData.map((s) => s._id));
    }
  };
  const handleBulkDeleteHistoryConfirm = async () => {
    if (selectedHistoryIds.length === 0) return;
    setBulkDeleteHistorySubmitting(true);
    try {
      const response = await apiCaller("POST", "/sms-data/bulk-delete", {
        ids: selectedHistoryIds,
      });
      if (response.data?.success) {
        const count = response.data.deletedCount ?? selectedHistoryIds.length;
        toast.success(response.data.message || `Permanently deleted ${count} SMS history record(s)`);
        setShowBulkDeleteHistoryModal(false);
        setSelectedHistoryIds([]);
        await fetchSmsData();
      } else {
        toast.error(response.data?.message || "Failed to permanently delete history records");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error permanently deleting SMS history");
    } finally {
      setBulkDeleteHistorySubmitting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm:ss", { locale: enUS });
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
      'Message ID',
      'Phone number',
      'Recipient ID',
      'Content',
      'Status',
      'Error code',
      'Error description',
      'Created at',
      'Sent at',
      'Delivered / failed at'
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
        <h3 className="text-lg font-medium text-gray-800 mb-3">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          
          {/* Phone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Error Code Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Error code</label>
            <input
              type="text"
              value={filters.errorCode}
              onChange={(e) => handleFilterChange("errorCode", e.target.value)}
              placeholder="e.g. UNKNOWN, INVALID_PHONE"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Batch ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
            <input
              type="text"
              value={filters.batchId}
              onChange={(e) => handleFilterChange("batchId", e.target.value)}
              placeholder="Enter batch ID"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search in content</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Enter search phrase"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created at</option>
              <option value="sentAt">Sent at</option>
              <option value="deliveredAt">Delivered at</option>
              <option value="failedAt">Failed at</option>
              <option value="status">Status</option>
              <option value="error.code">Error code</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Apply filters
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Reset filters
          </button>
        </div>
      </div>
      
      {/* Refresh Button and Status */}
      <div className="flex justify-between items-center mb-4">
        <div>
          {loading && <span className="text-blue-500">Loading...</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {isAdmin && smsData.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBulkDeleteHistoryModal(true)}
              disabled={selectedHistoryIds.length === 0}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                selectedHistoryIds.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              }`}
            >
              Permanently delete selected ({selectedHistoryIds.length})
            </button>
          )}
          <button
            onClick={exportToCSV}
            disabled={loading || smsData.length === 0}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              loading || smsData.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
            title={smsData.length === 0 ? "No data to export" : "Export to CSV"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={fetchSmsData}
            disabled={loading}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {isAdmin && (
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={smsData.length > 0 && selectedHistoryIds.length === smsData.length}
                    onChange={handleHistorySelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message ID
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created at
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : smsData.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-4">
                  No SMS messages found
                </td>
              </tr>
            ) : (
              smsData.map((sms) => (
                <tr key={sms._id} className={selectedHistoryIds.includes(sms._id) ? "bg-red-50 hover:bg-red-50" : "hover:bg-gray-50"}>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedHistoryIds.includes(sms._id)}
                        onChange={() => handleHistorySelect(sms._id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                  )}
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
                      {sms.status === "DELIVERED" && "Delivered"}
                      {sms.status === "PENDING" && "Pending"}
                      {sms.status === "FAILED" && "Failed"}
                      {!["DELIVERED", "PENDING", "FAILED"].includes(sms.status) && sms.status}
                    </span>
                    {sms.status === "FAILED" && sms.error && (
                      <div className="mt-1 text-xs text-red-500 truncate max-w-[150px]" title={sms.error.message || "Unknown error"}>
                        {sms.error.code ? `${sms.error.code}: ` : ""}{sms.error.message || "Unknown error"}
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
                      Details
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
            Showing {smsData.length} of {pagination.total} messages
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
              Previous
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
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* No Data Message */}
      {!loading && !error && smsData.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">No data to display</p>
          <p className="text-sm text-gray-400">Try adjusting filters or send new messages</p>
        </div>
      )}
      
      {/* Bulk permanent delete – SMS history confirmation (admin only) */}
      {showBulkDeleteHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Permanently delete SMS history records
            </h3>
            <p className="text-gray-600 mb-4">
              This action is <strong>irreversible</strong>. The selected SMS history record(s) ({selectedHistoryIds.length}) will be permanently removed from the database and cannot be restored.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !bulkDeleteHistorySubmitting && setShowBulkDeleteHistoryModal(false)}
                disabled={bulkDeleteHistorySubmitting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteHistoryConfirm}
                disabled={bulkDeleteHistorySubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleteHistorySubmitting ? "Deleting..." : "Yes, delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Details Modal */}
      {showDetails && selectedSms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  SMS message details
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
                  <p className="text-sm font-medium text-gray-500 mb-1">Message ID</p>
                  <p className="text-base text-gray-900">{selectedSms.messageId || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Batch ID</p>
                  <p className="text-base text-gray-900">{selectedSms.batchId || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Recipient</p>
                  <p className="text-base text-gray-900">
                    {selectedSms.recipient?.phone || "N/A"}
                    {selectedSms.recipient?.userId && ` (ID: ${selectedSms.recipient.userId})`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <p className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedSms.status)}`}>
                      {selectedSms.status === "DELIVERED" && "Delivered"}
                      {selectedSms.status === "PENDING" && "Pending"}
                      {selectedSms.status === "FAILED" && "Failed"}
                      {!["DELIVERED", "PENDING", "FAILED"].includes(selectedSms.status) && selectedSms.status}
                    </span>
                  </p>
                </div>
                
                {/* Error Information (for failed messages) */}
                {selectedSms.status === "FAILED" && selectedSms.error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700 mb-1">Error details</p>
                    {selectedSms.error.code && (
                      <p className="text-sm text-red-600 mb-1">
                        <span className="font-medium">Error code:</span> {selectedSms.error.code}
                      </p>
                    )}
                    {selectedSms.error.message && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Message:</span> {selectedSms.error.message}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Message content</p>
                  <p className="text-base text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedSms.content}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Created at</p>
                    <p className="text-base text-gray-900">{formatDate(selectedSms.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sent at</p>
                    <p className="text-base text-gray-900">{formatDate(selectedSms.sentAt)}</p>
                  </div>
                  
                  {selectedSms.status === "DELIVERED" ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Delivered at</p>
                      <p className="text-base text-gray-900">{formatDate(selectedSms.deliveredAt)}</p>
                    </div>
                  ) : selectedSms.status === "FAILED" ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Failed at</p>
                      <p className="text-base text-gray-900">{formatDate(selectedSms.failedAt)}</p>
                    </div>
                  ) : null}
                </div>
                
                {/* Provider Response (if available) */}
                {selectedSms.providerResponse && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">SMS provider response</p>
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
                  Close
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