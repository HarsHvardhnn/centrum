import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ContactSection from "../ContactSection";
import News from "../News";
import Testimonial from "../Testimonial";
import Doctors from "../Doctors";
import BookAppointment from "../BookAppointment";
import Specialties from "../Specialties";
import Welcome from "../Welcome";
import Hero from "../Hero";
import ServicesMini from "../ServicesMini";
import { useAppointmentContext } from "../../../UserLayout";
import MetaTags from '../../UtilComponents/MetaTags';
import { cm7PostalAddressLd } from '../../../data/cm7PostalAddressLd';

const  HomePage = () => {
  const {
    selectedDepartment,
    setSelectedDepartment,
    selectedDoctorId,
    setSelectedDoctorId,
  } = useAppointmentContext();
  const [searchParams] = useSearchParams();

//("selected doctor id",selectedDoctorId)
  useEffect(() => {
    if (selectedDoctorId) {
      // Short timeout to ensure the component is rendered
      setTimeout(() => {
        const appointmentSection = document.getElementById(
          "appointment-section"
        );
        if (appointmentSection) {
          // Calculate position to scroll to (center of viewport)
          const yOffset = -120; // Adjust this value based on your layout
          const y =
            appointmentSection.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [selectedDoctorId,selectedDepartment]);

  // Handle openAppointment query parameter
  useEffect(() => {
    const openAppointment = searchParams.get('openAppointment');
    if (openAppointment === 'true') {
      // Wait for page to load, then scroll to appointment section
      setTimeout(() => {
        const appointmentSection = document.getElementById('appointment-section');
        if (appointmentSection) {
          const yOffset = -120;
          const y = appointmentSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [searchParams]);

  // Generate LocalBusiness Schema (JSON-LD)
  const generateLocalBusinessSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "name": "Centrum Medyczne 7",
      "url": "https://centrummedyczne7.pl",
      "logo": "https://centrummedyczne7.pl/images/mainlogo.png",
      "image": "https://centrummedyczne7.pl/images/mainlogo.png",
      "description": "Prywatne wizyty u specjalistów: chirurg, proktolog, neurolog dziecięcy, kardiolog, radiolog. Bez skierowania – Skarżysko-Kamienna.",
      "address": {
        ...cm7PostalAddressLd
      },
      "telephone": "+48 797 127 487",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "15:00",
          "closes": "20:00"
        }
      ],
      "medicalSpecialty": [
        "Surgery",
        "Cardiology",
        "Neurology",
        "Proctology",
        "Gastroenterology",
        "Radiology"
      ]
    };

    return schema;
  };

  return (
    <>
      <MetaTags 
        title="Centrum Medyczne 7 Skarżysko - Prywatna opieka medyczna"
        description="Centrum Medyczne 7 Skarżysko (świętokrzyskie) – chirurg, neurolog, ortopeda, urolog, kardiolog oraz badania USG, EEG, echo serca. Rejestracja online."
        path="/"
      />
      
      {/* LocalBusiness Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema()) }}
      />
      
      <Hero selectedDoctorId={selectedDoctorId} setSelectedDoctorId={setSelectedDoctorId}  />
      <Welcome />
      <ServicesMini />
      <Specialties />
      <BookAppointment
        page="home"
        selectedDepartment={selectedDepartment}
        selectedDoctorId={selectedDoctorId}
      />
      <Doctors
        selectedDoctorId={selectedDoctorId}
        setSelectedDepartment={setSelectedDepartment}
        setSelectedDoctorId={setSelectedDoctorId}
      />
      <Testimonial />
      <News />
      <ContactSection />
    </>
  );
};

export default HomePage;
