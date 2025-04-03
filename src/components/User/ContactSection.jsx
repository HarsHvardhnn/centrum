import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="py-12 px-6 text-main">
      <h3 className="md:text-xl font-bold text-neutral-800 text-center">GET IN TOUCH</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main text-center font-serif mt-2 mb-8 sm:mb-12">Contact</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto ">
        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaPhoneAlt className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">EMERGENCY</h4>
          <p className="text-base">(237) 681-812-255</p>
          <p className="text-base">(237) 666-331-894</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaMapMarkerAlt className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">LOCATION</h4>
          <p className="text-base">0123 Some place</p>
          <p className="text-base">9876 Some country</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaEnvelope className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">EMAIL</h4>
          <p className="text-base">fildineeesoe@gmail.com</p>
          <p className="text-base">myebstudios@gmail.com</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaClock className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">WORKING HOURS</h4>
          <p className="text-base">Mon-Sat 09:00-20:00</p>
          <p className="text-base">Sunday Emergency only</p>
        </div>
      </div>
    </section>
  );
}
