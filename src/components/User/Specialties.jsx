import React from "react";
import { useSpecializations } from "../../context/SpecializationContext";
import { useNavigate } from "react-router-dom";

// const specialtiesData = [
//   { id: 1, name: "Neurology" },
//   { id: 2, name: "Bones" },
//   { id: 3, name: "Neurology" },
//   { id: 4, name: "Neurology" },
//   { id: 5, name: "Neurology" },
//   { id: 6, name: "Neurology" },
//   { id: 7, name: "Neurology" },
//   { id: 8, name: "Neurology" },
//   { id: 9, name: "Neurology" },
//   { id: 10, name: "Neurology" },
//   { id: 11, name: "Neurology" },
//   { id: 12, name: "Neurology" },
// ];

export default function Specialties() {
  const { specializations: specialtiesData } = useSpecializations();
  const navigate = useNavigate();
  return (
    <section className="py-12 text-center px-4 md:px-8 lg:px-16">
      <h3 className="text-lg md:text-xl font-bold text-neutral-800">
        PASJA DO LECZENIA, EMPATIA W DZIAŁANIU
      </h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8">
        Nasi Specjaliści
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {specialtiesData.map((specialty) => (
          <div
            key={specialty.id}
            onClick={() => navigate(`/user/doctors`)}
            className="border-2 rounded-lg p-6 md:p-8 flex flex-col items-center cursor-pointer transition-all duration-300 hover:bg-main text-neutral-900 hover:text-white"
          >
            <img src="/images/speciality.png" className="size-8 md:size-10" alt={specialty.name} />
            <p className="mt-2 text-base md:text-lg font-medium">
              {specialty.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
