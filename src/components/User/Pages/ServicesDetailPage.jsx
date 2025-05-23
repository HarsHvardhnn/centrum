import React from "react";
import Doctors from "../Doctors";
import ContactSection from "../ContactSection";
import { useParams } from "react-router-dom";
import ServiceDetail from "../ServiceDetail";
import PageHeader from "../PageHeader";
import { ServicesProvider } from "../../../context/serviceContext";

const ServicesDetailPage = () => {
  const { service } = useParams();
  return (
    <>
      <PageHeader
        title={service}
        path="Strona główna / Usługi"
        bgurl="/images/name_services.jpg"
        />
      <ServiceDetail serviceName={service} />
      <Doctors />
      <ContactSection />
    </>
  );
};

export default ServicesDetailPage;
