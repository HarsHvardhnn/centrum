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
import appointmentHelper from "../../../../helpers/appointmentHelper";
import { useLoader } from "../../../../context/LoaderContext";
import { MedicationsSection } from "./medications/MedicationSection";
import { TestsSection } from "./medications/TestSection";
import { Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

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

  // Add saving-related states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add appointment-related states
  const [appointments, setAppointments] = useState([]);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Patient state
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

  // Consultation state (now tied to appointment)
  const [consultationData, setConsultationData] = useState({
    consultationType: "Konsultacja w przychodni",
    locationType: "Konsultacja online",
    time: "11:20",
    date: "16-12-2021",
    description: "",
    notes: "",
    treatmentCategory: "",
    isOnline: false,
    interview: "",
    physicalExamination: "",
    treatment: "",
    recommendations: ""
  });

  // States for medications, tests, and files (now tied to appointment)
  const [medications, setMedications] = useState([]);
  const [tests, setTests] = useState([]);
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

  // Fetch patient data and their appointments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patient basic data
        const patientResponse = await patientService.getPatientDetails(id);
        setPatientData(patientResponse.patientData || {});

        // Fetch patient's appointments
        const appointmentsResponse = await appointmentHelper.getPatientAppointments(id);
        setAppointments(appointmentsResponse.data || []);

        // If there are appointments, select the most recent one
        if (appointmentsResponse.data && appointmentsResponse.data.length > 0) {
          const mostRecentAppointment = appointmentsResponse.data[0];
          setCurrentAppointmentId(mostRecentAppointment._id);
          setSelectedAppointment(mostRecentAppointment);
          
          // Fetch appointment details
          await fetchAppointmentDetails(mostRecentAppointment._id);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load patient data. Please try again.");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fetch appointment details
  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      showLoader();
      const response = await appointmentHelper.getAppointmentById(appointmentId);
      
      if (response.data) {
        const { consultation, medications: appointmentMedications, tests: appointmentTests } = response.data;
        
        setConsultationData(consultation || {});
        setMedications(appointmentMedications || []);
        setTests(appointmentTests || []);
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      toast.error("Failed to load appointment details");
    } finally {
      hideLoader();
    }
  };

  // Handle appointment selection
  const handleAppointmentSelect = async (appointmentId) => {
    setCurrentAppointmentId(appointmentId);
    const selected = appointments.find(apt => apt._id === appointmentId);
    setSelectedAppointment(selected);
    await fetchAppointmentDetails(appointmentId);
  };

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

  // Handle save functionality
  const handleSave = async () => {
    if (!currentAppointmentId) {
      toast.error("No appointment selected");
      return;
    }

    try {
      showLoader();
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const hasUploadingFiles = uploadedFiles.some(
        (file) => file.progress < 100
      );

      if (hasUploadingFiles) {
        setSaveError("Please wait for all files to finish uploading");
        setIsSaving(false);
        return;
      }

      // Update appointment details using the correct function name
      const response = await appointmentHelper.updateAppointmentDetails(
        currentAppointmentId,
        {
          consultationData,
          medications,
          tests,
          uploadedFiles
        }
      );

      if (response.success) {
        toast.success("Appointment details updated successfully");
        setSaveSuccess(true);
        
        // Refresh appointment details
        await fetchAppointmentDetails(currentAppointmentId);
      } else {
        throw new Error(response.message || "Failed to update appointment details");
      }
    } catch (error) {
      console.error("Error saving appointment details:", error);
      setSaveError(error.message || "Failed to save appointment details. Please try again.");
      toast.error("Failed to save appointment details");
    } finally {
      setIsSaving(false);
      hideLoader();
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

      {/* Appointment Selection */}
      <div className="mb-6">
        {/* <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <button
            onClick={() => navigate(`/appointments/new?patientId=${id}`)}
            className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            <Calendar className="mr-2" size={16} />
            New Appointment
          </button>
        </div>
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              onClick={() => handleAppointmentSelect(appointment._id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                currentAppointmentId === appointment._id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {new Date(appointment.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.consultationType || 'Regular Consultation'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  appointment.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAppointment ? (
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          Select an appointment to view details
        </div>
      )}

      {selectedAppointment && (
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
      )}

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleSaveServices}
        patientId={id}
      />
      
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRemoveService}
        title="Confirm Deletion"
        message="Are you sure you want to delete this service? This action cannot be undone."
      />
      
      <ConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onClose={() => setIsConfirmAllModalOpen(false)}
        onConfirm={handleRemoveAllServices}
        title="Delete All Services"
        message="Are you sure you want to delete all services for this patient? This action cannot be undone."
      />
    </div>
  );
};

export default PatientDetailsPage;
