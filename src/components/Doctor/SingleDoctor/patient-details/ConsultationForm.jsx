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
    if (consultationData.date) {
      try {
        const dateObj = new Date(consultationData.date);
        if (!isNaN(dateObj.getTime())) {
          const formattedDate = dateObj.toISOString().split("T")[0];

          if (formattedDate !== consultationData.date) {
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
    <div className="w-full md:w-2/3 p-6">
      {/* Formularz lekarza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Lekarz prowadzący
          </label>
          <input
            type="text"
            value={consultationData.doctor}
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
        <div>
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
        </div>

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
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Data</label>
          <input
            type="date"
            value={consultationData.date}
            onChange={(e) => handleConsultationChange("date", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Godzina</label>
          <input
            type="time"
            value={consultationData.time}
            onChange={(e) => handleConsultationChange("time", e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Opis i notatki */}
      <div className="mt-6">
        <label className="block text-sm text-gray-600 mb-1">Opis</label>
        <textarea
          value={consultationData.description}
          onChange={(e) =>
            handleConsultationChange("description", e.target.value)
          }
          rows={3}
          className="w-full p-2.5 border border-gray-200 rounded-lg resize-none"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm text-gray-600 mb-1">Notatki</label>
        <textarea
          value={consultationData.notes}
          onChange={(e) => handleConsultationChange("notes", e.target.value)}
          rows={3}
          className="w-full p-2.5 border border-gray-200 rounded-lg resize-none"
        />
      </div>

      {/* Przesyłanie plików */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Załączniki</h3>
        <FileUploadArea onFileUpload={onFileUpload} />

        {/* Lista przesłanych plików */}
        {uploadedFiles && uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <FileListItem
                key={index}
                file={file}
                onRemove={() => onRemoveFile(file.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Opcje dodatkowe */}
      <div className="mt-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={patientData?.isInternationalPatient || false}
            onChange={handleInternationalPatientChange}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="ml-2 text-sm text-gray-600">
            Pacjent międzynarodowy
          </span>
        </label>
      </div>
    </div>
  );
};

export default ConsultationForm;
