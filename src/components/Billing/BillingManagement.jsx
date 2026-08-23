import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
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
  Loader,
  Trash2
} from "lucide-react";
import billingHelper from "../../helpers/billingHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { toast } from "sonner";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";
import { useUser } from "../../context/userContext";
import { useServices } from "../../context/serviceContext";
import BulkDeleteByIdsDialog from "../admin/BulkDeleteByIdsDialog";
import PermanentDeleteDialog from "../admin/PermanentDeleteDialog";
import PatientSettlementModal from "./PatientSettlementModal";
import GenerateBillModal from "./GenerateBillModal";
import userServiceHelper, {
  mapDoctorServicesResponseToCatalog,
  mapServicesResponseToCatalog,
} from "../../helpers/userServiceHelper";
import { queryKeys } from "../../lib/queryKeys";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { readListState, writeListState, useSkipFirstEffect, useListScrollRestore } from "../../hooks/usePersistedListState";

function toDateInputValue(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isUnpaidBill(bill) {
  return bill?.paymentStatus && bill.paymentStatus !== "paid";
}

/** Id for GET /user-services/:userId/doctor — from embedded appointment on bill or visit object. */
function resolveVisitDoctorUserId(appointment, bill) {
  const apt = bill?.appointment ?? appointment;
  if (!apt) return null;
  const doc = apt.doctor ?? apt.doctorId;
  if (!doc) return null;
  if (typeof doc === "string") return doc;
  return doc._id || doc.id || doc.userId || doc.user_id || null;
}

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
  const location = useLocation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const isBillingStaff =
    user?.role === "admin" || user?.role === "receptionist";
  const isDoctorViewOnly = user?.role === "doctor";
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract appointmentId and step from query parameters if present
  const queryParams = new URLSearchParams(location.search);
  const appointmentId = queryParams.get('appointment');
  const step = queryParams.get('step');

  console.log("appointment id ", appointmentId, "step", step)

  const getReturnPathAfterAppointmentRedirect = () => {
    const doctorId = user?.d_id || user?.id || "";
    if (user?.role === "doctor" && doctorId) {
      return `/lekarze/wizyty/${doctorId}`;
    }
    return "/lekarze";
  };
  
  // Add state for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [billToUpdate, setBillToUpdate] = useState(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [bulkPayMode, setBulkPayMode] = useState(null);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    ids: []
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null
  });
  
  // State for bills data and pagination
  const savedBilling = readListState("admin-billing") || {};
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({
    totalBills: 0,
    totalPages: 0,
    currentPage: Number(savedBilling.currentPage) > 0 ? Number(savedBilling.currentPage) : 1,
    limit: Number(savedBilling.limit) > 0 ? Number(savedBilling.limit) : 10
  });
  
  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState(savedBilling.searchQuery || "");
  const [dateRange, setDateRange] = useState({
    startDate: savedBilling.dateRange?.startDate || "",
    endDate: savedBilling.dateRange?.endDate || ""
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(savedBilling.paymentStatusFilter || "");
  const [sortConfig, setSortConfig] = useState({
    key: savedBilling.sortConfig?.key || "billedAt",
    direction: savedBilling.sortConfig?.direction || "desc"
  });
  const [showFilters, setShowFilters] = useState(false);
  const skipBillingPageReset = useSkipFirstEffect();
  
  // Stats for the dashboard
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  });
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  
  // Add EditBillModal component
  const EditBillModal = ({ isOpen, onClose, billId, onUpdate, isRedirectedFromAppointment }) => {
    const { services: globalServices, loading: globalServicesLoading } = useServices();
    const [modalLoading, setModalLoading] = useState(false);
    const [billData, setBillData] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [catalogServices, setCatalogServices] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [consultationCharges, setConsultationCharges] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [additionalCharges, setAdditionalCharges] = useState(0);
    const [additionalChargeNote, setAdditionalChargeNote] = useState("");
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");

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
            //("consulatioonchrges ;", response.data.consultationCharges)
            setConsultationCharges(response.data.consultationCharges || 0);
            setDiscount(response.data.discount || 0);
            setAdditionalCharges(response.data.additionalCharges || 0);
            setAdditionalChargeNote(response.data.additionalChargeNote || "");
            setTaxPercentage(response.data.taxPercentage ?? 0);
            setInvoiceNumber(response.data.invoiceId || "");
            setInvoiceDate(toDateInputValue(response.data.billedAt));
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

    const visitDoctorId = billData ? resolveVisitDoctorUserId(null, billData) : null;
    
    // Role-based service filtering: admin sees all services, doctors see only their services
    const shouldUseAllServices = user?.role === "admin";
    const pickerServices = shouldUseAllServices ? globalServices : (visitDoctorId ? catalogServices : globalServices);
    const pickerLoading = shouldUseAllServices ? globalServicesLoading : (visitDoctorId ? catalogLoading : globalServicesLoading);

    useEffect(() => {
      if (!isOpen || !billData) {
        setCatalogServices([]);
        return;
      }
      
      // If admin user, skip loading doctor-specific services (use global services)
      if (user?.role === "admin") {
        setCatalogServices([]);
        return;
      }
      
      const doctorUserId = resolveVisitDoctorUserId(null, billData);
      if (!doctorUserId) {
        setCatalogServices([]);
        return;
      }
      let cancelled = false;
      (async () => {
        setCatalogLoading(true);
        try {
          const res = await userServiceHelper.getServicesCatalog(doctorUserId);
          if (!cancelled) {
            setCatalogServices(mapServicesResponseToCatalog(res));
          }
        } catch (e) {
          console.error("EditBillModal getDoctorServices:", e);
          if (!cancelled) {
            setCatalogServices([]);
            toast.error("Nie udało się załadować usług lekarza z wizyty");
          }
        } finally {
          if (!cancelled) setCatalogLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [isOpen, billData, user?.role]);

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
        const canEditInvoiceMeta = user?.role === "admin" || user?.role === "receptionist";
        const updateData = {
          services: selectedServices,
          consultationCharges: parseFloat(consultationCharges),
          subtotal: calculateSubtotal(),
          taxPercentage: canEditInvoiceMeta ? taxPercentage : (billData.taxPercentage ?? 0),
          taxAmount: canEditInvoiceMeta
            ? (calculateSubtotal() * taxPercentage) / 100
            : billData.taxAmount ?? 0,
          discount: parseFloat(discount),
          additionalCharges: parseFloat(additionalCharges),
          additionalChargeNote,
          totalAmount: calculateTotal().toString(),
          paymentMethod: billData.paymentMethod,
          paymentStatus: billData.paymentStatus,
          notes: billData.notes,
        };
        if (canEditInvoiceMeta) {
          updateData.invoiceId = invoiceNumber.trim();
          updateData.billedAt = invoiceDate || undefined;
        }

        const response = await billingHelper.updateBill(billId, updateData);
        if (response.success) {
          toast.success("Faktura została zaktualizowana");
          onUpdate();
          onClose();
          
          // If user was redirected from appointment, redirect back to patients page
          if (isRedirectedFromAppointment) {
            navigate(getReturnPathAfterAppointmentRedirect());
          }
        } else {
          toast.error("Nie udało się zaktualizować faktury");
        }
      } catch (error) {
        console.error("Error updating bill:", error);
        toast.error("Nie udało się zaktualizować faktury");
      } finally {
        setModalLoading(false);
      }
    }, [billId, selectedServices, consultationCharges, taxPercentage, discount, additionalCharges, additionalChargeNote, billData, invoiceNumber, invoiceDate, user?.role]);

    if (!isOpen || !billData) return null;

    const showAdminInvoiceFields = user?.role === "admin" || user?.role === "receptionist";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {modalLoading && <LoaderOverlay />}
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center border-b p-4">
            <div>
              <h3 className="text-lg font-medium">Edytuj fakturę</h3>
              {showAdminInvoiceFields ? (
                <p className="text-sm text-gray-500">Możesz zmienić numer faktury i datę wystawienia także dla opłaconych faktur.</p>
              ) : (
                <p className="text-sm text-gray-500">Możesz edytować usługi, dodatkowe opłaty i rabat.</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {showAdminInvoiceFields && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50 border border-teal-100 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer faktury
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  placeholder="np. 17/08/2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data wystawienia
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
            </div>
            )}

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
              <h4 className="font-medium mb-2">
                Dodaj usługi
                {user?.role === "admin" ? (
                  <span className="block text-xs font-normal text-gray-500 mt-1">
                    Wszystkie dostępne usługi (admin)
                  </span>
                ) : visitDoctorId ? (
                  <span className="block text-xs font-normal text-gray-500 mt-1">
                    Tylko usługi lekarza z wizyty (GET /user-services/…/doctor)
                  </span>
                ) : null}
              </h4>
              <input
                type="text"
                placeholder="Szukaj usług..."
                className="w-full px-3 py-2 border rounded-lg mb-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {pickerLoading ? (
                <div className="py-8 flex justify-center text-gray-500 text-sm">
                  Ładowanie katalogu usług…
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pickerServices
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
              )}
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

                {showAdminInvoiceFields && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Podatek VAT (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      min="0"
                      max="100"
                      step="1"
                    />
                    {taxPercentage === 0 && (
                      <span className="absolute right-3 top-2 text-sm text-gray-500 bg-white px-1">
                        ZW
                      </span>
                    )}
                  </div>
                </div>
                )}
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
                  <span>Podatek ({taxPercentage}%{taxPercentage === 0 ? ' ZW' : ''})</span>
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
            {/* <div className="mt-4 text-xs text-gray-500">
              <div>Subtotal: {selectedServices.reduce((sum, service) => sum + Number(service.price), 0)} zł</div>
              <div>Tax ({taxPercentage}%): {((selectedServices.reduce((sum, service) => sum + Number(service.price), 0) * taxPercentage) / 100).toFixed(2)} zł</div>
              <div>Consultation: {consultationCharges} zł</div>
              <div>Additional: {additionalCharges} zł</div>
              <div>Discount: {discount} zł</div>
            </div> */}
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
  const [isRedirectedFromAppointment, setIsRedirectedFromAppointment] = useState(false);
  
  // Add state for generate bill modal
  const [isGenerateBillModalOpen, setIsGenerateBillModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  // Ensure modals are closed on component mount
  useEffect(() => {
    setIsEditModalOpen(false);
    setIsGenerateBillModalOpen(false);
    setSelectedBillId(null);
    setIsRedirectedFromAppointment(false);
  }, []);


  const prefetchSettlementBill = useCallback(
    (id) => {
      if (!id) return;
      if (user?.role !== "admin" && user?.role !== "receptionist") return;
      queryClient.prefetchQuery({
        queryKey: queryKeys.billDetail(id, "settlement"),
        queryFn: () => billingHelper.getBillDetails(id, { scope: "settlement" }),
        staleTime: 60_000,
      });
    },
    [queryClient, user?.role]
  );

  const handleEditBill = (billId) => {
    if (!isBillingStaff) {
      navigate(`/administracja/rozliczenia/szczegoly/${billId}`);
      return;
    }
    prefetchSettlementBill(billId);
    setSelectedBillId(billId);
    setIsEditModalOpen(true);
  };

  // Handle edit modal close with redirect logic
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedBillId(null);
    setIsRedirectedFromAppointment(false);
    
    // If user was redirected from appointment, redirect back to patients page
    if (isRedirectedFromAppointment) {
      navigate(getReturnPathAfterAppointmentRedirect());
    }
  };

  // Handle generate bill modal close
  const handleGenerateBillModalClose = () => {
    setIsGenerateBillModalOpen(false);
    setIsRedirectedFromAppointment(false);
    
    // If user was redirected from appointment, redirect back to patients page
    if (isRedirectedFromAppointment) {
      navigate(getReturnPathAfterAppointmentRedirect());
    }
  };

  // Handle bill generated successfully
  const handleBillGenerated = () => {
    // Refresh the bills list
    fetchBills();
    setStatsRefreshKey((prev) => prev + 1);
    setIsGenerateBillModalOpen(false);
    
    // If user was redirected from appointment, redirect back to patients page
    if (isRedirectedFromAppointment) {
      navigate(getReturnPathAfterAppointmentRedirect());
    }
  };
  
  // Load bills on initial render and when filters/pagination change
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  const billingListParams = {
    page: pagination.currentPage,
    limit: pagination.limit,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction === "desc" ? -1 : 1,
    search: debouncedSearchQuery || undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    paymentStatus: paymentStatusFilter || undefined,
    appointmentId: appointmentId || undefined,
  };

  const {
    data: billsQueryData,
    isLoading: billsQueryLoading,
    isFetching: billsQueryFetching,
    error: billsQueryError,
  } = useQuery({
    queryKey: queryKeys.billingList(billingListParams),
    queryFn: () => billingHelper.getAllBills(billingListParams),
    placeholderData: keepPreviousData,
  });

  const {
    data: statsQueryData,
  } = useQuery({
    queryKey: queryKeys.billingSummary({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
      appointmentId: appointmentId || undefined,
      statsRefreshKey,
    }),
    queryFn: () =>
      billingHelper.getBillingStatistics({
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(appointmentId && { appointmentId }),
      }),
  });

  useEffect(() => {
    if (!billsQueryData) return;
    if (billsQueryData.success) {
      setBills(billsQueryData.data);
      setPagination((prev) => ({
        ...prev,
        ...billsQueryData.pagination,
        currentPage: billsQueryData.pagination?.currentPage ?? prev.currentPage,
        limit: billsQueryData.pagination?.limit ?? prev.limit,
      }));
    } else {
      toast.error("Nie udało się pobrać faktur");
    }
  }, [billsQueryData]);

  useEffect(() => {
    if (billsQueryError) {
      console.error("Błąd podczas pobierania faktur:", billsQueryError);
      toast.error("Nie udało się załadować danych rozliczeniowych");
    }
  }, [billsQueryError]);

  useEffect(() => {
    const data = statsQueryData?.data;
    if (!data) return;
    setStats({
      totalBilled: Number(data.totalBilled ?? data.totalRevenue ?? 0) || 0,
      totalPaid: Number(data.totalPaid ?? 0) || 0,
      totalPending: Number(data.totalPending ?? 0) || 0,
      totalOverdue: Number(data.totalOverdue ?? 0) || 0,
    });
  }, [statsQueryData]);

  useEffect(() => {
    if (skipBillingPageReset()) return;
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearchQuery, dateRange.startDate, dateRange.endDate, paymentStatusFilter]);

  useEffect(() => {
    writeListState("admin-billing", {
      searchQuery,
      dateRange,
      paymentStatusFilter,
      sortConfig,
      currentPage: pagination.currentPage,
      limit: pagination.limit,
    });
  }, [
    searchQuery,
    dateRange,
    paymentStatusFilter,
    sortConfig,
    pagination.currentPage,
    pagination.limit,
  ]);

  useListScrollRestore("admin-billing", !billsQueryLoading);

  const tableLoading = billsQueryLoading || (billsQueryFetching && bills.length === 0);

  const fetchBills = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["billing-list"] });
    queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
  }, [queryClient]);

  // Handle automatic edit modal opening when redirected from appointment
  useEffect(() => {
    if (step === 'edit' && appointmentId) {
      console.log("Checking for bill with appointmentId:", appointmentId);
      console.log("Available bills:", bills);
      
      // Find the bill for this specific appointment
      const billForAppointment = bills.find(bill => 
        bill.appointmentId === appointmentId || 
        bill.appointment?._id === appointmentId ||
        bill.appointment?.id === appointmentId
      );
      
      console.log("Found bill for appointment:", billForAppointment);
      
      if (billForAppointment) {
        if (isDoctorViewOnly) {
          navigate(`/administracja/rozliczenia/szczegoly/${billForAppointment._id}`);
          return;
        }
        // Bill exists for this appointment - show edit modal
        console.log("Showing edit modal for bill:", billForAppointment._id);
        setSelectedBillId(billForAppointment._id);
        setIsEditModalOpen(true);
        setIsRedirectedFromAppointment(true);
        // Ensure generate modal is closed
        setIsGenerateBillModalOpen(false);
      } else {
        if (isDoctorViewOnly) {
          navigate(getReturnPathAfterAppointmentRedirect());
          return;
        }
        // No bill found for this appointment - show generate bill modal
        console.log("No bill found, showing generate modal");
        setIsGenerateBillModalOpen(true);
        setIsRedirectedFromAppointment(true);
        // Ensure edit modal is closed
        setIsEditModalOpen(false);
        setSelectedBillId(null);
      }
    }
  }, [step, appointmentId, bills, isDoctorViewOnly, navigate]);
  
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
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, bill, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź zmianę statusu płatności
            </h3>
            <p className="text-gray-600 mb-6">
              {message || `Czy na pewno chcesz oznaczyć fakturę ${bill?.invoiceId || bill?._id} jako opłaconą?`}
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

  const canSelectBills = isBillingStaff;
  const pendingBillsOnPage = bills.filter(isUnpaidBill);
  const pendingIdsOnPage = pendingBillsOnPage.map((bill) => bill._id);
  const allPendingOnPageSelected =
    pendingIdsOnPage.length > 0 &&
    pendingIdsOnPage.every((id) => selectedInvoiceIds.includes(id));
  const selectedUnpaidCount = selectedInvoiceIds.filter((id) =>
    bills.some((bill) => bill._id === id && isUnpaidBill(bill))
  ).length;

  // Update handleUpdatePaymentStatus to use confirmation modal
  const handleUpdatePaymentStatus = async (billId, newStatus) => {
    if (newStatus === "paid") {
      const bill = bills.find(b => b._id === billId);
      setBillToUpdate(bill);
      setBulkPayMode(null);
      setIsConfirmModalOpen(true);
      return;
    }

    await updatePaymentStatus(billId, newStatus);
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
        setStatsRefreshKey((prev) => prev + 1);
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
    navigate(`/administracja/rozliczenia/szczegoly/${billId}`);
  };

  // Multi-select handlers for invoices
  const handleSelectInvoice = (invoiceId) => {
    if (!canSelectBills) return;
    setSelectedInvoiceIds(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAllPendingOnPage = () => {
    if (!canSelectBills) return;
    if (allPendingOnPageSelected) {
      setSelectedInvoiceIds((prev) => prev.filter((id) => !pendingIdsOnPage.includes(id)));
    } else {
      setSelectedInvoiceIds((prev) => Array.from(new Set([...prev, ...pendingIdsOnPage])));
    }
  };

  const handleBulkMarkPaidClick = (mode) => {
    if (mode === "selected") {
      if (selectedUnpaidCount === 0) {
        toast.error("Wybierz oczekujące faktury");
        return;
      }
      setBillToUpdate(null);
      setBulkPayMode("selected");
      setIsConfirmModalOpen(true);
      return;
    }
    setBillToUpdate(null);
    setBulkPayMode("allPending");
    setIsConfirmModalOpen(true);
  };

  const handleBulkMarkPaid = async () => {
    try {
      setIsLoading(true);
      const payload =
        bulkPayMode === "allPending"
          ? {
              allPending: true,
              startDate: dateRange.startDate || undefined,
              endDate: dateRange.endDate || undefined,
              search: debouncedSearchQuery || undefined,
              filterPaymentStatus:
                paymentStatusFilter && paymentStatusFilter !== "paid"
                  ? paymentStatusFilter
                  : undefined,
            }
          : {
              billIds: selectedInvoiceIds.filter((id) =>
                bills.some((bill) => bill._id === id && isUnpaidBill(bill))
              ),
            };
      const response = await billingHelper.bulkUpdatePaymentStatus(payload);
      if (response.success) {
        const updated = response.data?.modifiedCount ?? 0;
        toast.success(`Oznaczono jako opłacone: ${updated}`);
        setSelectedInvoiceIds([]);
        fetchBills();
        setStatsRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Nie udało się zaktualizować statusu płatności");
      }
    } catch (error) {
      console.error("Błąd podczas zbiorczej aktualizacji płatności:", error);
      toast.error("Nie udało się zaktualizować statusu płatności");
    } finally {
      setIsLoading(false);
      setBulkPayMode(null);
    }
  };

  const handleBulkDeleteInvoices = () => {
    if (selectedInvoiceIds.length === 0) {
      toast.error('Proszę wybrać faktury do usunięcia');
      return;
    }
    setBulkDeleteDialog({
      open: true,
      ids: selectedInvoiceIds
    });
  };

  const handleBulkDeleteSuccess = () => {
    fetchBills();
    setStatsRefreshKey((prev) => prev + 1);
    setSelectedInvoiceIds([]);
  };

  const handlePermanentDeleteClick = (invoiceId) => {
    setDeleteDialog({
      open: true,
      id: invoiceId
    });
  };

  const handlePermanentDeleteSuccess = () => {
    fetchBills();
    setStatsRefreshKey((prev) => prev + 1);
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
    switch(String(status || "").toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'awaiting_payment':
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
    switch(String(status || "").toLowerCase()) {
      case 'paid':
        return 'Opłacone';
      case 'pending':
        return 'Oczekujące';
      case 'awaiting_payment':
        return 'Oczekuje na płatność';
      case 'overdue':
        return 'Zaległe';
      case 'partial':
        return 'Częściowo opłacone';
      default:
        return status;
    }
  };

  const formatBillDocumentRef = (bill) => {
    const issuedInvoiceNumber =
      bill?.invoiceSnapshot?.number ||
      (bill?.documentType === "invoice" ? bill?.invoiceId : "");

    const invoiceIssued =
      bill?.documentType === "invoice" &&
      issuedInvoiceNumber &&
      bill?.invoiceSnapshot?.status &&
      bill.invoiceSnapshot.status !== "draft";

    if (bill?.documentType === "fiscal_receipt" && bill?.internalTxnId) {
      return bill.internalTxnId;
    }

    if (invoiceIssued) {
      return issuedInvoiceNumber;
    }

    // TRX internal reference (doctor visit closed or paragon settled)
    if (bill?.internalTxnId) {
      return bill.internalTxnId;
    }

    // Awaiting reception: no formal invoice number yet
    if (bill?.paymentStatus === "pending" || !bill?.documentType) {
      return "Do rozliczenia";
    }

    if (issuedInvoiceNumber) {
      return issuedInvoiceNumber;
    }

    return "Paragon";
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
          setBulkPayMode(null);
        }}
        onConfirm={() => {
          if (bulkPayMode) {
            handleBulkMarkPaid();
          } else if (billToUpdate?._id) {
            updatePaymentStatus(billToUpdate._id, "paid");
          }
          setIsConfirmModalOpen(false);
          setBillToUpdate(null);
        }}
        bill={billToUpdate}
        message={
          bulkPayMode === "allPending"
            ? "Czy na pewno chcesz oznaczyć WSZYSTKIE nieopłacone faktury pasujące do aktualnych filtrów (wszystkie strony listy) jako opłacone? Tej operacji nie da się cofnąć jednym kliknięciem."
            : bulkPayMode === "selected"
            ? `Czy na pewno chcesz oznaczyć ${selectedUnpaidCount} zaznaczonych faktur jako opłacone?`
            : undefined
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isDoctorViewOnly ? "Moje rozliczenia" : "Zarządzanie Fakturami"}
          </h1>
          <p className="text-gray-600">
            {isDoctorViewOnly
              ? "Podgląd rozliczeń z wizyt. Edycja, faktury i oznaczanie płatności — tylko recepcja. Szacowane przychody: Raporty."
              : "Przeglądaj i zarządzaj fakturami pacjentów"}
          </p>
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
          
          <button
            type="button"
            onClick={() => setPaymentStatusFilter(paymentStatusFilter === "pending" ? "" : "pending")}
            className={`bg-white rounded-lg shadow-sm p-6 text-left w-full transition ring-offset-2 hover:ring-2 hover:ring-yellow-300 ${
              paymentStatusFilter === "pending" ? "ring-2 ring-yellow-500" : ""
            }`}
            title="Pokaż tylko oczekujące faktury"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Oczekujące</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalPending)}</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  {paymentStatusFilter === "pending" ? "Filtr aktywny — kliknij, aby wyłączyć" : "Kliknij, aby pokazać tylko oczekujące"}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentStatusFilter(paymentStatusFilter === "overdue" ? "" : "overdue")}
            className={`bg-white rounded-lg shadow-sm p-6 text-left w-full transition ring-offset-2 hover:ring-2 hover:ring-red-300 ${
              paymentStatusFilter === "overdue" ? "ring-2 ring-red-500" : ""
            }`}
            title="Pokaż tylko zaległe faktury"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Zaległe</p>
                <h3 className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalOverdue)}</h3>
                <p className="text-xs text-red-700 mt-1">
                  {paymentStatusFilter === "overdue" ? "Filtr aktywny — kliknij, aby wyłączyć" : "Kliknij, aby pokazać tylko zaległe"}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </button>
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
        
        {/* Bulk actions — only when there is something unpaid to act on, or a selection */}
        {canSelectBills &&
          (pendingIdsOnPage.length > 0 ||
            selectedUnpaidCount > 0 ||
            selectedInvoiceIds.length > 0 ||
            (stats.totalPending > 0 && paymentStatusFilter !== "paid")) && (
          <div className="mb-4 bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-teal-900 font-medium">Oznaczanie jako opłacone</p>
              <p className="text-sm text-teal-800 mt-1">
                {selectedUnpaidCount > 0
                  ? `Wybrano ${selectedUnpaidCount} nieopłaconych faktur na tej stronie.`
                  : pendingIdsOnPage.length > 0
                  ? `Na tej stronie jest ${pendingIdsOnPage.length} nieopłaconych faktur — zaznacz je checkboxami, albo oznacz wszystkie oczekujące według filtrów.`
                  : paymentStatusFilter === "pending" || paymentStatusFilter === "overdue"
                  ? "Brak nieopłaconych faktur na tej stronie. Możesz oznaczyć wszystkie oczekujące według aktualnych filtrów (wszystkie strony)."
                  : "Najpierw kliknij kartę „Oczekujące” powyżej albo ustaw filtr statusu, potem zaznacz faktury."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {paymentStatusFilter !== "pending" && stats.totalPending > 0 && (
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter("pending")}
                  className="px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-100"
                >
                  Pokaż tylko oczekujące
                </button>
              )}
              {pendingIdsOnPage.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllPendingOnPage}
                  className="px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-100"
                >
                  {allPendingOnPageSelected
                    ? "Odznacz zaznaczone na stronie"
                    : `Zaznacz nieopłacone na stronie (${pendingIdsOnPage.length})`}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleBulkMarkPaidClick("selected")}
                disabled={selectedUnpaidCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <DollarSign size={18} />
                {selectedUnpaidCount > 0
                  ? `Oznacz zaznaczone jako opłacone (${selectedUnpaidCount})`
                  : "Oznacz zaznaczone jako opłacone"}
              </button>
              <button
                type="button"
                onClick={() => handleBulkMarkPaidClick("allPending")}
                disabled={paymentStatusFilter === "paid"}
                className="px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Oznacza wszystkie nieopłacone faktury pasujące do aktualnych filtrów (nie tylko ta strona)"
              >
                Oznacz wszystkie oczekujące (wg filtrów)
              </button>
              {user?.role === "admin" && selectedInvoiceIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteInvoices}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={18} />
                  Trwale usuń wybrane ({selectedInvoiceIds.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bills Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {canSelectBills && (
                    <th scope="col" className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allPendingOnPageSelected}
                        onChange={handleSelectAllPendingOnPage}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        title="Zaznacz wszystkie oczekujące na tej stronie"
                      />
                    </th>
                  )}
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
                    Dokument / TRX
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
                {tableLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={user?.role === "admin" ? 7 : 6} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : bills.length > 0 ? (
                  bills.map((bill) => (
                    <tr
                      key={bill._id}
                      className={`hover:bg-gray-50 ${selectedInvoiceIds.includes(bill._id) ? 'bg-teal-50' : ''}`}
                      onMouseEnter={() => prefetchSettlementBill(bill._id)}
                    >
                      {canSelectBills && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedInvoiceIds.includes(bill._id)}
                            onChange={() => handleSelectInvoice(bill._id)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                      )}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill?._id}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          type="button"
                          onClick={() =>
                            isBillingStaff
                              ? handleEditBill(bill._id)
                              : handleViewBillDetails(bill._id)
                          }
                          className="text-left text-teal-700 hover:text-teal-900 hover:underline"
                          title={
                            isBillingStaff
                              ? "Rozliczenie pacjenta"
                              : "Podgląd rozliczenia"
                          }
                        >
                          {formatBillDocumentRef(bill)}
                        </button>
                        {bill.documentType === "fiscal_receipt" && (
                          <div className="text-xs text-gray-400 font-normal">Paragon fiskalny</div>
                        )}
                        {bill.documentType === "invoice" && (
                          <div className="text-xs text-gray-400 font-normal">Faktura</div>
                        )}
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
                          {isBillingStaff && (
                            <button
                              onClick={() => handleEditBill(bill._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Rozliczenie pacjenta"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {isBillingStaff && bill.paymentStatus !== "paid" && (
                            <button
                              onClick={() => handleUpdatePaymentStatus(bill._id, "paid")}
                              className="text-green-600 hover:text-green-900"
                              title="Oznacz jako opłacone"
                            >
                              <DollarSign size={18} />
                            </button>
                          )}
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handlePermanentDeleteClick(bill._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Trwale usuń fakturę"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canSelectBills ? "7" : "6"} className="px-6 py-12 text-center">
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

      {/* Patient Settlement modal (reception/admin only) */}
      {isEditModalOpen && isBillingStaff && (
        <PatientSettlementModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          billId={selectedBillId}
          onUpdate={fetchBills}
        />
      )}

      {/* GenerateBillModal */}
      {isGenerateBillModalOpen && (
        <GenerateBillModal
          isOpen={isGenerateBillModalOpen}
          onClose={handleGenerateBillModalClose}
          appointmentId={appointmentId}
          onBillGenerated={handleBillGenerated}
          isRedirectedFromAppointment={isRedirectedFromAppointment}
        />
      )}

      {/* Bulk Delete Dialog */}
      <BulkDeleteByIdsDialog
        open={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, ids: [] })}
        type="invoice"
        selectedIds={bulkDeleteDialog.ids}
        itemName="faktur"
        onSuccess={handleBulkDeleteSuccess}
      />

      {/* Single Delete Dialog */}
      <PermanentDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        type="invoice"
        id={deleteDialog.id}
        title="Trwale usuń fakturę?"
        message="Ta operacja jest nieodwracalna. Faktura oraz wszystkie powiązane rekordy zostaną trwale usunięte."
        onSuccess={handlePermanentDeleteSuccess}
      />
    </div>
  );
};

export default BillingManagement; 