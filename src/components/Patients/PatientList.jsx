import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Plus,
  X,
  FileText,
  FolderOpen,
  Eye,
  UserCheck,
  UserPlus,
  DollarSign,
  Trash2,
  Pen,
  Clock,
  History,
  Settings
} from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";
import CompleteRegistrationModal from "../admin/CompleteRegistrationModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import { translateStatus, getStatusStyle, getVisitMode, getVisitModeLabel, getVisitModeStyle, getCreatedByRoleLabel, getVisitTypeDisplayLabel, stripDoctorTitle } from '../../utils/statusHelper';
import BillingConfirmationModal from "../Billing/BillingConfirmationModal";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import patientService from "../../helpers/patientHelper";
import RescheduleModal from "../Dashboard/RescheduleModal";
import BulkDeleteByIdsDialog from "../admin/BulkDeleteByIdsDialog";
import PermanentDeleteDialog from "../admin/PermanentDeleteDialog";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import VisitReasonCascadeDropdown from "../UtilComponents/VisitReasonCascadeDropdown";
import PatientDocumentsModal from "./PatientDocumentsModal";
import { queryKeys } from "../../lib/queryKeys";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

/** Formats appointment `created_at` / `createdAt` for "Utworzono przez: … (DD.MM.YYYY, HH:MM)" */
function formatAppointmentCreatedAt(appointment) {
  const raw = appointment?.created_at ?? appointment?.createdAt;
  if (raw == null || raw === "") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const VISIT_HISTORY_NOTES_PREVIEW_LEN = 220;

/** Long notes in visit history modal — collapsed preview + read more / less */
function VisitHistoryNotes({ notes }) {
  const [expanded, setExpanded] = useState(false);
  const raw =
    notes == null
      ? ""
      : typeof notes === "string"
        ? notes.trim()
        : String(notes).trim();
  if (!raw) return null;
  const needsTruncate = raw.length > VISIT_HISTORY_NOTES_PREVIEW_LEN;
  const collapsed = needsTruncate && !expanded;
  const displayText = collapsed
    ? `${raw.slice(0, VISIT_HISTORY_NOTES_PREVIEW_LEN).trimEnd()}…`
    : raw;

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1">Notatki</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{displayText}</p>
      {needsTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1.5 text-sm font-medium text-teal-600 hover:text-teal-800"
        >
          {expanded ? "Pokaż mniej" : "Czytaj więcej"}
        </button>
      )}
    </div>
  );
}

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
  const queryClient = useQueryClient();
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
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [selectedStatusAppointment, setSelectedStatusAppointment] = useState(null);
  const [showConsentsModal, setShowConsentsModal] = useState(false);
  const [consentsModalVisitId, setConsentsModalVisitId] = useState(null);
  const [consentsData, setConsentsData] = useState(null);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [consentsError, setConsentsError] = useState(null);
  const [showVisitHistoryModal, setShowVisitHistoryModal] = useState(false);
  const [visitHistoryPatient, setVisitHistoryPatient] = useState(null);
  const [visitHistoryData, setVisitHistoryData] = useState([]);
  const [visitHistoryLoading, setVisitHistoryLoading] = useState(false);
  const [visitHistoryError, setVisitHistoryError] = useState(null);
  const [showPatientDocumentsModal, setShowPatientDocumentsModal] = useState(false);
  const [documentsModalPatient, setDocumentsModalPatient] = useState(null);
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [visitCardPatientId, setVisitCardPatientId] = useState(null);
  const [visitCardPatientName, setVisitCardPatientName] = useState("");
  const [visitCardsList, setVisitCardsList] = useState([]);
  const [visitCardsLoading, setVisitCardsLoading] = useState(false);
  const [visitCardsError, setVisitCardsError] = useState(null);
  const [onlineDetailsAppointment, setOnlineDetailsAppointment] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Appointments data
  const [listPage, setListPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 50,
  });
  const [totalPatientsCount, setTotalPatientsCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(clinic ? "booked" : "All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const startDateFromUrl = searchParams.get("startDate");
    const dateFromUrl = searchParams.get("date");
    const dateToSet = startDateFromUrl || dateFromUrl;
    if (dateToSet) return { startDate: dateToSet, endDate: null };
    if (clinic) {
      return { startDate: new Date().toISOString().split("T")[0], endDate: null };
    }
    return { startDate: null, endDate: null };
  });
  /** Only on /klinika: when true, show only patient-less (visit-only) appointments. */
  const [patientLessOnly, setPatientLessOnly] = useState(false);
  /** Doctor filter for Historia wizyt (clinic) */
  const [doctorFilterId, setDoctorFilterId] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  /** Forma konsultacji: all | offline (Stacjonarna) | online */
  const [consultationMode, setConsultationMode] = useState("all");
  /** Typ wizyty (visit type) filter – value is visit reason displayName sent to backend */
  const [visitTypeFilter, setVisitTypeFilter] = useState("");
  /** Visit reasons from API (categories + types) for filter dropdown */
  const [visitReasonsCategories, setVisitReasonsCategories] = useState([]);

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
    "Przedstawiciel / Opiekun",
    "Osoby Upoważnione",
    "Inne",
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

  /** Receptionist goes to edit patient (Settings); admin/doctor go to appointment card. */
  const getPatientViewUrl = (patientId, appointmentId) => {
    if (user?.role === "receptionist") {
      const params = new URLSearchParams({
        edytujPacjenta: patientId,
        returnUrl: window.location.pathname,
      });
      if (appointmentId) params.set("appointmentId", appointmentId);
      return `/administracja/konta?${params.toString()}`;
    }
    return `/szczegoly-pacjenta/${patientId}${appointmentId ? `?appointmentId=${appointmentId}` : ""}`;
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
          patientData: data.patientData ?? null,
          appointmentData: data.appointmentData ?? null,
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

  const openVisitHistoryModal = (patientId, patientName) => {
    if (!patientId) return;
    setVisitHistoryPatient({ id: patientId, name: patientName || "Pacjent" });
    setShowVisitHistoryModal(true);
    setVisitHistoryError(null);
    setVisitHistoryData([]);
    setVisitHistoryLoading(true);
    patientService.getPatientVisits(patientId).then((res) => {
      const data = res?.data ?? [];
      setVisitHistoryData(Array.isArray(data) ? data : []);
      setVisitHistoryError(res?.success === false ? res?.message : null);
    }).catch((err) => {
      setVisitHistoryError(err?.response?.data?.message || err?.message || "Nie udało się pobrać historii wizyt.");
      setVisitHistoryData([]);
    }).finally(() => setVisitHistoryLoading(false));
  };

  const openPatientDocumentsModal = (patientId, patientName) => {
    if (!patientId) return;
    setDocumentsModalPatient({ id: patientId, name: patientName || "Pacjent" });
    setShowPatientDocumentsModal(true);
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

  const appointmentIdFromUrl = searchParams.get("appointmentId");
  const dateFromUrl = searchParams.get("date");
  const filtersSignature = JSON.stringify({
    searchQuery,
    statusFilter,
    dateRange,
    clinic,
    patientLessOnly,
    doctorFilterId,
    visitTypeFilter,
    consultationMode,
    appointmentIdFromUrl,
    dateFromUrl,
    itemsPerPage,
    userId: user?.id,
    userRole: user?.role,
  });
  const debouncedFiltersSignature = useDebouncedValue(filtersSignature, 300);
  const debouncedFilters = useMemo(
    () => JSON.parse(debouncedFiltersSignature),
    [debouncedFiltersSignature]
  );

  useEffect(() => {
    setListPage(1);
  }, [debouncedFiltersSignature]);

  const listQueryParams = {
    ...debouncedFilters,
    page: listPage,
  };

  const {
    data: listQueryData,
    isLoading: listQueryLoading,
    isFetching: listQueryFetching,
    error: listQueryError,
  } = useQuery({
    queryKey: queryKeys.appointmentsList(listQueryParams),
    queryFn: async () => {
      const f = listQueryParams;
      const filters = {
        ...(f.statusFilter !== "All" && f.statusFilter !== "patientLess" && { status: f.statusFilter }),
        ...(f.dateRange?.startDate && { startDate: f.dateRange.startDate }),
        ...(f.dateRange?.endDate && { endDate: f.dateRange.endDate }),
        ...(f.dateFromUrl && { date: f.dateFromUrl }),
        ...(f.searchQuery && { search: f.searchQuery }),
        ...(f.userRole === "doctor" && { doctorId: f.userId }),
        ...(f.clinic && f.doctorFilterId && { doctorId: f.doctorFilterId }),
        ...(f.clinic && { isClinicIp: f.clinic }),
        ...(f.clinic && (f.patientLessOnly || f.statusFilter === "patientLess") && { patientLessOnly: true }),
        ...(f.appointmentIdFromUrl && { appointmentId: f.appointmentIdFromUrl }),
        ...(f.visitTypeFilter && { visitReason: f.visitTypeFilter }),
        ...(f.clinic && f.consultationMode && f.consultationMode !== "all" && { mode: f.consultationMode }),
      };
      return appointmentHelper.getAllAppointments(
        f.page,
        f.itemsPerPage,
        f.searchQuery,
        filters,
        "date",
        "desc"
      );
    },
    placeholderData: keepPreviousData,
    enabled: !!(user?.role || clinic === true || clinic === false),
  });

  useEffect(() => {
    if (!listQueryData) return;
    const list = Array.isArray(listQueryData?.data)
      ? listQueryData.data
      : (listQueryData?.data?.data ?? []);
    const pag = listQueryData?.pagination ?? listQueryData?.data?.pagination ?? {
      total: 0,
      page: 1,
      pages: 1,
      limit: itemsPerPage,
    };
    if (listQueryData?.success !== false) {
      setAppointments(list);
      setPagination(pag);
      const rootTotalPatients =
        listQueryData?.totalPatients ??
        listQueryData?.data?.totalPatients ??
        pag?.totalPatients;
      const fallbackTotal = pag?.total ?? list?.length ?? 0;
      setTotalPatientsCount(Number(rootTotalPatients ?? fallbackTotal) || 0);
    }
  }, [listQueryData, itemsPerPage]);

  useEffect(() => {
    if (listQueryError) {
      console.error("Failed to fetch appointments:", listQueryError);
      toast.error("Nie udało się pobrać wizyt");
    }
  }, [listQueryError]);

  const listLoading = listQueryLoading || (listQueryFetching && appointments.length === 0);

  const fetchAppointments = (page) => {
    if (typeof page === "number") {
      setListPage(page);
    }
    queryClient.invalidateQueries({ queryKey: ["appointments-list"] });
  };

  // Sync filters from URL when URL has date params. Do not reset to default when URL has no date,
  // so we don't overwrite the user's chosen filters when this effect re-runs (e.g. new searchParams ref).
  useEffect(() => {
    const startDateFromUrl = searchParams.get('startDate');
    const dateFromUrl = searchParams.get('date');
    const appointmentIdFromUrl = searchParams.get('appointmentId');
    
    const dateToSet = startDateFromUrl || dateFromUrl;
    
    if (dateToSet) {
      setDateRange(prev => ({
        ...prev,
        startDate: dateToSet
      }));
    }
    // When URL has no date, leave dateRange as-is (initial default is set by the clinic-toggle effect only).
    
    if (appointmentIdFromUrl) {
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

  // List fetching is handled by useQuery + debouncedFilters (single request on mount).

  // Fetch doctors list for clinic (Historia wizyt) filter
  useEffect(() => {
    if (!clinic) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await doctorStatsHelper.getDoctorsList();
        if (response?.success && response?.data && !cancelled) {
          setDoctorsList(Array.isArray(response.data) ? response.data : []);
        }
      } catch (e) {
        if (!cancelled) setDoctorsList([]);
      }
    })();
    return () => { cancelled = true; };
  }, [clinic]);

  // Fetch visit reasons (categories + types) for clinic visit-type filter
  useEffect(() => {
    if (!clinic) return;
    let cancelled = false;
    appointmentHelper.getVisitReasons().then((res) => {
      if (cancelled) return;
      const data = res?.data ?? res;
      const categories = data?.categories ?? [];
      setVisitReasonsCategories(Array.isArray(categories) ? categories : []);
    }).catch(() => { if (!cancelled) setVisitReasonsCategories([]); });
    return () => { cancelled = true; };
  }, [clinic]);

  // Doctor role on clinic: show only own visits; set and lock doctor filter to current user
  useEffect(() => {
    if (clinic && user?.role === "doctor" && user?.id) {
      setDoctorFilterId(user.id);
    }
  }, [clinic, user?.role, user?.id]);

  // Force refetch and reset filters only when switching between clinic / non-clinic (or on initial mount).
  // Do not run when only searchParams reference changes, or filtered results get overwritten by default filters.
  const clinicRef = useRef(null); // null = not yet run; after first run holds previous clinic value
  useEffect(() => {
    const prevClinic = clinicRef.current;
    clinicRef.current = clinic;
    const isFirstRun = prevClinic === null;
    const clinicToggled = !isFirstRun && prevClinic !== clinic;
    if (isFirstRun) return; // initial list fetch comes from useQuery only
    if (!clinicToggled) return; // Skip when only searchParams or other deps changed

    queryClient.removeQueries({ queryKey: ["appointments-list"] });
    setListPage(1);
    setAppointments([]);
    setPagination({
      total: 0,
      page: 1,
      pages: 1,
      limit: itemsPerPage,
    });
    setSearchQuery("");
    setStatusFilter(clinic ? "booked" : "All");
    setPatientLessOnly(false);
    setDoctorFilterId(clinic && user?.role === "doctor" && user?.id ? user.id : "");
    setConsultationMode("all");
    setVisitTypeFilter("");

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
  }, [clinic, searchParams]);

  useEffect(() => {
    setListPage(1);
    setPagination((prev) => ({ ...prev, page: 1, limit: itemsPerPage }));
  }, [itemsPerPage]);

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

  // Handle status change click
  const handleStatusChangeClick = (appointment) => {
    setSelectedStatusAppointment(appointment);
    setShowStatusChangeModal(true);
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedStatusAppointment) return;
    
    try {
      showLoader();
      const response = await appointmentHelper.updateAppointmentStatusAdmin(
        selectedStatusAppointment.id, 
        { status: newStatus }
      );
      
      if (response.success) {
        toast.success("Status wizyty został zaktualizowany");
        // Update the appointments list
        setAppointments(appointments.map(apt =>
          apt.id === selectedStatusAppointment.id
            ? { ...apt, status: newStatus }
            : apt
        ));
      } else {
        toast.error("Nie udało się zaktualizować statusu wizyty");
      }
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Nie udało się zaktualizować statusu wizyty");
      }
    } finally {
      hideLoader();
      setShowStatusChangeModal(false);
      setSelectedStatusAppointment(null);
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

  const openVisitCardModal = (patientId, patientName) => {
    if (!patientId) return;
    setVisitCardPatientId(patientId);
    setVisitCardPatientName(patientName || "Pacjent");
    setShowVisitCardModal(true);
    setVisitCardsList([]);
    setVisitCardsError(null);
    setVisitCardsLoading(true);
    appointmentHelper.getVisitCardsByPatient(patientId).then((res) => {
      const data = res?.data ?? res;
      const list = Array.isArray(data?.visitCards) ? data.visitCards : [];
      setVisitCardsList(list);
      setVisitCardsError(res?.success === false ? res?.message : null);
    }).catch((err) => {
      setVisitCardsError(err?.response?.data?.message || err?.message || "Nie udało się pobrać listy kart wizyt.");
      setVisitCardsList([]);
    }).finally(() => setVisitCardsLoading(false));
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

  const deleteFromVisitHistoryRef = useRef(false);

  const handlePermanentDeleteClick = (appointmentId) => {
    deleteFromVisitHistoryRef.current = false;
    setDeleteDialog({
      open: true,
      id: appointmentId
    });
  };

  const handlePermanentDeleteFromVisitHistory = (visitId) => {
    deleteFromVisitHistoryRef.current = true;
    setDeleteDialog({ open: true, id: visitId });
  };

  const handlePermanentDeleteSuccess = () => {
    fetchAppointments(pagination.page);
    if (deleteFromVisitHistoryRef.current && visitHistoryPatient?.id) {
      deleteFromVisitHistoryRef.current = false;
      setVisitHistoryLoading(true);
      patientService.getPatientVisits(visitHistoryPatient.id).then((res) => {
        const data = res?.data ?? [];
        setVisitHistoryData(Array.isArray(data) ? data : []);
        setVisitHistoryError(res?.success === false ? res?.message : null);
      }).catch((err) => {
        setVisitHistoryError(err?.response?.data?.message || err?.message || "Nie udało się pobrać historii wizyt.");
        setVisitHistoryData([]);
      }).finally(() => setVisitHistoryLoading(false));
    }
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
      : statusFilter === "patientLess"
      ? "Do rejestracji"
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
  const getPhoneDisplay = (value) => {
    const v = value ?? "";
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (!s) return "brak numeru";
    if (/^_no_phone_/i.test(s) || s === "_no_phone" || /^brak\s*numeru$/i.test(s)) return "brak numeru";
    return s;
  };
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

  /** registrationType from API → Polish label */
  const getRegistrationTypeLabel = (value) => {
    if (!value || typeof value !== "string") return "—";
    const v = value.toLowerCase().trim();
    const map = {
      "online registration": "Rejestracja online",
      "online": "Rejestracja online",
      "reception": "W recepcji",
      "receptionist registration": "Rejestracja w recepcji",
      "receptionist": "Rejestracja w recepcji",
      "walk-in": "W recepcji",
      "walkin": "W recepcji",
      "in-person": "W recepcji",
      "phone": "Rejestracja telefoniczna",
      "telephone": "Rejestracja telefoniczna",
      "admin registration": "Rejestracja przez administrację",
      "administracja": "Rejestracja przez administrację",
    };
    return map[v] ?? value;
  };

  return (
    <div className={`min-h-screen ${clinic ? "bg-white" : "bg-gray-100"}`}>
      <div className={`w-full mx-auto py-8 ${clinic ? "px-6 sm:px-8 lg:px-10" : "px-4"}`}>
        <div className={clinic ? "mb-6" : "mb-6"}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {clinic ? "Historia wizyt" : "Lista pacjentów"}
              {!clinic && ` (${totalPatientsCount})`}
            </h1>
            {clinic && (
              <p className="text-sm text-gray-500">
                {dateRangeText}
                {statusFilter !== "All" && ` - Status: ${statusLabelForDisplay}`}
                {patientLessOnly && " - Tylko wizyty bez pacjenta"}
              </p>
            )}
          </div>

          {!clinic && dateRange.startDate && (
            <div className="mb-3">
              <button
                onClick={() => setDateRange({ startDate: null, endDate: null })}
                className="text-sm text-teal-700 hover:text-teal-900 font-medium underline"
              >
                Wyczyść filtr daty
              </button>
            </div>
          )}

          {clinic && (
            <div className="flex items-center gap-3 mb-6 flex-wrap mt-5">
              <div className="flex-1 relative min-w-[280px] max-w-2xl">
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
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[300px] w-[320px] p-4">
                    {/* Zakres dat */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Zakres dat</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Data początkowa</label>
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                            value={dateRange.startDate || ""}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Data końcowa</label>
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                            value={dateRange.endDate || ""}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Filtruj według lekarza — dla roli lekarz tylko własna wartość */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Filtruj według lekarza</h3>
                      <select
                        value={doctorFilterId}
                        onChange={(e) => setDoctorFilterId(e.target.value)}
                        className="w-full p-2.5 pr-9 border border-teal-500/50 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                      >
                        {clinic && user?.role === "doctor" ? (
                          <>
                            <option value={user.id}>{user.name || "Ty (lekarz)"}</option>
                          </>
                        ) : (
                          <>
                            <option value="">Wybierz lekarza...</option>
                            {doctorsList.map((d) => (
                              <option key={d._id || d.id} value={d._id || d.id}>{d.name || "Lekarz"}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    {/* Typ wizyty – from API with category segregation */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Typ wizyty</h3>
                      {visitReasonsCategories.length > 0 ? (
                        <VisitReasonCascadeDropdown
                          categories={visitReasonsCategories}
                          value={visitTypeFilter}
                          onChange={setVisitTypeFilter}
                          placeholder="Wybierz typ wizyty..."
                          className="w-full min-w-0"
                        />
                      ) : (
                        <select
                          value={visitTypeFilter}
                          onChange={(e) => setVisitTypeFilter(e.target.value)}
                          className="w-full p-2.5 pr-9 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                        >
                          <option value="">Wybierz typ wizyty...</option>
                        </select>
                      )}
                    </div>
                    {/* Forma konsultacji */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Forma konsultacji</h3>
                      <div className="space-y-2">
                        {[
                          { value: "all", label: "Wszystkie" },
                          { value: "offline", label: "Stacjonarna" },
                          { value: "online", label: "Online" },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="consultation-mode"
                              checked={consultationMode === opt.value}
                              onChange={() => setConsultationMode(opt.value)}
                              className="rounded-full border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Filtruj według statusu */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">Filtruj według statusu</h3>
                      <div className="space-y-2">
                        {[
                          { value: "All", label: "Wszystkie" },
                          { value: "booked", label: "Zarezerwowane" },
                          { value: "checkedIn", label: "Zameldowany" },
                          { value: "Cancelled", label: "Anulowane" },
                          { value: "Completed", label: "Zakończone" },
                          { value: "patientLess", label: "Do rejestracji" },
                        ].map((status) => (
                          <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="status-clinic"
                              checked={statusFilter === status.value}
                              onChange={() => setStatusFilter(status.value)}
                              className="rounded-full border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{status.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter(clinic ? "booked" : "All");
                          setDateRange({ startDate: clinic ? new Date().toISOString().split("T")[0] : null, endDate: null });
                          setDoctorFilterId(clinic && user?.role === "doctor" && user?.id ? user.id : "");
                          setPatientLessOnly(false);
                          setConsultationMode("all");
                          setVisitTypeFilter("");
                          setIsFilterOpen(false);
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                      >
                        Resetuj
                      </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium"
                >
                  Zastosuj
                </button>
                    </div>
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
                className="bg-teal-800 hover:bg-teal-900 text-white rounded-lg px-4 py-2.5 flex items-center gap-2 font-medium shrink-0 shadow-sm"
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
          /* Historia wizyt – flat list of white cards, full width */
          <div className="w-full max-w-full space-y-4">
            {user?.role === "admin" && appointments.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={selectedAppointmentIds.length === appointments.length && appointments.length > 0}
                    onChange={handleSelectAllAppointments}
                  />
                  Zaznacz wszystkie
                </label>
              </div>
            )}
            {listLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg px-6 py-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-gray-500">
                Brak wizyt w wybranym okresie.
              </div>
            ) : (
              appointments.map((appointment) => {
                const isCompleted = appointment.status === "completed" || appointment.status === "Completed";
                const isCancelledStatus = isCancelled(appointment);
                const isVisitOnly = isVisitOnlyAppointment(appointment);
                const statusPillClass = getStatusStyle(appointment.status);
                const visitDateStr = appointment.date
                  ? new Date(appointment.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "—";
                const patientIdStr = isVisitOnly
                  ? "—"
                  : (appointment.patient?.patientId ?? appointment.patient?.id ?? appointment.patient?._id ?? "—");
                const patientPeselStr = isVisitOnly
                  ? (appointment.registrationData?.pesel ?? "—")
                  : getPatientPesel(appointment.patient);
                const idOrPeselLine = isVisitOnly
                  ? (appointment.registrationData?.pesel ? `PESEL: ${appointment.registrationData.pesel}` : "—") + ` | ${visitDateStr}`
                  : (user?.role === "doctor"
                    ? `ID: ${patientIdStr} | ${visitDateStr}`
                    : `ID: ${patientIdStr} | PESEL: ${patientPeselStr} | ${visitDateStr}`);
                const cardBorderBg =
                  isCancelledStatus
                    ? "border-l-4 border-l-red-500 bg-red-50/50"
                    : isVisitOnly
                    ? "border-l-4 border-l-amber-500 bg-amber-50/50"
                    : "border-l-4 border-l-teal-700";
                const createdAtFormatted = formatAppointmentCreatedAt(appointment);

                return (
                  <div
                    key={appointment.id}
                    className={`bg-white border border-teal-100 rounded-lg shadow-sm px-6 py-5 flex items-center gap-6 hover:shadow-md transition-shadow ${cardBorderBg} ${user?.role === "admin" && selectedAppointmentIds.includes(appointment.id) ? "ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  >
                    {user?.role === "admin" && (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={selectedAppointmentIds.includes(appointment.id)}
                          onChange={() => handleSelectAppointment(appointment.id)}
                        />
                      </div>
                    )}
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        if (isVisitOnly && !isCancelledStatus) {
                          setSelectedAppointment(appointment);
                          setShowCompleteRegModal(true);
                        } else if (!isVisitOnly) {
                          const patientId = appointment.patient.id || appointment.patient._id;
                          if (user?.role === "receptionist") {
                            // For receptionists on Historia wizyt: open visit history modal instead of card/edit
                            openVisitHistoryModal(
                              patientId,
                              getAppointmentPatientDisplayName(appointment)
                            );
                          } else {
                            navigate(getPatientViewUrl(patientId, appointment.id));
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">
                          {getAppointmentPatientDisplayName(appointment)}
                        </span>
                        {isVisitOnly && !isCancelledStatus && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 bg-amber-100 text-amber-800 border border-amber-200">
                            <UserPlus size={12} />
                            Do rejestracji
                          </span>
                        )}
                        {appointment.registrationData?.registrationMethod === "ipad_kiosk" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 bg-teal-100 text-teal-800 border border-teal-200">
                            iPad
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {idOrPeselLine}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getVisitTypeDisplayLabel(appointment)}
                      </div>
                      {user?.role !== "doctor" && (
                        <div className="text-xs text-gray-500 mt-1">
                          Utworzono przez: {getCreatedByRoleLabel(appointment)}
                          {createdAtFormatted ? ` (${createdAtFormatted})` : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center text-center min-w-[120px] shrink-0">
                      <div className="font-semibold text-gray-900">
                        {appointment.startTime} – {appointment.endTime}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {stripDoctorTitle(appointment.doctor?.name) || "—"}
                      </div>
                      <span
                        role={getVisitMode(appointment) === "online" ? "button" : undefined}
                        tabIndex={getVisitMode(appointment) === "online" ? 0 : undefined}
                        onClick={(e) => {
                          if (getVisitMode(appointment) === "online") {
                            e.stopPropagation();
                            setOnlineDetailsAppointment(appointment);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (getVisitMode(appointment) === "online" && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            e.stopPropagation();
                            setOnlineDetailsAppointment(appointment);
                          }
                        }}
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getVisitModeStyle(appointment)} ${getVisitMode(appointment) === "online" ? "cursor-pointer hover:opacity-90" : ""}`}
                      >
                        {getVisitModeLabel(appointment)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3 flex-shrink-0 min-w-0 flex-1">
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
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCompleteRegModal(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zakończ rejestrację
                                </DropdownMenu.Item>
                              )}
                              {!isVisitOnlyAppointment(appointment) && (
                                <DropdownMenu.Item
                                  className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 rounded-md cursor-pointer"
                                  onClick={() => {
                                    const patientId = appointment.patient.id || appointment.patient._id;
                                    if (user?.role === "receptionist") {
                                      navigate(getPatientViewUrl(patientId, appointment.id || appointment._id));
                                    } else {
                                      navigate(getPatientViewUrl(patientId, appointment.id));
                                    }
                                  }}
                                >
                                  <Eye size={16} className="mr-2" /> Zobacz szczegóły
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => openVisitHistoryModal(appointment.patient.id || appointment.patient._id, getAppointmentPatientDisplayName(appointment))}>
                                  <History size={16} className="mr-2" /> Historia wizyt
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
                              {appointment.status === "completed" && appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => openVisitCardModal(appointment.patient.id || appointment.patient._id, getAppointmentPatientDisplayName(appointment))}>
                                  <FileText size={16} className="mr-2" /> Karta wizyty
                                </DropdownMenu.Item>
                              )}
                              {!["checkedIn", "completed", "cancelled"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={(e) => handleCancelClick(e, appointment.id)}>
                                  <X size={16} className="mr-2" /> Anuluj wizytę
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => fetchVisitConsents(appointment.id)}>
                                <FileText size={16} className="mr-2" /> Zobacz szczegóły rezerwacji
                              </DropdownMenu.Item>
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { navigate(`/administracja/konta?edytujPacjenta=${appointment.patient.id || appointment.patient._id}&appointmentId=${appointment.id || appointment._id}&returnUrl=${encodeURIComponent("/klinika")}`); }}>
                                  <Eye size={16} className="mr-2" /> Zobacz dane pacjenta
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                  onClick={() =>
                                    openPatientDocumentsModal(
                                      appointment.patient.id || appointment.patient._id,
                                      getAppointmentPatientDisplayName(appointment)
                                    )
                                  }
                                >
                                  <FolderOpen size={16} className="mr-2" /> Dokumenty pacjenta
                                </DropdownMenu.Item>
                              )}
                              {user?.role === "admin" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer" onClick={() => handleStatusChangeClick(appointment)}>
                                  <Settings size={16} className="mr-2" /> Zmień status
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
            <div className="grid grid-cols-8 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <div>Pacjent i ID</div>
              <div>Wiek</div>
              <div>Płeć</div>
              <div>PESEL</div>
              <div>Telefon</div>
              <div>Typ rejestracji</div>
              <div>Pierwsza wizyta</div>
              <div className="text-right">Akcje</div>
            </div>
            {listLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 animate-pulse grid grid-cols-8 gap-4">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded" />
                    ))}
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
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
                    className={`bg-white border border-gray-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow grid grid-cols-8 gap-4 px-4 py-3 items-center ${selectedAppointmentIds.includes(appointment.id) ? "ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  >
                    <div
                      className="min-w-0 cursor-pointer"
                      onClick={() => {
                        if (appointment.isAppointment !== false) {
                          if (isVisitOnlyAppointment(appointment) && !isCancelled(appointment)) {
                            setSelectedAppointment(appointment);
                            setShowCompleteRegModal(true);
                          } else if (!isVisitOnlyAppointment(appointment)) {
                            const patientId = appointment.patient.id || appointment.patient._id;
                            if (user?.role === "receptionist") {
                              openVisitHistoryModal(patientId, getAppointmentPatientDisplayName(appointment));
                            } else {
                              navigate(getPatientViewUrl(patientId, appointment.id));
                            }
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
                    <div className="text-gray-800 truncate text-sm">{getPhoneDisplay(appointment.patient?.phoneNumber ?? appointment.registrationData?.phone)}</div>
                    <div className="text-gray-800 truncate text-sm">{getRegistrationTypeLabel(appointment.registrationType)}</div>
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
                              {clinic && isVisitOnlyAppointment(appointment) && !isCancelled(appointment) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCompleteRegModal(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zakończ rejestrację
                                </DropdownMenu.Item>
                              )}
                              {!isVisitOnlyAppointment(appointment) && (
                                <DropdownMenu.Item
                                  className="flex items-center px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 rounded-md cursor-pointer"
                                  onClick={() => {
                                    const patientId = appointment.patient.id || appointment.patient._id;
                                    if (user?.role === "receptionist") {
                                      navigate(getPatientViewUrl(patientId, appointment.id || appointment._id));
                                    } else {
                                      navigate(getPatientViewUrl(patientId, appointment.id));
                                    }
                                  }}
                                >
                                  <Eye size={16} className="mr-2" /> Zobacz szczegóły
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => openVisitHistoryModal(appointment.patient.id || appointment.patient._id, getAppointmentPatientDisplayName(appointment))}>
                                  <History size={16} className="mr-2" /> Historia wizyt
                                </DropdownMenu.Item>
                              )}
                              {clinic && appointment.patient && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); setShowCheckin(true); }}>
                                  <UserCheck size={16} className="mr-2" /> Zamelduj
                                </DropdownMenu.Item>
                              )}
                              {clinic && (user?.role === "admin" || user?.role === "receptionist") && appointment.status === "booked" && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => handleRescheduleClick(appointment)}>
                                  <Clock size={16} className="mr-2" /> Przełóż wizytę
                                </DropdownMenu.Item>
                              )}
                              {clinic && appointment.patient && ["checkedIn", "booked"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { setSelectedAppointment(appointment); handleBillPatient(appointment.id, appointment.patient.id || appointment.patient._id); }}>
                                  <DollarSign size={16} className="mr-2" /> Wystaw rachunek
                                </DropdownMenu.Item>
                              )}
                              {clinic && appointment.status === "completed" && appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => openVisitCardModal(appointment.patient.id || appointment.patient._id, getAppointmentPatientDisplayName(appointment))}>
                                  <FileText size={16} className="mr-2" /> Karta wizyty
                                </DropdownMenu.Item>
                              )}
                              {clinic && !["checkedIn", "completed", "cancelled"].includes(appointment.status) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer" onClick={(e) => handleCancelClick(e, appointment.id)}>
                                  <X size={16} className="mr-2" /> Anuluj wizytę
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => fetchVisitConsents(appointment.id)}>
                                <FileText size={16} className="mr-2" /> Zobacz szczegóły rezerwacji
                              </DropdownMenu.Item>
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => { navigate(getPatientViewUrl(appointment.patient.id || appointment.patient._id, appointment.id || appointment._id)); }}>
                                  <Pen size={16} className="mr-2" /> Zobacz dane pacjenta
                                </DropdownMenu.Item>
                              )}
                              {appointment.patient && (appointment.patient.id || appointment.patient._id) && (
                                <DropdownMenu.Item
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                  onClick={() =>
                                    openPatientDocumentsModal(
                                      appointment.patient.id || appointment.patient._id,
                                      getAppointmentPatientDisplayName(appointment)
                                    )
                                  }
                                >
                                  <FolderOpen size={16} className="mr-2" /> Dokumenty pacjenta
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

        <div className="flex items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Na stronę:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Pagination (both /pacjenci and /klinika) */}
          {pagination.pages > 1 ? (
          <div className="flex justify-center gap-2">
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
          ) : <div />}
        </div>

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
          returnPath={(() => {
            const doctorId = user?.d_id || user?.id || "";
            return user?.role === "doctor" && doctorId ? `/lekarze/wizyty/${doctorId}` : "/lekarze";
          })()}
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

        <PatientDocumentsModal
          isOpen={showPatientDocumentsModal}
          onClose={() => {
            setShowPatientDocumentsModal(false);
            setDocumentsModalPatient(null);
          }}
          patientId={documentsModalPatient?.id}
          patientName={documentsModalPatient?.name}
        />

        {/* Visit history modal – GET /patients/:patientId/visits */}
        {showVisitHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
              <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-900">Historia wizyt – {visitHistoryPatient?.name ?? "Pacjent"}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowVisitHistoryModal(false);
                    setVisitHistoryPatient(null);
                    setVisitHistoryData([]);
                    setVisitHistoryError(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {visitHistoryLoading ? (
                  <div className="py-8 text-center text-gray-500">Ładowanie historii wizyt...</div>
                ) : visitHistoryError ? (
                  <div className="py-4 text-red-600 text-sm">{visitHistoryError}</div>
                ) : visitHistoryData.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">Brak wizyt dla tego pacjenta.</div>
                ) : (
                  <ul className="space-y-3">
                    {visitHistoryData.map((visit) => (
                      <li
                        key={visit.visitId}
                        className="flex flex-wrap items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">{visit.date ?? "—"}</span>
                            <span className="text-gray-600">{visit.time ?? "—"}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(visit.status)}`}>
                              {translateStatus(visit.status)}
                            </span>
                            {visit.mode && (
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${visit.mode === "online" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                                {visit.mode === "online" ? "Online" : "Stacjonarna"}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {visit.doctor?.name ? stripDoctorTitle(visit.doctor.name) : null}
                            {visit.doctor?.name && visit.visitType ? " · " : null}
                            {visit.visitType ? visit.visitType : null}
                          </div>
                          <VisitHistoryNotes notes={visit.notes ?? visit.consultationNotes} />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setShowVisitHistoryModal(false);
                              navigate(getPatientViewUrl(visitHistoryPatient?.id, visit.visitId));
                            }}
                            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                          >
                            Zobacz szczegóły
                          </button>
                          {user?.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => handlePermanentDeleteFromVisitHistory(visit.visitId)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Trwale usuń
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visit card picker modal – choose which visit's card to download */}
        {showVisitCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
              <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-900">Karta wizyty – {visitCardPatientName}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowVisitCardModal(false);
                    setVisitCardPatientId(null);
                    setVisitCardsList([]);
                    setVisitCardsError(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {visitCardsLoading ? (
                  <div className="py-8 text-center text-gray-500">Ładowanie kart wizyt...</div>
                ) : visitCardsError ? (
                  <div className="py-4 text-red-600 text-sm">{visitCardsError}</div>
                ) : visitCardsList.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">Brak kart wizyt dla tego pacjenta.</div>
                ) : (
                  <ul className="space-y-3">
                    {visitCardsList.map((item) => {
                      const dateStr = item.date ? new Date(item.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
                      const doctorName = item.doctor?.name ?? "—";
                      const hasCard = item.visitCard?.url;
                      return (
                        <li
                          key={item.appointmentId}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{dateStr} · {item.startTime || "—"}{item.endTime ? ` – ${item.endTime}` : ""}</div>
                            <div className="text-sm text-gray-600">{doctorName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.status ? (item.status === "completed" ? "Zakończona" : item.status) : "—"}
                              {hasCard ? " · Karta dostępna" : " · Brak karty"}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {hasCard ? (
                              <button
                                type="button"
                                onClick={() => window.open(item.visitCard.url, "_blank")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg"
                              >
                                <FileText size={16} /> Pobierz
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">Brak karty</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Online visit details modal */}
        {onlineDetailsAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOnlineDetailsAppointment(null)}>
            <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b px-4 py-3">
                <h3 className="text-lg font-medium text-gray-900">Wizyta online – szczegóły</h3>
                <button
                  type="button"
                  onClick={() => setOnlineDetailsAppointment(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Pacjent</div>
                  <div className="text-gray-900 font-medium">{getAppointmentPatientDisplayName(onlineDetailsAppointment)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Telefon</div>
                  <div className="text-gray-900">{getPhoneDisplay(onlineDetailsAppointment.patient?.phoneNumber ?? onlineDetailsAppointment.registrationData?.phone) || "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Data i godzina</div>
                  <div className="text-gray-900">{onlineDetailsAppointment.date ? new Date(onlineDetailsAppointment.date).toLocaleDateString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) : "—"} · {onlineDetailsAppointment.startTime || "—"}{onlineDetailsAppointment.endTime ? ` – ${onlineDetailsAppointment.endTime}` : ""}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Lekarz</div>
                  <div className="text-gray-900">{stripDoctorTitle(onlineDetailsAppointment.doctor?.name) || "—"}</div>
                </div>
                <div className="pt-2 border-t space-y-2">
                  {onlineDetailsAppointment.meetLink ? (
                    <a
                      href={onlineDetailsAppointment.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
                    >
                      <Eye size={16} /> Otwórz link do wizyty online
                    </a>
                  ) : null}
                  {(onlineDetailsAppointment.patient?.id ?? onlineDetailsAppointment.patient?._id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOnlineDetailsAppointment(null);
                        navigate(getPatientViewUrl(onlineDetailsAppointment.patient?.id ?? onlineDetailsAppointment.patient?._id, onlineDetailsAppointment.id));
                      }}
                      className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                      <Eye size={16} /> Otwórz kartę pacjenta
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit consents modal */}
        {showConsentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
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
                    {consentsData.patientData && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Dane pacjenta</h4>
                        <dl className="grid grid-cols-1 gap-1.5 text-sm">
                          {(consentsData.patientData.name != null && String(consentsData.patientData.name).trim() !== "") && (
                            <div><dt className="text-gray-500 inline">Imię i nazwisko: </dt><dd className="inline text-gray-900">{consentsData.patientData.name}</dd></div>
                          )}
                          {(consentsData.patientData.firstName != null && String(consentsData.patientData.firstName).trim() !== "") && (
                            <div><dt className="text-gray-500 inline">Imię: </dt><dd className="inline text-gray-900">{consentsData.patientData.firstName}</dd></div>
                          )}
                          {(consentsData.patientData.lastName != null && String(consentsData.patientData.lastName).trim() !== "") && (
                            <div><dt className="text-gray-500 inline">Nazwisko: </dt><dd className="inline text-gray-900">{consentsData.patientData.lastName}</dd></div>
                          )}
                          <div><dt className="text-gray-500 inline">E-mail: </dt><dd className="inline text-gray-900">{consentsData.patientData.email != null && String(consentsData.patientData.email).trim() !== "" ? consentsData.patientData.email : "—"}</dd></div>
                          <div><dt className="text-gray-500 inline">Telefon: </dt><dd className="inline text-gray-900">{consentsData.patientData.phone != null && String(consentsData.patientData.phone).trim() !== "" && !/_no_phone_/i.test(String(consentsData.patientData.phone)) ? (consentsData.patientData.phoneCode ? `${consentsData.patientData.phoneCode} ${consentsData.patientData.phone}` : consentsData.patientData.phone) : "—"}</dd></div>
                          <div><dt className="text-gray-500 inline">Płeć: </dt><dd className="inline text-gray-900">{consentsData.patientData.sex != null && String(consentsData.patientData.sex).trim() !== "" ? (consentsData.patientData.sex === "Male" ? "Mężczyzna" : consentsData.patientData.sex === "Female" ? "Kobieta" : consentsData.patientData.sex) : "—"}</dd></div>
                          <div><dt className="text-gray-500 inline">Data urodzenia: </dt><dd className="inline text-gray-900">{consentsData.patientData.dateOfBirth != null && String(consentsData.patientData.dateOfBirth).trim() !== "" ? (typeof consentsData.patientData.dateOfBirth === "string" && consentsData.patientData.dateOfBirth.match(/^\d{4}-\d{2}-\d{2}/) ? new Date(consentsData.patientData.dateOfBirth).toLocaleDateString("pl-PL") : consentsData.patientData.dateOfBirth) : "—"}</dd></div>
                          <div><dt className="text-gray-500 inline">PESEL / Nr dokumentu: </dt><dd className="inline text-gray-900">{consentsData.patientData.govtId != null && String(consentsData.patientData.govtId).trim() !== "" ? consentsData.patientData.govtId : "—"}</dd></div>
                        </dl>
                      </div>
                    )}
                    {consentsData.appointmentData && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Dane rezerwacji</h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-sm">
                          <div>
                            <dt className="text-gray-500 inline">Status: </dt>
                            <dd className="inline text-gray-900">{translateStatus(consentsData.appointmentData.status) || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">Data: </dt>
                            <dd className="inline text-gray-900">
                              {consentsData.appointmentData.date
                                ? new Date(consentsData.appointmentData.date).toLocaleDateString("pl-PL")
                                : "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">Godzina: </dt>
                            <dd className="inline text-gray-900">
                              {consentsData.appointmentData.startTime || "—"} - {consentsData.appointmentData.endTime || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">ID wizyty: </dt>
                            <dd className="inline text-gray-900">{consentsData.appointmentData.visitId || consentsData.visitId || "—"}</dd>
                          </div>
                        </dl>

                        {consentsData.appointmentData.reservation && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <h5 className="text-sm font-medium text-gray-800 mb-2">Szczegóły rezerwacji</h5>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-sm">
                              <div>
                                <dt className="text-gray-500 inline">Utworzono przez: </dt>
                                <dd className="inline text-gray-900">{consentsData.appointmentData.reservation.createdBy || "—"}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 inline">Utworzono: </dt>
                                <dd className="inline text-gray-900">
                                  {consentsData.appointmentData.reservation.createdAtDisplay ||
                                    (consentsData.appointmentData.reservation.createdAt
                                      ? new Date(consentsData.appointmentData.reservation.createdAt).toLocaleString("pl-PL")
                                      : "—")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 inline">Przełożona: </dt>
                                <dd className="inline text-gray-900">
                                  {consentsData.appointmentData.reservation.wasRescheduled ? "Tak" : "Nie"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 inline">Ostatnio przełożył: </dt>
                                <dd className="inline text-gray-900">{consentsData.appointmentData.reservation.latestRescheduledBy || "—"}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 inline">Ostatnie przełożenie: </dt>
                                <dd className="inline text-gray-900">{consentsData.appointmentData.reservation.latestRescheduledAt || "—"}</dd>
                              </div>
                            </dl>

                            {consentsData.appointmentData.reservation.summaryText && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Podsumowanie: </span>
                                {consentsData.appointmentData.reservation.summaryText}
                              </div>
                            )}

                            {Array.isArray(consentsData.appointmentData.reservation.history) &&
                              consentsData.appointmentData.reservation.history.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="text-sm font-medium text-gray-800 mb-2">Historia zmian</h6>
                                  <ul className="space-y-2">
                                    {consentsData.appointmentData.reservation.history.map((h, idx) => (
                                      <li key={`${h.at || idx}-${idx}`} className="text-xs bg-white border border-blue-100 rounded p-2 text-gray-700">
                                        <div>
                                          <span className="font-medium">Akcja:</span> {h.action || "—"} |{" "}
                                          <span className="font-medium">Kto:</span> {h.by || "—"} |{" "}
                                          <span className="font-medium">Kiedy:</span> {h.at || "—"}
                                        </div>
                                        {(h.previousDoctor || h.newDoctor) && (
                                          <div className="mt-1">
                                            <span className="font-medium">Lekarz:</span>{" "}
                                            {(h.previousDoctor?.name || "Nieznany")}
                                            {" -> "}
                                            {(h.newDoctor?.name || "Nieznany")}
                                          </div>
                                        )}
                                        <div className="mt-1">
                                          <span className="font-medium">Z:</span>{" "}
                                          {(h.previousDate ? new Date(h.previousDate).toLocaleDateString("pl-PL") : "—")} {h.previousStartTime || "—"}-{h.previousEndTime || "—"}
                                          {" -> "}
                                          <span className="font-medium">Na:</span>{" "}
                                          {(h.newDate ? new Date(h.newDate).toLocaleDateString("pl-PL") : "—")} {h.newStartTime || "—"}-{h.newEndTime || "—"}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}

                        {consentsData.appointmentData.notes && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <h5 className="text-sm font-medium text-gray-800 mb-1">Notatka rezerwacji</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {consentsData.appointmentData.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
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
            <div className="bg-white rounded-lg w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
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

        {/* Status Change Modal */}
        {showStatusChangeModal && selectedStatusAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Zmień status wizyty</h3>
                  <button
                    onClick={() => {
                      setShowStatusChangeModal(false);
                      setSelectedStatusAppointment(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Wybierz nowy status dla wizyty pacjenta: {selectedStatusAppointment?.patient?.firstName} {selectedStatusAppointment?.patient?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Obecny status: <span className="font-medium">{translateStatus(selectedStatusAppointment?.status)}</span>
                  </p>

                  <div className="space-y-3">
                    {[
                      { value: 'booked', label: translateStatus('booked'), color: getStatusStyle('booked') },
                      { value: 'checkedIn', label: translateStatus('checkedIn'), color: getStatusStyle('checkedIn') },
                      { value: 'completed', label: translateStatus('completed'), color: getStatusStyle('completed') },
                      { value: 'cancelled', label: translateStatus('cancelled'), color: getStatusStyle('cancelled') },
                      { value: 'no-show', label: translateStatus('no-show'), color: getStatusStyle('no-show') }
                    ].map(status => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusUpdate(status.value)}
                        disabled={selectedStatusAppointment?.status === status.value}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedStatusAppointment?.status === status.value 
                            ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{status.label}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                            {status.value}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowStatusChangeModal(false);
                      setSelectedStatusAppointment(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Anuluj
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
