import React, { useState, useEffect } from "react";
import Header from "./DoctorHeader";
import DoctorListing from "./DoctorList";
import { doctors } from "../../utils/doctorsData/doctors";
import AddDoctorForm from "./CreateDoctor";
import doctorService from "../../helpers/doctorHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { format } from "date-fns";

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);

  const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
      const fetchDoctors = async () => {
        try {
          showLoader()
          const response = await doctorService.getAllDoctors();

          const transformed = response.doctors.map((doc, index) => ({
            id:doc.id || doc._id,
            name: `Dr. ${doc.name}`,
            specialty: doc.specialty || doc.specializations?.[0] || "General",
            timing: "9:30am - 01:00pm BST", 
            date: format(new Date(doc.date), "MMM dd, yyyy"),
            description:
              doc.bio ||
              "Infectious Diseases Hub aims to provide up-to-date, essential research and on aspects of microbiology, virology, and parasitology.",
            image: doc.image || "https://placehold.jp/250x50.png?",
            status: doc.status || (doc.available ? "Available" : "Unavailable"),
            visitType: doc.visitType || "Consultation",
            available: doc.available ?? true,
          }));

          setAllDoctors(transformed);
        } catch (error) {
          console.error("Failed to fetch doctors:", error);
        }
        finally {
          hideLoader()
        }
        
      };

      fetchDoctors();
    }, []);

  // Sample filter options
  const filterOptions = {
    specialties: [
      "Cardiologist",
      "Dermatologist",
      "Neurologist",
      "Pediatrician",
    ],
    statuses: ["Scheduled", "Canceled", "Completed"],
    visitTypes: ["Consultation", "Procedure", "Follow-up"],
  };

  const handleAddDoctor = async (doctorData, resetForm, closeModal) => {
    try {
      showLoader();
      const response = await doctorService.createDoctor(doctorData);

      const createdDoctor = response.doctor;

      const newDoctor = {
        id: createdDoctor.id || createdDoctor.d_id || `dr-${Date.now()}`,
        name:
          createdDoctor.name ||
          `${doctorData.firstName} ${doctorData.lastName}`,
        specialty:
          createdDoctor.specializations?.[0] ||
          doctorData.specialization?.[0] ||
          "",
        available: createdDoctor.available || true,
        status: createdDoctor.status || "Available",
        department:createdDoctor?.department || "",
        experience:
          createdDoctor.experience || `${doctorData.experience} years`,
        image: createdDoctor.image || doctorData.profilePicture,
        visitType: "Consultation",
        date: new Date().toISOString().split("T")[0],
        email: createdDoctor.email || doctorData.email,
        phone: createdDoctor.phone || doctorData.phone,
        qualifications:
          createdDoctor.qualifications || doctorData.qualifications || [],
        specializations:
          createdDoctor.specializations || doctorData.specialization || [],
        bio: createdDoctor.bio || doctorData.bio || "",
        consultationFee:
          createdDoctor.consultationFee || doctorData.consultationFee || 0,
      };

      setAllDoctors((prevDoctors) => [...prevDoctors, newDoctor]);

      toast.success("New doctor added successfully");

      // Only reset form and close modal on success
      resetForm();
      closeModal();

      return newDoctor;
    } catch (error) {
      console.error("Error adding doctor:", error);

      toast.error(
        error.response?.data?.message || error.message || "Failed to add doctor"
      );

      // Don't close modal or reset form on error
      throw error;
    } finally {
      hideLoader();
    }
  };

  // Filter doctors based on search term and filters
  useEffect(() => {
    let results = [...allDoctors];

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
  }, [searchTerm, activeFilters, allDoctors]);

  return (
    <div className="container mx-auto px-4 h-screen flex flex-col">
      {/* Reusable Header */}
      <Header
        title="Billing Overview"
        subtitle="All Consultations of All Healthcare Providers"
        onSearch={(term) => setSearchTerm(term)}
        onFilter={(filters) => setActiveFilters(filters)}
        onAddDoctor={() => setShowAddDoctorModal(true)}
        filterOptions={filterOptions}
      />

      {/* Doctor Listing */}
      <div className="flex-grow overflow-y-auto">
        {filteredDoctors.length ? (
          <DoctorListing doctors={filteredDoctors} />
        ) : (
          <p>No doctors found.</p>
        )}
      </div>

      {/* Add Doctor Modal Form */}
      <AddDoctorForm
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onAddDoctor={(doctorData, resetForm) =>
          handleAddDoctor(doctorData, resetForm, () =>
            setShowAddDoctorModal(false)
          )
        }
      />
    </div>
  );
};

export default BillingPage;
