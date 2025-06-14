import React from "react";
import Doctors from "../Doctors";
import News from "../News";
import ContactSection from "../ContactSection";
import TestimonialSlider from "../TestimonialSlider";
import PageHeader from "../PageHeader";
import HospitalCareSection from "../HospitalCareSection";
import { useAppointmentContext } from "../../../UserLayout";
import MetaTags from '../../UtilComponents/MetaTags';

const AboutUsPage = () => {
  const {
    setSelectedDepartment,
    setSelectedDoctorId,
  } = useAppointmentContext();
  return (
    <>
      <MetaTags 
        title="O nas – Centrum Medyczne 7 Skarżysko-Kamienna | Kim jesteśmy"
        description="Poznaj Centrum Medyczne 7 w Skarżysku-Kamiennej. Nasza misja, wartości i zespół lekarzy, którym możesz zaufać."
        path="/o-nas"
      />
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
