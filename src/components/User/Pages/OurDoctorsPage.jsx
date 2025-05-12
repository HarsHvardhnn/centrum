import React from "react";
import Doctors from "../Doctors";
import TestimonialSlider from "../TestimonialSlider";
import News from "../News";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import { useAppointmentContext } from "../../../UserLayout";

const OurDoctorsPage = () => {
  const { setSelectedDepartment, setSelectedDoctorId } =
    useAppointmentContext();
  return (
    <>
      <PageHeader
        title="Nasi Specjaliści "
        path="Strona główna / Lekarze"
        bgurl="/images/about-header.jpg"
      />
      <Doctors
        setSelectedDoctorId={setSelectedDoctorId}
        setSelectedDepartment={setSelectedDepartment}
      />
      <TestimonialSlider />
      <News />
      <ContactSection />
    </>
  );
};

export default OurDoctorsPage;
