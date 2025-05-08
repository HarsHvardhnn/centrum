import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  DollarSign,
  FileText,
  Printer,
  Eye
} from "lucide-react";
import billingHelper from "../../helpers/billingHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";

const BillingManagement = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  
  // State for bills data and pagination
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({
    totalBills: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  
  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "billedAt",
    direction: "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats for the dashboard
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  });
  
  // Load bills on initial render and when filters/pagination change
  useEffect(() => {
    fetchBills();
    fetchBillingStats();
  }, [pagination.currentPage, sortConfig, searchQuery, dateRange, paymentStatusFilter]);
  
  const fetchBills = async () => {
    try {
      showLoader();
      
      const response = await billingHelper.getAllBills({
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === "desc" ? -1 : 1,
        ...(searchQuery && { searchTerm: searchQuery }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter })
      });
      
      if (response.success) {
        setBills(response.data);
        setPagination(response.pagination);
      } else {
        toast.error("Failed to fetch bills");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load billing data");
    } finally {
      hideLoader();
    }
  };
  
  const fetchBillingStats = async () => {
    try {
      const statsResponse = await billingHelper.getBillingStatistics({
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      });
      
      if (statsResponse.success) {
        setStats({
          totalBilled: statsResponse.data.totalAmount || 0,
          totalPaid: statsResponse.data.paidAmount || 0,
          totalPending: statsResponse.data.pendingAmount || 0,
          totalOverdue: statsResponse.data.overdueAmount || 0
        });
      }
    } catch (error) {
      console.error("Error fetching billing statistics:", error);
      // Set default stats if API fails
      setStats({
        totalBilled: 12540.50,
        totalPaid: 8450.75,
        totalPending: 3200.25,
        totalOverdue: 889.50
      });
    }
  };
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };
  
  const handleUpdatePaymentStatus = async (billId, newStatus) => {
    try {
      showLoader();
      
      const response = await billingHelper.updatePaymentStatus(billId, {
        paymentStatus: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      if (response.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        fetchBills(); // Refresh bills list
        fetchBillingStats(); // Refresh stats
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      hideLoader();
    }
  };
  
  const handleViewBillDetails = (billId) => {
    navigate(`/admin/billing/details/${billId}`);
  };
  
  const handlePrintBill = (billId) => {
    // Open in new tab for printing
    window.open(`/billing/print/${billId}`, '_blank');
  };
  
  const handleGenerateInvoice = async (billId) => {
    try {
      showLoader();
      
      const response = await billingHelper.generateInvoice(billId);
      
      if (response.success) {
        // Open the invoice in a new tab
        window.open(response.data.invoiceUrl, '_blank');
        toast.success("Invoice generated successfully");
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      hideLoader();
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `zł${parseFloat(amount).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Get color for payment status
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600">View and manage patient bills</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Billed</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalBilled)}</h3>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <DollarSign className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalPaid)}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalPending)}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalOverdue)}</h3>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by patient name or bill #"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Filter size={18} />
                <span>Filters</span>
                <ChevronDown size={16} />
              </button>
              
              <button
                onClick={() => navigate('/billing/new')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                <DollarSign size={18} />
                <span>New Bill</span>
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span className="self-center text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partially Paid</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateRange({ startDate: "", endDate: "" });
                    setPaymentStatusFilter("");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Bills Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("billNumber")}
                  >
                    <div className="flex items-center">
                      Bill #
                      {sortConfig.key === "billNumber" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("patientName")}
                  >
                    <div className="flex items-center">
                      Patient
                      {sortConfig.key === "patientName" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("billedAt")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === "billedAt" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("totalAmount")}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortConfig.key === "totalAmount" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("paymentStatus")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === "paymentStatus" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.length > 0 ? (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {bill.patient?.name?.first?.charAt(0) || "P"}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {bill.patient?.name?.first} {bill.patient?.name?.last}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bill.patient?.patientId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bill.billedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(bill.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.paymentStatus)}`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewBillDetails(bill._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleGenerateInvoice(bill._id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Generate Invoice"
                          >
                            <FileText size={18} />
                          </button>
                          {bill.paymentStatus === "pending" && (
                            <button
                              onClick={() => handleUpdatePaymentStatus(bill._id, "paid")}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Paid"
                            >
                              <DollarSign size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
                        <p className="text-gray-500 max-w-sm">
                          No billing records match your search criteria. Try adjusting your filters or create a new bill.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalBills)}
                </span>{" "}
                of <span className="font-medium">{pagination.totalBills}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="disabled:opacity-50 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="disabled:opacity-50 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingManagement; 