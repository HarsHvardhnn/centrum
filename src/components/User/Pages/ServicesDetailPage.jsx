import React from "react";
import Doctors from "../Doctors";
import ContactSection from "../ContactSection";
import { useParams } from "react-router-dom";
import ServiceDetail from "../ServiceDetail";
import PageHeader from "../PageHeader";
import { ServicesProvider } from "../../../context/serviceContext";
import MetaTags from '../../UtilComponents/MetaTags';

const ServicesDetailPage = () => {
  const { service } = useParams();
  
  // Assuming you have the service data available
  const serviceData = {
    title: "Service Title", // This should come from your data source
    description: "Service description", // This should come from your data source
  };

  return (
    <>
      <MetaTags 
        title={`${serviceData.title} – Centrum Medyczne 7 Skarżysko-Kamienna`}
        description={serviceData.description}
        path={`/uslugi/${service}`}
      />
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
