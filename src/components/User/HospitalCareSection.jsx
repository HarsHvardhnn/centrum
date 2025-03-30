import React from "react";
import { FaCircle } from "react-icons/fa";

const HospitalCareSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto p-6 mt-10">
      <div className="md:w-2/5">
        <img
          src="/images/a-doctor.jfif"
          alt="Doctor"
          className="h-[470px] w-[400px] object-cover"
        />
      </div>
      
      <div className="md:w-3/5 md:pl-10 text-gray-800">
        <h4 className="font-semibold uppercase mb-2">
          Welcome to Hospital Name
        </h4>
        <h2 className="text-main font-serif font-bold text-3xl md:text-5xl mb-4">
          Best Care for Your Good Health
        </h2>
        
        <div className="grid grid-cols-2 gap-3 text-lg text-gray-700 mb-6">
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> A Passion for Healing
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> 5-Star Care
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> All our best
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> Believe in Us
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> Always Caring
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main" /> A Legacy of Excellence
          </p>
        </div>
        
        <p className="text-gray-600 leading-relaxed mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim et.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque. Convallis felis vitae tortor augue. Velit nascetur proin massa in.
        </p>
      </div>
    </div>
  );
};

export default HospitalCareSection;