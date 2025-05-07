import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import appointmentHelper from "../../helpers/appointmentHelper";
import { toast } from "sonner";
import { useLoader } from "../../context/LoaderContext";
import { useUser } from "../../context/userContext";
import CheckInModal from "../admin/CheckinModal";
import { useNavigate } from "react-router-dom";

function LabAppointmentsContent({ clinic }) {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser();
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();
  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const fetchAppointments = async (page = 1) => {
    try {
      showLoader();
      const filters = {
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(user?.role === "doctor" && { doctorId: user?.id })
      };

      const response = await appointmentHelper.getAllAppointments(
        page,
        10,
        searchQuery,
        filters
      );

      if (response.success) {
        setAppointments(response.data);
        setPagination(response.pagination);
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchQuery, statusFilter, dateRange, user?.id]);

  // Filter appointments based on search query and status filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = searchQuery
        ? appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (appointment.patient.disease || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus =
        statusFilter === "All" || appointment.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex w-full justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {clinic ? "Clinic Appointments" : "Lab Appointments"}
            </h1>
            <p className="text-gray-600 mb-4">
              Showing: All Appointments
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 w-[50%]">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                className="py-2 pl-4 pr-10 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-gray-700"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} />
                Filter
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg z-10 min-w-[200px]">
                  <div className="p-2">
                    <h3 className="font-medium px-3 py-2">Filter by Status</h3>
                    <div className="space-y-2 px-3 py-1">
                      {["All", "Booked", "Cancelled", "Completed"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={statusFilter === status}
                            onChange={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                            }}
                            className="rounded-full"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>

                    <div className="border-t mt-2 pt-2">
                      <h3 className="font-medium px-3 py-2">Date Range</h3>
                      <div className="space-y-2 px-3 py-1">
                        <div>
                          <label className="text-sm text-gray-600">Start Date</label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.startDate || ""}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              startDate: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">End Date</label>
                          <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded"
                            value={dateRange.endDate || ""}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              endDate: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Appointment Button */}
            {user?.role !== "doctor" && !clinic && (
              <button
                className="bg-teal-500 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                onClick={() => navigate("/appointments/new")}
              >
                <Calendar size={18} />
                New Appointment
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Disease</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                        <img
                          src={appointment.patient.profilePicture || "/assets/images/default-avatar.png"}
                          alt={appointment.patient.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{appointment.patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient.patientId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.mode === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {appointment.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {appointment.patient.disease || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {appointment.doctor?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                {
                  !appointment.checkIn  &&   <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowCheckin(true);
                    }}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    Check In
                  </button>
                </td>
                }
                 <td className="px-4 py-3 cursor-pointer">
                  <button
                    onClick={() => {
                      navigate(`/patients-details/${appointment.patient.id}?appointmentId=${appointment.id}`);
                      // setShowCheckin(true);
                    }}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    View Details
                  </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => fetchAppointments(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchAppointments(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Check-in Modal */}
        <CheckInModal
          isOpen={showCheckin}
          setIsOpen={setShowCheckin}
          patientData={selectedAppointment?.patient || {}}
          clinic={clinic}
          appointmentId={selectedAppointment?.id}
        />
      </div>
    </div>
  );
}

function LabAppointments({ clinic }) {
  return <LabAppointmentsContent clinic={clinic} />;
}

export default LabAppointments;
