import React from "react";
import { FaPhoneAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white absolute top-0 right-0 left-0 z-50 ">
      <div className="flex justify-end items-center px-8 py-2 gap-12 text-teal-700 text-sm">
        <div className="flex items-start gap-2">
          <FaPhoneAlt className="text-lg" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Emergency</span>
            <span className="text-gray-800">(+48) 797 097 487</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaClock className="text-lg" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Work Hour</span>
            <span className="text-gray-800">
              15:00-20:00 Poniedziałek-Piątek
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-lg" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Location</span>
            <span className="text-gray-800">
              Powstańców Warszawy 7/15, <br /> 26-110 Skarżysko-Kamienna
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-8 py-3 bg-teal-100">
        <img src="/images/mainlogo.png" alt="website logo" className="h-10" />

        <nav className="flex gap-6 text-teal-900 font-medium text-sm">
          <Link to="/" className="text-teal-800 font-bold">
            Home
          </Link>
          <Link to="/user/about">About Us</Link>
          <Link to="/user/services">Services</Link>
          <Link to="/user/doctors">Doctors</Link>
          <Link to="/news">News</Link>
          <Link to="/blogs">Blogs</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="flex gap-3">
          <button className="bg-teal-800 text-white w-24 py-2 text-sm rounded-full">
            Log in
          </button>
          <button className="border border-teal-700 text-teal-700 w-24 py-2 text-sm rounded-full">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
