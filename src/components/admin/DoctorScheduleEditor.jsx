import React, { useState, useEffect } from "react";
import doctorService from "../../helpers/doctorHelper";
import { useLoader } from "../../context/LoaderContext";
import { Calendar, Clock, Plus, Trash2, Edit, X, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const DoctorScheduleManager = ({ isModal = false, doctorId, onClose }) => {
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Schedule management states
  const [schedules, setSchedules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  // Form states for daily schedule
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeBlocks: [{ startTime: "09:00", endTime: "17:00", isActive: true }],
    notes: ""
  });

  // Form states for exceptions
  const [exceptionForm, setExceptionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "vacation",
    title: "",
    description: "",
    isFullDay: true,
    timeRanges: [{ startTime: "09:00", endTime: "17:00" }]
  });

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingException, setEditingException] = useState(null);

  // Exception types
  const exceptionTypes = [
    { value: "vacation", label: "Urlop" },
    { value: "holiday", label: "Święto" },
    { value: "sick_leave", label: "Zwolnienie lekarskie" },
    { value: "conference", label: "Konferencja" },
    { value: "training", label: "Szkolenie" },
    { value: "personal", label: "Sprawy osobiste" },
    { value: "other", label: "Inne" },
    { value: "leave", label: "Wolne" },
    { value: "break", label: "Przerwa" },
    { value: "meeting", label: "Spotkanie" },
    { value: "coffee_break", label: "Przerwa na kawę" },
    { value: "lunch_break", label: "Przerwa obiadowa" },
    { value: "dinner_break", label: "Przerwa na kolację" },
    { value: "other_break", label: "Inna przerwa" }
  ];

  // Load doctor's schedule data
  useEffect(() => {
    console.log("=== DoctorScheduleEditor useEffect triggered ===");
    console.log("doctorId:", doctorId);
    console.log("currentMonth:", currentMonth);
    console.log("doctorId type:", typeof doctorId);
    console.log("doctorId truthy:", !!doctorId);
    
    if (doctorId) {
      console.log("Calling fetchDoctorSchedule and fetchDoctorExceptions...");
      fetchDoctorSchedule();
      fetchDoctorExceptions();
    } else {
      console.log("No doctorId provided, skipping data fetch");
    }
  }, [doctorId, currentMonth]);

  const fetchDoctorSchedule = async () => {
    try {
      console.log("Fetching doctor schedule for:", doctorId);
      setLoading(true);
      setError(null);
      showLoader();

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

      console.log("Schedule date range:", { startDate, endDate });

      const response = await doctorService.getSchedule(doctorId, startDate, endDate);
      console.log("Schedule response:", response);
      if (response.success) {
        setSchedules(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctor schedule:", err);
      setError("Nie udało się załadować harmonogramu. Spróbuj ponownie.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const fetchDoctorExceptions = async () => {
    try {
      console.log("Fetching doctor exceptions for:", doctorId);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await doctorService.getExceptions(doctorId, startDate, endDate);
      console.log("Exceptions response:", response);
      if (response.success) {
        setExceptions(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching doctor exceptions:", err);
    }
  };

  // Handle schedule form changes
  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle time block changes
  const handleTimeBlockChange = (index, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  // Add new time block
  const addTimeBlock = () => {
    setScheduleForm(prev => ({
      ...prev,
      timeBlocks: [...prev.timeBlocks, { startTime: "09:00", endTime: "17:00", isActive: true }]
    }));
  };

  // Remove time block
  const removeTimeBlock = (index) => {
    setScheduleForm(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((_, i) => i !== index)
    }));
  };

  // Handle exception form changes
  const handleExceptionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExceptionForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle time range changes for exceptions
  const handleTimeRangeChange = (index, field, value) => {
    setExceptionForm(prev => ({
      ...prev,
      timeRanges: prev.timeRanges.map((range, i) => 
        i === index ? { ...range, [field]: value } : range
      )
    }));
  };

  // Add new time range for exceptions
  const addTimeRange = () => {
    setExceptionForm(prev => ({
      ...prev,
      timeRanges: [...prev.timeRanges, { startTime: "09:00", endTime: "17:00" }]
    }));
  };

  // Remove time range for exceptions
  const removeTimeRange = (index) => {
    setExceptionForm(prev => ({
      ...prev,
      timeRanges: prev.timeRanges.filter((_, i) => i !== index)
    }));
  };

  // Save schedule
  const handleSaveSchedule = async (e) => {
    console.log("=== handleSaveSchedule called ===");
    console.log("scheduleForm:", scheduleForm);
    console.log("doctorId:", doctorId);
    
    try {
      showLoader();
      const scheduleData = {
        doctorId,
        date: scheduleForm.date,
        timeBlocks: scheduleForm.timeBlocks,
        notes: scheduleForm.notes
      };

      console.log("Sending schedule data:", scheduleData);
      console.log("Calling doctorService.createOrUpdateSchedule...");
      
      const response = await doctorService.createOrUpdateSchedule(scheduleData);
      console.log("Save schedule response:", response);
      
      if (response.success) {
        toast.success("Harmonogram został zapisany pomyślnie");
        setShowScheduleModal(false);
        resetScheduleForm();
        fetchDoctorSchedule();
      } else {
        console.error("API returned success: false", response);
        toast.error("Nie udało się zapisać harmonogramu");
      }
    } catch (err) {
      console.error("=== Error in handleSaveSchedule ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      toast.error("Nie udało się zapisać harmonogramu");
    } finally {
      hideLoader();
    }
  };

  // Save exception
  const handleSaveException = async (e) => {
    console.log("=== handleSaveException called ===");
    console.log("exceptionForm:", exceptionForm);
    console.log("doctorId:", doctorId);
    
    try {
      showLoader();
      const exceptionData = {
        doctorId,
        date: exceptionForm.date,
        type: exceptionForm.type,
        title: exceptionForm.title,
        description: exceptionForm.description,
        isFullDay: exceptionForm.isFullDay,
        timeRanges: exceptionForm.isFullDay ? [] : exceptionForm.timeRanges
      };

      console.log("Sending exception data:", exceptionData);
      console.log("Calling doctorService.createException...");
      
      const response = await doctorService.createException(exceptionData);
      console.log("Save exception response:", response);
      
      if (response.success) {
        toast.success("Wyjątek został zapisany pomyślnie");
        setShowExceptionModal(false);
        resetExceptionForm();
        fetchDoctorExceptions();
      } else {
        console.error("API returned success: false", response);
        toast.error("Nie udało się zapisać wyjątku");
      }
    } catch (err) {
      console.error("=== Error in handleSaveException ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      toast.error("Nie udało się zapisać wyjątku");
    } finally {
      hideLoader();
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (date) => {
    if (!window.confirm("Czy na pewno chcesz usunąć harmonogram dla tego dnia?")) {
      return;
    }

    try {
      showLoader();
      const response = await doctorService.deleteSchedule(doctorId, date);
      
      if (response.success) {
        toast.success("Harmonogram został usunięty pomyślnie");
        fetchDoctorSchedule();
      }
    } catch (err) {
      console.error("Error deleting schedule:", err);
      toast.error("Nie udało się usunąć harmonogramu");
    } finally {
      hideLoader();
    }
  };

  // Delete exception
  const handleDeleteException = async (exceptionId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wyjątek?")) {
      return;
    }

    try {
      showLoader();
      const response = await doctorService.deleteException(exceptionId);
      
      if (response.success) {
        toast.success("Wyjątek został usunięty pomyślnie");
        fetchDoctorExceptions();
      }
    } catch (err) {
      console.error("Error deleting exception:", err);
      toast.error("Nie udało się usunąć wyjątku");
    } finally {
      hideLoader();
    }
  };

  // Edit schedule
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      date: schedule.date,
      timeBlocks: schedule.timeBlocks,
      notes: schedule.notes || ""
    });
    setShowScheduleModal(true);
  };

  // Edit exception
  const handleEditException = (exception) => {
    setEditingException(exception);
    setExceptionForm({
      date: exception.date,
      type: exception.type,
      title: exception.title,
      description: exception.description || "",
      isFullDay: exception.isFullDay,
      timeRanges: exception.timeRanges || [{ startTime: "09:00", endTime: "17:00" }]
    });
    setShowExceptionModal(true);
  };

  // Reset forms
  const resetScheduleForm = () => {
    setScheduleForm({
      date: new Date().toISOString().split('T')[0],
      timeBlocks: [{ startTime: "09:00", endTime: "17:00", isActive: true }],
      notes: ""
    });
    setEditingSchedule(null);
  };

  const resetExceptionForm = () => {
    setExceptionForm({
      date: new Date().toISOString().split('T')[0],
      type: "vacation",
      title: "",
      description: "",
      isFullDay: true,
      timeRanges: [{ startTime: "09:00", endTime: "17:00" }]
    });
    setEditingException(null);
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Get schedule for a specific date
  const getScheduleForDate = (date) => {
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    return schedules.find(schedule => schedule.date === dateStr);
  };

  // Get exception for a specific date
  const getExceptionForDate = (date) => {
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    return exceptions.find(exception => exception.date === dateStr);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const renderContent = () => {
    console.log("Rendering content with:", { 
      showScheduleModal, 
      showExceptionModal, 
      loading, 
      error, 
      schedules: schedules.length, 
      exceptions: exceptions.length 
    });
    
    return (
      <div className={isModal ? "p-6" : "bg-white rounded-lg shadow-md p-6 mb-6"}>
        {!isModal && (
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {doctorId ? "Zarządzaj Harmonogramem Lekarza" : "Ustawienia Harmonogramu"}
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

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                viewMode === 'calendar' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <CalendarIcon size={16} />
              <span>Kalendarz</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                viewMode === 'list' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Clock size={16} />
              <span>Lista</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log("Add Schedule button clicked");
                resetScheduleForm();
                setShowScheduleModal(true);
              }}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-600"
            >
              <Plus size={16} />
              <span>Dodaj Harmonogram</span>
            </button>
            <button
              onClick={() => {
                console.log("Add Exception button clicked");
                resetExceptionForm();
                setShowExceptionModal(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-600"
            >
              <Plus size={16} />
              <span>Dodaj Wyjątek</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          // Calendar View
          <div className="bg-white rounded-lg border">
            {/* Calendar Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Day headers */}
              {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {generateCalendarDays().map((date, index) => {
                const schedule = getScheduleForDate(date);
                const exception = getExceptionForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 bg-white ${
                      !isCurrentMonthDay ? 'text-gray-400' : 'text-gray-900'
                    } ${isTodayDate ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {date.getDate()}
                    </div>
                    
                    {schedule && (
                      <div className="text-xs bg-green-100 text-green-800 p-1 rounded mb-1">
                        {schedule.timeBlocks.length} blok(ów)
                      </div>
                    )}
                    
                    {exception && (
                      <div className="text-xs bg-red-100 text-red-800 p-1 rounded">
                        {exception.title}
                      </div>
                    )}
                    
                    {isCurrentMonthDay && (
                      <div className="mt-1 space-y-1">
                        {schedule && (
                          <button
                            onClick={() => {
                              console.log("Edit schedule button clicked for:", schedule);
                              handleEditSchedule(schedule);
                            }}
                            className="w-full text-xs bg-green-500 text-white p-1 rounded hover:bg-green-600"
                          >
                            Edytuj
                          </button>
                        )}
                                                 {!schedule && (
                           <button
                             onClick={() => {
                               const dateStr = date.getFullYear() + '-' + 
                                 String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(date.getDate()).padStart(2, '0');
                               console.log("Add schedule button clicked for date:", dateStr);
                               setScheduleForm(prev => ({ ...prev, date: dateStr }));
                               setShowScheduleModal(true);
                             }}
                             className="w-full text-xs bg-gray-500 text-white p-1 rounded hover:bg-gray-600"
                           >
                             Dodaj
                           </button>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // List View
          <div className="space-y-6">
            {/* Schedules List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Harmonogramy</h3>
              {schedules.length === 0 ? (
                <p className="text-gray-500 italic">Brak harmonogramów w tym miesiącu.</p>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule.date} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {new Date(schedule.date).toLocaleDateString('pl-PL', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {schedule.timeBlocks.map((block, index) => (
                              <div key={index}>
                                {block.startTime} - {block.endTime}
                                {!block.isActive && ' (nieaktywny)'}
                              </div>
                            ))}
                          </div>
                          {schedule.notes && (
                            <p className="text-sm text-gray-500 mt-1">Notatki: {schedule.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.date)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exceptions List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Wyjątki</h3>
              {exceptions.length === 0 ? (
                <p className="text-gray-500 italic">Brak wyjątków w tym miesiącu.</p>
              ) : (
                <div className="space-y-3">
                  {exceptions.map((exception) => (
                    <div key={exception._id} className="bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{exception.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(exception.date).toLocaleDateString('pl-PL', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            Typ: {exceptionTypes.find(t => t.value === exception.type)?.label || exception.type}
                          </p>
                          {exception.description && (
                            <p className="text-sm text-gray-500 mt-1">{exception.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditException(exception)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteException(exception._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Schedule Modal
  const renderScheduleModal = () => {
    console.log("Rendering schedule modal with:", { scheduleForm, editingSchedule });
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingSchedule ? "Edytuj Harmonogram" : "Dodaj Harmonogram"}
          </h2>
          <button
            onClick={() => {
              console.log("Closing schedule modal");
              setShowScheduleModal(false);
              resetScheduleForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => {
          console.log("=== Schedule form submitted ===");
          console.log("Form event:", e);
          console.log("Form target:", e.target);
          console.log("Form data:", new FormData(e.target));
          e.preventDefault();
          handleSaveSchedule(e);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={scheduleForm.date}
                onChange={handleScheduleFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bloki czasowe
              </label>
              {scheduleForm.timeBlocks.map((block, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="time"
                    value={block.startTime}
                    onChange={(e) => handleTimeBlockChange(index, 'startTime', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={block.endTime}
                    onChange={(e) => handleTimeBlockChange(index, 'endTime', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={block.isActive}
                      onChange={(e) => handleTimeBlockChange(index, 'isActive', e.target.checked)}
                      className="mr-1"
                    />
                    <span className="text-sm">Aktywny</span>
                  </label>
                  {scheduleForm.timeBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeBlock(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeBlock}
                className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Dodaj blok czasowy
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notatki
              </label>
              <textarea
                name="notes"
                value={scheduleForm.notes}
                onChange={handleScheduleFormChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Opcjonalne notatki..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowScheduleModal(false);
                resetScheduleForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center"
            >
              <Save size={16} className="mr-1" />
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  };

  // Exception Modal
  const renderExceptionModal = () => {
    console.log("Rendering exception modal with:", { exceptionForm, editingException });
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingException ? "Edytuj Wyjątek" : "Dodaj Wyjątek"}
          </h2>
          <button
            onClick={() => {
              console.log("Closing exception modal");
              setShowExceptionModal(false);
              resetExceptionForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => {
          console.log("=== Exception form submitted ===");
          console.log("Form event:", e);
          console.log("Form target:", e.target);
          console.log("Form data:", new FormData(e.target));
          e.preventDefault();
          handleSaveException(e);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={exceptionForm.date}
                onChange={handleExceptionFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ wyjątku
              </label>
              <select
                name="type"
                value={exceptionForm.type}
                onChange={handleExceptionFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                {exceptionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tytuł
              </label>
              <input
                type="text"
                name="title"
                value={exceptionForm.title}
                onChange={handleExceptionFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                name="description"
                value={exceptionForm.description}
                onChange={handleExceptionFormChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Opcjonalny opis..."
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFullDay"
                  checked={exceptionForm.isFullDay}
                  onChange={handleExceptionFormChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Cały dzień
                </span>
              </label>
            </div>

            {!exceptionForm.isFullDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zakresy czasowe
                </label>
                {exceptionForm.timeRanges.map((range, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="time"
                      value={range.startTime}
                      onChange={(e) => handleTimeRangeChange(index, 'startTime', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={range.endTime}
                      onChange={(e) => handleTimeRangeChange(index, 'endTime', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    {exceptionForm.timeRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeRange(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeRange}
                  className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Dodaj zakres czasowy
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowExceptionModal(false);
                resetExceptionForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center"
            >
              <Save size={16} className="mr-1" />
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  };

  if (isModal) {
    console.log("Rendering modal with:", { doctorId, showScheduleModal, showExceptionModal });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl transform transition-all duration-300 border border-teal-100">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700">
              {doctorId ? "Zarządzaj Harmonogramem Lekarza" : "Ustawienia Harmonogramu"}
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
              Zamknij
            </button>
          </div>
        </div>
        
        {/* Render schedule and exception modals */}
        {showScheduleModal && (
          <div>
            {console.log("=== Rendering schedule modal in modal mode ===")}
            {renderScheduleModal()}
          </div>
        )}
        {showExceptionModal && (
          <div>
            {console.log("=== Rendering exception modal in modal mode ===")}
            {renderExceptionModal()}
          </div>
        )}
      </div>
    );
  }

  console.log("Rendering non-modal with:", { showScheduleModal, showExceptionModal });
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex">
          <div className="flex-1">
            {renderContent()}
            {showScheduleModal && (
              <div>
                {console.log("=== Rendering schedule modal ===")}
                {renderScheduleModal()}
              </div>
            )}
            {showExceptionModal && (
              <div>
                {console.log("=== Rendering exception modal ===")}
                {renderExceptionModal()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleManager;
