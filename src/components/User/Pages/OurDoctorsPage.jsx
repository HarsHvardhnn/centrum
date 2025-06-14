import React from "react";
import Doctors from "../Doctors";
import TestimonialSlider from "../TestimonialSlider";
import News from "../News";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import { useAppointmentContext } from "../../../UserLayout";
import MetaTags from '../../UtilComponents/MetaTags';

const OurDoctorsPage = () => {
  const { setSelectedDepartment, setSelectedDoctorId } =
    useAppointmentContext();
  return (
    <>
      <MetaTags 
        title="Nasi lekarze – Centrum Medyczne 7 Skarżysko-Kamienna | Zespół specjalistów"
        description="Poznaj lekarzy CM7 w Skarżysku-Kamiennej. Doświadczeni specjaliści w różnych dziedzinach medycyny – sprawdź nasz zespół."
        path="/lekarze"
      />
      <PageHeader
        title="Nasi Specjaliści "
        path="Strona główna / Lekarze"
        bgurl="/images/Specialities.jpg"
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
