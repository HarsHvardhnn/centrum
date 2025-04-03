import React, { useEffect } from "react";
import servicesData from "../../utils/UserSideData/serviceData";
import { GoDotFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";

const ServiceDetail = ({ serviceName }) => {
  const navigate = useNavigate();
  const service = servicesData.find((s) => s.title === serviceName);

  useEffect(() => {
    if (!service) {
      navigate("/user/services");
    }
  }, [service, navigate]);

  if (!service) {
    return null; 
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mx-auto pt-16 max-w-6xl">
      <div className="w-full md:w-1/4 rounded-lg">
        <div className=" border max-md:flex max-md:overflow-scroll border-neutral-200 rounded-lg overflow-hidden">
          {servicesData.map((item) => (
            <Link
              to={"/user/services/" + item.title}
              key={item.id}
              className={`flex max-md:flex-col text-center items-center gap-2 cursor-pointer px-8 py-7 ${
                item.title === serviceName ? "bg-main text-white" : ""
              }`}
            >
              <item.icon className="text-xl" />
              {item.title}
            </Link>
          ))}
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

        <h2 className="text-3xl md:text-4xl font-serif font-bold text-main mt-6">
          {service.title}
        </h2>

        <ul className="grid md:grid-cols-2 gap-2 mt-4 text-xl text-neutral-900">
          {service.bulletPoints.map((point, index) => (
            <li key={index} className="flex items-center gap-2 ">
              <GoDotFill className="text-main text-2xl" />
              {point}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-neutral-900 text-lg max-md:text-justify">{service.description}</p>
      </div>
    </div>
  );
};

export default ServiceDetail;
