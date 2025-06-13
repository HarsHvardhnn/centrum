import { useState, useEffect } from "react";
import adminHelper from "../../helpers/adminHelper";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import DoctorScheduleManager from "./DoctorScheduleEditor";
import { ChevronDown } from "lucide-react"; // For dropdown icon
import PatientStepForm from "../SubComponentForm/PatientStepForm";
import { FormProvider, useFormContext } from "../../context/SubStepFormContext";
import AddDoctorForm from "../Doctor/CreateDoctor";
import doctorService from "../../helpers/doctorHelper";
import patientService from "../../helpers/patientHelper";
import SpecializationModal from "./SpecializationModal";
import { toast } from "sonner";

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

  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSpecsModal,setShowSpecsModal]=useState(false)
  const [patientFormData, setPatientFormData] = useState({});

  // Add User dropdowns and modals
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [usersPerPage, setUsersPerPage] = useState(5);

  // State for doctor schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Patient form states
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const subStepTitles = [
    "Dane Podstawowe",
    "Skierowanie",
    "Adres",
    "Zgody",
    "Szczegóły",
    "Notatki",
  ];

  // Add this function to check if user is admin
  const isAdmin = user?.role === 'admin';

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
  }, [currentPage, usersPerPage, sortField, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchUsers();
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

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    try {
      showLoader();
      await adminHelper.addReceptionist(formData);
      setError("");
      setSuccess("Recepcjonista został dodany pomyślnie");
      setShowAddModal(false);
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

  // Function to handle adding/updating a doctor
  const handleAddDoctor = async (doctorData, resetForm, closeModal) => {
    try {
      //("doctorData",doctorData)
      showLoader();
      let response;
      
      if (selectedDoctor) {
        // Update existing doctor
        response = await doctorService.updateDoctor(selectedDoctor.id, doctorData);
        setSuccess("Lekarz został zaktualizowany pomyślnie");
      } else {
        // Create new doctor
        response = await doctorService.createDoctor(doctorData);
        setSuccess("Lekarz został dodany pomyślnie");
      }

      hideLoader();
      fetchUsers(); // Refresh the users list

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

  // Add this function to handle edit click
  const handleEditPatient = async (userId) => {
    try {
      showLoader();
      const patientData = await patientService.getPatientById(userId);
      let patientDetails=patientData;
      //(patientData, "patient data")
      const mappedFormData = {
        // Demographics
        fullName:
          patientDetails.name?.first + " " + (patientDetails.name?.last || ""),
        email: patientDetails.email,
        mobileNumber: patientDetails.phone,
        patient_id: patientDetails._id,
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
        isAdult: patientDetails.isAdult === true ? 'TAK' : 'NIE',
        contactPerson: patientDetails.contactPerson,
        fatherPhone: patientDetails.fatherPhone,
        motherPhone: patientDetails.motherPhone,
        relationToPatient: patientDetails.relationToPatient,
        allergies: patientDetails.allergies,
        nationality: patientDetails.nationality,
        preferredLanguage: patientDetails.preferredLanguage,

        // Notes
        reviewNotes: patientDetails.reviewNotes,
      };
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
      showLoader();
      let response;
      
      if (isEditMode && currentPatientId) {
        response = await patientService.updatePatient(currentPatientId, formData);
        setSuccess("Pacjent zaktualizowany pomyślnie");
      } else {
        response = await patientService.createPatient(formData);
        setSuccess("Pacjent dodany pomyślnie");
      }
      
      hideLoader();
      fetchUsers();
      setShowAddPatientModal(false);
      setIsEditMode(false);
      setCurrentPatientId(null);
      setPatientFormData({});

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        "Nie udało się " + (isEditMode ? "zaktualizować" : "dodać") + " pacjenta: " +
        (err.response?.data?.error || err.response?.data?.message || "Nieznany błąd")
      );
      toast.error(    "Nie udało się " + (isEditMode ? "zaktualizować" : "dodać") + " pacjenta: " +
      (err.response?.data?.error || err.response?.data?.message || "Nieznany błąd"))
      hideLoader();
    }
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
                          setShowAddDoctorModal(true);
                        }}
                      >
                        Dodaj Specjalistę
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowAddDropdown(false);
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

      {/* User Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Nie znaleziono użytkowników
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
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
                    <div className="text-sm text-gray-900">{user._id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phone || "N/A"}
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
            <h2 className="text-2xl font-bold mb-6 text-teal-700 border-b pb-2 border-teal-200">
              Dodaj Nowego Recepcjonistę
            </h2>
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
                  onClick={() => setShowAddModal(false)}
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
          }}
          onAddDoctor={(doctorData, resetForm) =>
            handleAddDoctor(doctorData, resetForm, () => {
              setShowAddDoctorModal(false);
              setSelectedDoctor(null);
            })
          }
          initialData={selectedDoctor}
          isEditMode={!!selectedDoctor}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edytuj Pacjenta" : "Dodaj Pacjenta"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddPatientModal(false);
                  setIsEditMode(false);
                  setCurrentPatientId(null);
                  setPatientFormData({});
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

            <div className="p-6">
              <FormProvider initialData={patientFormData}>
                <PatientStepFormWrapper
                  currentSubStep={currentSubStep}
                  goToSubStep={goToSubStep}
                  markStepAsCompleted={markStepAsCompleted}
                  subStepTitles={subStepTitles}
                  isEditMode={isEditMode}
                  currentPatientId={currentPatientId}
                  handleAddPatient={handleAddPatient}
                  patientFormData={patientFormData}
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
  patientFormData
}) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const { formData, updateFormData } = useFormContext();
  const [isInitialized, setIsInitialized] = useState(false);
  //('Form Data:', patientFormData);

  // Effect to pre-populate form data when in edit mode - only run once when entering edit mode
  useEffect(() => {
    if (isEditMode && patientFormData && !isInitialized) {
      //('Updating form data with:', JSON.stringify(patientFormData, null, 2));
      updateFormData(patientFormData);
      setCompletedSteps(Array.from({ length: subStepTitles.length }, (_, i) => i));
      setIsInitialized(true);
    }
    
    // Reset initialization when exiting edit mode
    if (!isEditMode) {
      setIsInitialized(false);
    }
  }, [isEditMode, patientFormData, isInitialized, subStepTitles.length]);

  // This function connects the context's form data to the parent component
  const handleStepCompleted = () => {
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    if (currentSubStep === subStepTitles.length - 1) {
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
    />
  );
}