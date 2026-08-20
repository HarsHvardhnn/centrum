import React, { useEffect, useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCcw,
  AlertCircle,
  Eye,
  UserCheck,
  UserPlus,
  DollarSign,
  FileText,
  X,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import patientService from "../../helpers/patientHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import { useUser } from "../../context/userContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import billingHelper from "../../helpers/billingHelper";
import { createPortal } from "react-dom";
import CheckInModal from "../admin/CheckinModal";
import CompleteRegistrationModal from "../admin/CompleteRegistrationModal";
import {
  translateStatus,
  getStatusStyle,
  getVisitModeLabel,
  getVisitModeStyle,
  getCreatedByRoleLabel,
  getVisitTypeDisplayLabel,
  stripDoctorTitle,
  APPOINTMENT_STATUS_NO_SHOW,
  isCancelledStatus,
} from '../../utils/statusHelper';
import BillingConfirmationModal from "../Billing/BillingConfirmationModal";
import RescheduleModal from "./RescheduleModal";
import PermanentDeleteDialog from "../admin/PermanentDeleteDialog";
import { queryKeys } from "../../lib/queryKeys";
import { readListState, writeListState, useSkipFirstEffect, useListScrollRestore } from "../../hooks/usePersistedListState";

const MedicalDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="">
        <DoctorAppointmentChart />
      </div>

      <PatientList />

      {user?.role !== "doctor" && <UpcomingAppointments />}
    </div>
  );
};

// Doctor Appointment Chart Component (Wizyty lekarskie – tiles + date range only)
const DoctorAppointmentChart = () => {
  const { user } = useUser();
  const savedChart = readListState("admin-dashboard-chart") || {};
  const [selectedDoctor, setSelectedDoctor] = useState(savedChart.selectedDoctor || "");
  const [timeframe, setTimeframe] = useState(savedChart.timeframe || "month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    data: doctorsResponse,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useQuery({
    queryKey: queryKeys.doctorsList,
    queryFn: () => doctorStatsHelper.getDoctorsList(),
  });

  const doctors = doctorsResponse?.success ? (doctorsResponse.data || []) : [];

  useEffect(() => {
    if (!doctors.length) return;
    if (user?.role === "doctor" && (user?._id || user?.id)) {
      setSelectedDoctor(user._id || user.id);
    } else if (!selectedDoctor) {
      setSelectedDoctor(doctors[0]._id);
    }
  }, [doctors, user, selectedDoctor]);

  useEffect(() => {
    writeListState("admin-dashboard-chart", { selectedDoctor, timeframe });
  }, [selectedDoctor, timeframe]);

  const {
    data: statsResponse,
    isLoading: statsLoading,
    isFetching: statsFetching,
    error: statsError,
    refetch: refetchStatistics,
  } = useQuery({
    queryKey: queryKeys.dashboardStats(selectedDoctor, timeframe),
    queryFn: () => doctorStatsHelper.getAppointmentStats(selectedDoctor, timeframe),
    enabled: !!selectedDoctor,
  });

  const statsData = statsResponse?.success ? statsResponse.data : null;
  const loading = doctorsLoading || ((statsLoading || statsFetching) && !statsData);
  const error =
    doctorsError
      ? "Błąd podczas pobierania listy lekarzy"
      : statsError
        ? (statsError.response?.data?.message || "Błąd podczas pobierania statystyk")
        : (!doctorsResponse || doctorsResponse.success
            ? null
            : "Nie udało się pobrać listy lekarzy");

  const fetchStatistics = () => {
    refetchStatistics();
  };

  const getSelectedDoctorName = () => {
    const doctor = doctors.find(d => d._id === selectedDoctor);
    return doctor ? stripDoctorTitle(doctor.name) : "Wszyscy lekarze";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Wizyty lekarskie</h2>
        <div className="flex items-center gap-2">
          {user?.role !== "doctor" ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm">{getSelectedDoctorName()}</span>
                <ChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100">
                  <ul className="py-1 max-h-60 overflow-y-auto">
                    {doctors.map((doctor) => (
                      <li
                        key={doctor._id}
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${selectedDoctor === doctor._id ? "bg-teal-50 text-teal-700" : ""}`}
                        onClick={() => {
                          setSelectedDoctor(doctor._id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {stripDoctorTitle(doctor.name)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md px-3 py-1">
              <span className="text-sm">{getSelectedDoctorName()}</span>
            </div>
          )}
          <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${timeframe === "day" ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setTimeframe("day")}
            >
              Dzień
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${timeframe === "week" ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setTimeframe("week")}
            >
              Tydzień
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${timeframe === "month" ? "bg-teal-100 text-teal-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setTimeframe("month")}
            >
              Miesiąc
            </button>
          </div>
          <button
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md"
            onClick={fetchStatistics}
            title="Odśwież"
          >
            <RefreshCcw size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={32} className="text-red-500 mb-2" />
          <p className="text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-md text-sm"
            onClick={fetchStatistics}
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : !statsData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-600">Brak danych dla wybranego lekarza i okresu</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-teal-800">{statsData.zarezerwowane ?? 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Zarezerwowane</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-teal-800">{statsData.zakończone ?? 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Zakończone</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-teal-800">{statsData.anulowane ?? 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Anulowane</p>
            </div>
          </div>
          {statsData.rangeLabel && (
            <p className="text-sm text-gray-500">{statsData.rangeLabel}</p>
          )}
        </>
      )}
    </div>
  );
};

// Lab Appointments Card Component
// const LabAppointmentsCard = () => {
//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-medium">Wizyty laboratoryjne</h2>
//         <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1">
//           <span className="text-sm">Miesiąc</span>
//           <ChevronDown size={16} />
//         </button>
//       </div>

//       <div className="flex justify-center py-4">
//         <div className="relative w-48 h-48">
//           {/* Circular multi-ring progress chart */}
//           <svg className="w-full h-full" viewBox="0 0 100 100">
//             {/* Outer background ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="42"
//               fill="none"
//               stroke="#E6F7F5"
//               strokeWidth="8"
//             />

//             {/* Middle background ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="32"
//               fill="none"
//               stroke="#E6F7F5"
//               strokeWidth="8"
//             />

//             {/* Inner background ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="22"
//               fill="none"
//               stroke="#E6F7F5"
//               strokeWidth="8"
//             />

//             {/* Outer progress ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="42"
//               fill="none"
//               stroke="#5BBFB5"
//               strokeWidth="8"
//               strokeDasharray="264"
//               strokeDashoffset="70"
//               strokeLinecap="round"
//               transform="rotate(-90 50 50)"
//             />

//             {/* Middle progress ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="32"
//               fill="none"
//               stroke="#5BBFB5"
//               strokeWidth="8"
//               strokeDasharray="201"
//               strokeDashoffset="100"
//               strokeLinecap="round"
//               transform="rotate(-90 50 50)"
//             />

//             {/* Inner progress ring */}
//             <circle
//               cx="50"
//               cy="50"
//               r="22"
//               fill="none"
//               stroke="#5BBFB5"
//               strokeWidth="8"
//               strokeDasharray="138"
//               strokeDashoffset="50"
//               strokeLinecap="round"
//               transform="rotate(-90 50 50)"
//             />
//           </svg>

//           {/* Center content */}
//           <div className="absolute inset-0 flex flex-col items-center justify-center">
//             <div className="text-sm text-gray-600">Appointment</div>
//             <div className="text-3xl font-bold">2,350</div>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-center gap-4 mt-2">
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 rounded-full bg-teal-500"></div>
//           <span className="text-xs text-gray-600">12 Completed</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 rounded-full bg-teal-700"></div>
//           <span className="text-xs text-gray-600">Series 2</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 rounded-full bg-teal-300"></div>
//           <span className="text-xs text-gray-600">60 Completed</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// Patient List Component
const PatientList = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [actionLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingServices, setBillingServices] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCompleteRegModal, setShowCompleteRegModal] = useState(false);
  const [showConsentsModal, setShowConsentsModal] = useState(false);
  const [consentsModalVisitId, setConsentsModalVisitId] = useState(null);
  const [consentsData, setConsentsData] = useState(null);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [consentsError, setConsentsError] = useState(null);

  // Visit history modal (used for receptionist)
  const [showVisitHistoryModal, setShowVisitHistoryModal] = useState(false);
  const [visitHistoryPatient, setVisitHistoryPatient] = useState(null);
  const [visitHistoryData, setVisitHistoryData] = useState([]);
  const [visitHistoryLoading, setVisitHistoryLoading] = useState(false);
  const [visitHistoryError, setVisitHistoryError] = useState(null);

  const [sendSMSNotification, setSendSMSNotification] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const savedDashList = readListState("admin-dashboard-visits") || {};
  const [pagination, setPagination] = useState({
    currentPage: Number(savedDashList.currentPage) > 0 ? Number(savedDashList.currentPage) : 1,
    total: 0,
    pages: 1,
  });
  const [refreshCounter, setRefreshCounter] = useState(0);
  /** Status filter for today's list: 'all' | 'reserved' | 'completed' | 'cancelled' (sent to API). */
  const [statusFilter, setStatusFilter] = useState(savedDashList.statusFilter || "all");
  /** Date for the list (YYYY-MM-DD); default today. */
  const [selectedDate, setSelectedDate] = useState(
    savedDashList.selectedDate || new Date().toISOString().split("T")[0]
  );
  /** When true, show only patient-less (visit-only) appointments. */
  const [patientLessOnly, setPatientLessOnly] = useState(!!savedDashList.patientLessOnly);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const skipDashPageReset = useSkipFirstEffect();

  const navigate = useNavigate();
  const location = useLocation();

  /** Visit-only: no patient linked (dashboard API uses patient_id) */
  const isVisitOnlyAppointment = (apt) => !apt?.patient_id;

  /** Cancelled status (not the same as no_show / niestawiennictwo). */
  const isCancelled = (apt) => isCancelledStatus(apt);

  /** Receptionist goes to edit patient (Settings); admin/doctor go to appointment card. */
  const getPatientViewUrl = (patientId, appointmentId) => {
    if (user?.role === "receptionist") {
      return `/administracja/konta?edytujPacjenta=${patientId}&returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    return `/szczegoly-pacjenta/${patientId}${appointmentId ? `?appointmentId=${appointmentId}` : ""}`;
  };

  const openVisitHistoryModal = (patientId, patientName) => {
    if (!patientId) return;
    setVisitHistoryPatient({ id: patientId, name: patientName || "Pacjent" });
    setShowVisitHistoryModal(true);
    setVisitHistoryError(null);
    setVisitHistoryData([]);
    setVisitHistoryLoading(true);

    patientService
      .getPatientVisits(patientId)
      .then((res) => {
        const data = res?.data ?? res;
        setVisitHistoryData(Array.isArray(data) ? data : []);
        setVisitHistoryError(res?.success === false ? res?.message : null);
      })
      .catch((err) => {
        setVisitHistoryError(
          err?.response?.data?.message || err?.message || "Nie udało się pobrać historii wizyt."
        );
        setVisitHistoryData([]);
      })
      .finally(() => setVisitHistoryLoading(false));
  };

  const restoredVisitHistoryRef = useRef(false);
  useEffect(() => {
    if (restoredVisitHistoryRef.current) return;
    const savedHistory = savedDashList.visitHistory;
    if (!savedHistory?.id) return;
    restoredVisitHistoryRef.current = true;
    openVisitHistoryModal(savedHistory.id, savedHistory.name);
  }, []);

  const formatPolishDate = (dateValue) => {
    if (!dateValue) return "—";
    const s = String(dateValue).trim();
    if (!s) return "—";

    // Backend sends: DD.MM.YYYY (e.g. 20.03.2026)
    const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) {
      const day = Number(m[1]);
      const monthIndex = Number(m[2]) - 1;
      const year = Number(m[3]);
      const d = new Date(year, monthIndex, day);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("pl-PL");
      }
    }

    // Fallback: try native parsing (ISO, etc.)
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("pl-PL");
    return s; // last resort: show raw string
  };

  /** Map UI status filter to API status param (omit for 'all'). */
  const getApiStatus = () => {
    if (statusFilter === "all") return undefined;
    if (statusFilter === "reserved") return "booked";
    if (statusFilter === "completed") return "completed";
    if (statusFilter === "cancelled") return "cancelled";
    if (statusFilter === APPOINTMENT_STATUS_NO_SHOW) return APPOINTMENT_STATUS_NO_SHOW;
    return undefined;
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

  // Function to handle billing confirmation
  const handleBillPatient = async (appointmentId, patientId) => {
    try {
      setLoading(true);
      // Fetch patient services for this appointment
      const response = await patientServicesHelper.getPatientServices(
        patientId,
        { appointmentId }
      );

      // Store the entire response data
      setBillingServices(response);
      setShowBillingModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch patient services:", error);
      toast.error("Nie udało się pobrać informacji o płatnościach");
      setLoading(false);
    }
  };

  // Function to confirm billing
  const confirmBilling = async (billingData) => {
    try {
      setLoading(true);

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
        billedAt: billingData.billedAt,
        invoiceId: billingData.invoiceId,
      };

      // Call the API to generate the bill
      const response = await billingHelper.generateBill(selectedAppointment._id, billingPayload);

      // Update local state
      setPatients(
        patients.map((apt) =>
          apt._id === selectedAppointment._id
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
      setLoading(false);
      
      // Redirect to billing details
      navigate(`/administracja/rozliczenia/szczegoly/${response.data._id}`);
    } catch (error) {
      console.error("Failed to generate bill:", error);
      toast.error(
        error?.response?.data?.message ||
          "Nie udało się wygenerować rachunku. Spróbuj ponownie."
      );
      setLoading(false);
    }
  };

  const handleCancelClick = (e, appointmentId) => {
    e.stopPropagation();
    setSelectedAppointment(appointmentId);
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    try {
      await appointmentHelper.cancelAppointment(selectedAppointment, "Canceled by user", sendSMSNotification, sendEmailNotification);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setSendSMSNotification(false);
      setSendEmailNotification(false);
      queryClient.invalidateQueries({ queryKey: ["dashboard-today-list"] });
    } catch (err) {
      console.error("Error canceling appointment:", err);
      setError("błąd serwera");
    }
  };

  const handleAppointmentUpdate = (appointmentId, newStatus) => {
    setPatients(patients.map(patient => 
      patient._id === appointmentId 
        ? { ...patient, status: newStatus }
        : patient
    ));
  };

  // Fetch patients for selected date; filter by status on backend via API params
  const apiStatus = getApiStatus();
  const dashListParams = {
    page: pagination.currentPage,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
    startDate: selectedDate,
    endDate: selectedDate,
    ...(apiStatus && { status: apiStatus }),
    ...(patientLessOnly && { patientLessOnly: true }),
    ...(user?.role === "doctor" && user?.id ? { doctor: user.id } : {}),
  };

  const {
    data: dashListData,
    isLoading: dashListLoading,
    isFetching: dashListFetching,
    error: dashListError,
  } = useQuery({
    queryKey: ["dashboard-today-list", dashListParams, refreshCounter],
    queryFn: () => patientService.getSimpliefiedAppointmentsList(dashListParams),
    placeholderData: keepPreviousData,
  });

  const loading = actionLoading || dashListLoading || (dashListFetching && patients.length === 0);

  useEffect(() => {
    if (!dashListData) return;
    setPatients(dashListData.appointments || []);
    setPagination({
      currentPage: dashListData.currentPage ?? pagination.currentPage,
      total: dashListData.total ?? 0,
      pages: dashListData.pages ?? 1,
    });
    setError(null);
  }, [dashListData]);

  useEffect(() => {
    if (dashListError) {
      setError("błąd serwera");
      console.error("Error fetching patients:", dashListError);
    }
  }, [dashListError]);

  // Reset to first page when status, date or patientLessOnly changes
  useEffect(() => {
    if (skipDashPageReset()) return;
    setPagination((prev) => (prev.currentPage === 1 ? prev : { ...prev, currentPage: 1 }));
  }, [statusFilter, selectedDate, patientLessOnly]);

  useEffect(() => {
    writeListState("admin-dashboard-visits", {
      statusFilter,
      selectedDate,
      patientLessOnly,
      currentPage: pagination.currentPage,
      visitHistory:
        showVisitHistoryModal && visitHistoryPatient?.id
          ? { id: visitHistoryPatient.id, name: visitHistoryPatient.name || "" }
          : null,
    });
  }, [statusFilter, selectedDate, patientLessOnly, pagination.currentPage, showVisitHistoryModal, visitHistoryPatient]);

  useListScrollRestore("admin-dashboard-visits", !dashListLoading);


  const translateSexToPolish = (sex) => {
    switch (sex) {
      case "Male":
        return "Mężczyzna";
      case "Female":
        return "Kobieta";
      case "Others":
        return "Inna";
      default:
        return "Nieznany";
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((p) => p.id));
    }
  };

  const toggleSelectPatient = (id) => {
    if (selectedPatients.includes(id)) {
      setSelectedPatients(selectedPatients.filter((pId) => pId !== id));
    } else {
      setSelectedPatients([...selectedPatients, id]);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, currentPage: newPage });
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    // Current page is always shown
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxButtons / 2)
    );
    let endPage = Math.min(pagination.pages, startPage + maxButtons - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${
            i === pagination.currentPage
              ? "bg-teal-50 text-teal-700 font-medium"
              : "text-gray-600"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
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

  const handleRescheduleSuccess = async (rescheduledData) => {
    // Update the appointment in the list with new data
    setPatients(patients.map(patient => 
      patient._id === selectedAppointment._id 
        ? {
            ...patient,
            date: rescheduledData.appointment.date,
            startTime: rescheduledData.appointment.startTime,
            mode: rescheduledData.appointment.mode
          }
        : patient
    ));
    
    // Refresh the patient list (same date + status filter)
    const apiStatus = getApiStatus();
    const params = {
      page: pagination.currentPage,
      limit: 10,
      sortBy: "date",
      sortOrder: "desc",
      startDate: selectedDate,
      endDate: selectedDate,
      ...(apiStatus && { status: apiStatus }),
      ...(patientLessOnly && { patientLessOnly: true }),
      ...(user?.role === "doctor" && user?.id ? { doctor: user.id } : {}),
    };
    try {
      setLoading(true);
      const response = await patientService.getSimpliefiedAppointmentsList(params);
      setPatients(response.appointments || []);
      setPagination((prev) => ({
        ...prev,
        currentPage: response.currentPage ?? prev.currentPage,
        total: response.total ?? prev.total,
        pages: response.pages ?? prev.pages,
      }));
      setError(null);
    } catch (err) {
      setError("błąd serwera");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">
            {isToday ? "Wizyty dzisiaj" : "Wizyty na dzień"} ({pagination.total})
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Data:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </label>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none p-1">
              <MoreVertical size={20} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-md shadow-lg z-50 border p-1"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${statusFilter === "all" ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setStatusFilter("all")}
              >
                Wszystkie
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${statusFilter === "reserved" ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setStatusFilter("reserved")}
              >
                Zarezerwowane
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${statusFilter === "completed" ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setStatusFilter("completed")}
              >
                Zakończone
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${statusFilter === "cancelled" ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setStatusFilter("cancelled")}
              >
                Anulowane
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${statusFilter === APPOINTMENT_STATUS_NO_SHOW ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setStatusFilter(APPOINTMENT_STATUS_NO_SHOW)}
              >
                Niestawiennictwo
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              <DropdownMenu.Item
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${patientLessOnly ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setPatientLessOnly((prev) => !prev)}
              >
                {patientLessOnly ? "✓ " : ""}Tylko wizyty bez pacjenta
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Potwierdź anulowanie</h3>
            <p className="text-gray-600 mb-6">Czy na pewno chcesz anulować tę wizytę? Tej operacji nie można cofnąć.</p>
            
            <div className="mb-6">
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setSendSMSNotification(false);
                  setSendEmailNotification(false);
                }}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleCancelAppointment}
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : patients.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Brak pacjentów</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {/* <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selectedPatients.length === patients.length &&
                      patients.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th> */}
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Imię i Nazwisko Pacjenta
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Rodzaj wizyty
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 flex items-center">
                  Płeć <ArrowDown size={14} className="ml-1" />
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Wiek
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Lekarz prowadzący
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Data wizyty
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Tryb wizyty
                </th>
                {user?.role !== "doctor" && (
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Utworzono przez
                  </th>
                )}
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className={`hover:bg-gray-50 ${
                    isCancelled(patient)
                      ? "border-l-4 border-l-red-500 bg-red-50/50"
                      : isVisitOnlyAppointment(patient)
                        ? "border-l-4 border-l-amber-500 bg-amber-50/50"
                        : ""
                  }`}
                >
                  <td
                    className="py-4 px-4 cursor-pointer"
                    onClick={() => {
                      const activeStatus = ["booked", "checkedIn", ""].includes((patient.status ?? "").toString().toLowerCase().trim());
                      if (isVisitOnlyAppointment(patient) && !isCancelled(patient) && activeStatus) {
                        setSelectedAppointment(patient);
                        setShowCompleteRegModal(true);
                      } else if (!isVisitOnlyAppointment(patient)) {
                        if (user?.role === "receptionist") {
                          const patientId =
                            patient.patientObjectId ??
                            patient.patient_id ??
                            patient.patientId ??
                            patient.patient?.id ??
                            patient.patient?._id;
                          openVisitHistoryModal(patientId, patient.name || patient.registrationData?.name || "Pacjent");
                        } else {
                          navigate(getPatientViewUrl(patient.patient_id, patient._id));
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{patient.name || patient.registrationData?.name || (patient.patient?.name ?? "Nieznany pacjent")}</span>
                      {isVisitOnlyAppointment(patient) && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            isCancelled(patient)
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                          title={isCancelled(patient) ? "Wizyta anulowana" : "Wizyta bez pacjenta – zakończ rejestrację"}
                        >
                          <UserPlus size={12} />
                          {isCancelled(patient) ? "Anulowana" : "Do rejestracji"}
                        </span>
                      )}
                      {patient.registrationData?.registrationMethod === "ipad_kiosk" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 bg-teal-100 text-teal-800 border border-teal-200">
                          iPad
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isVisitOnlyAppointment(patient) ? "—" : (patient.patientId || patient.patient_id || "—")}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>
                        {getVisitTypeDisplayLabel(patient)}
                      </span>
                      {patient.visitTypeVerified === false && patient.status !== "completed" && patient.status !== "Completed" && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Do weryfikacji</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {translateSexToPolish(patient.sex) || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.age || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    {patient.status ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(patient.status)}`}
                      >
                        {translateStatus(patient.status)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {stripDoctorTitle(patient.doctor) || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(patient.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) || "N/A"}
                  </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitModeStyle(patient)}`}
                      >
                        {getVisitModeLabel(patient)}
                      </span>
                    </td>
                    {user?.role !== "doctor" && (
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {getCreatedByRoleLabel(patient)}
                      </td>
                    )}
                    <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[220px] bg-white rounded-md shadow-lg z-50 border p-1"
                            sideOffset={5}
                          >
                            {isVisitOnlyAppointment(patient) && !isCancelled(patient) && ["booked", "checkedIn", ""].includes((patient.status ?? "").toString().toLowerCase().trim()) ? (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-md cursor-pointer"
                                onClick={() => {
                                  setSelectedAppointment(patient);
                                  setShowCompleteRegModal(true);
                                }}
                              >
                                <UserPlus size={16} className="mr-2" />
                                Zakończ rejestrację
                              </DropdownMenu.Item>
                            ) : !isVisitOnlyAppointment(patient) ? (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                onClick={() => navigate(getPatientViewUrl(patient.patient_id, patient._id))}
                              >
                                <Eye size={16} className="mr-2" />
                                Zobacz szczegóły
                              </DropdownMenu.Item>
                            ) : null}

                            {isCancelled(patient) && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                onClick={() => fetchVisitConsents(patient._id)}
                              >
                                <FileText size={16} className="mr-2" />
                                Zobacz zgody
                              </DropdownMenu.Item>
                            )}

                            {!isVisitOnlyAppointment(patient) && patient.status === "booked" && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                onClick={() => {
                                  setSelectedAppointment(patient);
                                  setShowCheckin(true);
                                }}
                              >
                                <UserCheck size={16} className="mr-2" />
                                Zamelduj
                              </DropdownMenu.Item>
                            )}

                            {/* Reschedule option for admin and receptionist */}
                            {(user?.role === "admin" || user?.role === "receptionist") && patient.status === "booked" && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                onClick={() => handleRescheduleClick(patient)}
                              >
                                <Clock size={16} className="mr-2" />
                                Przełóż wizytę
                              </DropdownMenu.Item>
                            )}

                            {!isVisitOnlyAppointment(patient) && ["checkedIn", "booked"].includes(patient.status) && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                onClick={() => {
                                  setSelectedAppointment(patient);
                                  handleBillPatient(patient._id, patient.patient_id);
                                }}
                              >
                                <DollarSign size={16} className="mr-2" />
                                Wystaw rachunek
                              </DropdownMenu.Item>
                            )}

                            {!["checkedIn", "completed", "cancelled", "canceled"].includes(patient.status?.toLowerCase?.()) && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                onClick={(e) => {
                                  handleCancelClick(e, patient._id);
                                }}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Anuluj wizytę
                              </DropdownMenu.Item>
                            )}
                            {user?.role === "admin" && (
                              <DropdownMenu.Item
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                onClick={() => setDeleteDialog({ open: true, id: patient._id })}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Trwale usuń
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Confirmation Modal */}
      <BillingConfirmationModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        onConfirm={confirmBilling}
        patientServicesData={billingServices}
        patientName={selectedAppointment?.name || selectedAppointment?.registrationData?.name || selectedAppointment?.patient?.name || "Nieznany pacjent"}
        appointmentId={selectedAppointment?.id}
        patientId={selectedAppointment?.patient_id}
        returnPath={(() => {
          const doctorId = user?.d_id || user?.id || "";
          return user?.role === "doctor" && doctorId ? `/lekarze/wizyty/${doctorId}` : "/lekarze";
        })()}
      />

      {/* Visit history modal */}
      {showVisitHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
            <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Historia wizyt – {visitHistoryPatient?.name ?? "Pacjent"}
              </h3>
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
                  {visitHistoryData.map((visit, idx) => {
                    const key = visit.visitId ?? visit._id ?? `${visit.date ?? ""}-${visit.time ?? idx}`;
                    const timeLabel =
                      visit.time ??
                      (visit.startTime && visit.endTime ? `${visit.startTime} – ${visit.endTime}` : "—");

                    return (
                      <li
                        key={key}
                        className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">
                              {formatPolishDate(visit.date)}
                            </div>
                            <div className="text-sm text-gray-600">{timeLabel}</div>
                            {visit.doctor?.name && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                Lekarz: {visit.doctor.name}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(
                                visit.status
                              )}`}
                            >
                              {translateStatus(visit.status)}
                            </span>
                            {visit.mode && (
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getVisitModeStyle({
                                  mode: visit.mode,
                                })}`}
                              >
                                {visit.mode === "online" ? "Online" : "Stacjonarna"}
                              </span>
                            )}
                          </div>
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

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={showCheckin}
        setIsOpen={setShowCheckin}
        patientData={{ ...selectedAppointment, id: selectedAppointment?.patient_id } || {}}
        appointmentId={selectedAppointment?._id}
        onAppointmentUpdate={handleAppointmentUpdate}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={selectedAppointment}
        onRescheduleSuccess={handleRescheduleSuccess}
      />

      {/* Permanent Delete Dialog (admin) */}
      <PermanentDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        type="appointment"
        id={deleteDialog.id}
        title="Trwale usuń wizytę?"
        message="Ta operacja jest nieodwracalna. Wizyta oraz powiązane rekordy zostaną trwale usunięte."
        onSuccess={() => {
          setDeleteDialog({ open: false, id: null });
          setRefreshCounter((c) => c + 1);
        }}
      />

      {/* Complete registration modal - for visits without patient.
          Dashboard appointments endpoint now returns full registrationData,
          so we can pass selectedAppointment directly and let the modal prefill from it. */}
      <CompleteRegistrationModal
        isOpen={showCompleteRegModal}
        onClose={() => {
          setShowCompleteRegModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          setRefreshCounter((c) => c + 1);
        }}
      />

      {/* Visit consents modal (cancelled visits) */}
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

      <div className="p-4 flex items-center justify-between border-t border-gray-200">
        <button
          className={`flex items-center gap-2 text-sm border border-gray-200 rounded-md px-3 py-1 ${
            pagination.currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 cursor-pointer"
          }`}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft size={16} />
          <span>Poprzednia</span>
        </button>

        <div className="flex items-center gap-2">
          {renderPaginationButtons()}
          {pagination.pages > 7 &&
            pagination.currentPage < pagination.pages - 3 && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600"
                  onClick={() => handlePageChange(pagination.pages)}
                >
                  {pagination.pages}
                </button>
              </>
            )}
        </div>

        <button
          className={`flex items-center gap-2 text-sm border border-gray-200 rounded-md px-3 py-1 ${
            pagination.currentPage === pagination.pages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 cursor-pointer"
          }`}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.pages}
        >
          <span>Następna</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Clock component for upcoming appointments
const Clock = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ChevronDown component
const ChevronDown = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Upcoming Appointments Component
const UpcomingAppointments = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const limit = 4;

  const getPatientViewUrl = (patientId, appointmentId) => {
    if (user?.role === "receptionist") {
      return `/administracja/konta?edytujPacjenta=${patientId}&returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    return `/szczegoly-pacjenta/${patientId}${appointmentId ? `?appointmentId=${appointmentId}` : ""}`;
  };

  const {
    data: dashboardData,
    isLoading: loading,
    error: dashboardError,
  } = useQuery({
    queryKey: queryKeys.dashboardAppointments(page, limit),
    queryFn: () => appointmentHelper.getAppointmentsDashboard(page, limit),
    placeholderData: keepPreviousData,
  });

  const rawList = dashboardData?.data ?? [];
  const appointments = rawList.filter(
    (apt) =>
      apt.patientObjectId != null ||
      apt.patient_id != null ||
      apt.patientId != null ||
      (apt.patient != null && (apt.patient.id ?? apt.patient._id))
  );
  const pagination = dashboardData?.pagination ?? { total: 0, limit, totalPages: 0 };
  const error = dashboardError ? "błąd serwera" : null;

  const fetchAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-appointments"] });
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentHelper.cancelAppointment(
        appointmentId,
        "Canceled by user"
      );
      // Refresh appointments after cancellation
      fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      toast.error("błąd serwera");
    }
  };

  const handleRescheduleAppointment = async (appointmentId) => {
    // This would typically open a modal or navigate to a reschedule page
    // For now, we'll just console log the action
    //("Reschedule appointment:", appointmentId);
    // You could implement navigation like:
    // navigate(`/appointments/${appointmentId}/reschedule`);
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

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nadchodzące Wizyty</h2>
        <div className="flex gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200"
            onClick={handlePrevPage}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200"
            onClick={handleNextPage}
            disabled={page >= pagination.totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">Brak nadchodzących wizyt.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img
                    src={appointment.avatar}
                    alt={appointment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{appointment.name}</h3>
                  <p className="text-sm text-gray-500">
                    {appointment.specialty}
                  </p>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar size={16} className="mr-2 text-teal-500" />
                    {new Date(appointment.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock size={16} className="mr-2 text-teal-500" />
                    {appointment.time}
                  </div>
                </div>
                {appointment.patientName && (
                  <div className="text-sm text-gray-600">
                    Pacjent: <span className="font-medium text-gray-800">{appointment.patientName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(appointment.status)}`}>
                  {translateStatus(appointment.status)}
                </span>

                {appointment.patientObjectId && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Otwórz menu"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="min-w-[220px] bg-white rounded-md shadow-lg z-50 border p-1"
                        sideOffset={5}
                        align="end"
                      >
                        <DropdownMenu.Item
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                          onSelect={() => {
                            const aptId = appointment.id ?? appointment._id;
                            navigate(getPatientViewUrl(appointment.patientObjectId, aptId));
                          }}
                        >
                          <Eye size={16} className="mr-2 flex-shrink-0" />
                          Zobacz szczegóły pacjenta
                        </DropdownMenu.Item>

                        {appointment.status === "booked" && (
                          <DropdownMenu.Item
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            onSelect={() => {
                              const aptId = appointment.id ?? appointment._id;
                              setSelectedAppointment({
                                ...appointment,
                                id: aptId,
                                _id: aptId,
                                patient_id: appointment.patientObjectId,
                                patient: {
                                  id: appointment.patientObjectId,
                                  _id: appointment.patientObjectId,
                                  name: appointment.patientName,
                                },
                              });
                              setShowCheckin(true);
                            }}
                          >
                            <UserCheck size={16} className="mr-2 flex-shrink-0" />
                            Zamelduj
                          </DropdownMenu.Item>
                        )}

                        {appointment.status === "completed" && appointment.isAppointment !== false && (
                          <DropdownMenu.Item
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            onSelect={() => handleGenerateVisitCard(appointment.id ?? appointment._id)}
                          >
                            <FileText size={16} className="mr-2 flex-shrink-0" />
                            Generuj kartę wizyty
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CheckInModal
        isOpen={showCheckin}
        setIsOpen={setShowCheckin}
        patientData={
          selectedAppointment
            ? {
                ...selectedAppointment,
                id: selectedAppointment.patient_id ?? selectedAppointment.patient?.id ?? selectedAppointment.patient?._id,
              }
            : null
        }
        appointmentId={selectedAppointment?.id ?? selectedAppointment?._id}
        onCheckinSuccess={() => {
          setShowCheckin(false);
          setSelectedAppointment(null);
          fetchAppointments();
        }}
        onAppointmentUpdate={() => fetchAppointments()}
      />
    </div>
  );
};


export default MedicalDashboard;
