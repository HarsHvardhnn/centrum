import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Plus,
  X,
  Calendar,
  FileText,
  Eye,
  UserCheck,
  DollarSign,
} from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";
import { useNavigate } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";

// Billing Confirmation Modal Component
const BillingConfirmationModal = ({ isOpen, onClose, onConfirm, patientServicesData, patientName, appointmentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(18); // Default tax rate (e.g., GST)
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalChargeNote, setAdditionalChargeNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Default payment method
  
  if (!isOpen) return null;
  
  // Extract services from the API response format
  const services = patientServicesData?.data?.services || [];
  
  // Calculate subtotal from services
  const subtotal = services.reduce((sum, serviceItem) => {
    const servicePrice = parseFloat(serviceItem.service.price || 0);
    return sum + servicePrice;
  }, 0);
  
  // Calculate tax amount
  const taxAmount = (subtotal * taxPercentage) / 100;
  
  // Calculate total with tax, additional charges, and discount
  const totalAmount = (subtotal + taxAmount + parseFloat(additionalCharges || 0) - parseFloat(discount || 0)).toFixed(2);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generuj rachunek dla {patientServicesData?.data?.patient?.name?.first} {patientServicesData?.data?.patient?.name?.last}</h3>
          <p className="text-sm text-gray-500 mb-4">
            Utworzy to rachunek dla pacjenta na podstawie wybranych przez niego usług.
          </p>
          
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-sm">Usługi</h4>
                </div>
                
                {services && services.length > 0 ? (
                  <div className="divide-y">
                    {services.map((serviceItem, index) => (
                      <div key={index} className="px-4 py-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{serviceItem.service.title}</p>
                          <p className="text-xs text-gray-500">Status: {serviceItem.status}</p>
                        </div>
                        <p className="text-sm">zł{parseFloat(serviceItem.service.price).toFixed(2)}</p>
                      </div>
                    ))}
                    
                    <div className="px-4 py-2 flex justify-between items-center bg-gray-50">
                      <p className="font-medium">Suma częściowa</p>
                      <p className="font-medium">zł{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nie znaleziono usług dla tej wizyty.
                  </div>
                )}
              </div>
              
              {/* Tax, Additional Charges, and Discount Fields */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Podatek (%)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                      className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      (zł{taxAmount.toFixed(2)})
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dodatkowe opłaty (zł)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Notatka (opcjonalna)"
                      value={additionalChargeNote}
                      onChange={(e) => setAdditionalChargeNote(e.target.value)}
                      className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabat (zł)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metoda płatności
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="cash">Gotówka</option>
                    <option value="card">Karta kredytowa/debetowa</option>
                    <option value="insurance">Ubezpieczenie</option>
                    <option value="bank_transfer">Przelew bankowy</option>
                    <option value="mobile_payment">Płatność mobilna</option>
                  </select>
                </div>
              </div>
              
              {/* Total */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Łączna kwota</p>
                  <p className="font-bold text-lg text-teal-600">zł{totalAmount}</p>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              onClick={() => onConfirm({
                subtotal,
                taxPercentage,
                taxAmount,
                additionalCharges,
                additionalChargeNote,
                discount,
                totalAmount,
                paymentMethod
              })}
              disabled={isLoading || services.length === 0}
            >
              <DollarSign size={16} className="mr-1" />
              Generuj rachunek
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ActionDropdown component using portal
const ActionDropdown = ({ isOpen, onClose, position, children }) => {
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="fixed w-48 bg-white rounded-md shadow-lg z-50 border"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`
      }}
      ref={dropdownRef}
    >
      <div className="py-1">
        {children}
      </div>
    </div>,
    document.body
  );
};

// Add billingHelper with the generateBill function
const billingHelper = {
  generateBill: async (appointmentId, billData) => {
    try {
      const response = await apiCaller(
        "POST",
        `/patient-bills/generate/${appointmentId}`,
        billData
      );
      return response.data;
    } catch (error) {
      console.error("Error generating bill:", error);
      throw error;
    }
  }
};

function LabAppointmentsContent({ clinic }) {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser();
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingServices, setBillingServices] = useState([]);

  const navigate = useNavigate();
  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // State for tracking which dropdown is open
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const fetchAppointments = async (page = 1) => {
    try {
      showLoader();
      const filters = {
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(user?.role === "doctor" && { doctorId: user?.id })
      };

      const response = await appointmentHelper.getAllAppointments(
        page,
        10,
        searchQuery,
        filters
      );

      if (response.success) {
        setAppointments(response.data);
        setPagination(response.pagination);
      } else {
        toast.error("Nie udało się pobrać wizyt");
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Nie udało się pobrać wizyt");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchQuery, statusFilter, dateRange, user?.id]);

  // Filter appointments based on search query and status filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = searchQuery
        ? appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (appointment.patient.disease || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus =
        statusFilter === "All" || appointment.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  // Function to handle billing confirmation
  const handleBillPatient = async (appointmentId, patientId) => {
    try {
      showLoader();
      // Fetch patient services for this appointment
      const response = await patientServicesHelper.getPatientServices(patientId, { appointmentId });
      
      // Store the entire response data
      setBillingServices(response);
      setShowBillingModal(true);
      hideLoader();
    } catch (error) {
      console.error("Failed to fetch patient services:", error);
      toast.error("Nie udało się pobrać informacji o płatnościach");
      hideLoader();
    }
  };

  // Function to confirm billing
  const confirmBilling = async (billingData) => {
    try {
      showLoader();
      
      // Format services data
      const formattedServices = billingServices?.data?.services?.map(service => ({
        serviceId: service.service._id,
        title: service.service.title,
        price: service.service.price,
        status: service.status
      })) || [];
      
      // Prepare billing payload according to the API documentation
      const billingPayload = {
        services: formattedServices,
        subtotal: billingData.subtotal,
        taxPercentage: billingData.taxPercentage,
        taxAmount: billingData.taxAmount,
        discount: parseFloat(billingData.discount) || 0,
        additionalCharges: parseFloat(billingData.additionalCharges) || 0,
        additionalChargeNote: billingData.additionalChargeNote || "",
        totalAmount: billingData.totalAmount,
        paymentMethod: billingData.paymentMethod
      };
      
      // Call the API to generate the bill
      await billingHelper.generateBill(selectedAppointment.id, billingPayload);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id ? { 
          ...apt, 
          status: "billed",
          billingDetails: billingData
        } : apt
      ));
      
      toast.success(`Rachunek wygenerowany pomyślnie na kwotę zł${billingData.totalAmount}`);
      setShowBillingModal(false);
      hideLoader();
    } catch (error) {
      console.error("Failed to generate bill:", error);
      toast.error("Nie udało się wygenerować rachunku. Spróbuj ponownie.");
      hideLoader();
    }
  };

  // Toggle dropdown menu with position calculation
  const toggleActionMenu = (id, event) => {
    event.stopPropagation();
    
    if (openActionMenu === id) {
      setOpenActionMenu(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      // Calculate position so dropdown appears to the right of the button
      setDropdownPosition({
        x: Math.min(rect.right - 20, window.innerWidth - 200), // Ensure it doesn't go off-screen
        y: rect.bottom + window.scrollY + 5 // Position below the button with a small gap
      });
      setOpenActionMenu(id);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex w-full justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {clinic ? "Wizyty w Przychodni" : "Wizyty w Laboratorium"}
            </h1>
            <p className="text-gray-600 mb-4">
              Wyświetlane: Wszystkie wizyty
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 w-[50%]">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Szukaj wizyt..."
                className="py-2 pl-4 pr-10 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-gray-700"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} />
                Filtry
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg z-10 min-w-[200px]">
                  <div className="p-2">
                    <h3 className="font-medium px-3 py-2">Filtruj według statusu</h3>
                    <div className="space-y-2 px-3 py-1">
                      {["All", "Booked", "Cancelled", "Completed"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={statusFilter === status}
                            onChange={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                            }}
                            className="rounded-full"
                          />
                          <span>{status === "All" ? "Wszystkie" : 
                                 status === "Booked" ? "Zarezerwowane" : 
                                 status === "Cancelled" ? "Anulowane" : 
                                 status === "Completed" ? "Zakończone" : status}</span>
                        </label>
                      ))}
                    </div>

                    <div className="border-t mt-2 pt-2">
                      <h3 className="font-medium px-3 py-2">Zakres dat</h3>
                      <div className="space-y-2 px-3 py-1">
                        <div>
                          <label className="text-sm text-gray-600">Data początkowa</label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.startDate || ""}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              startDate: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Data końcowa</label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.endDate || ""}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              endDate: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Appointment Button */}
            {user?.role !== "doctor" && !clinic && (
              <button
                className="bg-teal-500 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                onClick={() => navigate("/appointment/create")}
              >
                <Calendar size={18} />
                Nowa wizyta
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto shadow-sm border rounded-lg">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3 w-[16%] font-medium">Pacjent</th>
                <th className="px-4 py-3 w-[12%] font-medium">Data i godzina</th>
                <th className="px-4 py-3 w-[7%] font-medium">Tryb</th>
                <th className="px-4 py-3 w-[8%] font-medium">Choroba</th>
                <th className="px-4 py-3 w-[16%] font-medium">Lekarz</th>
                <th className="px-4 py-3 w-[7%] font-medium">Wiek pacjenta</th>
                {/* <th className="px-4 py-3 w-[12%] font-medium">Status pacjenta</th> */}
                <th className="px-4 py-3 w-[14%] font-medium">Status wizyty</th>
                <th className="px-4 py-3 w-[8%] font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 truncate">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0">
                        <img
                          src={appointment.patient.profilePicture || "/assets/images/default-avatar.png"}
                          alt={appointment.patient.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{appointment.patient.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {appointment.patient.patientId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate">
                    <div className="font-medium">
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      appointment.mode === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : appointment.mode === 'offline'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.mode === 'online' ? 'Online' : 
                       appointment.mode === 'offline' ? 'Stacjonarnie' : appointment.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate">
                    {appointment.patient.disease || "-"}
                  </td>
                  <td className="px-4 py-3 truncate">
                    <div className="font-medium truncate">{appointment.doctor?.name || "-"}</div>
                  </td>
                  <td className="px-4 py-3 truncate text-center">
                    {appointment.patient.age || "N/A"} lat
                  </td>
                  {/* <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      appointment.patient.patient_status === 'in-treatment' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : appointment.patient.patient_status === 'recovered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.patient.patient_status === 'in-treatment' ? 'W trakcie leczenia' :
                       appointment.patient.patient_status === 'recovered' ? 'Wyzdrowiał' :
                       appointment.patient.patient_status || "N/A"}
                    </span>
                  </td> */}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      appointment.status === 'booked' 
                        ? 'bg-blue-100 text-blue-800' 
                        : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : appointment.status === 'billed'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'booked' ? 'Zarezerwowana' :
                       appointment.status === 'completed' ? 'Zakończona' :
                       appointment.status === 'cancelled' ? 'Anulowana' :
                       appointment.status === 'billed' ? 'Rozliczona' :
                       appointment.status === 'checkedIn' ? 'W trakcie leczenia' :
                       appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <div className="flex justify-center">
                      <button 
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={(e) => toggleActionMenu(appointment.id, e)}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => fetchAppointments(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Poprzednia
            </button>
            <span className="px-3 py-1">
              Strona {pagination.page} z {pagination.pages}
            </span>
            <button
              onClick={() => fetchAppointments(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Następna
            </button>
          </div>
        )}

        {/* Check-in Modal */}
        <CheckInModal
          isOpen={showCheckin}
          setIsOpen={setShowCheckin}
          patientData={selectedAppointment?.patient || {}}
          clinic={clinic}
          appointmentId={selectedAppointment?.id}
        />
        
        {/* Billing Confirmation Modal */}
        <BillingConfirmationModal
          isOpen={showBillingModal}
          onClose={() => setShowBillingModal(false)}
          onConfirm={confirmBilling}
          patientServicesData={billingServices}
          patientName={selectedAppointment?.patient?.name}
          appointmentId={selectedAppointment?.id}
        />

        {/* Action Dropdown Portal */}
        <ActionDropdown
          isOpen={openActionMenu !== null}
          position={dropdownPosition}
          onClose={() => setOpenActionMenu(null)}
        >
          {openActionMenu && (
            <>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  const appointment = appointments.find(apt => apt.id === openActionMenu);
                  navigate(`/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`);
                  setOpenActionMenu(null);
                }}
              >
                <Eye size={16} className="mr-2" />
                Zobacz szczegóły
              </button>
              
              {appointments.find(apt => apt.id === openActionMenu)?.status === 'booked' && (
                <button
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    const appointment = appointments.find(apt => apt.id === openActionMenu);
                    setSelectedAppointment(appointment);
                    setShowCheckin(true);
                    setOpenActionMenu(null);
                  }}
                >
                  <UserCheck size={16} className="mr-2" />
                  Zamelduj
                </button>
              )}
              
              {['checkedIn', 'booked'].includes(appointments.find(apt => apt.id === openActionMenu)?.status) && (
                <button
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    const appointment = appointments.find(apt => apt.id === openActionMenu);
                    setSelectedAppointment(appointment);
                    handleBillPatient(appointment.id, appointment.patient.id);
                    setOpenActionMenu(null);
                  }}
                >
                  <DollarSign size={16} className="mr-2" />
                  Wystaw rachunek
                </button>
              )}
            </>
          )}
        </ActionDropdown>
      </div>
    </div>
  );
}

function LabAppointments({ clinic }) {
  return <LabAppointmentsContent clinic={clinic} />;
}

export default LabAppointments;
