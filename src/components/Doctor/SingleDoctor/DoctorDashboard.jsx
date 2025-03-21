import React from "react";
import DoctorInfoCard from "./DoctorInfo";
import PatientsList from "./PatientsList";
import Calendar from "./Calendar";
import { Search, Filter } from "lucide-react";
import StatsDashboard from "./StatsDashboard";

const DoctorDashboard = ({
  doctor,
  patients,
  appointments,
  stats,
  selectedPatient,
  onPatientSelect,
  onDateSelect,
  onSearch,
  onFilter,
  onBookAppointment,
}) => {
  return (
    <div className="container mx-auto px-4 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 py-4 gap-4">
        <div className="flex items-center">
          <button className="mr-4 text-teal-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-700">
            Doctor Appointment
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="olivia@untitledui.com"
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
            Book Appointment
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <DoctorInfoCard doctor={doctor} />
          </div>

          <div className="md:col-span-3">
            <StatsDashboard />
          </div>
        </div>

        <div className="w-full  mx-auto">
          <Calendar
            viewType="Month"
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
              title="Patients List"
            />
          </div>

          <div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Patients Details</h2>
                <button className="text-teal-500 border border-teal-500 px-3 py-1 rounded-md text-sm">
                  View Details
                </button>
              </div>

              {selectedPatient && (
                <div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
