import React, { useState, useEffect } from "react";
import Header from "./DoctorHeader";
import DoctorListing from "./DoctorList";
import AddDoctorForm from "./CreateDoctor";
import doctorService from "../../helpers/doctorHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useSpecializations } from "../../context/SpecializationContext";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { format } from "date-fns";

const formatDoctorName = (name) =>
  typeof name === "object" && name !== null
    ? [name.first, name.last].filter(Boolean).join(" ") || ""
    : String(name || "");

const transformDoctorsResponse = (doctorsList) =>
  (doctorsList || []).map((doc) => ({
    id: doc.id || doc._id,
    name: formatDoctorName(doc.name) || "",
    specialty: doc.specialty || doc.specializations?.[0] || "General",
    timing: "9:30 - 13:00",
    date: doc.date ? format(new Date(doc.date), "dd.MM.yyyy") : "",
    description:
      doc.bio ||
      "Infectious disease center focused on current research in microbiology, virology, and parasitology.",
    image: doc.image || "https://placehold.jp/250x50.png?",
    status: doc.status || (doc.available ? "Available" : "Unavailable"),
    visitType: doc.visitType || "Consultation",
    available: doc.available ?? true,
  }));

const SEARCH_DEBOUNCE_MS = 400;

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [visitTypesFromApi, setVisitTypesFromApi] = useState([]);

  const { showLoader, hideLoader } = useLoader();
  const { specializations } = useSpecializations();

  // Debounce search term for API calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch doctors from API with filters and search (Lista lekarzy)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        showLoader();
        const apiFilters = {
          ...activeFilters,
          search: debouncedSearch?.trim() || undefined,
          doctor: undefined,
        };
        const response = await doctorService.getAllDoctors(apiFilters);
        const transformed = transformDoctorsResponse(response.doctors || []);
        setAllDoctors(transformed);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setAllDoctors([]);
      } finally {
        hideLoader();
      }
    };

    fetchDoctors();
  }, [activeFilters, debouncedSearch]);

  // Fetch visit reasons for dynamic "Visit type" filter
  useEffect(() => {
    let cancelled = false;
    appointmentHelper
      .getVisitReasons()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? res;
        const categories = data?.categories ?? [];
        const displayNames = (Array.isArray(categories) ? categories : [])
          .flatMap((cat) => (cat.types || []).map((t) => t.displayName).filter(Boolean))
          .filter((name, idx, arr) => arr.indexOf(name) === idx);
        setVisitTypesFromApi(displayNames);
      })
      .catch(() => {
        if (!cancelled) setVisitTypesFromApi([]);
      });
    return () => { cancelled = true; };
  }, []);

  // Filter options: specialties and visit types from API; status values match backend (see BACKEND_DOCTORS_LIST_FILTERS.md)
  const visitTypeFallback = [
    { value: "Konsultacja", label: "Consultation" },
    { value: "Zabieg", label: "Procedure" },
    { value: "Kontrola", label: "Follow-up" },
  ];
  const visitTypeOptions =
    visitTypesFromApi.length > 0
      ? visitTypesFromApi.map((t) =>
          typeof t === "string" ? { value: t, label: t } : t
        )
      : visitTypeFallback;

  const filterOptions = {
    specialties: (specializations || []).map((spec) => ({
      id: spec._id || spec.id,
      name: spec.name || "",
    })),
    statuses: [
      { value: "Zaplanowane", label: "Scheduled" },
      { value: "Anulowane", label: "Cancelled" },
      { value: "Zakończone", label: "Completed" },
    ],
    visitTypes: visitTypeOptions,
  };

  const handleAddDoctor = async (doctorData, resetForm, closeModal) => {
    try {
      showLoader();
      const response = await doctorService.createDoctor(doctorData);

      const createdDoctor = response.doctor;

      const newDoctor = {
        id: createdDoctor.id || createdDoctor.d_id || `lek-${Date.now()}`,
        name:
          (createdDoctor.name && typeof createdDoctor.name === "object"
            ? [createdDoctor.name.first, createdDoctor.name.last].filter(Boolean).join(" ")
            : createdDoctor.name || `${doctorData.firstName} ${doctorData.lastName}`) || "",
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
        description: createdDoctor.bio || doctorData.description || "",
        consultationFee:
          createdDoctor.onlineConsultationFee || doctorData.consultationFee || 0,
        shortDescription: createdDoctor.shortDescription || doctorData.shortDescription || "",
        offlineConsultationFee:
          createdDoctor.offlineConsultationFee || doctorData.offlineConsultationFee || 0,
      };

      setAllDoctors((prevDoctors) => [...prevDoctors, newDoctor]);

      toast.success("Doctor added successfully");

      // Only reset form and close modal on success
      resetForm();
      closeModal();

      return newDoctor;
    } catch (error) {
      console.error("Error adding doctor:", error);

      toast.error(
        error.response?.data?.message || error.message || "Could not add doctor"
      );

      // Don't close modal or reset form on error
      throw error;
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full mx-auto px-4 py-8">
        {/* Header: title + search + add (same style as patient list) */}
        <Header
          title="Doctors"
          onSearch={(term) => setSearchTerm(term)}
          onFilter={(filters) => setActiveFilters(filters)}
          onAddDoctor={() => setShowAddDoctorModal(true)}
          filterOptions={filterOptions}
          compact
        />

        {/* Doctor Listing - card table */}
        <DoctorListing doctors={allDoctors} />
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