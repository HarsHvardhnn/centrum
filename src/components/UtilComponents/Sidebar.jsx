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
import { Calendar1 } from "lucide-react";

const Sidebar = () => {
  const { user } = useUser();
  console.log("user", user);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  console.log("user", user);

  return (
    <div className="w-64 ml-6 h-[calc(100vh-64px)] bg-white shadow-md fixed left-0 top-16 flex flex-col mt-2">
      {/* Logo Section */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-teal-100">
        <div className="flex items-center">
          <img
            src="/images/logo_teal.png"
            className="size-10"
            alt="company_logo"
          />
          <div className="ml-2 flex flex-col font-semibold text-gray-800 text-lg">
            <span>Centrum</span>
            <span>Medyczne</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-2">
        <nav>
          <NavItem
            icon={<FiBarChart2 className="text-xl text-teal-400" />}
            label="Panel główny"
            to="/admin"
            isActive={currentPath === "/admin"}
            isEnabled={true}
          />

          <NavItem
            icon={<LuCalendarPlus2 className="text-xl text-teal-400" />}
            label="Wizyty lekarskie"
            to={
              user?.role == "admin" || user?.role == "receptionist"
                ? "/doctors"
                : `/doctors/appointments/${user?.d_id}`
            }
            isActive={currentPath === "/doctors"}
            isEnabled={true}
          />

          <NavItem
            icon={<BsCalendarPlusFill className="text-xl text-teal-400" />}
            label="Dodaj wizytę"
            to="/appointment/create"
            isActive={currentPath === "/appointment/create"}
            isEnabled={true}
          />

          {user?.role === "admin" && (
            <NavItem
              icon={
                <MdOutlineMedicalServices className="text-xl text-teal-400" />
              }
              label="Usługi"
              to="/admin/services"
              isActive={currentPath === "/admin/services"}
              isEnabled={true}
            />
          )}
          {(user?.role === "admin" || user?.role === "receptionist" )&& (
            <NavItem
              icon={<MdSms className="text-xl text-teal-400" />}
              label="Zarządzanie SMS"
              to="/admin/sms"
              isActive={currentPath === "/admin/sms"}
              isEnabled={true}
            />
          )}
               <NavItem
              icon={<Calendar1 className=" text-teal-400" />}
              label="Kalendarz"
              to="/admin/calendar"
              isActive={currentPath === "/admin/calendar"}
              isEnabled={true}
            />
          {user?.role === "admin" && (
            <NavItem
              icon={
                <MdOutlineMedicalServices className="text-xl text-teal-400" />
              }
              label="Aktualności"
              to="/admin/news"
              isActive={currentPath === "/admin/news"}
              isEnabled={true}
            />
          )}

          <NavItem
            icon={<FiUsers className="text-xl text-teal-400" />}
            label="Lista pacjentów"
            to="/patients"
            isActive={currentPath === "/patients"}
            isEnabled={true}
          />
          <div className="border-b border-teal-100 my-1"></div>

          <NavItem
            icon={<RiHomeLine className="text-xl text-teal-400" />}
            label="Historia wizyt"
            to="/clinic"
            isActive={currentPath === "/clinic"}
            isEnabled={true}
          />

      
            <NavItem
              icon={<LuFileChartColumn className="text-xl text-teal-400" />}
              label="Rozliczenia"
              to="/admin/billing"
              isActive={currentPath === "/admin/billing"}
              isEnabled={true}
            />
          
         {user?.role !== "doctor" && <NavItem
            icon={<FiMessageCircle className="text-xl text-teal-400" />}
            label="Kontakty"
            to="/admin/contact-messages"
            isActive={currentPath === "/admin/contact-messages"}
            isEnabled={true}
          />}

          <NavItem
            icon={<FiUser className="text-xl text-teal-400" />}
            label="Konto"
            to="/admin/profile"
            isActive={currentPath === "/admin/profile"}
            isEnabled={true}
          />

          <div className="border-t border-teal-100 my-1"></div>

    
            <NavItem
              icon={<FiSettings className="text-xl text-teal-400" />}
              label="Ustawienia"
              to={`/admin/accounts`}
              isActive={currentPath === "/admin/accounts"}
              isEnabled={true}
            />
            {
              user?.role == "doctor" &&    <NavItem
              icon={<FiSettings className="text-xl text-teal-400" />}
              label="Harmonogram"
              to={`/doctor/settings`}
              isActive={currentPath === "/doctor/settings"}
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
                navigate("/help-center");
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
