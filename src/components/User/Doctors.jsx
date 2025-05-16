import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import doctorService from "../../helpers/doctorHelper";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";

export default function Doctors({
  setSelectedDoctorId,
  setSelectedDepartment,
}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    message: "",
    consultationType: "offline",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors();

        // Transform the API response to match the component's expected format
        const transformedDoctors = response.doctors.map((doctor) => ({
          id: doctor._id || doctor.id,
          name:
            doctor.name.first && doctor.name.last
              ? `${doctor.name.first} ${doctor.name.last}`
              : doctor.name, // Handle both object and string format
          department: doctor.specialty,
          image: doctor.image || "https://via.placeholder.com/400x500",
          experience: doctor.experience || "",
          social: {
            linkedin: "#",
            facebook: "#",
            instagram: "#",
          },
          consultationFee: doctor.consultationFee,
        }));

        setDoctors(transformedDoctors);
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

  const fetchDoctorProfile = async (doctorId) => {
    try {
      const response = await apiCaller("GET", `docs/profile/${doctorId}`);
      if (response.data.success) {
        setDoctorProfile(response.data.data);
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

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorProfile(doctor.id);
    fetchAvailableSlots(doctor.id, selectedDate);
    setShowModal(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor.id, date);
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

    if (!bookingForm.email.trim()) {
      errors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      errors.email = "Email jest nieprawidłowy";
    }

    if (!bookingForm.phone.trim()) {
      errors.phone = "Numer telefonu jest wymagany";
    } else if (!/^[0-9]{9}$/.test(bookingForm.phone.replace(/\s/g, ""))) {
      errors.phone = "Numer telefonu musi składać się z 9 cyfr";
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

      // Format phone number by adding the Polish country code
      const phone = `+48${bookingForm.phone}`;

      // Prepare request data
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
      };

      // Make API call to book appointment
      const response = await apiCaller  ("POST", "appointments/book", appointmentData);

      // Handle success
      console.log("Appointment booked successfully:", response.data);
      toast.success("Wizyta została pomyślnie zarezerwowana!");

      // Close modal and reset form
      setShowModal(false);
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        gender: "male",
        message: "",
        consultationType: "offline",
      });
      setSelectedSlot(null);

      // Navigate to homepage or appointment confirmation page
      setSelectedDepartment(selectedDoctor.department);
      setSelectedDoctorId(selectedDoctor.id);
      navigate("/user");
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

  const settings = {
    dots: true,
    infinite: doctors.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
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

  // Calculate dates for the next 7 days
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  return (
    <section className="py-16 px-6 bg-white text-center">
      <h3 className="md:text-xl font-bold text-neutral-800">ZAUFANA OPIEKA</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 sm:mb-12">
        Nasi Specjaliści
      </h2>

      <div className="max-w-sm md:max-w-6xl mx-auto overflow-clip">
        {doctors.length > 0 ? (
          <Slider {...settings}>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="px-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                  <div className="bg-[#F4F4F4] text-main py-6 px-6">
                    <h4 className="text-lg font-semibold">{doctor.name}</h4>
                    <p className="text-xl font-bold uppercase text-black">
                      {doctor.department.name}
                    </p>
                    {/* {doctor.experience && (
                      <p className="text-sm mt-1">
                        Doświadczenie: {doctor.experience}
                      </p>
                    )}
                    {doctor.consultationFee && (
                      <p className="text-sm font-medium mt-1">
                        Cena konsultacji: {doctor.consultationFee} zł
                      </p>
                    )} */}
                  </div>

                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className="bg-main text-white font-semibold text-lg py-3 w-full hover:bg-teal-700 transition-all"
                  >
                    Umów wizytę
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-xl text-gray-600">
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
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
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
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
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

                        {doctorProfile.experience && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">
                              Doświadczenie:
                            </span>{" "}
                            {doctorProfile.experience} lat
                          </p>
                        )}
                        {doctorProfile.education && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">Edukacja:</span>{" "}
                            {doctorProfile.education}
                          </p>
                        )}
                        {doctorProfile.languages && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">Języki:</span>{" "}
                            {doctorProfile.languages.join(", ")}
                          </p>
                        )}

                        {selectedDoctor.consultationFee && (
                          <p className="text-sm font-medium mt-2">
                            <span className="font-semibold">
                              Cena konsultacji:
                            </span>{" "}
                            {selectedDoctor.consultationFee} zł
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
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {nextDays.map((date) => {
                        const dayDate = new Date(date);
                        const isToday = date === nextDays[0];
                        const isActive = date === selectedDate;

                        return (
                          <button
                            key={date}
                            onClick={() => handleDateChange(date)}
                            className={`px-2 py-3 rounded-lg border text-sm ${
                              isActive
                                ? "bg-main text-white border-main"
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
                            Adres email*
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon* (9 cyfr)
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={bookingForm.phone}
                            onChange={handlePhoneChange}
                            className={`w-full px-3 py-2 border ${
                              formErrors.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500`}
                            placeholder="123456789"
                            maxLength="9"
                          />
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

                      {/* Add Consultation Type Toggle */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Typ konsultacji
                        </label>
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
                          placeholder="Opisz swój problem lub podaj dodatkowe informacje dla lekarza..."
                        ></textarea>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        * Pola oznaczone gwiazdką są wymagane
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
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
