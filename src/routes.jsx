import React, { useState } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "./assets/Login.png";
import SignupImage from "./assets/Signup.png";
import ForgotPasswordScreen from "./components/Auth/ForgotPasswordScreen";

import { createBrowserRouter, Outlet } from "react-router-dom";
import Sidebar from "./components/UtilComponents/Sidebar";
import BillingPage from "./components/Doctor/Doctor";
import DoctorsPage from "./components/Doctor/SingleDoctor/DoctorPage";
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
import AddDoctorForm from "./components/Doctor/CreateDoctor";
import LabAppointments from "./components/Patients/PatientList";
import UserManagement from "./components/admin/Settings";

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
          { path: "/doctors", element: <BillingPage /> },
          { path: "/doctors/appointments/:id", element: <DoctorsPage /> },
          { path: "/doctor-details/:id", element: <DoctorDetailPage /> },
          { path: "/patients", element: <LabAppointments /> },
          { path: "/patients-details", element: <PatientDetailsPage /> },
          { path: "/", element: <MedicalDashboard /> },
          { path: "/doctor/create", element: <AddDoctorForm /> },
          { path: "/admin/accounts", element: <UserManagement /> },
        ],
      },
    ],
  },

  // Receptionist & Admin protected routes
  // {
  //   element: <ProtectedRoute allowedRoles={["receptionist", "admin"]} />,
  //   children: [
  //     {
  //       element: <MainLayout />,
  //       children: [
  //         // { path: "/patients", element: <LabAppointments /> },
  //         { path: "/appointment/create", element: <FormCompTest /> },
  //       ],
  //     },
  //   ],
  // },

  // Catch all route
  {
    path: "*",
    element: <NotFound404 />,
  },
]);

export default routes;
