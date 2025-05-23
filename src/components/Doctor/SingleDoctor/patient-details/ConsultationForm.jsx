// ConsultationForm.jsx
import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Upload, Trash2, Search } from "lucide-react";
import FileUploadArea from "./FileUploadArea";
import FileListItem from "./FileListItem";

const ConsultationForm = ({
  patientData,
  consultationData,
  setConsultationData,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  setPatientData,
  appointmentId,
  className = "",
}) => {
  console.log("consulting doctor", uploadedFiles);

  // Stan dla rozwijanej listy z wyszukiwaniem
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Opcje kategorii leczenia
  const treatmentCategories = [
    "Leki",
    "Fizjoterapia",
    "Chirurgia",
    "Terapia psychologiczna",
    "Poradnictwo żywieniowe",
    "Leczenie chiropraktyczne",
    "Akupunktura",
    "Homeopatia",
    "Terapia zajęciowa",
    "Terapia mowy",
    "Radioterapia",
    "Chemioterapia",
    "Medycyna alternatywna",
    "Immunoterapia",
    "Terapia oddechowa",
  ];

  // Filtrowanie opcji na podstawie wyszukiwania
  const filteredCategories = treatmentCategories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatowanie daty i czasu przy montowaniu komponentu lub zmianie consultationData
  useEffect(() => {
    if (consultationData.consultationDate) {
      try {
        const dateObj = new Date(consultationData.consultationDate);
        if (!isNaN(dateObj.getTime())) {
          const formattedDate = dateObj.toISOString().split("T")[0];

          if (formattedDate !== consultationData.consultationDate) {
            setConsultationData((prev) => ({
              ...prev,
              date: formattedDate,
            }));
          }
        }
      } catch (error) {
        console.error("Błąd formatowania daty:", error);
      }
    }

    if (consultationData.time) {
      try {
        if (
          consultationData.time.includes("am") ||
          consultationData.time.includes("pm")
        ) {
          const timeParts = consultationData.time.match(
            /(\d+):(\d+)\s*(am|pm)/i
          );
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = timeParts[2];
            const period = timeParts[3].toLowerCase();

            if (period === "pm" && hours < 12) {
              hours += 12;
            } else if (period === "am" && hours === 12) {
              hours = 0;
            }

            const formattedTime = `${hours
              .toString()
              .padStart(2, "0")}:${minutes}`;

            if (formattedTime !== consultationData.time) {
              setConsultationData((prev) => ({
                ...prev,
                time: formattedTime,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Błąd formatowania czasu:", error);
      }
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [consultationData.date, consultationData.time]);

  const handleConsultationChange = (field, value) => {
    setConsultationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInternationalPatientChange = (e) => {
    setPatientData((prev) => ({
      ...prev,
      isInternationalPatient: e.target.checked,
    }));
  };

  const selectTreatmentCategory = (category) => {
    handleConsultationChange("treatmentCategory", category);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const consultationTypes = [
    "Konsultacja w przychodni",
    "Konsultacja online",
    "Wizyta domowa",
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 w-full ${className}`}>
      <h3 className="font-medium text-gray-800 mb-6 text-lg">Szczegóły konsultacji</h3>
      {/* Formularz lekarza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Lekarz prowadzący
          </label>
          <input
            type="text"
            disabled
            value={consultationData.consultationDoctor}
            onChange={(e) => handleConsultationChange("doctor", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Rodzaj konsultacji
          </label>
          <div className="relative">
            <select
              value={consultationData.consultationType || ""}
              onChange={(e) =>
                handleConsultationChange("consultationType", e.target.value)
              }
              className="w-full p-2.5 border border-gray-200 rounded-lg appearance-none pr-8"
            >
              <option value="" disabled>
                Wybierz rodzaj konsultacji
              </option>
              {consultationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Rozwijana lista kategorii leczenia z wyszukiwaniem */}
        {/* <div>
          <label className="block text-sm text-gray-600 mb-1">
            Kategoria leczenia
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-full p-2.5 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {consultationData.treatmentCategory || "Wybierz kategorię"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Wyszukaj kategorię..."
                      className="w-full p-2 pl-8 border border-gray-200 rounded-lg"
                    />
                    <Search
                      size={16}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <div
                      key={category}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectTreatmentCategory(category)}
                    >
                      {category}
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="px-4 py-2 text-gray-500">
                      Nie znaleziono wyników
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div> */}
{/* 
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Miejsce konsultacji
          </label>
          <input
            type="text"
            value={consultationData.locationType}
            onChange={(e) =>
              handleConsultationChange("locationType", e.target.value)
            }
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div> */}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Data</label>
          <input
            type="date"
            value={consultationData.date || ""}
            onChange={(e) => handleConsultationChange("date", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Godzina</label>
          <input
            type="time"
            value={consultationData.time || ""}
            onChange={(e) => handleConsultationChange("time", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Wywiad z pacjentem */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Wywiad z pacjentem</label>
        <textarea
          value={consultationData.interview || ""}
          onChange={(e) =>
            handleConsultationChange("interview", e.target.value)
          }
          rows={4}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Wprowadź informacje z wywiadu z pacjentem..."
        ></textarea>
      </div>

      {/* Badanie przedmiotowe */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Badanie przedmiotowe</label>
        <textarea
          value={consultationData.physicalExamination || ""}
          onChange={(e) =>
            handleConsultationChange("physicalExamination", e.target.value)
          }
          rows={4}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Wprowadź wyniki badania przedmiotowego..."
        ></textarea>
      </div>

      {/* Zastosowane leczenie */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Zastosowane leczenie</label>
        <textarea
          value={consultationData.treatment || ""}
          onChange={(e) =>
            handleConsultationChange("treatment", e.target.value)
          }
          rows={4}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Wprowadź informacje o zastosowanym leczeniu..."
        ></textarea>
      </div>

      {/* Zalecenia */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Zalecenia</label>
        <textarea
          value={consultationData.recommendations || ""}
          onChange={(e) =>
            handleConsultationChange("recommendations", e.target.value)
          }
          rows={4}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Wprowadź zalecenia dla pacjenta..."
        ></textarea>
      </div>

      {/* Międzynarodowy pacjent */}
      <div className="mt-6 flex items-center">
        <input
          type="checkbox"
          id="isInternationalPatient"
          checked={patientData?.isInternationalPatient || false}
          onChange={handleInternationalPatientChange}
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label
          htmlFor="isInternationalPatient"
          className="ml-2 block text-sm text-gray-900"
        >
          Pacjent międzynarodowy
        </label>
      </div>

      {/* Opis i notatki */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Notatki</label>
        <textarea
          value={consultationData.description || ""}
          onChange={(e) =>
            handleConsultationChange("description", e.target.value)
          }
          rows={3}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Dodaj notatki..."
        ></textarea>
      </div>

      {/* Przesyłanie załączników */}
   
    </div>
  );
};

export default ConsultationForm;
