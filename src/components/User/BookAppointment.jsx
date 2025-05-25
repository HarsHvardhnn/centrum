import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import doctorService from "../../helpers/doctorHelper";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { useSpecializations } from "../../context/SpecializationContext";
import { FaCalendarAlt } from "react-icons/fa";
import { useUser } from "../../context/userContext";

export default function BookAppointment({
  page,
  selectedSpecialization = "",
  selectedDoctorId = "",
}) {
  const { user } = useUser();
  const { specializations } = useSpecializations();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: null,
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const initialValues = {
    name: user?.name || "",
    gender: "",
    email: user?.email || "",
    phone: user?.phone?.startsWith("+48") ? user.phone.slice(3) : user?.phone || "",
    date: "",
    time: "",
    doctor: selectedDoctorId || "",
    specialization: selectedSpecialization || "",
    message: "",
    consultationType: "offline",
    smsConsentAgreed: false,
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
    smsConsentAgreed: Yup.boolean(),
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

  // Handle specialization change
  const handleSpecializationChange = async (e, setFieldValue) => {
    const newSpecialization = e.target.value;
    setFieldValue("specialization", newSpecialization);
    setFieldValue("doctor", ""); // Reset doctor when specialization changes
    setFieldValue("time", ""); // Reset time when specialization changes
    setAvailableSlots([]); // Reset available slots

    if (newSpecialization) {
      fetchDoctorsForSpecialization(newSpecialization);
    } else {
      setDoctors([]);
    }
  };

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

  // Handle date change
  const handleDateChange = async (e, doctorId, setFieldValue) => {
    const newDate = e.target.value;
    setFieldValue("date", newDate);
    setFieldValue("time", ""); // Reset time when date changes
    if (newDate && doctorId) {
      fetchAvailableSlots(doctorId, newDate);
    }
  };

  // Handle doctor change
  const handleDoctorChange = async (e, date, setFieldValue) => {
    const newDoctorId = e.target.value;
    setFieldValue("doctor", newDoctorId);
    setFieldValue("time", ""); // Reset time when doctor changes

    if (newDoctorId) {
      try {
        // Fetch next available date
        const nextAvailableResponse = await doctorService.getNextAvailableDate(newDoctorId);
        
        if (nextAvailableResponse.success && nextAvailableResponse.data) {
          // Set the next available date
          setFieldValue("date", nextAvailableResponse.data.nextAvailableDate);
          // Set available slots
          setAvailableSlots(nextAvailableResponse.data.availableSlots);
        } else {
          // If no available date found, use current date
          const currentDate = new Date().toISOString().split("T")[0];
          setFieldValue("date", currentDate);
          // Fetch slots for current date
          await fetchAvailableSlots(newDoctorId, currentDate);
        }
      } catch (error) {
        console.error("Error fetching next available date:", error);
        toast.error("Nie udało się pobrać dostępnych terminów. Spróbuj ponownie później.");
      }
    } else {
      setAvailableSlots([]);
    }
  };

  // Update useEffect to handle initial doctor selection
  useEffect(() => {
    if (selectedDoctorId) {
      handleDoctorChange(
        { target: { value: selectedDoctorId } },
        null,
        (field, value) => {
          const formik = document.querySelector('form').__formik;
          if (formik) {
            formik.setFieldValue(field, value);
          }
        }
      );
    }
  }, [selectedDoctorId]);

  // Handle slot selection
  const handleSlotSelect = (slot, setFieldValue) => {
    setFieldValue("time", `${slot.startTime}`);
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

  // Updated handleSubmit function to use the apiCaller
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      setSubmitStatus({ success: false, error: null });

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

      console.log("Appointment booked successfully:", response.data);
      setSubmitStatus({ success: true, error: null });
      resetForm();

      // Show success message to user
      toast.success("Wizyta została pomyślnie zarezerwowana!");
    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);

      // Set error status and show error message
      const errorMessage =
        error.response?.data?.message ||
        "Nie udało się zarezerwować wizyty. Spróbuj ponownie.";
      setSubmitStatus({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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
                    onChange={(e) => handleSpecializationChange(e, setFieldValue)}
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
                    onChange={(e) => handleDoctorChange(e, values.date, setFieldValue)}
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
                    onChange={(e) => handleDateChange(e, values.doctor, setFieldValue)}
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

                {/* Consultation Type */}
                <div className="col-span-1 sm:col-span-2">
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
                            onClick={() => handleSlotSelect(slot, setFieldValue)}
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
                    placeholder="Prosimy opisać krótko swój problem zdrowotny oraz wskazać usługę, którą są Państwo zainteresowani (np. konsultacja chirurgiczna, usunięcie zmiany skórnej)."
                    className="p-2.5 sm:p-3 text-sm sm:text-base outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded resize-none h-24 sm:h-32"
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="text-red-600 text-xs sm:text-sm mt-1"
                  />
                </div>

                {/* SMS Consent Checkbox */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <Field
                      type="checkbox"
                      name="smsConsentAgreed"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-main focus:ring-main"
                    />
                    <span className="text-sm text-gray-700">
                      Wyrażam zgodę na otrzymywanie powiadomień SMS dotyczących mojej wizyty (np. przypomnienia, zmiany terminu) oraz potwierdzam, że zapoznałem(-am) się z{" "}
                      <button
                        type="button"
                        onClick={() => window.open('/images/tos.docx', '_blank')}
                        className="text-main hover:text-main-dark underline"
                      >
                        Regulaminem
                      </button>{" "}
                      i{" "}
                      <button
                        type="button"
                        onClick={() => window.open('/images/ts.docx', '_blank')}
                        className="text-main hover:text-main-dark underline"
                      >
                        Polityką Prywatności
                      </button>
                      .
                    </span>
                  </label>
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