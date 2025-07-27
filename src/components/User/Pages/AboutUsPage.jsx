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
        title="O nas"
        path="Strona główna / O nas"
        bgurl="/images/abt_us.jpg"
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
