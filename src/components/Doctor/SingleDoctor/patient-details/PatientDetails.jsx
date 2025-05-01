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

  // Stan główny pacjenta
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
    roomNumber: "",
    riskStatus: "Ryzykowny",
    treatmentStatus: "W trakcie leczenia",
    bloodPressure: "141/90 mmHg",
    temperature: "29°C",
    weight: "78kg",
    height: "170 cm",
  });

  // Stan konsultacji
  const [consultationData, setConsultationData] = useState({
    doctor: "Dr. Stephen Conley",
    consultationType: "Konsultacja w przychodni",
    locationType: "Konsultacja online",
    time: "11:20",
    date: "16-12-2021",
    description:
      "Najlepsze badanie, jakie znalazłem, nie wykazało niczego szczególnego. Inne małe badanie dotyczyło osób prowadzących siedzący tryb życia bez cukrzycy, które miały nadwagę lub otyłość.",
    notes:
      "Czy istnieją dowody na korzyści, jeśli osoby bez cukrzycy monitorują poziom cukru we krwi za pomocą CGM? Istnieje niewiele opublikowanych badań, które pomogłyby odpowiedzieć na to pytanie.",
  });

  // Stan leków
  const [medications, setMedications] = useState([]);

  // Stan badań
  const [tests, setTests] = useState([]);

  // Stan plików
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Stan powiadomień
  const [notifyPatient, setNotifyPatient] = useState(false);

  // Stany modali
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);

  // Pobierz dane pacjenta, gdy zmienia się ID
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getPatientDetails(id);

        console.log("otrzymane dane", data);
        setPatientData(data.patientData || {});

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
        console.error("Błąd podczas pobierania danych pacjenta:", err);
        setError("Nie udało się załadować danych pacjenta. Spróbuj ponownie.");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  // Obsługa wysyłania formularza
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      console.log("Zapisywanie danych pacjenta...");
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const hasUploadingFiles = uploadedFiles.some(
        (file) => file.progress < 100
      );

      if (hasUploadingFiles) {
        console.log("Zapisywanie danych pacjenta...wywołanie api");
        setSaveError("Poczekaj, aż wszystkie pliki zostaną przesłane");
        setIsSaving(false);
        return;
      }

      console.log("Zapisywanie danych pacjenta...wywołanie api");
      const updatedPatient = await patientService.updatePatientDetails(
        id,
        patientData,
        consultationData,
        medications,
        tests,
        uploadedFiles,
        notifyPatient
      );

      window.location.reload();
      setIsSaving(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania danych pacjenta:", error);
      setSaveError(
        error.message || "Nie udało się zapisać danych pacjenta. Spróbuj ponownie."
      );
      setIsSaving(false);
    }
  };

  // Obsługa przesyłania plików
  const handleFileUpload = (files) => {
    console.log("Przesłane pliki:", files);
    setUploadedFiles((prev) => [...prev, files]);
  };

  // Usuwanie pliku
  const handleRemoveFile = (fileName) => {
    setUploadedFiles((current) =>
      current.filter((file) => file.name !== fileName)
    );
  };

  // Obsługa przycisków akcji
  const handleAddMedicine = () => {
    setShowMedicationForm(true);
  };

  const handleAddTest = () => {
    setShowTestForm(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav onBack={handleBack} />

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <PatientProfile patient={patientData} setPatientData={setPatientData} />

        <div className="flex-1">
          <ConsultationForm
            consultationData={consultationData}
            setConsultationData={setConsultationData}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
          />

          <MedicationsSection
            medications={medications}
            setMedications={setMedications}
            showForm={showMedicationForm}
            setShowForm={setShowMedicationForm}
          />

          <TestsSection
            tests={tests}
            setTests={setTests}
            showForm={showTestForm}
            setShowForm={setShowTestForm}
          />
        </div>
      </div>

      <ActionButtons
        onAddMedicine={handleAddMedicine}
        onAddTest={handleAddTest}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        notifyPatient={notifyPatient}
        setNotifyPatient={setNotifyPatient}
      />
    </div>
  );
};

export default PatientDetailsPage;
