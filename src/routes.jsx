import React, { useState, useEffect } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "./assets/new_login.jpg";
import SignupImage from "./assets/Signup.png";
import ForgotPasswordScreen from "./components/Auth/ForgotPasswordScreen";

import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
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
import DoctorDetailPage from "./components/Doctor/DoctorDetailsPage";
import NotFound404 from "./components/UtilComponents/NotFound";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/UtilComponents/ProtectedRoutes";
import AddDoctorForm from "./components/Doctor/CreateDoctor";
import LabAppointments from "./components/Patients/PatientList";
import UserManagement from "./components/admin/Settings";
import ChatComponent from "./components/User/ChatComponent";
import DoctorScheduleSettings from "./components/admin/DoctorSettings";
import ProfilePage from "./components/Auth/Profile";
import MyAppointments from "./components/User/MyAppointments";
import ServicesManagement from "./components/admin/Services";

import NewsPage from "./components/User/Pages/NewsPage";
import PatientDetailsPage from "./components/Doctor/SingleDoctor/patient-details/PatientDetails";
import NewsManagement from "./components/admin/NewManagement";
import NewsDetail from "./components/User/NewsDetail";
import PatientMedicalDetails from "./components/User/MyDetails";
import { useUser } from "./context/userContext";
import UserMessaging from "./components/admin/SmsPage";
import AppointmentPage from "./components/Appointments/AppointmentPage";
import ContactPage from "./components/User/Pages/ContactPage";
import BillDetails from "./components/Billing/BillDetails";
import BillingManagement from "./components/Billing/BillingManagement";
import AdminContactMessages from "./components/Admin/AdminContactMessages";


// Root route component that clears localStorage and redirects to /user
const RootRoute = () => {
  useEffect(() => {
    // Clear all items from localStorage
    localStorage.clear();
  }, []);

  // Redirect to /user
  return <Navigate to="/user" replace />;
};

// Modified App component to include the sidebar
function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user }=useUser()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header />
      </div>

      <div className="flex bg-gray-50">
        {/* Sidebar with adjusted positioning */}
        {user?.role != "patient" && (
          <Sidebar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}

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
  // Root route - will clear localStorage and redirect to /user
  {
    path: "/",
    element: <RootRoute />
  },

  // Public routes group
  {
    element: <PublicRoute />,
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
      { path: "appointments", element: <MyAppointments /> },
      { path: "details", element: <PatientMedicalDetails /> },
      { path: "news", element: <NewsPage /> },
      { path: "blogs", element: <NewsPage isNews={false} /> },
      { path: "news/single/:id", element: <NewsDetail /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "contact", element: <ContactPage /> },


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
          { path: "/patients", element: <LabAppointments clinic={false} /> },
          { path: "/clinic", element: <LabAppointments clinic={true} /> },
          { path: "/appointment/create", element: <AppointmentPage /> },
          { path: "/patients-details/:id", element: <PatientDetailsPage /> },
          { path: "/admin", element: <MedicalDashboard /> },
          { path: "/admin/sms", element: <UserMessaging /> },
          { path: "/doctor/create", element: <AddDoctorForm /> },
          { path: "/admin/accounts", element: <UserManagement /> },
          { path: "/admin/services", element: <ServicesManagement /> },
          { path: "/admin/news", element: <NewsManagement /> },
          { path: "/doctor/settings", element: <DoctorScheduleSettings /> },
          { path: "/admin/profile", element: <ProfilePage /> },
          {
            path: "/help-center",
            element: <ChatComponent />,
          },
          
          { path: "/admin/billing", element: <BillingManagement /> },
          { path: "/admin/billing/details/:billId", element: <BillDetails /> },
          { path: "/admin/contact-messages", element: <AdminContactMessages /> },
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
