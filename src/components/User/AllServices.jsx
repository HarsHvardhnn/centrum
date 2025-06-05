import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useServices } from "../../context/serviceContext";
import { generateServiceSlug } from "../../utils/slugUtils";

const ServiceCard = ({ service }) => {
  // Function to truncate text to specific length
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col h-full">
      <img
        src={service.images[0]}
        alt={service.title}
        className="w-full h-52 object-cover rounded-t-md"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-main mb-2">
            {service.title}
          </h3>
          {/* Display the price */}
          <div className="inline-block text-lg font-bold text-main bg-neutral-100 px-3 py-1 rounded-lg whitespace-nowrap">
            {service.price || "N/D"} zł
          </div>
        </div>
        <div className="flex-grow">
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">
            {truncateText(service.description, 120)}
          </p>
        </div>
        <Link
          to={"/uslugi/" + generateServiceSlug(service.title)}
          className="text-main flex items-center gap-1 mt-3 font-medium"
        >
          Dowiedz się więcej <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

const AllServices = () => {
  const { services, loading, error } = useServices();

  if (loading) {
    return <div className="text-center py-20">Ładowanie usług...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto gap-6 pt-16 p-6">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
};

export default AllServices;
