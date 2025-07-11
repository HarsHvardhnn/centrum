import React from "react";

function ContactForm() {
  return (
    <div className=" mx-auto">
      <h3 className="md:text-xl font-bold text-neutral-800">GET IN TOUCH</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 ">
        Contact
      </h2>
      <div className="bg-main-light rounded-lg">
        <div className="grid grid-cols-2">
          <input
            type="text"
            placeholder="Name"
            className="p-3 border outline-none rounded-tl-lg w-full bg-main text-white placeholder:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border outline-none rounded-tr-lg w-full bg-main text-white placeholder:text-white"
          />
        </div>
        <input
          type="text"
          placeholder="Subject"
          className="p-3 border outline-none w-full bg-main text-white placeholder:text-white"
        />
        <textarea
          placeholder="Message"
          className="p-3 border outline-none w-full h-40 text-white placeholder:text-white bg-main resize-none"
        />
        <button className="bg-main-light uppercase outline-none text-main font-semibold py-3 px-4 rounded-b-lg w-full">
          Submit
        </button>
      </div>
    </div>
  );
}

export default ContactForm;
