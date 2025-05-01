import React, { useState } from "react";
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
  onDateSelect,
  onSearch,
  onFilter,
  onBookAppointment,
  onPatientSelect,
  selectedPatient,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  console.log("patiend eta;same",patientDetails)

  const handleViewDetails = () => {
    if (selectedPatient) {
      navigate(`/patients-details/${selectedPatient}`);
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
          <div className="relative">
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
          </div>

          <button
            onClick={onFilter}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <Filter size={18} className="text-gray-600" />
          </button>

          <button
            onClick={onBookAppointment}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg"
          >
            Umów wizytę
          </button>
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
          <Calendar
            viewMode="month"
            selectedDate={new Date()}
            onDateSelect={onDateSelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PatientsList
              variant="default"
              patientsData={patients}
              onPatientSelect={onPatientSelect}
              selectedPatient={selectedPatient}
              title="Lista pacjentów"
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
