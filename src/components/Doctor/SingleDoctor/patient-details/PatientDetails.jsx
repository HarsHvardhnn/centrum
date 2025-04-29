// PatientDetailsPage.jsx - Updated with Medications and Tests
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbNav from "./BreadcrumbNav";
import PatientProfile from "./PatientProfile";
import ConsultationForm from "./ConsultationForm";
import ActionButtons from "./ActionButtons";
import patientService from "../../../../helpers/patientHelper";
import { MedicationsSection } from "./medications/MedicationSection";
import { TestsSection } from "./medications/TestSection";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Main patient state
  const [patientData, setPatientData] = useState({
    id: "",
    name: "",
    age: 0,
    gender: "",
    email: "",
    phone: "",
    birthDate: "",
    disease: "",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    isInternationalPatient: false,
    notes: "",
    roomNumber: "", // Additional fields from UI not in API
    riskStatus: "Risky",
    treatmentStatus: "Under Treatment",
    bloodPressure: "141/90 mmHg",
    temperature: "29°C",
    weight: "78kg",
    height: "5'6\" inc",
  });

  // Consultation state
  const [consultationData, setConsultationData] = useState({
    doctor: "Dr. Stephen Conley",
    consultationType: "Clinic Consulting",
    locationType: "Konsultacja online",
    time: "11:20 pm",
    date: "16-12-2021",
    description:
      "The best study I could find found nothing particularly Another small study looked at sedentary individuals without diabetes who were overweight or obese.",
    notes:
      "Is there any evidence of benefit if people without diabetes monitor their blood sugar levels with CGMs? There's little published research to help answer this question.",
  });

  // Medications state
  const [medications, setMedications] = useState([]);

  // Tests state
  const [tests, setTests] = useState([]);

  // Files state
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Notification state
  const [notifyPatient, setNotifyPatient] = useState(false);

  // Modal states
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);

  // Fetch patient data when ID changes
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getPatientDetails(id);

        console.log("data receivbed", data);
        // Update state with received data while preserving default values for missing fields
        setPatientData(data.patientData || {});

        // If the API returns medications and tests data, update them too
        if (data.medications) {
          setMedications(data.medications);
        }

        if (data.tests) {
          setTests(data.tests);
        }
        if (data.uploadedFiles) {
          setUploadedFiles(data.uploadedFiles);
        }

        if (data.consultationData) {
          setConsultationData(data.consultationData);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient data. Please try again.");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  // Handle form submission
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ... (existing useEffect for fetching patient) ...

  // Handle form submission
  const handleSave = async () => {
    try {
      console.log("Saving patient data...");
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Get all files that are still in progress
      const hasUploadingFiles = uploadedFiles.some(
        (file) => file.progress < 100
      );

      if (hasUploadingFiles) {
        console.log("Saving patient data...api call");

        setSaveError("Please wait for all files to finish uploading");
        setIsSaving(false);
        return;
      }

      console.log("Saving patient data...api call");
      // Call the API service to save all data
      const updatedPatient = await patientService.updatePatientDetails(
        id,
        patientData,
        consultationData,
        medications,
        tests,
        uploadedFiles,
        notifyPatient
      );

      // Update local state with saved data
      window.location.reload();

      setIsSaving(false);
    } catch (error) {
      console.error("Error saving patient data:", error);
      setSaveError(
        error.message || "Failed to save patient data. Please try again."
      );
      setIsSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    console.log("Files uploaded:", files);

    setUploadedFiles((prev) => [...prev, files]);

    //
    // newFiles.forEach((fileInfo, index) => {
    //   const timer = setInterval(() => {
    //     setUploadedFiles((current) => {
    //       const updated = [...current];
    //       const fileIndex = current.findIndex((f) => f.name === fileInfo.name);

    //       if (fileIndex !== -1) {
    //         if (updated[fileIndex].progress < 100) {
    //           updated[fileIndex].progress += 10;
    //         } else {
    //           clearInterval(timer);
    //         }
    //       }

    //       return updated;
    //     });
    //   }, 500);
    // });
  };

  // Remove file
  const handleRemoveFile = (fileName) => {
    setUploadedFiles((current) =>
      current.filter((file) => file.name !== fileName)
    );
  };

  // Action button handlers
  const handleAddMedicine = () => {
    setShowMedicationForm(true);
  };

  const handleAddTest = () => {
    setShowTestForm(true);
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading patient data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <BreadcrumbNav patientName={patientData.name} navigate={navigate} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row">
          <PatientProfile
            patient={patientData}
            setPatientData={setPatientData}
          />

          <ConsultationForm
            patientData={patientData}
            consultationData={consultationData}
            setConsultationData={setConsultationData}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            setPatientData={setPatientData}
          />
        </div>

        <div className="p-6 w-full">
          {/* Add Medications Section */}
          <MedicationsSection
            medications={medications}
            onUpdate={setMedications}
          />

          {/* Add Tests Section */}
          <TestsSection tests={tests} onUpdate={setTests} />

          {/* Action Buttons */}
          <ActionButtons
            patientId={id}
            onAddMedicineClick={handleAddMedicine}
            onAddTestClick={handleAddTest}
          />

          <div className="flex justify-between mt-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-3 h-3 mr-2"
                checked={notifyPatient}
                onChange={(e) => setNotifyPatient(e.target.checked)}
              />
              <label className="text-xs">
                Notify Patient about Availability of Consultation Note
              </label>
            </div>
            <button
              className="bg-[#80c5c5] hover:bg-teal-500 text-white px-6 py-2 rounded-lg text-sm"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
