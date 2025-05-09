import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import patientService from "../../helpers/patientHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../../context/LoaderContext";

const MedicalDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
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
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [timeframe, setTimeframe] = useState("month");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [totalAppointments, setTotalAppointments] = useState(0);
  
  // Labels for the chart series
  const seriesLabels = {
    series1: "Zarezerwowane",
    series2: "Zakończone",
    series3: "Anulowane"
  };
  
  // Colors for the chart series
  const seriesColors = {
    series1: "bg-teal-500",
    series2: "bg-teal-300",
    series3: "bg-teal-100" 
  };
  
  // Month names in Polish
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];
  
  // Fetch doctors list on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        showLoader();
        const response = await doctorStatsHelper.getDoctorsList();
        
        if (response.success) {
          setDoctors(response.data);
          
          // If user is a doctor, set their own ID as the selected doctor
          if (user?.role === "doctor" && user?._id) {
            setSelectedDoctor(user._id);
          }
          // Otherwise set the first doctor as default if available
          else if (response.data && response.data.length > 0) {
            setSelectedDoctor(response.data[0]._id);
          }
        } else {
          setError("Nie udało się pobrać listy lekarzy");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Błąd podczas pobierania listy lekarzy");
      } finally {
        setLoading(false);
        hideLoader();
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Fetch statistics when selected doctor or timeframe changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchStatistics();
    }
  }, [selectedDoctor, timeframe]);
  
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const options = {
        doctorId: selectedDoctor,
        timeframe: timeframe
      };
      
      const response = await doctorStatsHelper.getDoctorStats(options);
      
      if (response.success) {
        // Format the statistics data for the chart using the data field
        const formattedData = formatChartData(response.data);
        setChartData(formattedData.chartData);
        setTotalAppointments(formattedData.total);
        setError(null);
      } else {
        setError("Nie udało się pobrać statystyk");
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Błąd podczas pobierania statystyk");
      setChartData([]);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };
  
  // Format data from API for the chart
  const formatChartData = (data) => {
    let total = 0;
    
    // Handle the new API response structure
    if (!data || !data.stats || !Array.isArray(data.stats)) {
      return { chartData: [], total: 0 };
    }
    
    const formattedData = data.stats.map(item => {
      // Get period from datePeriod (format YYYY-MM or YYYY-MM-DD)
      const periodParts = item.datePeriod.split('-');
      let periodLabel;
      
      if (timeframe === 'month' && periodParts.length >= 2) {
        // For monthly data, use month name (use month index which is zero-based)
        const monthIndex = parseInt(periodParts[1]) - 1;
        periodLabel = monthNames[monthIndex];
      } else {
        // For other timeframes, use the period as is
        periodLabel = item.datePeriod;
      }
      
      // Sum total appointments
      const appointments = item.appointments || {};
      const itemTotal = appointments.total || 0;
      total += itemTotal;
      
      // Map to our chart format
      return {
        label: periodLabel,
        series1: appointments.booked || 0,
        series2: appointments.completed || 0,
        series3: appointments.cancelled || 0
      };
    });
    
    return {
      chartData: formattedData,
      total: total
    };
  };
  
  // Get the current month name
  const getCurrentMonthName = () => {
    const date = new Date();
    return monthNames[date.getMonth()];
  };
  
  // Get display text for timeframe
  const getTimeframeDisplay = () => {
    switch(timeframe) {
      case 'day':
        return 'Dzień';
      case 'week':
        return 'Tydzień';
      case 'month':
        return 'Miesiąc';
      default:
        return 'Miesiąc';
    }
  };
  
  // Find selected doctor name
  const getSelectedDoctorName = () => {
    const doctor = doctors.find(d => d._id === selectedDoctor);
    return doctor ? doctor.name : "Wszyscy lekarze";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Wizyty lekarskie</h2>
        
        <div className="flex items-center gap-2">
          {/* Doctor selector - only visible if user is not a doctor */}
          {user?.role !== "doctor" ? (
            <div className="relative">
              <button 
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm">{getSelectedDoctorName()}</span>
                <ChevronDown size={16} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100">
                  <ul className="py-1 max-h-60 overflow-y-auto">
                    {doctors.map((doctor) => (
                      <li 
                        key={doctor._id}
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${selectedDoctor === doctor._id ? 'bg-teal-50 text-teal-700' : ''}`}
                        onClick={() => {
                          setSelectedDoctor(doctor._id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {doctor.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // For doctors, just display their name without dropdown
            <div className="border border-gray-200 rounded-md px-3 py-1">
              <span className="text-sm">{getSelectedDoctorName()}</span>
            </div>
          )}
          
          {/* Timeframe selector */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1"
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            >
              <span className="text-sm">{getTimeframeDisplay()}</span>
              <ChevronDown size={16} />
            </button>
            
            {isTimeframeOpen && (
              <div className="absolute z-10 right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-100">
                <ul className="py-1">
                  <li 
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${timeframe === 'day' ? 'bg-teal-50 text-teal-700' : ''}`}
                    onClick={() => {
                      setTimeframe('day');
                      setIsTimeframeOpen(false);
                    }}
                  >
                    Dzień
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${timeframe === 'week' ? 'bg-teal-50 text-teal-700' : ''}`}
                    onClick={() => {
                      setTimeframe('week');
                      setIsTimeframeOpen(false);
                    }}
                  >
                    Tydzień
                  </li>
                  <li 
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${timeframe === 'month' ? 'bg-teal-50 text-teal-700' : ''}`}
                    onClick={() => {
                      setTimeframe('month');
                      setIsTimeframeOpen(false);
                    }}
                  >
                    Miesiąc
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Refresh button */}
          <button 
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md"
            onClick={fetchStatistics}
            title="Odśwież"
          >
            <RefreshCcw size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="inline-block bg-teal-50 rounded-md px-3 py-2">
          <span className="text-sm text-gray-700">{getCurrentMonthName()}</span>
          <span className="text-sm font-semibold text-gray-800 ml-1">{totalAppointments}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
          <span className="text-xs text-gray-500">{seriesLabels.series1}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-300"></div>
          <span className="text-xs text-gray-500">{seriesLabels.series2}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-200"></div>
          <span className="text-xs text-gray-500">{seriesLabels.series3}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle size={32} className="text-red-500 mb-2" />
          <p className="text-gray-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-md text-sm"
            onClick={fetchStatistics}
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-600">Brak danych dla wybranego lekarza i okresu</p>
        </div>
      ) : totalAppointments === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-600">Brak wizyt dla wybranego lekarza i okresu</p>
          <p className="text-sm text-gray-500 mt-2">Wybrany lekarz nie ma jeszcze żadnych wizyt w tym okresie</p>
        </div>
      ) : (
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
            Liczba wizyt
          </div>

          {/* Chart content */}
          <div className="flex items-end justify-between h-48 pl-16 gap-2">
            {chartData.map((data, index) => {
              const maxValue = Math.max(data.series1, data.series2, data.series3);
              const scale = maxValue > 0 ? 1000 / maxValue : 1;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-8 flex flex-col-reverse">
                    <div
                      className="bg-teal-500 w-full"
                      style={{ height: `${(data.series1 * scale) / 10}px` }}
                      title={`${seriesLabels.series1}: ${data.series1}`}
                    ></div>
                    <div
                      className="bg-teal-300 w-full"
                      style={{ height: `${(data.series2 * scale) / 10}px` }}
                      title={`${seriesLabels.series2}: ${data.series2}`}
                    ></div>
                    <div
                      className="bg-teal-100 w-full"
                      style={{ height: `${(data.series3 * scale) / 10}px` }}
                      title={`${seriesLabels.series3}: ${data.series3}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.label}</div>
                </div>
              );
            })}
          </div>

          {/* X-axis label */}
          <div className="text-xs text-gray-500 text-center mt-8">
            {timeframe === 'day' ? 'Dzień' : timeframe === 'week' ? 'Tydzień' : 'Miesiąc'}
          </div>
        </div>
      )}
    </div>
  );
};

// Lab Appointments Card Component
const LabAppointmentsCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Wizyty laboratoryjne</h2>
        <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1">
          <span className="text-sm">Miesiąc</span>
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
  const { user } = useUser();
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    pages: 1,
  });

  const navigate = useNavigate();

  // Fetch patients on component mount and when page changes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Prepare parameters for the API call
        const params = {
          page: pagination.currentPage,
          limit: 10,
        };
        
        // If user is a doctor, include their doctor ID to filter patients
        if (user?.role === "doctor" && user?.id) {
          params.doctor = user.id;
        }
        
        const response = await patientService.getSimpliefiedPatientsList(params);

        setPatients(response.patients);
        setPagination({
          currentPage: response.currentPage,
          total: response.total,
          pages: response.pages,
        });
        setError(null);
      } catch (err) {
        setError("Failed to load patients. Please try again later.");
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [pagination.currentPage, user]);

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

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, currentPage: newPage });
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    // Current page is always shown
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxButtons / 2)
    );
    let endPage = Math.min(pagination.pages, startPage + maxButtons - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${
            i === pagination.currentPage
              ? "bg-teal-50 text-teal-700 font-medium"
              : "text-gray-600"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Lista pacjentów</h2>
          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
            {pagination.total} member{pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
        <button>
          <MoreVertical size={20} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading patients...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : patients.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No patients found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selectedPatients.length === patients.length &&
                      patients.length > 0
                    }
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
                  Płeć <ArrowDown size={14} className="ml-1" />
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Wiek
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Lekarz prowadzący
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                  Data wizyty
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50" onClick={() => navigate(`/patients-details/${patient._id}`)}>
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => toggleSelectPatient(patient.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium">{patient.name || "N/A"}</div>
                    <div className="text-sm text-gray-500">
                      {patient.username || "N/A"}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.id || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.sex || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.age || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    {patient.status ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          patient.status === "in-treatment"
                            ? "bg-blue-100 text-blue-800"
                            : patient.status === "recovered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.doctor || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {patient.date || "N/A"}
                  </td>
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
      )}

      <div className="p-4 flex items-center justify-between border-t border-gray-200">
        <button
          className={`flex items-center gap-2 text-sm border border-gray-200 rounded-md px-3 py-1 ${
            pagination.currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 cursor-pointer"
          }`}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft size={16} />
          <span>Poprzednia</span>
        </button>

        <div className="flex items-center gap-2">
          {renderPaginationButtons()}
          {pagination.pages > 7 &&
            pagination.currentPage < pagination.pages - 3 && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600"
                  onClick={() => handlePageChange(pagination.pages)}
                >
                  {pagination.pages}
                </button>
              </>
            )}
        </div>

        <button
          className={`flex items-center gap-2 text-sm border border-gray-200 rounded-md px-3 py-1 ${
            pagination.currentPage === pagination.pages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 cursor-pointer"
          }`}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.pages}
        >
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
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 4,
    totalPages: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, [page, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Default filter object
      const filters = {};
      
      // If user is a doctor, include doctor ID filter
      if (user?.role === "doctor" && user?._id) {
        filters.doctorId = user._id;
      }
      
      const response = await appointmentHelper.getAppointmentsDashboard(
        page,
        pagination.limit,
        "",
        filters,
        "date",
        "asc"
      );

      setAppointments(response.data);
      setPagination(response.pagination);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Failed to load appointments. Please try again later.");
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentHelper.cancelAppointment(
        appointmentId,
        "Canceled by user"
      );
      // Refresh appointments after cancellation
      fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setError("Failed to cancel appointment. Please try again.");
    }
  };

  const handleRescheduleAppointment = async (appointmentId) => {
    // This would typically open a modal or navigate to a reschedule page
    // For now, we'll just console log the action
    console.log("Reschedule appointment:", appointmentId);
    // You could implement navigation like:
    // navigate(`/appointments/${appointmentId}/reschedule`);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nadchodzące Wizyty</h2>
        <div className="flex gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200"
            onClick={handlePrevPage}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200"
            onClick={handleNextPage}
            disabled={page >= pagination.totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">No upcoming appointments found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img
                    src={appointment.avatar}
                    alt={appointment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{appointment.name}</h3>
                  <p className="text-sm text-gray-500">
                    {appointment.specialty}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar size={16} className="mr-2 text-teal-500" />
                  {appointment.date}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock size={16} className="mr-2 text-teal-500" />
                  {appointment.time}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 bg-teal-50 text-teal-600 py-2 rounded-md text-sm font-medium"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Anuluj wizytę
                </button>
                <button
                  className="flex-1 bg-teal-50 text-teal-600 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                  onClick={() => handleRescheduleAppointment(appointment.id)}
                >
                  <Calendar size={16} className="mr-2" />
                  Zmień termin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default MedicalDashboard;
