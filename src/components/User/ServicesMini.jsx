import React, { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaDna,
  FaTint,
  FaStethoscope,
  FaNotesMedical,
} from "react-icons/fa";
import { axiosInstance } from "../../utils/axiosInstance";

const ServicesMini = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Array of available icons to randomly assign
  const icons = [FaHeartbeat, FaDna, FaTint, FaStethoscope, FaNotesMedical];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/services");
        
        // Add a random icon to each service
        const servicesWithIcons = response.data.map(service => ({
          ...service,
          icon: icons[Math.floor(Math.random() * icons.length)]
        }));
        
        setServices(servicesWithIcons);
        
        // Set the first service as selected if available
        if (servicesWithIcons.length > 0) {
          setSelectedService(servicesWithIcons[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setError("Failed to load services. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-12 px-4 md:px-8 text-center">
        <h2 className="text-lg md:text-xl font-bold text-neutral-800 uppercase">
          JESTEŚMY TU DLA CIEBIE
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 md:mb-16">
          Nasze Usługi
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-12 px-4 md:px-8 text-center">
        <h2 className="text-lg md:text-xl font-bold text-neutral-800 uppercase">
          JESTEŚMY TU DLA CIEBIE
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 md:mb-16">
          Nasze Usługi
        </h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </section>
    );
  }

  // Show empty state
  if (services.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8 text-center">
        <h2 className="text-lg md:text-xl font-bold text-neutral-800 uppercase">
          JESTEŚMY TU DLA CIEBIE
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 md:mb-16">
          Nasze Usługi
        </h3>
        <div className="bg-gray-100 p-8 rounded-lg">
          <p className="text-lg text-gray-600">Aktualnie brak dostępnych usług.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="text-lg md:text-xl font-bold text-neutral-800 text-center uppercase">
      JESTEŚMY TU DLA CIEBIE
      </h2>
      <h3 className="text-2xl md:text-4xl font-bold text-main font-serif mt-2 text-center mb-8 md:mb-16">
        Nasze Usługi
      </h3>

      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
        <div className="lg:w-1/5 w-full flex lg:block overflow-x-auto md:overflow-visible rounded-md border border-neutral-200">
          {services.slice(0, 4).map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service._id}
                className={`flex flex-col gap-2 items-center text-sm sm:text-base md:text-xl p-2 sm:p-4 min-h-[7rem] sm:min-h-[8rem] md:min-h-[9rem] justify-center flex-1 lg:w-full text-center ${
                  selectedService && selectedService._id === service._id
                    ? "bg-main text-white"
                    : "text-neutral-800"
                }`}
                onClick={() => setSelectedService(service)}
              >
                <span className="text-xl sm:text-2xl md:text-4xl">
                  <Icon />
                </span>
                <span className="line-clamp-2 text-center w-full px-1">
                  {service.title}
                </span>
              </button>
            );
          })}
          <div className="bg-main flex justify-center items-center text-xs sm:text-sm md:text-base text-white text-center p-2 sm:p-4 cursor-pointer whitespace-normal min-h-[3rem]">
            Zobacz wszystkie
          </div>
        </div>

        {selectedService && (
          <div className="lg:w-4/5 w-full flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-white rounded-lg shadow-md">
            <div className="md:w-3/5 w-full">
              <p className="text-lg sm:text-xl md:text-3xl text-neutral-900 font-semibold my-2">
                {selectedService.shortDescription || selectedService.title}
              </p>

              {selectedService.bulletPoints && selectedService.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 text-gray-800 text-sm sm:text-base md:text-xl my-4">
                  {selectedService.bulletPoints.map((point, index) => (
                    <li key={index} className="mb-1">{point}</li>
                  ))}
                </ul>
              )}

              <p className="text-neutral-800 text-sm sm:text-base md:text-xl">
                {selectedService.description || "Brak opisu dla tej usługi."}
              </p>
              
              {selectedService.price && (
                <p className="text-main text-lg sm:text-xl md:text-2xl font-bold mt-4">
                  Cena: {selectedService.price} zł
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 w-full md:w-2/5">
              {selectedService.images && selectedService.images.length > 0 ? (
                selectedService.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={selectedService.title}
                    className="w-full h-48 sm:h-60 object-cover rounded-lg"
                  />
                ))
              ) : (
                <div className="w-full h-48 sm:h-60 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Brak zdjęć</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesMini;