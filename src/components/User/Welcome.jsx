import React from "react";
import { FaArrowRight } from "react-icons/fa6";

export default function Welcome() {
  return (
    <section className="py-12 text-center bg-white px-4 md:px-8 lg:px-16">
      <h3 className="font-bold text-xl text-neutral-800 uppercase mt-2">
        CENTRUM MEDYCZNE 7
      </h3>
      <h2 className="text-3xl md:text-4xl font-bold font-serif text-main mt-2">
        Twoje Zdrowie w Dobrych Rękach
      </h2>
      <p className="text-neutral-700 text-lg mt-4 max-w-4xl mx-auto leading-relaxed">
        Naszą misją jest leczenie z pełnym szacunkiem, empatią i zaangażowaniem. – szybkie specjalistyczne konsultacje i zabiegi bez skierowania.
      </p>

      <div className="mt-6">
        <a
          href="/o-nas"
          className="text-neutral-900 gap-4 text-lg md:text-xl inline-flex items-center hover:underline"
        >
          Dowiedz się więcej <FaArrowRight className="text-main mt-1" />
        </a>
      </div>

      <div className="mt-10 relative max-w-5xl mx-auto">
        <img
          src="https://res.cloudinary.com/dca740eqo/image/upload/v1753429968/hospital_app/images/cfskl4vvjqaet2k3hnmv.jpg"
          alt="Personel medyczny podczas operacji"
          className="h-72 md:h-96 rounded-lg w-full object-contain"
        />  
      </div>
    </section>
  );
}
