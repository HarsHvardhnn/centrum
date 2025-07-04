import React from "react";
import Doctors from "../Doctors";
import News from "../News";
import ContactSection from "../ContactSection";
import TestimonialSlider from "../TestimonialSlider";
import PageHeader from "../PageHeader";
import HospitalCareSection from "../HospitalCareSection";
import { useAppointmentContext } from "../../../UserLayout";

const AboutUsPage = () => {
  const {
    setSelectedDepartment,
    setSelectedDoctorId,
  } = useAppointmentContext();
  return (
    <>
      <PageHeader
        title="About Us"
        path="Home / About Us"
        bgurl="/images/about-header.jpg"
      />
      <HospitalCareSection />
      <TestimonialSlider />
      <Doctors
        setSelectedDoctorId={setSelectedDoctorId}
        setSelectedDepartment={setSelectedDepartment}
      />
      <News />
      <ContactSection />
    </>
  );
};

export default AboutUsPage;
