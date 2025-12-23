import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaStar, FaPhone, FaShieldAlt, FaUserMd, FaUsers, FaClock } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaMobileAlt } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa6";
import doctorService from "../../helpers/doctorHelper";
import { useIsMobile } from "./useIsMobile";
import { useSpecializations } from "../../context/SpecializationContext";
import { useAppointmentContext } from "../../UserLayout";
import heroImage from "../../assets/a6cac98caf0f70d2a113ae6f901a2da389eae67e.png";

// Import your actual doctor service here
// import doctorService from '../services/doctorService';

export default function Hero({selectedDoctorId, setSelectedDoctorId}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const specDropdownRef = useRef(null);
  const doctorDropdownRef = useRef(null);
  const { specializations } = useSpecializations();
  const { setSelectedDepartment } = useAppointmentContext();
  const isMobile = useIsMobile();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
        setIsSpecDropdownOpen(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target)) {
        setIsDoctorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctorsForSpecialization = async () => {
      if (!selectedSpecialization) {
        setDoctors([]);
        return;
      }

      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors({
          specialization: selectedSpecialization,
        });

        const doctorsArray = Array.isArray(response.doctors) ? response.doctors : [];
        const transformedDoctors = doctorsArray.map((doctor) => ({
          id: doctor._id || doctor.id,
          name:
            doctor.name.first && doctor.name.last
              ? `${doctor.name.first} ${doctor.name.last}`
              : doctor.name,
        }));

        setDoctors(transformedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsForSpecialization();
  }, [selectedSpecialization]);

  const handleBookAppointment = () => {
    if (selectedDoctorId) {
      setTimeout(() => {
        const appointmentSection = document.getElementById("appointment-section");
        if (appointmentSection) {
          const yOffset = -120;
          const y = appointmentSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleCall = () => {
    window.location.href = "tel:797097487";
  };

  return (
    <section className="bg-[#F0F7F7] relative flex flex-col items-center pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-4 sm:px-6 md:px-8">
      <div className="flex-1 flex flex-col md:flex-row items-start justify-between px-4 sm:px-10 xl:px-20 pt-8 sm:pt-16 gap-8 md:gap-12">
        {/* Left Side Content */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0 w-full">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-teal-600 block">Prywatna przychodnia</span>
            <span className="text-teal-600 block">specjalistyczna</span>
            <span className="text-gray-700 text-2xl sm:text-3xl md:text-4xl lg:text-5xl block">w Skarżysku-Kamiennej</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed mb-6 max-w-2xl">
            Chirurg, proktolog, neurolog dziecięcy, kardiolog, radiolog.<br />
            Prywatne wizyty bez skierowania - szybka rejestracja online.
          </p>

          {/* Google Rating */}
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start max-w-2xl">
            <div className="flex items-center gap-2">
              {/* Google Logo - Teal */}
              <div className="flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#14B8A6"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#14B8A6"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#14B8A6"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#14B8A6"/>
                </svg>
              </div>
              {/* Five Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm fill-yellow-400" />
                ))}
              </div>
              {/* Rating Text */}
              <span className="text-gray-900 font-semibold text-sm">5.0</span>
              {/* Link Text */}
              <span className="text-teal-500 text-sm font-medium ml-1">Zobacz opinie w Google</span>
            </div>
          </div>
          {/* Appointment Booking Form Card */}
          <div className="mt-6 md:mt-8 relative z-10 bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-2xl mx-auto md:mx-0">
            {/* Teal Pill Tag */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                Rejestracja 24/7 online
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Umów wizytę online
            </h2>

            {/* Specialization Custom Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                Specjalizacja
              </label>
              <div className="relative" ref={specDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSpecDropdownOpen(!isSpecDropdownOpen)}
                  className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-left text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 hover:border-gray-300 cursor-pointer shadow-sm flex items-center justify-between"
                >
                  <span className={selectedSpecialization ? "text-gray-800" : "text-gray-400"}>
                    {selectedSpecialization
                      ? specializations.find(s => s._id === selectedSpecialization)?.name || "Wybierz specjalizację"
                      : "Wybierz specjalizację"}
                  </span>
                  <FaChevronDown className={`text-teal-600 transition-transform duration-200 ${isSpecDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isSpecDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpecialization("");
                          setSelectedDepartment("");
                          setSelectedDoctorId("");
                          setIsSpecDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-400 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150 border-b border-gray-100"
                      >
                        Wybierz specjalizację
                      </button>
                      {specializations.map((spec) => (
                        <button
                          key={spec._id}
                          type="button"
                          onClick={() => {
                            setSelectedSpecialization(spec._id);
                            setSelectedDepartment(spec._id);
                            setSelectedDoctorId("");
                            setIsSpecDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors duration-150 ${
                            selectedSpecialization === spec._id
                              ? "bg-teal-50 text-teal-700 font-semibold"
                              : "text-gray-800 hover:bg-teal-50 hover:text-teal-700"
                          } ${spec._id !== specializations[specializations.length - 1]._id ? "border-b border-gray-100" : ""}`}
                        >
                          {spec.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Custom Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                Lekarz
              </label>
              <div className="relative" ref={doctorDropdownRef}>
                <button
                  type="button"
                  onClick={() => !loading && selectedSpecialization && setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                  disabled={!selectedSpecialization || loading}
                  className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-left font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 shadow-sm flex items-center justify-between ${
                    !selectedSpecialization || loading
                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 text-gray-800 hover:border-gray-300 cursor-pointer"
                  }`}
                >
                  <span className={selectedDoctorId ? "text-gray-800" : "text-gray-400"}>
                    {loading
                      ? "Wczytywanie..."
                      : selectedDoctorId
                      ? doctors.find(d => d.id === selectedDoctorId)?.name || "Wybierz lekarza"
                      : "Wybierz lekarza"}
                  </span>
                  <FaChevronDown className={`transition-all duration-200 ${
                    !selectedSpecialization || loading
                      ? "text-gray-400"
                      : `text-teal-600 ${isDoctorDropdownOpen ? 'rotate-180' : ''}`
                  }`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDoctorDropdownOpen && !loading && selectedSpecialization && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctorId("");
                          setIsDoctorDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-400 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150 border-b border-gray-100"
                      >
                        Wybierz lekarza
                      </button>
                      {doctors.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          Brak dostępnych lekarzy
                        </div>
                      ) : (
                        doctors.map((doctor, index) => (
                          <button
                            key={doctor.id}
                            type="button"
                            onClick={() => {
                              setSelectedDoctorId(doctor.id);
                              setIsDoctorDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-colors duration-150 ${
                              selectedDoctorId === doctor.id
                                ? "bg-teal-50 text-teal-700 font-semibold"
                                : "text-gray-800 hover:bg-teal-50 hover:text-teal-700"
                            } ${index !== doctors.length - 1 ? "border-b border-gray-100" : ""}`}
                          >
                            {doctor.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {/* Book Appointment Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedDoctorId}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Zarezerwuj wizytę
              </button>

              {/* Call Button */}
              <button
                onClick={handleCall}
                className="w-full bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-4 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaPhone className="text-teal-600" />
                Zadzwoń
              </button>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-5 mt-2 border-t border-gray-200">
              <div className="flex items-center gap-2.5">
                <FaShieldAlt className="text-teal-600 text-lg flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Bezpieczna rejestracja</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaMobileAlt className="text-teal-600 text-lg flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Powiadomienia SMS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Image Container - Aligned with "w Skarżysku-Kamiennej" line */}
        <div className="md:w-1/2 relative z-0 flex justify-center w-full pb-8 md:pt-[4.5rem]">
          {/* Hero Image Container with proper boundaries */}
          {!isMobile && (
            <div className="relative z-10 w-full max-w-[600px] xl:max-w-[700px]">
              <div className="relative rounded-2xl bg-white border-4 border-white p-3 pt-3 pb-8" style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 rgba(0, 0, 0, 0)' }}>
                <img
                  loading="lazy"
                  src={heroImage}
                  alt="Konsultacja medyczna - Centrum Medyczne 7"
                  className="w-full h-auto object-contain"
                />
                {/* Google Review Widget - positioned at bottom border, half inside half outside */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[30%] bg-white rounded-2xl px-5 py-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center gap-3 border border-gray-200 z-20">
                  {/* Google Logo - Teal color */}
                  <div className="flex items-center justify-center w-7 h-7">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#14B8A6"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#14B8A6"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#14B8A6"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#14B8A6"/>
                    </svg>
                  </div>
                  {/* Five Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  {/* Rating Text */}
                  <span className="text-gray-900 font-semibold text-base">5.0</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Image for mobile screens */}
        {isMobile && (
          <div className="relative z-10 w-full max-w-[600px] mt-8">
            <div className="relative rounded-2xl bg-white border-4 border-white p-2.5 pt-2.5 pb-5" style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 rgba(0, 0, 0, 0)' }}>
              <img
                loading="lazy"
                src={heroImage}
                alt="Konsultacja medyczna - Centrum Medyczne 7"
                className="w-full h-auto object-contain"
              />
              {/* Google Review Widget - positioned at bottom border, half inside half outside */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[30%] bg-white rounded-2xl px-4 py-6 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-gray-200 z-20">
                {/* Google Logo - Teal color */}
                <div className="flex items-center justify-center w-6 h-6">
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#14B8A6"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#14B8A6"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#14B8A6"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#14B8A6"/>
                  </svg>
                </div>
                {/* Five Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm fill-yellow-400" />
                  ))}
                </div>
                {/* Rating Text */}
                <span className="text-gray-900 font-semibold text-sm">5.0</span>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Icons */}
        {/* <div className="hidden sm:flex absolute top-1/2 right-0 rounded-l-full p-2 gap-4 items-center bg-white">
          <a
            href="https://www.facebook.com/share/16Sb5NkqZt/?mibextid=wwXIfr"
            className="text-teal-600 hover:text-teal-800 transition-colors"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.instagram.com/centrummedyczne7?igsh=MTE1N2JoemM0ZG94YQ%3D%3D&utm_source=qr"
            className="text-teal-600 hover:text-teal-800 transition-colors"
          >
            <FaInstagram />
          </a>
        </div> */}
      </div>

      
      {/* Stats Section - New Design */}
      <div className="bg-teal-600 w-full text-white py-5 md:py-6 mt-12 md:mt-16 px-4">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Section 1: Specjaliści */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-teal-700 rounded-xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
              <FaUserMd className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Specjaliści</h3>
            <p className="text-sm md:text-base text-white/90">
              z doświadczeniem klinicznym
            </p>
          </div>

          {/* Section 2: Opieka */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-teal-700 rounded-xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
              <FaUsers className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Opieka</h3>
            <p className="text-sm md:text-base text-white/90">
              oparta o standardy szpitalne
            </p>
          </div>

          {/* Section 3: 24h */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-teal-700 rounded-xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
              <FaClock className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">24h</h3>
            <p className="text-sm md:text-base text-white/90">
              Rejestracja online
            </p>
          </div>

          {/* Section 4: 5.0 Rating */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-teal-700 rounded-xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
              <FaStar className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">5.0</h3>
            <p className="text-sm md:text-base text-white/90">
              Ocena w Google
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
