import React, { useState } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "./assets/Login.png";
import SignupImage from "./assets/Signup.png";
import ForgotPasswordScreen from "./components/Auth/ForgotPasswordScreen";

import { Outlet } from "react-router-dom";
import Sidebar from "./components/UtilComponents/Sidebar";
import BillingPage from "./components/Doctor/Doctor";
import StatsDashboard from "./components/Doctor/SingleDoctor/StatsDashboard";
import PatientsList from "./components/Doctor/SingleDoctor/PatientsList";
import DoctorsPage from "./components/Doctor/SingleDoctor/DoctorPage";
import AddAppointmentModal from "./components/Doctor/Appointments/Step1";
import FormCompTest from "./Comp";
import UserLayout from "./UserLayout";
import HomePage from "./components/User/Pages/HomePage";
import AboutUsPage from "./components/User/Pages/AboutUsPage";
import OurDoctorsPage from "./components/User/Pages/OurDoctorsPage";
import OurServicesPage from "./components/User/Pages/OurServicesPage";
import ServicesDetailPage from "./components/User/Pages/ServicesDetailPage";

// Modified App component to include the sidebar
function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex bg-gray-50">
        <Sidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-20"
          } flex-1 min-h-screen ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // {
      //   path: "/",
      //   element: <App />
      // },
      {
        path: "/",
        element: <BillingPage />,
      },
      {
        path: "/doctors/appointments",
        element: <DoctorsPage />,
      },
      // {
      //   path: "/stats",
      //   element: <StatsDashboard />,
      // },

      {
        path: "/patients",
        element: <PatientsList />,
      },
      {
        path: "/steps",
        element: <AddAppointmentModal />,
      },
      {
        path: "/appointment/create",
        element: <FormCompTest />,
      },
    ],
  },
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutUsPage />,
      },
      {
        path: "doctors",
        element: <OurDoctorsPage />,
      },
      {
        path: "services",
        element: <OurServicesPage />,
      },
      {
        path: "services/:service",
        element: <ServicesDetailPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginScreen screenImg={LoginImage} isLogin={true} />,
  },
  {
    path: "/signup",
    element: <LoginScreen screenImg={SignupImage} isLogin={false} />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordScreen />,
  },
];

export default routes;
