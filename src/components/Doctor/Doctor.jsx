import React, { useState, useEffect } from "react";
import Header from "./DoctorHeader";
import DoctorListing from "./DoctorList";
import {doctors} from '../../utils/doctorsData/doctors';
const BillingPage = () => {
  // const [doctorsD,setDoctors]=useState(doctors);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Sample filter options
  const filterOptions = {
    specialties: ["Cardiologist", "Dermatologist", "Neurologist", "Pediatrician"],
    statuses: ["Scheduled", "Canceled", "Completed"],
    visitTypes: ["Consultation", "Procedure", "Follow-up"],
  };

  // Mock data array for doctors
 

  // Filter doctors based on search term and filters
  useEffect(() => {
    let results = [...doctors];

    if (searchTerm) {
      results = results.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.doctor) {
      results = results.filter((doctor) =>
        doctor.name.toLowerCase().includes(activeFilters.doctor.toLowerCase())
      );
    }

    if (activeFilters.specialty) {
      results = results.filter(
        (doctor) => doctor.specialty === activeFilters.specialty
      );
    }

    if (activeFilters.availability) {
      results = results.filter((doctor) => doctor.available === true);
    }

    if (activeFilters.date) {
      results = results.filter((doctor) => doctor.date === activeFilters.date);
    }

    if (activeFilters.status) {
      results = results.filter(
        (doctor) => doctor.status === activeFilters.status
      );
    }

    if (activeFilters.visitType) {
      results = results.filter(
        (doctor) => doctor.visitType === activeFilters.visitType
      );
    }

    setFilteredDoctors(results);
  }, [searchTerm, activeFilters, doctors]);

  return (
    <div className="container mx-auto px-4 h-screen flex flex-col ">
      {/* Reusable Header */}
      <Header
        title="Billing Overview"
        subtitle="All Consultations of All Healthcare Providers"
        onSearch={(term) => setSearchTerm(term)}
        onFilter={(filters) => setActiveFilters(filters)}
        onAddDoctor={() => console.log("Add Doctor")}
        filterOptions={filterOptions}
      />

      {/* Doctor Listing */}
      <div className=" flex-grow overflow-y-auto">
        {filteredDoctors.length ? (
          <DoctorListing doctors={filteredDoctors} />
        ) : (
          <p>No doctors found.</p>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
