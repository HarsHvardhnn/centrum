import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import AllServices from "../AllServices";
import MetaTags from '../../UtilComponents/MetaTags';

const OurServicesPage = () => {
  return (
    <>
      <MetaTags 
        title="Usługi Medyczne – Centrum Medyczne 7 Skarżysko-Kamienna"
        description="USG, EKG, Holter, proktologia, chirurgia, neurologia dziecięca i inne usługi medyczne – prywatnie, bez skierowania. Skarżysko-Kamienna, Świętokrzyskie. Zobacz."
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
