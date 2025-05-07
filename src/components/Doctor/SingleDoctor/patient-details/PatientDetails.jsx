// PatientDetailsPage.jsx - Updated with Medications, Tests, and Services
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbNav from "./BreadcrumbNav";
import PatientProfile from "./PatientProfile";
import ConsultationForm from "./ConsultationForm";
import ActionButtons from "./ActionButtons";
import ServiceSelectionModal from "./ServiceSelectionModal";
import patientService from "../../../../helpers/patientHelper";
import patientServicesHelper from "../../../../helpers/patientServicesHelper";
import { useLoader } from "../../../../context/LoaderContext";
import { MedicationsSection } from "./medications/MedicationSection";
import { TestsSection } from "./medications/TestSection";
import { Trash2 } from "lucide-react";
import {toast} from "sonner";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
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

  // Stan usług
  const [patientServices, setPatientServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  // Stan powiadomień
  const [notifyPatient, setNotifyPatient] = useState(false);

  // Stany modali
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  // State for delete confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false);

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
        // Fetch patient services separately
        fetchPatientServices();
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

  // Fetch patient services
  const fetchPatientServices = async () => {
    try {
      setIsServicesLoading(true);
      const response = await patientServicesHelper.getPatientServices(id);
      
      if (response && response.data && response.data.services) {
        // Map services to format compatible with our UI
        const formattedServices = response.data.services.map(serviceItem => ({
          serviceId: serviceItem.service._id,
          _id: serviceItem._id, // This is the patient service entry ID
          title: serviceItem.service.title,
          price: serviceItem.service.price,
          quantity: serviceItem.quantity || 1,
          totalPrice: (parseFloat(serviceItem.service.price) * (serviceItem.quantity || 1)).toFixed(2),
          status: serviceItem.status,
          notes: serviceItem.notes
        }));
        
        setPatientServices(formattedServices);
      } else {
        setPatientServices([]);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania usług pacjenta:", error);
      toast.error("Nie udało się załadować usług pacjenta.");
    } finally {
      setIsServicesLoading(false);
    }
  };

  // Obsługa wysyłania formularza
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      console.log("Zapisywanie danych pacjenta...",patientData);
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
        patientData.id,
        patientData,
        consultationData,
        medications,
        tests,
        uploadedFiles,
        notifyPatient
      );

      toast.success("Dane pacjenta zostały zaktualizowane.");
      setSaveSuccess(true);
      setIsSaving(false);
    } catch (error) {
      console.error("Błąd podczas zapisywania danych pacjenta:", error);
      setSaveError(
        error.message || "Nie udało się zapisać danych pacjenta. Spróbuj ponownie."
      );
      toast.error("Nie udało się zapisać danych pacjenta.");
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

  const handleAddServices = () => {
    setShowServiceModal(true);
  };

  const handleSaveServices = async (servicesData) => {
    try {
      showLoader();
      
      // Prepare data for API
      const servicesToAdd = servicesData.services.map(service => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
        notes: "",
        status: "active"
      }));
      
      // Call API to add services
      await patientServicesHelper.addServicesToPatient(id, servicesToAdd);
      
      // Refresh the services
      await fetchPatientServices();
      
      setShowServiceModal(false);
      hideLoader();
      
      toast.success("Usługi zostały dodane pomyślnie.");
    } catch (error) {
      console.error("Błąd podczas dodawania usług:", error);
      hideLoader();
      toast.error("Nie udało się dodać usług. Spróbuj ponownie.");
    }
  };

  // Initiate service deletion with confirmation
  const initiateServiceDeletion = (serviceId) => {
    setServiceToDelete(serviceId);
    setIsConfirmModalOpen(true);
  };

  // Handle removing a service after confirmation
  const handleRemoveService = async () => {
    if (!serviceToDelete) return;
    
    try {
      showLoader();
      await patientServicesHelper.removeServiceFromPatient(id, serviceToDelete);
      
      // Update state after successful removal
      setPatientServices(patientServices.filter(service => service.serviceId !== serviceToDelete));
      toast.success("Usługa została usunięta.");
      hideLoader();
    } catch (error) {
      console.error("Błąd podczas usuwania usługi:", error);
      hideLoader();
      toast.error("Nie udało się usunąć usługi. Spróbuj ponownie.");
    } finally {
      setServiceToDelete(null);
    }
  };

  // Initiate removing all services with confirmation
  const initiateRemoveAllServices = () => {
    setIsConfirmAllModalOpen(true);
  };

  // Handle removing all services after confirmation
  const handleRemoveAllServices = async () => {
    try {
      showLoader();
      await patientServicesHelper.deleteAllPatientServices(id);
      setPatientServices([]);
      toast.success("Wszystkie usługi zostały usunięte.");
      hideLoader();
    } catch (error) {
      console.error("Błąd podczas usuwania wszystkich usług:", error);
      hideLoader();
      toast.error("Nie udało się usunąć wszystkich usług. Spróbuj ponownie.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Komponent wyświetlający usługi
  const PatientServicesSection = () => {
    if (isServicesLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Usługi</h3>
          </div>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        </div>
      );
    }
    
    if (!patientServices || patientServices.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800">Usługi</h3>
            <button
              onClick={handleAddServices}
              className="text-sm font-medium text-teal-500 hover:text-teal-700"
            >
              + Dodaj usługi
            </button>
          </div>
          <div className="text-center py-6 text-gray-500">
            Brak przypisanych usług dla tego pacjenta
          </div>
        </div>
      );
    }
    
    const totalAmount = patientServices.reduce(
      (sum, service) => sum + parseFloat(service.totalPrice || 0), 
      0
    ).toFixed(2);
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">Usługi</h3>
          <div className="flex gap-2">
            <button
              onClick={initiateRemoveAllServices}
              className="text-sm font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
            >
              Usuń wszystkie
            </button>
            <button
              onClick={handleAddServices}
              className="text-sm font-medium text-teal-500 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50"
            >
              + Dodaj usługi
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden border border-gray-100 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazwa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ilość
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razem
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patientServices.map((service) => (
                <tr key={service._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{service.price} zł</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{service.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.totalPrice} zł</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${service.status === 'active' ? 'bg-green-100 text-green-800' : 
                        service.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {service.status === 'active' ? 'Aktywny' : 
                       service.status === 'completed' ? 'Zakończony' : 
                       service.status === 'cancelled' ? 'Anulowany' : service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => initiateServiceDeletion(service.serviceId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Suma:
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{totalAmount} zł</div>
                </td>
                <td colSpan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-4">
      <BreadcrumbNav onBack={handleBack} />

      <div className="flex flex-row gap-6 mt-4">
        <PatientProfile patient={patientData} setPatientData={setPatientData} />

        <div className="flex-1 space-y-4">
          <ConsultationForm
            consultationData={consultationData}
            setConsultationData={setConsultationData}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            patientData={patientData}
            setPatientData={setPatientData}
            className="bg-white rounded-lg shadow-sm p-4 w-full"
          />

          <PatientServicesSection />

          <MedicationsSection
            medications={medications}
            setMedications={setMedications}
            showForm={showMedicationForm}
            setShowForm={setShowMedicationForm}
            className="bg-white rounded-lg shadow-sm p-4 w-full"
          />

          <TestsSection
            tests={tests}
            setTests={setTests}
            showForm={showTestForm}
            setShowForm={setShowTestForm}
            className="bg-white rounded-lg shadow-sm p-4 w-full"
          />
        </div>
      </div>

      <ActionButtons
        patientId={id}
        onAddMedicine={handleAddMedicine}
        onAddTest={handleAddTest}
        onAddServicesClick={handleAddServices}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        notifyPatient={notifyPatient}
        setNotifyPatient={setNotifyPatient}
        className="mt-6"
      />

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleSaveServices}
        patientId={id}
      />
      
      {/* Confirmation Modal for Single Service Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRemoveService}
        title="Potwierdź usunięcie"
        message="Czy na pewno chcesz usunąć tę usługę? Ta operacja jest nieodwracalna."
      />
      
      {/* Confirmation Modal for All Services Deletion */}
      <ConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onClose={() => setIsConfirmAllModalOpen(false)}
        onConfirm={handleRemoveAllServices}
        title="Usuń wszystkie usługi"
        message="Czy na pewno chcesz usunąć wszystkie usługi tego pacjenta? Ta operacja jest nieodwracalna."
      />
    </div>
  );
};

export default PatientDetailsPage;
