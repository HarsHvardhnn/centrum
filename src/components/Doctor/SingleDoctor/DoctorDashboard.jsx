import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorInfoCard from "./DoctorInfo";
import PatientsList from "./PatientsList";
import Calendar from "./Calendar";
import { Search, Filter, ArrowLeft } from "lucide-react";
import StatsDashboard from "./StatsDashboard";
import PatientInfo from "./PatientInfo";
import Breadcrumb from "./BreadCrumb";

const DoctorDashboard = ({
  doctor,
  patients,
  onDateSelect,
  onSearch,
  onFilter,
  onBookAppointment,
  breadcrumbs = [
    { label: "Dashboard", onClick: () => console.log("Dashboard clicked") },
    { label: "Doctor Appointment", onClick: null },
  ],
}) => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handlePatientSelect = (patientId) => {
    // Find the selected patient by ID
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient);
  };

  const handleViewDetails = () => {
       navigate(`/patients-details/${selectedPatient?.id}`);
    // if (selectedPatient) {
    //   // Navigate to patient details page with the selected patient ID
    //   navigate(`/patients-details/${selectedPatient.id}`);
    // } else {
    //   alert("Please select a patient first");
    // }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 py-4 gap-4">
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
        <div className="flex items-center justify-between gap-20">
          <div className="w-full">
            <DoctorInfoCard doctor={doctor} />
          </div>

          <div className="md:col-span-3">
            <StatsDashboard />
          </div>
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
              onPatientSelect={handlePatientSelect}
              title="Patients List"
            />
          </div>

          <div>
            <div className="rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Patient Details</h2>
                <button
                  onClick={handleViewDetails}
                  className="text-white bg-teal-400 hover:bg-teal-500 px-4 py-2 font-medium rounded-md text-sm"
                >
                  View Details
                </button>
              </div>

              {selectedPatient && (
                <div>
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedPatient.avatar}
                      alt={selectedPatient.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-base">
                        {selectedPatient.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedPatient.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <PatientInfo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
