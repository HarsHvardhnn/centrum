// PatientSearchField.jsx
import { useState, useRef, useEffect } from "react";
import PatientDropdown from "./PatientDropDown";
import patientService from "../../helpers/patientHelper";

const PatientSearchField = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
  });
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // Fetch patients when searchTerm changes
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 300); // Debounce search to avoid too many requests

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchPatients = async (search = "", page = 1) => {
    try {
      setLoading(true);
      const options = {
        search,
        page,
        limit: 5, // Show 5 patients in dropdown
        sortBy: "name.first", // Sort by first name
        sortOrder: "asc",
      };

      const response = await patientService.getSimpliefiedPatientsList(options);

      if (response.success) {
        setPatients(response.patients);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.pages,
          totalPatients: response.total,
        });
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    // If no search term, fetch initial patients
    if (!searchTerm) {
      fetchPatients();
    }
  };

  const handleSelect = (patient) => {
    setSearchTerm(`${patient.name} (${patient.id})`);
    setIsDropdownOpen(false);
    onPatientSelect(patient);
  };

  const handleSearch = () => {
    fetchPatients(searchTerm);
    setIsDropdownOpen(true);
  };

  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchPatients(searchTerm, pagination.currentPage + 1);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="mb-2 text-sm font-medium">Imię i nazwisko pacjenta</div>
      <div className="flex">
        <input
          id="search"
          type="text"
          placeholder="Wprowadź imię i numer pacjenta"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-xs"
          style={{
            borderColor: "#D0D5DD",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="ml-2 w-12 h-12 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: "#4EBFB4" }}
          aria-label="Szukaj"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* Dropdown - positioned relative to the parent container */}
      <div className="relative w-full">
        <PatientDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onSelect={handleSelect}
          patients={patients}
          loading={loading}
          pagination={pagination}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
};

export default PatientSearchField;
