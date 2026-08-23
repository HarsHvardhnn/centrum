import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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

export function doctorDisplayName(doctor) {
  if (!doctor) return "Lekarz";
  if (typeof doctor.name === "string" && doctor.name.trim()) return doctor.name;
  const first = doctor.name?.first || "";
  const last = doctor.name?.last || "";
  const full = `${first} ${last}`.trim();
  return full || "Lekarz";
}

function specializationToLabel(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (typeof value.name === "string") return value.name;
    return "";
  }
  return String(value);
}

export function doctorSpecializationLabel(doctor) {
  const specs = doctor?.specialization;
  if (Array.isArray(specs)) {
    return specs.map(specializationToLabel).filter(Boolean).join(", ");
  }
  const fromSpec = specializationToLabel(specs);
  if (fromSpec) return fromSpec;
  return specializationToLabel(doctor?.specialty);
}

const DoctorSelectionWithSlots = ({
  onDoctorSelect,
  onSlotSelect,
  selectedDate,
  onDateChange = null,
  customStartTime = "",
  customEndTime = "",
  onCustomTimeChange = null,
  onClearSlotSelection = null,
  customTimeError = null,
  timeSelectionError = null,
  isBackdated = false,
  selectedPatient = null,
  smsConsentAgreed = true,
  onSmsConsentChange = null,
  loadingNextAvailableDate = false,
  hideDoctorSelection = false,
  selectedDoctor: propSelectedDoctor = null,
  selectedSlot: propSelectedSlot = null,
  hideSlotList = false, // when true, receptionist uses "set own date" – no slot list, no auto-fetch
  /** Opens "set own date/time" mode in parent form (shown below slot list). */
  onUseCustomDateOnly = null,
  /** If set, filter fetched doctors to this id only (create-visit flow for logged-in doctor). */
  allowedDoctorId = null,
}) => {
  const { specializations } = useSpecializations();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(propSelectedDoctor);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(propSelectedSlot);
  const [isLoading, setIsLoading] = useState(false);
  const [navigatingDate, setNavigatingDate] = useState(false);

  // Name search — always available when the doctor picker is shown (reception/admin)
  const [doctorSearch, setDoctorSearch] = useState("");
  const debouncedDoctorSearch = useDebouncedValue(doctorSearch, 180);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const allowDoctorNameSearch = !hideDoctorSelection;
  const searchActive = allowDoctorNameSearch && debouncedDoctorSearch.trim().length >= 1;

  // Keep local selection in sync with parent (including clear → null)
  useEffect(() => {
    if (hideDoctorSelection) return;
    if (propSelectedDoctor) {
      setSelectedDoctor(propSelectedDoctor);
    } else {
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
  }, [propSelectedDoctor, hideDoctorSelection]);

  // Restore slot highlight after Wstecz / remount from parent form state
  useEffect(() => {
    setSelectedSlot(propSelectedSlot || null);
  }, [propSelectedSlot]);

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
    if (term.length < 1) {
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
        const filtered = allowedDoctorId
          ? raw.filter((d) => doctorMatchesAllowedId(d, allowedDoctorId))
          : raw;
        setSearchResults(filtered);
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
  }, [debouncedDoctorSearch, allowDoctorNameSearch, allowedDoctorId]);

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

  const clearDoctorSelection = () => {
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    onDoctorSelect?.(null);
    onSlotSelect?.(null);
    // Keep specialization, search text, and result lists so user can pick another doctor.
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
    setDoctorSearch("");
    setSearchResults([]);
    // Changing specialty always drops doctor + slot (parent state included)
    clearDoctorSelection();
  };

  const handleDoctorSelect = (doctor) => {
    const prevId = selectedDoctor?._id;
    const nextId = doctor?._id;
    setSelectedDoctor(doctor);
    onDoctorSelect?.(doctor);
    // New / changed doctor → drop previous slot in child and parent
    if (!nextId || prevId !== nextId) {
      setSelectedSlot(null);
      onSlotSelect?.(null);
      setAvailableSlots([]);
    }
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
    // Keep search query + results so "Zmień lekarza" returns to the same list
    handleDoctorSelect(doctor);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect?.(slot);
  };

  const todayKey = new Date().toISOString().split("T")[0];
  const canGoPreviousDay =
    Boolean(onDateChange && selectedDate) &&
    (isBackdated || selectedDate > todayKey);

  const goToAdjacentAvailableDay = async (direction) => {
    if (!selectedDoctor?._id || !selectedDate || !onDateChange || navigatingDate) {
      return;
    }
    setNavigatingDate(true);
    try {
      const options =
        direction === 1
          ? { after: selectedDate }
          : { before: selectedDate, allowPast: isBackdated };
      const response = await doctorService.getNextAvailableDate(
        selectedDoctor._id,
        options
      );
      const nextDate = response?.data?.nextAvailableDate;
      if (!nextDate) {
        toast.info(
          direction === 1
            ? "Brak kolejnych wolnych terminów"
            : "Brak wcześniejszych wolnych terminów"
        );
        return;
      }
      onDateChange({ target: { name: "selectedDate", value: nextDate } });
    } catch (error) {
      console.error("Błąd podczas wyszukiwania wolnego terminu:", error);
      toast.error("Nie udało się znaleźć wolnego terminu");
    } finally {
      setNavigatingDate(false);
    }
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

  const renderManualTimeEntry = () => {
    if (!onCustomTimeChange || !selectedDate) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Dodaj termin ręcznie
        </h4>

        {selectedSlot && (
          <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-sm text-green-800">
                  <strong>✓ Wybrano termin:</strong> {selectedSlot.startTime} -{" "}
                  {selectedSlot.endTime}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Możesz zmienić na własny termin poniżej — wybrany slot zostanie
                  odznaczony.
                </p>
              </div>
              {onClearSlotSelection && (
                <button
                  type="button"
                  onClick={onClearSlotSelection}
                  className="text-xs text-red-600 hover:text-red-800 underline shrink-0"
                >
                  Wyczyść wybór
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600 mb-3">
          Wybierz termin z listy powyżej <strong>lub</strong> ustaw własny czas
          poniżej (nie obie opcje naraz).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czas rozpoczęcia
            </label>
            <input
              type="time"
              name="customStartTime"
              value={customStartTime || ""}
              onChange={onCustomTimeChange}
              className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={selectedSlot != null}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czas zakończenia (opcjonalny)
            </label>
            <input
              type="time"
              name="customEndTime"
              value={customEndTime || ""}
              onChange={onCustomTimeChange}
              className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={selectedSlot != null}
            />
          </div>
        </div>
        {customTimeError && (
          <p className="text-red-500 text-xs mt-2">{customTimeError}</p>
        )}
        {timeSelectionError && (
          <p className="text-red-500 text-xs mt-2">{timeSelectionError}</p>
        )}
      </div>
    );
  };

  const step1Done = !!(selectedSpecialization || selectedDoctor || searchActive);
  const doctorsToShow = searchActive ? searchResults : doctors;
  const showDoctorList =
    !hideDoctorSelection &&
    (searchActive ||
      !!selectedSpecialization ||
      doctorsToShow.length > 0);

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
            <span className="ml-2 text-sm font-medium">
              {allowDoctorNameSearch ? "Lekarz lub specjalizacja" : "Specjalizacja"}
            </span>
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
            <span className="ml-2 text-sm font-medium">Wybór lekarza</span>
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
            <span className="ml-2 text-sm font-medium">Wybór terminu</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!hideDoctorSelection && (
          <>
            {/* Primary: doctor name search for reception / admin */}
            {allowDoctorNameSearch && (
              <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50/60 p-4">
                  <label
                  htmlFor="doctor-name-search"
                  className="block text-sm font-semibold text-teal-900 mb-2"
                >
                  Wyszukaj lekarza
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none"
                  />
                  <input
                    id="doctor-name-search"
                    type="search"
                    value={doctorSearch}
                    onChange={(e) => {
                      setDoctorSearch(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedSpecialization("");
                        setDoctors([]);
                      }
                    }}
                    placeholder="Wpisz imię lub nazwisko lekarza"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-teal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-teal-800/80">
                  Wybierz tę opcję, jeśli znasz lekarza.
                </p>
              </div>
            )}

            {allowDoctorNameSearch && (
              <div className="relative mb-6 flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  lub wybierz specjalizację
                </span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            )}

            {/* Optional: specialization filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {allowDoctorNameSearch
                  ? "Specjalizacja"
                  : "Wybierz specjalizację"}
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

        {/* Always keep selected doctor visible (even while searching another specialty) */}
        {!hideDoctorSelection && selectedDoctor && (
          <div className="mb-6 rounded-lg border-2 border-teal-500 bg-teal-50 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Aktualnie wybrany lekarz
                </p>
                <p className="text-sm text-teal-800/80 mt-0.5">
                  Terminy poniżej dotyczą tego lekarza. Użyj „Zmień lekarza”, aby wybrać innego — wyszukiwanie i filtry pozostaną.
                </p>
              </div>
              <button
                type="button"
                onClick={clearDoctorSelection}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Zmień lekarza
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderDoctorCard(selectedDoctor)}
            </div>
          </div>
        )}

        {/* Doctor Selection */}
        {showDoctorList && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {searchActive
                  ? selectedDoctor
                    ? "Wyniki wyszukiwania (wybierz innego lekarza, aby zmienić)"
                    : "Wyniki wyszukiwania"
                  : "Wybór lekarza"}
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

        {/* Time Slots - show if doctor is selected (either from selection or pre-selected) */}
        {selectedDoctor && !hideSlotList && (
          <div className="mb-3">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                {onDateChange && (
                  <button
                    type="button"
                    aria-label="Poprzedni wolny termin"
                    title="Poprzedni dzień z wolnym terminem"
                    disabled={!canGoPreviousDay || navigatingDate || isLoading}
                    onClick={() => goToAdjacentAvailableDay(-1)}
                    className="shrink-0 p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Dostępne Terminy
                  </label>
                  {selectedDate && (
                    <span className="text-xs text-gray-500">
                      Na dzień{" "}
                      {new Date(selectedDate).toLocaleDateString("pl-PL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {onDateChange && (
                  <button
                    type="button"
                    aria-label="Następny wolny termin"
                    title="Następny dzień z wolnym terminem"
                    disabled={navigatingDate || isLoading}
                    onClick={() => goToAdjacentAvailableDay(1)}
                    className="shrink-0 p-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
              {onDateChange && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Wybierz datę wizyty
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      name="selectedDate"
                      value={selectedDate || ""}
                      onChange={onDateChange}
                      className="p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                    />
                    {isBackdated && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Data w przeszłości dozwolona
                      </span>
                    )}
                  </div>
                </div>
              )}
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

              {renderManualTimeEntry()}

              {onUseCustomDateOnly &&
                !isLoading &&
                !loadingNextAvailableDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <button
                    type="button"
                    onClick={onUseCustomDateOnly}
                    className="text-sm font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2"
                  >
                    Ustaw własną datę i godzinę – bez przeglądania listy terminów
                  </button>
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
