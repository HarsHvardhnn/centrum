// PatientDropDown.jsx
import React from "react";

const PatientDropdown = ({
  isOpen,
  onClose,
  onSelect,
  patients,
  loading,
  pagination,
  onLoadMore,
}) => {
  if (!isOpen) return null;

  const translateSexToPolish = (sex) => {
    switch (sex) {
      case "Male":
        return "Mężczyzna";
      case "Female":
        return "Kobieta";
      case "Others":
        return "Inna";
      default:
        return "Nieznany";
    }
  };
  
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <div className="flex items-center">
          <h3 className="font-medium">Lista pacjentów</h3>
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full ml-2">
            {pagination ? pagination.totalPatients : patients.length} Pacjent
            {(pagination?.totalPatients !== 1 || patients.length !== 1) && "ów"}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {loading && patients.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          Wczytywanie pacjentów...
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          Nie znaleziono pacjentów
        </div>
      )}

      {patients.length > 0 && (
        <div className="divide-y divide-gray-100">
          {/* Header row */}
          <div className="flex items-center px-4 py-2 bg-gray-50 text-sm font-medium text-gray-500">
            <div className="w-6 mr-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
            <div className="w-1/3">Imię i nazwisko</div>
            <div className="w-1/4">ID Pacjenta</div>
            <div className="w-1/6">Płeć</div>
            <div className="w-1/6 flex items-center">
              Wiek
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="w-1/6"></div>
          </div>

          {/* Patient rows */}
          {patients.map((patient, index) => (
            <div
              key={`${patient.id}-${index}`}
              className="flex items-center px-4 py-3"
            >
              <div className="w-6 mr-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
              <div className="w-1/3 flex items-center">
                {patient.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/avatars/default.png"; // Fallback image
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="text-gray-600">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.username}
                  </div>
                </div>
              </div>
              <div className="w-1/4">{patient.id}</div>
              <div className="w-1/6">{translateSexToPolish(patient.sex)}</div>
              <div className="w-1/6">{patient.age}</div>
              <div className="w-1/6 text-right">
                <button
                  onClick={() => onSelect(patient)}
                  className="px-4 py-1.5 rounded-md bg-teal-100 text-teal-700 hover:bg-teal-200 text-sm"
                >
                  Wybierz
                </button>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {pagination && pagination.currentPage < pagination.totalPages && (
            <div className="px-4 py-3 text-center">
              <button
                onClick={onLoadMore}
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                Wczytaj więcej pacjentów
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDropdown;
