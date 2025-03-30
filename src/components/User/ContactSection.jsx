import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="py-12 px-6 text-main">
      <h3 className="text-xl font-bold text-neutral-800 text-center">GET IN TOUCH</h3>
      <h2 className="text-4xl font-bold text-main mt-2 text-center font-serif">Contact</h2>

      <div className="mt-8 grid md:grid-cols-4 gap-6 max-w-6xl mx-auto pt-10">
        <div className="bg-main-light hover:bg-main hover:text-white px-8 gap-1 py-16 rounded-lg text-xl flex flex-col">
          <FaPhoneAlt className=" text-4xl mb-2" />
          <h4 className="font-bold ">EMERGENCY</h4>
          <p className=" text-lg">(237) 681-812-255</p>
          <p className=" text-lg">(237) 666-331-894</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white px-8 gap-1 py-16 rounded-lg text-xl flex flex-col">
          <FaMapMarkerAlt className="text-4xl mb-2" />
          <h4 className="font-bold">LOCATION</h4>
          <p className="text-lg">0123 Some place</p>
          <p className="text-lg">9876 Some country</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white px-8 gap-1 py-16 rounded-lg text-xl flex flex-col">
          <FaEnvelope className=" text-4xl mb-2" />
          <h4 className="font-bold ">EMAIL</h4>
          <p className=" text-lg">fildineeesoe@gmail.com</p>
          <p className=" text-lg">myebstudios@gmail.com</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white px-8 gap-1 py-16 rounded-lg text-xl flex flex-col">
          <FaClock className=" text-4xl mb-2" />
          <h4 className="font-bold ">WORKING HOURS</h4>
          <p className=" text-lg">Mon-Sat 09:00-20:00</p>
          <p className=" text-lg">Sunday Emergency only</p>
        </div>
      </div>
    </section>
  );
}
