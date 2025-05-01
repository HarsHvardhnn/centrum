import { useState } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
function AppointmentFormModal({ onClose, onComplete, doctorId }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    patientSource: "",
    visitType: "",
    isInternational: false,
    selectedDoctor: doctorId ? { _id: doctorId } : null,
    selectedSlot: null,
    selectedDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    isWalkin: false,
    needsAttention: false,
    markAsArrived: false,
    notes: "",
    enableRepeats: false,
  });

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDoctorSelect = (doctor) => {
    setAppointmentData({
      ...appointmentData,
      selectedDoctor: doctor,
    });
  };

  const handleSlotSelect = (slot) => {
    setAppointmentData({
      ...appointmentData,
      selectedSlot: slot,
    });
  };

  const handleDateChange = (e) => {
    setAppointmentData({
      ...appointmentData,
      selectedDate: e.target.value,
      selectedSlot: null, // Reset slot when date changes
    });
  };

  const handleSubmit = () => {
    if (
      selectedPatient &&
      appointmentData.selectedDoctor &&
      appointmentData.selectedSlot
    ) {
      // Collect all data for backend submission
      const appointmentSubmissionData = {
        patient: selectedPatient._id,
        doctor: appointmentData.selectedDoctor._id,
        date: appointmentData.selectedDate,
        startTime: appointmentData.selectedSlot.startTime,
        endTime: appointmentData.selectedSlot.endTime,
        patientSource: appointmentData.patientSource,
        visitType: appointmentData.visitType,
        isInternational: appointmentData.isInternational,
        isWalkin: appointmentData.isWalkin,
        needsAttention: appointmentData.needsAttention,
        markAsArrived: appointmentData.markAsArrived,
        notes: appointmentData.notes,
        enableRepeats: appointmentData.enableRepeats,
      };

      console.log("Appointment data to submit:", appointmentSubmissionData);
      onComplete(appointmentSubmissionData);
    } else {
      // Show validation message
      alert("Proszę wybrać pacjenta, lekarza i termin, aby kontynuować");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Dodaj wizytę</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <PatientSearchField onPatientSelect={handlePatientSelect} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O pacjencie
            </label>

            <div className="bg-teal-50 p-3 inline-block rounded-lg mb-2 w-full">
              <div className="flex gap-3 items-center flex-wrap md:flex-nowrap">
                {/* Patient source input */}
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    name="patientSource"
                    placeholder="Wybierz źródło pacjenta"
                    value={appointmentData.patientSource}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Visit type radio buttons */}
                <div className="w-full md:w-1/2 flex justify-between items-center gap-3">
                  <label className="inline-flex items-center whitespace-nowrap">
                    <input
                      type="radio"
                      name="visitType"
                      value="first-time"
                      checked={appointmentData.visitType === "first-time"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2">Pierwsza wizyta</span>
                  </label>
                  <label className="inline-flex items-center whitespace-nowrap">
                    <input
                      type="radio"
                      name="visitType"
                      value="re-visit"
                      checked={appointmentData.visitType === "re-visit"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2">Kolejna wizyta</span>
                  </label>
                </div>
              </div>
            </div>

            {/* International Patient checkbox */}
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isInternational"
                  checked={appointmentData.isInternational}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-purple-600 border-gray-300 rounded-md focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-700">
                  Pacjent międzynarodowy
                </span>
              </label>
            </div>
          </div>

          {/* Doctor Selection with Slots Component */}
          <DoctorSelectionWithSlots
            onDoctorSelect={handleDoctorSelect}
            onSlotSelect={handleSlotSelect}
            selectedDate={appointmentData.selectedDate}
            initialDoctorId={doctorId}
          />

          {/* Time section */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>

            {/* Light teal background container */}
            <div className="bg-teal-50 p-3 rounded-lg mb-2">
              <div className="flex gap-2 items-center">
                {/* Date input */}
                <div className="w-full">
                  <input
                    type="date"
                    name="selectedDate"
                    value={appointmentData.selectedDate}
                    onChange={handleDateChange}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Status Checkboxes */}
            <div className="flex gap-x-4 gap-y-1 flex-wrap">
              {/* Mark Apt as Arrived */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="markAsArrived"
                  checked={appointmentData.markAsArrived}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Oznacz jako przybyły
                </span>
              </label>

              {/* Is Walkin */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isWalkin"
                  checked={appointmentData.isWalkin}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bez rejestracji</span>
              </label>

              {/* Needs Attention */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="needsAttention"
                  checked={appointmentData.needsAttention}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Wymaga uwagi
                </span>
              </label>
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notatki
            </label>
            <textarea
              name="notes"
              value={appointmentData.notes}
              onChange={handleInputChange}
              placeholder="Wprowadź szczegóły pacjenta..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 h-12 text-sm"
            ></textarea>
          </div>

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="enableRepeats"
              checked={appointmentData.enableRepeats}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 rounded mr-2"
            />
            <label htmlFor="enableRepeats" className="text-sm text-gray-700">
              Włącz powtarzanie dla pacjenta
            </label>
          </div>

          <div className="text-right">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 inline-flex items-center text-sm"
              disabled={
                !selectedPatient ||
                !appointmentData.selectedDoctor ||
                !appointmentData.selectedSlot
              }
            >
              Dodaj wizytę
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentFormModal;
