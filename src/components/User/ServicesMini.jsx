import React, { useState } from "react";
import servicesData from "../../utils/UserSideData/serviceData";

const ServicesMini = () => {
  const [selectedService, setSelectedService] = useState(servicesData[0]);

  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="text-lg md:text-xl font-bold text-neutral-800 text-center uppercase">
        Care You Can Believe In
      </h2>
      <h3 className="text-2xl md:text-4xl font-bold text-main font-serif mt-2 text-center mb-8 md:mb-16">
        Our Services
      </h3>

      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
        <div className="lg:w-1/5 w-full flex lg:block overflow-x-auto md:overflow-visible rounded-md border border-neutral-200">
          {servicesData.slice(0, 4).map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                className={`flex flex-col gap-2 items-center text-base md:text-xl p-4 h-28 md:h-32 justify-center w-1/3 md:w-full text-left whitespace-nowrap ${
                  selectedService.id === service.id
                    ? "bg-main text-white"
                    : "text-neutral-800"
                }`}
                onClick={() => setSelectedService(service)}
              >
                <span className="text-2xl md:text-4xl">
                  <Icon />
                </span>
                {service.title}
              </button>
            );
          })}
          <div className="bg-main flex justify-center items-center max-md:text-sm text-white text-center p-4 ">
            View All
          </div>
        </div>

        <div className="lg:w-4/5 w-full flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-white rounded-lg shadow-md">
          <div className="md:w-3/5 w-full">
            <p className="text-xl md:text-3xl text-neutral-900 font-semibold my-2">
              {selectedService.shortDescription}
            </p>

            <ul className="list-disc pl-5 text-gray-800 text-base md:text-xl my-4">
              {selectedService.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <p className="text-neutral-800 text-base md:text-xl">
              {selectedService.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full md:w-2/5">
            {selectedService.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={selectedService.title}
                className="w-full h-60 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesMini;
