import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  Edit,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function PatientsTable({
  patients,
  onEditPatient,
  setShowCheckin,
  setSelectedPatient,
  clinic
}) {
  // Pagination states
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  // Track open dropdown by patient ID instead of a single boolean
  const [openActionsId, setOpenActionsId] = useState(null);

  // Reset to first page when patients array changes
  useEffect(() => {
    setCurrentPage(1);
  }, [patients.length]);

  // Get current patients for pagination
  const currentPatients = useMemo(() => {
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    return patients.slice(indexOfFirstPatient, indexOfLastPatient);
  }, [currentPage, patients, patientsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  // Pagination handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Generate pagination numbers with ellipsis
  const paginationNumbers = useMemo(() => {
    let pages = [];

    if (totalPages <= 7) {
      // Show all pages if total pages are 7 or less
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        // Add ellipsis if current page is far from start
        pages.push("...");
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        // Add ellipsis if current page is far from end
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Handle edit button click
  const handleEditClick = (patient) => {
    if (onEditPatient) {
      onEditPatient(patient);
    }
  };

  // Handle check-in button click for a specific patient
  const handleCheckInClick = (patient) => {
    setSelectedPatient(patient);
    setShowCheckin(true);
  };

  // Toggle actions dropdown for a specific patient
  const toggleActions = (patientId) => {
    setOpenActionsId((prevId) => (prevId === patientId ? null : patientId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenActionsId(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-2">Lista Pacjentów</h2>
          <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-2 py-1">
            {patients.length} użytkowników
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 p-2">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-4 py-3 w-12">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3">Imię i nazwisko</th>
              <th className="px-4 py-3">ID Pacjenta</th>
              <th className="px-4 py-3 flex items-center">
                Data <ChevronDown size={16} className="ml-1" />
              </th>
              <th className="px-4 py-3">Płeć</th>
              <th className="px-4 py-3 flex items-center">
                Wiek <ChevronDown size={16} className="ml-1" />
              </th>
              <th className="px-4 py-3">Choroby</th>
              <th className="px-4 py-3 flex items-center">
                Status <ChevronDown size={16} className="ml-1" />
              </th>
              <th className="px-4 py-3">Lekarz</th>
              <th className="px-4 py-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.length > 0 ? (
              currentPatients.map((patient, index) => (
                <tr key={index} className="border-b hover:bg-gray-50" onClick={()=>navigate(`/patients-details/${patient.id}`)}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                        <img
                          src={patient.avatar}
                          alt={patient.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{patient.id}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.date}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.sex}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.age}</td>
                  <td className="px-4 py-3 text-gray-500">{patient.disease}</td>
                  <td className="px-4 py-3">
                    <div
                      className={`flex items-center ${
                        patient.status === "Compilate"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          patient.status === "Compilate"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                      ></div>
                      {patient.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{patient.doctor}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling to document
                        toggleActions(patient.id);
                      }}
                      className="text-gray-600 hover:text-black"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openActionsId === patient.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <ul className="text-sm text-gray-700">
                          {!patient.isCheckedIn && !clinic && (
                            <li>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event bubbling
                                  handleCheckInClick(patient);
                                  setOpenActionsId(null);
                                }}
                              >
                                <Check size={14} className="inline mr-2" />
                                Zarejestruj
                              </button>
                            </li>
                          )}
                          <li>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                handleEditClick(patient);
                                setOpenActionsId(null);
                              }}
                            >
                              <Edit size={14} className="inline mr-2" />
                              Edytuj
                            </button>
                          </li>
                          {/* <li>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                // You can implement delete here
                                setOpenActionsId(null);
                              }}
                            >
                              <Trash2 size={14} className="inline mr-2" />
                              Delete
                            </button>
                          </li> */}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No patients found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {patients.length > 0 && (
        <div className="px-6 py-4 flex justify-between items-center border-t">
          <button
            className={`flex items-center px-3 py-2 border rounded-md text-gray-600 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>
          <div className="flex items-center gap-2">
            {paginationNumbers.map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  className={`h-8 w-8 flex items-center justify-center rounded-md ${
                    currentPage === number
                      ? "bg-gray-100 text-blue-600 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              )
            )}
          </div>
          <button
            className={`flex items-center px-3 py-2 border rounded-md text-gray-600 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientsTable;
