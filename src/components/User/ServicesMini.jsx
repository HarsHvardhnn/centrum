import React, { useState } from "react";
import servicesData from "../../utils/UserSideData/serviceData";

const ServicesMini = () => {
  const [selectedService, setSelectedService] = useState(servicesData[0]);

  return (
    <section className="py-12 px-6">
      <h2 className="text-xl font-bold text-neutral-800 text-center uppercase">
        Care You Can Believe In
      </h2>
      <h3 className="text-4xl font-bold text-main font-serif mt-2 text-center mb-16">
        Our Services
      </h3>

      <div className="flex gap-4 max-w-6xl mx-auto">
        <div className="w-1/5 rounded-md border border-neutral-200">
          {servicesData.slice(0,4).map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                className={`flex flex-col gap-2 items-center text-xl p-4 h-32 justify-center w-full text-left ${
                  selectedService.id === service.id
                    ? "bg-main text-white"
                    : " text-neutral-800"
                }`}
                onClick={() => setSelectedService(service)}
              >
                <span className="text-4xl mr-3">
                  <Icon />
                </span>
                {service.title}
              </button>
            );
          })}
          <div className="bg-main text-white text-center p-4">View All</div>
        </div>

        <div className="w-4/5 flex gap-4 p-6 bg-white ">
          <div className="w-3/5">
            
            <p className="text-3xl text-neutral-900 font-semibold my-2">
              {selectedService.shortDescription}
            </p>

            <ul className="list-disc pl-5 text-gray-800 text-xl my-4">
              {selectedService.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <p className="text-neutral-800 text-xl">{selectedService.description}</p>
          </div>
          <div className="flex flex-col w-2/5 gap-4 mt-4">
            {selectedService.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={selectedService.title}
                className="w-full h-60 object-cover "
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesMini;
