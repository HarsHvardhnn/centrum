import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { RiHomeLine } from "react-icons/ri";
import { LuFileChartColumn, LuCalendarPlus2 } from "react-icons/lu";
import { CgLogOut } from "react-icons/cg";
import {
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiUser,
} from "react-icons/fi";
import { useUser } from "../../context/userContext";

const Sidebar = () => {
  const { user } = useUser()
  const navigate= useNavigate()
  const location = useLocation();
  const currentPath = location.pathname;
  const handleLogout =  () => {
    localStorage.clear();
    window.location.href="/login"
    
  }


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
            label="Dashboard"
            to="/"
            isActive={currentPath === "/"}
            isEnabled={true}
          />

          <NavItem
            icon={<LuCalendarPlus2 className="text-xl text-teal-400" />}
            label="Doctor Appointment"
            to={
              user?.role == "admin" || user?.role == "receptionist"
                ? "/doctors"
                : `/doctors/appointments/${user?.d_id}`
            }
            isActive={currentPath === "/doctors"}
            isEnabled={true}
          />

          <NavItem
            icon={<FiUsers className="text-xl text-teal-400" />}
            label="Patients List"
            to="/patients"
            isActive={currentPath === "/patients"}
            isEnabled={true}
          />
          <div className="border-b border-teal-100 my-1"></div>

          <NavItem
            icon={<RiHomeLine className="text-xl text-teal-400" />}
            label="Clinic IP"
            to="/clinic"
            isActive={currentPath === "/clinic"}
            isEnabled={false}
          />

          <NavItem
            icon={<LuFileChartColumn className="text-xl text-teal-400" />}
            label="Billing"
            to="/billing"
            isActive={currentPath === "/billing"}
            isEnabled={false}
          />

          <NavItem
            icon={<FiUser className="text-xl text-teal-400" />}
            label="Account"
            to="/admin/accounts"
            isActive={currentPath === "/admin/accounts"}
            isEnabled={true}
          />

          <div className="border-t border-teal-100 my-1"></div>

          <NavItem
            icon={<FiSettings className="text-xl text-teal-400" />}
            label="Settings"
            to={`${user?.role == "doctor" ? "/doctor/settings" : "settings"}`}
            isActive={currentPath === "/doctor/settings"}
            isEnabled={user?.role == "doctor"}
          />

          <NavItem
            icon={<CgLogOut className="text-xl text-teal-400 rotate-180" />}
            label="Log Out"
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
      <div className="px-4 pb-6 pt-4 ">
        <div className="bg-[#e6f4f4] rounded-lg p-4 pt-10 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 rounded-full bg-[#d9eeee] flex items-center justify-center shadow-xl">
              <div className="w-8 h-8 rounded-full bg-[#bbe8e8] flex items-center justify-center ">
                <FiHelpCircle className="h-5 w-5 text-teal-500" />
              </div>
            </div>
          </div>
          <h3 className="text-center font-medium mb-1">Help center</h3>
          <p className="text-center text-gray-700 text-xs mb-3">
            Etiam porta sem malesuada magna mollis euismod.
          </p>
          <button
            onClick={() => {
              navigate("/help-center");
            }}
            className="w-full bg-teal-400 hover:bg-teal-600 text-white py-3 px-4 rounded-md font-medium"
          >
            Go to help center
          </button>
        </div>
      </div>
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
      {label === "Billing" && (
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
      )}
    </Component>
  );
};
export default Sidebar;
