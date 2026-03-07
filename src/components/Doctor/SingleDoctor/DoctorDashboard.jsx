import React from "react";
import { useNavigate } from "react-router-dom";
import DoctorInfoCard from "./DoctorInfo";
import PatientsList from "./PatientsList";
import Calendar from "./Calendar";
import { Search, Filter, ArrowLeft } from "lucide-react";
import StatsDashboard from "./StatsDashboard";
import PatientInfo from "./PatientInfo";
import Breadcrumb from "./BreadCrumb";
import { useUser } from "../../../context/userContext";

const formatSelectedDateLabel = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const s = new Date(date).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const DoctorDashboard = ({
  doctor,
  patients,
  patientDetails,
  onDateSelect,
  onSearch,
  onFilter,
  onPatientSelect,
  selectedPatient,
  selectedDate,
  breadcrumbs,
  setAppointmentId,
  currentPage,
  onPageChange,
  totalPatients,
  itemsPerPage
}) => {
  const navigate = useNavigate();
  //("patiend eta;same",patientDetails)

  const handleViewDetails = () => {
    if (selectedPatient) {
      // Find the selected appointment from patients array
      const selectedAppointment = patients.find(p => p.id === selectedPatient);
      if (selectedAppointment) {
        navigate(`/szczegoly-pacjenta/${selectedAppointment.patient_id}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 mt-2 py-4 gap-4">
        <div className="flex items-center">
          <button className="mr-4 text-teal-500">
            <ArrowLeft size={24} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* <div className="relative">
            <input
              type="text"
              placeholder="Wyszukaj pacjenta..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div> */}

        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-20">
          <div className="w-full">
            <DoctorInfoCard doctor={doctor} />
          </div>

          {/* <div className="md:col-span-3">
            <StatsDashboard />
          </div> */}
        </div>

        <div className="w-full mx-auto">
          {selectedDate && (
            <p className="text-gray-700 font-medium mb-2">
              {formatSelectedDateLabel(selectedDate)}
            </p>
          )}
          <Calendar
            viewMode="month"
            selectedDate={selectedDate || new Date()}
            onDateSelect={onDateSelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PatientsList
              variant="default"
              setAppointmentId={setAppointmentId}
              patientsData={patients}
              onPatientSelect={onPatientSelect}
              selectedPatient={selectedPatient}
              title="Lista pacjentów"
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPatients={totalPatients}
              itemsPerPage={itemsPerPage}
            />
          </div>

          <div>
            <div className="rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Szczegóły pacjenta</h2>
                {selectedPatient && (
                  <button
                    onClick={handleViewDetails}
                    className="text-white bg-teal-400 hover:bg-teal-500 px-4 py-2 font-medium rounded-md text-sm"
                  >
                    Zobacz szczegóły
                  </button>
                )}
              </div>

              {/* Wyświetl komunikat, gdy nie wybrano pacjenta */}
              {!selectedPatient && (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                  <p className="text-center mb-2">Nie wybrano pacjenta</p>
                  <p className="text-sm text-center text-gray-400">
                    Wybierz pacjenta z listy, aby zobaczyć jego szczegóły
                  </p>
                </div>
              )}
            </div>
            <div>
              {/* Przekaż szczegóły pacjenta do komponentu PatientInfo */}
              {patientDetails && <PatientInfo patientData={patientDetails} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
