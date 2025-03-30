import React from "react";
import ContactSection from "../ContactSection";
import News from "../News";
import Testimonial from "../Testimonial";
import Doctors from "../Doctors";
import BookAppointment from "../BookAppointment";
import Specialties from "../Specialties";
import Welcome from "../Welcome";
import Hero from "../Hero";
import ServicesMini from "../ServicesMini";

const HomePage = () => {
  return (
    <>
      <Hero />
      <Welcome />
      <ServicesMini/>
      <Specialties />
      <BookAppointment />
      <Doctors />
      <Testimonial />
      <News />
      <ContactSection />
    </>
  );
};

export default HomePage;
