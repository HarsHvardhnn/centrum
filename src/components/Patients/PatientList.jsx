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

// Wrap the entire component with FormProvider
function LabAppointmentsContent() {
  // Now we can access the form context directly
  const { formData } = useFormContext();

  // Patient data
  const [allPatients, setAllPatients] = useState([
    {
      id: "#85736733",
      name: "Demi Wilkinson",
      username: "@demi",
      date: "Dec 01, 23",
      sex: "Female",
      age: 36,
      disease: "Diabetes",
      status: "Compilate",
      doctor: "Dr. Imran Ali",
    },
    // Adding more patients for pagination testing
    ...[...Array(30)].map((_, i) => ({
      id: "#85736733",
      name: ["Olivia Rhye", "Phoenix Baker", "Demi Wilkinson", "Lana Steiner"][
        i % 4
      ],
      username: ["@olivia", "@phoenix", "@demi", "@lana"][i % 4],
      date: "Dec 01, 23",
      sex: i % 2 === 0 ? "Male" : "Female",
      age: 30 + (i % 40),
      disease: i % 2 === 0 ? "Diabetes" : "Blood pressure",
      status: i % 2 === 0 ? "Compilate" : "In-Treatment",
      doctor: ["Dr. Mohon Roy", "Dr. Imran Ali", "Dr. Mustag"][i % 3],
    })),
  ]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Patient form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const subStepTitles = [
    "Demographics",
    "Referrer",
    "Address",
    "Photo",
    "Details",
    "Notes",
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

  // Function to go to a specific sub-step
  const goToSubStep = (step) => {
    setCurrentSubStep(step);
  };

  // Function to mark a step as completed
  const markStepAsCompleted = () => {
    console.log("form data", formData);
    if (!completedSteps.includes(currentSubStep)) {
      setCompletedSteps([...completedSteps, currentSubStep]);
    }

    // If we're on the last step, submit the form
    if (currentSubStep === subStepTitles.length - 1) {
      handleFormSubmit();
    } else {
      // Otherwise, move to the next step
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  // Function to handle form submission
  const handleFormSubmit = () => {
    // Here you would typically gather all form data and make an API call
    console.log("Form submitted successfully!");
    console.log("Final form data:", formData);

    // Generate a new patient ID
    const newPatientId = `#${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Now we're using the actual form data to create the new patient
    const newPatient = {
      id: newPatientId,
      name: formData.fullName || "New Patient",
      username: `@${
        formData.fullName?.toLowerCase().replace(/\s+/g, "") || "newpatient"
      }`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "2-digit",
      }),
      sex: formData.sex || "Not specified",
      age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0,
      disease: formData.mainComplaint || "Check-up",
      status: "In-Treatment",
      doctor: formData.consultingDoctor || "Dr. Imran Ali",
    };

    // Add the new patient to the list
    setAllPatients([newPatient, ...allPatients]);

    // Close the modal and reset form state
    setIsModalOpen(false);
    setCurrentSubStep(0);
    setCompletedSteps([]);
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
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex w-full justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Lab Appointments</h1>
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
            <button
              className="bg-teal-500 text-white rounded-lg px-4 py-2 flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Add Patient
            </button>
          </div>
        </div>

        {/* Patients Table Component */}
        <PatientsTable patients={filteredPatients} />

        {/* Add Patient Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-bold">Add New Patient</h2>
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
function LabAppointments() {
  return (
    <FormProvider>
      <LabAppointmentsContent />
    </FormProvider>
  );
}

export default LabAppointments;
