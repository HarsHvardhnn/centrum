import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import AllServices from "../AllServices";
import MetaTags from '../../UtilComponents/MetaTags';

const OurServicesPage = () => {
  return (
    <>
      <MetaTags 
        title="Usługi medyczne – Centrum Medyczne 7 Skarżysko-Kamienna"
        description="Konsultacja chirurgiczna | Konsultacja online | Konsultacja proktologiczna | Leczenie ran przewlekłych | Neurologia dziecięca"
        path="/uslugi"
      />
      <PageHeader
        title="Nasze Usługi"
        path="Strona główna / Usługi"
        bgurl="/images/uslugi_2.jpg"
      />
      <AllServices />
      <ContactSection />
    </>
  );
};

export default OurServicesPage;
