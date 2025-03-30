import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-[#008c8c] text-white px-6 md:px-28">
      <div className="mx-auto flex py-16 text-lg justify-between ">
        <div className="flx flex-col gap-10 max-w-72">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" className="size-14" />
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Centrum Medyczne
            </h2>
          </div>
          <p className="mt-2 text-base">
            Leading the Way in Medical Excellence, Trusted Care.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-xl">Important Links</h3>
          <ul className="mt-2 flex flex-col gap-3">
            <li>
              <a href="#" className="hover:underline">
                Appointment
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Doctors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                About Us
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-xl">Contact Us</h3>
          <p className=" mt-2">(237) 681-812-255</p>
          <p className="">support@centrum.com</p>
          <p className="">0123 Some place</p>
          <p className="">Some country</p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-xl">Newsletter</h3>
          <div className="mt-2 flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full p-3 text-black placeholder:text-teal-600 rounded-l-md outline-none"
            />
            <button className="bg-white text-teal-600 px-4 py-2 rounded-r-md">
              <IoSend className="text-2xl -rotate-45"/>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white h-28 flex flex-col md:flex-row justify-between items-center ">
        <p>© 2025 Centrum Medyczne. All Rights Reserved</p>
        <div className="flex space-x-4 mt-2 md:mt-0 text-sm">
          <a href="#" className="text-[#008c8c] p-2 bg-white rounded-full">
            <FaLinkedinIn />
          </a>
          <a href="#" className="text-[#008c8c] p-2 bg-white rounded-full">
            <FaFacebookF />
          </a>
          <a href="#" className="text-[#008c8c] p-2 bg-white rounded-full">
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}
