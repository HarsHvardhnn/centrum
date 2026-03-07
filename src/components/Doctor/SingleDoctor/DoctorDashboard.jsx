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

const DoctorDashboard = ({
  doctor,
  patients,
  patientDetails,
  dailySummary,
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
  itemsPerPage,
  onCheckIn,
  onReschedule,
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
            <DoctorInfoCard doctor={doctor} dailySummary={dailySummary} selectedDate={selectedDate} />
          </div>

          {/* <div className="md:col-span-3">
            <StatsDashboard />
          </div> */}
        </div>

        <div className="w-full mx-auto">
          <Calendar
            viewMode="month"
            selectedDate={selectedDate || new Date()}
            onDateSelect={onDateSelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PatientsList
              setAppointmentId={setAppointmentId}
              patientsData={patients}
              onPatientSelect={onPatientSelect}
              selectedPatient={selectedPatient}
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPatients={totalPatients}
              itemsPerPage={itemsPerPage}
              onCheckIn={onCheckIn}
              onReschedule={onReschedule}
            />
          </div>

          <div className="flex flex-col rounded-lg bg-white border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-start gap-4 p-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Szczegóły pacjenta</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Karta podglądu operacyjnego</p>
              </div>
              {selectedPatient && (
                <button
                  onClick={handleViewDetails}
                  className="flex-shrink-0 text-white font-medium rounded-lg text-sm px-4 py-2.5 shadow-sm hover:shadow transition-colors"
                  style={{ backgroundColor: "#0d9488" }}
                >
                  Przejdź do wizyty
                </button>
              )}
            </div>

            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <p className="text-center mb-2">Nie wybrano pacjenta</p>
                <p className="text-sm text-center text-gray-400">
                  Wybierz pacjenta z listy, aby zobaczyć jego szczegóły
                </p>
              </div>
            ) : patientDetails ? (
              <PatientInfo
                patientData={patientDetails}
                currentAppointment={patients.find((p) => p.id === selectedPatient) || null}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
