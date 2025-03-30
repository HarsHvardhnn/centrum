import React from "react";
import { FaArrowRight } from "react-icons/fa6";

export default function Welcome() {
  return (
    <section className="py-12 text-center bg-white">
      <h3 className="font-bold text-xl text-neutral-800 uppercase">
        Welcome to Meddical
      </h3>
      <h2 className="text-4xl font-bold font-serif text-main mt-2">
        A Great Place to Receive Care
      </h2>
      <p className="max-w-3xl mx-auto text-neutral-900 text-xl mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
        placerat scelerisque tortor ornare ornare. Convallis felis vitae tortor
        augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim
        et.
      </p>

      <div className="mt-6">
        <a
          href="#"
          className="text-neutral-900 gap-4 text-xl inline-flex  items-center hover:underline"
        >
          Learn More <FaArrowRight className="text-main mt-1" />
        </a>
      </div>

      <div className="mt-10 relative max-w-5xl mx-auto">
        <img
          src="/images/welcome.jfif"
          alt="Medical staff in operation"
          className="h-72 rounded-lg shadow-lg w-full object-cover object-top"
        />
      </div>
    </section>
  );
}
