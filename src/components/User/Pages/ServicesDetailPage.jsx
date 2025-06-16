import React, { useEffect, useState } from "react";
import Doctors from "../Doctors";
import ContactSection from "../ContactSection";
import { useParams } from "react-router-dom";
import ServiceDetail from "../ServiceDetail";
import PageHeader from "../PageHeader";
import { ServicesProvider } from "../../../context/serviceContext";
import { useServices } from "../../../context/serviceContext";
import { generateServiceSlug } from "../../../utils/slugUtils";
import MetaTags from '../../UtilComponents/MetaTags';

const ServicesDetailPage = () => {
  const { service } = useParams();
  const { services, loading } = useServices();
  const [currentService, setCurrentService] = useState(null);
  
  useEffect(() => {
    if (services.length > 0) {
      // Find service by slug (URL-friendly version) or fallback to title
      const foundService = services.find((s) => 
        generateServiceSlug(s.title) === service || s.title === service
      );
      setCurrentService(foundService);
      
      if (foundService) {
        // Add page data to DOM for SEO (similar to NewsDetail.jsx)
        const pageData = {
          title: foundService.title,
          shortDescription: foundService.shortDescription || foundService.description,
          description: foundService.description,
          price: foundService.price,
          image: foundService.images?.[0],
          type: 'service'
        };
        
        // Remove existing page data if any
        const existingData = document.querySelector('script[data-page-data]');
        if (existingData) {
          existingData.remove();
        }
        
        // Add new page data
        const script = document.createElement('script');
        script.type = 'application/json';
        script.setAttribute('data-page-data', '');
        script.textContent = JSON.stringify(pageData);
        document.head.appendChild(script);
      }
    }
  }, [services, service]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      const script = document.querySelector('script[data-page-data]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Default service data if not found yet
  const serviceData = currentService || {
    title: service || "Usługa medyczna",
    shortDescription: "Szczegółowy opis usługi medycznej w Centrum Medycznym 7.",
  };

  return (
    <>
      <MetaTags 
        title={`${serviceData.title} – Centrum Medyczne 7 Skarżysko-Kamienna`}
        description={serviceData.shortDescription || serviceData.description || "Szczegółowy opis usługi medycznej w Centrum Medycznym 7."}
        path={`/uslugi/${service}`}
      />
      <PageHeader
        title={serviceData.title}
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
