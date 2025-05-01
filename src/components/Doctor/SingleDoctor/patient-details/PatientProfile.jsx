// PatientProfile.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import HealthMetric from "./HealthMetric";

const PatientProfile = ({ patient, setPatientData }) => {
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomNumber, setRoomNumber] = useState(patient.roomNumber || "28B");

  // Opcje statusu ryzyka
  const riskStatusOptions = ["Normalny", "Ryzykowny", "Wysokie ryzyko", "Krytyczny"];

  // Opcje statusu leczenia
  const treatmentStatusOptions = [
    "W trakcie leczenia",
    "Wyleczony",
    "Zaplanowany",
    "W przeglądzie",
  ];

  // Obsługa zmian statusu
  const handleStatusChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Obsługa edycji numeru sali
  const handleRoomNumberChange = (e) => {
    setRoomNumber(e.target.value);
  };

  const saveRoomNumber = () => {
    handleStatusChange("roomNumber", roomNumber);
    setIsEditingRoom(false);
  };

  // Obsługa aktualizacji parametrów zdrowotnych
  const handleMetricUpdate = (metric, value) => {
    const mappings = {
      "blood pressure": "bloodPressure",
      temperature: "temperature",
      weight: "weight",
      height: "height",
    };

    const field = mappings[metric] || metric;
    handleStatusChange(field, value);
  };

  return (
    <div className="w-full md:w-1/3 md:border-r border-gray-100 p-6">
      {/* Informacje o profilu */}
      <div className="w-full flex items-center">
        <div className="flex flex-col items-center text-center w-1/2 mb-6">
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
              <div className="bg-white rounded-full p-0.5">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </div>
            </div>
          </div>
          <h3 className="font-medium text-base">{patient.name}</h3>
          <p className="text-xs text-gray-500">
            {patient.age} lat, {patient.gender}
          </p>
        </div>

        {/* Karta statusu */}
        <div className="bg-teal-50 rounded-lg p-4 w-1/2">
          <h4 className="text-sm font-medium mb-3">Aktualny status</h4>

          {/* Numer sali - edytowalny */}
          <div className="bg-[#cce8e8] rounded-md p-2 mb-2 text-xs text-center relative">
            {isEditingRoom ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={roomNumber}
                  onChange={handleRoomNumberChange}
                  className="w-full p-1 rounded text-xs"
                  autoFocus
                  onBlur={saveRoomNumber}
                  onKeyPress={(e) => e.key === "Enter" && saveRoomNumber()}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>Numer sali: {patient.roomNumber || "28B"}</span>
                <svg
                  onClick={() => setIsEditingRoom(true)}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cursor-pointer"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Status ryzyka - lista rozwijana */}
          <div className="bg-[#cce8e8] rounded-md p-2 mb-2 text-xs">
            <div className="relative">
              <select
                value={patient.riskStatus || "Normalny"}
                onChange={(e) =>
                  handleStatusChange("riskStatus", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 py-1"
              >
                {riskStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                <ChevronDown size={12} className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Status leczenia - lista rozwijana */}
          <div className="bg-[#cce8e8] rounded-md p-2 text-xs">
            <div className="relative">
              <select
                value={patient.treatmentStatus || "W trakcie leczenia"}
                onChange={(e) =>
                  handleStatusChange("treatmentStatus", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 py-1"
              >
                {treatmentStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                <ChevronDown size={12} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informacje kontaktowe */}
      <div className="mb-6 grid grid-cols-2 gap-4 mt-4 border-y py-4">
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm">{patient.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Numer telefonu</p>
          <p className="text-sm">{patient.phone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Data urodzenia</p>
          <p className="text-sm">{patient.birthDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Choroby</p>
          <p className="text-sm">{patient.disease || "Nie określono"}</p>
        </div>
      </div>

      {/* Parametry zdrowotne - edytowalne */}
      <div className="grid grid-cols-2 gap-4">
        <HealthMetric
          title="Ciśnienie krwi"
          value={patient.bloodPressure}
          percentage={30}
          onUpdate={handleMetricUpdate}
        />
        <HealthMetric
          title="Temperatura"
          value={patient.temperature}
          percentage={45}
          onUpdate={handleMetricUpdate}
        />
        <HealthMetric
          title="Waga"
          value={patient.weight}
          percentage={60}
          onUpdate={handleMetricUpdate}
        />
        <HealthMetric
          title="Wzrost"
          value={patient.height}
          percentage={75}
          onUpdate={handleMetricUpdate}
        />
      </div>
    </div>
  );
};

export default PatientProfile;
