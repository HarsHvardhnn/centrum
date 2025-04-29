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
  console.log("consulting doctor", consultationData);

  // State for searchable dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Treatment categories options
  const treatmentCategories = [
    "Medication",
    "Physical Therapy",
    "Surgery",
    "Psychological Therapy",
    "Nutritional Counseling",
    "Chiropractic Treatment",
    "Acupuncture",
    "Homeopathy",
    "Occupational Therapy",
    "Speech Therapy",
    "Radiation Therapy",
    "Chemotherapy",
    "Alternative Medicine",
    "Immunotherapy",
    "Respiratory Therapy",
  ];

  // Filtered options based on search term
  const filteredCategories = treatmentCategories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date and time when component mounts or consultationData changes
  useEffect(() => {
    // Format date for input type="date" (YYYY-MM-DD)
    if (consultationData.date) {
      try {
        const dateObj = new Date(consultationData.date);
        if (!isNaN(dateObj.getTime())) {
          const formattedDate = dateObj.toISOString().split("T")[0];

          // Only update if the format is different to avoid infinite loop
          if (formattedDate !== consultationData.date) {
            setConsultationData((prev) => ({
              ...prev,
              date: formattedDate,
            }));
          }
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }

    // Format time for input type="time" (HH:MM)
    if (consultationData.time) {
      try {
        // Handle formats like "11:20 pm"
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

            // Convert to 24-hour format
            if (period === "pm" && hours < 12) {
              hours += 12;
            } else if (period === "am" && hours === 12) {
              hours = 0;
            }

            // Format as HH:MM
            const formattedTime = `${hours
              .toString()
              .padStart(2, "0")}:${minutes}`;

            // Only update if the format is different to avoid infinite loop
            if (formattedTime !== consultationData.time) {
              setConsultationData((prev) => ({
                ...prev,
                time: formattedTime,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error formatting time:", error);
      }
    }

    // Handle click outside to close dropdown
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
    "Clinic Consulting",
    "Online Consultation",
    "Home Visit",
  ];

  return (
    <div className="w-full md:w-2/3 p-6">
      {/* Doctor Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Attending doctor
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
            Consultation Type
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
                Select consultation type
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

        {/* Searchable Treatment Category Dropdown */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Treatment Category
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-full p-2.5 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span
                className={
                  consultationData.treatmentCategory
                    ? "text-black"
                    : "text-gray-400"
                }
              >
                {consultationData.treatmentCategory ||
                  "Select treatment category"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2 border-b border-gray-200 flex items-center">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    className="w-full outline-none"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <div
                        key={category}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectTreatmentCategory(category)}
                      >
                        {category}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No matches found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Patient Name
          </label>
          <input
            type="text"
            value={patientData.name}
            className="w-full p-2.5 border border-gray-200 rounded-lg"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            In-person consultation at the clinic
          </label>
          <div className="flex items-center space-x-4 mt-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isOnline"
                value="yes"
                checked={!consultationData.isOnline}
                onChange={() => handleConsultationChange("isOnline", false)}
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="isOnline"
                value="no"
                checked={consultationData.isOnline}
                onChange={() => handleConsultationChange("isOnline", true)}
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Consultation time
          </label>
          <div className="relative flex items-center border border-gray-200 rounded-lg">
            <div className="pl-2.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <input
              type="time"
              value={consultationData.time || ""}
              onChange={(e) => handleConsultationChange("time", e.target.value)}
              className="w-full p-2.5 border-none rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Consultation date
          </label>
          <div className="relative flex items-center border border-gray-200 rounded-lg">
            <div className="pl-2.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <input
              type="date"
              value={consultationData.date || ""}
              onChange={(e) => handleConsultationChange("date", e.target.value)}
              className="w-full p-2.5 border-none rounded-lg"
            />
          </div>
        </div>

        {/* Consultation Description */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Consultation description
          </label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.description || ""}
            onChange={(e) =>
              handleConsultationChange("description", e.target.value)
            }
          />
        </div>

        {/* New Fields */}
        {/* 1. Interview with the patient */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Interview with the patient
          </label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.interview || ""}
            onChange={(e) =>
              handleConsultationChange("interview", e.target.value)
            }
            placeholder="Enter patient interview details..."
          />
        </div>

        {/* 2. Physical examination */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Physical examination
          </label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.physicalExamination || ""}
            onChange={(e) =>
              handleConsultationChange("physicalExamination", e.target.value)
            }
            placeholder="Enter physical examination findings..."
          />
        </div>

        {/* 3. The treatment used */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Treatment used
          </label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.treatment || ""}
            onChange={(e) =>
              handleConsultationChange("treatment", e.target.value)
            }
            placeholder="Enter treatment details..."
          />
        </div>

        {/* 4. Recommendations */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Recommendations
          </label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.recommendations || ""}
            onChange={(e) =>
              handleConsultationChange("recommendations", e.target.value)
            }
            placeholder="Enter recommendations for the patient..."
          />
        </div>

        {/* Notes */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Notes</label>
          <textarea
            className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
            value={consultationData.notes || ""}
            onChange={(e) => handleConsultationChange("notes", e.target.value)}
          />
        </div>

        {/* International Patient */}
        <div className="col-span-1 md:col-span-2 mt-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 mr-2"
              checked={patientData.isInternationalPatient || false}
              onChange={handleInternationalPatientChange}
            />
            <label className="text-sm">International Patient</label>
          </div>
        </div>

        {/* Review Notes */}
        <div className="col-span-1 md:col-span-2 mt-2">
          <label className="block text-sm text-gray-600 mb-1">
            Review Notes
          </label>
          <FileUploadArea onFileUpload={onFileUpload} />
        </div>

        {/* Uploaded Files */}
        <div className="col-span-1 md:col-span-2 mt-2">
          {uploadedFiles.map((file, index) => (
            <FileListItem
              key={index}
              file={file}
              onRemove={() => onRemoveFile(file.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;
