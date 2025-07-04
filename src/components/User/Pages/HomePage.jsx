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

const HomePage = () => {
  const {
    selectedDepartment,
    setSelectedDepartment,
    selectedDoctorId,
    setSelectedDoctorId,
  } = useAppointmentContext();

console.log("selected doctor id",selectedDoctorId)
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

  return (
    <>
      <Hero />
      <Welcome />
      <ServicesMini />
      <Specialties />
      <BookAppointment
        page="home"
        selectedDepartment={selectedDepartment}
        selectedDoctorId={selectedDoctorId}
      />
      <Doctors
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
