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
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const response = await apiCaller(
          "GET",
          `/appointments/patient/${user.id}`
        );

        if (response && response.data && response.data.data) {
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
      case "booked":
        return {
          bg: "bg-teal-100",
          text: "text-teal-700",
          dot: "text-teal-500",
        };
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          dot: "text-green-500",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          dot: "text-red-500",
        };
      case "no-show":
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
    const booked = appointments.filter((app) => app.status === "booked").length;
    const completed = appointments.filter(
      (app) => app.status === "completed"
    ).length;
    const cancelled = appointments.filter(
      (app) => app.status === "cancelled"
    ).length;
    const noShow = appointments.filter(
      (app) => app.status === "no-show"
    ).length;

    return { booked, completed, cancelled, noShow, total: appointments.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 px-6 flex justify-center relative top-[20%]">
        <div className="w-full max-w-6xl">
          <div className="flex items-center mb-6">
            <button className="text-teal-600 mr-2 flex items-center">
              <FaChevronLeft size={14} className="mr-1" /> Back
            </button>
            <h1 className="text-2xl font-medium text-gray-800">
              My Appointments
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
      <div className="min-h-screen bg-gray-50 pt-16 px-6 flex justify-center  top-[20%]">
        <div className="w-full max-w-6xl">
          <div className="flex items-center mb-6">
            <button className="text-teal-600 mr-2 flex items-center">
              <FaChevronLeft size={14} className="mr-1" /> Back
            </button>
            <h1 className="text-2xl font-medium text-gray-800">
              My Appointments
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
    <div className="min-h-screen bg-gray-50 pt-16 px-6 flex justify-center pb-12  mt-6">
      <div className="w-full max-w-6xl">
        <div className="flex items-center mb-6">
          <button className="text-teal-600 mr-2 flex items-center">
            <FaChevronLeft size={14} className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-medium text-gray-800">
            My Appointments
          </h1>
        </div>

        {appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-500">
              <div className="text-sm text-gray-500 mb-1">
                Total Appointments
              </div>
              <div className="text-2xl font-medium">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 mb-1">Upcoming</div>
              <div className="text-2xl font-medium">{stats.booked}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-500 mb-1">Completed</div>
              <div className="text-2xl font-medium">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <div className="text-sm text-gray-500 mb-1">Cancelled</div>
              <div className="text-2xl font-medium">{stats.cancelled}</div>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-7xl text-teal-200 flex justify-center mb-4">
              <FaCalendarAlt />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't booked any appointments yet.
            </p>
            <a
              href="/user/doctors"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-teal-700 transition duration-300"
            >
              Book an Appointment
            </a>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                All Appointments
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
                <button className="bg-white border border-gray-300 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr
                      key={appointment._id}
                      className={`border-t border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium mr-3">
                            {appointment.doctor.name.first.charAt(0)}
                            {appointment.doctor.name.last.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              Dr. {appointment.doctor.name.first}{" "}
                              {appointment.doctor.name.last}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor.department ||
                                "Medical Doctor"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">
                          {formatAppointmentDate(appointment.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {appointment.mode === "online" ? (
                            <span className="flex items-center text-blue-600">
                              <FaVideo className="mr-1" /> Online
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-600">
                              <FaMapMarkerAlt className="mr-1" /> In-person
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(appointment.status).bg
                          } ${getStatusColor(appointment.status).text}`}
                        >
                          <FaCircle
                            className={`${
                              getStatusColor(appointment.status).dot
                            } mr-1.5 text-xs`}
                          />
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="text-teal-600 hover:text-teal-800 p-1"
                          >
                            View
                          </button>

                          {appointment.status === "booked" && (
                            <>
                              {appointment.mode === "online" &&
                                appointment.joining_link && (
                                  <a
                                    href={appointment.joining_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                  >
                                    Join
                                  </a>
                                )}
                              <button
                                onClick={() =>
                                  handleCancelAppointment(appointment._id)
                                }
                                className="text-red-600 hover:text-red-800 p-1"
                                disabled={cancellationLoading}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Appointment Details Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 rounded-full bg-teal-100 items-center justify-center mr-3">
                    <FaCalendarAlt className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Appointment Details
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-teal-50 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-teal-600 font-medium">
                      Appointment with
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
                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Appointment Information
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaCalendarAlt className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
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
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.startTime} -{" "}
                            {selectedAppointment.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          {selectedAppointment.mode === "online" ? (
                            <FaVideo className="text-blue-600" />
                          ) : (
                            <FaMapMarkerAlt className="text-teal-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Mode</div>
                          <div
                            className={`font-medium ${
                              selectedAppointment.mode === "online"
                                ? "text-blue-600"
                                : "text-gray-800"
                            }`}
                          >
                            {selectedAppointment.mode.charAt(0).toUpperCase() +
                              selectedAppointment.mode.slice(1)}{" "}
                            Appointment
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Additional Information
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                          <FaUser className="text-teal-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Patient</div>
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
                            Department
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
                          <div className="text-xs text-gray-500">Notes</div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.notes || "No notes available"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAppointment.status === "booked" &&
                  selectedAppointment.mode === "online" && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-blue-700 font-medium mb-1">
                            Online Meeting Information
                          </h4>
                          <p className="text-sm text-blue-600">
                            Your virtual appointment is scheduled. Click the
                            button to join when it's time.
                          </p>
                        </div>
                        {selectedAppointment.joining_link && (
                          <a
                            href={selectedAppointment.joining_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
                          >
                            <span className="mr-2">Join Meeting</span>
                            <FaExternalLinkAlt size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  {selectedAppointment.status === "booked" && (
                    <button
                      onClick={() =>
                        handleCancelAppointment(selectedAppointment._id)
                      }
                      className="border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition duration-300"
                      disabled={cancellationLoading}
                    >
                      {cancellationLoading
                        ? "Cancelling..."
                        : "Cancel Appointment"}
                    </button>
                  )}

                  <button
                    onClick={handleCloseModal}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-300"
                  >
                    Close
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
