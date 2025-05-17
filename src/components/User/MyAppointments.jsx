import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaUser,
  FaHospital,
  FaNotesMedical,
  FaTimes,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaCircle,
  FaCheck,
  FaExclamation,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { useUser } from "../../context/userContext";
import { apiCaller } from "../../utils/axiosInstance";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchAppointments = async () => {
      console.log("user", user);
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const response = await apiCaller(
          "GET",
          `/appointments/patient/${user.id}`
        );

        if (response && response.data && response.data.data) {
          console.log("response", response);
          setAppointments(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load your appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellationLoading(true);
      await apiCaller("PATCH", `/appointments/${appointmentId}/cancel`, {
        status: "cancelled",
      });

      // Update local state to reflect cancellation
      setAppointments(
        appointments.map((app) =>
          app._id === appointmentId ? { ...app, status: "cancelled" } : app
        )
      );

      // Close the modal if it was open
      if (showModal && selectedAppointment?._id === appointmentId) {
        handleCloseModal();
      }

      alert("Appointment cancelled successfully");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again later.");
    } finally {
      setCancellationLoading(false);
    }
  };

  // Format date for display
  const formatAppointmentDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "zarezerwowana":
        return {
          bg: "bg-teal-100",
          text: "text-teal-700",
          dot: "text-teal-500",
        };
      case "zakończona":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          dot: "text-green-500",
        };
      case "anulowana":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          dot: "text-red-500",
        };
      case "nieobecność":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          dot: "text-yellow-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          dot: "text-gray-500",
        };
    }
  };

  // Calculate stats
  const calculateStats = () => {
    const zarezerwowane = appointments.filter((app) => app.status === "zarezerwowana").length;
    const zakonczone = appointments.filter((app) => app.status === "zakończona").length;
    const anulowane = appointments.filter((app) => app.status === "anulowana").length;
    const nieobecnosci = appointments.filter((app) => app.status === "nieobecność").length;

    return { 
      zarezerwowane, 
      zakonczone, 
      anulowane, 
      nieobecnosci, 
      total: appointments.length 
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button className="text-teal-600 mr-2 flex items-center hover:text-teal-700 transition-colors">
              <FaChevronLeft size={14} className="mr-1" /> Powrót
            </button>
            <h1 className="text-2xl font-medium text-gray-800">
              Moje wizyty
            </h1>
          </div>

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
          <div className="flex items-center mb-6">
            <button className="text-teal-600 mr-2 flex items-center hover:text-teal-700 transition-colors">
              <FaChevronLeft size={14} className="mr-1" /> Powrót
            </button>
            <h1 className="text-2xl font-medium text-gray-800">
              Moje wizyty
            </h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 pb-12 pt-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button className="text-teal-600 mr-2 flex items-center hover:text-teal-700 transition-colors">
            <FaChevronLeft size={14} className="mr-1" /> Powrót
          </button>
          <h1 className="text-2xl font-medium text-gray-800">Moje wizyty</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Zarezerwowane wizyty</p>
                <h3 className="text-2xl font-semibold text-gray-800">{stats.zarezerwowane}</h3>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <FaCalendarAlt className="text-teal-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Zakończone wizyty</p>
                <h3 className="text-2xl font-semibold text-gray-800">{stats.zakonczone}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheck className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Anulowane wizyty</p>
                <h3 className="text-2xl font-semibold text-gray-800">{stats.anulowane}</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaTimes className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nieobecności</p>
                <h3 className="text-2xl font-semibold text-gray-800">{stats.nieobecnosci}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaExclamation className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Lista wizyt</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">Brak wizyt</p>
              <p className="text-gray-500">Nie masz jeszcze żadnych umówionych wizyt.</p>
            </div>
          ) : (
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
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAppointmentDate(appointment.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.doctor.name.first} {appointment.doctor.name.last}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.mode === "online" ? (
                            <span className="flex items-center text-blue-600">
                              <FaVideo className="mr-2" /> Wizyta online
                              {appointment.joining_link && (
                                <a
                                  href={appointment.joining_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs hover:bg-blue-200 transition-colors inline-flex items-center"
                                >
                                  <FaVideo className="mr-1" size={12} />
                                  Dołącz
                                </a>
                              )}
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-600">
                              <FaHospital className="mr-2" /> Wizyta w przychodni
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(appointment.status).bg
                          } ${getStatusColor(appointment.status).text}`}
                        >
                          <FaCircle
                            size={8}
                            className={`mr-1.5 ${
                              getStatusColor(appointment.status).dot
                            }`}
                          />
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="text-teal-600 hover:text-teal-700 mr-4 transition-colors"
                        >
                          Szczegóły
                        </button>
                        {appointment.status === "zarezerwowana" && (
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            disabled={cancellationLoading}
                          >
                            {cancellationLoading ? "Anulowanie..." : "Anuluj"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 rounded-full bg-teal-100 items-center justify-center mr-3">
                    <FaCalendarAlt className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Szczegóły wizyty
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-teal-50 rounded-xl p-6 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-teal-600 font-medium mb-1">
                      Wizyta z lekarzem
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      Dr. {selectedAppointment.doctor.name.first}{" "}
                      {selectedAppointment.doctor.name.last}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedAppointment.doctor.department ||
                        "Medical Doctor"}
                    </div>
                  </div>
                  <div
                    className={`text-center ${
                      getStatusColor(selectedAppointment.status).bg
                    } ${
                      getStatusColor(selectedAppointment.status).text
                    } px-4 py-2 rounded-lg`}
                  >
                    <div className="text-xs font-medium">Status</div>
                    <div className="font-medium">
                      {selectedAppointment.status.charAt(0).toUpperCase() +
                        selectedAppointment.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Informacje o wizycie
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaCalendarAlt className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Data</div>
                          <div className="font-medium text-gray-800">
                            {formatAppointmentDate(selectedAppointment.date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaClock className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Godzina</div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.startTime} -{" "}
                            {selectedAppointment.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          {selectedAppointment.type === "online" ? (
                            <FaVideo className="text-blue-600" />
                          ) : (
                            <FaMapMarkerAlt className="text-teal-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tryb</div>
                          <div
                            className={`font-medium ${
                              selectedAppointment.type === "online"
                                ? "text-blue-600"
                                : "text-gray-800"
                            }`}
                          >
                            {selectedAppointment.type === "online" ? "Wizyta online" : "Wizyta w przychodni"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Dodatkowe informacje
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaUser className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Pacjent</div>
                          <div className="font-medium text-gray-800">
                            {user?.name || "You"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaHospital className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Oddział
                          </div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.doctor.department ||
                              "General Practice"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaNotesMedical className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Notatki</div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.notes || "Brak notatek"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAppointment.status === "zarezerwowana" &&
                  selectedAppointment.type === "online" && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="text-blue-700 font-medium mb-1">
                            Informacje o wizycie online
                          </h4>
                          <p className="text-sm text-blue-600">
                            Twoja wizyta online jest zaplanowana. Kliknij przycisk, aby dołączyć, gdy nadejdzie czas.
                          </p>
                        </div>
                        {selectedAppointment.joining_link && (
                          <a
                            href={selectedAppointment.joining_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
                          >
                            <span className="mr-2">Dołącz do spotkania</span>
                            <FaExternalLinkAlt size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  {selectedAppointment.status === "zarezerwowana" && (
                    <button
                      onClick={() =>
                        handleCancelAppointment(selectedAppointment._id)
                      }
                      className="border border-red-200 bg-red-50 text-red-600 px-6 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      disabled={cancellationLoading}
                    >
                      {cancellationLoading
                        ? "Anulowanie..."
                        : "Anuluj wizytę"}
                    </button>
                  )}

                  <button
                    onClick={handleCloseModal}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
