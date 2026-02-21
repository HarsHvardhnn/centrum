import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaPhone, FaEnvelope, FaGraduationCap, FaClock, FaMapMarkerAlt, FaShare, FaTimes, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'sonner';
import { apiCaller } from '../../../utils/axiosInstance';
import MetaTags from '../../UtilComponents/MetaTags';
import NotFound404 from '../../UtilComponents/NotFound';
import Doctors from '../Doctors';
import doctorService from '../../../helpers/doctorHelper';
import { useUser } from '../../../context/userContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';
import { getCurrentDateInPoland, formatDateToPolandTimezone, isDateInPast, getDateAtMidnightPoland } from '../../../utils/polandTimezone';

const DoctorProfilePage = () => {
  const { doctorSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showRecaptchaV2, setShowRecaptchaV2] = useState(false);
  const [recaptchaV2Ref, setRecaptchaV2Ref] = useState(null);

  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getCurrentDateInPoland()
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
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
  const [showAllServices, setShowAllServices] = useState(false);
  // Track which days have available slots
  const [daysWithSlots, setDaysWithSlots] = useState(new Set());
  const [checkingSlots, setCheckingSlots] = useState(false);
  // Cache week availability data to avoid redundant API calls
  const [weekAvailabilityCache, setWeekAvailabilityCache] = useState(null);

  // Phone country codes configuration
  const phoneCountryCodes = [
    { code: "+48", country: "Polska", flag: "🇵🇱", maxLength: 9, default: true },
    { code: "+380", country: "Ukraina", flag: "🇺🇦", maxLength: 9 },
    { code: "+49", country: "Niemcy", flag: "🇩🇪", maxLength: 11 },
    { code: "+44", country: "Wielka Brytania", flag: "🇬🇧", maxLength: 10 },
    { code: "+34", country: "Hiszpania", flag: "🇪🇸", maxLength: 9 },
    { code: "+33", country: "Francja", flag: "🇫🇷", maxLength: 9 },
    { code: "+43", country: "Austria", flag: "🇦🇹", maxLength: 10 },
    { code: "+39", country: "Włochy", flag: "🇮🇹", maxLength: 10 },
    { code: "+420", country: "Czechy", flag: "🇨🇿", maxLength: 9 },
    { code: "+1", country: "USA", flag: "🇺🇸", maxLength: 10 }
  ];

  useEffect(() => {
    fetchDoctorBySlug();
  }, [doctorSlug]);

  // Initialize booking form with user data
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

  const fetchDoctorBySlug = async () => {
    try {
      setLoading(true);
      const response = await apiCaller("GET", `/docs/profile/slug/${doctorSlug}`);
      
      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        setError('Doctor not found');
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  // Booking-related functions
  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setSlotsLoading(true);
      
      // Check if we have cached week availability data for this date
      if (weekAvailabilityCache && weekAvailabilityCache.availability) {
        const cachedDay = weekAvailabilityCache.availability.find(
          day => day.date === date
        );
        
        if (cachedDay && cachedDay.hasSlots && cachedDay.availableSlots) {
          // Use cached data if available
          setAvailableSlots(cachedDay.availableSlots);
          return;
        } else if (cachedDay && !cachedDay.hasSlots) {
          // No slots available according to cache
          setAvailableSlots([]);
          return;
        }
      }
      
      // Fallback to API call if cache doesn't have this date
      const response = await apiCaller(
        "GET",
        `docs/schedule/available-slots/${doctorId}?date=${date}`
      );
      if (response.data.success) {
        setAvailableSlots(response.data.data);
        // Update daysWithSlots based on whether slots are available
        if (response.data.data && response.data.data.length > 0) {
          const hasAvailableSlots = response.data.data.some(slot => slot.available);
          setDaysWithSlots(prev => {
            const newSet = new Set(prev);
            if (hasAvailableSlots) {
              newSet.add(date);
            } else {
              newSet.delete(date);
            }
            return newSet;
          });
        } else {
          setDaysWithSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(date);
            return newSet;
          });
        }
      } else {
        console.error("Failed to fetch available slots");
        setDaysWithSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(date);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setDaysWithSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(date);
        return newSet;
      });
    } finally {
      setSlotsLoading(false);
    }
  };

  // Fetch slot availability for all days in the current week using new optimized endpoint
  const fetchWeekSlotAvailability = async (doctorId, days) => {
    if (!doctorId || !days || days.length === 0) return;
    
    try {
      setCheckingSlots(true);
      
      // Get start and end dates from the days array
      const startDate = days[0];
      const endDate = days[days.length - 1];
      
      // Use the new week availability endpoint
      const response = await doctorService.getWeekAvailability(doctorId, startDate, endDate);
      
      if (response.success && response.data && response.data.availability) {
        // Process the availability data from the new endpoint
        const newDaysWithSlots = new Set();
        response.data.availability.forEach((dayAvailability) => {
          if (dayAvailability.hasSlots) {
            newDaysWithSlots.add(dayAvailability.date);
          }
        });
        setDaysWithSlots(newDaysWithSlots);
        
        // Cache the week availability data for potential reuse
        setWeekAvailabilityCache(response.data);
      } else {
        // Fallback: if response structure is unexpected, mark all days as having no slots
        console.warn("Unexpected response structure from week availability endpoint");
        setDaysWithSlots(new Set());
        setWeekAvailabilityCache(null);
      }
    } catch (error) {
      console.error("Error fetching week slot availability:", error);
      // On error, fall back to checking individual dates (old method)
      console.log("Falling back to individual date checks...");
      try {
        const today = getCurrentDateInPoland();
        const slotChecks = days
          .filter(date => date >= today)
          .map(async (date) => {
            try {
              const response = await apiCaller(
                "GET",
                `docs/schedule/available-slots/${doctorId}?date=${date}`
              );
              if (response.data.success && response.data.data) {
                const hasAvailableSlots = response.data.data.some(slot => slot.available);
                return { date, hasSlots: hasAvailableSlots };
              }
              return { date, hasSlots: false };
            } catch (error) {
              console.error(`Error checking slots for ${date}:`, error);
              return { date, hasSlots: false };
            }
          });

        const results = await Promise.all(slotChecks);
        const newDaysWithSlots = new Set();
        results.forEach(({ date, hasSlots }) => {
          if (hasSlots) {
            newDaysWithSlots.add(date);
          }
        });
        setDaysWithSlots(newDaysWithSlots);
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
        setDaysWithSlots(new Set());
      }
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleBookAppointmentModal = async () => {
    if (!doctor) return;

    setShowBookingModal(true);
    setWeekLoading(true);

    // Get the correct doctor ID (could be _id or id)
    const doctorId = doctor._id || doctor.id;
    
    console.log('Doctor object:', doctor);
    console.log('Doctor ID:', doctorId);

    if (!doctorId) {
      console.error('No doctor ID found in doctor object');
      toast.error("Nie udało się znaleźć ID lekarza. Spróbuj ponownie później.");
      setWeekLoading(false);
      return;
    }

    try {
      // Fetch next available date
      const nextAvailableResponse = await doctorService.getNextAvailableDate(
        doctorId
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
        
        // Update daysWithSlots for the next available date
        if (nextAvailableResponse.data.availableSlots && nextAvailableResponse.data.availableSlots.length > 0) {
          const hasAvailableSlots = nextAvailableResponse.data.availableSlots.some(slot => slot.available);
          setDaysWithSlots(prev => {
            const newSet = new Set(prev);
            if (hasAvailableSlots) {
              newSet.add(nextAvailableDate);
            }
            return newSet;
          });
        }
        
        // Force update the nextDays array to show the correct week immediately (using Poland timezone)
        const days = Array.from({ length: 7 }, (_, i) => {
          const todayPoland = getDateAtMidnightPoland(getCurrentDateInPoland());
          const date = new Date(todayPoland);
          date.setDate(date.getDate() + i + weekOffset * 7);
          return formatDateToPolandTimezone(date);
        });
        setNextDays(days);
        
        // Fetch slot availability for all days in the week
        fetchWeekSlotAvailability(doctorId, days);
      } else {
        // If no available date found, use current date (Poland timezone)
        const currentDatePoland = getCurrentDateInPoland();
        setSelectedDate(currentDatePoland);
        setWeekOffset(0); // Reset to current week
        // Fetch slots for current date
        await fetchAvailableSlots(doctorId, currentDatePoland);
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
    if (doctor) {
      const doctorId = doctor._id || doctor.id;
      fetchAvailableSlots(doctorId, date);
    }
  };

  const handleSelectSlot = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
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

    // PESEL is optional. When international patient, require document fields instead.
    if (bookingForm.consultationType === "online") {
      if (bookingForm.govtId.trim() && bookingForm.govtId.length > 15) {
        errors.govtId = "Numer PESEL nie może być dłuższy niż 15 znaków";
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

  const handleConfirmAppointment = async () => {
    if (!validateForm() || !selectedSlot) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Get reCAPTCHA token
      const token = await handleRecaptchaV3();
      if (!token && !recaptchaToken) {
        setShowRecaptchaV2(true);
        return;
      }

      // Format phone number by adding the selected country code
      const phone = `${bookingForm.phoneCode}${bookingForm.phone}`;

      // Get the correct doctor ID (could be _id or id)
      const doctorId = doctor._id || doctor.id;

      // Create a simplified doctor object for appointment booking
      const doctorForBooking = {
        id: doctorId,
        name: `${doctor.name.first} ${doctor.name.last}`,
        department: doctor.specializations?.[0] // Use first specialization
      };

      // Prepare request data (backend: create VISIT_ID, booking_source=ONLINE; never create PATIENT_ID)
      const appointmentData = {
        date: selectedDate,
        department: doctor.specializations?.[0]?._id || doctor.specializations?.[0]?.id,
        doctor: doctorId,
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
        recaptchaToken: token || recaptchaToken,
        consent: true, // Required by backend middleware
        address: bookingForm.address,
        dateOfBirth: bookingForm.dateOfBirth
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
      setShowBookingModal(false);
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
      setRecaptchaToken(null);

    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);

      // Show error message
      const errorMessage =
        error.response?.data?.message ||
        "Nie udało się zarezerwować wizyty. Spróbuj ponownie.";
      toast.error(errorMessage);

      // If reCAPTCHA verification failed, show v2
      if (error.response?.status === 400 && error.response?.data?.error?.includes('recaptcha')) {
        setShowRecaptchaV2(true);
      }
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
    
    // Clear cache when week changes
    setWeekAvailabilityCache(null);
    
    // Fetch slot availability for all days in the week when week changes
    if (doctor && days.length > 0) {
      const doctorId = doctor._id || doctor.id;
      if (doctorId) {
        fetchWeekSlotAvailability(doctorId, days);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, doctor?._id, doctor?.id]);

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
      if (doctor) {
        const doctorId = doctor._id || doctor.id;
        fetchAvailableSlots(doctorId, firstDayDate);
      }
    } else {
      // Keep the current selected date and fetch slots for it
      if (doctor) {
        const doctorId = doctor._id || doctor.id;
        fetchAvailableSlots(doctorId, selectedDate);
      }
    }
  };

  const handleBookAppointment = () => {
    handleBookAppointmentModal();
  };

  // Truncate text to first N words
  const truncateText = (text, wordLimit = 20) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Navigate to service page
  const handleReadMore = (serviceSlug) => {
    if (serviceSlug) {
      navigate(`/uslugi/${serviceSlug}`);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link skopiowany do schowka!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
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
  };

  // Generate structured data for Schema.org
  const generateStructuredData = () => {
    if (!doctor) return null;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Physician",
      "name": `${doctor.name?.first} ${doctor.name?.last}`,
      "jobTitle": doctor.specializations?.map(spec => spec.name).join(", "),
      "worksFor": {
        "@type": "MedicalOrganization",
        "name": "CM7",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Skarżysko-Kamienna",
          "addressCountry": "PL"
        },
        "telephone": "797-097-487"
      },
      "medicalSpecialty": doctor.specializations?.map(spec => spec.name),
      "image": doctor.image,
      "description": doctor.bio,
      "url": window.location.href,
      "offers": []
    };

    // Add consultation offers
    if (doctor.onlineConsultationPrice !== undefined) {
      structuredData.offers.push({
        "@type": "Offer",
        "name": "Konsultacja online",
        "price": doctor.onlineConsultationPrice,
        "priceCurrency": "PLN"
      });
    }

    if (doctor.offlineConsultationPrice !== undefined) {
      structuredData.offers.push({
        "@type": "Offer",
        "name": "Konsultacja stacjonarna",
        "price": doctor.offlineConsultationPrice,
        "priceCurrency": "PLN"
      });
    }

    return structuredData;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return <NotFound404 />;
  }

  const doctorName = `${doctor.name?.first} ${doctor.name?.last}`;
  const specializations = doctor.specializations?.map(spec => spec.name).join(", ") || "lekarz";
  const experience = doctor.experience ? `${doctor.experience} lat doświadczenia` : "";
  
  // Generate meta title and description
  // Title format: Lek. {Name} – {specializations} | Centrum Medyczne 7
  const metaTitle = `Lek. ${doctorName} – ${specializations} | Centrum Medyczne 7`;
  
  // Description: Use shortDescription if available, otherwise generate default
  const metaDescription = doctor.shortDescription || `Lek. ${doctorName} – ${specializations}${specializations ? ' przyjmujący pacjentów' : ''} w Centrum Medycznym 7 w Skarżysku-Kamiennej.${experience ? ` ${experience}.` : ''} ${doctor.onlineConsultationPrice !== undefined ? `Konsultacje online od ${doctor.onlineConsultationPrice} zł.` : 'Konsultacje dostępne.'}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <MetaTags 
        title={metaTitle}
        description={metaDescription}
        path={`/lekarze/${doctorSlug}`}
        ogImage={doctor.image}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData()) }}
      />

      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Doctor Image */}
              <div className="flex-shrink-0">
                <img
                  src={doctor.image || "https://via.placeholder.com/300x400"}
                  alt={doctorName}
                  className="w-64 h-80 object-cover rounded-lg shadow-xl"
                />
              </div>

              {/* Doctor Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {doctorName}
                </h1>
                <div className="text-xl lg:text-2xl mb-4 text-teal-100">
                  {specializations}
                </div>
                {experience && (
                  <div className="text-lg mb-6 text-teal-200">
                    {experience}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleBookAppointment}
                    className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaCalendarAlt size={20} />
                    Umów wizytę z {doctor?.name?.first}
                  </button>
                  <button
                    onClick={handleShare}
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShare />
                    Udostępnij profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Quick View Section */}
        {doctor.doctorServices && doctor.doctorServices.services && doctor.doctorServices.services.length > 0 && (
          <div className="bg-white shadow-lg -mt-8 relative z-10 max-w-6xl mx-auto rounded-xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dostępne usługi</h2>
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  {showAllServices ? (
                    <>
                      Pokaż mniej <FaChevronUp />
                    </>
                  ) : (
                    <>
                      Pokaż więcej <FaChevronDown />
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid gap-6">
                {doctor.doctorServices.services
                  .filter(service => service.status === "active")
                  .slice(0, showAllServices ? undefined : 1)
                  .map((service, index) => {
                    const serviceId = service._id || index;
                    const serviceName = service.service.title || 
                      (service.service.shortDescription && service.service.shortDescription.split('.')[0]) || 
                      `Konsultacja ${index + 1}`;
                    const description = service.service.description || '';
                    const shouldTruncate = description.split(' ').length > 20;
                    const displayText = shouldTruncate ? truncateText(description, 20) : description;
                    const serviceSlug = service.service.slug;
                    console.log("slug",service)
                    return (
                      <div 
                        key={serviceId}
                        className="bg-gray-50 rounded-lg p-6 transition-all hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-teal-800 mb-1">
                              {serviceName}
                            </h3>
                            {description && (
                              <div className="text-gray-600 text-sm leading-relaxed">
                                <p>{displayText}</p>
                                {shouldTruncate && serviceSlug && (
                                  <button
                                    onClick={() => handleReadMore(serviceSlug)}
                                    className="text-teal-600 hover:text-teal-800 font-medium mt-2 text-sm flex items-center gap-1"
                                  >
                                    Czytaj więcej <FaChevronDown className="text-xs" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-xl font-bold text-teal-600 whitespace-nowrap flex-shrink-0">
                            {service.price ? `${service.price} zł` : 'Cena do ustalenia'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {doctor.doctorServices.services.filter(service => service.status === "active").length > 3 && !showAllServices && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  {doctor.doctorServices.services.filter(service => service.status === "active").length - 3} więcej usług dostępnych
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Doctor Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {doctor.bio && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">O lekarzu</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {doctor.bio}
                  </div>
                </div>
              )}

              {/* Education */}
              {doctor.education && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaGraduationCap className="text-teal-600" />
                    Wykształcenie
                  </h2>
                  <div className="text-gray-700">
                    {doctor.education}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {doctor?.qualifications && doctor?.qualifications?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Kwalifikacje</h2>
                  <ul className="list-disc pl-6 text-gray-700">
                    {doctor?.qualifications?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specializations */}
              {doctor.specializations && doctor.specializations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Specjalizacje</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {doctor.specializations.map((spec, index) => (
                      <div key={index} className="bg-teal-50 rounded-lg p-4">
                        <h3 className="font-semibold text-teal-800">{spec.name}</h3>
                        {spec.description && (
                          <p className="text-sm text-gray-600 mt-1">{spec.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {/* This section is now handled by the quick view */}
            </div>

            {/* Right Column - Quick Info & Booking */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Informacje</h3>
                
                {doctor.experience && (
                  <div className="flex items-center gap-3 mb-4">
                    <FaClock className="text-teal-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-800">Doświadczenie</div>
                      <div className="text-gray-600">{doctor.experience} lat</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-800">Lokalizacja</div>
                    <div className="text-gray-600">Skarżysko-Kamienna</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaPhone className="text-teal-600 flex-shrink-0 scale-x-[-1]" />
                  <div>
                    <div className="font-medium text-gray-800">Rejestracja</div>
                    <a href="tel:+48797097487" className="text-teal-600 hover:text-teal-800">
                      797 097 487
                    </a>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cennik i Rezerwacja</h3>
                
                {doctor.offlineConsultationPrice !== undefined && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-800">Wizyta stacjonarna</div>
                    <div className="text-2xl font-bold text-teal-600">
                      {doctor.offlineConsultationPrice === 0 ? 'Darmowa' : `${doctor.offlineConsultationPrice} zł`}
                    </div>
                  </div>
                )}

                {doctor.onlineConsultationPrice !== undefined && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-800">Konsultacja online</div>
                    <div className="text-2xl font-bold text-teal-600">
                      {doctor.onlineConsultationPrice === 0 ? 'Darmowa' : `${doctor.onlineConsultationPrice} zł`}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleBookAppointment}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCalendarAlt />
                    Rezerwuj wizytę
                  </button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">lub zadzwoń</p>
                    <a 
                      href="tel:+48797097487" 
                      className="text-teal-600 font-semibold hover:text-teal-800 flex items-center justify-center gap-2 mt-1"
                    >
                      <FaPhone />
                      797 097 487
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Kontakt</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-teal-600 scale-x-[-1]" />
                    <a href="tel:+48797097487" className="text-gray-700 hover:text-teal-600">
                      797 097 487
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-teal-600" />
                    <a href="mailto:kontakt@centrummedyczne7.pl" className="text-gray-700 hover:text-teal-600">
                      kontakt@centrummedyczne7.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Doctors Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Inni specjaliści
            </h2>
            <Doctors
              selectedDoctorId={null}
              setSelectedDoctorId={() => {}}
              setSelectedDepartment={() => {}}
            />
          </div>
        </div>

        {/* Floating Booking Button */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={handleBookAppointment}
            className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-all hover:scale-105 flex items-center gap-2"
          >
            <FaCalendarAlt />
            <span className="hidden sm:inline">Umów wizytę</span>
            <span className="sm:hidden">Umów</span>
          </button>
        </div>

        {/* Doctor Appointment Booking Modal */}
        {showBookingModal && doctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-auto max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-semibold">Umów wizytę z {doctorName}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Info */}
                  <div className="md:w-1/3">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <img
                        src={doctor.image || "https://via.placeholder.com/300x400"}
                        alt={doctorName}
                        className="w-full h-48 object-cover object-top rounded-lg mb-4"
                      />
                      <h4 className="text-xl font-semibold">{doctorName}</h4>
                      <p className="text-gray-700 font-medium">
                        {specializations}
                      </p>

                      <div className="mt-4 text-left">
                        {doctor.bio && (
                          <div className="mb-4 pb-3 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-2">
                              O lekarzu
                            </h5>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {doctor.bio}
                            </p>
                          </div>
                        )}

                        {doctor.education && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">Edukacja:</span>{" "}
                            {doctor.education}
                          </p>
                        )}
                      </div>
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
                              : "text-teal-600 hover:bg-gray-100"
                          }`}
                          disabled={weekOffset <= 0 || weekLoading}
                        >
                          <FaChevronLeft className="mr-1" />
                          Poprzedni tydzień
                        </button>
                        
                        <span className="text-sm text-gray-600 font-medium">
                          {weekLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500 mr-2"></div>
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
                                <span className="block text-xs text-teal-600">
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
                              : "text-teal-600 hover:bg-gray-100"
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
                          const hasSlots = daysWithSlots.has(date);
                          const isChecking = checkingSlots && !isPast;
                          const dayDate = new Date(date + "T12:00:00");

                          return (
                            <button
                              key={date}
                              onClick={() => !isPast && hasSlots && handleDateChange(date)}
                              disabled={isPast || !hasSlots}
                              className={`px-2 py-3 rounded-lg border text-sm transition-all ${
                                isActive
                                  ? "bg-teal-600 text-white border-teal-600"
                                  : isPast
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                  : !hasSlots && !isChecking
                                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-40"
                                  : isChecking
                                  ? "bg-gray-100 text-gray-500 border-gray-300 cursor-wait"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-teal-300"
                              }`}
                              title={!hasSlots && !isPast ? "Brak dostępnych terminów" : ""}
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
                              {!hasSlots && !isPast && !isChecking && (
                                <div className="text-xs text-gray-400">Brak terminów</div>
                              )}
                              {isChecking && <div className="text-xs text-gray-400">Sprawdzanie...</div>}
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
                                  ? "bg-teal-600 text-white border-teal-600"
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
                                  ? "bg-teal-600 text-white border-teal-600"
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
                                  ? "bg-teal-600 text-white border-teal-600"
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
                                Telefon* (9 cyfr)
                              </label>
                              <div className="flex w-full overflow-hidden">
                                <div className="relative flex-shrink-0">
                                  <select
                                    name="phoneCode"
                                    value={bookingForm.phoneCode}
                                    onChange={handleInputChange}
                                    className="h-[42px] px-2 sm:px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-sm w-[90px] sm:w-[120px] appearance-none"
                                    style={{ lineHeight: '1.5' }}
                                  >
                                    {phoneCountryCodes.map((country) => (
                                      <option key={country.code} value={country.code}>
                                        {country.flag} {country.code}
                                      </option>
                                    ))}
                                  </select>
                                </div>
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
                        </div>

                        {/* Step 3: Additional Information (only for online) */}
                        {bookingForm.consultationType === "online" && (
                          <div className="mb-6">
                            <h5 className="text-md font-semibold text-gray-800 mb-3">Krok 3: Dodatkowe informacje (wymagane dla konsultacji online)</h5>
                            
                            <div className="mb-4">
                              <label className="flex items-center gap-2 cursor-pointer">
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

                            {!bookingForm.isInternationalPatient && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">PESEL (opcjonalnie)</label>
                                <input
                                  type="text"
                                  name="govtId"
                                  value={bookingForm.govtId}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 border ${formErrors.govtId ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                                  placeholder="Wprowadź numer PESEL (jeśli posiadasz)"
                                  maxLength="15"
                                />
                                {formErrors.govtId && <p className="text-red-500 text-xs mt-1">{formErrors.govtId}</p>}
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
                                      placeholder="np. Niemcy, Polska"
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
                                      placeholder="Numer dokumentu"
                                      className={`w-full px-3 py-2 border ${formErrors.documentNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
                                    />
                                    {formErrors.documentNumber && <p className="text-red-500 text-xs mt-1">{formErrors.documentNumber}</p>}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                  max={getCurrentDateInPoland()}
                                />
                                {formErrors.dateOfBirth && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {formErrors.dateOfBirth}
                                  </p>
                                )}
                              </div>
                            </div>

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
                          </div>
                        )}

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
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                Zapoznałem(-am) się z{" "}
                                                        <button
                          type="button"
                          onClick={() => window.open('/regulamin', '_blank')}
                          className="text-teal-600 hover:text-teal-800 underline"
                        >
                          Regulaminem
                        </button>{" "}
                        i{" "}
                        <button
                          type="button"
                          onClick={() => window.open('/polityka-prywatnosci', '_blank')}
                          className="text-teal-600 hover:text-teal-800 underline"
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
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">
                                Wyrażam zgodę na otrzymywanie powiadomień SMS i e-mail dotyczących mojej wizyty (np. przypomnienia, zmiany terminu).
                              </span>
                            </label>
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
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
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
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
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
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
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
              <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-end md:items-center sticky bottom-0 gap-2">
                <div className="text-xs text-gray-500 md:mr-auto md:mb-0 mb-2">
                  Ta strona jest chroniona przez reCAPTCHA. Obowiązują
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline ml-1">Polityka prywatności</a>
                  oraz
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline ml-1">Warunki korzystania z usług</a>
                  Google.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleConfirmAppointment}
                    disabled={!selectedSlot || isSubmitting}
                    className={`px-4 py-2 rounded-md text-white flex items-center ${
                      selectedSlot && !isSubmitting
                        ? "bg-teal-600 hover:bg-teal-700"
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
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorProfilePage; 