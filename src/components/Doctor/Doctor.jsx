import React, { useState, useEffect } from "react";
import Header from "./DoctorHeader";
import DoctorListing from "./DoctorList";

const BillingPage = () => {
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
  const doctors = [
    {
        id: 1,
        name: "Dr. Mohon Khan",
        specialty: "Heart Specialist",
        timing: "9:30am - 01:00pm BST",
        date: "Jun 24, 2021",
        description:
          "Infectious Diseases Hub aims to provide up-to-date, essential research and on aspects of microbiology, virology, and parasitology.",
        image: "https://placehold.jp/250x50.png?",
        status: "Scheduled",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 2,
        name: "Dr. Sarah Lee",
        specialty: "Neurologist",
        timing: "10:00am - 02:00pm BST",
        date: "Jun 25, 2021",
        description:
          "Specializes in treating neurological disorders and conducting advanced research in brain health.",
        image: "/images/doctor2.jpg",
        status: "Completed",
        visitType: "Follow-up",
        available: true,
      },
      {
        id: 3,
        name: "Dr. John Smith",
        specialty: "Orthopedic Surgeon",
        timing: "11:00am - 03:00pm BST",
        date: "Jun 26, 2021",
        description:
          "Expert in joint replacement surgeries and rehabilitation therapies.",
        image: "/images/doctor3.jpg",
        status: "Scheduled",
        visitType: "Procedure",
        available: false,
      },
      {
        id: 4,
        name: "Dr. Emily Davis",
        specialty: "Pediatrician",
        timing: "8:00am - 12:00pm BST",
        date: "Jun 27, 2021",
        description:
          "Dedicated to providing comprehensive care for children and adolescents.",
        image: "/images/doctor4.jpg",
        status: "Canceled",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 5,
        name: "Dr. Michael Wilson",
        specialty: "Dermatologist",
        timing: "9:00am - 1:00pm BST",
        date: "Jun 28, 2021",
        description:
          "Specializes in skin conditions and cosmetic procedures with a focus on patient education.",
        image: "/images/doctor5.jpg",
        status: "Scheduled",
        visitType: "Procedure",
        available: true,
      },
      {
        id: 6,
        name: "Dr. Jessica Brown",
        specialty: "Psychiatrist",
        timing: "10:30am - 3:30pm BST",
        date: "Jun 29, 2021",
        description:
          "Provides compassionate mental health care with expertise in anxiety and depression treatment.",
        image: "/images/doctor6.jpg",
        status: "Completed",
        visitType: "Consultation",
        available: false,
      },
      {
        id: 7,
        name: "Dr. Robert Johnson",
        specialty: "Oncologist",
        timing: "8:30am - 12:30pm BST",
        date: "Jun 30, 2021",
        description:
          "Dedicated to cancer treatment and research with a patient-centered approach.",
        image: "/images/doctor7.jpg",
        status: "Scheduled",
        visitType: "Follow-up",
        available: true,
      },
      {
        id: 8,
        name: "Dr. Lisa Chen",
        specialty: "Endocrinologist",
        timing: "11:30am - 3:30pm BST",
        date: "Jul 1, 2021",
        description:
          "Expert in hormonal disorders with a focus on diabetes management and thyroid conditions.",
        image: "/images/doctor8.jpg",
        status: "Canceled",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 9,
        name: "Dr. David Miller",
        specialty: "Cardiologist",
        timing: "9:00am - 1:00pm BST",
        date: "Jul 2, 2021",
        description:
          "Specializes in heart disease prevention and treatment with the latest technological advances.",
        image: "/images/doctor9.jpg",
        status: "Scheduled",
        visitType: "Procedure",
        available: true,
      },
      {
        id: 10,
        name: "Dr. Amanda Taylor",
        specialty: "Ophthalmologist",
        timing: "10:00am - 2:00pm BST",
        date: "Jul 3, 2021",
        description:
          "Provides comprehensive eye care services including surgery and vision correction.",
        image: "/images/doctor10.jpg",
        status: "Completed",
        visitType: "Follow-up",
        available: false,
      },
      {
        id: 11,
        name: "Dr. James Wilson",
        specialty: "Urologist",
        timing: "8:30am - 12:30pm BST",
        date: "Jul 5, 2021",
        description:
          "Specializes in urinary tract health and minimally invasive surgical procedures.",
        image: "/images/doctor11.jpg",
        status: "Scheduled",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 12,
        name: "Dr. Patricia Garcia",
        specialty: "Rheumatologist",
        timing: "11:00am - 3:00pm BST",
        date: "Jul 6, 2021",
        description:
          "Expert in diagnosing and treating autoimmune and inflammatory disorders affecting joints and muscles.",
        image: "/images/doctor12.jpg",
        status: "Canceled",
        visitType: "Follow-up",
        available: true,
      },
      {
        id: 13,
        name: "Dr. Thomas Anderson",
        specialty: "Gastroenterologist",
        timing: "9:30am - 1:30pm BST",
        date: "Jul 7, 2021",
        description:
          "Specializes in digestive system disorders and performs advanced endoscopic procedures.",
        image: "/images/doctor13.jpg",
        status: "Scheduled",
        visitType: "Procedure",
        available: false,
      },
      {
        id: 14,
        name: "Dr. Jennifer Martinez",
        specialty: "Allergist",
        timing: "10:00am - 2:00pm BST",
        date: "Jul 8, 2021",
        description:
          "Provides comprehensive care for allergies, asthma, and immunological disorders.",
        image: "/images/doctor14.jpg",
        status: "Completed",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 15,
        name: "Dr. Christopher Lee",
        specialty: "Pulmonologist",
        timing: "8:00am - 12:00pm BST",
        date: "Jul 9, 2021",
        description:
          "Specializes in respiratory system disorders and sleep medicine.",
        image: "/images/doctor15.jpg",
        status: "Scheduled",
        visitType: "Follow-up",
        available: true,
      },
      {
        id: 16,
        name: "Dr. Elizabeth White",
        specialty: "Nephrologist",
        timing: "11:30am - 3:30pm BST",
        date: "Jul 10, 2021",
        description:
          "Expert in kidney disease management and transplant medicine.",
        image: "/images/doctor16.jpg",
        status: "Canceled",
        visitType: "Procedure",
        available: false,
      },
      {
        id: 17,
        name: "Dr. Daniel Thompson",
        specialty: "Hematologist",
        timing: "9:00am - 1:00pm BST",
        date: "Jul 12, 2021",
        description:
          "Specializes in blood disorders and oncology with a focus on personalized treatment plans.",
        image: "/images/doctor17.jpg",
        status: "Scheduled",
        visitType: "Consultation",
        available: true,
      },
      {
        id: 18,
        name: "Dr. Michelle Robinson",
        specialty: "Infectious Disease",
        timing: "10:30am - 2:30pm BST",
        date: "Jul 13, 2021",
        description:
          "Expert in diagnosing and treating complex infectious diseases and global health concerns.",
        image: "/images/doctor18.jpg",
        status: "Completed",
        visitType: "Follow-up",
        available: true,
      },
      {
        id: 19,
        name: "Dr. Kevin Clark",
        specialty: "Neurosurgeon",
        timing: "8:30am - 12:30pm BST",
        date: "Jul 14, 2021",
        description:
          "Performs advanced surgical procedures for brain and spinal cord conditions.",
        image: "/images/doctor19.jpg",
        status: "Scheduled",
        visitType: "Procedure",
        available: false,
      },
      {
        id: 20,
        name: "Dr. Rachel Adams",
        specialty: "Geriatrician",
        timing: "11:00am - 3:00pm BST",
        date: "Jul 15, 2021",
        description:
          "Specializes in healthcare for elderly patients with a focus on quality of life and independence.",
        image: "/images/doctor20.jpg",
        status: "Canceled",
        visitType: "Consultation",
        available: true,
      },
    ];

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
