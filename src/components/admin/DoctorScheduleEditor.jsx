import React, { useState, useEffect } from "react";
import doctorService from "../../helpers/doctorHelper";
import adminHelper from "../../helpers/adminHelper";
import { useLoader } from "../../context/LoaderContext";

const DoctorScheduleManager = ({ isModal = false, doctorId, onClose }) => {
  const [weeklyShifts, setWeeklyShifts] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Form states for adding weekly shifts
  const [newShift, setNewShift] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "17:00",
  });

  // Days of week array for dropdown
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Load doctor's schedule data
  useEffect(() => {
    fetchDoctorSchedule();
  }, [doctorId]);

  const fetchDoctorSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();

      let shiftsResponse;
      if (doctorId) {
        // Doctor viewing their own schedule
        shiftsResponse = await doctorService.getDoctorWeeklyShifts(doctorId);
      }

      if (shiftsResponse.data?.success) {
        setWeeklyShifts(shiftsResponse.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctor schedule:", err);
      setError("Failed to load schedule data. Please try again.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Handle weekly shift form changes
  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setNewShift((prev) => ({ ...prev, [name]: value }));
  };

  // Add weekly shift
  const handleAddShift = async (e) => {
    e.preventDefault();

    try {
      showLoader();
      // Check if shift for this day already exists
      const existingShiftIndex = weeklyShifts.findIndex(
        (shift) => shift.dayOfWeek === newShift.dayOfWeek
      );

      let updatedShifts;

      if (existingShiftIndex >= 0) {
        // Update existing shift
        updatedShifts = [...weeklyShifts];
        updatedShifts[existingShiftIndex] = newShift;
      } else {
        // Add new shift
        updatedShifts = [...weeklyShifts, newShift];
      }

      let response=null;
      if (doctorId) {
        // Admin updating a doctor's schedule
        response = await doctorService.updateDoctorWeeklyShifts(
          updatedShifts,
          doctorId
        );

      }

      if (response) {
        fetchDoctorSchedule()
        setWeeklyShifts(updatedShifts);
        setSuccess(`Schedule for ${newShift.dayOfWeek} updated successfully`);
        // Reset form to default values
        setNewShift({
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "17:00",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error adding weekly shift:", err);
      setError("Failed to add weekly shift. Please try again.");
    } finally {
      hideLoader();
    }
  };

  // Delete weekly shift
  const handleDeleteShift = async (dayOfWeek) => {
    try {
      showLoader();
      const updatedShifts = weeklyShifts.filter(
        (shift) => shift.dayOfWeek !== dayOfWeek
      );

      let response=null;
      if (doctorId) {
        // Admin updating a doctor's schedule
        response = await doctorService.updateDoctorWeeklyShifts(updatedShifts,doctorId);
      }
      if (response) {
        setWeeklyShifts(updatedShifts);
        setSuccess(`Schedule for ${dayOfWeek} removed successfully`);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error deleting weekly shift:", err);
      setError("Failed to delete weekly shift. Please try again.");
    } finally {
      hideLoader();
    }
  };

  const renderContent = () => (
    <div className={isModal ? "p-6" : "bg-white rounded-lg shadow-md p-6 mb-6"}>
      {!isModal && (
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {doctorId ? "Manage Doctor Schedule" : "Schedule Settings"}
        </h1>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">
          {doctorId ? "Doctor's Weekly Schedule" : "Your Weekly Schedule"}
        </h2>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : weeklyShifts.length === 0 ? (
          <p className="text-gray-500 italic py-2">
            No weekly shifts have been set.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                    Day of Week
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                    Start Time
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                    End Time
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {weeklyShifts.map((shift, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {shift.dayOfWeek}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {shift.startTime}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {shift.endTime}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleDeleteShift(shift.dayOfWeek)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Add or Update Shift</h3>
          <form onSubmit={handleAddShift} className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  name="dayOfWeek"
                  value={newShift.dayOfWeek}
                  onChange={handleShiftChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={newShift.startTime}
                  onChange={handleShiftChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={newShift.endTime}
                  onChange={handleShiftChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Save Shift
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl transform transition-all duration-300 border border-teal-100">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700">
              {doctorId ? "Manage Doctor Schedule" : "Schedule Settings"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {renderContent()}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex">
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleManager;
