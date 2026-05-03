import React, { useMemo } from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import AllServices from "../AllServices";
import MetaTags from '../../UtilComponents/MetaTags';
import { useServices } from "../../../context/serviceContext";
import { buildServicesOfferCatalogSchema } from "../../../utils/serviceSchemaUtils";

const OurServicesPage = () => {
  const { services, loading, error } = useServices();
  const catalogSchema = useMemo(() => {
    if (loading || error || !services?.length) return null;
    return buildServicesOfferCatalogSchema(services);
  }, [services, loading, error]);

  return (
    <>
      <MetaTags 
        title="Usługi Medyczne – Centrum Medyczne 7 Skarżysko-Kamienna"
        description="USG, EKG, Holter, proktologia, chirurgia, neurologia dziecięca i inne usługi medyczne – prywatnie, bez skierowania. Skarżysko-Kamienna, Świętokrzyskie. Zobacz."
        path="/uslugi"
        ogImage="/images/uslugi.jpg"
      />
      {catalogSchema && (
        <script type="application/ld+json">{JSON.stringify(catalogSchema)}</script>
      )}
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
