import React from "react";
import Doctors from "../Doctors";
import TestimonialSlider from "../TestimonialSlider";
import News from "../News";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";

const OurDoctorsPage = () => {
  return (
    <>
      <PageHeader
        title="Our Doctors"
        path="Home / Doctors"
        bgurl="/images/about-header.jpg"
      />
      <Doctors />
      <TestimonialSlider />
      <News />
      <ContactSection />
    </>
  );
};

export default OurDoctorsPage;
