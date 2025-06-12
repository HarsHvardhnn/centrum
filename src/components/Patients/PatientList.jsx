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
  DollarSign,
  Trash2
} from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";
import { useNavigate } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import { translateStatus, getStatusStyle } from '../../utils/statusHelper';
import BillingConfirmationModal from "../Billing/BillingConfirmationModal";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import patientService from "../../helpers/patientHelper";

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

  const navigate = useNavigate();
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

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

  const fetchAppointments = async (page = 1) => {
    try {
      showLoader();
      const filters = {
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(searchQuery && { search: searchQuery }),
        ...(user?.role === "doctor" && { doctorId: user?.id }),
        ...(clinic && { isClinicIp: clinic }),
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
    const debounceTimeout = setTimeout(() => {
      fetchAppointments(1); // Reset to first page when filters change
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, statusFilter, dateRange, user?.id, clinic]);

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
      navigate(`/admin/billing/details/${response.data._id}`);
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
    try {
      showLoader();
      const response = await appointmentHelper.updateAppointmentStatus(appointmentId, "cancelled");
      if (response.success) {
        toast.success("Wizyta została anulowana");
        // Update the appointments list
        setAppointments(appointments.map(apt => 
          apt.id === appointmentId 
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
      setPatientFormData({});
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

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex w-full justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {clinic ? "Wizyty w Przychodni" : "Lista pacjentów"}
            </h1>
            <p className="text-gray-600 mb-4">Wyświetlane: Wszystkie wizyty</p>
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
                    <h3 className="font-medium px-3 py-2">
                      Filtruj według statusu
                    </h3>
                    <div className="space-y-2 px-3 py-1">
                      {["All", "Booked", "checkedIn", "Cancelled", "Completed"].map(
                        (status) => (
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
                            <span>
                              {status === "All"
                                ? "Wszystkie"
                                : status === "Booked"
                                ? "Zarezerwowane"
                                : status === "checkedIn"
                                ? "Zameldowany"
                                : status === "Cancelled"
                                ? "Anulowane"
                                : status === "Completed"
                                ? "Zakończone"
                                : status}
                            </span>
                          </label>
                        )
                      )}
                    </div>

                    <div className="border-t mt-2 pt-2">
                      <h3 className="font-medium px-3 py-2">Zakres dat</h3>
                      <div className="space-y-2 px-3 py-1">
                        <div>
                          <label className="text-sm text-gray-600">
                            Data początkowa
                          </label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.startDate || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Data końcowa
                          </label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.endDate || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Replace Add Appointment Button with Add Patient Button */}
            {user?.role !== "doctor" && !clinic && (
              <button
                className="bg-teal-500 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                onClick={() => setShowAddPatientModal(true)}
              >
                <UserCheck size={18} />
                Dodaj Pacjenta
              </button>
            )}
          </div>
        </div>

        {clinic ? (
          // Clinic appointments - Date focused layout
          <div className="space-y-6">
            {Object.entries(groupAppointmentsByDate(appointments)).map(([date, appointments]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm border">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {formatDateHeader(date)}
                  </h2>
                </div>
                <div className="divide-y">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center h-[60px]">
                        {/* Patient Info - 5 columns */}
                        <div 
                          className={`col-span-5 flex items-center gap-3 min-w-0 ${appointment.isAppointment !== false ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (appointment.isAppointment !== false) {
                              navigate(
                                `/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`
                              );
                            }
                          }}
                        >
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {appointment.patient?.profilePicture ? (
                              <img
                                src={appointment.patient.profilePicture}
                                alt={appointment.patient?.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                                <UserCheck size={20} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate max-w-[250px]">
                              {appointment.patient?.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[250px]">
                              {appointment.patient.patientId}
                            </div>
                          </div>
                        </div>

                        {/* Time and Doctor - 4 columns */}
                        <div className="col-span-4 flex flex-col min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {appointment.doctor?.name || "-"}
                          </div>
                        </div>

                        {/* Status - 2 columns */}
                        <div className="col-span-2 flex items-center justify-end">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusStyle(appointment.status)}`}>
                            {translateStatus(appointment.status)}
                          </span>
                        </div>

                        {/* Actions - 1 column */}
                        <div className="col-span-1 flex justify-end">
                          {appointment.isAppointment !== false && (
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="text-gray-500 hover:text-gray-700 focus:outline-none p-1">
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
                                    onClick={() => {
                                      navigate(
                                        `/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`
                                      );
                                    }}
                                  >
                                    <Eye size={16} className="mr-2 flex-shrink-0" />
                                    Zobacz szczegóły
                                  </DropdownMenu.Item>

                                  {appointment.status === "booked" && (
                                    <DropdownMenu.Item
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setShowCheckin(true);
                                      }}
                                    >
                                      <UserCheck size={16} className="mr-2 flex-shrink-0" />
                                      Zamelduj
                                    </DropdownMenu.Item>
                                  )}

                                  {["checkedIn", "booked"].includes(appointment.status) && (
                                    <DropdownMenu.Item
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        handleBillPatient(appointment.id, appointment.patient.id);
                                      }}
                                    >
                                      <DollarSign size={16} className="mr-2" />
                                      Wystaw rachunek
                                    </DropdownMenu.Item>
                                  )}

                                  {appointment.status === "completed" && (
                                    <DropdownMenu.Item
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                      onClick={() => handleGenerateVisitCard(appointment.id)}
                                    >
                                      <FileText size={16} className="mr-2" />
                                      Karta wizyty
                                    </DropdownMenu.Item>
                                  )}
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Original Lab appointments table layout
          <div className="overflow-x-auto shadow-sm border rounded-lg">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="text-left text-gray-500 border-b bg-gray-50">
                  <th className="px-4 py-3 w-[16%] font-medium">Pacjent</th>
                  <th className="px-4 py-3 w-[12%] font-medium">
                    Data i godzina
                  </th>
                  <th className="px-4 py-3 w-[7%] font-medium">Tryb</th>
                  <th className="px-4 py-3 w-[8%] font-medium">Telefon</th>
                  <th className="px-4 py-3 w-[16%] font-medium">Lekarz</th>
                  <th className="px-4 py-3 w-[7%] font-medium">Wiek pacjenta</th>
                  <th className="px-4 py-3 w-[14%] font-medium">Status wizyty</th>
                  <th className="px-4 py-3 w-[8%] font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50">
                    <td
                      className={`px-4 py-3 truncate ${appointment.isAppointment !== false ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (appointment.isAppointment !== false) {
                          navigate(
                            `/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`
                          );
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2 flex-shrink-0">
                          {appointment.patient?.profilePicture ? (
                            <img
                              src={appointment.patient.profilePicture}
                              alt={appointment.patient?.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                              <UserCheck size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {appointment.patient?.name}
                          </div>
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
                      <span
                        title={
                          appointment.mode === "online"
                            ? "Click to join meeting"
                            : ""
                        }
                        onClick={() => {
                          if (appointment.mode === "online") {
                            window.open(appointment.meetLink, "_blank");
                          }
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block transition-colors ${
                          appointment.mode === "online"
                            ? "bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                            : appointment.mode === "offline"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.mode === "online"
                          ? "Online"
                          : appointment.mode === "offline"
                          ? "Stacjonarnie"
                          : "Brak"}
                      </span>
                    </td>

                    <td className="px-4 py-3 truncate">
                      {appointment.patient.phoneNumber || "-"}
                    </td>
                    <td className="px-4 py-3 truncate">
                      <div className="font-medium truncate">
                        {appointment.doctor?.name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 truncate text-center">
                      {appointment.patient.age || "N/A"} lat
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusStyle(appointment.status)}`}
                      >
                        {translateStatus(appointment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <div className="flex justify-center">
                        {appointment.isAppointment !== false && (
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
                                <DropdownMenu.Item
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                  onClick={() => {
                                    navigate(
                                      `/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`
                                    );
                                  }}
                                >
                                  <Eye size={16} className="mr-2" />
                                  Zobacz szczegóły
                                </DropdownMenu.Item>

                                {appointment.status === "booked" && (
                                  <DropdownMenu.Item
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowCheckin(true);
                                    }}
                                  >
                                    <UserCheck size={16} className="mr-2" />
                                    Zamelduj
                                  </DropdownMenu.Item>
                                )}

                                {["checkedIn", "booked"].includes(appointment.status) && (
                                  <DropdownMenu.Item
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      handleBillPatient(appointment.id, appointment.patient.id);
                                    }}
                                  >
                                    <DollarSign size={16} className="mr-2" />
                                    Wystaw rachunek
                                  </DropdownMenu.Item>
                                )}

                                {appointment.status === "completed" && (
                                  <DropdownMenu.Item
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                    onClick={() => handleGenerateVisitCard(appointment.id)}
                                  >
                                    <FileText size={16} className="mr-2" />
                                    Karta wizyty
                                  </DropdownMenu.Item>
                                )}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
          patientName={selectedAppointment?.patient?.name}
          appointmentId={selectedAppointment?.id}
          patientId={selectedAppointment?.patient?.id}
        />

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
                    setPatientFormData({});
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
