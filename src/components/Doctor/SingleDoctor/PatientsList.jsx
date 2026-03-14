import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/userContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserX,
  X,
  PlayCircle,
  UserCheck,
  Calendar,
  Trash2,
} from "lucide-react";
import appointmentHelper from "../../../helpers/appointmentHelper";
import { toast } from "sonner";

const HIGHLIGHT_COLOR = "#008C8C";

const PatientsList = ({
  totalPatients = 0,
  currentPage = 1,
  onPageChange,
  onPatientSelect,
  setAppointmentId,
  selectedPatient,
  patientsData = [],
  itemsPerPage = 10,
  onCheckIn,
  onReschedule,
  onPermanentDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [sendSMSNotification, setSendSMSNotification] = React.useState(false);
  const [sendEmailNotification, setSendEmailNotification] = React.useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState(null);

  const totalPages = Math.ceil(totalPatients / itemsPerPage);

  const handlePatientSelect = (patientId, appointmentId) => {
    if (selectedPatient === appointmentId) {
      if (onPatientSelect) onPatientSelect(null);
      if (setAppointmentId) setAppointmentId(null);
    } else {
      if (onPatientSelect) onPatientSelect(patientId);
      if (setAppointmentId) setAppointmentId(appointmentId);
    }
  };

  const handleStartVisit = (patient) => {
    if (patient.patient_id) {
      if (user?.role === "receptionist") {
        navigate(`/administracja/konta?edytujPacjenta=${patient.patient_id}&returnUrl=${encodeURIComponent(window.location.pathname)}`);
      } else {
        navigate(`/szczegoly-pacjenta/${patient.patient_id}`);
      }
    }
  };

  // Only show Zarezerwowana (booked) and Zameldowana (checkedIn). Sort ascending by start time.
  const sortedPatients = useMemo(() => {
    const active = (patientsData || []).filter(
      (p) => p.status === "booked" || p.status === "checkedIn"
    );
    return [...active].sort((a, b) => {
      const tA = a.startTime || a.start_time || "";
      const tB = b.startTime || b.start_time || "";
      return tA.localeCompare(tB);
    });
  }, [patientsData]);

  const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    if (s === "booked") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Zarezerwowana
        </span>
      );
    }
    if (s === "checkedin") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Zameldowana
        </span>
      );
    }
    return null;
  };

  const formatTimeRange = (p) => {
    const start = p.startTime || p.start_time || "—";
    const end = p.endTime || p.end_time || "—";
    return `${start}–${end}`;
  };

  /** Display only the human-readable patientId (e.g. P-1773235177267), never system _id/patient_id. */
  const patientIdLabel = (p) => {
    const patientId = p.patient?.patientId ?? p.patientId;
    if (patientId != null && String(patientId).trim() !== "") return String(patientId).trim();
    return "Niezweryfikowany";
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <UserX size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">Nie znaleziono pacjentów</h3>
      <p className="text-gray-400 text-center max-w-sm mb-6">
        Aktualnie nie ma żadnych pacjentów w systemie lub spełniających kryteria wyszukiwania.
      </p>
    </div>
  );

  const handleCancelAppointment = async (id) => {
    setSelectedAppointmentId(id);
    setShowCancelModal(true);
  };

  const handleConfirmCancelAppointment = async () => {
    try {
      await appointmentHelper.cancelAppointment(selectedAppointmentId, "Canceled by doctor", sendSMSNotification, sendEmailNotification);
      // Refresh the page or update the list after cancellation
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setShowCancelModal(false);
      setSelectedAppointmentId(null);
      setSendSMSNotification(false);
      setSendEmailNotification(false);
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

  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Show middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const displayTotal = totalPatients;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header: title + circular counter "X wizyt dzisiaj", no three-dot */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Lista pacjentów</h2>
          <span
            className="inline-flex items-center justify-center min-w-[2.25rem] h-9 rounded-full text-sm font-medium bg-teal-100 text-teal-800 px-3"
            style={{ backgroundColor: "var(--counter-bg, #ccfbf1)", color: "var(--counter-text, #0f766e)" }}
          >
            {displayTotal} {displayTotal === 1 ? "wizyta dzisiaj" : "wizyt dzisiaj"}
          </span>
        </div>
      </div>

      {/* Table: Pacjent | Czas | Status | Akcje */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {sortedPatients.length > 0 ? (
            <div>
              <div className="w-full grid grid-cols-[1fr_8rem_10rem_3rem] gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-semibold uppercase tracking-wide text-gray-500">
                <div>Pacjent</div>
                <div className="text-center">Czas</div>
                <div className="text-center">Status</div>
                <div className="text-right">Akcje</div>
              </div>
              {sortedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="w-full grid grid-cols-[1fr_8rem_10rem_3rem] gap-4 px-4 py-3 border-b hover:bg-gray-50/80 items-center"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handlePatientSelect(patient.patient_id, patient.id)}
                      className="text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      style={{
                        color: selectedPatient === patient.id ? HIGHLIGHT_COLOR : undefined,
                        fontWeight: selectedPatient === patient.id ? 600 : 500,
                      }}
                    >
                      {patient.name?.trim() || "Wizyta bez pacjenta"}
                    </button>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{patientIdLabel(patient)}</p>
                  </div>
                  <div className="text-center text-gray-800 text-sm">{formatTimeRange(patient)}</div>
                  <div className="flex justify-center">
                    <StatusBadge status={patient.status} />
                  </div>
                  <div className="flex justify-end">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded focus:outline-none"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="min-w-[200px] bg-white rounded-lg shadow-lg border p-1 z-[100]"
                          sideOffset={4}
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            onSelect={() => handleStartVisit(patient)}
                          >
                            <PlayCircle size={16} /> Rozpocznij wizytę
                          </DropdownMenu.Item>
                          {onCheckIn && patient.status === "booked" && (
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                              onSelect={() => onCheckIn(patient)}
                            >
                              <UserCheck size={16} /> Zamelduj
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                            onSelect={() => handleCancelAppointment(patient.id)}
                          >
                            <X size={16} /> Anuluj wizytę
                          </DropdownMenu.Item>
                          {onReschedule && (
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                              onSelect={() => onReschedule(patient)}
                            >
                              <Calendar size={16} /> Przełóż wizytę
                            </DropdownMenu.Item>
                          )}
                          {onPermanentDelete && (
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                              onSelect={() => onPermanentDelete(patient.id)}
                            >
                              <Trash2 size={16} /> Trwale usuń
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Pagination */}
      {patientsData.length > 0 && (
        <div className="flex justify-between items-center px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Pokazuje {(currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, totalPatients)} z {totalPatients} pacjentów
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            
            {renderPaginationNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === page
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
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
                    setSelectedAppointmentId(null);
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
                    setSelectedAppointmentId(null);
                    setSendSMSNotification(false);
                    setSendEmailNotification(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleConfirmCancelAppointment}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tak, anuluj wizytę
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
