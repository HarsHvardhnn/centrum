import React, { useState, useEffect } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "./assets/new_login.jpg";
import SignupImage from "./assets/Signup.png";
import ForgotPasswordScreen from "./components/Auth/ForgotPasswordScreen";
import DoctorCalendar from "./components/admin/DoctorCalendar";

import { createBrowserRouter, Outlet, Navigate, useLocation } from "react-router-dom";
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
import Adminmsgs from "./components/admin/Contact";

// Protected image route component
const ProtectedImage = () => {
  const location = useLocation();
  const imagePath = location.pathname.replace('/protected-image/', '');
  
  // Here you would typically verify the user's session/token
  // and serve the image from a protected directory
  
  return (
    <img 
      src={`/api/images/${imagePath}`} 
      alt="Protected content"
      style={{ pointerEvents: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    />
  );
};

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
  // Root route - will show the same content as /user
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "o-nas", element: <AboutUsPage /> },
      { path: "lekarze", element: <OurDoctorsPage /> },
      { path: "uslugi", element: <OurServicesPage /> },
      { path: "aktualnosci", element: <NewsPage /> },
      { path: "poradnik", element: <NewsPage isNews={false} /> },
      { path: "kontakt", element: <ContactPage /> },
      { path: "uslugi/:service", element: <ServicesDetailPage /> },
      { path: "appointments", element: <MyAppointments /> },
      { path: "details", element: <PatientMedicalDetails /> },
      { path: "aktualnosci/:slug", element: <NewsDetail /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "*", element: <NotFound404 /> },
    ],
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
    path: "/user/*",
    element: <Navigate to={location => location.pathname.replace('/user', '')} replace />,
  },
  {
    path: "/user",
    element: <Navigate to="/" replace />,
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
          { path: "/admin/calendar", element: <DoctorCalendar /> },
          {
            path: "/help-center",
            element: <ChatComponent />,
          },
          
          { path: "/admin/billing", element: <BillingManagement /> },
          { path: "/admin/billing/details/:billId", element: <BillDetails /> },
          { path: "/admin/contact-messages", element: <Adminmsgs /> },
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

  // Protected image route
  {
    path: "/protected-image/*",
    element: <ProtectedImage />
  },

  // Catch all route
  {
    path: "*",
    element: <NotFound404 />,
  },
]);

export default routes;
