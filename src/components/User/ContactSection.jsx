import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="py-12 px-6 text-main">
      <h3 className="md:text-xl font-bold text-neutral-800 text-center">SKONTAKTUJ SIĘ Z NAMI</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main text-center font-serif mt-2 mb-8 sm:mb-12">Kontakt</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto ">
        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaPhoneAlt className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">NAGŁE PRZYPADKI</h4>
          <p className="text-base">(237) 681-812-255</p>
          <p className="text-base">(237) 666-331-894</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaMapMarkerAlt className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">LOKALIZACJA</h4>
          <p className="text-base">ul. Przykładowa 123</p>
          <p className="text-base">00-000 Warszawa</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaEnvelope className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">EMAIL</h4>
          <p className="text-base">kontakt@przychodnia.pl</p>
          <p className="text-base">info@przychodnia.pl</p>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaClock className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">GODZINY PRACY</h4>
          <p className="text-base">Pon-Sob 09:00-20:00</p>
          <p className="text-base">Niedziela tylko nagłe przypadki</p>
        </div>
      </div>
    </section>
  );
}
