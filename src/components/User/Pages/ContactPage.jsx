import ContactForm from "../ContactForm";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import News from "../News";
import PageHeader from "../PageHeader";
import Map from "../Map";

const ContactPage = () => {
  return (
    <>
      <PageHeader
        title="Kontakt"
        path="Strona główna / Kontakt"
        bgurl="/images/contact.jpg"
      />
      <Map />
      <div className="flex max-xl:flex-col gap-4 max-w-6xl mx-auto pt-12 px-4 md:px-16">
        <div className="flex-1 w-full max-w-3xl mx-auto">
          <ContactForm />
        </div>

        <div className="mt-8 flex flex-1 flex-col mx-auto gap-4">
          <div className="flex max-md:flex-col flex-1 gap-4">
            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaPhoneAlt className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">NAGŁE PRZYPADKI</h4>
              <div className="text-gray-800 mt-1 space-y-1">
                <a
                  href="tel:+48797097487"
                  className=" transition-colors"
                >
                  (+48) 797 097 487
                </a>{" "}
                , {"    "}
                <a
                  href="tel:+48797127487"
                  className=" transition-colors"
                >
                  (+48) 797 127 487
                </a>
              </div>
            </div>

            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaMapMarkerAlt className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">LOKALIZACJA</h4>
              <span className="text-gray-800 mt-1">
                Powstańców Warszawy 7/1.5, <br className="hidden lg:block" />
                26-110 Skarżysko-Kamienna
              </span>
            </div>
          </div>
          <div className="flex flex-1 max-md:flex-col gap-4">
            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaEnvelope className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">EMAIL</h4>
              <a
                href="mailto:kontakt@centrummedyczne7.pl"
                className="text-base  transition-colors"
              >
                kontakt@centrum medyczne7.pl
              </a>
              {/* <p className="text-base">myebstudios@gmail.com</p> */}
            </div>

            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaClock className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">GODZINY PRACY</h4>
              <p className="text-gray-800 mt-1">
              Poniedziałek – Piątek 15:00 – 20:00 <br />
              Sobota – umówione wizyty              </p>
            </div>
          </div>
        </div>
      </div>
      <News />
    </>
  );
};

export default ContactPage;
