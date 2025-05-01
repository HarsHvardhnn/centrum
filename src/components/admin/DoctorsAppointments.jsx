import { useState, useEffect } from "react";
import doctorService from "../../helpers/doctorHelper";
import { useSpecializations } from "../../context/SpecializationContext";

const DoctorSelectionWithSlots = ({
  onDoctorSelect,
  onSlotSelect,
  selectedDate,
}) => {
  const { specializations } = useSpecializations();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialization) return;

      setIsLoading(true);
      try {
        const filters = { specialization: selectedSpecialization };
        const response = await doctorService.getAllDoctors(filters);
        setDoctors(response.doctors || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialization]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
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
        console.error("Error fetching available slots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, selectedDate]);

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    onDoctorSelect(doctor);
    setSelectedSlot(null);
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

  // Format time to 12-hour format
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
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

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress steps */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedSpecialization
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium">Specialization</span>
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
            <span className="ml-2 text-sm font-medium">Doctor</span>
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
            <span className="ml-2 text-sm font-medium">Time Slot</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Specialization Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Specialization
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none p-3 pl-4 pr-10 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              value={selectedSpecialization}
              onChange={handleSpecializationChange}
            >
              <option value="">Choose a specialization</option>
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

        {/* Doctor Selection */}
        {selectedSpecialization && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Doctor
              </label>

              {/* Doctor count badge */}
              {!isLoading && doctors.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {doctors.length} available
                </span>
              )}
            </div>

            {isLoading && doctors.length === 0 ? (
              renderLoadingState()
            ) : doctors.length === 0 ? (
              renderEmptyState("No doctors available in this specialization")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctors.map((doctor) => (
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
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex items-center">
                      <div className="h-14 w-14 mr-3 relative rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={`Dr. ${doctor.name}`}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 text-xl font-medium">
                            {doctor.name?.charAt(0) || "D"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Dr. {doctor.name || "NA"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {doctor.specialization?.join(", ")}
                        </p>
                        {doctor.experience && (
                          <p className="text-xs text-gray-400 mt-1">
                            {doctor.experience} years experience
                          </p>
                        )}
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time Slots */}
        {selectedDoctor && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Available Time Slots
              </label>
              <span className="text-xs text-gray-500">
                {selectedDate && (
                  <>
                    For{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US", {
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
              {isLoading ? (
                renderLoadingState()
              ) : availableSlots.length === 0 ? (
                renderEmptyState(
                  "No available slots for this doctor on the selected date"
                )
              ) : (
                <div className="space-y-6">
                  <TimeSlotSection
                    title="Morning"
                    slots={groupedSlots.morning}
                  />
                  <TimeSlotSection
                    title="Afternoon"
                    slots={groupedSlots.afternoon}
                  />
                  <TimeSlotSection
                    title="Evening"
                    slots={groupedSlots.evening}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment summary */}
        {selectedSlot && (
          <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-lg">
            <h4 className="text-sm font-medium text-teal-800 mb-2">
              Appointment Summary
            </h4>
            <div className="flex flex-wrap gap-y-2">
              <div className="w-full md:w-1/2">
                <span className="text-xs text-gray-500">Specialization</span>
                <p className="text-sm font-medium">
                  {
                    specializations?.find(
                      (s) => s._id === selectedSpecialization
                    )?.name
                  }
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-xs text-gray-500">Doctor</span>
                <p className="text-sm font-medium">
                  Dr. {selectedDoctor?.name}
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-xs text-gray-500">Date</span>
                <p className="text-sm font-medium">
                  {selectedDate && new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-xs text-gray-500">Time</span>
                <p className="text-sm font-medium">
                  {formatTime(selectedSlot.startTime)} -{" "}
                  {formatTime(selectedSlot.endTime)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSelectionWithSlots;