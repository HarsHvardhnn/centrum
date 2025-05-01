import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-[#008c8c] text-white px-6 md:px-8 xl:px-20">
      <div className="mx-auto flex flex-col md:flex-row md:flex-wrap py-10 md:py-16 text-lg gap-10 md:gap-8 lg:gap-0 md:justify-around items-start md:items-start">
        {/* Logo and Description */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <img src="/images/logo.png" className="w-12 h-12" alt="Logo" />
            <h2 className="text-2xl font-bold text-left">Centrum Medyczne</h2>
          </div>
          <p className="text-left text-base leading-relaxed">
            Lider w doskonałości medycznej, zaufana opieka.
          </p>
        </div>

        {/* Important Links */}
        <div className="flex flex-col items-start gap-3">
          <h3 className="font-semibold text-xl text-left">Ważne linki</h3>
          <ul className="mt-2 flex flex-col gap-2 text-left">
            <li>
              <a href="#" className="hover:underline">
                Umów wizytę
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Lekarze
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Usługi
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                O nas
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="flex flex-col items-start gap-3">
          <h3 className="font-semibold text-xl text-left">Kontakt</h3>
          <p>(+48) 797 097 487</p>
          <p>kontakt@centrum.com</p>
          <p>Powstańców Warszawy 7/15</p>
          <p>26-110 Skarżysko-Kamienna</p>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col items-start gap-4 w-full md:w-auto">
          <h3 className="font-semibold text-xl text-left">Newsletter</h3>
          <div className="flex w-full max-w-sm">
            <input
              type="email"
              placeholder="Wpisz swój email"
              className="w-full p-3 text-black placeholder:text-teal-600 rounded-l-md outline-none"
            />
            <button className="bg-white text-teal-600 px-4 py-2 rounded-r-md">
              <IoSend className="text-2xl -rotate-45" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white py-6 flex flex-col md:flex-row justify-center md:justify-between items-center text-center space-y-4 md:space-y-0">
        <p>© 2025 Centrum Medyczne. Wszelkie prawa zastrzeżone</p>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <a
            href="#"
            className="text-[#008c8c] p-2 bg-white rounded-full hover:bg-teal-100 transition"
          >
            <FaLinkedinIn />
          </a>
          <a
            href="#"
            className="text-[#008c8c] p-2 bg-white rounded-full hover:bg-teal-100 transition"
          >
            <FaFacebookF />
          </a>
          <a
            href="#"
            className="text-[#008c8c] p-2 bg-white rounded-full hover:bg-teal-100 transition"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}
