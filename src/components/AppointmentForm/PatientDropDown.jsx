// src/components/AppointmentForm/PatientDropdown.jsx
const PatientDropdown = ({ isOpen, onClose, onSelect, patients }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center">
          <h3 className="font-medium text-sm">Patients List</h3>
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded ml-2">
            {patients.length} Patients
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                    <img src={patient.avatar} alt={patient.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{patient.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">{patient.sex}</td>
              <td className="px-3 py-2 whitespace-nowrap">{patient.age}</td>
              <td className="px-3 py-2 whitespace-nowrap text-right">
                <button
                  onClick={() => onSelect(patient)}
                  className="px-3 py-1 rounded bg-teal-100 text-teal-700 hover:bg-teal-200"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientDropdown;
