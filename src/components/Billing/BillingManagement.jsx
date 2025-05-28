import React, { useState, useEffect, useCallback } from "react";
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
  Eye,
  Edit,
  X,
  Plus,
  Minus,
  Save,
  Loader
} from "lucide-react";
import billingHelper from "../../helpers/billingHelper";
import { toast } from "sonner";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";
import { useUser } from "../../context/userContext";
import { useServices } from "../../context/serviceContext";

// Simple Loader Component
const LoaderOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded-lg flex items-center gap-2">
      <Loader className="animate-spin" size={24} />
      <span>Ładowanie...</span>
    </div>
  </div>
);

const BillingManagement = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { services } = useServices();
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [billToUpdate, setBillToUpdate] = useState(null);
  
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
  
  // Add EditBillModal component
  const EditBillModal = ({ isOpen, onClose, billId, onUpdate }) => {
    const { services } = useServices();
    const [modalLoading, setModalLoading] = useState(false);
    const [billData, setBillData] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [consultationCharges, setConsultationCharges] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [additionalCharges, setAdditionalCharges] = useState(0);
    const [additionalChargeNote, setAdditionalChargeNote] = useState("");
    const [taxPercentage, setTaxPercentage] = useState(5);

    // Fetch bill details only once when modal opens
    useEffect(() => {
      let isMounted = true;

      const fetchData = async () => {
        if (!isOpen || !billId || modalLoading) return;

        try {
          setModalLoading(true);
          const response = await billingHelper.getBillDetails(billId);
          
          if (!isMounted) return;
          
          if (response.success) {
            setBillData(response.data);
            // Transform services data to match the required format
            const transformedServices = response.data.services.map(service => ({
              serviceId: service.serviceId._id || service.serviceId,
              title: service.title,
              price: service.price,
              status: service.status
            }));
            setSelectedServices(transformedServices);
            console.log("consulatioonchrges ;", response.data.consultationCharges)
            setConsultationCharges(response.data.consultationCharges || 0);
            setDiscount(response.data.discount || 0);
            setAdditionalCharges(response.data.additionalCharges || 0);
            setAdditionalChargeNote(response.data.additionalChargeNote || "");
            setTaxPercentage(response.data.taxPercentage || 5);
          } else {
            toast.error("Nie udało się pobrać szczegółów faktury");
          }
        } catch (error) {
          console.error("Error fetching bill details:", error);
          if (isMounted) {
            toast.error("Nie udało się pobrać szczegółów faktury");
          }
        } finally {
          if (isMounted) {
            setModalLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [billId, isOpen]);

    const handleServiceToggle = (service) => {
      const exists = selectedServices.find(s => s.serviceId === service._id);
      if (exists) {
        // If service exists, don't add it again
        return;
      }
      setSelectedServices([...selectedServices, {
        serviceId: service._id,
        title: service.title,
        price: service.price,
        status: "active"
      }]);
    };

    const handleRemoveService = (serviceId) => {
      setSelectedServices(selectedServices.filter(s => s.serviceId !== serviceId));
    };

    const calculateSubtotal = () => {
      const servicesTotal = selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0);
      return servicesTotal;
    };

    const calculateTotal = () => {
      const subtotal = calculateSubtotal();
      const taxAmount = (subtotal * taxPercentage) / 100;
      return subtotal + taxAmount + parseFloat(additionalCharges) - parseFloat(discount)  + parseFloat(consultationCharges);
    };

    const handleSave = useCallback(async () => {
      try {
        setModalLoading(true);
        const updateData = {
          services: selectedServices,
          consultationCharges: parseFloat(consultationCharges),
          subtotal: calculateSubtotal(),
          taxPercentage,
          taxAmount: (calculateSubtotal() * taxPercentage) / 100,
          discount: parseFloat(discount),
          additionalCharges: parseFloat(additionalCharges),
          additionalChargeNote,
          totalAmount: calculateTotal().toString(),
          paymentMethod: billData.paymentMethod,
          paymentStatus: billData.paymentStatus,
          notes: billData.notes
        };

        const response = await billingHelper.updateBill(billId, updateData);
        if (response.success) {
          toast.success("Faktura została zaktualizowana");
          onUpdate();
          onClose();
        } else {
          toast.error("Nie udało się zaktualizować faktury");
        }
      } catch (error) {
        console.error("Error updating bill:", error);
        toast.error("Nie udało się zaktualizować faktury");
      } finally {
        setModalLoading(false);
      }
    }, [billId, selectedServices, consultationCharges, taxPercentage, discount, additionalCharges, additionalChargeNote, billData]);

    if (!isOpen || !billData) return null;

    const filteredServices = searchTerm
      ? services.filter(service => service.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : services;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {modalLoading && <LoaderOverlay />}
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-medium">Edytuj fakturę</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Selected Services Section */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Wybrane usługi</h4>
              <div className="space-y-2 mb-4">
                {selectedServices.map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                  >
                    <div>
                      <span className="font-medium">{service.title}</span>
                      <span className="ml-4">{service.price} zł</span>
                    </div>
                    <button
                      onClick={() => handleRemoveService(service.serviceId)}
                      className="text-red-600 hover:text-red-800"
                      title="Usuń usługę"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                {selectedServices.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Brak wybranych usług</p>
                )}
              </div>

              {/* Available Services Section */}
              <h4 className="font-medium mb-2">Dodaj usługi</h4>
              <input
                type="text"
                placeholder="Szukaj usług..."
                className="w-full px-3 py-2 border rounded-lg mb-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services
                  .filter(service => 
                    service.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !selectedServices.some(s => s.serviceId === service._id)
                  )
                  .map(service => (
                    <div
                      key={service._id}
                      onClick={() => handleServiceToggle(service)}
                      className="p-3 rounded-lg cursor-pointer border border-gray-200 hover:border-teal-500 hover:bg-teal-50"
                    >
                      <div className="flex justify-between">
                        <span>{service.title}</span>
                        <span className="font-medium">{service.price} zł</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Charges Section */}
            <div className="mb-6">
              <h4 className="font-medium mb-4">Opłaty i zniżki</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opłata za konsultację (zł)
                  </label>
                  <input
                    type="number"
                    value={consultationCharges}
                    onChange={(e) => setConsultationCharges(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zniżka (zł)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dodatkowe opłaty (zł)
                  </label>
                  <input
                    type="number"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notatka do dodatkowych opłat
                  </label>
                  <input
                    type="text"
                    value={additionalChargeNote}
                    onChange={(e) => setAdditionalChargeNote(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Np. dodatkowe materiały"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Podatek VAT (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Podsumowanie</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Suma usług</span>
                  <span>{selectedServices.reduce((sum, service) => sum + Number(service.price), 0)} zł</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Suma częściowa</span>
                  <span>
                    {(selectedServices.reduce((sum, service) => sum + Number(service.price), 0)).toFixed(2)} zł
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Podatek ({taxPercentage}%)</span>
                  <span>
                    {((selectedServices.reduce((sum, service) => sum + Number(service.price), 0) * taxPercentage) / 100).toFixed(2)} zł
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Opłata za konsultację</span>
                  <span>{consultationCharges} zł</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Dodatkowe opłaty</span>
                  <span>{additionalCharges} zł</span>
                </div>
                {Number(discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Zniżka</span>
                    <span className="text-red-600">-{discount} zł</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t mt-2">
                  <span>Suma całkowita</span>
                  <span>
                    {(
                      selectedServices.reduce((sum, service) => sum + Number(service.price), 0) + // Services subtotal
                      ((selectedServices.reduce((sum, service) => sum + Number(service.price), 0) * taxPercentage) / 100) + // Tax amount
                      Number(consultationCharges) + // Consultation fee
                      Number(additionalCharges) // Additional charges
                    ).toFixed(2)} zł
                  </span>
                </div>
              </div>
            </div>

            {/* Add a debug section to verify calculations */}
            <div className="mt-4 text-xs text-gray-500">
              <div>Subtotal: {selectedServices.reduce((sum, service) => sum + Number(service.price), 0)} zł</div>
              <div>Tax ({taxPercentage}%): {((selectedServices.reduce((sum, service) => sum + Number(service.price), 0) * taxPercentage) / 100).toFixed(2)} zł</div>
              <div>Consultation: {consultationCharges} zł</div>
              <div>Additional: {additionalCharges} zł</div>
              <div>Discount: {discount} zł</div>
            </div>
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Save size={18} />
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  // Add handleEditBill function
  const handleEditBill = (billId) => {
    setSelectedBillId(billId);
    setIsEditModalOpen(true);
  };
  
  // Load bills on initial render and when filters/pagination change
  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await billingHelper.getAllBills({
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === "desc" ? -1 : 1,
        ...(searchQuery && { search: searchQuery }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
      });
      
      if (response.success) {
        setBills(response.data);
        setPagination(response.pagination);
      } else {
        toast.error("Nie udało się pobrać faktur");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania faktur:", error);
      toast.error("Nie udało się załadować danych rozliczeniowych");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sortConfig, searchQuery, dateRange, paymentStatusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);
  
  // Separate useEffect for billing stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all bills for calculation (without pagination)
        const response = await billingHelper.getAllBills({
          limit: 1000, // Get a large number of bills to ensure we get all
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate })
        });
        
        if (response.success && response.data) {
          let totalBilled = 0;
          let totalPaid = 0;
          let totalPending = 0;
          let totalOverdue = 0;

          response.data.forEach(bill => {
            const amount = parseFloat(bill.totalAmount);
            
            // Add to total billed
            totalBilled += amount;
            
            // Add to appropriate category based on payment status
            switch(bill.paymentStatus.toLowerCase()) {
              case 'paid':
                totalPaid += amount;
                break;
              case 'pending':
                totalPending += amount;
                break;
              case 'overdue':
                totalOverdue += amount;
                break;
              case 'partial':
                // For partially paid bills, you might need more data from the API
                // This is a simplified approach
                totalPaid += amount * 0.5; // Assuming 50% paid
                totalPending += amount * 0.5; // Assuming 50% pending
                break;
              default:
                break;
            }
          });
          
          setStats({
            totalBilled,
            totalPaid,
            totalPending,
            totalOverdue
          });
        }
      } catch (error) {
        console.error("Error calculating billing stats:", error);
        setStats({
          totalBilled: 0,
          totalPaid: 0,
          totalPending: 0,
          totalOverdue: 0
        });
      }
    };

    fetchStats();
  }, [dateRange.startDate, dateRange.endDate]); // Only depend on date range for stats
  
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
  
  // Add ConfirmationModal component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, bill }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź zmianę statusu płatności
            </h3>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz oznaczyć fakturę nr {bill?._id} jako opłaconą?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update handleUpdatePaymentStatus to use confirmation modal
  const handleUpdatePaymentStatus = async (billId, newStatus) => {
    if (newStatus === "paid") {
      const bill = bills.find(b => b._id === billId);
      setBillToUpdate(bill);
      setIsConfirmModalOpen(true);
      return;
    }

    await updatePaymentStatus(billId, newStatus);
    window.location.reload();
  };

  // Add new function to handle the actual update
  const updatePaymentStatus = async (billId, newStatus) => {
    try {
      setIsLoading(true);
      
      const response = await billingHelper.updatePaymentStatus(billId, {
        paymentStatus: newStatus,
        notes: `Status zaktualizowany na ${newStatus}`
      });
      
      if (response.success) {
        toast.success(`Status płatności zaktualizowany na ${newStatus}`);
        fetchBills(); // Refresh bills list
      } else {
        toast.error("Nie udało się zaktualizować statusu płatności");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu płatności:", error);
      toast.error("Nie udało się zaktualizować statusu płatności");
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      
      const response = await billingHelper.generateInvoice(billId);
      
      if (response.success) {
        // Open the invoice in a new tab
        window.open(response.data.invoiceUrl, '_blank');
        toast.success("Pomyślnie wygenerowano fakturę");
      } else {
        toast.error("Nie udało się wygenerować faktury");
      }
    } catch (error) {
      console.error("Błąd podczas generowania faktury:", error);
      toast.error("Nie udało się wygenerować faktury");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} zł`;
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

  // Polish translation for payment status
  const translatePaymentStatus = (status) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'Opłacone';
      case 'pending':
        return 'Oczekujące';
      case 'overdue':
        return 'Zaległe';
      case 'partial':
        return 'Częściowo opłacone';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isLoading && <LoaderOverlay />}
      
      {/* Add ConfirmationModal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setBillToUpdate(null);
        }}
        onConfirm={() => {
          updatePaymentStatus(billToUpdate._id, "paid");
          setIsConfirmModalOpen(false);
          setBillToUpdate(null);
        }}
        bill={billToUpdate}
      />

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Zarządzanie Fakturami</h1>
          <p className="text-gray-600">Przeglądaj i zarządzaj fakturami pacjentów</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Suma faktur</p>
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
                <p className="text-sm text-gray-500">Opłacone</p>
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
                <p className="text-sm text-gray-500">Oczekujące</p>
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
                <p className="text-sm text-gray-500">Zaległe</p>
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
                placeholder="Szukaj po nazwisku pacjenta lub nr faktury"
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
                <span>Filtry</span>
                <ChevronDown size={16} />
              </button>
              {/*               
              <button
                onClick={() => navigate('/billing/new')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                <DollarSign size={18} />
                <span>New Bill</span>
              </button> */}
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zakres dat</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <span className="self-center text-gray-500">do</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status płatności</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Wszystkie statusy</option>
                  <option value="paid">Opłacone</option>
                  <option value="pending">Oczekujące</option>
                  <option value="overdue">Zaległe</option>
                  <option value="partial">Częściowo opłacone</option>
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
                  Wyczyść filtry
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
                  {/* <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("billNumber")}
                  >
                    <div className="flex items-center">
                      Nr faktury
                      {sortConfig.key === "billNumber" && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th> */}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("billNumber")}
                  >
                    <div className="flex items-center">
                    numer faktury
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
                      Pacjent
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
                      Data
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
                      Kwota
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
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.length > 0 ? (
                  bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50">
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill?._id}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill?.invoiceId ? bill?.invoiceId : "N/A"}
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
                          {translatePaymentStatus(bill.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewBillDetails(bill._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Zobacz szczegóły"
                          >
                            <Eye size={18} />
                          </button>
                          {
                            bill.paymentStatus == "paid" && (
                              <button
                            onClick={() => handleGenerateInvoice(bill._id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Generuj fakturę"
                          >
                            <FileText size={18} />
                          </button>)
                          }
                          {bill.paymentStatus !== "paid" && (
                            <>
                              <button
                                onClick={() => handleEditBill(bill._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edytuj fakturę"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatus(bill._id, "paid")}
                                className="text-green-600 hover:text-green-900"
                                title="Oznacz jako opłacone"
                              >
                                <DollarSign size={18} />
                              </button>
                            </>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nie znaleziono faktur</h3>
                        <p className="text-gray-500 max-w-sm">
                          Brak faktur spełniających kryteria wyszukiwania. Spróbuj dostosować filtry lub utwórz nową fakturę.
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
                Wyświetlanie <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> do{" "}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalBills)}
                </span>{" "}
                z <span className="font-medium">{pagination.totalBills}</span> wyników
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

      {/* EditBillModal */}
      {isEditModalOpen && (
        <EditBillModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          billId={selectedBillId}
          onUpdate={fetchBills}
        />
      )}
    </div>
  );
};

export default BillingManagement; 