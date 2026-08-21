import React, { useState, useEffect } from "react";
import Header from "./DoctorHeader";
import DoctorListing from "./DoctorList";
import AddDoctorForm from "./CreateDoctor";
import doctorService from "../../helpers/doctorHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useSpecializations } from "../../context/SpecializationContext";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { readListState, writeListState, useListScrollRestore } from "../../hooks/usePersistedListState";
import { format } from "date-fns";

const formatDoctorName = (name) =>
  typeof name === "object" && name !== null
    ? [name.first, name.last].filter(Boolean).join(" ") || ""
    : String(name || "");

const transformDoctorsResponse = (doctorsList) =>
  (doctorsList || []).map((doc) => ({
    id: doc.id || doc._id,
    name: formatDoctorName(doc.name) || "",
    specialty: doc.specialty || doc.specializations?.[0] || "Ogólny",
    timing: "9:30 - 13:00",
    date: doc.date ? format(new Date(doc.date), "dd.MM.yyyy") : "",
    description:
      doc.bio ||
      "Centrum Chorób Zakaźnych ma na celu dostarczanie aktualnych, istotnych badań dotyczących aspektów mikrobiologii, wirusologii i parazytologii.",
    image: doc.image || "https://placehold.jp/250x50.png?",
    status: doc.status || (doc.available ? "Dostępny" : "Niedostępny"),
    visitType: doc.visitType || "Konsultacja",
    available: doc.available ?? true,
  }));

const SEARCH_DEBOUNCE_MS = 400;

const BillingPage = () => {
  const savedDoctors = readListState("admin-doctors") || {};
  const [searchTerm, setSearchTerm] = useState(savedDoctors.searchTerm || "");
  const [debouncedSearch, setDebouncedSearch] = useState(savedDoctors.searchTerm || "");
  const [activeFilters, setActiveFilters] = useState(savedDoctors.activeFilters || {});
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

  useEffect(() => {
    writeListState("admin-doctors", { searchTerm, activeFilters });
  }, [searchTerm, activeFilters]);

  useListScrollRestore("admin-doctors", allDoctors.length > 0);

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
        console.error("Nie udało się pobrać lekarzy:", error);
        setAllDoctors([]);
      } finally {
        hideLoader();
      }
    };

    fetchDoctors();
  }, [activeFilters, debouncedSearch]);

  // Fetch visit reasons for dynamic "Typ wizyty" filter
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

  // Filter options: specialties and visit types from API, statuses static
  const filterOptions = {
    specialties: (specializations || []).map((spec) => ({
      id: spec._id || spec.id,
      name: spec.name || "",
    })),
    statuses: ["Zaplanowane", "Anulowane", "Zakończone"],
    visitTypes: visitTypesFromApi.length > 0 ? visitTypesFromApi : ["Konsultacja", "Zabieg", "Kontrola"],
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
        status: createdDoctor.status || "Dostępny",
        department:createdDoctor?.department || "",
        experience:
          createdDoctor.experience || `${doctorData.experience} lat`,
        image: createdDoctor.image || doctorData.profilePicture,
        visitType: "Konsultacja",
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

      toast.success("Nowy lekarz został dodany pomyślnie");

      // Only reset form and close modal on success
      resetForm();
      closeModal();

      return newDoctor;
    } catch (error) {
      console.error("Błąd podczas dodawania lekarza:", error);

      toast.error(
        error.response?.data?.message || error.message || "Nie udało się dodać lekarza"
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
        {/* Header: title + search + add (same style as Lista pacjentów) */}
        <Header
          title="Lista lekarzy"
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