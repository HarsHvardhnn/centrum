import React from "react";
import { FaArrowRight } from "react-icons/fa6";

export default function Welcome() {
  return (
    <section className="py-12 text-center bg-white px-4 md:px-8 lg:px-16">
      <h3 className="font-bold text-xl text-neutral-800 uppercase">
        Witamy w Centrum Medyczne 7
      </h3>
      <h2 className="text-3xl md:text-4xl font-bold font-serif text-main mt-2">
        Twoje Zdrowie w Dobrych Rękach
      </h2>
      <p className="max-w-3xl mx-auto text-neutral-900 text-lg md:text-xl mt-4">
        Naszą misją jest zapewnienie opieki medycznej na najwyższym poziomie — z
        szacunkiem, empatią i pełnym zaangażowaniem.
      </p>

      <div className="mt-6">
        <a
          href="/user/about"
          className="text-neutral-900 gap-4 text-lg md:text-xl inline-flex items-center hover:underline"
        >
          Dowiedz się więcej <FaArrowRight className="text-main mt-1" />
        </a>
      </div>

      <div className="mt-10 relative max-w-5xl mx-auto">
        <img
          src="/images/welcome.jfif"
          alt="Personel medyczny podczas operacji"
          className="h-60 md:h-72 rounded-lg shadow-lg w-full object-cover object-top"
        />
      </div>
    </section>
  );
}
