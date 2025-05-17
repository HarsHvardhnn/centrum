import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import AllServices from "../AllServices";

const OurServicesPage = () => {
  return (
    <>
      <PageHeader
        title="Nasze Usługi"
        path="Strona główna / Usługi"
        bgurl="/images/uslugi.jpg"
      />
      <AllServices />
      <ContactSection />
    </>
  );
};

export default OurServicesPage;
