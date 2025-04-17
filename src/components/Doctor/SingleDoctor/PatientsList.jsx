import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
} from "lucide-react";

const PatientsList = ({
  totalPatients = 100,
  currentPage = 1,
  onPageChange,
  onPatientSelect,
  onEditPatient,
  patientsData = [],
}) => {
  const defaultPatientsData = [
    {
      id: "1",
      name: "Demi Wilkinson",
      username: "@demi",
      avatar: "https://i.pravatar.cc/150?img=1",
      sex: "Male",
      age: 70,
      status: "Finished",
    },
    {
      id: "2",
      name: "Olivia Rhye",
      username: "@olivia",
      avatar: "https://i.pravatar.cc/150?img=2",
      sex: "Female",
      age: 63,
      status: "Waiting",
    },
    {
      id: "3",
      name: "Phoenix Baker",
      username: "@phoenix",
      avatar: "https://i.pravatar.cc/150?img=3",
      sex: "Male",
      age: 39,
      status: "Cancelled",
    },
    {
      id: "4",
      name: "Lana Steiner",
      username: "@lana",
      avatar: "https://i.pravatar.cc/150?img=4",
      sex: "Male",
      age: 36,
      status: "Cancelled",
    },
    {
      id: "5",
      name: "Simon Cyna",
      username: "@simon",
      avatar: "https://i.pravatar.cc/150?img=2",
      sex: "Male",
      age: 60,
      status: "Waiting",
    },
    {
      id: "6",
      name: "Dave Rhio",
      username: "@dave",
      avatar: "https://i.pravatar.cc/150?img=2",
      sex: "Male",
      age: 42,
      status: "Cancelled",
    },
    {
      id: "7",
      name: "Alina Cara",
      username: "@diva",
      avatar: "https://i.pravatar.cc/150?img=2",
      sex: "Female",
      age: 39,
      status: "Finished",
    },
  ];

  const [selectAll, setSelectAll] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedPatients = useMemo(() => {
    let sortableItems = [
      ...(patientsData.length ? patientsData : defaultPatientsData),
    ];
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
    const { bgColor, textColor, dotColor } = statusStyles[status] || {};
    return (
      <div
        className={`flex items-center px-4 text-sm h-fit py-1 rounded-full ${bgColor} ${textColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${dotColor} mr-2`} />
        {status}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-8 items-center">
          <h2 className="text-lg font-semibold">Patients List</h2>
          <span className="text-sm text-teal-400 bg-teal-100 rounded-full px-3 py-1 ">
            {totalPatients} users
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Table */}
      <div>
        {/* Table Header */}
        <div className="grid grid-cols-5 px-4 py-3 bg-gray-50 border-b">
          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              className="w-4 h-4 mr-3"
            />
            Patients name
          </div>
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
                checked={selectedPatients.includes(patient.id)}
                onChange={() =>
                  setSelectedPatients((prev) =>
                    prev.includes(patient.id)
                      ? prev.filter((id) => id !== patient.id)
                      : [...prev, patient.id]
                  )
                }
                className="w-4 h-4 mr-3"
              />
              <img
                src={patient.avatar}
                alt=""
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <p>{patient.name}</p>
                <p className="text-sm text-gray-500">{patient.username}</p>
              </div>
            </div>
            <div>{patient.sex}</div>
            <div>{patient.age}</div>
            <StatusBadge status={patient.status} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {/* Pagination */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
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
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PatientsList;
