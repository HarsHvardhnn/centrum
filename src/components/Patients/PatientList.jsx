import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import PatientsTable from "./PatientTable";
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import patientService from "../../helpers/patientHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";

// Wrap the entire component with FormProvider
function LabAppointmentsContent({clinic}) {
  // Now we can access the form context directly
  const { formData, updateMultipleFields } = useFormContext();
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser()
  const [showCheckin, setShowCheckin] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null);


  // Patient data
  const [allPatients, setAllPatients] = useState([]);

    const fetchPatients = async () => {
      try {
        showLoader();
        const filter = user?.role == "doctor" ? { doctor: user?.id } : {};
        console.log("applied filter", filter)
      const response = await patientService.getSimpliefiedPatientsList(filter);

        setAllPatients(response.patients || []);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        hideLoader();
      }
    };
  useEffect(() => {
  

    fetchPatients();
  }, []);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Patient form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  const subStepTitles = [
    "Dane osobowe",
    "Skierowanie",
    "Adres",
    "Zdjęcie",
    "Szczegóły",
    "Notatki",
  ];

  // Filter patients based on search query and status filter
  const filteredPatients = useMemo(() => {
    return allPatients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.doctor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allPatients, searchQuery, statusFilter]);

  // Function to handle editing a patient
  const handleEditPatient = async (patient) => {
    try {
      showLoader();
      console.log("oatuebt",patient)

      // Get patient details from the backend
      const patientDetails = await patientService.getPatientById(patient.id);

      // Map the backend data to our form structure
      const mappedFormData = {
        // Demographics
        fullName:
          patientDetails.name?.first + " " + (patientDetails.name?.last || ""),
        email: patientDetails.email,
        mobileNumber: patientDetails.phone,
        dateOfBirth: patientDetails.dateOfBirth,
        motherTongue: patientDetails.motherTongue,
        govtId: patientDetails.govtId,
        hospId: patientDetails.hospId,
        sex: patientDetails.sex,
        maritalStatus: patientDetails.maritalStatus,
        ethnicity: patientDetails.ethnicity,
        otherHospitalIds: patientDetails.otherHospitalIds,

        consents: patientDetails.consents || [],
        documents: patientDetails.documents || [],

        // Referrer
        referrerType: patientDetails.referrerType,
        mainComplaint: patientDetails.mainComplaint,
        referrerName: patientDetails.referrerName,
        referrerNumber: patientDetails.referrerNumber,
        referrerEmail: patientDetails.referrerEmail,
        consultingDepartment: patientDetails.consultingDepartment,
        consultingDoctor: patientDetails.consultingDoctor,

        // Address
        address: patientDetails.address,
        city: patientDetails.city,
        pinCode: patientDetails.pinCode,
        state: patientDetails.state,
        country: patientDetails.country,
        district: patientDetails.district,
        isInternationalPatient: patientDetails.isInternationalPatient || false,

        // Photo
        photo: patientDetails.photo || null,

        // Details
        fatherName: patientDetails.fatherName,
        motherName: patientDetails.motherName,
        spouseName: patientDetails.spouseName,
        education: patientDetails.education,
        alternateContact: patientDetails.alternateContact,
        birthWeight: patientDetails.birthWeight,
        occupation: patientDetails.occupation,
        religion: patientDetails.religion,
        ivrLanguage: patientDetails.ivrLanguage,

        // Notes
        reviewNotes: patientDetails.reviewNotes,
      };

      // Update the form context with patient data
      updateMultipleFields(mappedFormData);

      // Set edit mode and open modal
      setIsEditMode(true);
      setCurrentPatientId(patient.id);
      setIsModalOpen(true);
      setCurrentSubStep(0);
      setCompletedSteps([]);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Nie udało się wczytać danych pacjenta");
    } finally {
      hideLoader();
    }
  };

  // Function to go to a specific sub-step
  const goToSubStep = (step) => {
    setCurrentSubStep(step);
  };

  // Function to mark a step as completed
  const markStepAsCompleted = async () => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    // If we're on the last step, submit the form
    if (currentSubStep === subStepTitles.length - 1) {
      await handleFormSubmit(); // Make it await since it's async now
    } else {
      // Otherwise, move to the next step
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  // Function to handle form submission
  const handleFormSubmit = async () => {
    try {
      showLoader();

      if (isEditMode && currentPatientId) {
        console.log("patietn data in form", formData);;
        // Update existing patient
        const updatedPatient = await patientService.updatePatient(
          currentPatientId,
          formData
        );

        await fetchPatients()

        toast.success("Dane pacjenta zostały zaktualizowane");
      } else {
        // Create new patient
        const createdPatient = await patientService.createPatient(formData);

        // Update frontend list
        const newPatientEntry = {
          id:
            createdPatient._id ||
            `#${Math.floor(10000000 + Math.random() * 90000000)}`,
          name: formData.fullName || "Nowy Pacjent",
          username: `@${
            formData.fullName?.toLowerCase().replace(/\s+/g, "") || "newpatient"
          }`,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit",
          }),
          sex: formData.sex || "Nie określono",
          age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0,
          disease: formData.mainComplaint || "Badanie kontrolne",
          status: "W trakcie leczenia",
          doctor: formData.consultingDoctor || "Dr. Imran Ali",
        };

        fetchPatients()
        toast.success("Pacjent został dodany");
      }

      // Close modal and reset form state
      setIsModalOpen(false);
      setCurrentSubStep(0);
      setCompletedSteps([]);
      setIsEditMode(false);
      setCurrentPatientId(null);

      // Reset form data
      updateMultipleFields({
        fullName: "",
        email: "",
        mobileNumber: "",
        dateOfBirth: "",
        motherTongue: "",
        govtId: "",
        hospId: "Generuj automatycznie",
        sex: "",
        maritalStatus: "",
        ethnicity: "",
        otherHospitalIds: "",

        consents: [],
        documents: [],
        referrerType: "",
        mainComplaint: "",
        referrerName: "",
        referrerNumber: "",
        referrerEmail: "",
        consultingDepartment: "",
        consultingDoctor: "",

        address: "",
        city: "",
        pinCode: "",
        state: "",
        country: "",
        district: "",
        isInternationalPatient: false,

        photo: null,

        fatherName: "",
        motherName: "",
        spouseName: "",
        education: "",
        alternateContact: "",
        birthWeight: "",
        occupation: "",
        religion: "",
        ivrLanguage: "",

        reviewNotes: "",
      });
    } catch (error) {
      toast.error(
        "Error submitting form: " + (error.message || "Unknown error")
      );
    } finally {
      hideLoader();
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      {/* <CheckInModal isOpen={showCheckin} setIsOpen={setShowCheckin}/> */}
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex w-full justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {clinic ? "Clinic IP" : "Lab Appointments"}
            </h1>
            <p className="text-gray-600 mb-4">
              Showing: All Consultations of All Healthcare Providers
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 w-[50%] ">
            <div className="flex-1 relative ">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                className="py-2 pl-4 pr-10 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-gray-700"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} />
                Filter
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg z-10 min-w-[200px]">
                  <div className="p-2">
                    <h3 className="font-medium px-3 py-2">Filter by Status</h3>
                    <div className="space-y-2 px-3 py-1">
                      {["All", "Compilate", "In-Treatment"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={statusFilter === status}
                            onChange={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                            }}
                            className="rounded-full"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Patient Button */}
            {user?.role !== "doctor" && !clinic && (
              <button
                className="bg-teal-500 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                onClick={() => {
                  setIsEditMode(false);
                  setCurrentPatientId(null);
                  setIsModalOpen(true);
                  setCurrentSubStep(0);
                  setCompletedSteps([]);
                  // Reset form when adding new patient
                  updateMultipleFields({
                    fullName: "",
                    email: "",
                    mobileNumber: "",
                    dateOfBirth: "",
                    motherTongue: "",
                    govtId: "",
                    hospId: "Auto generate",
                    sex: "",
                    maritalStatus: "",
                    ethnicity: "",
                    otherHospitalIds: "",

                    consents: [],
                    documents: [],
                    referrerType: "",
                    mainComplaint: "",
                    referrerName: "",
                    referrerNumber: "",
                    referrerEmail: "",
                    consultingDepartment: "",
                    consultingDoctor: "",

                    address: "",
                    city: "",
                    pinCode: "",
                    state: "",
                    country: "",
                    district: "",
                    isInternationalPatient: false,

                    photo: null,

                    fatherName: "",
                    motherName: "",
                    spouseName: "",
                    education: "",
                    alternateContact: "",
                    birthWeight: "",
                    occupation: "",
                    religion: "",
                    ivrLanguage: "",

                    reviewNotes: "",
                  });
                }}
              >
                <Plus size={18} />
                Add Patient
              </button>
            )}
          </div>
        </div>

        {/* Patients Table Component */}
        <PatientsTable
          patients={filteredPatients}
          onEditPatient={handleEditPatient}
          setShowCheckin={setShowCheckin}
          setSelectedPatient={setSelectedPatient}
          clinic={clinic}
        />
        <CheckInModal
          isOpen={showCheckin}
          setIsOpen={setShowCheckin}
          patientData={selectedPatient}
          clinic={clinic}
        />

        {/* Patient Modal (Add/Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-bold">
                  {isEditMode ? "Edit Patient" : "Add New Patient"}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <PatientStepForm
                  currentSubStep={currentSubStep}
                  goToSubStep={goToSubStep}
                  markStepAsCompleted={markStepAsCompleted}
                  subStepTitles={subStepTitles}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create a wrapper component that provides the form context
function LabAppointments({clinic}) {
  return (
    <FormProvider>
      <LabAppointmentsContent clinic={clinic} />
    </FormProvider>
  );
}

export default LabAppointments;
