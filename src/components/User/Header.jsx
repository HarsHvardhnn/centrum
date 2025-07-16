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
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import ProtectedImage from "../UtilComponents/ProtectedImage";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
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

  // Custom navigation handler for aktualnosci and poradnik
  const handleSpecialNavigation = (targetPath) => {
    const currentPath = location.pathname;
    
    // Check if navigating between aktualnosci and poradnik
    if ((currentPath === "/aktualnosci" && targetPath === "/poradnik") ||
        (currentPath === "/poradnik" && targetPath === "/aktualnosci")) {
      // Reload the page for this specific case
      window.location.href = targetPath;
    } else {
      // Use normal navigation for other cases
      navigate(targetPath);
    }
  };

  // Helper function to check if a link is active
  const isActive = (path) => {
    // For home page
    if (path === "/user" && location.pathname === "/user") {
      return true;
    }
    // For other pages, check if the location pathname starts with the path
    return path !== "/user" && location.pathname.startsWith(path);
  };

  // Active link style
  const activeLinkClass = "text-teal-500 font-bold border-b-2 border-teal-500";
  // Default link style
  const defaultLinkClass =
    "text-teal-900 hover:text-teal-600 transition-colors";

  return (
    <header className="bg-white fixed top-0 right-0 left-0 z-50 shadow-md">
      <div className="hidden md:flex w-full justify-between items-start px-12 lg:px-12 py-2 gap-4 lg:gap-8 text-teal-700 text-xs lg:text-sm bg-gray-50 border-b border-gray-200">
        <div className="flex items-center w-full md:w-4/5 lg:w-3/4 gap-4 md:gap-8 flex-col md:flex-row">
          <a
            href="mailto:kontakt@centrummedyczne7.pl"
            className="flex items-center gap-4 text-left cursor-pointer hover:text-blue-600"
          >
            <FaEnvelope className="text-base mt-1" />
            <span className="text-gray-800 mt-1 hover:text-blue-600">
              kontakt@centrummedyczne7.pl
            </span>
          </a>

          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-base mt-1 hidden md:block" />
              <div className="flex flex-col md:flex-row md:gap-4">
                <a href="tel:+48797097487" className="text-gray-800 hover:text-blue-600 flex items-center gap-2">
                  <FaPhoneAlt className="text-base mt-1 md:hidden" />
                  797 097 487
                </a>
                <a href="tel:+48797127487" className="text-gray-800 hover:text-blue-600 flex items-center gap-2">
                  <FaPhoneAlt className="text-base mt-1 md:hidden" />
                  797 127 487
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className=" flex items-center gap-2">
          <a
            href="https://www.facebook.com/share/16Sb5NkqZt/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-800 transition-colors"
          >
            <FaFacebookF className="text-xl" />
          </a>
          <a
            href="https://www.instagram.com/centrummedyczne7?igsh=MTE1N2JoemM0ZG94YQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-800 transition-colors"
          >
            <FaInstagram className="text-xl" />
          </a>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 md:px-8 py-3 bg-[#F4F4F4]">
      <img src="/images/mainlogo.png" alt="Logo strony" className="h-10 cursor-pointer" onClick={()=>window.location.reload()} />

        <nav className="hidden lg:flex gap-4 lg:gap-6 font-medium text-sm">
          <Link
            to="/user"
            className={`py-2 ${
              isActive("/user") && location.pathname === "/user"
                ? activeLinkClass
                : defaultLinkClass
            }`}
          >
            Strona główna
          </Link>
          <Link
            to="/o-nas"
            className={`py-2 ${
              isActive("/o-nas") ? activeLinkClass : defaultLinkClass
            }`}
          >
            O nas
          </Link>
          <Link
            to="/uslugi"
            className={`py-2 ${
              isActive("/uslugi") ? activeLinkClass : defaultLinkClass
            }`}
          >
            Usługi
          </Link>
          <Link
            to="/lekarze"
            className={`py-2 ${
              isActive("/lekarze") ? activeLinkClass : defaultLinkClass
            }`}
          >
            Specjaliści
          </Link>
          <button
            onClick={() => handleSpecialNavigation("/aktualnosci")}
            className={`py-2 ${
              isActive("/aktualnosci") ? activeLinkClass : defaultLinkClass
            }`}
          >
            Aktualności
          </button>
          <button
            onClick={() => handleSpecialNavigation("/poradnik")}
            className={`py-2 ${
              isActive("/poradnik") ? activeLinkClass : defaultLinkClass
            }`}
          >
            Wiedza Medyczna
          </button>
          <Link
            to="/kontakt"
            className={`py-2 ${
              isActive("/kontakt") ? activeLinkClass : defaultLinkClass
            }`}
          >
            Kontakt
          </Link>
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

          <nav className="flex flex-col items-center mt-16 gap-6 font-medium text-lg">
            <Link
              to="/user"
              className={
                isActive("/user") && location.pathname === "/user"
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
              onClick={() => setMenuOpen(false)}
            >
              Strona główna
            </Link>
          
            <Link
              to="/o-nas"
              className={
                isActive("/o-nas")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
              onClick={() => setMenuOpen(false)}
            >
              O nas
            </Link>
            <Link
              to="/uslugi"
              className={
                isActive("/uslugi")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
              onClick={() => setMenuOpen(false)}
            >
              Usługi
            </Link>
            <Link
              to="/lekarze"
              className={
                isActive("/lekarze")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
              onClick={() => setMenuOpen(false)}
            >
              Specjaliści
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSpecialNavigation("/aktualnosci");
              }}
              className={
                isActive("/aktualnosci")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
            >
              Aktualności
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSpecialNavigation("/poradnik");
              }}
              className={
                isActive("/poradnik")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
            >
              Wiedza Medyczna
            </button>
            <Link
              to="/kontakt"
              className={
                isActive("/kontakt")
                  ? "text-teal-500 font-bold"
                  : "text-teal-900"
              }
              onClick={() => setMenuOpen(false)}
            >
              Kontakt
            </Link>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-base mt-1" />
                <a href="tel:+48797097487" className="text-gray-800 hover:text-blue-600">
                  797 097 487
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-base mt-1" />
                <a href="tel:+48797127487" className="text-gray-800 hover:text-blue-600">
                  797 127 487
                </a>
              </div>
            </div>
          </nav>

          <div className="flex flex-col items-center gap-3 mt-6">
            {user && user.role === "patient" ? (
              <>
                <Link
                  to="/user/appointments"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full ${
                    isActive("/user/appointments") ? "bg-teal-600" : ""
                  }`}
                >
                  <FaCalendarCheck />
                  Moje wizyty
                </Link>
                <Link
                  to="/user/details"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full ${
                    isActive("/user/details") ? "bg-teal-600" : ""
                  }`}
                >
                  <FaIdCard />
                  Dokumentacja medyczna                </Link>
                <Link
                  to="/user/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full ${
                    isActive("/user/profile") ? "bg-teal-600" : ""
                  }`}
                >
                  <FaUser />
                  Mój profil
                </Link>
                <Link
                  to="/security/2fa"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 bg-teal-800 text-white w-48 py-2 text-sm rounded-full ${
                    isActive("/security/2fa") ? "bg-teal-600" : ""
                  }`}
                >
                  <FaCog />
                  Bezpieczeństwo 2FA
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
                {/* <button
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
                </button> */}
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
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg py-1 z-50">
                  
                  <Link
                    to="/user/appointments"
                    className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                      isActive("/user/appointments")
                        ? "text-teal-500 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCalendarCheck className="text-teal-800" />
                    Moje wizyty
                  </Link>
                  <Link
                    to="/user/details"
                    className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                      isActive("/user/details")
                        ? "text-teal-500 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                      <FaIdCard className="text-teal-800" />
                        Dokumentacja medyczna
                  </Link>
                  <Link
                    to="/user/profile"
                    className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                      isActive("/user/profile")
                        ? "text-teal-500 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="text-teal-800" />
                    Ustawienia
                  </Link>
                  <Link
                    to="/security/2fa"
                    className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                      isActive("/security/2fa")
                        ? "text-teal-500 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="text-teal-800" />
                    Bezpieczeństwo 2FA
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
              {/* <Link
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
              </Link> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
