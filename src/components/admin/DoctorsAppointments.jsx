import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import doctorService from "../../helpers/doctorHelper";
import { useSpecializations } from "../../context/SpecializationContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

/** When set (e.g. logged-in doctor’s doc id), only that doctor appears in the list. */
function doctorMatchesAllowedId(doctor, allowedDoctorId) {
  if (allowedDoctorId == null || allowedDoctorId === "") return true;
  const want = String(allowedDoctorId).trim();
  const ids = [doctor?._id, doctor?.id, doctor?.d_id].filter(Boolean).map(String);
  return ids.some((id) => id === want);
}

function doctorDisplayName(doctor) {
  if (!doctor) return "Lekarz";
  if (typeof doctor.name === "string" && doctor.name.trim()) return doctor.name;
  const first = doctor.name?.first || "";
  const last = doctor.name?.last || "";
  const full = `${first} ${last}`.trim();
  return full || "Lekarz";
}

function doctorSpecializationLabel(doctor) {
  const specs = doctor?.specialization;
  if (Array.isArray(specs)) {
    return specs
      .map((s) => (typeof s === "string" ? s : s?.name))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof specs === "string") return specs;
  return doctor?.specialty || "";
}

const DoctorSelectionWithSlots = ({
  onDoctorSelect,
  onSlotSelect,
  selectedDate,
  selectedPatient = null,
  smsConsentAgreed = true,
  onSmsConsentChange = null,
  loadingNextAvailableDate = false,
  hideDoctorSelection = false,
  selectedDoctor: propSelectedDoctor = null,
  hideSlotList = false, // when true, receptionist uses "set own date" – no slot list, no auto-fetch
  /** If set, filter fetched doctors to this id only (create-visit flow for logged-in doctor). */
  allowedDoctorId = null,
}) => {
  const { specializations } = useSpecializations();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(propSelectedDoctor);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Name search (admin / reception) — skip specialization path
  const [doctorSearch, setDoctorSearch] = useState("");
  const debouncedDoctorSearch = useDebouncedValue(doctorSearch, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const allowDoctorNameSearch = !hideDoctorSelection && !allowedDoctorId;
  const searchActive = allowDoctorNameSearch && debouncedDoctorSearch.trim().length >= 2;

  // Handle pre-selected doctor
  useEffect(() => {
    if (propSelectedDoctor && !hideDoctorSelection) {
      setSelectedDoctor(propSelectedDoctor);
    }
  }, [propSelectedDoctor, hideDoctorSelection]);

  // Fetch doctors when specialization changes (classic path)
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialization || hideDoctorSelection || searchActive) return;

      setIsLoading(true);
      try {
        const filters = { specialization: selectedSpecialization };
        const response = await doctorService.getAllDoctors(filters);
        const raw = response.doctors || [];
        const filtered = allowedDoctorId
          ? raw.filter((d) => doctorMatchesAllowedId(d, allowedDoctorId))
          : raw;
        setDoctors(filtered);
      } catch (error) {
        console.error("Błąd podczas pobierania lekarzy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialization, hideDoctorSelection, allowedDoctorId, searchActive]);

  // Debounced doctor name search
  useEffect(() => {
    if (!allowDoctorNameSearch) return;
    const term = debouncedDoctorSearch.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    (async () => {
      try {
        const response = await doctorService.getAllDoctors({
          search: term,
          limit: 20,
        });
        if (cancelled) return;
        const raw = response.doctors || [];
        setSearchResults(raw);
      } catch (error) {
        console.error("Błąd podczas wyszukiwania lekarzy:", error);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedDoctorSearch, allowDoctorNameSearch]);

  // Fetch available slots when doctor or date changes (skip when hideSlotList – "set own date" mode)
  useEffect(() => {
    if (hideSlotList) return;
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;

      setIsLoading(true);
      try {
        const response = await doctorService.getDoctorAvailableSlots(
          selectedDoctor._id,
          selectedDate
        );
        setAvailableSlots(response.data.data || []);
      } catch (error) {
        console.error("Błąd podczas pobierania dostępnych terminów:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, selectedDate, hideSlotList]);

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
    setDoctorSearch("");
    setSearchResults([]);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    onDoctorSelect(doctor);
    setSelectedSlot(null);
  };

  const handleDoctorSelectFromSearch = (doctor) => {
    // Prefer matching specialization id for progress UI when doctor has one
    const firstSpec = Array.isArray(doctor.specialization)
      ? doctor.specialization[0]
      : doctor.specialization;
    const specId =
      (typeof firstSpec === "object" && firstSpec?._id) ||
      (typeof firstSpec === "string" && specializations?.some((s) => s._id === firstSpec)
        ? firstSpec
        : "") ||
      "";
    if (specId) setSelectedSpecialization(String(specId));
    setDoctorSearch("");
    setSearchResults([]);
    handleDoctorSelect(doctor);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  // Group slots by morning, afternoon, evening
  const groupedSlots = {
    morning: availableSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      return hour >= 0 && hour < 12;
    }),
    afternoon: availableSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      return hour >= 12 && hour < 17;
    }),
    evening: availableSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      return hour >= 17 && hour < 24;
    }),
  };

  // Format time to 24-hour format for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const TimeSlotSection = ({ title, slots }) => {
    if (!slots || slots.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
          {title}
        </h4>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSlotSelect(slot)}
              className={`
                px-4 py-2 text-sm rounded-md transition-all duration-200
                ${
                  selectedSlot && selectedSlot.startTime === slot.startTime
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-teal-400 hover:shadow-sm"
                }
                ${
                  !slot.available
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              disabled={!slot.available}
            >
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderLoadingState = (customMessage = "Ładowanie...") => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      <span className="ml-2 text-gray-600">{customMessage}</span>
    </div>
  );

  const renderEmptyState = (message) => (
    <div className="py-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );

  const renderDoctorCard = (doctor) => (
    <div
      key={doctor._id}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all duration-200
        ${
          selectedDoctor && selectedDoctor._id === doctor._id
            ? "border-2 border-teal-500 bg-teal-50 shadow-sm"
            : "border border-gray-200 hover:border-teal-300 hover:shadow-sm"
        }
      `}
      onClick={() =>
        searchActive ? handleDoctorSelectFromSearch(doctor) : handleDoctorSelect(doctor)
      }
    >
      <div className="flex items-center">
        <div className="h-14 w-14 mr-3 relative rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
          {doctor.image || doctor.profilePicture ? (
            <img
              src={doctor.image || doctor.profilePicture}
              alt={doctorDisplayName(doctor)}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-xl font-medium">
              {doctorDisplayName(doctor).charAt(0) || "L"}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {doctorDisplayName(doctor)}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {doctorSpecializationLabel(doctor)}
          </p>
        </div>

        {selectedDoctor && selectedDoctor._id === doctor._id && (
          <div className="absolute top-3 right-3 text-teal-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  const step1Done = !!(selectedSpecialization || selectedDoctor);
  const doctorsToShow = searchActive ? searchResults : doctors;
  const showDoctorList =
    !hideDoctorSelection && (searchActive || !!selectedSpecialization);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress steps */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step1Done
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium">Specjalizacja</span>
          </div>
          <div className="h-px w-12 bg-gray-200"></div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedDoctor
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium">Lekarz</span>
          </div>
          <div className="h-px w-12 bg-gray-200"></div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedSlot
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <span className="ml-2 text-sm font-medium">Termin</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!hideDoctorSelection && (
          <>
            {/* Doctor name search — reception / admin */}
            {allowDoctorNameSearch && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Szukaj lekarza po nazwisku
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => {
                      setDoctorSearch(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedSpecialization("");
                        setDoctors([]);
                      }
                    }}
                    placeholder="np. Kowalski, Nowak…"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoComplete="off"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Wpisz co najmniej 2 znaki, aby wyszukać. Możesz też wybrać specjalizację poniżej.
                </p>
              </div>
            )}

            {allowDoctorNameSearch && (
              <div className="relative mb-6 flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  lub
                </span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            )}

            {/* Specialization Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wybierz Specjalizację
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none p-3 pl-4 pr-10 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
                  value={selectedSpecialization}
                  onChange={handleSpecializationChange}
                  disabled={searchActive}
                >
                  <option value="">Wybierz specjalizację</option>
                  {specializations &&
                    specializations.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Doctor Selection */}
        {showDoctorList && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {searchActive ? "Wyniki wyszukiwania" : "Wybierz Lekarza"}
              </label>

              {!searchLoading && !isLoading && doctorsToShow.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {doctorsToShow.length} dostępnych
                </span>
              )}
            </div>

            {(searchActive ? searchLoading : isLoading && doctors.length === 0) ? (
              renderLoadingState(
                searchActive ? "Szukam lekarzy..." : "Ładowanie lekarzy..."
              )
            ) : doctorsToShow.length === 0 ? (
              renderEmptyState(
                searchActive
                  ? "Nie znaleziono lekarza o podanym nazwisku"
                  : "Brak dostępnych lekarzy w tej specjalizacji"
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctorsToShow.map((doctor) => renderDoctorCard(doctor))}
              </div>
            )}
          </div>
        )}

        {/* Selected doctor chip when chosen via search and list collapsed */}
        {!hideDoctorSelection && selectedDoctor && !showDoctorList && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybrany lekarz
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderDoctorCard(selectedDoctor)}
            </div>
          </div>
        )}

        {/* Time Slots - show if doctor is selected (either from selection or pre-selected) */}
        {selectedDoctor && !hideSlotList && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Dostępne Terminy
              </label>
              <span className="text-xs text-gray-500">
                {selectedDate && (
                  <>
                    Na dzień{" "}
                    {new Date(selectedDate).toLocaleDateString("pl-PL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </>
                )}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              {isLoading || loadingNextAvailableDate ? (
                renderLoadingState(
                  loadingNextAvailableDate
                    ? "Sprawdzanie dostępności lekarza..."
                    : "Ładowanie terminów..."
                )
              ) : availableSlots.length === 0 ? (
                renderEmptyState(
                  "Brak dostępnych terminów dla tego lekarza w wybranym dniu"
                )
              ) : (
                <div className="space-y-6">
                  <TimeSlotSection
                    title="Rano"
                    slots={groupedSlots.morning}
                  />
                  <TimeSlotSection
                    title="Popołudnie"
                    slots={groupedSlots.afternoon}
                  />
                  <TimeSlotSection
                    title="Wieczór"
                    slots={groupedSlots.evening}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSelectionWithSlots;
