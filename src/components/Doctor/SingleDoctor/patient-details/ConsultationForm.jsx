// ConsultationForm.jsx
import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Upload, Trash2, Search, Clock, CheckCircle } from "lucide-react";
import VisitReasonCascadeDropdown from "../../../UtilComponents/VisitReasonCascadeDropdown";
import FileUploadArea from "./FileUploadArea";
import FileListItem from "./FileListItem";
import { toast } from "sonner";
import { apiCaller } from "../../../../utils/axiosInstance";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import { stripDoctorTitle } from "../../../../utils/statusHelper";

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

  console.log("consliutatojdata",consultationData)
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempEndTime, setTempEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  //("consulting doctor", uploadedFiles);

  // Stan dla rozwijanej listy z wyszukiwaniem
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Visit reason dictionary for doctor verification
  const [visitReasonsData, setVisitReasonsData] = useState({ categories: [] });
  const [verifyVisitReasonCategoryId, setVerifyVisitReasonCategoryId] = useState("");
  const [verifyVisitReasonDisplayName, setVerifyVisitReasonDisplayName] = useState("");
  const [isVerifyingVisitType, setIsVerifyingVisitType] = useState(false);

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
            setTempDate(formattedDate);
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
              setTempTime(formattedTime);
            }
          }
        } else {
          setTempTime(consultationData.time);
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

  // Fetch visit reason dictionary for verification
  useEffect(() => {
    let cancelled = false;
    appointmentHelper.getVisitReasons().then((res) => {
      if (cancelled) return;
      const data = res?.data ?? res;
      const categories = data?.categories ?? [];
      setVisitReasonsData({ categories: Array.isArray(categories) ? categories : [] });
    }).catch(() => {
      if (!cancelled) setVisitReasonsData({ categories: [] });
    });
    return () => { cancelled = true; };
  }, []);

  const handleConfirmVisitType = async () => {
    const displayName = verifyVisitReasonDisplayName || consultationData.visitReason || consultationData.consultationType;
    if (!displayName) {
      toast.error("Wybierz rodzaj wizyty z listy");
      return;
    }
    if (!appointmentId) return;
    setIsVerifyingVisitType(true);
    try {
      await appointmentHelper.updateConsultation(appointmentId, {
        visitReason: displayName,
        visitTypeVerified: true,
      });
      setConsultationData((prev) => ({
        ...prev,
        visitReason: displayName,
        visitTypeVerified: true,
        consultationType: displayName,
      }));
      setVerifyVisitReasonDisplayName("");
      setVerifyVisitReasonCategoryId("");
      toast.success("Rodzaj wizyty został potwierdzony");
    } catch (e) {
      console.error("Error verifying visit type:", e);
      toast.error(e?.response?.data?.message || "Nie udało się potwierdzić rodzaju wizyty");
    } finally {
      setIsVerifyingVisitType(false);
    }
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
          <p className="w-full p-2.5 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg">
            {stripDoctorTitle(consultationData.consultationDoctor || "") || "—"}
          </p>
        </div>
        {/* Rodzaj wizyty – weryfikacja przez lekarza (słownik) */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Rodzaj wizyty</label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-2">
              {consultationData.visitReason || consultationData.consultationType || "—"}
            </p>
            {consultationData.visitTypeVerified ? (
              <span className="inline-flex items-center gap-1 text-sm text-teal-700">
                <CheckCircle size={16} />
                Zweryfikowano
              </span>
            ) : (
              <>
                <p className="text-xs text-amber-700 mb-2">Lekarz musi potwierdzić lub zmienić rodzaj wizyty przed zamknięciem.</p>
                {visitReasonsData.categories.length > 0 && (
                  <div className="mb-2">
                    <VisitReasonCascadeDropdown
                      categories={visitReasonsData.categories}
                      value={verifyVisitReasonDisplayName}
                      onChange={(displayName) => {
                        const cat = visitReasonsData.categories.find((c) =>
                          (c.types || []).some((t) => t.displayName === displayName)
                        );
                        setVerifyVisitReasonCategoryId(cat?.id ?? "");
                        setVerifyVisitReasonDisplayName(displayName);
                      }}
                      placeholder="Wybierz typ wizyty..."
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleConfirmVisitType}
                  disabled={isVerifyingVisitType || (!verifyVisitReasonDisplayName && !(consultationData.visitReason || consultationData.consultationType))}
                  className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingVisitType ? "Zapisywanie..." : "Potwierdź rodzaj wizyty"}
                </button>
              </>
            )}
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
          {isEditingTime ? (
            <input
              type="date"
              value={tempDate || ""}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full p-2.5 border border-teal-300 rounded-lg"
              min=""
              max=""
              title="Dowolna data (także z przeszłości)"
            />
          ) : (
            <div className="flex items-center">
              <input
                type="date"
                value={consultationData.date || ""}
                disabled
                className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
              <button
                type="button"
                onClick={() => {
                  setIsEditingTime(true);
                  setTempDate(consultationData.date || "");
                  setTempTime(consultationData.time || "");
                  setTempEndTime(consultationData.endTime || "");
                }}
                className="ml-2 p-2 text-teal-600 hover:text-teal-800"
                title="Edytuj termin"
              >
                <Clock size={18} />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Godzina rozpoczęcia</label>
          {isEditingTime ? (
            <input
              type="time"
              value={tempTime || ""}
              onChange={(e) => {
                setTempTime(e.target.value);
                // Clear error when user changes start time
                if (timeError) setTimeError("");
              }}
              className={`w-full p-2.5 border ${timeError ? "border-red-300" : "border-teal-300"} rounded-lg`}
              min=""
              max=""
              title="Dowolna godzina (także z przeszłości)"
            />
          ) : (
            <input
              type="time"
              value={consultationData.time || ""}
              disabled
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Godzina zakończenia</label>
          {isEditingTime ? (
            <input
              type="time"
              value={tempEndTime || ""}
              onChange={(e) => {
                setTempEndTime(e.target.value);
                // Clear error when user changes end time
                if (timeError) setTimeError("");
              }}
              className={`w-full p-2.5 border ${timeError ? "border-red-300" : "border-teal-300"} rounded-lg`}
              min=""
              max=""
              title="Dowolna godzina (także z przeszłości)"
            />
          ) : (
            <input
              type="time"
              value={consultationData.endTime || ""}
              disabled
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
            />
          )}
        </div>
      </div>

      {/* Error message for time validation */}
      {isEditingTime && timeError && (
        <div className="mt-1 text-red-500 text-sm px-2">
          {timeError}
        </div>
      )}
      
      {/* Przycisk zapisywania zmian terminu bezpośrednio pod polami daty */}
      {isEditingTime && (
        <div className="mt-3 mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditingTime(false)}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg mr-2 hover:bg-gray-200"
            disabled={isSaving}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={async () => {
              // Reset error state
              setTimeError("");
              
              // Basic validation
              if (!tempDate || !tempTime) {
                toast.error("Data i godzina rozpoczęcia są wymagane");
                return;
              }
              
              if (!tempEndTime) {
                toast.error("Godzina zakończenia jest wymagana");
                return;
              }
              
              // Validate that end time is after start time
              if (tempTime >= tempEndTime) {
                setTimeError("Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia");
                toast.error("Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia");
                return;
              }
              
              try {
                setIsSaving(true);
                
                const response = await apiCaller(
                  "PATCH",
                  `/appointments/${appointmentId}/time`,
                  {
                    date: tempDate,
                    startTime: tempTime,
                    endTime: tempEndTime,
                    doctorId: consultationData.doctorId || consultationData.doctor_id
                  }
                );
                
                if (response && response.data) {
                  setConsultationData(prev => ({
                    ...prev,
                    date: tempDate,
                    time: tempTime,
                    endTime: tempEndTime
                  }));
                  setIsEditingTime(false);
                  toast.success("Termin wizyty został zaktualizowany");
                  // Reload the page after successful update
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              } catch (error) {
                console.error("Błąd podczas aktualizacji terminu:", error);
                toast.error(error.response?.data?.message || "Nie udało się zaktualizować terminu wizyty");
              } finally {
                setIsSaving(false);
              }
            }}
            className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            <span className="inline-block -mt-0.5">
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </span>
          </button>
        </div>
      )}

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
          value={consultationData.notes || ""}
          onChange={(e) => handleConsultationChange("notes", e.target.value)}
          rows={3}
          className="w-full p-2.5 border border-gray-200 rounded-lg"
          placeholder="Dodaj notatki..."
          disabled={false}
        ></textarea>
      </div>

      {/* Przesyłanie załączników */}
   
    </div>
  );
};

export default ConsultationForm;
