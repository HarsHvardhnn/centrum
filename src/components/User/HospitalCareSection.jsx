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
          WITAMY W CENTRUM MEDYCZNE 7
        </h4>
        <h2 className="text-main font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
           Profesjonalna Opieka Zdrowotna 
dla Ciebie i Twojej Rodziny
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:text-lg text-gray-700 mb-6">
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Indywidualne podejście do pacjenta
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Nowoczesna opieka medyczna
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Specjaliści z doświadczeniem
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Nowoczesne metody leczenia 
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Wiedza oparta na nauce i
            doświadczeniu
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Polecana klinika w Świętokrzyskim
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
