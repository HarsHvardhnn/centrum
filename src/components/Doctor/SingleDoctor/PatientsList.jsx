import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserX,
} from "lucide-react";

const PatientsList = ({
  totalPatients = 0,
  currentPage = 1,
  onPageChange,
  onPatientSelect,
  patientsData = [],
}) => {
  // Changed from array to single string to store only one selected patient ID
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Notify parent component when selection changes
  const handlePatientSelect = (patientId) => {
    // If the same patient is clicked again, unselect it
    if (selectedPatient === patientId) {
      setSelectedPatient(null);
      if (onPatientSelect) onPatientSelect(null);
    } else {
      setSelectedPatient(patientId);
      if (onPatientSelect) onPatientSelect(patientId);
    }
  };

  const sortedPatients = useMemo(() => {
    let sortableItems = [...patientsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [patientsData, sortConfig]);

  const requestSort = (key) => {
    let direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      Finished: {
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        dotColor: "bg-green-600",
      },
      Waiting: {
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        dotColor: "bg-yellow-600",
      },
      Cancelled: {
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        dotColor: "bg-red-600",
      },
    };
    const { bgColor, textColor, dotColor } = statusStyles[status] || {
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      dotColor: "bg-gray-600",
    };

    return (
      <div
        className={`flex items-center px-4 text-sm h-fit py-1 rounded-full capitalize ${bgColor} ${textColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${dotColor} mr-2`} />
        {status}
      </div>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <UserX size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">No patients found</h3>
      <p className="text-gray-400 text-center max-w-sm mb-6">
        There are currently no patients in the system or matching your search
        criteria.
      </p>
      {/* Optional button if you want to add one */}
      {/* <button className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">
        Add New Patient
      </button> */}
    </div>
  );

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-8 items-center">
          <h2 className="text-lg font-semibold">Patients List</h2>
          <span className="text-sm text-teal-400 bg-teal-100 rounded-full px-3 py-1">
            {totalPatients} {totalPatients === 1 ? "user" : "users"}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Table or Empty State */}
      {patientsData.length > 0 ? (
        <div>
          {/* Table Header */}
          <div className="grid grid-cols-5 px-4 py-3 bg-gray-50 border-b">
            <div className="col-span-2 flex items-center">Patients name</div>
            <div className="text-center">Sex</div>
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => requestSort("age")}
            >
              Age
              <ChevronDown size={16} />
            </div>
            <div
              className="flex items-center cursor-pointer justify-center"
              onClick={() => requestSort("status")}
            >
              Status
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Table Body */}
          {sortedPatients.map((patient) => (
            <div
              key={patient.id}
              className="grid grid-cols-5 px-4 py-3 border-b hover:bg-gray-50 text-center"
            >
              <div className="col-span-2 flex items-center text-left">
                <input
                  type="checkbox"
                  checked={selectedPatient === patient.id}
                  onChange={() => handlePatientSelect(patient.id)}
                  className="w-4 h-4 mr-3"
                />
                <img
                  src={patient.avatar || "/api/placeholder/32/32"}
                  alt={`${patient.name} avatar`}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <p>{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.username}</p>
                </div>
              </div>
              <div>{patient.sex}</div>
              <div>{patient.age}</div>
              <div className="flex justify-center">
                <StatusBadge status={patient.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Pagination - Only show if there are patients */}
      {patientsData.length > 0 && (
        <div className="p-4 flex justify-between items-center">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </button>

          {/* Pagination Numbers */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 rounded-md border ${
                currentPage === 1 ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => onPageChange && onPageChange(1)}
            >
              1
            </button>
            <button
              className="px-3 py-2 rounded-md border hover:bg-gray-100"
              onClick={() => onPageChange && onPageChange(2)}
            >
              2
            </button>
            <span className="px-3 py-2 text-gray-500">...</span>
            <button
              className="px-3 py-2 rounded-md border hover:bg-gray-100"
              onClick={() => onPageChange && onPageChange(8)}
            >
              8
            </button>
            <button
              className="px-3 py-2 rounded-md border hover:bg-gray-100"
              onClick={() => onPageChange && onPageChange(9)}
            >
              9
            </button>
          </div>

          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPatients}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
