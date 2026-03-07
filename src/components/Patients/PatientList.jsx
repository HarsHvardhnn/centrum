import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
  UserPlus,
  DollarSign,
  Trash2,
  Pen,
  Clock
} from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";
import CompleteRegistrationModal from "../admin/CompleteRegistrationModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import { translateStatus, getStatusStyle, getVisitMode, getVisitModeLabel, getVisitModeStyle, getCreatedByRoleLabel } from '../../utils/statusHelper';
import BillingConfirmationModal from "../Billing/BillingConfirmationModal";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import patientService from "../../helpers/patientHelper";
import RescheduleModal from "../Dashboard/RescheduleModal";
import BulkDeleteByIdsDialog from "../admin/BulkDeleteByIdsDialog";
import PermanentDeleteDialog from "../admin/PermanentDeleteDialog";

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
  },
};

function LabAppointmentsContent({ clinic }) {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser();
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingServices, setBillingServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [sendSMSNotification, setSendSMSNotification] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    ids: []
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null
  });
  const [showCompleteRegModal, setShowCompleteRegModal] = useState(false);
  const [showConsentsModal, setShowConsentsModal] = useState(false);
  const [consentsModalVisitId, setConsentsModalVisitId] = useState(null);
  const [consentsData, setConsentsData] = useState(null);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [consentsError, setConsentsError] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(clinic ? "booked" : "All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  /** Only on /klinika: when true, show only patient-less (visit-only) appointments. */
  const [patientLessOnly, setPatientLessOnly] = useState(false);

  // Ref for filter dropdown
  const filterRef = useRef(null);

  // Add new state for patient form
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [patientFormData, setPatientFormData] = useState({});
  const subStepTitles = [
    "Dane Podstawowe",
    "Skierowanie",
    "Adres",
    "Zgody",
    "Szczegóły",
    "Notatki",
  ];

  /** Visit-only: no patient linked (use backend isVisitOnly flag or fallback to missing patient) */
  const isVisitOnlyAppointment = (apt) =>
    apt?.isVisitOnly === true || !(apt?.patient?.id || apt?.patient?._id);

  /** Cancelled status (case-insensitive; accepts both "cancelled" and "canceled"). */
  const isCancelled = (apt) => {
    const s = apt?.status?.toLowerCase();
    return s === "cancelled" || s === "canceled";
  };

  const fetchVisitConsents = async (visitId) => {
    setConsentsModalVisitId(visitId);
    setShowConsentsModal(true);
    setConsentsError(null);
    setConsentsData(null);
    setConsentsLoading(true);
    try {
      const res = await apiCaller("GET", `/appointments/${visitId}/consents`);
      const data = res?.data ?? res;
      if (data?.success) {
        setConsentsData({
          visitId: data.visitId,
          source: data.source,
          consents: Array.isArray(data.consents) ? data.consents : [],
        });
      } else {
        setConsentsError(data?.message || "Nie udało się pobrać zgód.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Nie udało się pobrać zgód.";
      setConsentsError(msg);
    } finally {
      setConsentsLoading(false);
    }
  };

  /** Display name: patient name, or registrationData, or fallback (never undefined) */
  const getAppointmentPatientDisplayName = (apt) => {
    const name =
      apt?.patient?.name ??
      apt?.registrationData?.name ??
      (apt?.registrationData?.firstName && apt?.registrationData?.lastName
        ? `${apt.registrationData.firstName} ${apt.registrationData.lastName}`.trim()
        : null);
    const fallback = "Nieznany pacjent";
    if (name == null || name === "" || String(name) === "undefined") return fallback;
    return name;
  };

  const fetchAppointments = async (page = 1) => {
    try {
      showLoader();
      const appointmentIdFromUrl = searchParams.get('appointmentId');
      const dateFromUrl = searchParams.get('date');
      
      const filters = {
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(dateFromUrl && { date: dateFromUrl }),
        ...(searchQuery && { search: searchQuery }),
        ...(user?.role === "doctor" && { doctorId: user?.id }),
        ...(clinic && { isClinicIp: clinic }),
        ...(clinic && patientLessOnly && { patientLessOnly: true }),
        ...(appointmentIdFromUrl && { appointmentId: appointmentIdFromUrl }),
      };
      
      // Log the current filters for debugging
      console.log('Filters applied:', { 
        statusFilter, 
        dateRange, 
        clinic, 
        filters 
      });

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

  // Initialize filters from URL parameters
  useEffect(() => {
    const startDateFromUrl = searchParams.get('startDate');
    const dateFromUrl = searchParams.get('date');
    const appointmentIdFromUrl = searchParams.get('appointmentId');
    
    // Handle both 'startDate' and 'date' parameters
    const dateToSet = startDateFromUrl || dateFromUrl;
    
    if (dateToSet) {
      setDateRange(prev => ({
        ...prev,
        startDate: dateToSet
      }));
    } else {
      // Only set today's date as default for clinic cases
      if (clinic) {
        const today = new Date().toISOString().split('T')[0];
        setDateRange(prev => ({
          ...prev,
          startDate: today
        }));
      } else {
        // Clear date filter for non-clinic cases
        setDateRange(prev => ({
          ...prev,
          startDate: null
        }));
      }
    }
    
    // Store appointmentId for API filtering
    if (appointmentIdFromUrl) {
      // You can add appointmentId to state if needed for UI display
      console.log('Appointment ID from URL:', appointmentIdFromUrl);
    }
  }, [searchParams, clinic]);

  // Handle clicking outside filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchAppointments(1); // Reset to first page when filters change
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, statusFilter, dateRange, user?.id, clinic, searchParams, patientLessOnly]);

  // Force refetch when clinic prop changes to clear cache
  useEffect(() => {
    // Clear appointments and pagination when clinic prop changes to prevent cache issues
    setAppointments([]);
    setPagination({
      total: 0,
      page: 1,
      pages: 1,
      limit: 10,
    });
    setSearchQuery("");
    setStatusFilter(clinic ? "booked" : "All");
    setPatientLessOnly(false);

    // Preserve date from query parameters when switching routes, otherwise set today's date only for clinic
    const startDateFromUrl = searchParams.get('startDate');
    const dateFromUrl = searchParams.get('date');
    const dateToSet = startDateFromUrl || dateFromUrl;
    
    if (dateToSet) {
      setDateRange({
        startDate: dateToSet,
        endDate: null,
      });
    } else {
      // Only set today's date as default for clinic cases
      if (clinic) {
        const today = new Date().toISOString().split('T')[0];
        setDateRange({
          startDate: today,
          endDate: null,
        });
      } else {
        // For non-clinic cases, always clear the date filter
        setDateRange({
          startDate: null,
          endDate: null,
        });
      }
    }
    
    // Refetch with fresh data
    fetchAppointments(1);
  }, [clinic, searchParams]);

  // Remove the frontend filtering logic and use the appointments directly from backend
  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      if (isNaN(appointmentDate.getTime())) {
        console.warn('Invalid date found for appointment:', appointment);
        return;
      }
      
      const dateKey = appointmentDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.startTime || '';
        const timeB = b.startTime || '';
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  };

  // Function to handle billing confirmation
  const handleBillPatient = async (appointmentId, patientId) => {
    try {
      showLoader();
      // Fetch patient services for this appointment
      const response = await patientServicesHelper.getPatientServices(
        patientId,
        { appointmentId }
      );

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
      setIsLoading(true);

      // Format services data
      const formattedServices =
        billingServices?.data?.services?.map((service) => ({
          serviceId: service.service._id,
          title: service.service.title,
          price: service.service.price,
          status: service.status,
        })) || [];

      // Prepare billing payload
      const billingPayload = {
        services: formattedServices,
        subtotal: billingData.subtotal,
        taxPercentage: billingData.taxPercentage,
        taxAmount: billingData.taxAmount,
        discount: parseFloat(billingData.discount) || 0,
        additionalCharges: parseFloat(billingData.additionalCharges) || 0,
        additionalChargeNote: billingData.additionalChargeNote || "",
        totalAmount: billingData.totalAmount,
        paymentMethod: billingData.paymentMethod,
      };

      // Call the API to generate the bill
      const response = await billingHelper.generateBill(selectedAppointment.id, billingPayload);

      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                status: "billed",
                billingDetails: billingData,
              }
            : apt
        )
      );

      toast.success(
        `Rachunek wygenerowany pomyślnie na kwotę zł${billingData.totalAmount}`
      );
      setShowBillingModal(false);
      setIsLoading(false);
      
      // Redirect to billing details
      navigate(`/administracja/rozliczenia/szczegoly/${response.data._id}`);
    } catch (error) {
      console.error("Failed to generate bill:", error);
      toast.error("Nie udało się wygenerować rachunku. Spróbuj ponownie.");
      setIsLoading(false);
    }
  };

  const handleAppointmentUpdate = (appointmentId, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: newStatus }
        : apt
    ));
  };

  // Add function to format date header
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date in formatDateHeader:', dateStr);
      return 'Data nieznana';
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return "Dzisiaj";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Jutro";
    }

    try {
      return date.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data nieznana';
    }
  };

  // Add handleCancelClick function
  const handleCancelClick = async (e, appointmentId) => {
    e.preventDefault();
    setSelectedAppointment(appointmentId);
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    try {
      showLoader();
      const response = await appointmentHelper.cancelAppointment(selectedAppointment, "Anulowane przez administratora", sendSMSNotification, sendEmailNotification);
      if (response.success) {
        toast.success("Wizyta została anulowana");
        // Update the appointments list
        setAppointments(appointments.map(apt => 
          apt.id === selectedAppointment 
            ? { ...apt, status: "cancelled" }
            : apt
        ));
      } else {
        toast.error("Nie udało się anulować wizyty");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Nie udało się anulować wizyty");
    } finally {
      hideLoader();
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setSendSMSNotification(false);
      setSendEmailNotification(false);
    }
  };

  // Add patient form functions
  const goToSubStep = (step) => {
    setCurrentSubStep(step);
  };

  const markStepAsCompleted = (formData) => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    setPatientFormData(formData);

    if (currentSubStep === subStepTitles.length - 1) {
      handleAddPatient(formData);
    } else {
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  const handleAddPatient = async (formData) => {
    try {
      console.log("PatientList - handleAddPatient received:", formData);
      showLoader();
      let response;
      
      if (isEditMode && currentPatientId) {
        response = await patientService.updatePatient(currentPatientId, formData);
        toast.success("Pacjent został zaktualizowany");
      } else {
        response = await patientService.createPatient(formData);
        toast.success("Pacjent został dodany");
      }
      
      hideLoader();
      setShowAddPatientModal(false);
      setIsEditMode(false);
      setCurrentPatientId(null);
      // Preserve the phone code preference when resetting form
      setPatientFormData({ phoneCode: formData.phoneCode || "+48" });
      fetchAppointments(); // Refresh the appointments list

    } catch (err) {
      toast.error(
        "Nie udało się " + (isEditMode ? "zaktualizować" : "dodać") + " pacjenta: " +
        (err.response?.data?.error || err.response?.data?.message || "Nieznany błąd")
      );
      hideLoader();
    }
  };

  const handleGenerateVisitCard = async (appointmentId) => {
    try {
      const response = await appointmentHelper.generateVisitCard(appointmentId);
      if (response.success && response.data.url) {
        window.open(response.data.url, '_blank');
      } else {
        toast.error("Nie udało się wygenerować karty wizyty");
      }
    } catch (error) {
      console.error("Error generating visit card:", error);
      toast.error("Wystąpił błąd podczas generowania karty wizyty");
    }
  };

  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = (rescheduledData) => {
    // Update the appointment in the list with new data
    setAppointments(appointments.map(apt => 
      apt.id === selectedAppointment.id 
        ? {
            ...apt,
            date: rescheduledData.appointment.date,
            startTime: rescheduledData.appointment.startTime,
            mode: rescheduledData.appointment.mode
          }
        : apt
    ));
    
    // Refresh the appointments list
    fetchAppointments(pagination.page);
  };

  // Multi-select handlers for appointments
  const handleSelectAppointment = (appointmentId) => {
    if (user?.role !== "admin") return; // Only admin can select
    setSelectedAppointmentIds(prev => 
      prev.includes(appointmentId) 
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleSelectAllAppointments = () => {
    if (user?.role !== "admin") return;
    if (selectedAppointmentIds.length === appointments.length) {
      setSelectedAppointmentIds([]);
    } else {
      setSelectedAppointmentIds(appointments.map(apt => apt.id));
    }
  };

  const handleBulkDeleteAppointments = () => {
    if (selectedAppointmentIds.length === 0) {
      toast.error('Proszę wybrać wizyty do usunięcia');
      return;
    }
    setBulkDeleteDialog({
      open: true,
      ids: selectedAppointmentIds
    });
  };

  const handleBulkDeleteSuccess = () => {
    fetchAppointments(pagination.page);
    setSelectedAppointmentIds([]);
  };

  const handlePermanentDeleteClick = (appointmentId) => {
    setDeleteDialog({
      open: true,
      id: appointmentId
    });
  };

  const handlePermanentDeleteSuccess = () => {
    fetchAppointments(pagination.page);
  };

  const statusLabelForDisplay =
    statusFilter === "All"
      ? "Wszystkie"
      : statusFilter === "booked"
      ? "Zarezerwowane"
      : statusFilter === "checkedIn"
      ? "Zameldowany"
      : statusFilter?.toLowerCase() === "cancelled" || statusFilter?.toLowerCase() === "canceled"
      ? "Anulowane"
      : statusFilter === "completed"
      ? "Zakończone"
      : statusFilter;

  const dateRangeText = clinic
    ? dateRange.startDate && dateRange.endDate
      ? `Wizyty od ${new Date(dateRange.startDate).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })} do ${new Date(dateRange.endDate).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}`
      : dateRange.startDate
      ? `Wizyty od ${new Date(dateRange.startDate).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}`
      : "Wszystkie wizyty"
    : dateRange.startDate
    ? `Wizyty z dnia ${new Date(dateRange.startDate).toLocaleDateString("pl-PL")}`
    : "Wszystkie wizyty";

  const getPatientPesel = (p) => p?.govtId || p?.pesel || p?.PESEL || "—";
  const getPatientGenderLetter = (p) =>
    p?.sex === "Male" || p?.gender === "Male"
      ? "M"
      : p?.sex === "Female" || p?.gender === "Female"
      ? "K"
      : "—";
  const formatFirstVisit = (apt) => {
    if (!apt?.date) return "—";
    const d = new Date(apt.date);
    const dateStr = d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
    return apt.startTime ? `${dateStr} ${apt.startTime}` : dateStr;
  };

  return (
    <div className={`min-h-screen ${clinic ? "bg-white" : "bg-gray-100"}`}>
      <div className="w-full mx-auto px-4 py-8">
        <div className={clinic ? "mb-6" : "mb-6"}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {clinic ? "Historia wizyt" : "Lista pacjentów"}
              {!clinic && ` (${appointments.length})`}
            </h1>
            {clinic && (
            <p className="text-sm text-gray-500">
              Wyświetlane: {dateRangeText}
              {statusFilter !== "All" && ` - Status: ${statusLabelForDisplay}`}
              {patientLessOnly && " - Tylko wizyty bez pacjenta"}
            </p>
            )}
            {!clinic && dateRange.startDate && (
              <button
                onClick={() => setDateRange({ startDate: null, endDate: null })}
                className="text-sm text-teal-600 hover:text-teal-800 underline mt-1"
              >
                Wyczyść filtr daty
              </button>
            )}
          </div>

          {clinic && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative max-w-xl">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Szukaj pacjenta..."
                  className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  Filtry
                  <ChevronDown size={18} className={isFilterOpen ? "rotate-180" : ""} />
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] p-3">
                    <h3 className="font-medium text-gray-800 px-2 py-1 mb-2">Status</h3>
                    <div className="space-y-1">
                      {["All", "booked", "checkedIn", "Cancelled", "Completed"].map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded hover:bg-gray-50">
                          <input
                            type="radio"
                            name="status-clinic"
                            checked={statusFilter === status}
                            onChange={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                            className="rounded-full"
                          />
                          <span className="text-sm">
                            {status === "All" ? "Wszystkie" : status === "booked" ? "Zarezerwowane" : status === "checkedIn" ? "Zameldowany" : status === "Cancelled" ? "Anulowane" : status === "Completed" ? "Zakończone" : status}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <h3 className="font-medium text-gray-800 px-2 py-1 mb-2">Zakres dat</h3>
                      <div className="space-y-2 px-2">
                        <input type="date" className="w-full p-2 border border-gray-300 rounded text-sm" value={dateRange.startDate || ""} onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))} />
                        <input type="date" className="w-full p-2 border border-gray-300 rounded text-sm" value={dateRange.endDate || ""} onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))} />
                      </div>
                    </div>
                    {clinic && (
                      <div className="border-t mt-2 pt-2">
                        <label className="flex items-center gap-2 px-2 py-2 cursor-pointer">
                          <input type="checkbox" checked={patientLessOnly} onChange={(e) => setPatientLessOnly(e.target.checked)} className="rounded border-gray-300 text-teal-600" />
                          <span className="text-sm">Tylko wizyty bez pacjenta</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!clinic && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 relative max-w-xl">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj pacjenta..."
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {user?.role !== "doctor" && (
              <button
                type="button"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 flex items-center gap-2 font-medium shrink-0"
                onClick={() => setShowAddPatientModal(true)}
              >
                <Plus size={18} />
                Dodaj pacjenta
              </button>
            )}
          </div>
          )}
        </div>

        {/* Bulk Delete Button for Appointments */}
        {user?.role === "admin" && selectedAppointmentIds.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4">
            <span className="text-red-800 font-medium">
              Wybrano {selectedAppointmentIds.length} wizyt(y)
            </span>
            <button
              onClick={handleBulkDeleteAppointments}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={18} />
              Trwale usuń wybrane ({selectedAppointmentIds.length})
            </button>
          </div>
        )}

        {clinic ? (
          /* Historia wizyt – flat list of white cards */
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-gray-500">
                Brak wizyt w wybranym okresie.
              </div>
            ) : (
              appointments.map((appointment) => {
                const isCompleted = appointment.status === "completed" || appointment.status === "Completed";
                const isCancelledStatus = isCancelled(appointment);
                const statusPillClass = isCancelledStatus
                  ? "bg-red-100 text-red-800"
                  : isCompleted
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800";
                const visitDateStr = appointment.date
                  ? new Date(appointment.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "—";
                const patientIdStr = isVisitOnlyAppointment(appointment)
                  ? "—"
                  : (appointment.patient?.patientId ?? appointment.patient?.id ?? appointment.patient?._id ?? "—");

                return (
                  <div
                    key={appointment.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        if (isVisitOnlyAppointment(appointment) && !isCancelledStatus) {
                          setSelectedAppointment(appointment);
                          setShowCompleteRegModal(true);
                        } else if (!isVisitOnlyAppointment(appointment)) {
                          navigate(`/szczegoly-pacjenta/${appointment.patient.id || appointment.patient._id}?appointmentId=${appointment.id}`);
                        }
                      }}
                    >
                      <div className="font-semibold text-gray-900 truncate">
                        {getAppointmentPatientDisplayName(appointment)}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        ID: {patientIdStr} | {visitDateStr}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-center min-w-[100px]">
                      <div className="font-semibold text-gray-900">
                        {appointment.startTime} – {appointment.endTime}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {appointment.doctor?.name || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${statusPillClass}`}>
                        {translateStatus(appointment.status)}
                      </span>
                      {appointment.isAppointment !== false && (
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button type="button" className="p-1.5 text-gray-500 hover:text-gray-700 rounded focus:outline-none">
                              <MoreVertical size={20} />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="min-w-[220px] bg-white rounded-lg shadow-lg z-[100] border p-1" sideOffset={5} align="end">
                              {isVisitOnlyAppointment(appointment) && !isCancelledStatus && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCompleteRegModal(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zakończ rejestrację
                                </DropdownMenu.Item>
                              )}
                              {!isVisitOnlyAppointment(appointment) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => navigate(`/szczegoly-pacjenta/${appointment.patient.id || appointment.patient._id}?appointmentId=${appointment.id}`)}>
                                  <Eye size={16} className="mr-2" /> Zobacz szczegóły
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCheckin(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zamelduj
                                </DropdownMenu.Item>
                              )}
                              {(user?.role === "admin" || user?.role === "receptionist") && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => handleRescheduleClick(appointment)}>
                                  <Clock size={16} className="mr-2" /> Przełóż wizytę
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && ["checkedIn", "booked"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); handleBillPatient(appointment.id, appointment.patient.id || appointment.patient._id); }}>
                                  <DollarSign size={16} className="mr-2" /> Wystaw rachunek
                                </DropdownMenu.Item>
                              )}
                              {appointment.status === "completed" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => handleGenerateVisitCard(appointment.id)}>
                                  <FileText size={16} className="mr-2" /> Karta wizyty
                                </DropdownMenu.Item>
                              )}
                              {!["checkedIn", "completed", "cancelled"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={(e) => handleCancelClick(e, appointment.id)}>
                                  <X size={16} className="mr-2" /> Anuluj wizytę
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => fetchVisitConsents(appointment.id)}>
                                <FileText size={16} className="mr-2" /> Zobacz zgody
                              </DropdownMenu.Item>
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { navigate(`/administracja/konta?edytujPacjenta=${appointment.patient.id || appointment.patient._id}&returnUrl=${encodeURIComponent("/klinika")}`); }}>
                                  <Eye size={16} className="mr-2" /> Edytuj pacjenta
                                </DropdownMenu.Item>
                              )}
                              {user?.role === "admin" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={() => handlePermanentDeleteClick(appointment.id)}>
                                  <Trash2 size={16} className="mr-2" /> Trwale usuń
                                </DropdownMenu.Item>
                              )}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Lista pacjentów – card layout */
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_4rem_3rem_6rem_7rem_8rem_2.5rem] gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <div>Pacjent i ID</div>
              <div>Wiek</div>
              <div>Płeć</div>
              <div>PESEL</div>
              <div>Telefon</div>
              <div>Pierwsza wizyta</div>
              <div className="text-right">Akcje</div>
            </div>
            {appointments.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-12 text-center text-gray-500">
                Brak pacjentów.
              </div>
            ) : (
              appointments.map((appointment) => {
                const patientIdStr = isVisitOnlyAppointment(appointment)
                  ? "—"
                  : (appointment.patient?.patientId ?? appointment.patient?.id ?? appointment.patient?._id ?? "—");
                return (
                  <div
                    key={appointment.id}
                    className={`bg-white border border-gray-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow grid grid-cols-[1fr_4rem_3rem_6rem_7rem_8rem_2.5rem] gap-3 px-4 py-3 items-center ${selectedAppointmentIds.includes(appointment.id) ? "ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  >
                    <div
                      className="min-w-0 cursor-pointer"
                      onClick={() => {
                        if (appointment.isAppointment !== false) {
                          if (isVisitOnlyAppointment(appointment) && !isCancelled(appointment)) {
                            setSelectedAppointment(appointment);
                            setShowCompleteRegModal(true);
                          } else if (!isVisitOnlyAppointment(appointment)) {
                            navigate(`/szczegoly-pacjenta/${appointment.patient.id || appointment.patient._id}?appointmentId=${appointment.id}`);
                          }
                        }
                      }}
                    >
                      <div className="font-semibold text-gray-900 truncate">{getAppointmentPatientDisplayName(appointment)}</div>
                      <div className="text-sm text-gray-500 truncate">ID: {patientIdStr}</div>
                    </div>
                    <div className="text-gray-800 truncate">{appointment.patient?.age ?? "—"}</div>
                    <div className="text-gray-800 truncate">{getPatientGenderLetter(appointment.patient)}</div>
                    <div className="text-gray-800 truncate text-sm">{getPatientPesel(appointment.patient)}</div>
                    <div className="text-gray-800 truncate text-sm">{appointment.patient?.phoneNumber ?? appointment.registrationData?.phone ?? "—"}</div>
                    <div className="text-gray-800 truncate text-sm">{formatFirstVisit(appointment)}</div>
                    <div className="flex justify-end">
                      {appointment.isAppointment !== false && (
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button type="button" className="text-gray-500 hover:text-gray-700 focus:outline-none p-1">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="min-w-[220px] max-h-[min(70vh,320px)] overflow-y-auto bg-white rounded-lg shadow-lg z-[100] border p-1" sideOffset={5} align="end">
                              {isVisitOnlyAppointment(appointment) && !isCancelled(appointment) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCompleteRegModal(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zakończ rejestrację
                                </DropdownMenu.Item>
                              )}
                              {!isVisitOnlyAppointment(appointment) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => navigate(`/szczegoly-pacjenta/${appointment.patient.id || appointment.patient._id}?appointmentId=${appointment.id}`)}>
                                  <Eye size={16} className="mr-2" /> Zobacz szczegóły
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCheckin(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zamelduj
                                </DropdownMenu.Item>
                              )}
                              {(user?.role === "admin" || user?.role === "receptionist") && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => handleRescheduleClick(appointment)}>
                                  <Clock size={16} className="mr-2" /> Przełóż wizytę
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && ["checkedIn", "booked"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); handleBillPatient(appointment.id, appointment.patient.id || appointment.patient._id); }}>
                                  <DollarSign size={16} className="mr-2" /> Wystaw rachunek
                                </DropdownMenu.Item>
                              )}
                              {appointment.status === "completed" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => handleGenerateVisitCard(appointment.id)}>
                                  <FileText size={16} className="mr-2" /> Karta wizyty
                                </DropdownMenu.Item>
                              )}
                              {!["checkedIn", "completed", "cancelled"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={(e) => handleCancelClick(e, appointment.id)}>
                                  <X size={16} className="mr-2" /> Anuluj wizytę
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => fetchVisitConsents(appointment.id)}>
                                <FileText size={16} className="mr-2" /> Zobacz zgody
                              </DropdownMenu.Item>
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { navigate(`/administracja/konta?edytujPacjenta=${appointment.patient.id || appointment.patient._id}&returnUrl=${encodeURIComponent("/pacjenci")}`); }}>
                                  <Pen size={16} className="mr-2" /> Edytuj pacjenta
                                </DropdownMenu.Item>
                              )}
                              {user?.role === "admin" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={() => handlePermanentDeleteClick(appointment.id)}>
                                  <Trash2 size={16} className="mr-2" /> Trwale usuń
                                </DropdownMenu.Item>
                              )}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination - hidden on clinic (Historia wizyt) */}
        {pagination.pages > 1 && !clinic && (
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
          patientData={selectedAppointment || {}}
          appointmentId={selectedAppointment?.id}
          onAppointmentUpdate={handleAppointmentUpdate}
        />

        {/* Billing Confirmation Modal */}
        <BillingConfirmationModal
          isOpen={showBillingModal}
          onClose={() => setShowBillingModal(false)}
          onConfirm={confirmBilling}
          patientServicesData={billingServices}
          patientName={selectedAppointment ? getAppointmentPatientDisplayName(selectedAppointment) : ""}
          appointmentId={selectedAppointment?.id}
          patientId={selectedAppointment?.patient?.id}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          appointment={selectedAppointment}
          onRescheduleSuccess={handleRescheduleSuccess}
        />

        {/* Complete registration modal - for visits without patient */}
        <CompleteRegistrationModal
          isOpen={showCompleteRegModal}
          onClose={() => {
            setShowCompleteRegModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={() => {
            fetchAppointments(pagination.page);
          }}
        />

        {/* Visit consents modal */}
        {showConsentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b px-4 py-3">
                <h3 className="text-lg font-medium text-gray-900">Zgody wizyty</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsentsModal(false);
                    setConsentsModalVisitId(null);
                    setConsentsData(null);
                    setConsentsError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {consentsLoading && (
                  <div className="py-8 text-center text-gray-500">Ładowanie zgód…</div>
                )}
                {consentsError && (
                  <div className="py-4 text-red-600 text-sm">{consentsError}</div>
                )}
                {!consentsLoading && !consentsError && consentsData && (
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      Źródło:{" "}
                      <span className="font-medium">
                        {consentsData.source === "patient"
                          ? "Pacjent"
                          : consentsData.source === "registration"
                            ? "Rejestracja (dane wizyty)"
                            : consentsData.source}
                      </span>
                    </div>
                    {consentsData.consents.length === 0 ? (
                      <p className="text-gray-500">Brak zapisanych zgód.</p>
                    ) : (
                      <ul className="space-y-3">
                        {consentsData.consents.map((c) => (
                          <li
                            key={c.id ?? c.text}
                            className="flex items-start gap-2 p-3 bg-gray-50 rounded-md"
                          >
                            <span
                              className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-medium ${
                                c.agreed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {c.agreed ? "Tak" : "Nie"}
                            </span>
                            <span className="text-sm text-gray-700">{c.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Patient Modal */}
        {showAddPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-bold">
                  {isEditMode ? "Edytuj Pacjenta" : "Dodaj Pacjenta"}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowAddPatientModal(false);
                    setIsEditMode(false);
                    setCurrentPatientId(null);
                    // Preserve the phone code preference when closing form
                    setPatientFormData({ phoneCode: patientFormData.phoneCode || "+48" });
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <FormProvider initialData={patientFormData}>
                  <PatientStepFormWrapper
                    currentSubStep={currentSubStep}
                    goToSubStep={goToSubStep}
                    currentPatientId={currentPatientId}
                    markStepAsCompleted={markStepAsCompleted}
                    subStepTitles={subStepTitles}
                    isEditMode={isEditMode}
                    handleAddPatient={handleAddPatient}
                    patientFormData={patientFormData}
                  />
                </FormProvider>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Anuluj wizytę</h3>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedAppointment(null);
                      setSendSMSNotification(false);
                      setSendEmailNotification(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Czy na pewno chcesz anulować tę wizytę? Tej operacji nie można cofnąć.
                  </p>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotification"
                      checked={sendSMSNotification}
                      onChange={(e) => setSendSMSNotification(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotification" className="ml-2 text-sm text-gray-700">
                      Wyślij powiadomienie SMS o anulowaniu wizyty
                    </label>
                  </div>

                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      id="emailNotification"
                      checked={sendEmailNotification}
                      onChange={(e) => setSendEmailNotification(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotification" className="ml-2 text-sm text-gray-700">
                      Wyślij powiadomienie email o anulowaniu wizyty
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedAppointment(null);
                      setSendSMSNotification(false);
                      setSendEmailNotification(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleCancelAppointment}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tak, anuluj wizytę
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Dialog */}
        <BulkDeleteByIdsDialog
          open={bulkDeleteDialog.open}
          onClose={() => setBulkDeleteDialog({ open: false, ids: [] })}
          type="appointment"
          selectedIds={bulkDeleteDialog.ids}
          itemName="wizyt"
          onSuccess={handleBulkDeleteSuccess}
        />

        {/* Single Delete Dialog */}
        <PermanentDeleteDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: null })}
          type="appointment"
          id={deleteDialog.id}
          title="Trwale usuń wizytę?"
          message="Ta operacja jest nieodwracalna. Wizyta oraz wszystkie powiązane rekordy (rachunki, raporty) zostaną trwale usunięte."
          onSuccess={handlePermanentDeleteSuccess}
        />
      </div>
    </div>
  );
}

// Add PatientStepFormWrapper component
function PatientStepFormWrapper({
  currentSubStep,
  goToSubStep,
  currentPatientId,
  markStepAsCompleted,
  subStepTitles,
  isEditMode,
  handleAddPatient,
  patientFormData
}) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const { formData, updateFormData } = useFormContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isEditMode && patientFormData && !isInitialized) {
      updateFormData(patientFormData);
      setCompletedSteps(Array.from({ length: subStepTitles.length }, (_, i) => i));
      setIsInitialized(true);
    }
    
    if (!isEditMode) {
      setIsInitialized(false);
    }
  }, [isEditMode, patientFormData, isInitialized, subStepTitles.length]);

  const handleStepCompleted = () => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    if (currentSubStep === subStepTitles.length - 1) {
      console.log("Submitting form data:", formData);
      handleAddPatient(formData);
    } else {
      goToSubStep(currentSubStep + 1);
    }
  };

  return (
    <PatientStepForm
      currentSubStep={currentSubStep}
      goToSubStep={goToSubStep}
      markStepAsCompleted={handleStepCompleted}
      subStepTitles={subStepTitles}
      isEditMode={isEditMode}
      currentPatientId={currentPatientId}
      completedSteps={completedSteps}
    />
  );
}

function LabAppointments({ clinic }) {
  return <LabAppointmentsContent clinic={clinic} />;
}

export default LabAppointments;
