import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

const MedicalDashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="">
        <DoctorAppointmentChart />
      </div>

      <PatientList />

      <UpcomingAppointments />
    </div>
  );
};

// Doctor Appointment Chart Component
const DoctorAppointmentChart = () => {
  // Data for the stacked bar chart
  const chartData = [
    { month: "Jan", series1: 300, series2: 200, series3: 300 },
    { month: "Feb", series1: 350, series2: 250, series3: 400 },
    { month: "Mar", series1: 200, series2: 150, series3: 250 },
    { month: "Apr", series1: 300, series2: 250, series3: 350 },
    { month: "May", series1: 350, series2: 300, series3: 300 },
    { month: "Jun", series1: 350, series2: 250, series3: 300 },
    { month: "Jul", series1: 400, series2: 350, series3: 250 },
    { month: "Aug", series1: 300, series2: 250, series3: 200 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Doctor Appointment</h2>
        <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1">
          <span className="text-sm">Month</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="mb-4">
        <div className="inline-block bg-teal-50 rounded-md px-3 py-2">
          <span className="text-sm text-gray-700">September</span>
          <span className="text-sm font-semibold text-gray-800 ml-1">20k</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
          <span className="text-xs text-gray-500">Series 1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-300"></div>
          <span className="text-xs text-gray-500">Series 2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-200"></div>
          <span className="text-xs text-gray-500">Series 3</span>
        </div>
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute -left-0 top-0 text-xs text-gray-500">1000</div>
        <div className="absolute left-2 top-8 text-xs text-gray-500">800</div>
        <div className="absolute left-2 top-16 text-xs text-gray-500">600</div>
        <div className="absolute left-2 top-24 text-xs text-gray-500">400</div>
        <div className="absolute left-2 top-32 text-xs text-gray-500">200</div>
        <div className="absolute left-4 top-40 text-xs text-gray-500">0</div>

        {/* Y-axis title */}
        <div className="absolute -left-12 top-24 transform -rotate-90 text-xs text-gray-500 whitespace-nowrap">
          Active doctor
        </div>

        {/* Chart content */}
        <div className="flex items-end justify-between h-48 pl-16 gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-8 flex flex-col-reverse">
                <div
                  className="bg-teal-500 w-full"
                  style={{ height: `${data.series1 / 10}px` }}
                ></div>
                <div
                  className="bg-teal-300 w-full"
                  style={{ height: `${data.series2 / 10}px` }}
                ></div>
                <div
                  className="bg-teal-100 w-full"
                  style={{ height: `${data.series3 / 10}px` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{data.month}</div>
            </div>
          ))}
        </div>

        {/* X-axis label */}
        <div className="text-xs text-gray-500 text-center mt-8">Month</div>
      </div>
    </div>
  );
};

// Lab Appointments Card Component
const LabAppointmentsCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Lab Appointment</h2>
        <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1">
          <span className="text-sm">Month</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex justify-center py-4">
        <div className="relative w-48 h-48">
          {/* Circular multi-ring progress chart */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Outer background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#E6F7F5"
              strokeWidth="8"
            />

            {/* Middle background ring */}
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="#E6F7F5"
              strokeWidth="8"
            />

            {/* Inner background ring */}
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="none"
              stroke="#E6F7F5"
              strokeWidth="8"
            />

            {/* Outer progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#5BBFB5"
              strokeWidth="8"
              strokeDasharray="264"
              strokeDashoffset="70"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />

            {/* Middle progress ring */}
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="#5BBFB5"
              strokeWidth="8"
              strokeDasharray="201"
              strokeDashoffset="100"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />

            {/* Inner progress ring */}
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="none"
              stroke="#5BBFB5"
              strokeWidth="8"
              strokeDasharray="138"
              strokeDashoffset="50"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-600">Appointment</div>
            <div className="text-3xl font-bold">2,350</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
          <span className="text-xs text-gray-600">12 Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-700"></div>
          <span className="text-xs text-gray-600">Series 2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-300"></div>
          <span className="text-xs text-gray-600">60 Completed</span>
        </div>
      </div>
    </div>
  );
};

// Patient List Component
const PatientList = () => {
  const [selectedPatients, setSelectedPatients] = useState([]);

  const patients = [
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
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
                  checked={selectedPatients.length === patients.length}
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
            {patients.map((patient) => (
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

// Clock component for upcoming appointments
const Clock = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ChevronDown component
const ChevronDown = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Upcoming Appointments Component
const UpcomingAppointments = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Ratul Ahamed",
      specialty: "Dental Specialist",
      avatar: "/api/placeholder/40/40",
      date: "27 Oct 2021",
      time: "11:00 - 12:00 AM",
    },
    {
      id: 2,
      name: "Dr. Anas Toman",
      specialty: "Dental Specialist",
      avatar: "/api/placeholder/40/40",
      date: "27 Oct 2021",
      time: "11:00 - 12:00 AM",
    },
    {
      id: 3,
      name: "Dr. Nur Hasan",
      specialty: "Dental Specialist",
      avatar: "/api/placeholder/40/40",
      date: "27 Oct 2021",
      time: "11:00 - 12:00 AM",
    },
    {
      id: 4,
      name: "Dr. Jane Doe",
      specialty: "Dental Specialist",
      avatar: "/api/placeholder/40/40",
      date: "27 Oct 2021",
      time: "11:00 - 12:00 AM",
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nadchodzące Wizyty</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-gray-500">{doctor.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar size={16} className="mr-2 text-teal-500" />
                {doctor.date}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock size={16} className="mr-2 text-teal-500" />
                {doctor.time}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-teal-50 text-teal-600 py-2 rounded-md text-sm font-medium">
                Anuluj wizytę
              </button>
              <button className="flex-1 bg-teal-50 text-teal-600 py-2 rounded-md text-sm font-medium flex items-center justify-center">
                <Calendar size={16} className="mr-2" />
                Zmień termin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalDashboard;
