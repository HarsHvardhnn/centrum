import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Activity,
  Package,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Video,
  Building,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import { format } from "date-fns";
import { useUser } from "../../context/userContext";
import { translateStatus } from "../../utils/statusHelper";

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return format(date, "dd MMM yyyy");
};

// Main component
export default function PatientMedicalDetails() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    medications: true,
    tests: true,
    consultation: true,
    documents: true,
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      //("user", user);
      if (!user || !user.id) return;
      try {
        const response = await apiCaller("GET", `/appointments/patient/${user.id}`);
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (err) {
        setError("błąd serwera");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const fetchMedicalDetails = async (appointmentId) => {
    try {
      setLoading(true);
      const response = await apiCaller("GET", `/patients/by-id/medical-details/${appointmentId}`);
      setMedicalData(response.data);
    } catch (error) {
      console.error("Error fetching medical details:", error);
      setError("błąd serwera");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSelect = async (appointment) => {
    setSelectedAppointment(appointment);
    await fetchMedicalDetails(appointment._id);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading && !selectedAppointment) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6 pb-12">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Moje wizyty i dokumentacja medyczna</h1>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Lista wizyt</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data i godzina
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lekarz
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ wizyty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr 
                    key={appointment._id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedAppointment?._id === appointment._id ? 'bg-teal-50' : ''
                    }`}
                    onClick={() => handleAppointmentSelect(appointment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {appointment.doctor.name.first} {appointment.doctor.name.last}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.mode === "online" ? (
                          <span className="flex items-center text-blue-600">
                            <Video className="mr-2" size={16} /> Wizyta online
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            <Building className="mr-2" size={16} /> Wizyta w przychodni
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {translateStatus(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentSelect(appointment);
                        }}
                        className="text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Zobacz szczegóły
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medical Details */}
        {selectedAppointment && medicalData && (
          <div className="space-y-6">
            {/* Medications Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("medications")}
              >
                <div className="flex items-center space-x-2">
                  <Package size={20} />
                  <h2 className="font-bold text-lg">Leki</h2>
                </div>
                {expandedSections.medications ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.medications && (
                <div className="p-4">
                  {medicalData.medications && medicalData.medications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-teal-50">
                          <tr>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Lek
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Dawkowanie
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Częstotliwość
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Data rozpoczęcia
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Data zakończenia
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {medicalData.medications.map((medication) => (
                            <tr key={medication._id} className="hover:bg-gray-50">
                              <td className="p-3 text-sm">{medication.name}</td>
                              <td className="p-3 text-sm">{medication.dosage}</td>
                              <td className="p-3 text-sm">
                                {medication.frequency}
                              </td>
                              <td className="p-3 text-sm">
                                {formatDate(medication.startDate)}
                              </td>
                              <td className="p-3 text-sm">
                                {formatDate(medication.endDate)}
                              </td>
                              <td className="p-3 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    medication.status === "Aktywny"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {translateStatus(medication.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Brak przepisanych leków
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tests Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("tests")}
              >
                <div className="flex items-center space-x-2">
                  <Activity size={20} />
                  <h2 className="font-bold text-lg">Wyniki badań</h2>
                </div>
                {expandedSections.tests ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.tests && (
                <div className="p-4">
                  {medicalData.tests && medicalData.tests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-teal-50">
                          <tr>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Nazwa badania
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Data
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Wyniki
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-teal-800">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {medicalData.tests.map((test) => (
                            <tr key={test._id} className="hover:bg-gray-50">
                              <td className="p-3 text-sm">{test.name}</td>
                              <td className="p-3 text-sm">
                                {formatDate(test.date)}
                              </td>
                              <td className="p-3 text-sm">{test.results}</td>
                              <td className="p-3 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    test.status === "Normal"
                                      ? "bg-green-100 text-green-800"
                                      : test.status === "Abnormal"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {translateStatus(test.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Brak wyników badań
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Consultation Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("consultation")}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <h2 className="font-bold text-lg">Szczegóły konsultacji</h2>
                </div>
                {expandedSections.consultation ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.consultation && medicalData.consultation && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-teal-800 mb-2">
                        Informacje o konsultacji
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-teal-700 font-medium w-32">
                            Typ:
                          </span>
                          <span>{medicalData.consultation.consultationType}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal-700 font-medium w-32">
                            Data:
                          </span>
                          <span>
                            {formatDate(medicalData.consultation.consultationDate)}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal-700 font-medium w-32">
                            Status:
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              medicalData.consultation.consultationStatus ===
                              "Completed"
                                ? "bg-green-100 text-green-800"
                                : medicalData.consultation.consultationStatus ===
                                  "Scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : medicalData.consultation.consultationStatus ===
                                  "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {translateStatus(medicalData.consultation.consultationStatus)}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-teal-800 mb-2">
                        Opis
                      </h3>
                      <p className="text-gray-700">
                        {medicalData.consultation.description ||
                          "Brak opisu"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg mt-4">
                    <div className="border-b border-gray-200">
                      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                        <li className="mr-2">
                          <a
                            href="#"
                            className="inline-block p-4 border-b-2 border-teal-600 text-teal-600 active"
                          >
                            Notatki z konsultacji
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-teal-700 mb-2">
                            Wywiad
                          </h4>
                          <p className="text-sm text-gray-700 mb-4">
                            {medicalData.consultation.interview ||
                              "Brak danych z wywiadu"}
                          </p>

                          <h4 className="font-medium text-teal-700 mb-2">
                            Badanie fizykalne
                          </h4>
                          <p className="text-sm text-gray-700">
                            {medicalData.consultation.physicalExamination ||
                              "Brak danych z badania"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-teal-700 mb-2">
                            Leczenie
                          </h4>
                          <p className="text-sm text-gray-700 mb-4">
                            {medicalData.consultation.treatment ||
                              "Brak danych o leczeniu"}
                          </p>

                          <h4 className="font-medium text-teal-700 mb-2">
                            Zalecenia
                          </h4>
                          <p className="text-sm text-gray-700">
                            {medicalData.consultation.recommendations ||
                              "Brak zaleceń"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Documents Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("documents")}
              >
                <div className="flex items-center space-x-2">
                  <FileText size={20} />
                  <h2 className="font-bold text-lg">Dokumenty medyczne</h2>
                </div>
                {expandedSections.documents ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections.documents && (
                <div className="p-4">
                  {medicalData.reports && medicalData.reports.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medicalData.reports.map((doc) => (
                        <div
                          key={doc._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center mb-2">
                            <FileText className="text-teal-600 mr-2" size={20} />
                            <h3 className="font-medium text-gray-800 truncate">
                              {doc.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {doc.type} • {doc.metadata?.size ? `${Math.round(doc.metadata.size / 1024)} KB` : ''}
                          </p>

                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-teal-600 hover:text-teal-800"
                          >
                            <Download size={16} className="mr-1" />
                            Pobierz
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Brak dokumentów
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
