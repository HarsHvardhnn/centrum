import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import adminHelper from "../../helpers/adminHelper";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import DoctorScheduleManager from "./DoctorScheduleEditor";
import { ChevronDown, Save } from "lucide-react"; // For dropdown icon
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import AddDoctorForm from "../Doctor/CreateDoctor";
import doctorService from "../../helpers/doctorHelper";
import patientService, { isSamePatientAsDocumentMatch } from "../../helpers/patientHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { normalizePesel } from "../../utils/peselUtils";
import { validateIdentityDocument } from "../../utils/identityDocument";
import { readListState, writeListState, useListScrollRestore } from "../../hooks/usePersistedListState";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

/** Normalize ObjectId / populated ref / string to a plain id string for form selects. */
function toEntityId(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

/**
 * Resolve attending (consulting) doctor from a specific appointment or the patient's
 * earliest visit, including a matching specialization id for the Skierowanie selects.
 */
async function resolveAttendingDoctorFromVisits(patientId, preferredAppointmentId) {
  let doctorId = "";

  if (preferredAppointmentId) {
    try {
      const aptRes = await appointmentHelper.getAppointmentById(preferredAppointmentId);
      const apt = aptRes?.appointment || aptRes?.data || aptRes;
      doctorId = toEntityId(apt?.doctor);
    } catch (err) {
      console.warn("Could not load appointment for attending doctor prefill:", err);
    }
  }

  if (!doctorId && patientId) {
    try {
      const visitsRes = await patientService.getPatientVisits(patientId);
      const visits = Array.isArray(visitsRes?.data) ? visitsRes.data : [];
      // API returns newest-first; initial appointment = oldest with a doctor
      const withDoctor = visits.filter(
        (v) => v?.doctor?.id && String(v.status || "").toLowerCase() !== "cancelled"
      );
      const initial = withDoctor.length ? withDoctor[withDoctor.length - 1] : null;
      doctorId = toEntityId(initial?.doctor?.id);
    } catch (err) {
      console.warn("Could not load visits for attending doctor prefill:", err);
    }
  }

  if (!doctorId) {
    return { consultingDoctor: "", consultingSpecialization: "" };
  }

  let consultingSpecialization = "";
  try {
    const docRes = await doctorService.getDoctorById(doctorId);
    const doctor = docRes?.doctor || docRes?.data || docRes;
    const specs = doctor?.specialization || doctor?.specializations || [];
    const items = Array.isArray(specs) ? specs : specs ? [specs] : [];
    for (const spec of items) {
      if (spec && typeof spec === "object") {
        consultingSpecialization = toEntityId(spec._id || spec.id || spec);
        if (consultingSpecialization) break;
      } else if (typeof spec === "string" && /^[a-fA-F0-9]{24}$/.test(spec)) {
        consultingSpecialization = spec;
        break;
      }
    }
  } catch (err) {
    console.warn("Could not load doctor specialization for prefill:", err);
  }

  return { consultingDoctor: doctorId, consultingSpecialization };
}
import SpecializationModal from "./SpecializationModal";
import { toast } from "sonner";
import PermanentDeleteDialog from "./PermanentDeleteDialog";
import BulkDeleteByIdsDialog from "./BulkDeleteByIdsDialog";
import { Trash2 } from "lucide-react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { loadFormDraft, clearFormDraft, hasFormDraft, formatDraftAge } from "../../utils/formDraftStorage";
import AutoSaveIndicator from "../UtilComponents/AutoSaveIndicator";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import PatientKioskCorrectionPanel from "./PatientKioskCorrectionPanel";
import { mapPatientAuthorizationFields } from "../../utils/authorizedPersons";
import { mapPatientGuardianFields } from "../../utils/guardian";
import { normalizeVoivodeship } from "../../utils/voivodeshipUtils";

/** Default when API omits phoneCode or number is national digits only. */
const DEFAULT_PATIENT_PHONE_CODE = "+48";

/**
 * Maps `patient.phone` (+ optional `patient.phoneCode`) to form `phoneCode` + `mobileNumber`.
 * - Valid `phoneCode` from API → use it and strip prefix from `phone`.
 * - Else if value looks like +CC… and matches a known dial code → use that code.
 * - Else assume Poland (+48): national digits, optional leading 48 for 48XXXXXXXXX.
 */
function mapPatientPhoneToFormFields(rawPhone, apiPhoneCode, countryCodes) {
  const list = countryCodes?.length ? countryCodes : PHONE_COUNTRY_CODES;
  const sortedCodes = [...list].sort((a, b) => b.code.length - a.code.length);

  const codeFromApi = apiPhoneCode != null ? String(apiPhoneCode).trim() : "";
  if (codeFromApi && list.some((c) => c.code === codeFromApi)) {
    let num = String(rawPhone).trim();
    if (num.startsWith(codeFromApi)) num = num.slice(codeFromApi.length).trim();
    return { phoneCode: codeFromApi, mobileNumber: num.replace(/\s+/g, "") };
  }

  let phoneWithCode = String(rawPhone).trim();
  if (!phoneWithCode.startsWith("+")) {
    phoneWithCode = phoneWithCode.replace(/^0+/, "");
    if (phoneWithCode.length > 0) phoneWithCode = "+" + phoneWithCode;
  }
  const foundCountry = sortedCodes.find((country) => phoneWithCode.startsWith(country.code));
  if (foundCountry) {
    return {
      phoneCode: foundCountry.code,
      mobileNumber: phoneWithCode.replace(foundCountry.code, "").trim().replace(/\s+/g, ""),
    };
  }

  let digitsOnly = String(rawPhone).trim().replace(/\D/g, "");
  if (digitsOnly.startsWith("48") && digitsOnly.length >= 11) {
    digitsOnly = digitsOnly.slice(2);
  }
  digitsOnly = digitsOnly.replace(/^0+/, "");
  return { phoneCode: DEFAULT_PATIENT_PHONE_CODE, mobileNumber: digitsOnly };
}

export default function UserManagement() {
  // Add these translation mappings at the top of the component
  const roleTranslations = {
    doctor: "Lekarz",
    patient: "Pacjent",
    receptionist: "Recepcjonista"
  };

  const statusTranslations = {
    active: "Aktywny",
    deleted: "Usunięty"
  };

  const phoneCountryCodes = PHONE_COUNTRY_CODES;

  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const savedAccounts = readListState("admin-accounts") || {};
  const [currentPage, setCurrentPage] = useState(
    Number(savedAccounts.currentPage) > 0 ? Number(savedAccounts.currentPage) : 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(savedAccounts.searchTerm || "");
  const [sortField, setSortField] = useState(savedAccounts.sortField || "createdAt");
  const [sortOrder, setSortOrder] = useState(savedAccounts.sortOrder || "desc");
  const [showSpecsModal,setShowSpecsModal]=useState(false)
  const [patientFormData, setPatientFormData] = useState({});
  const [selectedPhoneCode, setSelectedPhoneCode] = useState("+48");
  const [phoneValidationError, setPhoneValidationError] = useState("");

  // Add User dropdowns and modals
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState({
    open: false,
    id: null,
    userName: ""
  });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    ids: []
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    signupMethod: "email",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usersPerPage, setUsersPerPage] = useState(
    Number(savedAccounts.usersPerPage) > 0 ? Number(savedAccounts.usersPerPage) : 5
  );
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400);

  // State for doctor schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Patient form states
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDraftData, setDoctorDraftData] = useState(null); // For draft recovery
  const [returnUrl, setReturnUrl] = useState(null);
  const subStepTitles = [
    "Dane Podstawowe",
    "Skierowanie",
    "Adres",
    "Zgody",
    "Przedstawiciel / Opiekun",
    "Osoby Upoważnione",
    "Inne",
    "Notatki",
  ];

  // Add this function to handle email removal
  const handleRemoveEmail = async () => {
    if (!currentPatientId) {
      toast.error("Brak ID pacjenta");
      return;
    }

    if (!window.confirm('Czy na pewno chcesz usunąć email pacjenta? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      showLoader();
      const response = await patientService.removePatientEmail(currentPatientId);
      
      if (response.success) {
        toast.success("Email pacjenta został pomyślnie usunięty");
        
        // Close the modal and reset form state
        setShowAddPatientModal(false);
        setIsEditMode(false);
        setCurrentPatientId(null);
        setPatientFormData({ phoneCode: "+48" });
        setSelectedPhoneCode("+48");
        setPhoneValidationError("");
        
        // Redirect back to the original page if returnUrl is set
        if (returnUrl) {
          navigate(returnUrl);
          setReturnUrl(null); // Clear the return URL
        }
      } else {
        toast.error(response.message || "Nie udało się usunąć email pacjenta");
      }
    } catch (error) {
      console.error("Error removing patient email:", error);
      toast.error("Wystąpił błąd podczas usuwania email");
    } finally {
      hideLoader();
    }
  };

  // Add this function to check if user is admin
  const isAdmin = user?.role === 'admin';

  // Phone validation function
  const validatePhoneNumber = (phoneNumber, countryCode) => {
    if (!phoneNumber) return "";
    
    const country = phoneCountryCodes.find(c => c.code === countryCode);
    if (!country) return "Nieprawidłowy kod kraju";
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== country.maxLength) {
      return `Numer telefonu dla ${country.country} musi mieć ${country.maxLength} cyfr`;
    }
    
    return "";
  };

  // Handle phone code change
  const handlePhoneCodeChange = (newCode) => {
    setSelectedPhoneCode(newCode);
    setPhoneValidationError("");
    
    // Update the form data with new phone code
    setPatientFormData(prev => ({
      ...prev,
      phoneCode: newCode
    }));
  };

  // Handle phone number input change with validation
  const handlePhoneNumberChange = (phoneNumber) => {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Update form data
    setPatientFormData(prev => ({
      ...prev,
      mobileNumber: cleanPhone
    }));
    
    // Validate phone number
    const validationError = validatePhoneNumber(cleanPhone, selectedPhoneCode);
    setPhoneValidationError(validationError);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      showLoader();
      const response = await adminHelper.getAllUsers(
        currentPage,
        usersPerPage,
        searchTerm,
        sortField,
        sortOrder
      );

      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setIsLoading(false);
      hideLoader();
    } catch (error) {
      setError("Nie udało się pobrać użytkowników");
      setIsLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, usersPerPage, sortField, sortOrder, debouncedSearchTerm]);

  useEffect(() => {
    writeListState("admin-accounts", {
      searchTerm,
      currentPage,
      usersPerPage,
      sortField,
      sortOrder,
    });
  }, [searchTerm, currentPage, usersPerPage, sortField, sortOrder]);

  useListScrollRestore("admin-accounts", !isLoading);

  // Handle URL parameter for editing patient
  useEffect(() => {
    const editPatientId = searchParams.get("edytujPacjenta");
    const returnUrlParam = searchParams.get("returnUrl");
    const appointmentIdParam = searchParams.get("appointmentId");

    if (editPatientId) {
      handleEditPatient(editPatientId, appointmentIdParam);
      if (returnUrlParam) {
        setReturnUrl(decodeURIComponent(returnUrlParam));
      }
      // Clear the URL parameters after handling
      setSearchParams({});
    }
  }, [searchParams]);

  // Track form data from FormContext
  const [currentFormContextData, setCurrentFormContextData] = useState(null);
  const [currentDoctorFormData, setCurrentDoctorFormData] = useState(null); // Track doctor form data for auto-save
  const isRecoveringDraftRef = useRef(false); // Track if we're currently recovering a draft
  const recoveredDraftDataRef = useRef(null); // Store recovered draft data to prevent re-processing

  // Draft recovery states
  const [showDraftRecoveryModal, setShowDraftRecoveryModal] = useState({
    show: false,
    formType: null,
    draft: null,
  });
  
  // Refs to track if modals were just opened (to show draft recovery)
  const receptionistModalJustOpened = useRef(false);
  const doctorModalJustOpened = useRef(false);
  const patientModalJustOpened = useRef(false);


  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (field) => {
    // If clicking on the current sort field, toggle order
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to descending when selecting a new field
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handlePermanentDeleteClick = (user) => {
    setPermanentDeleteDialog({
      open: true,
      id: user._id,
      userName: `${user.name.first} ${user.name.last}`
    });
  };

  const handlePermanentDeleteSuccess = () => {
    fetchUsers();
    setSelectedUserIds([]);
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(user => user._id));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedUserIds.length === 0) {
      toast.error('Proszę wybrać użytkowników do usunięcia');
      return;
    }
    setBulkDeleteDialog({
      open: true,
      ids: selectedUserIds
    });
  };

  // Function to open the schedule modal
  const handleManageSchedule = (user) => {
    setSelectedDoctorId(user._id);
    setShowScheduleModal(true);
  };

  const confirmDelete = async () => {
    try {
      showLoader();
      await adminHelper.markUserAsDeleted(selectedUser._id);
      setSuccess(
        `Użytkownik ${selectedUser.name.first} ${selectedUser.name.last} został pomyślnie usunięty`
      );
      setShowDeleteModal(false);
      hideLoader();
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError("Nie udało się usunąć użytkownika");
      hideLoader();
    }
  };

  const handleReviveUser = async (userId) => {
    try {
      showLoader();
      await adminHelper.reviveUser(userId);
      setSuccess("Użytkownik został pomyślnie przywrócony");
      hideLoader();
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError("Nie udało się przywrócić użytkownika");
      hideLoader();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Auto-save for Receptionist form
  const receptionistDraftStatus = useFormDraft({
    formType: 'receptionist',
    formData: formData,
    metadata: { isEditMode: false },
    enabled: showAddModal && !isEditMode,
    debounceMs: 1000,
    intervalMs: 30000,
  });

  // Auto-save for Doctor form
  const doctorDraftStatus = useFormDraft({
    formType: 'doctor',
    formData: currentDoctorFormData,
    metadata: { isEditMode: !!selectedDoctor },
    enabled: showAddDoctorModal && !selectedDoctor, // Only auto-save in create mode
    debounceMs: 1000,
    intervalMs: 30000,
  });

  // Auto-save for Patient form (using context data when available)
  const patientFormDataForSave = currentFormContextData || patientFormData;
  const patientDraftStatus = useFormDraft({
    formType: 'patient',
    formData: patientFormDataForSave,
    metadata: { 
      isEditMode: isEditMode,
      currentSubStep: currentSubStep,
      currentPatientId: currentPatientId,
    },
    enabled: showAddPatientModal && !isEditMode, // Only auto-save in create mode
    debounceMs: 1500,
    intervalMs: 30000,
  });

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    try {
      showLoader();
      await adminHelper.addReceptionist(formData);
      setError("");
      setSuccess("Recepcjonista został dodany pomyślnie");
      setShowAddModal(false);
      
      // Clear draft on successful submission
      clearFormDraft('receptionist');
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        signupMethod: "email",
      });
      hideLoader();
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      toast.error( "Nie udało się dodać recepcjonisty: " +
        (error.response?.data?.error ||
          error.response?.data?.message ||
          "Nieznany błąd"))
      setError(
        "Nie udało się dodać recepcjonisty: " +
          (error.response?.data?.error ||
            error.response?.data?.message ||
            "Nieznany błąd")
      );
      hideLoader();
    }
  };

  // Handle draft recovery for Receptionist form
  const handleRecoverReceptionistDraft = (draft) => {
    if (draft && draft.formData) {
      setFormData({
        firstName: draft.formData.firstName || "",
        lastName: draft.formData.lastName || "",
        email: draft.formData.email || "",
        phone: draft.formData.phone || "",
        password: draft.formData.password || "",
        signupMethod: draft.formData.signupMethod || "email",
      });
      toast.success("Szkic został przywrócony");
    }
    setShowDraftRecoveryModal({ show: false, formType: null, draft: null });
  };

  // Handle starting fresh (discard draft)
  const handleStartFresh = (formType) => {
    clearFormDraft(formType);
    setShowDraftRecoveryModal({ show: false, formType: null, draft: null });
    toast.info("Rozpoczynasz od nowa");
  };

  // Function to handle adding/updating a doctor
  const handleAddDoctor = async (doctorData, resetForm, closeModal) => {
    try {
      //("doctorData",doctorData)
      showLoader();
      let response;
      
      if (selectedDoctor) {
        // Update existing doctor (API may return id or _id)
        const doctorId = selectedDoctor.id || selectedDoctor._id;
        response = await doctorService.updateDoctor(doctorId, doctorData);
        setSuccess("Lekarz został zaktualizowany pomyślnie");
      } else {
        // Create new doctor
        response = await doctorService.createDoctor(doctorData);
        setSuccess("Lekarz został dodany pomyślnie");
      }

      hideLoader();
      fetchUsers(); // Refresh the users list

      // Clear draft on successful submission (only for create, not edit)
      if (!selectedDoctor) {
        clearFormDraft('doctor');
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);

      // Reset and close
      resetForm();
      closeModal();
    } catch (error) {
      setError(
        "Nie udało się " + (selectedDoctor ? "zaktualizować" : "dodać") + " lekarza: " +
        (error.response?.data?.error ||
          error.response?.data?.message ||
          "Nieznany błąd")
      );
      toast.error(  "Nie udało się " + (selectedDoctor ? "zaktualizować" : "dodać") + " lekarza: " +
      (error.response?.data?.error ||
        error.response?.data?.message ||
        "Nieznany błąd"))
      hideLoader();
    }
  };

  // Handle draft recovery for Doctor form
  const handleRecoverDoctorDraft = (draft) => {
    if (draft && draft.formData) {
      // Store draft data to pass to AddDoctorForm
      setDoctorDraftData(draft.formData);
      toast.success("Szkic został przywrócony");
    }
    setShowDraftRecoveryModal({ show: false, formType: null, draft: null });
  };

  // Add this function to handle edit click
  const handleEditPatient = async (userId, preferredAppointmentId = null) => {
    try {
      showLoader();
      const patientData = await patientService.getPatientById(userId, {
        include: "documents,consents",
      });
      let patientDetails=patientData;
      const rawPhone = patientDetails.phone;
      const hasRealPhone = rawPhone != null && String(rawPhone).trim() !== "" && !/^_no_phone_/i.test(String(rawPhone).trim());
      //(patientData, "patient data")
      let consultingDoctor = toEntityId(patientDetails.consultingDoctor);
      let consultingSpecialization = toEntityId(patientDetails.consultingSpecialization);

      // First open / empty attending physician → use booked appointment doctor
      if (!consultingDoctor) {
        const resolved = await resolveAttendingDoctorFromVisits(
          userId,
          preferredAppointmentId
        );
        consultingDoctor = resolved.consultingDoctor;
        if (!consultingSpecialization && resolved.consultingSpecialization) {
          consultingSpecialization = resolved.consultingSpecialization;
        }
      } else if (!consultingSpecialization) {
        // Doctor saved but specialization missing — derive from doctor profile
        try {
          const docRes = await doctorService.getDoctorById(consultingDoctor);
          const doctor = docRes?.doctor || docRes?.data || docRes;
          const specs = doctor?.specialization || doctor?.specializations || [];
          const items = Array.isArray(specs) ? specs : specs ? [specs] : [];
          for (const spec of items) {
            if (spec && typeof spec === "object") {
              consultingSpecialization = toEntityId(spec._id || spec.id || spec);
              if (consultingSpecialization) break;
            } else if (typeof spec === "string" && /^[a-fA-F0-9]{24}$/.test(spec)) {
              consultingSpecialization = spec;
              break;
            }
          }
        } catch (_) {
          /* keep empty; user can pick */
        }
      }

      const mappedFormData = {
        // Demographics
        fullName:
          patientDetails.name?.first + " " + (patientDetails.name?.last || ""),
        email: patientDetails.email,
        mobileNumber: "",
        patient_id: patientDetails._id,
        dateOfBirth: patientDetails.dateOfBirth,
        motherTongue: patientDetails.motherTongue,
        govtId: patientDetails.govtId,
        sex: patientDetails.sex,
        maritalStatus: patientDetails.maritalStatus,
        ethnicity: patientDetails.ethnicity,
        otherHospitalIds: patientDetails.otherHospitalIds,
        patientId: patientDetails.patientId || "",

        consents: patientDetails.consents || [],
        documents: patientDetails.documents || [],

        // Referrer
        referrerType: patientDetails.referrerType || "bez-skierowania",
        mainComplaint: patientDetails.mainComplaint,
        referrerName: patientDetails.referrerName,
        referrerNumber: patientDetails.referrerNumber,
        referrerEmail: patientDetails.referrerEmail,
        consultingDepartment: patientDetails.consultingDepartment,
        consultingSpecialization,
        consultingDoctor,

        // Address
        address: patientDetails.address,
        city: patientDetails.city,
        pinCode: patientDetails.pinCode,
        state: normalizeVoivodeship(patientDetails.state || patientDetails.province || ""),
        country: patientDetails.country,
        district: patientDetails.district,
        isInternationalPatient: patientDetails.isInternationalPatient || false,

        documentCountry: patientDetails.documentCountry || "",
        documentType: patientDetails.documentType || "",
        documentNumber: patientDetails.documentNumber || "",
        documentDateOfBirth:
          patientDetails.documentDateOfBirth || patientDetails.dateOfBirth || "",
        documentIssueDate: patientDetails.documentIssueDate || "",
        documentExpiryDate: patientDetails.documentExpiryDate || "",
        citizenship: patientDetails.citizenship || "",

        // Photo
        photo: patientDetails.photo || null,

        // Authorized persons
        ...mapPatientAuthorizationFields(patientDetails),
        // Guardian / legal representative (minors)
        ...mapPatientGuardianFields(patientDetails),
        allergies: patientDetails.allergies,
        preferredLanguage: patientDetails.preferredLanguage,

        // Notes
        reviewNotes: patientDetails.reviewNotes,
      };

      // Phone: use API phoneCode when valid; else match +prefix; else assume +48 (national / unknown format).
      if (hasRealPhone) {
        const { phoneCode, mobileNumber } = mapPatientPhoneToFormFields(
          rawPhone,
          patientDetails.phoneCode,
          phoneCountryCodes
        );
        mappedFormData.phoneCode = phoneCode;
        mappedFormData.mobileNumber = mobileNumber;
        setSelectedPhoneCode(phoneCode);
      } else {
        mappedFormData.phoneCode = DEFAULT_PATIENT_PHONE_CODE;
        mappedFormData.mobileNumber = "";
        setSelectedPhoneCode(DEFAULT_PATIENT_PHONE_CODE);
      }
      //(mappedFormData, "mapped form data")
      setPatientFormData(mappedFormData);
      setCurrentPatientId(userId);
      setIsEditMode(true);
      setShowAddPatientModal(true);
      hideLoader();
    } catch (error) {
      toast.error("Nie udało się pobrać danych pacjenta: " + error.message)
      setError("Nie udało się pobrać danych pacjenta: " + error.message);
      hideLoader();
    }
  };

  // Modify handleAddPatient to handle both create and update
  const handleAddPatient = async (formData) => {
    try {
      console.log("Settings - handleAddPatient received:", formData);

      if (formData.isInternationalPatient) {
        const identityErrors = validateIdentityDocument(
          {
            documentType: formData.documentType,
            documentNumber: formData.documentNumber,
            documentCountry: formData.documentCountry,
            documentIssueDate: formData.documentIssueDate,
            documentExpiryDate: formData.documentExpiryDate,
          },
          { requireExpiry: true }
        );
        if (identityErrors.length) {
          toast.error(identityErrors[0]);
          return;
        }
      }

      // When adding (not editing), validate that PESEL does not already exist
      if (!isEditMode && formData.govtId) {
        const normalizedPesel = normalizePesel(formData.govtId);
        if (normalizedPesel.length === 11) {
          try {
            const res = await patientService.getPatientByPesel(normalizedPesel);
            if (res?.exists) {
              toast.error("Pacjent o podanym numerze PESEL już istnieje w systemie.");
              return;
            }
          } catch (e) {
            console.warn("PESEL check failed:", e);
          }
        }
      }

      // When international patient, validate that document number does not already exist (another patient)
      if (formData.isInternationalPatient && formData.documentCountry?.trim() && formData.documentType?.trim() && formData.documentNumber?.trim()) {
        try {
          const res = await patientService.getPatientByDocumentNumber(
            formData.documentNumber.trim(),
            formData.documentCountry.trim(),
            formData.documentType.trim()
          );
          if (
            res?.exists &&
            !isSamePatientAsDocumentMatch(
              res,
              currentPatientId,
              formData.patient_id,
              formData.patientId,
              formData._id
            )
          ) {
            toast.error("Pacjent z podanym numerem dokumentu już istnieje w systemie.");
            return;
          }
        } catch (e) {
          console.warn("Document number check failed:", e);
        }
      }

      showLoader();
      
      // Prepare the data with combined phone number and separate phone code
      const patientData = {
        ...formData,
        phoneCode: selectedPhoneCode, // Send separate phone code
        mobileNumber: formData.mobileNumber, // Send clean mobile number
        // Also combine them for backward compatibility
        phone: selectedPhoneCode + (formData.mobileNumber || "")
      };

      // International patient document key for backend duplicate check and storage.
      // Field name: internationalPatientDocumentKey. Format: "country|documentType|documentNumber".
      // Backend should validate uniqueness and return 409 with existingPatientId when duplicate.
      if (formData.isInternationalPatient && formData.documentCountry?.trim() && formData.documentType?.trim() && formData.documentNumber?.trim()) {
        patientData.internationalPatientDocumentKey = [
          formData.documentCountry.trim(),
          formData.documentType.trim(),
          formData.documentNumber.trim()
        ].join("|");
      }
      
      console.log("Settings - handleAddPatient prepared data:", patientData);
      
      let response;
      
      if (isEditMode && currentPatientId) {
        response = await patientService.updatePatient(currentPatientId, patientData);
        setSuccess("Pacjent zaktualizowany pomyślnie");
      } else {
        response = await patientService.createPatient(patientData);
        setSuccess("Pacjent dodany pomyślnie");
      }
      
      hideLoader();
      fetchUsers();
      setShowAddPatientModal(false);
      setIsEditMode(false);
      setCurrentPatientId(null);
      
      // Clear draft on successful submission (only for create, not edit)
      if (!isEditMode) {
        clearFormDraft('patient');
      }
      
      // Preserve the phone code preference when resetting form
      setPatientFormData({ phoneCode: patientData.phoneCode || "+48" });
      setSelectedPhoneCode(patientData.phoneCode || "+48");
      setPhoneValidationError("");

      // Redirect back to the original page if returnUrl is set
      if (returnUrl) {
        navigate(returnUrl);
        setReturnUrl(null); // Clear the return URL
      }

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      hideLoader();
      const status = err.response?.status;
      const data = err.response?.data || {};
      const existingPatientId = data.existingPatientId || data.existingPatient_id;

      // Duplicate international patient document: do not create, offer link to existing record
      if (!isEditMode && (status === 409 || existingPatientId) && formData.isInternationalPatient) {
        toast.error("Pacjent z tym dokumentem już istnieje w systemie.");
        setShowAddPatientModal(false);
        if (existingPatientId) {
          handleEditPatient(existingPatientId);
        }
        return;
      }

      setError(
        "Nie udało się " + (isEditMode ? "zaktualizować" : "dodać") + " pacjenta: " +
        (data.error || data.message || "Nieznany błąd")
      );
      toast.error(
        "Nie udało się " + (isEditMode ? "zaktualizować" : "dodać") + " pacjenta: " +
        (data.error || data.message || "Nieznany błąd")
      );
    }
  };

  // Handle draft recovery for Patient form
  const handleRecoverPatientDraft = (draft) => {
    if (draft && draft.formData) {
      isRecoveringDraftRef.current = true;
      // Store draft data in ref for processing
      recoveredDraftDataRef.current = JSON.stringify(draft.formData);
      setPatientFormData(draft.formData);
      
      // Restore phone code if available
      if (draft.formData.phoneCode) {
        setSelectedPhoneCode(draft.formData.phoneCode);
      }
      
      // Restore current step if available
      if (draft.metadata && draft.metadata.currentSubStep !== undefined) {
        setCurrentSubStep(draft.metadata.currentSubStep);
      }
      
      toast.success("Szkic został przywrócony");
      
      // Reset flag after state updates
      setTimeout(() => {
        isRecoveringDraftRef.current = false;
      }, 500);
    }
    setShowDraftRecoveryModal({ show: false, formType: null, draft: null });
  };

  // Functions for patient form
  const goToSubStep = (step) => {
    setCurrentSubStep(step);
  };

  const markStepAsCompleted = (formData) => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    // Save the form data for access outside the FormProvider
    setPatientFormData(formData);

    if (currentSubStep === subStepTitles.length - 1) {
      handleAddPatient(formData);
    } else {
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing limits
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAddDropdown && !event.target.closest(".dropdown-container")) {
        setShowAddDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddDropdown]);

  // Check for drafts when Receptionist modal opens
  useEffect(() => {
    if (showAddModal && !isEditMode && receptionistModalJustOpened.current) {
      receptionistModalJustOpened.current = false;
      
      if (hasFormDraft('receptionist')) {
        const draft = loadFormDraft('receptionist');
        if (draft && draft.formData) {
          setShowDraftRecoveryModal({
            show: true,
            formType: 'receptionist',
            draft: draft,
          });
        }
      }
    }
  }, [showAddModal, isEditMode]);

  // Check for drafts when Doctor modal opens
  useEffect(() => {
    if (showAddDoctorModal && !selectedDoctor && doctorModalJustOpened.current) {
      doctorModalJustOpened.current = false;
      
      if (hasFormDraft('doctor')) {
        const draft = loadFormDraft('doctor');
        if (draft && draft.formData) {
          setShowDraftRecoveryModal({
            show: true,
            formType: 'doctor',
            draft: draft,
          });
        }
      }
    }
  }, [showAddDoctorModal, selectedDoctor]);

  // Check for drafts when Patient modal opens
  useEffect(() => {
    if (showAddPatientModal && !isEditMode && patientModalJustOpened.current) {
      patientModalJustOpened.current = false;
      
      if (hasFormDraft('patient')) {
        const draft = loadFormDraft('patient');
        if (draft && draft.formData) {
          setShowDraftRecoveryModal({
            show: true,
            formType: 'patient',
            draft: draft,
          });
        }
      }
    }
  }, [showAddPatientModal, isEditMode]);

  // Add handleEditUser function
  const handleEditUser = (user) => {
    setSelectedUser(user);
      setShowAddPatientModal(true);
      setIsEditMode(true);
      setCurrentPatientId(user._id);
  };

  // Add handleEditDoctor function
  const handleEditDoctor = async (userId) => {
    try {
      showLoader();
      const response = await doctorService.getDoctorDetailsById(userId);
      // Map specializations to {id, name}
      setSelectedDoctor(response.data);
      setShowAddDoctorModal(true);
      hideLoader();
    } catch (error) {
      setError("Nie udało się pobrać danych lekarza: " + error.message);
      hideLoader();
    }
  };

  const getUserDisplayId = (u) => {
    if (!u) return "";
    if (u.role === "patient") return u.patientId || u._id;
    if (u.role === "doctor") return u.doctorId || u._id;
    return u._id;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <SpecializationModal isOpen={showSpecsModal} onClose={()=>{setShowSpecsModal(false)}}/>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-700">Zarządzanie Użytkownikami</h1>

        {/* Add User Dropdown Button - Modified for role-based access */}
        <div className="flex gap-4">
          {isAdmin && (
            <button
              onClick={() => setShowSpecsModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              Zarządzaj Specjalizacjami
            </button>
          )}
          <div className="dropdown-container relative">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              Dodaj Użytkownika <ChevronDown size={16} />
            </button>

            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {isAdmin && (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowAddDropdown(false);
                          doctorModalJustOpened.current = true;
                          setShowAddDoctorModal(true);
                        }}
                      >
                        Dodaj Specjalistę
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowAddDropdown(false);
                          receptionistModalJustOpened.current = true;
                          setShowAddModal(true);
                        }}
                      >
                        Dodaj Recepcjonistę
                      </button>
                    </>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowAddDropdown(false);
                      patientModalJustOpened.current = true;
                      setShowAddPatientModal(true);
                    }}
                  >
                    Dodaj Pacjenta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex mb-4">
          <input
            type="text"
            placeholder="Szukaj po nazwie, email lub telefonie..."
            className="p-2 border border-gray-300 rounded-l-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-r-md"
          >
            Szukaj
          </button>
        </form>

        {searchTerm && (
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600 mr-2">
              Wyszukiwanie: "{searchTerm}"
            </span>
            <button
              onClick={handleClearSearch}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Wyczyść
            </button>
          </div>
        )}

        <div className="flex justify-end items-center">
          <label htmlFor="usersPerPage" className="mr-2 text-sm text-gray-600">
            Użytkowników na stronę:
          </label>
          <select
            id="usersPerPage"
            value={usersPerPage}
            onChange={handleUsersPerPageChange}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Bulk Delete Button */}
      {isAdmin && selectedUserIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="text-red-800 font-medium">
            Wybrano {selectedUserIds.length} użytkownik(ów)
          </span>
          <button
            onClick={handleBulkDeleteClick}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={18} />
            Trwale usuń wybranych ({selectedUserIds.length})
          </button>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && (
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name.first")}
              >
                Użytkownik {getSortIcon("name.first")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("phone")}
              >
                Kontakt {getSortIcon("phone")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Rola {getSortIcon("role")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("signupMethod")}
              >
                Metoda Rejestracji {getSortIcon("signupMethod")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("deleted")}
              >
                Status {getSortIcon("deleted")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={isAdmin ? "8" : "7"} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? "8" : "7"} className="px-6 py-4 text-center text-gray-500">
                  Nie znaleziono użytkowników
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className={`hover:bg-gray-50 ${selectedUserIds.includes(user._id) ? 'bg-red-50' : ''}`}>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profilePicture}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                            {user.name?.first?.charAt(0)}
                            {user.name?.last?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name.first} {user.name.last}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getUserDisplayId(user)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phone != null && String(user.phone).trim() !== "" && !/_no_phone_/i.test(String(user.phone).trim())
                        ? user.phone
                        : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "doctor"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "receptionist"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {roleTranslations[user.role.toLowerCase()] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {user.signupMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.deleted
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {statusTranslations[user.deleted ? "deleted" : "active"]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {!user.deleted && (
                        <>
                          {user.role === "doctor" && (
                            <>
                              <button
                                onClick={() => handleManageSchedule(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Harmonogram
                              </button>
                              <button
                                onClick={() => handleEditDoctor(user._id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edytuj
                              </button>
                            </>
                          )}
                          {user.role === "patient" && (
                            <button
                              onClick={() => handleEditPatient(user._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edytuj
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Usuń
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handlePermanentDeleteClick(user)}
                              className="text-red-800 hover:text-red-950 font-semibold ml-2"
                              title="Trwale usuń (nieodwracalne)"
                            >
                              Trwale usuń
                            </button>
                          )}
                        </>
                      )}
                      {user.deleted && isAdmin && (
                        <button
                          onClick={() => handleReviveUser(user._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Przywróć
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Strona {currentPage} z {totalPages}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            Pierwsza
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            Poprzednia
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            Następna
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            Ostatnia
          </button>
        </div>
      </div>

      {/* Add Receptionist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl transform transition-all duration-300 border border-teal-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-700 border-b pb-2 border-teal-200 flex-1">
                Dodaj Nowego Recepcjonistę
              </h2>
              {!isEditMode && (
                <AutoSaveIndicator 
                  status={receptionistDraftStatus.saveStatus} 
                  className="ml-2"
                />
              )}
            </div>
            <form onSubmit={handleAddReceptionist}>
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Imię
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Hasło
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    // Don't clear draft on cancel - user might come back
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-5 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  Dodaj Recepcjonistę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <AddDoctorForm
          isOpen={showAddDoctorModal}
          onClose={() => {
            setShowAddDoctorModal(false);
            setSelectedDoctor(null);
            setDoctorDraftData(null); // Clear draft data when closing
            // Don't clear draft from localStorage on cancel - user might come back
          }}
          onAddDoctor={(doctorData, resetForm) =>
            handleAddDoctor(doctorData, resetForm, () => {
              setShowAddDoctorModal(false);
              setSelectedDoctor(null);
              setDoctorDraftData(null);
            })
          }
          initialData={doctorDraftData || selectedDoctor}
          isEditMode={!!selectedDoctor}
          onFormDataChange={setCurrentDoctorFormData}
          saveStatus={doctorDraftStatus.saveStatus}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">
                  {isEditMode ? "Dane szczegółowe pacjenta" : "Dodaj Pacjenta"}
                </h2>
                {!isEditMode && (
                  <AutoSaveIndicator 
                    status={patientDraftStatus.saveStatus} 
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowAddPatientModal(false);
                    setIsEditMode(false);
                    setCurrentPatientId(null);
                    // Preserve the phone code preference when closing form
                    setPatientFormData({ phoneCode: patientFormData.phoneCode || "+48" });
                    // Don't clear draft on cancel - user might come back
                    
                    // Redirect back to the original page if returnUrl is set
                    if (returnUrl) {
                      navigate(returnUrl);
                      setReturnUrl(null); // Clear the return URL
                    }
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <FormProvider 
                key={`patient-form-${isEditMode ? 'edit' : 'new'}`} 
                initialData={patientFormData}
              >
                <PatientStepFormWrapper
                  currentSubStep={currentSubStep}
                  goToSubStep={goToSubStep}
                  markStepAsCompleted={markStepAsCompleted}
                  subStepTitles={subStepTitles}
                  isEditMode={isEditMode}
                  currentPatientId={currentPatientId}
                  handleAddPatient={handleAddPatient}
                  patientFormData={patientFormData}
                  selectedPhoneCode={selectedPhoneCode}
                  onPhoneCodeChange={handlePhoneCodeChange}
                  onPhoneNumberChange={handlePhoneNumberChange}
                  phoneValidationError={phoneValidationError}
                  phoneCountryCodes={phoneCountryCodes}
                  onRemoveEmail={handleRemoveEmail}
                  onFormDataChange={setCurrentFormContextData}
                  recoveredDraftDataRef={recoveredDraftDataRef}
                  isRecoveringDraftRef={isRecoveringDraftRef}
                  footerCenter={
                    isEditMode && currentPatientId ? (
                      <PatientKioskCorrectionPanel
                        compact
                        patientId={currentPatientId}
                        onCompleted={() => {
                          toast.success(
                            "Pacjent zaktualizował dane na tablecie. Odśwież formularz, aby zobaczyć zmiany."
                          );
                        }}
                      />
                    ) : null
                  }
                />
              </FormProvider>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Potwierdź Usunięcie
            </h2>
            <p className="mb-6">
              Czy na pewno chcesz usunąć użytkownika{" "}
              <span className="font-bold">
                {selectedUser.name.first} {selectedUser.name.last}
              </span>
              ? Tej operacji nie można cofnąć.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Schedule Modal */}
      {showScheduleModal && selectedDoctorId && (
        <DoctorScheduleManager
          isModal={true}
          doctorId={selectedDoctorId}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedDoctorId(null);
          }}
        />
      )}

      {/* Permanent Delete Dialog */}
      <PermanentDeleteDialog
        open={permanentDeleteDialog.open}
        onClose={() => setPermanentDeleteDialog({ open: false, id: null, userName: "" })}
        type="user"
        id={permanentDeleteDialog.id}
        title="Trwale usuń konto użytkownika?"
        message={`Konto użytkownika "${permanentDeleteDialog.userName}" oraz wszystkie powiązane rekordy (wizyty, faktury, usługi) zostaną trwale usunięte. Ta operacja jest nieodwracalna.`}
        onSuccess={handlePermanentDeleteSuccess}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteByIdsDialog
        open={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, ids: [] })}
        type="user"
        selectedIds={bulkDeleteDialog.ids}
        itemName="użytkowników"
        onSuccess={handlePermanentDeleteSuccess}
      />

      {/* Draft Recovery Modal */}
      {showDraftRecoveryModal.show && showDraftRecoveryModal.draft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-teal-700">
              Znaleziono zapisany szkic
            </h2>
            <p className="mb-4 text-gray-600">
              Znaleziono zapisany szkic formularza. Czy chcesz go przywrócić?
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Zapisano:</strong> {formatDraftAge(Date.now() - (showDraftRecoveryModal.draft.metadata?.timestamp || 0))}
              </p>
              {showDraftRecoveryModal.formType === 'patient' && showDraftRecoveryModal.draft.metadata?.currentSubStep !== undefined && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Krok:</strong> {subStepTitles[showDraftRecoveryModal.draft.metadata.currentSubStep] || `Krok ${showDraftRecoveryModal.draft.metadata.currentSubStep + 1}`}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleStartFresh(showDraftRecoveryModal.formType)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Rozpocznij od nowa
              </button>
              <button
                onClick={() => {
                  if (showDraftRecoveryModal.formType === 'receptionist') {
                    handleRecoverReceptionistDraft(showDraftRecoveryModal.draft);
                  } else if (showDraftRecoveryModal.formType === 'doctor') {
                    handleRecoverDoctorDraft(showDraftRecoveryModal.draft);
                  } else if (showDraftRecoveryModal.formType === 'patient') {
                    handleRecoverPatientDraft(showDraftRecoveryModal.draft);
                  }
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Przywróć szkic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Create a wrapper component to use the form context
function PatientStepFormWrapper({
  currentSubStep,
  goToSubStep,
  currentPatientId,
  markStepAsCompleted,
  subStepTitles,
  isEditMode,
  handleAddPatient,
  patientFormData,
  selectedPhoneCode,
  onPhoneCodeChange,
  onPhoneNumberChange,
  phoneValidationError,
  phoneCountryCodes,
  onRemoveEmail,
  onFormDataChange, // Callback to notify parent of form data changes
  recoveredDraftDataRef, // Ref from parent to track recovered draft
  isRecoveringDraftRef, // Ref from parent to track if recovering draft
  footerCenter = null,
}) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const { formData, updateFormData, updateMultipleFields } = useFormContext();
  const [isInitialized, setIsInitialized] = useState(false);
  const draftLoadedRef = useRef(false); // Track if draft has been loaded
  const lastPatientFormDataRef = useRef(null); // Track last loaded data to prevent re-loading
  const isUpdatingFormRef = useRef(false); // Track if we're currently updating form to prevent loops
  //('Form Data:', patientFormData);

  // Notify parent component of form data changes for auto-save (with guard to prevent loops)
  const lastNotifiedFormDataRef = useRef(null);
  useEffect(() => {
    // Don't notify if we're currently updating the form from draft/edit
    if (isUpdatingFormRef.current) {
      return;
    }
    
    if (onFormDataChange && formData) {
      // Only notify if form data actually changed (not just reference)
      const formDataString = JSON.stringify(formData);
      const lastNotifiedString = lastNotifiedFormDataRef.current;
      
      if (formDataString !== lastNotifiedString) {
        onFormDataChange(formData);
        lastNotifiedFormDataRef.current = formDataString;
      }
    }
  }, [formData, onFormDataChange]);

  // Expose updateFormData globally so it can be accessed from parent component
  useEffect(() => {
    window.updateFormData = updateFormData;
    return () => {
      window.updateFormData = null;
    };
  }, [updateFormData]);

  // Separate effect for draft recovery - only runs when recoveredDraftDataRef is set
  useEffect(() => {
    if (!recoveredDraftDataRef.current || isUpdatingFormRef.current || draftLoadedRef.current) {
      return;
    }

    if (patientFormData && Object.keys(patientFormData).length > 0 && !isEditMode) {
      const currentDataKey = JSON.stringify(patientFormData);
      const recoveredKey = recoveredDraftDataRef.current;
      
      // Only load if the current data matches the recovered draft
      if (currentDataKey === recoveredKey) {
        isUpdatingFormRef.current = true;
        updateMultipleFields(patientFormData);
        lastPatientFormDataRef.current = currentDataKey;
        draftLoadedRef.current = true;
        console.log('✅ Form data loaded from draft recovery:', patientFormData);
        // Clear recovered draft ref after loading
        recoveredDraftDataRef.current = null;
        // Reset flag after form context updates
        setTimeout(() => {
          isUpdatingFormRef.current = false;
        }, 300);
      }
    }
  }, [patientFormData, isEditMode, updateMultipleFields]);

  // Effect to pre-populate form data when in edit mode
  useEffect(() => {
    // Skip if we're already updating to prevent loops
    if (isUpdatingFormRef.current || isRecoveringDraftRef.current) {
      return;
    }

    // Only handle edit mode here
    if (isEditMode && patientFormData && Object.keys(patientFormData).length > 0 && !isInitialized) {
      const currentDataKey = JSON.stringify(patientFormData);
      const lastDataKey = lastPatientFormDataRef.current;
      const dataChanged = currentDataKey !== lastDataKey;
      
      if (dataChanged) {
        // Edit mode - update form data
        isUpdatingFormRef.current = true;
        updateMultipleFields(patientFormData);
        setCompletedSteps(Array.from({ length: subStepTitles.length }, (_, i) => i));
        setIsInitialized(true);
        lastPatientFormDataRef.current = currentDataKey;
        draftLoadedRef.current = true;
        console.log('✅ Form data loaded for edit mode');
        // Reset flag after form context updates
        setTimeout(() => {
          isUpdatingFormRef.current = false;
        }, 300);
      }
    }
    
    // Reset initialization when exiting edit mode and no draft data
    if (!isEditMode && (!patientFormData || !patientFormData.fullName)) {
      setIsInitialized(false);
      draftLoadedRef.current = false;
      lastPatientFormDataRef.current = null;
      isUpdatingFormRef.current = false;
      lastNotifiedFormDataRef.current = null;
      recoveredDraftDataRef.current = null;
    }
  }, [isEditMode, patientFormData, isInitialized, subStepTitles.length, updateMultipleFields]);

  // Expose updateFormData globally so it can be accessed from parent component
  useEffect(() => {
    window.updateFormData = updateFormData;
    window.updateMultipleFields = updateMultipleFields;
    return () => {
      window.updateFormData = null;
      window.updateMultipleFields = null;
    };
  }, [updateFormData, updateMultipleFields]);

  // This function connects the context's form data to the parent component
  const handleStepCompleted = () => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    if (currentSubStep === subStepTitles.length - 1) {
      console.log("Settings - Submitting form data:", formData);
      console.log("Settings - Contact person phone data:", {
        contactPerson1PhoneCode: formData.contactPerson1PhoneCode,
        contactPerson1Phone: formData.contactPerson1Phone,
        contactPerson2PhoneCode: formData.contactPerson2PhoneCode,
        contactPerson2Phone: formData.contactPerson2Phone
      });
      handleAddPatient(formData);
    } else {
      goToSubStep(currentSubStep + 1);
    }
  };

  return (
    <PatientStepForm
      currentSubStep={currentSubStep}
      goToSubStep={goToSubStep}
      markStepAsCompleted={handleStepCompleted}
      subStepTitles={subStepTitles}
      isEditMode={isEditMode}
      currentPatientId={currentPatientId}
      completedSteps={completedSteps}
      selectedPhoneCode={selectedPhoneCode}
      onPhoneCodeChange={onPhoneCodeChange}
      onPhoneNumberChange={onPhoneNumberChange}
      phoneValidationError={phoneValidationError}
      phoneCountryCodes={phoneCountryCodes}
      onRemoveEmail={onRemoveEmail}
      footerCenter={footerCenter}
    />
  );
}