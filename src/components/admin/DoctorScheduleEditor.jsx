import React, { useState, useEffect } from "react";
import doctorService from "../../helpers/doctorHelper";
import { useLoader } from "../../context/LoaderContext";
import { Calendar, Clock, Plus, Trash2, Edit, X, Save, Calendar as CalendarIcon, Copy, CopyCheck } from "lucide-react";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";

const DoctorScheduleManager = ({ isModal = false, doctorId, onClose }) => {
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Schedule management states
  const [schedules, setSchedules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  // Date range copy states
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyForm, setCopyForm] = useState({
    sourceStartDate: "",
    sourceEndDate: "",
    targetStartDate: ""
  });
  const [copyLoading, setCopyLoading] = useState(false);

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
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingException, setEditingException] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
      console.log("Calling fetchDoctorSchedule, fetchDoctorExceptions, and fetchBookedAppointments...");
      fetchDoctorSchedule();
      fetchDoctorExceptions();
      fetchBookedAppointments();
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
        // Process the data to ensure dates are correctly formatted
        const processedSchedules = (response.data || []).map(schedule => {
          // Log each schedule to help with debugging
          console.log("Processing schedule:", {
            id: schedule._id,
            date: schedule.date,
            timeBlocks: schedule.timeBlocks
          });
          
          // Ensure date is properly formatted
          if (typeof schedule.date === 'string' && schedule.date.includes('T')) {
            // Extract just the date part from ISO string
            const datePart = schedule.date.split('T')[0];
            console.log(`Converted date from ${schedule.date} to ${datePart}`);
            return { ...schedule, date: datePart };
          }
          
          return schedule;
        });
        
        console.log("Processed schedules:", processedSchedules);
        setSchedules(processedSchedules);
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

  const fetchBookedAppointments = async () => {
    try {
      console.log("Fetching booked appointments for doctor:", doctorId);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

      // Use the appointments API to get booked appointments
      const response = await apiCaller(
        "GET",
        `/appointments/doctor/${doctorId}?startDate=${startDate}&endDate=${endDate}&status=all&page=1&limit=100`
      );

      console.log("Booked appointments response:", response);
      if (response && response.data && response.data.data) {
        setBookedAppointments(response.data.data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching booked appointments:", err);
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
    
    // Check if date is in the past
    const selectedDate = new Date(scheduleForm.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Nie można dodać harmonogramu dla dat w przeszłości");
      return;
    }
    
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
    
    // Check if date is in the past
    const selectedDate = new Date(exceptionForm.date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Nie można dodać wyjątku dla dat w przeszłości");
      return;
    }
    
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
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    setScheduleForm({
      date: today,
      timeBlocks: [{ startTime: "09:00", endTime: "17:00", isActive: true }],
      notes: ""
    });
    setEditingSchedule(null);
  };

  const resetExceptionForm = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    setExceptionForm({
      date: today,
      type: "vacation",
      title: "",
      description: "",
      isFullDay: true,
      timeRanges: [{ startTime: "09:00", endTime: "17:00" }]
    });
    setEditingException(null);
  };

  // Copy schedule functionality
  const handleCopyFormChange = (e) => {
    const { name, value } = e.target;
    setCopyForm(prev => ({ ...prev, [name]: value }));
  };

  const resetCopyForm = () => {
    setCopyForm({
      sourceStartDate: "",
      sourceEndDate: "",
      targetStartDate: ""
    });
  };

  const calculateTargetDate = (sourceStart, sourceEnd, targetStart) => {
    if (!sourceStart || !sourceEnd || !targetStart) return "";
    
    const start = new Date(sourceStart);
    const end = new Date(sourceEnd);
    const target = new Date(targetStart);
    
    // Calculate the difference in days between source start and end
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate target end date
    const targetEnd = new Date(target);
    targetEnd.setDate(target.getDate() + daysDiff - 1);
    
    return targetEnd.toISOString().split('T')[0];
  };

  const handleCopySchedule = async (e) => {
    e.preventDefault();
    
    if (!copyForm.sourceStartDate || !copyForm.sourceEndDate || !copyForm.targetStartDate) {
      toast.error("Proszę wypełnić wszystkie pola dat");
      return;
    }

    const sourceStart = new Date(copyForm.sourceStartDate);
    const sourceEnd = new Date(copyForm.sourceEndDate);
    const targetStart = new Date(copyForm.targetStartDate);

    if (sourceStart > sourceEnd) {
      toast.error("Data rozpoczęcia źródła musi być wcześniejsza niż data zakończenia");
      return;
    }

    if (targetStart <= sourceEnd) {
      toast.error("Data docelowa musi być późniejsza niż data zakończenia źródła");
      return;
    }

    try {
      setCopyLoading(true);
      showLoader();

      const copyData = {
        sourceStartDate: copyForm.sourceStartDate,
        sourceEndDate: copyForm.sourceEndDate,
        targetStartDate: copyForm.targetStartDate
      };

      console.log("Copying schedule with data:", copyData);

      // Use the copy-date-range API
      const response = await apiCaller(
        "POST",
        `docs/schedule/copy-date-range${doctorId ? `?doctorId=${doctorId}` : ''}`,
        copyData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Harmonogram został pomyślnie skopiowany");
        
        // Show summary if available
        if (response.data.data?.summary) {
          const summary = response.data.data.summary;
          toast.success(`Skopiowano ${summary.successfullyCopied} z ${summary.totalDays} dni`);
          
          if (summary.failedDays > 0) {
            toast.warning(`${summary.failedDays} dni nie udało się skopiować`);
          }
        }

        setShowCopyModal(false);
        resetCopyForm();
        
        // Refresh schedules to show the copied ones
        fetchDoctorSchedule();
      } else {
        toast.error(response.data.message || "Nie udało się skopiować harmonogramu");
      }
    } catch (err) {
      console.error("Error copying schedule:", err);
      
      if (err.response?.status === 207) {
        // Partial success
        const data = err.response.data;
        if (data.data?.summary) {
          const summary = data.data.summary;
          toast.warning(`Harmonogram skopiowany częściowo: ${summary.successfullyCopied} z ${summary.totalDays} dni`);
          
          if (data.data.errors) {
            data.data.errors.forEach(error => {
              toast.error(`Błąd dla ${error.date}: ${error.error}`);
            });
          }
        }
        
        // Refresh schedules even on partial success
        fetchDoctorSchedule();
      } else {
        toast.error("Nie udało się skopiować harmonogramu");
      }
    } finally {
      setCopyLoading(false);
      hideLoader();
    }
  };

  const openCopyModal = () => {
    // Set default dates: last week as source, next week as target
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 1);
    
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    
    setCopyForm({
      sourceStartDate: lastWeekStart.toISOString().split('T')[0],
      sourceEndDate: lastWeekEnd.toISOString().split('T')[0],
      targetStartDate: nextWeekStart.toISOString().split('T')[0]
    });
    setShowCopyModal(true);
  };

  // Quick copy functions for common scenarios
  const quickCopyLastWeekToNextWeek = async () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 1);
    
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    
    try {
      setCopyLoading(true);
      showLoader();

      const copyData = {
        sourceStartDate: lastWeekStart.toISOString().split('T')[0],
        sourceEndDate: lastWeekEnd.toISOString().split('T')[0],
        targetStartDate: nextWeekStart.toISOString().split('T')[0]
      };

      console.log("Quick copying last week to next week:", copyData);

      const response = await apiCaller(
        "POST",
        `doctors/schedule/copy-date-range${doctorId ? `?doctorId=${doctorId}` : ''}`,
        copyData
      );

      if (response.data.success) {
        toast.success("Harmonogram z zeszłego tygodnia został skopiowany na przyszły tydzień");
        
        if (response.data.data?.summary) {
          const summary = response.data.data.summary;
          toast.success(`Skopiowano ${summary.successfullyCopied} z ${summary.totalDays} dni`);
        }
        
        fetchDoctorSchedule();
      } else {
        toast.error("Nie udało się skopiować harmonogramu");
      }
    } catch (err) {
      console.error("Error in quick copy:", err);
      toast.error("Nie udało się skopiować harmonogramu");
    } finally {
      setCopyLoading(false);
      hideLoader();
    }
  };

  const quickCopyThisWeekToNextWeek = async () => {
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() - today.getDay() + 7); // Sunday
    
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    
    try {
      setCopyLoading(true);
      showLoader();

      const copyData = {
        sourceStartDate: thisWeekStart.toISOString().split('T')[0],
        sourceEndDate: thisWeekEnd.toISOString().split('T')[0],
        targetStartDate: nextWeekStart.toISOString().split('T')[0]
      };

      console.log("Quick copying this week to next week:", copyData);

      const response = await apiCaller(
        "POST",
        `doctors/schedule/copy-date-range${doctorId ? `?doctorId=${doctorId}` : ''}`,
        copyData
      );

      if (response.data.success) {
        toast.success("Harmonogram z tego tygodnia został skopiowany na przyszły tydzień");
        
        if (response.data.data?.summary) {
          const summary = response.data.data.summary;
          toast.success(`Skopiowano ${summary.successfullyCopied} z ${summary.totalDays} dni`);
        }
        
        fetchDoctorSchedule();
      } else {
        toast.error("Nie udało się skopiować harmonogramu");
      }
    } catch (err) {
      console.error("Error in quick copy:", err);
      toast.error("Nie udało się skopiować harmonogramu");
    } finally {
      setCopyLoading(false);
      hideLoader();
    }
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
    // Format the date as YYYY-MM-DD
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    // Check for exact match or ISO date format match
    return schedules.find(schedule => {
      // Handle different date formats
      if (schedule.date === dateStr) return true;
      
      // Handle ISO date string (e.g. "2025-08-14T00:00:00.000Z")
      if (typeof schedule.date === 'string' && schedule.date.includes('T')) {
        const scheduleDateStr = schedule.date.split('T')[0];
        return scheduleDateStr === dateStr;
      }
      
      // Handle Date object
      if (schedule.date instanceof Date) {
        const scheduleYear = schedule.date.getFullYear();
        const scheduleMonth = schedule.date.getMonth() + 1;
        const scheduleDay = schedule.date.getDate();
        const formattedScheduleDate = `${scheduleYear}-${String(scheduleMonth).padStart(2, '0')}-${String(scheduleDay).padStart(2, '0')}`;
        return formattedScheduleDate === dateStr;
      }
      
      return false;
    });
  };

  // Get exception for a specific date
  const getExceptionForDate = (date) => {
    // Format the date as YYYY-MM-DD
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    // Check for exact match or ISO date format match
    return exceptions.find(exception => {
      // Handle different date formats
      if (exception.date === dateStr) return true;
      
      // Handle ISO date string (e.g. "2025-08-14T00:00:00.000Z")
      if (typeof exception.date === 'string' && exception.date.includes('T')) {
        const exceptionDateStr = exception.date.split('T')[0];
        return exceptionDateStr === dateStr;
      }
      
      // Handle Date object
      if (exception.date instanceof Date) {
        const exceptionYear = exception.date.getFullYear();
        const exceptionMonth = exception.date.getMonth() + 1;
        const exceptionDay = exception.date.getDate();
        const formattedExceptionDate = `${exceptionYear}-${String(exceptionMonth).padStart(2, '0')}-${String(exceptionDay).padStart(2, '0')}`;
        return formattedExceptionDate === dateStr;
      }
      
      return false;
    });
  };
  
  // Get booked appointments for a specific date
  const getAppointmentsForDate = (date) => {
    // Format the date as YYYY-MM-DD
    const dateStr = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
    
    return bookedAppointments.filter(appointment => {
      // Handle different date formats
      if (appointment.date === dateStr) return true;
      
      // Handle ISO date string (e.g. "2025-08-14T00:00:00.000Z")
      if (typeof appointment.date === 'string' && appointment.date.includes('T')) {
        const appointmentDateStr = appointment.date.split('T')[0];
        return appointmentDateStr === dateStr;
      }
      
      // Check appointmentDate field if present
      if (appointment.appointmentDate) {
        if (typeof appointment.appointmentDate === 'string') {
          const appointmentDateStr = appointment.appointmentDate.includes('T') 
            ? appointment.appointmentDate.split('T')[0] 
            : appointment.appointmentDate;
          return appointmentDateStr === dateStr;
        }
      }
      
      // Handle Date object
      if (appointment.date instanceof Date) {
        const appointmentYear = appointment.date.getFullYear();
        const appointmentMonth = appointment.date.getMonth() + 1;
        const appointmentDay = appointment.date.getDate();
        const formattedAppointmentDate = `${appointmentYear}-${String(appointmentMonth).padStart(2, '0')}-${String(appointmentDay).padStart(2, '0')}`;
        return formattedAppointmentDate === dateStr;
      }
      
      return false;
    });
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // If timeString includes T (ISO format), extract the time part
    if (timeString.includes('T')) {
      timeString = timeString.split('T')[1].substring(0, 5);
    }
    return timeString;
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
  
  // Check if date is in the past
  const isPastDate = (date) => {
    // Create today's date with time set to 00:00:00 for fair comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Clone the input date to avoid modifying it
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    // Compare dates
    return compareDate < today;
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

        {/* View Mode Toggle and Action Buttons */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* View Mode Toggle */}
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

          {/* Main Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                console.log("Add Schedule button clicked");
                resetScheduleForm();
                setShowScheduleModal(true);
              }}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-600 transition-colors shadow-sm"
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
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Dodaj Wyjątek</span>
            </button>
            
            <button
              onClick={openCopyModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Copy size={16} />
              <span>Skopiuj Harmonogram</span>
            </button>
          </div>

          {/* Quick Copy Options - Compact Design */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={quickCopyLastWeekToNextWeek}
                disabled={copyLoading}
                className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-green-200 hover:border-green-300"
              >
                <CopyCheck size={14} />
                <span>Zeszły → Przyszły tydzień</span>
              </button>
              
              <button
                onClick={quickCopyThisWeekToNextWeek}
                disabled={copyLoading}
                className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-green-200 hover:border-green-300"
              >
                <CopyCheck size={14} />
                <span>Ten → Przyszły tydzień</span>
              </button>
            </div>
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
            
            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                <span>Bloki harmonogramu</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                <span>Zarezerwowane wizyty</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
                <span>Wyjątki (nieobecności)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-50 rounded mr-1"></div>
                <span>Dostępne terminy</span>
              </div>
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
                // Format date for debugging
                const debugDateStr = date.getFullYear() + '-' + 
                  String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(date.getDate()).padStart(2, '0');
                
                // Get schedule and log for debugging
                const schedule = getScheduleForDate(date);
                if (schedule) {
                  console.log(`Found schedule for date ${debugDateStr}:`, schedule);
                }
                
                const exception = getExceptionForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                // Check if date is in the past
                const isPast = isPastDate(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 ${
                      isPast ? 'bg-gray-100' : 'bg-white'
                    } ${
                      !isCurrentMonthDay ? 'text-gray-400' : isPast ? 'text-gray-500' : 'text-gray-900'
                    } ${isTodayDate ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {date.getDate()}
                    </div>
                    
                    {/* Schedule info */}
                    {schedule && (
                      <div className="text-xs bg-green-100 text-green-800 p-1 rounded mb-1 flex justify-between">
                        <span>{schedule.timeBlocks.length} blok(ów)</span>
                        {isCurrentMonthDay && getAppointmentsForDate(date).length > 0 && (
                          <span title="Ilość zarezerwowanych wizyt">🗓️ {getAppointmentsForDate(date).length}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Exception info */}
                    {exception && (
                      <div className="text-xs bg-red-100 text-red-800 p-1 rounded mb-1">
                        {exception.title}
                      </div>
                    )}
                    
                    {/* Booked appointments */}
                    {isCurrentMonthDay && getAppointmentsForDate(date).length > 0 && (
                      <div className="mt-1 mb-1 max-h-[60px] overflow-y-auto">
                        {getAppointmentsForDate(date).slice(0, 3).map((appointment, idx) => (
                          <div 
                            key={idx} 
                            className="text-xs bg-blue-100 text-blue-800 p-1 rounded mb-1 flex justify-between cursor-pointer hover:bg-blue-200"
                            title={`${appointment.patientName || 'Pacjent'} - Kliknij aby zobaczyć szczegóły`}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowAppointmentDetailsModal(true);
                            }}
                          >
                            <span>{formatTime(appointment.startTime || appointment.time)}</span>
                            <span>👤 {appointment.patientName ? appointment.patientName.split(' ')[0] : ''}</span>
                          </div>
                        ))}
                        {getAppointmentsForDate(date).length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{getAppointmentsForDate(date).length - 3} więcej
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Available slots */}
                    {isCurrentMonthDay && schedule && (
                      <div className="mt-1 mb-1 max-h-[60px] overflow-y-auto">
                        {schedule.timeBlocks.slice(0, 2).map((block, idx) => (
                          <div 
                            key={idx} 
                            className={`text-xs ${block.isActive ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'} p-1 rounded mb-1`}
                          >
                            {block.startTime} - {block.endTime}
                          </div>
                        ))}
                        {schedule.timeBlocks.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{schedule.timeBlocks.length - 2} więcej
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action buttons - only show for current and future dates */}
                    {isCurrentMonthDay && !isPast && (
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
                    
                    {/* For past dates, show a disabled indicator */}
                    {isCurrentMonthDay && isPast && (
                      <div className="mt-1">
                        <div className="w-full text-xs bg-gray-300 text-gray-500 p-1 rounded text-center cursor-not-allowed">
                          Data miniona
                        </div>
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
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
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
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
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

  // Appointment Details Modal
  const renderAppointmentDetailsModal = () => {
    if (!selectedAppointment) return null;

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Szczegóły Wizyty
            </h2>
            <button
              onClick={() => {
                setShowAppointmentDetailsModal(false);
                setSelectedAppointment(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg text-blue-800 mb-2">
                {selectedAppointment.patientName || 'Pacjent'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Data:</span> {formatDate(selectedAppointment.date || selectedAppointment.appointmentDate)}
                </div>
                <div>
                  <span className="font-medium">Godzina:</span> {formatTime(selectedAppointment.startTime || selectedAppointment.time)}
                  {selectedAppointment.endTime && ` - ${formatTime(selectedAppointment.endTime)}`}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedAppointment.status || 'Zaplanowana'}
                </div>
                <div>
                  <span className="font-medium">Typ:</span> {selectedAppointment.type || selectedAppointment.appointmentType || 'Standardowa'}
                </div>
                {selectedAppointment.service && (
                  <div className="col-span-2">
                    <span className="font-medium">Usługa:</span> {selectedAppointment.service}
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className="col-span-2">
                    <span className="font-medium">Notatki:</span> {selectedAppointment.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAppointmentDetailsModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Copy Schedule Modal
  const renderCopyScheduleModal = () => {
    console.log("Rendering copy schedule modal with:", { copyForm, copyLoading });
    
    const targetEndDate = calculateTargetDate(copyForm.sourceStartDate, copyForm.sourceEndDate, copyForm.targetStartDate);
    const hasValidDates = copyForm.sourceStartDate && copyForm.sourceEndDate && copyForm.targetStartDate;
    
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Skopiuj Harmonogram
          </h2>
          <button
            onClick={() => {
              console.log("Closing copy schedule modal");
              setShowCopyModal(false);
              resetCopyForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleCopySchedule} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Jak to działa:</strong> Wybierz zakres dat źródłowych (skąd kopiować) 
              i datę docelową (dokąd kopiować). System automatycznie skopiuje harmonogramy 
              dla każdego dnia w zakresie źródłowym.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data rozpoczęcia harmonogramu źródłowego
              </label>
              <input
                type="date"
                name="sourceStartDate"
                value={copyForm.sourceStartDate}
                onChange={handleCopyFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data zakończenia harmonogramu źródłowego
              </label>
              <input
                type="date"
                name="sourceEndDate"
                value={copyForm.sourceEndDate}
                onChange={handleCopyFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data rozpoczęcia harmonogramu docelowego
              </label>
              <input
                type="date"
                name="targetStartDate"
                value={copyForm.targetStartDate}
                onChange={handleCopyFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Preview Section */}
          {hasValidDates && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Podgląd kopiowania:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Źródło:</span>
                  <span className="font-medium">
                    {copyForm.sourceStartDate} → {copyForm.sourceEndDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cel:</span>
                  <span className="font-medium">
                    {copyForm.targetStartDate} → {targetEndDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liczba dni:</span>
                  <span className="font-medium">
                    {(() => {
                      const start = new Date(copyForm.sourceStartDate);
                      const end = new Date(copyForm.sourceEndDate);
                      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                      return days;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {hasValidDates && (
            <div className="space-y-2">
              {(() => {
                const sourceStart = new Date(copyForm.sourceStartDate);
                const sourceEnd = new Date(copyForm.sourceEndDate);
                const targetStart = new Date(copyForm.targetStartDate);
                
                if (sourceStart > sourceEnd) {
                  return (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                      ⚠️ Data rozpoczęcia źródła musi być wcześniejsza niż data zakończenia
                    </div>
                  );
                }
                
                if (targetStart <= sourceEnd) {
                  return (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                      ⚠️ Data docelowa musi być późniejsza niż data zakończenia źródła
                    </div>
                  );
                }
                
                return (
                  <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
                    ✅ Daty są poprawne - możesz skopiować harmonogram
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowCopyModal(false);
                resetCopyForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={copyLoading || !hasValidDates || 
                (() => {
                  if (!hasValidDates) return true;
                  const sourceStart = new Date(copyForm.sourceStartDate);
                  const sourceEnd = new Date(copyForm.sourceEndDate);
                  const targetStart = new Date(copyForm.targetStartDate);
                  return sourceStart > sourceEnd || targetStart <= sourceEnd;
                })()}
            >
              {copyLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Copy size={16} className="mr-1" />
              )}
              {copyLoading ? "Kopiuję..." : "Skopiuj Harmonogram"}
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
        {showCopyModal && (
          <div>
            {console.log("=== Rendering copy schedule modal in modal mode ===")}
            {renderCopyScheduleModal()}
          </div>
        )}
        {showAppointmentDetailsModal && (
          <div>
            {console.log("=== Rendering appointment details modal in modal mode ===")}
            {renderAppointmentDetailsModal()}
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
            {showCopyModal && (
              <div>
                {console.log("=== Rendering copy schedule modal ===")}
                {renderCopyScheduleModal()}
              </div>
            )}
            {showAppointmentDetailsModal && (
              <div>
                {console.log("=== Rendering appointment details modal ===")}
                {renderAppointmentDetailsModal()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleManager;
