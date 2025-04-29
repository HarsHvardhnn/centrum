import React, { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import * as Icons from "react-icons/fa";
import { useServices } from "../../context/serviceContext";

const ServiceDetail = ({ serviceName }) => {
  const navigate = useNavigate();
  const { services, loading } = useServices();

  const service = services.find((s) => s.title === serviceName);

  useEffect(() => {
    if (!loading && !service) {
      navigate("/user/services");
    }
  }, [service, navigate, loading]);

  if (loading) {
    return <div className="text-center py-20">Loading service details...</div>;
  }

  if (!service) {
    return null;
  }

  // Get a random icon from the Icons object
  const getRandomIcon = () => {
    const iconKeys = Object.keys(Icons);
    const randomIndex = Math.floor(Math.random() * iconKeys.length);
    const randomIconName = iconKeys[randomIndex];
    return Icons[randomIconName];
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mx-auto pt-16 max-w-6xl">
      <div className="w-full md:w-1/4 rounded-lg">
        <div className="border max-md:flex max-md:overflow-scroll border-neutral-200 rounded-lg overflow-hidden">
          {services.map((item) => {
            // Use a random icon for each service
            const RandomIcon = getRandomIcon();
            return (
              <Link
                to={"/user/services/" + item.title}
                key={item._id}
                className={`flex max-md:flex-col text-center items-center gap-2 cursor-pointer px-8 py-7 ${
                  item.title === serviceName ? "bg-main text-white" : ""
                }`}
              >
                <RandomIcon className="text-xl" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {/* Display the price */}
              
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="w-full md:w-3/4">
        <div className="w-full flex justify-center">
          <img
            src={service.images[0]}
            alt={service.title}
            className="rounded-lg shadow-lg w-full h-80 md:h-[500px] object-cover"
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-main">
            {service.title}
          </h2>
          {/* Display the price prominently */}
          <div className="text-2xl font-bold text-main bg-neutral-100 px-4 py-2 rounded-lg">
            ${service.price || "N/A"}
          </div>
        </div>

        <ul className="grid md:grid-cols-2 gap-2 mt-4 text-xl text-neutral-900">
          {service.bulletPoints.map((point, index) => (
            <li key={index} className="flex items-center gap-2 ">
              <GoDotFill className="text-main text-2xl" />
              {point}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-neutral-900 text-lg max-md:text-justify">
          {service.description}
        </p>
      </div>
    </div>
  );
};

export default ServiceDetail;
