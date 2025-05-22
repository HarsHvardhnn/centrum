import React, { useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserX,
  Video,
  X,
} from "lucide-react";
import { apiCaller } from "../../../utils/axiosInstance";

const PatientsList = ({
  totalPatients = 0,
  currentPage = 1,
  onPageChange,
  onPatientSelect,
  setAppointmentId,
  selectedPatient,
  patientsData = [],
  itemsPerPage = 10,
}) => {
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: null,
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalPatients / itemsPerPage);

  // Notify parent component when selection changes
  const handlePatientSelect = (patientId, appointmentId) => {
    // If the same appointment is clicked again, unselect it
    if (selectedPatient === appointmentId) {
      if (onPatientSelect) onPatientSelect(null);
      if (setAppointmentId) setAppointmentId(null);
    } else {
      if (onPatientSelect) onPatientSelect(patientId);
      if (setAppointmentId) setAppointmentId(appointmentId);
    }
  };

  const sortedPatients = useMemo(() => {
    let sortableItems = [...patientsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [patientsData, sortConfig]);

  const requestSort = (key) => {
    let direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      Finished: {
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        dotColor: "bg-green-600",
      },
      booked: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        dotColor: "bg-yellow-600",
      },
      Cancelled: {
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        dotColor: "bg-red-600",
      },
    };
    
    const statusTranslations = {
      Finished: "Zakończona",
      booked: "Oczekuje",
      Cancelled: "Anulowana"
    };

    const { bgColor, textColor, dotColor } = statusStyles[status] || {
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      dotColor: "bg-gray-600",
    };

    return (
      <div
        className={`flex items-center px-4 text-sm h-fit py-1 rounded-full capitalize ${bgColor} ${textColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${dotColor} mr-2`} />
        {statusTranslations[status] || status}
      </div>
    );
  };

  const AppointmentModeBadge = ({ mode }) => {
    const modeStyles = {
      online: {
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        dotColor: "bg-blue-600",
      },
      offline: {
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        dotColor: "bg-purple-600",
      },
      phone: {
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-700",
        dotColor: "bg-indigo-600",
      },
    };

    const modeTranslations = {
      online: "Online",
      offline: "Stacjonarnie",
      phone: "Telefon",
      inPerson: "Osobista"
    };

    const { bgColor, textColor, dotColor } = modeStyles[mode] || {
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      dotColor: "bg-gray-600",
    };

    return (
      <div
        className={`flex items-center px-4 text-sm h-fit py-1 rounded-full capitalize ${bgColor} ${textColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${dotColor} mr-2`} />
        {modeTranslations[mode] || mode}
      </div>
    );
  };

  const JoinNowButton = ({ joiningLink }) => {
    return (
      <a
        href={joiningLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
      >
        <Video size={16} className="mr-1" />
      </a>
    );
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
    try {
      await apiCaller('PATCH',`/appointments/cancel/${id}`);
      // Refresh the page or update the list after cancellation
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
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

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-8 items-center">
          <h2 className="text-lg font-semibold">Lista pacjentów</h2>
          <span className="text-sm text-teal-400 bg-teal-100 rounded-full px-3 py-1">
            {totalPatients} {totalPatients === 1 ? "użytkownik" : "użytkowników"}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {patientsData.length > 0 ? (
            <div>
              {/* Table Header */}
              <div className="w-full grid grid-cols-6 px-4 py-3 bg-gray-50 border-b">
                <div className="col-span-2">Imię i nazwisko</div>
                <div className="text-center">Płeć</div>
                <div
                  className="flex items-center cursor-pointer justify-center"
                  onClick={() => requestSort("status")}
                >
                  Status
                  <ChevronDown size={16} />
                </div>
                <div
                  className="flex items-center cursor-pointer justify-center"
                  onClick={() => requestSort("appointmentMode")}
                >
                  Tryb
                  <ChevronDown size={16} />
                </div>
                <div className="text-center">Akcja</div>
              </div>

              {/* Table Body */}
              {sortedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="w-full grid grid-cols-6 px-4 py-3 border-b hover:bg-gray-50"
                >
                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPatient === patient.id}
                      onChange={() => {
                        handlePatientSelect(patient.patient_id, patient.id);
                      }}
                      className="w-4 h-4 mr-3"
                    />
                    <img
                      src={patient.avatar || "https://via.placeholder.com/40"}
                      alt={`Zdjęcie ${patient.name}`}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.patient_id}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">{patient.sex}</div>
                  <div className="flex items-center justify-center">
                    <StatusBadge status={patient.status} />
                  </div>
                  <div className="flex items-center justify-center">
                    <AppointmentModeBadge mode={patient.mode} />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {patient.mode === "online" && patient.joining_link && (
                      <JoinNowButton joiningLink={patient.joining_link} />
                    )}
                    <button
                      onClick={() => handleCancelAppointment(patient.id)}
                      disabled={patient.status !== "booked"}
                      className={`flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${patient.status !== "booked" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <X size={16} className="mr-1" />
                      Anuluj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Pagination - Only show if there are patients */}
      {patientsData.length > 0 && (
        <div className="flex justify-between items-center px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Pokazuje {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalPatients)} z {totalPatients} pacjentów
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
    </div>
  );
};

export default PatientsList;
