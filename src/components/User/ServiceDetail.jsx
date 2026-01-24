import React, { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
import { useServices } from "../../context/serviceContext";
import { generateServiceSlug } from "../../utils/slugUtils";
import { useGoogleAnalytics } from "../Analytics/GoogleAnalytics";

const ServiceDetail = ({ serviceName }) => {
  const navigate = useNavigate();
  const { services, loading } = useServices();
  const { trackServiceView } = useGoogleAnalytics();

  // Find service by slug (URL-friendly version) or fallback to title
  const service = services.find((s) => 
    generateServiceSlug(s.title) === serviceName || s.title === serviceName
  );

  useEffect(() => {
    if (!loading && !service) {
      navigate("/uslugi");
    }
  }, [service, navigate, loading]);

  // Track service view when component loads
  useEffect(() => {
    if (service) {
      trackServiceView(service.title, service.price, 'medical_service');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]); // Only depend on service, trackServiceView is stable

  // Handle loading and error states with conditional rendering instead of early returns
  // This ensures all hooks are always called in the same order
  if (loading) {
    return <div className="text-center py-20">Wczytywanie szczegółów usługi...</div>;
  }

  if (!service) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mx-auto pt-16 max-w-6xl">
      <div className="w-full md:w-1/4 rounded-lg">
        <div className="border max-md:flex max-md:overflow-scroll border-neutral-200 rounded-lg overflow-hidden">
          {Array.isArray(services) && services.length > 0 ? services.map((item, index) => (
            <Link
              to={"/uslugi/" + generateServiceSlug(item.title || "")}
              key={item._id || `service-${index}`}
              className={`flex max-md:flex-col text-start items-center gap-2 cursor-pointer px-8 py-7 ${
                generateServiceSlug(item.title || "") === serviceName ? "bg-main text-white" : ""
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <FaHospital className="text-xl" />
                <div className="flex flex-col capitalize">
                  <span>{(item.title || "").length > 20 ? (item.title || "").slice(0, 20) + "..." : (item.title || "Usługa")}</span>
                </div>
              </div>
            </Link>
          )) : (
            <div className="p-8 text-center text-gray-500">Brak dostępnych usług</div>
          )}
        </div>
      </div>

      <div className="w-full md:w-3/4">
        <div className="w-full flex justify-center">
          <img
            src={service.images && Array.isArray(service.images) && service.images.length > 0 
              ? service.images[0] 
              : "/images/uslugi.jpg"}
            alt={service.title || "Usługa medyczna"}
            className="rounded-lg shadow-lg w-full h-80 md:h-96 object-cover"
            onError={(e) => {
              e.target.src = "/images/uslugi.jpg";
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-main capitalize">
            {service.title || "Usługa medyczna"}
          </h2>
          {/* Display the price prominently */}
          <div className="text-2xl font-bold text-main bg-neutral-100 px-4 py-2 rounded-lg">
            {service.price ? `${service.price} zł` : "Cena na zapytanie"}
          </div>
        </div>

        {service.bulletPoints && Array.isArray(service.bulletPoints) && service.bulletPoints.length > 0 && (
          <ul className="grid md:grid-cols-2 gap-2 mt-4 text-xl text-neutral-900">
            {service.bulletPoints.map((point, index) => (
              <li key={index} className="flex items-center gap-2">
                <GoDotFill className="text-main text-2xl" />
                {point}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-neutral-900 text-lg max-md:text-justify">
          {service.description || ""}
        </p>
      </div>
    </div>
  );
};

export default ServiceDetail;