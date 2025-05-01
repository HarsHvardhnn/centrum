import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useServices } from "../../context/serviceContext";

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border">
      <img
        src={service.images[0]}
        alt={service.title}
        className="w-full h-80 object-cover rounded-t-md"
      />
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-main">{service.title}</h3>
          {/* Display the price */}
          <div className="text-lg font-bold text-main bg-neutral-100 px-3 py-1 rounded-lg">
            {service.price || "N/D"} zł
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
          {service.description}
        </p>
        <Link
          to={"/user/services/" + service.title}
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
    <div className="grid md:grid-cols-3 max-w-6xl mx-auto gap-6 pt-16 p-6">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
};

export default AllServices;
