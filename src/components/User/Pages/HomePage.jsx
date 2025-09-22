import React, { useEffect } from "react";
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

const  HomePage = () => {
  const {
    selectedDepartment,
    setSelectedDepartment,
    selectedDoctorId,
    setSelectedDoctorId,
  } = useAppointmentContext();

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

  // Generate LocalBusiness Schema (JSON-LD)
  const generateLocalBusinessSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      "name": "Centrum Medyczne 7",
      "alternateName": "CM7",
      "description": "Prywatna przychodnia specjalistyczna w Skarżysku-Kamiennej. Chirurgia, proktologia, neurologia dziecięca. Doświadczeni lekarze i szybkie terminy wizyt.",
      "url": "https://centrummedyczne7.pl",
      "logo": "https://centrummedyczne7.pl/images/mainlogo.png",
      "image": "https://centrummedyczne7.pl/images/mainlogo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Powstańców Warszawy 7/1.5",
        "addressLocality": "Skarżysko-Kamienna",
        "postalCode": "26-110",
        "addressCountry": "PL",
        "addressRegion": "Świętokrzyskie"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "51.1191214",
        "longitude": "20.864972"
      },
      "telephone": "+48797097487",
      "email": "kontakt@centrummedyczne7.pl",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "15:00",
          "closes": "20:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "medicalSpecialty": [
        "Chirurgia",
        "Proktologia", 
        "Neurologia dziecięca",
        "Leczenie ran przewlekłych"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Usługi medyczne",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalProcedure",
              "name": "Konsultacja chirurgiczna"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "MedicalProcedure",
              "name": "Konsultacja proktologiczna"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalProcedure", 
              "name": "Neurologia dziecięca"
            }
          }
        ]
      },
      "sameAs": [
        "https://www.facebook.com/klinikacm7/",
        "https://www.instagram.com/centrummedyczne7/"
      ]
    };

    return schema;
  };

  return (
    <>
      <MetaTags 
        title="Centrum Medyczne 7 Skarżysko-Kamienna – Przychodnia specjalistyczna"
        description="Prywatna przychodnia specjalistyczna w Skarżysku-Kamiennej. Chirurgia, proktologia, neurologia dziecięca. Doświadczeni lekarze i szybkie terminy wizyt."
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
