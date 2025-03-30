import React from "react";
import Doctors from "../Doctors";
import ContactSection from "../ContactSection";
import { useParams } from "react-router-dom";
import ServiceDetail from "../ServiceDetail";
import PageHeader from "../PageHeader";

const ServicesDetailPage = () => {
  const { service } = useParams();
  return (
    <>
      <PageHeader
        title={service}
        path="Home / Services"
        bgurl="/images/services-header.jfif"
      />
      <ServiceDetail serviceName={service} />
      <Doctors />
      <ContactSection />
    </>
  );
};

export default ServicesDetailPage;
