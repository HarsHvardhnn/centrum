import React from "react";
import { FaCircle } from "react-icons/fa";

const HospitalCareSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto p-6 mt-10">
      <div className="md:w-2/5">
        <img
          src="/images/a-doctor.jfif"
          alt="Lekarz"
          className="h-[470px] w-[400px] object-cover"
        />
      </div>

      <div className="md:w-3/5 md:pl-10 text-gray-800">
        <h4 className="font-semibold uppercase mb-2">
          Witamy w Centrum Medycznym
        </h4>
        <h2 className="text-main font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
          Najlepsza opieka dla Twojego zdrowia
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:text-lg text-gray-700 mb-6">
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Pasja do leczenia
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            5-gwiazdkowa opieka
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Dajemy z siebie wszystko
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Zaufaj nam
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Zawsze z troską
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Tradycja doskonałości
          </p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4">
          Zapewniamy kompleksową opiekę medyczną na najwyższym poziomie. Nasz
          zespół doświadczonych specjalistów jest gotowy, aby zapewnić Ci
          profesjonalną pomoc i wsparcie w każdej sytuacji zdrowotnej.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Stawiamy na indywidualne podejście do każdego pacjenta, łącząc
          najnowocześniejsze metody leczenia z empatią i zrozumieniem potrzeb
          naszych pacjentów.
        </p>
      </div>
    </div>
  );
};

export default HospitalCareSection;
