import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import AllServices from "../AllServices";

const OurServicesPage = () => {
  return (
    <>
      <PageHeader
        title="Nasze usługi"
        path="Strona główna / Usługi"
        bgurl="/images/services-header.jfif"
      />
      <AllServices />
      <ContactSection />
    </>
  );
};

export default OurServicesPage;
