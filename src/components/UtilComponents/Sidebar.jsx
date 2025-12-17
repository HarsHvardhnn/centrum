import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { MdOutlineMedicalServices, MdSms } from "react-icons/md";
import { RiHomeLine } from "react-icons/ri";
import { LuFileChartColumn, LuCalendarPlus2 } from "react-icons/lu";
import { CgLogOut } from "react-icons/cg";
import {
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiUser,
  FiMessageCircle,
} from "react-icons/fi";
import { BsCalendarPlusFill } from "react-icons/bs";
import { useUser } from "../../context/userContext";
import { Calendar1, Shield, BarChart3, Settings } from "lucide-react";

const Sidebar = () => {
  const { user } = useUser();
  //("user", user);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/logowanie";
  };
  //("user", user);

  return (
    <div className="w-64 ml-6 h-[calc(100vh-64px)] bg-white shadow-md fixed left-0 top-16 flex flex-col mt-2">
      {/* Logo Section */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-teal-100">
        <div className="flex items-center">
          <img
            src="https://res.cloudinary.com/dca740eqo/image/upload/v1757666023/hospital_app/images/a8qfdccxpi0aipcavki2.png"
            className="size-32"
            alt="company_logo"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-2">
        <nav>
          <NavItem
            icon={<FiBarChart2 className="text-xl text-teal-400" />}
            label="Panel główny"
            to="/administracja"
            isActive={currentPath === "/administracja"}
            isEnabled={true}
          />

          <NavItem
            icon={<LuCalendarPlus2 className="text-xl text-teal-400" />}
            label="Wizyty lekarskie"
            to={
              user?.role == "admin" || user?.role == "receptionist"
                ? "/lekarze"
                : `/lekarze/wizyty/${user?.d_id}`
            }
            isActive={currentPath === "/lekarze"}
            isEnabled={true}
          />

          <NavItem
            icon={<BsCalendarPlusFill className="text-xl text-teal-400" />}
            label="Dodaj wizytę"
            to="/wizyta/utworz"
            isActive={currentPath === "/wizyta/utworz"}
            isEnabled={true}
          />

          {user?.role === "admin" && (
            <NavItem
              icon={
                <MdOutlineMedicalServices className="text-xl text-teal-400" />
              }
              label="Usługi"
              to="/administracja/uslugi"
              isActive={currentPath === "/administracja/uslugi"}
              isEnabled={true}
            />
          )}
          {(user?.role === "admin" || user?.role === "receptionist" )&& (
            <NavItem
              icon={<MdSms className="text-xl text-teal-400" />}
              label="Zarządzanie SMS"
              to="/administracja/sms"
              isActive={currentPath === "/administracja/sms"}
              isEnabled={true}
            />
          )}
               <NavItem
              icon={<Calendar1 className=" text-teal-400" />}
              label="Kalendarz"
              to="/administracja/kalendarz"
              isActive={currentPath === "/administracja/kalendarz"}
              isEnabled={true}
            />
          {user?.role === "admin" && (
            <NavItem
              icon={
                <MdOutlineMedicalServices className="text-xl text-teal-400" />
              }
              label="Aktualności"
              to="/administracja/aktualnosci"
              isActive={currentPath === "/administracja/aktualnosci"}
              isEnabled={true}
            />
          )}

          <NavItem
            icon={<FiUsers className="text-xl text-teal-400" />}
            label="Lista pacjentów"
            to="/pacjenci"
            isActive={currentPath === "/pacjenci"}
            isEnabled={true}
          />
          <div className="border-b border-teal-100 my-1"></div>

          <NavItem
            icon={<RiHomeLine className="text-xl text-teal-400" />}
            label="Historia wizyt"
            to="/klinika"
            isActive={currentPath === "/klinika"}
            isEnabled={true}
          />

      
            <NavItem
              icon={<LuFileChartColumn className="text-xl text-teal-400" />}
              label="Rozliczenia"
              to="/administracja/rozliczenia"
              isActive={currentPath === "/administracja/rozliczenia"}
              isEnabled={true}
            />

            <NavItem
              icon={<BarChart3 className="text-xl text-teal-400" />}
              label="Raporty"
              to="/administracja/dane"
              isActive={currentPath === "/administracja/dane"}
              isEnabled={true}
            />
          
         {user?.role !== "doctor" && <NavItem
            icon={<FiMessageCircle className="text-xl text-teal-400" />}
            label="Kontakty"
            to="/administracja/wiadomosci-kontaktowe"
            isActive={currentPath === "/administracja/wiadomosci-kontaktowe"}
            isEnabled={true}
          />}

          <NavItem
            icon={<FiUser className="text-xl text-teal-400" />}
            label="Konto"
            to="/administracja/profil"
            isActive={currentPath === "/administracja/profil"}
            isEnabled={true}
          />

          <NavItem
            icon={<Shield className="text-xl text-teal-400" />}
            label="Uwierzytelnianie 2FA"
            to="/administracja/bezpieczenstwo/2fa"
            isActive={currentPath === "/administracja/bezpieczenstwo/2fa"}
            isEnabled={true}
          />

          <div className="border-t border-teal-100 my-1"></div>

          {user?.role === "admin" && (
            <>
              <NavItem
                icon={<Shield className="text-xl text-teal-400" />}
                label="Kontrola dostępu IP"
                to="/administracja/konfiguracja-ip"
                isActive={currentPath === "/administracja/konfiguracja-ip"}
                isEnabled={true}
              />
              <NavItem
                icon={<Settings className="text-xl text-teal-400" />}
                label="Konfiguracja wizyt"
                to="/administracja/konfiguracja-wizyt"
                isActive={currentPath === "/administracja/konfiguracja-wizyt"}
                isEnabled={true}
              />
              <NavItem
                icon={<Shield className="text-xl text-teal-400" />}
                label="Ustawienia JWT"
                to="/administracja/ustawienia-jwt"
                isActive={currentPath === "/administracja/ustawienia-jwt"}
                isEnabled={true}
              />
            </>
          )}

            <NavItem
              icon={<Settings className="text-xl text-teal-400" />}
              label="Ustawienia"
              to={`/administracja/konta`}
              isActive={currentPath === "/administracja/konta"}
              isEnabled={true}
            />
            {
              user?.role == "doctor" &&    <NavItem
              icon={<FiSettings className="text-xl text-teal-400" />}
              label="Harmonogram"
              to={`/lekarz/ustawienia`}
              isActive={currentPath === "/lekarz/ustawienia"}
              isEnabled={true}
            />
    
            }
    

       {user?.role === "doctor" && <a
            href="https://www.zus.pl/ezus/logowanie?logout-manually=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <span className="mr-3 text-teal-400 text-xl rotate-180">
              <CgLogOut />
            </span>
            <span className="text-sm">e-ZLA</span>
          </a>}

          <NavItem
            icon={<CgLogOut className="text-xl text-teal-400 rotate-180" />}
            label="Wyloguj"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            isActive={currentPath === "/logout"}
            isEnabled={true}
          />
        </nav>
      </div>

      {/* Help Center Section */}
      {user?.role !== "admin" && (
        <div className="px-4 pb-6 pt-4 ">
          <div className="bg-[#e6f4f4] rounded-lg p-4 pt-10 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 rounded-full bg-[#d9eeee] flex items-center justify-center shadow-xl">
                <div className="w-8 h-8 rounded-full bg-[#bbe8e8] flex items-center justify-center ">
                  <FiHelpCircle className="h-5 w-5 text-teal-500" />
                </div>
              </div>
            </div>
            <h3 className="text-center font-medium mb-1">Centrum pomocy</h3>
            <p className="text-center text-gray-700 text-xs mb-3">
            W razie pytań lub problemów, rozpocznij rozmowę na czacie klikając poniższy przycisk
            </p>
            <button
              onClick={() => {
                navigate("/centrum-pomocy");
              }}
              className="w-full bg-teal-400 hover:bg-teal-600 text-white py-3 px-4 rounded-md font-medium"
            >
              Przejdź do centrum pomocy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, to, isActive, isEnabled, onClick }) => {
  // Determine the right element type based on if link is enabled
  const Component = isEnabled ? Link : "div";

  // Only pass 'to' prop if it's enabled
  const linkProps = isEnabled ? { to, onClick } : {};

  // Styling based on active state and enabled state
  const styles = `flex items-center px-3 py-1.5 rounded-md ${
    isActive
      ? "bg-gradient-to-r from-[#bcc1f66B] to-[#e9eafc6B] text-teal-500 font-semibold"
      : `text-gray-500 ${
          isEnabled
            ? "hover:bg-gray-50 hover:text-gray-700"
            : " cursor-not-allowed"
        }`
  }`;

  return (
    <Component {...linkProps} className={styles}>
      <span className={`mr-3 ${isActive ? "text-teal-500" : "text-gray-400"}`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {/* {label === "Rozliczenia" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-auto text-gray-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )} */}
    </Component>
  );
};
export default Sidebar;
