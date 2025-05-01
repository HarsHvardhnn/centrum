import React, { useState, useEffect, useRef } from "react";
import {
  FaPhoneAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarCheck,
  FaUser,
  FaIdCard,
  FaChevronDown,
  FaChevronUp,
  FaCog,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Check if user is logged in and has the correct role
  useEffect(() => {
    if (user && user.role !== "patient") {
      // Clear localStorage and redirect to login if user role is not patient
      localStorage.clear();
      navigate("/login");
    }
  }, [user, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <span className="font-semibold uppercase">Nagłe przypadki</span>
            <span className="text-gray-800">(+48) 797 097 487</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaClock className="text-base" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Godziny pracy</span>
            <span className="text-gray-800">
              15:00-20:00 Poniedziałek-Piątek
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-base" />
          <div className="flex flex-col text-left">
            <span className="font-semibold uppercase">Lokalizacja</span>
            <span className="text-gray-800">
              Powstańców Warszawy 7/15, <br className="hidden lg:block" />{" "}
              26-110 Skarżysko-Kamienna
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 md:px-8 py-3 bg-[#F4F4F4]">
        <img src="/images/mainlogo.png" alt="Logo strony" className="h-10" />

        <nav className="hidden lg:flex gap-4 lg:gap-6 text-teal-900 font-medium text-sm">
          <Link to="/user" className="text-teal-800 font-bold">
            Strona główna
          </Link>
          <Link to="/user/about">O nas</Link>
          <Link to="/user/services">Usługi</Link>
          <Link to="/user/doctors">Lekarze</Link>
          <Link to="/user/news">Aktualności</Link>
          <Link to="/user/blogs">Blog</Link>
          {/* <Link to="/contact">Kontakt</Link> */}
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
              to="/user"
              className="text-teal-800 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              Strona główna
            </Link>
            <Link to="/user/about" onClick={() => setMenuOpen(false)}>
              O nas
            </Link>
            <Link to="/user/services" onClick={() => setMenuOpen(false)}>
              Usługi
            </Link>
            <Link to="/user/doctors" onClick={() => setMenuOpen(false)}>
              Lekarze
            </Link>
            <Link to="/user/news" onClick={() => setMenuOpen(false)}>
              Aktualności
            </Link>
            <Link to="/user/blogs" onClick={() => setMenuOpen(false)}>
              Blog
            </Link>
            {/* <Link to="/contact" onClick={() => setMenuOpen(false)}>
              Kontakt
            </Link> */}
          </nav>

          <div className="flex flex-col items-center gap-3 mt-6">
            {user && user.role === "patient" ? (
              <>
                <Link
                  to="/user/appointments"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full"
                >
                  <FaCalendarCheck />
                  Moje wizyty
                </Link>
                <Link
                  to="/user/details"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full"
                >
                  <FaIdCard />
                  Moje recepty
                </Link>
                <Link
                  to="/user/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full"
                >
                  <FaUser />
                  Mój profil
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 border border-teal-700 text-teal-700 w-48 py-2 text-sm rounded-full"
                >
                  <FaSignOutAlt />
                  Wyloguj
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="bg-teal-800 text-white w-32 py-2 text-sm rounded-full"
                >
                  Zaloguj się
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/register");
                  }}
                  className="border border-teal-700 text-teal-700 w-32 py-2 text-sm rounded-full"
                >
                  Zarejestruj się
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {user && user.role === "patient" ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-800"
              >
                <FaUser className="text-teal-800" />
                {user.name}
                {dropdownOpen ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/user/appointments"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCalendarCheck className="text-teal-800" />
                    Moje wizyty
                  </Link>
                  <Link
                    to="/user/details"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaIdCard className="text-teal-800" />
                    Moje recepty
                  </Link>
                  <Link
                    to="/user/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="text-teal-800" />
                    Ustawienia
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <FaSignOutAlt className="text-teal-800" />
                    Wyloguj
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-teal-800 text-white px-6 py-2 text-sm rounded-full"
              >
                Zaloguj się
              </Link>
              <Link
                to="/register"
                className="border border-teal-700 text-teal-700 px-6 py-2 text-sm rounded-full"
              >
                Zarejestruj się
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
