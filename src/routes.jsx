import React, { useState } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "./assets/Login.png";
import SignupImage from "./assets/Signup.png";
import ForgotPasswordScreen from "./components/Auth/ForgotPasswordScreen";

import { createBrowserRouter, Outlet } from "react-router-dom";
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
import MedicalDashboard from "./components/Dashboard";
import Header from "./components/UtilComponents/Header";
import PatientDetailsPage from "./components/Doctor/SingleDoctor/PatientDetailsPage";
import DoctorDetailPage from "./components/Doctor/DoctorDetailsPage";
import NotFound404 from "./components/UtilComponents/NotFound";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/UtilComponents/ProtectedRoutes";

// Modified App component to include the sidebar
function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const user = {
    name: "Abu Fahim",
    email: "hello@fahim.com",
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header user={user} />
      </div>

      <div className="flex bg-gray-50">
        {/* Sidebar with adjusted positioning */}
        <Sidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main content with proper spacing */}
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-20"
          } flex-1 min-h-screen pt-16 ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const routes = createBrowserRouter([
  // Public routes group
  {
    element: <PublicRoute redirectAuthenticatedTo="/" />,
    children: [
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
    ],
  },

  // Public user site routes
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "about", element: <AboutUsPage /> },
      { path: "doctors", element: <OurDoctorsPage /> },
      { path: "services", element: <OurServicesPage /> },
      { path: "services/:service", element: <ServicesDetailPage /> },
      { path: "*", element: <NotFound404 /> },
    ],
  },

  // Doctor & Admin protected routes
  {
    element: <ProtectedRoute allowedRoles={["doctor", "admin"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <BillingPage /> },
          { path: "/doctors/appointments", element: <DoctorsPage /> },
          { path: "/doctor-details", element: <DoctorDetailPage /> },
          { path: "/patients", element: <PatientsList /> },
          { path: "/patients-details", element: <PatientDetailsPage /> },
          { path: "/dashboard", element: <MedicalDashboard /> },
        ],
      },
    ],
  },

  // Receptionist & Admin protected routes
  {
    element: <ProtectedRoute allowedRoles={["receptionist", "admin"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/steps", element: <AddAppointmentModal /> },
          { path: "/appointment/create", element: <FormCompTest /> },
        ],
      },
    ],
  },

  // Catch all route
  {
    path: "*",
    element: <NotFound404 />,
  },
]);

export default routes;
