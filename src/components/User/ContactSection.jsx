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

        <div onClick={() => window.open("https://www.google.com/maps?q=Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skarżysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dziecięcy,+Powstańców+Warszawy+7/1.5,+26-110+Skarżysko-Kamienna&ftid=0x471839d944445df7:0x28ce2724c759c930&entry=gps&lucs=,94224825,94227247,94227248,94231188,47071704,47069508,94218641,94282134,94203019,47084304&g_ep=CAISEjI1LjI2LjEuNzc0OTk0MTAzMBgAIIgnKlosOTQyMjQ4MjUsOTQyMjcyNDcsOTQyMjcyNDgsOTQyMzExODgsNDcwNzE3MDQsNDcwNjk1MDgsOTQyMTg2NDEsOTQyODIxMzQsOTQyMDMwMTksNDcwODQzMDRCAlBM&skid=a2fce70d-91ed-4545-820b-2d51843d2b00&g_st=ipc", "_blank")} className="bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300 cursor-pointer">
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
              Poniedziałek – Piątek 15:00 – 20:00 <br />
              Sobota – umówione wizyty              </p>
        </div>
      </div>
    </section>
  );
}
