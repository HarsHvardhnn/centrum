import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import doctorService from "../../helpers/doctorHelper";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { useSpecializations } from "../../context/SpecializationContext";
import { FaCalendarAlt, FaShare } from "react-icons/fa";
import { useUser } from "../../context/userContext";
import { useSearchParams, useLocation } from "react-router-dom";

export default function BookAppointment({
  page,
  selectedSpecialization = "",
  selectedDoctorId = "",
}) {
  const { user } = useUser();
  const { specializations } = useSpecializations();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: null,
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Share functionality - removed modal states since we're copying directly

  // Parse URL parameters for pre-filling form
  const doctorIdFromUrl = searchParams.get('lekarz') || selectedDoctorId;
  const dateFromUrl = searchParams.get('data');
  const timeFromUrl = searchParams.get('godzina');
  const specializationFromUrl = searchParams.get('specjalizacja') || selectedSpecialization;

  const initialValues = {
    name: user?.name || "",
    gender: "",
    email: user?.email || "",
    phone: user?.phone?.startsWith("+48") ? user.phone.slice(3) : user?.phone || "",
    date: dateFromUrl || "",
    time: timeFromUrl || "",
    doctor: doctorIdFromUrl || "",
    specialization: specializationFromUrl || "",
    message: "",
    consultationType: "offline",
    smsConsentAgreed: false,
    privacyPolicyAgreed: false,
    medicalDataProcessingAgreed: false,
    teleportationConfirmed: false,
    contactConsentAgreed: false,
    govtId: "", // PESEL number
    address: "", // Residential address
    dateOfBirth: "", // Date of birth
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Wymagane"),
    gender: Yup.string().required("Wymagane"),
    email: Yup.string().email("Nieprawidłowy email"),
    phone: Yup.string()
      .matches(/^\d{9}$/, "Wprowadź dokładnie 9 cyfr")
      .required("Wymagane"),
    date: Yup.date().required("Wymagane"),
    time: Yup.string().required("Wymagane"),
    doctor: Yup.string().required("Wymagane"),
    specialization: Yup.string().required("Wymagane"),
    message: Yup.string().min(10, "Za krótka wiadomość").required("Wymagane"),
    consultationType: Yup.string().oneOf(['online', 'offline']).required("Wymagane"),
    govtId: Yup.string()
      .required("Numer PESEL jest wymagany")
      .max(15, "Numer PESEL nie może być dłuższy niż 15 znaków")
      .matches(/^[a-zA-Z0-9]+$/, "Numer PESEL może zawierać tylko litery i cyfry"),
    address: Yup.string()
      .required("Adres zamieszkania jest wymagany")
      .min(10, "Adres jest za krótki")
      .trim(),
    dateOfBirth: Yup.date()
      .required("Data urodzenia jest wymagana")
      .max(new Date(), "Data urodzenia nie może być w przyszłości")
      .nullable()
      .transform((curr, orig) => orig === '' ? null : curr),
    smsConsentAgreed: Yup.boolean(),
    privacyPolicyAgreed: Yup.boolean().oneOf([true], "Akceptacja regulaminu i polityki prywatności jest wymagana"),
    medicalDataProcessingAgreed: Yup.boolean().when('consultationType', {
      is: 'online',
      then: (schema) => schema.oneOf([true], "Zgoda na przetwarzanie danych medycznych jest wymagana dla konsultacji online"),
      otherwise: (schema) => schema
    }),
    teleportationConfirmed: Yup.boolean().when('consultationType', {
      is: 'online',
      then: (schema) => schema.oneOf([true], "Potwierdzenie formy konsultacji online jest wymagane"),
      otherwise: (schema) => schema
    }),
    contactConsentAgreed: Yup.boolean().when('consultationType', {
      is: 'online',
      then: (schema) => schema.oneOf([true], "Zgoda na kontakt jest wymagana dla konsultacji online"),
      otherwise: (schema) => schema
    }),
  });

  // Fetch doctors for preselected specialization when component mounts
  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctorsForSpecialization(selectedSpecialization);
    }
  }, [selectedSpecialization]);

  const fetchDoctorsForSpecialization = async (specializationId) => {
    if (!specializationId) return;

    try {
      setLoading(true);
      const response = await doctorService.getAllDoctors({
        specialization: specializationId,
      });

      setDoctors(response.doctors || []);
    } catch (error) {
      console.error(
        `Error fetching doctors for specialization ${specializationId}:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Load pre-selected data from URL parameters
  useEffect(() => {
    if (doctorIdFromUrl && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === doctorIdFromUrl);
      if (doctor && dateFromUrl) {
        fetchAvailableSlots(doctorIdFromUrl, dateFromUrl);
      }
    }
  }, [doctorIdFromUrl, dateFromUrl, doctors]);

  // Fetch available slots when date or doctor changes
  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
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
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Handle specialization change with URL update
  const handleSpecializationChangeWithUpdate = async (e, setFieldValue, values) => {
    const newSpecialization = e.target.value;
    setFieldValue("specialization", newSpecialization);
    setFieldValue("doctor", ""); // Reset doctor when specialization changes
    setFieldValue("time", ""); // Reset time when specialization changes
    setAvailableSlots([]); // Reset available slots

    updateUrlWithSelections("", newSpecialization, values.date, "");

    if (newSpecialization) {
      fetchDoctorsForSpecialization(newSpecialization);
    } else {
      setDoctors([]);
    }
  };

  // Handle date change with URL update
  const handleDateChangeWithUpdate = async (e, doctorId, setFieldValue, values) => {
    const newDate = e.target.value;
    setFieldValue("date", newDate);
    setFieldValue("time", ""); // Reset time when date changes
    if (newDate && doctorId) {
      fetchAvailableSlots(doctorId, newDate);
      updateUrlWithSelections(values.doctor, values.specialization, newDate, "");
    }
  };

  // Handle doctor change with URL update
  const handleDoctorChangeWithUpdate = async (e, date, setFieldValue, values) => {
    const newDoctorId = e.target.value;
    setFieldValue("doctor", newDoctorId);
    setFieldValue("time", ""); // Reset time when doctor changes

    updateUrlWithSelections(newDoctorId, values.specialization, date, "");

    if (newDoctorId) {
      try {
        // Fetch next available date
        const nextAvailableResponse = await doctorService.getNextAvailableDate(newDoctorId);
        
        if (nextAvailableResponse.success && nextAvailableResponse.data) {
          // Set the next available date
          setFieldValue("date", nextAvailableResponse.data.nextAvailableDate);
          // Set available slots
          setAvailableSlots(nextAvailableResponse.data.availableSlots);
          updateUrlWithSelections(newDoctorId, values.specialization, nextAvailableResponse.data.nextAvailableDate, "");
        } else {
          // If no available date found, use current date
          const currentDate = new Date().toISOString().split("T")[0];
          setFieldValue("date", currentDate);
          // Fetch slots for current date
          await fetchAvailableSlots(newDoctorId, currentDate);
          updateUrlWithSelections(newDoctorId, values.specialization, currentDate, "");
        }
      } catch (error) {
        console.error("Error fetching next available date:", error);
        toast.error("Nie udało się pobrać dostępnych terminów. Spróbuj ponownie później.");
      }
    } else {
      setAvailableSlots([]);
    }
  };

  // Handle slot selection with URL update
  const handleSlotSelectWithUpdate = (slot, setFieldValue, values) => {
    setFieldValue("time", `${slot.startTime}`);
    updateUrlWithSelections(values.doctor, values.specialization, values.date, slot.startTime);
  };

  // Custom phone input handler
  const handlePhoneChange = (e, setFieldValue) => {
    // Only allow numeric characters
    const inputValue = e.target.value.replace(/\D/g, '');
    
    // Limit to 9 digits
    const limitedValue = inputValue.substring(0, 9);
    
    // Update the field value
    setFieldValue("phone", limitedValue);
  };

  // Format phone to display with +48 prefix
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    
    // For better readability: +48 XXX XXX XXX
    if (phone.length <= 3) {
      return phone;
    } else if (phone.length <= 6) {
      return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    } else {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
  };

  // Handle PESEL input to allow only numbers and limit to 11 digits
  const handlePeselChange = (e, setFieldValue) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 11) {
      setFieldValue("govtId", value);
    }
  };

  // Updated handleSubmit function to use the apiCaller
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      setSubmitStatus({ success: false, error: null });

      // Additional validation for required fields
      if (!values.govtId || !values.address || !values.dateOfBirth) {
        throw new Error("Wszystkie wymagane pola muszą być wypełnione");
      }

      // Format date and time if needed
      const formattedValues = {
        ...values,
        // Add +48 prefix to phone
        phone: `+48${values.phone}`,
      };

      // Make API call to book appointment
      const response = await apiCaller(
        "POST",
        "/appointments/book",
        formattedValues
      );

      //("Appointment booked successfully:", response.data);
      setSubmitStatus({ success: true, error: null });
      resetForm();

      // Show success message to user
      toast.success("Wizyta została pomyślnie zarezerwowana!");
    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);

      // Set error status and show error message
      const errorMessage =
        error.response?.data?.message || error.message ||
        "Nie udało się zarezerwować wizyty. Spróbuj ponownie.";
      setSubmitStatus({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to update URL with current selections
  const updateUrlWithSelections = (doctor, specialization, date, time) => {
    const params = new URLSearchParams();
    
    if (doctor) params.set('lekarz', doctor);
    if (specialization) params.set('specjalizacja', specialization);
    if (date) params.set('data', date);
    if (time) params.set('godzina', time);
    
    // Update URL without triggering navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Function to generate shareable link
  const generateShareableLink = (values) => {
    if (!values.doctor) {
      toast.error("Najpierw wybierz lekarza");
      return "";
    }
    
    const selectedDoctor = doctors.find(d => d._id === values.doctor);
    const doctorName = selectedDoctor ? (selectedDoctor.name.first && selectedDoctor.name.last 
      ? `${selectedDoctor.name.first} ${selectedDoctor.name.last}` 
      : selectedDoctor.name) : '';
    
    const params = new URLSearchParams();
    params.set('lekarz', values.doctor);
    if (doctorName) params.set('nazwisko-lekarza', doctorName);
    if (values.specialization) params.set('specjalizacja', values.specialization);
    if (values.date) params.set('data', values.date);
    if (values.time) params.set('godzina', values.time);
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  // Handle share button click - directly copy to clipboard
  const handleShare = async (values) => {
    const shareableLink = generateShareableLink(values);
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

  return (
    <section
      className={`px-4 sm:px-6 flex justify-center items-center ${
        page === "home"
          ? "bg-[url('/images/bookappointment.jpg')] py-8 sm:py-12 bg-cover bg-center bg-no-repeat"
          : "bg-[#f5f7fa] py-6"
      } relative`}
    >
      <div className="absolute inset-0 bg-white bg-opacity-70"></div>

      <div
        className={`max-w-6xl w-full lg:p-6 rounded-lg flex ${
          page === "home" ? "flex-col lg:flex-row" : "flex-col"
        } gap-6 relative z-10`}
      >
        <div
          className={`${
            page === "home" ? "lg:w-1/2" : "w-full"
          } flex flex-col justify-center text-center lg:text-left space-y-4`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary">
            Zarezerwuj Wizytę
          </h2>
          <p className="text-neutral-800 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
            Wybierz dogodny termin i umów się na konsultację z naszym specjalistą.
            To szybkie, proste i wygodne — bez dzwonienia i kolejek.
          </p>
        </div>

        <div className={`${page === "home" ? "lg:w-1/2" : "w-full"}`}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ setFieldValue, isSubmitting, values, errors, touched }) => (
              <Form className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f5f7fa] rounded-md border border-[#062b47] p-4 sm:p-6">
                {/* Share Button - Only show when we have doctor selected */}
                {values.doctor && (
                  <div className="col-span-1 sm:col-span-2 flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => handleShare(values)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                    >
                      <FaShare className="mr-2" />
                      Udostępnij wizytę
                    </button>
                  </div>
                )}

                {/* Status Messages */}
                {submitStatus.success && (
                  <div className="col-span-1 sm:col-span-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm sm:text-base">
                    Wizyta została pomyślnie zarezerwowana!
                  </div>
                )}

                {submitStatus.error && (
                  <div className="col-span-1 sm:col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm sm:text-base">
                    {submitStatus.error}
                  </div>
                )}

                {/* Form Fields */}
                <div className="col-span-1">
                  <Field
                    name="name"
                    type="text"
                    placeholder="Imię i nazwisko"
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                <div className="col-span-1">
                  <Field
                    as="select"
                    name="gender"
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                  >
                    <option value="">Wybierz płeć</option>
                    <option value="male">Mężczyzna</option>
                    <option value="female">Kobieta</option>
                    <option value="other">Inna</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                <div className="col-span-1">
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                <div className="col-span-1">
                  <div className="custom-phone-input relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      {/* Polish flag */}
                      <div className="flex items-center">
                        <div className="flag-icon w-5 h-3.5 mr-2">
                          {/* Simple CSS-based Polish flag */}
                          <div className="w-full h-full flex flex-col">
                            <div className="bg-white h-1/2 w-full"></div>
                            <div className="bg-red-600 h-1/2 w-full"></div>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm sm:text-base">+48</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={values.phone}
                      onChange={(e) => handlePhoneChange(e, setFieldValue)}
                      placeholder="123 456 789"
                      className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-gray-400 rounded pl-16 sm:pl-20"
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <div className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.phone}
                    </div>
                  )}
                  {/* Visual formatter - shows formatted number below input */}
                  {values.phone && !errors.phone && (
                    <div className="text-xs text-gray-500 mt-1">
                      +48 {formatPhoneDisplay(values.phone)}
                    </div>
                  )}
                </div>

                <div className="col-span-1">
                  <Field
                    as="select"
                    name="specialization"
                    onChange={(e) => handleSpecializationChangeWithUpdate(e, setFieldValue, values)}
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                  >
                    <option value="">Wybierz specjalizację</option>
                    {specializations.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="specialization"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                <div className="col-span-1">
                  <Field
                    as="select"
                    name="doctor"
                    onChange={(e) => handleDoctorChangeWithUpdate(e, values.date, setFieldValue, values)}
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                    disabled={!values.specialization}
                  >
                    <option value="">Wybierz lekarza</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="doctor"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                <div className="col-span-1">
                  <Field
                    name="date"
                    type="date"
                    onChange={(e) => handleDateChangeWithUpdate(e, values.doctor, setFieldValue, values)}
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                    min={new Date().toISOString().split('T')[0]}
                    disabled={!values.doctor}
                  />
                  <ErrorMessage
                    name="date"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                {/* Consultation Type - Hidden for now */}
                <div className="col-span-1 sm:col-span-2 hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ konsultacji
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setFieldValue("consultationType", "offline")}
                      className={`px-4 py-2 rounded-md border text-sm sm:text-base ${
                        values.consultationType === "offline"
                          ? "bg-main text-white border-main"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Wizyta stacjonarna
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldValue("consultationType", "online")}
                      className={`px-4 py-2 rounded-md border text-sm sm:text-base ${
                        values.consultationType === "online"
                          ? "bg-main text-white border-main"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Wizyta online
                    </button>
                  </div>
                  {errors.consultationType && touched.consultationType && (
                    <div className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.consultationType}
                    </div>
                  )}
                </div>

                {/* Available Time Slots */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dostępne godziny
                  </label>
                  
                  {slotsLoading ? (
                    <div className="flex justify-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-teal-500"></div>
                    </div>
                  ) : values.date && values.doctor ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSlotSelectWithUpdate(slot, setFieldValue, values)}
                            disabled={!slot.available}
                            className={`px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                              values.time === slot.startTime
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
                      <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg">
                        <FaCalendarAlt className="mx-auto text-gray-400 mb-2" size={20} />
                        <p className="text-gray-700 text-sm sm:text-base">
                          Brak dostępnych terminów w wybranym dniu
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 text-sm sm:text-base">
                        {!values.doctor 
                          ? "Wybierz specjalizację i lekarza"
                          : "Wybierz datę, aby zobaczyć dostępne terminy"}
                      </p>
                    </div>
                  )}
                  
                  <ErrorMessage
                    name="time"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                {/* Message Textarea */}
                <div className="col-span-1 sm:col-span-2">
                  <Field
                    as="textarea"
                    name="message"
                    placeholder="Prosimy opisać krótko swój problem zdrowotny oraz wskazać usługę, którą są Państwo zainteresowani (np. konsultacja chirurgiczna, usunięcie zmiany skórnej)."
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded resize-none h-24 sm:h-32"
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                {/* Consent Checkboxes */}
                <div className="col-span-1 sm:col-span-2 space-y-4">
                  {/* Mandatory Privacy Policy Consent */}
                  <div>
                    <label className="flex items-start space-x-2 cursor-pointer">
                      <Field
                        type="checkbox"
                        name="privacyPolicyAgreed"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                      />
                      <span className="text-sm text-gray-700">
                        Zapoznałem(-am) się z{" "}
                        <button
                          type="button"
                          onClick={() => window.open('/regulamin.pdf', '_blank')}
                          className="text-main hover:text-main-dark underline"
                        >
                          Regulaminem
                        </button>{" "}
                        i{" "}
                        <button
                          type="button"
                          onClick={() => window.open('/polityka-prywatnosci.pdf', '_blank')}
                          className="text-main hover:text-main-dark underline"
                        >
                          Polityką Prywatności
                        </button>{" "}
                        i akceptuję ich postanowienia. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <ErrorMessage
                      name="privacyPolicyAgreed"
                      component="div"
                      className="text-red-600 text-xs sm:text-sm mt-1 ml-6"
                    />
                  </div>

                  {/* Online consultation specific consents */}
                  {values.consultationType === "online" && (
                    <>
                      {/* Medical Data Processing Consent */}
                      <div>
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="medicalDataProcessingAgreed"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                          />
                          <span className="text-sm text-gray-700">
                            Wyrażam zgodę na przetwarzanie moich danych osobowych, w tym danych medycznych, w celu realizacji konsultacji medycznej online, zgodnie z art. 9 ust. 2 lit. h RODO. <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <ErrorMessage
                          name="medicalDataProcessingAgreed"
                          component="div"
                          className="text-red-600 text-xs sm:text-sm mt-1 ml-6"
                        />
                      </div>

                      {/* Teleportation Confirmation */}
                      <div>
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="teleportationConfirmed"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                          />
                          <span className="text-sm text-gray-700">
                            Potwierdzam, że konsultacja medyczna odbędzie się w formie zdalnej (online) i jestem świadomy(-a) tej formy świadczenia zdrowotnego. <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <ErrorMessage
                          name="teleportationConfirmed"
                          component="div"
                          className="text-red-600 text-xs sm:text-sm mt-1 ml-6"
                        />
                      </div>

                      {/* Contact Consent */}
                      <div>
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="contactConsentAgreed"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                          />
                          <span className="text-sm text-gray-700">
                            Wyrażam zgodę na kontakt telefoniczny lub e-mailowy w celu realizacji konsultacji online, w tym przesłania linku do spotkania. <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <ErrorMessage
                          name="contactConsentAgreed"
                          component="div"
                          className="text-red-600 text-xs sm:text-sm mt-1 ml-6"
                        />
                      </div>
                    </>
                  )}

                  {/* Voluntary SMS Consent */}
                  <div>
                    <label className="flex items-start space-x-2 cursor-pointer">
                      <Field
                        type="checkbox"
                        name="smsConsentAgreed"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                      />
                      <span className="text-sm text-gray-700">
                        Wyrażam zgodę na otrzymywanie powiadomień SMS i e-mail dotyczących mojej wizyty (np. przypomnienia, zmiany terminu).
                      </span>
                    </label>
                  </div>
                </div>

                {/* Patient Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię i nazwisko*
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="Jan Kowalski"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PESEL*
                    </label>
                    <Field name="govtId">
                      {({ field, form }) => (
                        <input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                            form.setFieldValue('govtId', value);
                          }}
                          className={`w-full px-3 py-2 border ${form.touched.govtId && form.errors.govtId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                          placeholder="Wprowadź numer PESEL"
                          maxLength="15"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="govtId"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon* (9 cyfr)
                    </label>
                    <Field name="phone">
                      {({ field, form }) => (
                        <input
                          type="tel"
                          {...field}
                          onChange={(e) => handlePhoneChange(e, form.setFieldValue)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="123456789"
                          maxLength="9"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Format: 9 cyfr bez spacji i znaków specjalnych
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data urodzenia*
                    </label>
                    <Field name="dateOfBirth">
                      {({ field, form }) => (
                        <input
                          type="date"
                          {...field}
                          className={`w-full px-3 py-2 border ${form.touched.dateOfBirth && form.errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="dateOfBirth"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="jan.kowalski@example.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Płeć*
                    </label>
                    <Field
                      as="select"
                      name="gender"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">Wybierz płeć</option>
                      <option value="male">Mężczyzna</option>
                      <option value="female">Kobieta</option>
                      <option value="other">Inna</option>
                    </Field>
                    <ErrorMessage
                      name="gender"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres zamieszkania*
                  </label>
                  <Field name="address">
                    {({ field, form }) => (
                      <textarea
                        {...field}
                        rows="2"
                        onChange={(e) => {
                          const value = e.target.value;
                          form.setFieldValue('address', value.trim());
                        }}
                        className={`w-full px-3 py-2 border ${form.touched.address && form.errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                        placeholder="Ulica, numer domu/mieszkania, kod pocztowy, miasto"
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="address"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="col-span-1 sm:col-span-2 bg-main text-white py-2.5 sm:py-3 rounded text-sm sm:text-base hover:bg-main-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Rezerwowanie..." : "Zarezerwuj Wizytę"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <style jsx>{`
        /* Safari-specific fixes */
        @media not all and (min-resolution:.001dpcm) { 
          @supports (-webkit-appearance:none) {
            select {
              background-image: url("data:image/svg+xml;utf8,<svg fill='%23062b47' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
              background-repeat: no-repeat;
              background-position-x: calc(100% - 10px);
              background-position-y: 50%;
              padding-right: 30px;
            }

            /* Date input fixes for Safari */
            input[type="date"] {
              -webkit-appearance: none;
              appearance: none;
              background-color: white;
              padding-right: 1rem;
              position: relative;
            }

            input[type="date"]::-webkit-calendar-picker-indicator {
              background: transparent;
              bottom: 0;
              color: transparent;
              cursor: pointer;
              height: auto;
              left: 0;
              position: absolute;
              right: 0;
              top: 0;
              width: auto;
              padding: 0;
              margin: 0;
            }

            input[type="date"]::-webkit-inner-spin-button,
            input[type="date"]::-webkit-clear-button {
              display: none;
              -webkit-appearance: none;
            }

            /* Add custom calendar icon */
            input[type="date"] {
              background-image: url("data:image/svg+xml;utf8,<svg fill='%23062b47' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
              background-repeat: no-repeat;
              background-position-x: calc(100% - 10px);
              background-position-y: 50%;
              padding-right: 2.5rem;
            }

            /* Ensure text color is consistent */
            input[type="date"]::-webkit-datetime-edit {
              color: #062b47;
            }

            input[type="date"]::-webkit-datetime-edit-fields-wrapper {
              color: #062b47;
            }

            input[type="date"]::-webkit-datetime-edit-text {
              color: #062b47;
              padding: 0 0.2em;
            }

            input[type="date"]::-webkit-datetime-edit-year-field,
            input[type="date"]::-webkit-datetime-edit-month-field,
            input[type="date"]::-webkit-datetime-edit-day-field {
              color: #062b47;
              padding: 0 0.2em;
            }
          }
        }
      `}</style>
    </section>
  );
}