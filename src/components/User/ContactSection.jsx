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
          <a
                  href="tel:+48797097487"
                  className=" transition-colors"
                >
                  (+48) 797 097 487
                </a>{" "}
                <a
                  href="tel:+48797127487"
                  className=" transition-colors"
                >
                  (+48) 797 127 487
                </a>
        </div>

        <div onClick={() => window.open("https://www.google.com/maps?q=51.1191680,20.8649307&entry=gps&lucs=,94224825,94227247,94227248,94231188,47071704,47069508,94218641,94203019,47084304,94208458,94208447&g_ep=CAISEjI1LjE2LjEuNzQ3NTI2NjMwMBgAIIgnKmMsOTQyMjQ4MjUsOTQyMjcyNDcsOTQyMjcyNDgsOTQyMzExODgsNDcwNzE3MDQsNDcwNjk1MDgsOTQyMTg2NDEsOTQyMDMwMTksNDcwODQzMDQsOTQyMDg0NTgsOTQyMDg0NDdCAlBM&skid=70261bec-fc59-4059-957e-4cbe04309fe1&g_st=com.google.maps.preview.copy", "_blank")} className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300 cursor-pointer">
          <FaMapMarkerAlt className="text-4xl mb-3 " />
          <h4 className="font-bold text-lg">LOKALIZACJA</h4>
              <span className="text-gray-800 mt-1">
                Powstańców Warszawy 7/1.5, <br className="hidden lg:block" />
                26-110 Skarżysko-Kamienna
              </span>
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaEnvelope className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">EMAIL</h4>
          <a
                href="mailto:kontakt@centrummedyczne7.pl"
                className="text-base  transition-colors"
              >
                kontakt@centrummedyczne7.pl
              </a>          {/* <p className="text-base">info@przychodnia.pl</p> */}
        </div>

        <div className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
          <FaClock className="text-4xl mb-3" />
          <h4 className="font-bold text-lg">GODZINY PRACY</h4>
              <p className="text-gray-800 mt-1">
                15:00-20:00 Poniedziałek-Piątek
              </p>
        </div>
      </div>
    </section>
  );
}
