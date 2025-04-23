import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import doctorService from '../../helpers/doctorHelper';

const DoctorScheduleSettings = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyShifts, setWeeklyShifts] = useState([]);
  const [offSchedule, setOffSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState("weeklyShifts");
  const [error, setError] = useState(null);

  // Form states for adding weekly shifts
  const [newShift, setNewShift] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "17:00",
  });

  // Form states for adding off time
  const [newOffTime, setNewOffTime] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    timeRanges: [
      {
        startTime: "12:00",
        endTime: "13:00",
      },
    ],
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
    const fetchDoctorSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shiftsResponse, offTimeResponse] = await Promise.all([
          doctorService.getDoctorWeeklyShifts(),
          doctorService.getDoctorOffSchedule(),
        ]);

        if (shiftsResponse.data.success) {
          setWeeklyShifts(shiftsResponse.data.data);
        }

        if (offTimeResponse.data.success) {
          setOffSchedule(offTimeResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching doctor schedule:", err);
        setError("Failed to load schedule data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorSchedule();
  }, []);

  // Handle weekly shift form changes
  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setNewShift((prev) => ({ ...prev, [name]: value }));
  };

  // Add weekly shift
  const handleAddShift = async (e) => {
    e.preventDefault();

    try {
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

      const response = await doctorService.updateDoctorWeeklyShifts(
        updatedShifts
      );

      if (response.data.success) {
        setWeeklyShifts(updatedShifts);
        // Reset form to default values
        setNewShift({
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "17:00",
        });
      }
    } catch (err) {
      console.error("Error adding weekly shift:", err);
      setError("Failed to add weekly shift. Please try again.");
    }
  };

  // Delete weekly shift
  const handleDeleteShift = async (dayOfWeek) => {
    try {
      const updatedShifts = weeklyShifts.filter(
        (shift) => shift.dayOfWeek !== dayOfWeek
      );

      const response = await doctorService.updateDoctorWeeklyShifts(
        updatedShifts
      );

      if (response.data.success) {
        setWeeklyShifts(updatedShifts);
      }
    } catch (err) {
      console.error("Error deleting weekly shift:", err);
      setError("Failed to delete weekly shift. Please try again.");
    }
  };

  // Handle off time form changes
  const handleOffTimeChange = (e) => {
    const { name, value } = e.target;
    setNewOffTime((prev) => ({ ...prev, [name]: value }));
  };

  // Handle time range changes in off time form
  const handleTimeRangeChange = (index, field, value) => {
    setNewOffTime((prev) => {
      const updatedTimeRanges = [...prev.timeRanges];
      updatedTimeRanges[index] = {
        ...updatedTimeRanges[index],
        [field]: value,
      };
      return {
        ...prev,
        timeRanges: updatedTimeRanges,
      };
    });
  };

  // Add time range in off time form
  const addTimeRange = () => {
    setNewOffTime((prev) => ({
      ...prev,
      timeRanges: [
        ...prev.timeRanges,
        { startTime: "12:00", endTime: "13:00" },
      ],
    }));
  };

  // Remove time range in off time form
  const removeTimeRange = (index) => {
    setNewOffTime((prev) => {
      const updatedTimeRanges = [...prev.timeRanges];
      updatedTimeRanges.splice(index, 1);
      return {
        ...prev,
        timeRanges: updatedTimeRanges,
      };
    });
  };

  // Add off time
  const handleAddOffTime = async (e) => {
    e.preventDefault();

    try {
      const response = await doctorService.addDoctorOffTime(newOffTime);

      if (response.data.success) {
        setOffSchedule(response.data.data);
        // Reset form to default values
        setNewOffTime({
          date: format(new Date(), "yyyy-MM-dd"),
          timeRanges: [
            {
              startTime: "12:00",
              endTime: "13:00",
            },
          ],
        });
      }
    } catch (err) {
      console.error("Error adding off time:", err);
      setError("Failed to add off time. Please try again.");
    }
  };

  // Delete off time
  const handleDeleteOffTime = async (date) => {
    try {
      const response = await doctorService.removeDoctorOffTime(date);

      if (response.data.success) {
        setOffSchedule(response.data.data);
      }
    } catch (err) {
      console.error("Error deleting off time:", err);
      setError("Failed to delete off time. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-teal-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span className="font-semibold">Centrum Medyczne</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">User: John Doe</span>
            <button className="bg-teal-600 px-3 py-1 rounded">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md p-4 mr-6 h-fit">
            <ul className="space-y-2">
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Dashboard</span>
              </li>
              <li className="py-2 px-4 rounded bg-blue-100 text-blue-600">
                <span>Doctor Appointment</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Lab Appointment</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Patients List</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Chat</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Billing</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Account</span>
              </li>
              <li className="py-2 px-4 rounded text-gray-500">
                <span>Settings</span>
              </li>
            </ul>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Schedule Settings
              </h1>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b mb-6">
                <ul className="flex flex-wrap -mb-px">
                  <li className="mr-2">
                    <button
                      onClick={() => setActiveTab("weeklyShifts")}
                      className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                        activeTab === "weeklyShifts"
                          ? "text-blue-600 border-blue-600"
                          : "border-transparent hover:text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      Weekly Shifts
                    </button>
                  </li>
                  <li className="mr-2">
                    <button
                      onClick={() => setActiveTab("offTime")}
                      className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                        activeTab === "offTime"
                          ? "text-blue-600 border-blue-600"
                          : "border-transparent hover:text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      Time Off
                    </button>
                  </li>
                </ul>
              </div>

              {/* Weekly Shifts Tab Content */}
              {activeTab === "weeklyShifts" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Your Weekly Schedule
                  </h2>

                  {loading ? (
                    <p>Loading shifts...</p>
                  ) : weeklyShifts.length === 0 ? (
                    <p className="text-gray-500 italic">
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
                                  onClick={() =>
                                    handleDeleteShift(shift.dayOfWeek)
                                  }
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
                    <h3 className="text-lg font-semibold mb-4">
                      Add or Update Shift
                    </h3>
                    <form
                      onSubmit={handleAddShift}
                      className="bg-gray-50 p-4 rounded"
                    >
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
                      <div className="mt-4">
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
              )}

              {/* Off Time Tab Content */}
              {activeTab === "offTime" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Your Time Off Schedule
                  </h2>

                  {loading ? (
                    <p>Loading time off schedule...</p>
                  ) : offSchedule.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No time off has been scheduled.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                              Date
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                              Time Ranges
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {offSchedule.map((offDay, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {format(new Date(offDay.date), "MMM dd, yyyy")}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {offDay.timeRanges.map((range, idx) => (
                                  <div key={idx} className="mb-1 last:mb-0">
                                    {range.startTime} - {range.endTime}
                                  </div>
                                ))}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <button
                                  onClick={() =>
                                    handleDeleteOffTime(offDay.date)
                                  }
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
                    <h3 className="text-lg font-semibold mb-4">Add Time Off</h3>
                    <form
                      onSubmit={handleAddOffTime}
                      className="bg-gray-50 p-4 rounded"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={newOffTime.date}
                          onChange={handleOffTimeChange}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Ranges
                        </label>

                        {newOffTime.timeRanges.map((range, index) => (
                          <div
                            key={index}
                            className="flex items-center mb-2 space-x-2"
                          >
                            <input
                              type="time"
                              value={range.startTime}
                              onChange={(e) =>
                                handleTimeRangeChange(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={range.endTime}
                              onChange={(e) =>
                                handleTimeRangeChange(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {newOffTime.timeRanges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTimeRange(index)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addTimeRange}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          + Add another time range
                        </button>
                      </div>

                      <div className="mt-4">
                        <button
                          type="submit"
                          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          Save Time Off
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleSettings;