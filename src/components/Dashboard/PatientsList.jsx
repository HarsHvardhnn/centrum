import React, { useState } from "react";
import {
  MoreVertical,
  ArrowDown,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PatientList = ({ patients }) => {
  const [selectedPatients, setSelectedPatients] = useState([]);

  const toggleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((p) => p.id));
    }
  };

  const toggleSelectPatient = (id) => {
    if (selectedPatients.includes(id)) {
      setSelectedPatients(selectedPatients.filter((pId) => pId !== id));
    } else {
      setSelectedPatients([...selectedPatients, id]);
    }
  };

  // Sample data based on the image
  const samplePatients = [
    {
      id: 1,
      name: "Olivia Rhye",
      username: "@olivia",
      patientId: "#85736733",
      phone: "1241478523",
      lastVisit: "14-02-2025",
      doctor: "Dr. Ratul Ahamed",
      dob: "14-02-2025",
    },
    {
      id: 2,
      name: "Phoenix Baker",
      username: "@phoenix",
      patientId: "#85736733",
      phone: "1241478523",
      lastVisit: "19-02-2025",
      doctor: "Dr. Ratul Ahamed",
      dob: "19-02-2025",
    },
    {
      id: 3,
      name: "Lana Steiner",
      username: "@lana",
      patientId: "#85736733",
      phone: "1241478523",
      lastVisit: "14-03-2025",
      doctor: "Dr. Ratul Ahamed",
      dob: "14-03-2025",
    },
    {
      id: 4,
      name: "Demi Wilkinson",
      username: "@demi",
      patientId: "#85736733",
      phone: "1241478523",
      lastVisit: "17-03-2025",
      doctor: "Dr. Ratul Ahamed",
      dob: "17-03-2025",
    },
  ];

  // Use the sample data if no patients are provided as props
  const displayedPatients = patients || samplePatients;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Lista pacjentów</h2>
          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
            363 member
          </span>
        </div>
        <button>
          <MoreVertical size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedPatients.length === displayedPatients.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Imię i Nazwisko Pacjenta
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                ID Pacjenta
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 flex items-center">
                Numer telefonu <ArrowDown size={14} className="ml-1" />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Ostatnia wizyta
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Lekarz prowadzący
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Data urodzenia
              </th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {displayedPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => toggleSelectPatient(patient.id)}
                  />
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.username}
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{patient.patientId}</td>
                <td className="py-4 px-4 text-gray-600">{patient.phone}</td>
                <td className="py-4 px-4 text-gray-600">{patient.lastVisit}</td>
                <td className="py-4 px-4 text-gray-600">{patient.doctor}</td>
                <td className="py-4 px-4 text-gray-600">{patient.dob}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button className="text-gray-500">
                      <Trash2 size={16} />
                    </button>
                    <button className="text-gray-500">
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex items-center justify-between border-t border-gray-200">
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-md px-3 py-1">
          <ChevronLeft size={16} />
          <span>Poprzednia</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-50 text-teal-700 font-medium">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600">
            3
          </button>
          <span className="text-gray-500">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600">
            8
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600">
            9
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600">
            10
          </button>
        </div>

        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-md px-3 py-1">
          <span>Następna</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PatientList;
