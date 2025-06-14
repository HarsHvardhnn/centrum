import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import doctorService from "../../helpers/doctorHelper";
import { useIsMobile } from "./useIsMobile";

// Import your actual doctor service here
// import doctorService from '../services/doctorService';

// This is a mock for demonstration - replace with your actual import
export default function Hero({selectedDoctorId, setSelectedDoctorId}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("New York"); // Hardcoded location

  const isMobile = useIsMobile();
  //("is mobile",isMobile)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
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
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className="bg-[#F0F7F7] relative flex flex-col items-center pt-12 sm:pt-16">
      <div className=" flex-1 flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 xl:px-20 pt-8 sm:pt-16">
        {/* Left Side Content */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-2xl sm:text-2xl md:text-2xl lg:text-4xl xl:text-5xl leading-tight font-bold text-gray-900">
            Zadbaj o Zdrowie          
            
          
          </h1>
          <h1 className="text-2xl sm:text-2xl md:text-2xl lg:text-4xl xl:text-5xl leading-tight font-bold text-gray-900">
              {" "}
              z <span className="text-teal-600">Najlepszymi Specjalistami</span>
            </h1>
          <p className="text-gray-600 mt-4 max-w-md mx-auto md:mx-0 px-2 sm:px-0 text-md">
            Tworzymy nową jakość opieki medycznej — bez kolejek, bez stresu, z
            pełnym dostępem do najlepszych specjalistów. Wybierz lekarza 
            i Zarezerwuj Wizytę w kilka sekund.
          </p>
          <h2 className="text-xl sm:text-2xl mt-8 md:mt-6 font-bold">
            Znajdź termin
          </h2>

          {/* Search Form */}
          <div className="mt-3 mb-6 relative z-10 bg-white flex items-center p-3 sm:p-4 rounded-xl sm:rounded-full shadow-lg max-w-md mx-auto md:mx-0 space-x-3">
  {/* Doctor Selection */}
  <div className="flex items-center flex-1">
    <FaRegCircleUser className="text-gray-600 mr-2" />
    <select 
      className="bg-transparent text-gray-700 outline-none w-full"
      value={selectedDoctorId || ""}
      onChange={(e) => {
        setSelectedDoctorId(e.target.value);
        // Scroll to doctors section after a short delay
        setTimeout(() => {
          const doctorsSection = document.querySelector('.doctors-section');
          if (doctorsSection) {
            doctorsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }}
    >
      <option value="">Imię i nazwisko lekarza</option>
      {loading ? (
        <option>Wczytywanie lekarzy...</option>
      ) : (
        doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))
      )}
    </select>
  </div>

  {/* Search Button */}
  <button
    className="bg-main text-white p-3 rounded-full flex-shrink-0"
    onClick={(e) => {
      e.preventDefault();
      window.scrollTo({ top: 2500, behavior: "smooth" });
    }}
  >
    <FaSearch />
  </button>
</div>

        </div>

        {/* Right Side Image */}
        <div className="md:w-1/2 relative z-0 flex justify-center">
          {/* Background semi-circle */}
          <div className="hidden lg:block absolute w-[400px] h-[200px] xl:w-[840px] xl:h-[400px] bottom-0 bg-[#008C8C]  rounded-t-full"></div>

          {/* Hero Image for larger screens */}
{!isMobile       &&    <img
          loading="lazy"
          src="/images/doctors1.png"
          alt="Desktop"
          className="w-full max-w-[600px] relative z-10"
        />}
        </div>

        {/* Hero Image for mobile screens */}
   { isMobile &&    <img
   loading="lazy"
          src="/images/doctors1.png"
          alt="Desktop"
          className="w-full top-8 max-w-[600px] relative z-10"
        />}

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

      
      {/* Stats Section */}
      <div className="bg-main w-full text-white py-4 mt-8 md:mt-0 px-4">
        <div className="container mx-auto flex justify-center flex-wrap gap-6 sm:gap-0">
          {/* Online Support */}
          <div className="flex flex-col items-center w-full sm:w-auto sm:flex-1 text-center">
            <h3 className="text-3xl md:text-4xl font-bold">100%</h3>
            <p className="text-sm sm:text-base lg:text-lg">
              Pozytywnych Opinii
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block border-l border-white h-12 my-auto"></div>

          {/* Doctors */}

          <div className="flex flex-col items-center w-full sm:w-auto sm:flex-1 text-center">
            <h3 className="text-3xl md:text-4xl font-bold">24/7</h3>
            <p className="text-sm sm:text-base lg:text-lg">Asystent AI</p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block border-l border-white h-12 my-auto"></div>

          {/* Active Patients */}
          <div className="flex flex-col items-center w-full sm:w-auto sm:flex-1 text-center">
            <h3 className="text-3xl md:text-4xl font-bold">+20</h3>
            <p className="text-sm sm:text-base lg:text-lg">Lat Doświadczenia</p>
          </div>
        </div>
      </div>
    </section>
  );
}
