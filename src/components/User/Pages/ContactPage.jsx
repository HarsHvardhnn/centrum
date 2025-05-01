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
        bgurl="/images/about-header.jpg"
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
              <p className="text-base">(237) 681-812-255</p>
              <p className="text-base">(237) 666-331-894</p>
            </div>

            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaMapMarkerAlt className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">LOKALIZACJA</h4>
              <p className="text-base">0123 Some place</p>
              <p className="text-base">9876 Some country</p>
            </div>
          </div>
          <div className="flex flex-1 max-md:flex-col gap-4">
            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaEnvelope className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">EMAIL</h4>
              <p className="text-base">fildineeesoe@gmail.com</p>
              <p className="text-base">myebstudios@gmail.com</p>
            </div>

            <div className="flex-1 bg-main-light hover:bg-main hover:text-white p-8 rounded-lg text-center flex flex-col items-center transition duration-300">
              <FaClock className="text-4xl mb-3" />
              <h4 className="font-bold text-lg">GODZINY PRACY</h4>
              <p className="text-base">Pon-Sob 09:00-20:00</p>
              <p className="text-base">Niedziela tylko nagłe przypadki</p>
            </div>
          </div>
        </div>
      </div>
      <News />
    </>
  );
};

export default ContactPage;
