import React, { useState, useEffect } from "react";
import {
  FaPhoneAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // Check if user is logged in and has the correct role
  useEffect(() => {
    if (user && user.role !== "patient") {
      // Clear localStorage and redirect to login if user role is not patient
      localStorage.clear();
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    // Clear user data from context and localStorage
    logout();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-white fixed top-0 right-0 left-0 z-50 shadow-md">
      <div className="hidden md:flex justify-end items-center px-6 lg:px-8 py-2 gap-6 lg:gap-12 text-teal-700 text-xs lg:text-sm">
        <div className="flex items-start gap-2">
          <FaPhoneAlt className="text-base" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Emergency</span>
            <span className="text-gray-800">(+48) 797 097 487</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaClock className="text-base" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Work Hour</span>
            <span className="text-gray-800">
              15:00-20:00 Poniedziałek-Piątek
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-base" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Location</span>
            <span className="text-gray-800">
              Powstańców Warszawy 7/15, <br className="hidden lg:block" />{" "}
              26-110 Skarżysko-Kamienna
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 md:px-8 py-3 bg-[#DEE2CF]">
        <img src="/images/mainlogo.png" alt="website logo" className="h-10" />

        <nav className="hidden lg:flex gap-4 lg:gap-6 text-teal-900 font-medium text-sm">
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

        <button
          className="lg:hidden text-teal-800 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div
          className={`fixed top-0 right-0 w-3/4 h-full bg-white shadow-lg transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 lg:hidden z-50`}
        >
          <button
            className="absolute top-5 right-5 text-2xl text-teal-800"
            onClick={() => setMenuOpen(false)}
          >
            <FaTimes />
          </button>

          <nav className="flex flex-col items-center mt-16 gap-6 text-teal-900 font-medium text-lg">
            <Link
              to="/"
              className="text-teal-800 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link to="/user/about" onClick={() => setMenuOpen(false)}>
              About Us
            </Link>
            <Link to="/user/services" onClick={() => setMenuOpen(false)}>
              Services
            </Link>
            <Link to="/user/doctors" onClick={() => setMenuOpen(false)}>
              Doctors
            </Link>
            <Link to="/news" onClick={() => setMenuOpen(false)}>
              News
            </Link>
            <Link to="/blogs" onClick={() => setMenuOpen(false)}>
              Blogs
            </Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </nav>

          <div className="flex flex-col items-center gap-3 mt-6">
            {user && user.role === "patient" ? (
              // Show My Appointments and Logout for logged-in patients
              <>
                <Link
                  to="/user/appointments"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full"
                >
                  <FaCalendarCheck />
                  My Appointments
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 border border-teal-700 text-teal-700 w-48 py-2 text-sm rounded-full"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              // Show Login and Signup for non-logged in users
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="bg-teal-800 text-white w-32 py-2 text-sm rounded-full"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/signup");
                  }}
                  className="border border-teal-700 text-teal-700 w-32 py-2 text-sm rounded-full"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex gap-3">
          {user && user.role === "patient" ? (
            // Show My Appointments and Logout for logged-in patients
            <>
              <Link
                to="/user/appointments"
                className="flex items-center justify-center gap-2 bg-teal-800 text-white w-40 py-2 text-sm rounded-full"
              >
                <FaCalendarCheck />
                My Appointments
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 border border-teal-700 text-teal-700 w-28 py-2 text-sm rounded-full"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            // Show Login and Signup for non-logged in users
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-teal-800 text-white w-24 py-2 text-sm rounded-full"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="border border-teal-700 text-teal-700 w-24 py-2 text-sm rounded-full"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
