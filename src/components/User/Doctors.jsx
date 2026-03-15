import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaShare,
} from "react-icons/fa";
import doctorService from "../../helpers/doctorHelper";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import { generateDoctorProfileUrl } from "../../utils/slugUtils";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';
import { getCurrentDateInPoland, formatDateToPolandTimezone, isDateInPast, getDateAtMidnightPoland } from "../../utils/polandTimezone";
import { sortDoctorsWithPinnedFirst } from "../../utils/doctorSort";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import PhoneCodeSelect from "../UtilComponents/PhoneCodeSelect";

export default function Doctors({
  selectedDoctorId,
  setSelectedDoctorId,
  setSelectedDepartment,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(selectedDoctorId);
  const modalClosedRef = useRef(false);

  // Use a ref to track if we need to open appointment modal
  const pendingDoctorRef = useRef(null);
  
  // Track the last processed URL parameter to avoid duplicate opens
  const lastProcessedUrlRef = useRef(null);
  
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId
      );
      if (selectedDoctor) {
        pendingDoctorRef.current = selectedDoctor;
        setSelectedDoctor(selectedDoctor);
      }
    }
  }, [selectedDoctorId, doctors]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    getCurrentDateInPoland()
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    phoneCode: "+48", // Default country code
    gender: "male",
    message: "",
    consultationType: "offline",
    smsConsentAgreed: false,
    privacyPolicyAgreed: false,
    medicalDataProcessingAgreed: false,
    teleportationConfirmed: false,
    contactConsentAgreed: false,
    govtId: "",
    address: "",
    dateOfBirth: "",
    isInternationalPatient: false,
    documentCountry: "",
    documentType: "",
    documentNumber: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showRecaptchaV2, setShowRecaptchaV2] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const phoneCountryCodes = PHONE_COUNTRY_CODES;


  // reCAPTCHA handlers
  const handleRecaptchaV2Change = (token) => {
    setRecaptchaToken(token);
    if (token) {
      setShowRecaptchaV2(false);
    }
  };

  const handleRecaptchaV2Expire = () => {
    setRecaptchaToken(null);
    setShowRecaptchaV2(true);
  };

  const handleRecaptchaV3 = async () => {
    if (!executeRecaptcha) {
      console.error('Execute recaptcha not yet available');
      setShowRecaptchaV2(true);
      return null;
    }

    try {
      const token = await executeRecaptcha('appointment_booking');
      return token;
    } catch (error) {
      console.error('Error executing reCAPTCHA v3:', error);
      setShowRecaptchaV2(true);
      return null;
    }
  };

  // Add state for share functionality - removed modal states since we're copying directly

  // Reset modal closed ref on location change (page navigation/refresh)
  useEffect(() => {
    modalClosedRef.current = false;
  }, [location.pathname]);

  // Parse URL parameters on component mount
  useEffect(() => {
    const doctorIdFromUrl = searchParams.get('lekarz');
    const dateFromUrl = searchParams.get('data');
    const timeFromUrl = searchParams.get('godzina');
    
    // Create a unique key for this URL state
    const urlKey = `${doctorIdFromUrl || ''}-${dateFromUrl || ''}-${timeFromUrl || ''}`;
    
    // If URL has lekarz parameter, reset the modal closed flag to allow opening
    if (doctorIdFromUrl) {
      modalClosedRef.current = false;
    } else {
      // If no lekarz parameter, don't auto-open if modal was just manually closed
      if (modalClosedRef.current) {
        return;
      }
      // Clear the last processed URL when lekarz is removed
      lastProcessedUrlRef.current = null;
      return;
    }
    
    // Skip if we've already processed this exact URL state
    if (lastProcessedUrlRef.current === urlKey) {
      return;
    }
    
    if (doctorIdFromUrl && doctors.length > 0) {
      const doctor = doctors.find(d => d.id === doctorIdFromUrl);
      if (doctor) {
        // Mark this URL as processed
        lastProcessedUrlRef.current = urlKey;
        
        // Only open if modal is not already open for this doctor
        if (!showModal || selectedDoctor?.id !== doctor.id) {
          handleBookAppointment(doctor);
        }
        
        if (dateFromUrl) {
          setWeekLoading(true);
          // Calculate which week this date falls into and set the week offset (using Poland timezone)
          const targetDate = new Date(dateFromUrl + 'T00:00:00');
          const today = getDateAtMidnightPoland(getCurrentDateInPoland());
          const daysDiff = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
          const weekOffsetForDate = Math.max(0, Math.floor(daysDiff / 7)); // Ensure weekOffset is not negative
          
          setWeekOffset(weekOffsetForDate);
          setSelectedDate(dateFromUrl);
          
          // Force update the nextDays array to show the correct week immediately (using Poland timezone)
          const days = Array.from({ length: 7 }, (_, i) => {
            const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
            const date = new Date(todayPoland);
            date.setDate(date.getDate() + i + weekOffsetForDate * 7);
            return formatDateToPolandTimezone(date);
          });
          setNextDays(days);
          setWeekLoading(false);
        }
        
        if (timeFromUrl && dateFromUrl) {
          // Wait a bit for slots to load, then select the time
          setTimeout(() => {
            const slot = availableSlots.find(s => s.startTime === timeFromUrl);
            if (slot && slot.available) {
              setSelectedSlot(slot);
            }
          }, 1000);
        }
      }
    }
  }, [doctors, searchParams, showModal, selectedDoctor]);

  // Function to update URL with current selections
  const updateUrlWithSelections = (doctorId, date, time) => {
    const params = new URLSearchParams();
    
    if (doctorId) {
      params.set('lekarz', doctorId);
    }
    if (date) {
      params.set('data', date);
    }
    if (time) {
      params.set('godzina', time);
    }
    
    // Update URL without triggering navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Function to generate shareable link
  const generateShareableLink = () => {
    if (!selectedDoctor) {
      toast.error("Najpierw wybierz lekarza");
      return "";
    }
    
    const params = new URLSearchParams();
    params.set('lekarz', selectedDoctor.id);
    params.set('nazwisko-lekarza', selectedDoctor.name);
    if (selectedDate) params.set('data', selectedDate);
    if (selectedSlot) params.set('godzina', selectedSlot.startTime);
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  // Handle share button click - directly copy to clipboard
  const handleShare = async () => {
    const shareableLink = generateShareableLink();
    if (shareableLink) {
      try {
        await navigator.clipboard.writeText(shareableLink);
        toast.success("Link skopiowany do schowka!");
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareableLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success("Link skopiowany do schowka!");
        } catch (fallbackErr) {
          toast.error("Nie udało się skopiować linku");
        }
        document.body.removeChild(textArea);
      }
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors();

        // Transform the API response to match the component's expected format
        const doctorsArray = Array.isArray(response.doctors) ? response.doctors : [];
        const transformedDoctors = doctorsArray.map((doctor) => ({
          id: doctor._id || doctor.id,
          name:
            doctor.name.first && doctor.name.last
              ? `${doctor.name.first} ${doctor.name.last}`
              : doctor.name, // Handle both object and string format
          department: doctor?.specializations
            ?.slice(0, 2)
            .map((spec) => spec.name),
          image: doctor.image || "https://via.placeholder.com/400x500",
          experience: doctor.experience || "",
          social: {
            linkedin: "#",
            facebook: "#",
            instagram: "#",
          },
          consultationFee: doctor.consultationFee,
        }));

        //("trans", transformedDoctors);
        setDoctors(sortDoctorsWithPinnedFirst(transformedDoctors));
      } catch (err) {
        console.error("Błąd podczas pobierania lekarzy:", err);
        setError(
          "Nie udało się załadować listy lekarzy. Spróbuj ponownie później."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user?.phone?.startsWith("+48")
          ? user.phone.slice(3)
          : user?.phone || "",
        phoneCode: user?.phone?.startsWith("+") 
          ? user.phone.substring(0, user.phone.length - (user.phone.length - user.phone.indexOf(user.phone.match(/\d/)[0])))
          : "+48",
      }));
    }
  }, [user]);

  const fetchDoctorProfile = async (doctorId) => {
    try {
      const response = await apiCaller("GET", `docs/profile/${doctorId}`);
      if (response.data.success) {
        setDoctorProfile(response.data.data);
        //("doctorProfile", response.data.data);
      } else {
        console.error("Failed to fetch doctor profile");
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setSlotsLoading(true);
      const response = await apiCaller(
        "GET",
        `docs/schedule/available-slots/${doctorId}?date=${date}`
      );
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      } else {
        console.error("Failed to fetch available slots");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Handle pending doctor appointment after handleBookAppointment is defined
  useEffect(() => {
    if (pendingDoctorRef.current && !showModal && doctors.length > 0) {
      const doctor = pendingDoctorRef.current;
      pendingDoctorRef.current = null;
      handleBookAppointment(doctor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors.length, showModal, selectedDoctorId]);

  const handleBookAppointment = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
    // Reset the closed flag when opening modal
    modalClosedRef.current = false;
    setWeekLoading(true);

    try {
      // Fetch doctor profile
      await fetchDoctorProfile(doctor.id);

      // Fetch next available date
      const nextAvailableResponse = await doctorService.getNextAvailableDate(
        doctor.id
      );

        if (nextAvailableResponse.success && nextAvailableResponse.data) {
          const nextAvailableDate = nextAvailableResponse.data.nextAvailableDate;
          
          // Calculate which week this date falls into (using Poland timezone)
          const targetDate = new Date(nextAvailableDate + 'T00:00:00');
          const today = getDateAtMidnightPoland(getCurrentDateInPoland());
          const daysDiff = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
          const weekOffset = Math.max(0, Math.floor(daysDiff / 7)); // Ensure weekOffset is not negative
          
          // Set the week offset to show the correct week
          setWeekOffset(weekOffset);
          
          // Set the next available date
          setSelectedDate(nextAvailableDate);
          // Set available slots
          setAvailableSlots(nextAvailableResponse.data.availableSlots);
          
          // Update URL to reflect the selected date
          updateUrlWithSelections(doctor.id, nextAvailableDate, "");
          
          // Force update the nextDays array to show the correct week immediately (using Poland timezone)
          const days = Array.from({ length: 7 }, (_, i) => {
            const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
            const date = new Date(todayPoland);
            date.setDate(date.getDate() + i + weekOffset * 7);
            return formatDateToPolandTimezone(date);
          });
          setNextDays(days);
        } else {
          // If no available date found, use current date (Poland timezone)
          const currentDatePoland = getCurrentDateInPoland();
          setSelectedDate(currentDatePoland);
          setWeekOffset(0); // Reset to current week
          // Fetch slots for current date
          await fetchAvailableSlots(doctor.id, currentDatePoland);
        }
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      toast.error(
        "Nie udało się pobrać dostępnych terminów. Spróbuj ponownie później."
      );
    } finally {
      setWeekLoading(false);
    }
  };

  const handleDateChange = (date) => {
    // Don't allow selecting past dates (using Poland timezone)
    if (isDateInPast(date)) {
      return;
    }
    
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor.id, date);
      updateUrlWithSelections(selectedDoctor.id, date, "");
    }
  };

  const handleSelectSlot = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      if (selectedDoctor && selectedDate) {
        updateUrlWithSelections(selectedDoctor.id, selectedDate, slot.startTime);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value,
    });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!bookingForm.name.trim()) {
      errors.name = "Imię i nazwisko jest wymagane";
    }

    if (!bookingForm.phone.trim()) {
      errors.phone = "Numer telefonu jest wymagany";
    } else if (!/^[0-9]{9}$/.test(bookingForm.phone.replace(/\s/g, ""))) {
      errors.phone = "Numer telefonu musi składać się z 9 cyfr";
    }

    // PESEL: mandatory for online (unless international patient); optional for in-person. When provided, must be exactly 11 digits.
    if (bookingForm.consultationType === "online" && !bookingForm.isInternationalPatient) {
      if (!bookingForm.govtId.trim()) {
        errors.govtId = "Numer PESEL jest wymagany dla wizyty online";
      } else if (bookingForm.govtId.trim().length !== 11) {
        errors.govtId = "Numer PESEL musi mieć dokładnie 11 cyfr";
      }
    } else if (bookingForm.govtId.trim() && bookingForm.govtId.trim().length !== 11) {
      errors.govtId = "Numer PESEL musi mieć dokładnie 11 cyfr";
    }
    if (bookingForm.isInternationalPatient) {
      if (!bookingForm.documentCountry?.trim()) {
        errors.documentCountry = "Kraj wydania dokumentu jest wymagany";
      }
      if (!bookingForm.documentType?.trim()) {
        errors.documentType = "Typ dokumentu jest wymagany";
      }
      if (!bookingForm.documentNumber?.trim()) {
        errors.documentNumber = "Numer dokumentu jest wymagany";
      }
    }

    if (bookingForm.consultationType === "online") {
      // Validate address only for online consultation
      if (!bookingForm.address.trim()) {
        errors.address = "Adres zamieszkania jest wymagany";
      }

      // Validate date of birth only for online consultation
      if (!bookingForm.dateOfBirth) {
        errors.dateOfBirth = "Data urodzenia jest wymagana";
      }
    }

    // Privacy policy is always mandatory
    if (!bookingForm.privacyPolicyAgreed) {
      errors.privacyPolicyAgreed = "Akceptacja regulaminu i polityki prywatności jest wymagana";
    }

    // Additional mandatory consents for online consultation
    if (bookingForm.consultationType === "online") {
      if (!bookingForm.medicalDataProcessingAgreed) {
        errors.medicalDataProcessingAgreed = "Zgoda na przetwarzanie danych medycznych jest wymagana dla konsultacji online";
      }
      if (!bookingForm.teleportationConfirmed) {
        errors.teleportationConfirmed = "Potwierdzenie formy konsultacji online jest wymagane";
      }
      if (!bookingForm.contactConsentAgreed) {
        errors.contactConsentAgreed = "Zgoda na kontakt jest wymagana dla konsultacji online";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle phone input to allow only numbers and limit to 9 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 9) {
      // Limit to 9 digits
      setBookingForm({
        ...bookingForm,
        phone: value,
      });

      // Clear error when user starts typing
      if (formErrors.phone) {
        setFormErrors({
          ...formErrors,
          phone: null,
        });
      }
    }
  };

  const handleConfirmAppointment = async () => {
    if (!validateForm() || !selectedSlot) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format phone number by adding the selected country code
      const phone = `${bookingForm.phoneCode}${bookingForm.phone}`;

      // Get reCAPTCHA token
      const token = await handleRecaptchaV3();
      if (!token && !recaptchaToken) {
        setShowRecaptchaV2(true);
        return;
      }

      // Prepare request data (backend: create VISIT_ID, booking_source=ONLINE; never create PATIENT_ID)
      const appointmentData = {
        date: selectedDate,
        department:
          selectedDoctor.department._id || selectedDoctor.department.id,
        doctor: selectedDoctor.id,
        email: bookingForm.email,
        gender: bookingForm.gender,
        message: bookingForm.message,
        name: bookingForm.name,
        phone: phone,
        time: selectedSlot.startTime,
        consultationType: bookingForm.consultationType,
        smsConsentAgreed: bookingForm.smsConsentAgreed,
        privacyPolicyAgreed: bookingForm.privacyPolicyAgreed,
        medicalDataProcessingAgreed: bookingForm.medicalDataProcessingAgreed,
        teleportationConfirmed: bookingForm.teleportationConfirmed,
        contactConsentAgreed: bookingForm.contactConsentAgreed,
        address: bookingForm.address,
        dateOfBirth: bookingForm.dateOfBirth,
        recaptchaToken: token || recaptchaToken,
        consent: true // Required by backend middleware
      };
      // PESEL or document: send only one. Backend links to existing PATIENT_ID if PESEL exists, else stores as pending.
      if (bookingForm.isInternationalPatient) {
        const dc = bookingForm.documentCountry?.trim() || "";
        const dt = bookingForm.documentType?.trim() || "";
        const dn = bookingForm.documentNumber?.trim() || "";
        appointmentData.isInternationalPatient = true;
        appointmentData.documentCountry = dc;
        appointmentData.documentType = dt;
        appointmentData.documentNumber = dn;
        if (dc && dt && dn) {
          appointmentData.internationalPatientDocumentKey = `${dc}|${dt}|${dn}`;
        }
      } else if (bookingForm.govtId?.trim()) {
        appointmentData.govtId = bookingForm.govtId.trim();
      }

      // Make API call to book appointment
      const response = await apiCaller(
        "POST",
        "appointments/book",
        appointmentData
      );

      // Handle success: backend creates visit only (no patient); use visit data only
      const appointment = response?.data?.appointment ?? response?.data?.data ?? response?.data;
      if (appointment?.booking_source === "ONLINE") {
        toast.success("Wizyta została pomyślnie zarezerwowana! Rejestracja online.");
      } else {
        toast.success("Wizyta została pomyślnie zarezerwowana!");
      }

      // Close modal and reset form
      setShowModal(false);
      modalClosedRef.current = true;
      lastProcessedUrlRef.current = null; // Reset so modal can be opened again
      // Clear URL parameters when modal is closed
      setSearchParams({});
      setBookingForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone?.startsWith("+48")
          ? user.phone.slice(3)
          : user?.phone || "",
        phoneCode: "+48",
        gender: "male",
        message: "",
        consultationType: "offline",
        smsConsentAgreed: false,
        privacyPolicyAgreed: false,
        medicalDataProcessingAgreed: false,
        teleportationConfirmed: false,
        contactConsentAgreed: false,
        govtId: "",
        address: "",
        dateOfBirth: "",
        isInternationalPatient: false,
        documentCountry: "",
        documentType: "",
        documentNumber: "",
      });
      setSelectedSlot(null);

      // Navigate to homepage or appointment confirmation page
      setSelectedDepartment(selectedDoctor.department);
      setSelectedDoctorId(selectedDoctor.id);
      navigate("/");
    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);

      // Show error message
      const errorMessage =
        error.response?.data?.message ||
        "Nie udało się zarezerwować wizyty. Spróbuj ponownie.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Calculate dates for the next 7 days based on weekOffset
  const [nextDays, setNextDays] = useState([]);

  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
      const date = new Date(todayPoland);
      date.setDate(date.getDate() + i + weekOffset * 7);
      return formatDateToPolandTimezone(date);
    });
    setNextDays(days);
  }, [weekOffset]);

  // Initialize nextDays on component mount (using Poland timezone)
  useEffect(() => {
    const initialDays = Array.from({ length: 7 }, (_, i) => {
      const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
      const date = new Date(todayPoland);
      date.setDate(date.getDate() + i);
      return formatDateToPolandTimezone(date);
    });
    setNextDays(initialDays);
  }, []);

  const handleWeekChange = (direction) => {
    const newWeekOffset = Math.max(0, weekOffset + direction); // Ensure we don't go below 0
    setWeekOffset(newWeekOffset);
    
    // Calculate the first day of the new week (using Poland timezone)
    const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
    const firstDayOfNewWeek = new Date(todayPoland);
    firstDayOfNewWeek.setDate(firstDayOfNewWeek.getDate() + newWeekOffset * 7);
    const firstDayDate = formatDateToPolandTimezone(firstDayOfNewWeek);
    
    // Check if the currently selected date is still in the new week
    const currentSelectedDate = new Date(selectedDate);
    const firstDayOfNewWeekDate = new Date(firstDayOfNewWeek);
    const lastDayOfNewWeek = new Date(firstDayOfNewWeek);
    lastDayOfNewWeek.setDate(lastDayOfNewWeek.getDate() + 6);
    
    // If current selected date is not in the new week, reset to first day
    if (currentSelectedDate < firstDayOfNewWeekDate || currentSelectedDate > lastDayOfNewWeek) {
      setSelectedDate(firstDayDate);
      if (selectedDoctor) {
        fetchAvailableSlots(selectedDoctor.id, firstDayDate);
      }
    } else {
      // Keep the current selected date and fetch slots for it
      if (selectedDoctor) {
        fetchAvailableSlots(selectedDoctor.id, selectedDate);
      }
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-main font-serif">
          Ładowanie lekarzy...
        </h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold text-red-500">{error}</h2>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-white text-center relative doctors-section">
      <h3 className="md:text-xl font-bold text-neutral-800">ZAUFANA OPIEKA</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 sm:mb-12">
        Nasi Specjaliści
      </h2>

      <div className="max-w-7xl mx-auto">
        {doctors.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 px-4">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-[#F4F4F4] shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-sm">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-80 md:h-96 object-cover"
                />
                <div className="bg-[#F4F4F4] text-main py-6 px-6 flex-shrink-0">
                  <h4 className="text-lg font-semibold">{doctor.name}</h4>
                  <p className="text-lg font-semibold uppercase text-black">
                    {doctor.department.join(", ")}
                  </p>
                </div>

                <div className="flex flex-col mt-auto bg-[#F4F4F4] min-h-[96px]">
                  {doctor.id === '6877dbf8635211ff3ec6322d' ? (
                    <>
                      <button
                        onClick={() => navigate(generateDoctorProfileUrl({ name: { first: doctor.name.split(' ')[0], last: doctor.name.split(' ').slice(1).join(' ') } }))}
                        className="bg-gray-100 text-main font-semibold text-lg py-3 w-full hover:bg-gray-200 transition-all border-b border-gray-200"
                      >
                        Zobacz profil
                      </button>
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        className="bg-main text-white font-semibold text-lg py-3 w-full hover:bg-teal-700 transition-all"
                      >
                        Umów wizytę
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#F4F4F4] h-[48px]"></div>
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        className="bg-main text-white font-semibold text-lg py-3 w-full hover:bg-teal-700 transition-all"
                      >
                        Umów wizytę
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-600 text-center">
            Aktualnie brak dostępnych lekarzy.
          </p>
        )}
      </div>

      {/* Doctor Appointment Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-main text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-semibold">Umów wizytę</h3>
              <div className="flex items-center space-x-2">
                {/* Share Button */}
                {selectedDoctor && (
                  <button
                    onClick={handleShare}
                    className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Udostępnij link do wizyty"
                  >
                    <FaShare size={20} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    modalClosedRef.current = true;
                    lastProcessedUrlRef.current = null; // Reset so modal can be opened again
                    // Clear URL parameters when modal is closed
                    setSearchParams({});
                  }}
                  className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Info */}
                <div className="md:w-1/3">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-full h-48 object-cover object-top rounded-lg mb-4"
                    />
                    <h4 className="text-xl font-semibold">
                      {selectedDoctor.name}
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {selectedDoctor.department.name}
                    </p>

                    {doctorProfile ? (
                      <div className="mt-4 text-left">
                        {doctorProfile.bio && (
                          <div className="mb-4 pb-3 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-2">
                              O lekarzu
                            </h5>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {doctorProfile.bio}
                            </p>
                          </div>
                        )}

                        {doctorProfile.education && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">Edukacja:</span>{" "}
                            {doctorProfile.education}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Booking */}
                <div className="md:w-2/3">
                  <h4 className="text-lg font-semibold mb-4">
                    Wybierz termin wizyty
                  </h4>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleWeekChange(-1)}
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${
                          weekOffset <= 0 || weekLoading
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-main hover:bg-gray-100"
                        }`}
                        disabled={weekOffset <= 0 || weekLoading}
                      >
                        <FaChevronLeft className="mr-1" />
                        Poprzedni tydzień
                      </button>
                      
                      <span className="text-sm text-gray-600 font-medium">
                        {weekLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-main mr-2"></div>
                            <span>Ładowanie...</span>
                          </div>
                        ) : (
                          <>
                            {weekOffset === 0 
                              ? "Ten tydzień" 
                              : (() => {
                                  let weekText;
                                  if (weekOffset === 1) {
                                    weekText = "tydzień";
                                  } else if (weekOffset >= 2 && weekOffset <= 4) {
                                    weekText = "tygodnie";
                                  } else {
                                    weekText = "tygodni";
                                  }
                                  return `Za ${weekOffset} ${weekText}`;
                                })()}
                            {selectedDate && weekOffset > 0 && (
                              <span className="block text-xs text-main">
                                Następny termin: {new Date(selectedDate).toLocaleDateString('pl-PL')}
                              </span>
                            )}
                            {nextDays.length > 0 && (
                              <span className="block text-xs text-gray-500">
                                {new Date(nextDays[0]).toLocaleDateString('pl-PL')} - {new Date(nextDays[6]).toLocaleDateString('pl-PL')}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                      
                      <button
                        onClick={() => handleWeekChange(1)}
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${
                          weekLoading
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-main hover:bg-gray-100"
                        }`}
                        disabled={weekLoading}
                      >
                        Następny tydzień
                        <FaChevronRight className="ml-1" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {nextDays.map((date) => {
                        const today = getCurrentDateInPoland();
                        const isToday = date === today;
                        const isActive = date === selectedDate;

                        const isPast = isDateInPast(date);
                        const dayDate = new Date(date + "T12:00:00");

                        return (
                          <button
                            key={date}
                            onClick={() => !isPast && handleDateChange(date)}
                            disabled={isPast}
                            className={`px-2 py-3 rounded-lg border text-sm ${
                              isActive
                                ? "bg-main text-white border-main"
                                : isPast
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="font-medium">
                              {dayDate.toLocaleDateString("pl-PL", {
                                weekday: "short",
                              })}
                            </div>
                            <div className="font-semibold">
                              {dayDate.getDate()}/{dayDate.getMonth() + 1}
                            </div>
                            {isToday && <div className="text-xs">Dziś</div>}
                            {isPast && <div className="text-xs text-gray-400">Przeszły</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dostępne godziny
                    </label>

                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!slot.available}
                            className={`px-4 py-2 rounded-lg border text-sm ${
                              selectedSlot &&
                              selectedSlot.startTime === slot.startTime
                                ? "bg-main text-white border-main"
                                : slot.available
                                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <FaCalendarAlt
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <p className="text-gray-700">
                          Brak dostępnych terminów w wybranym dniu
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Patient Information Form */}
                  {selectedSlot && (
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-semibold mb-4">
                        Dane pacjenta
                      </h4>

                      {/* Step 1: Consultation Type Selection */}
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-800 mb-3">Krok 1: Typ konsultacji</h5>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() =>
                              setBookingForm({
                                ...bookingForm,
                                consultationType: "offline",
                              })
                            }
                            className={`px-4 py-2 rounded-md border ${
                              bookingForm.consultationType === "offline"
                                ? "bg-main text-white border-main"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            Wizyta stacjonarna
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBookingForm({
                                ...bookingForm,
                                consultationType: "online",
                              })
                            }
                            className={`px-4 py-2 rounded-md border ${
                              bookingForm.consultationType === "online"
                                ? "bg-main text-white border-main"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            Wizyta online
                          </button>
                        </div>
                      </div>

                      {/* Step 2: Basic Information */}
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-800 mb-3">Krok 2: Podstawowe informacje</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Imię i nazwisko*
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={bookingForm.name}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border ${
                                formErrors.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                              placeholder="Jan Kowalski"
                            />
                            {formErrors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {formErrors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Płeć
                            </label>
                            <select
                              name="gender"
                              value={bookingForm.gender}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="male">Mężczyzna</option>
                              <option value="female">Kobieta</option>
                              <option value="other">Inna</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Adres email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={bookingForm.email}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border ${
                                formErrors.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                              placeholder="jan.kowalski@example.com"
                            />
                            {formErrors.email && (
                              <p className="text-red-500 text-xs mt-1">
                                {formErrors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Telefon* (9 cyfr)
                            </label>
                            <div className="flex w-full overflow-hidden">
                              <PhoneCodeSelect
                                value={bookingForm.phoneCode}
                                onChange={(code) => handleInputChange({ target: { name: "phoneCode", value: code } })}
                                className="flex-shrink-0"
                              />
                              <input
                                type="tel"
                                name="phone"
                                value={bookingForm.phone}
                                onChange={handlePhoneChange}
                                className={`h-[42px] flex-1 min-w-0 px-3 py-2 border ${
                                  formErrors.phone
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-r-md focus:outline-none focus:ring-1 focus:ring-teal-500 border-l-0`}
                                placeholder="123456789"
                                maxLength="9"
                                style={{ lineHeight: '1.5' }}
                              />
                            </div>
                            {formErrors.phone ? (
                              <p className="text-red-500 text-xs mt-1">
                                {formErrors.phone}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">
                                Format: 9 cyfr bez spacji i znaków specjalnych
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: PESEL (main, centered) then checkbox underneath */}
                      <div className="mb-6">
                        <h5 className="text-md font-semibold text-gray-800 mb-3">
                          Krok 3: Identyfikacja {bookingForm.consultationType === "online" && !bookingForm.isInternationalPatient ? "(PESEL wymagane)" : "(PESEL opcjonalnie – dla naszych pacjentów)"}
                        </h5>
                        <div className="flex flex-col items-center w-full mb-4">
                          <div className="w-full max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center md:text-left">
                              {bookingForm.consultationType === "online" && !bookingForm.isInternationalPatient ? "PESEL (wymagane dla wizyty online) *" : "PESEL (opcjonalnie – dla naszych pacjentów)"}
                            </label>
                            <input
                              type="text"
                              name="govtId"
                              value={bookingForm.govtId}
                              disabled={!!bookingForm.isInternationalPatient}
                              onChange={(e) => {
                                if (!bookingForm.isInternationalPatient) {
                                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                                  handleInputChange({ target: { name: 'govtId', value } });
                                }
                              }}
                              className={`w-full px-3 py-2 border ${
                                formErrors.govtId
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                              placeholder="Wprowadź numer PESEL (11 cyfr)"
                              maxLength={11}
                            />
                            {formErrors.govtId && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.govtId}</p>
                            )}
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-3">
                            <input
                              type="checkbox"
                              checked={bookingForm.isInternationalPatient}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setBookingForm((prev) => ({
                                  ...prev,
                                  isInternationalPatient: checked,
                                  govtId: checked ? "" : prev.govtId,
                                  documentCountry: checked ? prev.documentCountry : "",
                                  documentType: checked ? prev.documentType : "",
                                  documentNumber: checked ? prev.documentNumber : "",
                                }));
                                if (formErrors.govtId || formErrors.documentCountry || formErrors.documentType || formErrors.documentNumber) {
                                  setFormErrors((prev) => ({ ...prev, govtId: null, documentCountry: null, documentType: null, documentNumber: null }));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">Nie posiadam numeru PESEL (pacjent międzynarodowy)</span>
                          </label>
                        </div>

                        {bookingForm.consultationType === "online" && (
                          <div className="flex flex-col items-center w-full mb-4">
                            <div className="w-full max-w-sm">
                              <label className="block text-sm font-medium text-gray-700 mb-1 text-center md:text-left">
                                Data urodzenia*
                              </label>
                              <input
                                type="date"
                                name="dateOfBirth"
                                value={bookingForm.dateOfBirth}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${
                                  formErrors.dateOfBirth
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                                max={new Date().toISOString().split("T")[0]}
                              />
                              {formErrors.dateOfBirth && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors.dateOfBirth}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                          {bookingForm.isInternationalPatient && (
                            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <h6 className="text-sm font-medium text-gray-700 mb-3">Dane dokumentu tożsamości</h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Kraj wydania dokumentu *</label>
                                  <input
                                    type="text"
                                    name="documentCountry"
                                    value={bookingForm.documentCountry}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Germany, Poland"
                                    className={`w-full px-3 py-2 border ${formErrors.documentCountry ? "border-red-500" : "border-gray-300"} rounded-md`}
                                  />
                                  {formErrors.documentCountry && <p className="text-red-500 text-xs mt-1">{formErrors.documentCountry}</p>}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu *</label>
                                  <select
                                    name="documentType"
                                    value={bookingForm.documentType}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.documentType ? "border-red-500" : "border-gray-300"} rounded-md`}
                                  >
                                    <option value="">Wybierz</option>
                                    <option value="Passport">Paszport</option>
                                    <option value="ID Card">Dowód osobisty</option>
                                    <option value="Residence Card">Karta pobytu</option>
                                    <option value="Other">Inny</option>
                                  </select>
                                  {formErrors.documentType && <p className="text-red-500 text-xs mt-1">{formErrors.documentType}</p>}
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Numer dokumentu *</label>
                                  <input
                                    type="text"
                                    name="documentNumber"
                                    value={bookingForm.documentNumber}
                                    onChange={handleInputChange}
                                    placeholder="Document number"
                                    className={`w-full px-3 py-2 border ${formErrors.documentNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
                                  />
                                  {formErrors.documentNumber && <p className="text-red-500 text-xs mt-1">{formErrors.documentNumber}</p>}
                                </div>
                              </div>
                            </div>
                          )}

                        {bookingForm.consultationType === "online" && (
                          <>
                            <h5 className="text-md font-semibold text-gray-800 mb-3 mt-6">Dodatkowe informacje (wymagane dla konsultacji online)</h5>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adres zamieszkania*
                              </label>
                            <textarea
                              name="address"
                              value={bookingForm.address}
                              onChange={handleInputChange}
                              rows="2"
                              className={`w-full px-3 py-2 border ${
                                formErrors.address
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                              placeholder="Ulica, numer domu/mieszkania, kod pocztowy, miasto"
                            />
                            {formErrors.address && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors.address}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Additional Information */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dodatkowe informacje
                        </label>
                        <textarea
                          name="message"
                          value={bookingForm.message}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="Prosimy opisać krótko swój problem zdrowotny oraz wskazać usługę, którą są Państwo zainteresowani (np. konsultacja chirurgiczna, usunięcie zmiany skórnej)."
                        ></textarea>
                      </div>

                      {/* Consent Checkboxes */}
                      <div className="mb-4 space-y-4">
                        {/* Mandatory Privacy Policy Consent */}
                        <div>
                          <label className="flex items-start space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="privacyPolicyAgreed"
                              checked={bookingForm.privacyPolicyAgreed}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  privacyPolicyAgreed: e.target.checked,
                                })
                              }
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                            />
                            <span className="text-sm text-gray-700">
                              Zapoznałem(-am) się z{" "}
                              <button
                          type="button"
                          onClick={() => window.open('/regulamin', '_blank')}
                          className="text-main hover:text-main-dark underline"
                        >
                          Regulaminem
                        </button>{" "}
                        i{" "}
                        <button
                          type="button"
                          onClick={() => window.open('/polityka-prywatnosci', '_blank')}
                          className="text-main hover:text-main-dark underline"
                        >
                          Polityką Prywatności
                        </button>{" "}
                              i akceptuję ich postanowienia. <span className="text-red-500">*</span>
                            </span>
                          </label>
                          {formErrors.privacyPolicyAgreed && (
                            <p className="text-red-500 text-xs mt-1 ml-6">
                              {formErrors.privacyPolicyAgreed}
                            </p>
                          )}
                        </div>

                        {/* Online consultation specific consents */}
                        {bookingForm.consultationType === "online" && (
                          <>
                            {/* Medical Data Processing Consent */}
                            <div>
                              <label className="flex items-start space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="medicalDataProcessingAgreed"
                                  checked={bookingForm.medicalDataProcessingAgreed}
                                  onChange={(e) =>
                                    setBookingForm({
                                      ...bookingForm,
                                      medicalDataProcessingAgreed: e.target.checked,
                                    })
                                  }
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                                />
                                <span className="text-sm text-gray-700">
                                  Wyrażam zgodę na przetwarzanie moich danych osobowych, w tym danych medycznych, w celu realizacji konsultacji medycznej online, zgodnie z art. 9 ust. 2 lit. h RODO. <span className="text-red-500">*</span>
                                </span>
                              </label>
                              {formErrors.medicalDataProcessingAgreed && (
                                <p className="text-red-500 text-xs mt-1 ml-6">
                                  {formErrors.medicalDataProcessingAgreed}
                                </p>
                              )}
                            </div>

                            {/* Teleportation Confirmation */}
                            <div>
                              <label className="flex items-start space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="teleportationConfirmed"
                                  checked={bookingForm.teleportationConfirmed}
                                  onChange={(e) =>
                                    setBookingForm({
                                      ...bookingForm,
                                      teleportationConfirmed: e.target.checked,
                                    })
                                  }
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                                />
                                <span className="text-sm text-gray-700">
                                  Potwierdzam, że konsultacja medyczna odbędzie się w formie zdalnej (online) i jestem świadomy(-a) tej formy świadczenia zdrowotnego. <span className="text-red-500">*</span>
                                </span>
                              </label>
                              {formErrors.teleportationConfirmed && (
                                <p className="text-red-500 text-xs mt-1 ml-6">
                                  {formErrors.teleportationConfirmed}
                                </p>
                              )}
                            </div>

                            {/* Contact Consent */}
                            <div>
                              <label className="flex items-start space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="contactConsentAgreed"
                                  checked={bookingForm.contactConsentAgreed}
                                  onChange={(e) =>
                                    setBookingForm({
                                      ...bookingForm,
                                      contactConsentAgreed: e.target.checked,
                                    })
                                  }
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                                />
                                <span className="text-sm text-gray-700">
                                  Wyrażam zgodę na kontakt telefoniczny lub e-mailowy w celu realizacji konsultacji online, w tym przesłania linku do spotkania. <span className="text-red-500">*</span>
                                </span>
                              </label>
                              {formErrors.contactConsentAgreed && (
                                <p className="text-red-500 text-xs mt-1 ml-6">
                                  {formErrors.contactConsentAgreed}
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        {/* Voluntary SMS Consent */}
                        <div>
                          <label className="flex items-start space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="smsConsentAgreed"
                              checked={bookingForm.smsConsentAgreed}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  smsConsentAgreed: e.target.checked,
                                })
                              }
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                            />
                            <span className="text-sm text-gray-700">
                              Wyrażam zgodę na otrzymywanie powiadomień SMS i e-mail dotyczących mojej wizyty (np. przypomnienia, zmiany terminu).
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        * Pola oznaczone gwiazdką są wymagane
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* reCAPTCHA v2 */}
            {showRecaptchaV2 && (
              <div className="px-6 py-4 flex justify-center">
                <ReCAPTCHA
                  sitekey="6Led3nUrAAAAAGbxFJkTZbB-JDzwTQf7kf-PBzGm"
                  onChange={handleRecaptchaV2Change}
                  onExpired={handleRecaptchaV2Expire}
                />
              </div>
            )}

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end sticky bottom-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  modalClosedRef.current = true;
                  lastProcessedUrlRef.current = null; // Reset so modal can be opened again
                  // Clear URL parameters when modal is closed
                  setSearchParams({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={!selectedSlot || isSubmitting}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  selectedSlot && !isSubmitting
                    ? "bg-main hover:bg-teal-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Potwierdź wizytę
              </button>
            </div>
          </div>
        </div>
      )}


    </section>
  );
}
