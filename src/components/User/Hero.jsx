import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";

export default function Hero() {
  return (
    <section className="bg-teal-100 relative min-h-screen items-center pt-16">
      <div className="mx-auto flex flex-col lg:flex-row items-center justify-between px-20 pt-16">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-6xl leading-snug font-bold text-gray-900">
            Find & Search Your <br />
            <span className="text-main">Favourite</span> Doctor
          </h1>
          <p className="text-gray-600 mt-4 max-w-96">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sem velit
            viverra amet faucibus.
          </p>
          <h2 className="text-2xl  mt-6 font-bold">Book an Appointment</h2>

          <div className="mt-3 bg-white flex justify-between items-center px-6 py-3 rounded-full shadow-lg max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center ">
              <FaRegCircleUser className="mt-0.5" />
              <select className="bg-transparent text-gray-700 outline-none flex-1">
                <option>Doctor's Name</option>
                <option>Dr. John Doe</option>
                <option>Dr. Jane Smith</option>
              </select>
            </div>
            <div className="flex items-center">
              <IoLocationOutline className="text-lg" />
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent placeholder:text-gray-700 outline-none text-gray-700 flex-1"
              />
            </div>
            <button className="bg-main text-white p-3 rounded-full">
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 relative mt-10 lg:mt-0 flex justify-center">
          <div class="absolute w-[840px] h-[400px] bottom-[0px] bg-[#91cece] rounded-t-full"></div>

          <img
            src="/images/heroimg.png"
            alt="Doctors"
            className="w-[600px] mx-auto lg:mx-0 relative"
          />
        </div>

        <div className="absolute top-1/2 right-0 flex rounded-l-full p-2 justify-between gap-4 items-center bg-white">
          <a href="#" className="text-teal-600">
            <FaFacebookF />
          </a>
          <a href="#" className="text-teal-600">
            <FaInstagram />
          </a>
        </div>
      </div>

      <div className="bg-main w-full text-white py-6 flex px-28 space-x-10 text-center ">
        <div>
          <h3 className="text-6xl font-bold">24/7</h3>
          <p>Online Support</p>
        </div>

        <div className="border-l border-white h-12 my-auto"></div>

        <div>
          <h3 className="text-6xl font-bold">100+</h3>
          <p>Doctors</p>
        </div>

        <div className="border-l border-white h-12 my-auto"></div>

        <div>
          <h3 className="text-6xl font-bold">1M+</h3>
          <p>Active Patients</p>
        </div>
      </div>
    </section>
  );
}
