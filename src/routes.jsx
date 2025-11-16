import React, { useState, useEffect } from "react";
import App from "./App";
import LoginScreen from "./components/Auth/AuthScreen";
import LoginImage from "/images/new_login_wp.png";
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
import IPConfigPage from "./components/admin/IPConfigPage";
import TwoFactorSettings from "./components/Auth/TwoFactorSettings";
import DoctorProfilePage from "./components/User/Pages/DoctorProfilePage";
import ReportsDashboard from "./components/Reports/ReportsDashboard";
import AppointmentConfigPage from "./components/admin/AppointmentConfigPage";

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
          } flex-1 min-h-screen pt-24 md:pt-28 ${
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
  // Root route - redirects to login
  {
    path: "/",
    element: <Navigate to="/logowanie" replace />,
  },

  // Public routes group
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/logowanie",
        element: <LoginScreen screenImg={LoginImage} isLogin={true} />,
      },
      {
        path: "/zapomniane-haslo",
        element: <ForgotPasswordScreen />,
      },
      {
        path: "/kontakt",
        element: <ContactPage />,
      },
    ],
  },

  // Public user site routes
  {
    path: "/user/*",
    element: <Navigate to={location => location.pathname.replace('/logowanie', '')} replace />,
  },
  {
    path: "/user",
    element: <Navigate to="/logowanie" replace />,
  },

  // Doctor & Admin protected routes
  {
    element: <ProtectedRoute allowedRoles={["doctor", "admin"]} />,
    children: [
      
      {
        element: <MainLayout />,
        children: [
          { path: "/lekarze", element: <BillingPage /> },
          { path: "/lekarze/wizyty/:id", element: <DoctorsPage /> },
          { path: "/szczegoly-lekarza/:id", element: <DoctorDetailPage /> },
          { path: "/pacjenci", element: <LabAppointments key="patients" clinic={false} /> },
          { path: "/klinika", element: <LabAppointments key="clinic" clinic={true} /> },
          { path: "/wizyta/utworz", element: <AppointmentPage /> },
          { path: "/szczegoly-pacjenta/:id", element: <PatientDetailsPage /> },
          { path: "/administracja", element: <MedicalDashboard /> },
          { path: "/administracja/sms", element: <UserMessaging /> },
          { path: "/lekarz/utworz", element: <AddDoctorForm /> },
          { path: "/administracja/konta", element: <UserManagement /> },
          { path: "/administracja/uslugi", element: <ServicesManagement /> },
          { path: "/administracja/aktualnosci", element: <NewsManagement /> },
          { path: "/lekarz/ustawienia", element: <DoctorScheduleSettings /> },
          { path: "/administracja/profil", element: <ProfilePage /> },
          { path: "/administracja/kalendarz", element: <DoctorCalendar /> },
          {
            path: "/centrum-pomocy",
            element: <ChatComponent />,
          },
          { path: "/administracja/dane", element: <ReportsDashboard /> },
          
          { path: "/administracja/rozliczenia", element: <BillingManagement /> },
          { path: "/administracja/rozliczenia/szczegoly/:billId", element: <BillDetails /> },
          { path: "/administracja/wiadomosci-kontaktowe", element: <Adminmsgs /> },
          { path: "/administracja/konfiguracja-ip", element: <IPConfigPage /> },
          { path: "/administracja/bezpieczenstwo/2fa", element: <TwoFactorSettings /> },
          { path: "/administracja/konfiguracja-wizyt", element: <AppointmentConfigPage /> },
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

  // English to Polish redirections for backward compatibility (placed after Polish routes)
  {
    path: "/login",
    element: <Navigate to="/logowanie" replace />,
  },
  {
    path: "/forgot-password",
    element: <Navigate to="/zapomniane-haslo" replace />,
  },
  {
    path: "/contact",
    element: <Navigate to="/kontakt" replace />,
  },
  {
    path: "/doctors",
    element: <Navigate to="/lekarze" replace />,
  },
  {
    path: "/doctors/appointments/:id",
    element: <Navigate to={({ params }) => `/lekarze/wizyty/${params.id}`} replace />,
  },
  {
    path: "/doctor-details/:id",
    element: <Navigate to={({ params }) => `/szczegoly-lekarza/${params.id}`} replace />,
  },
  {
    path: "/patients",
    element: <Navigate to="/pacjenci" replace />,
  },
  {
    path: "/clinic",
    element: <Navigate to="/klinika" replace />,
  },
  {
    path: "/appointment/create",
    element: <Navigate to="/wizyta/utworz" replace />,
  },
  {
    path: "/patients-details/:id",
    element: <Navigate to={({ params }) => `/szczegoly-pacjenta/${params.id}`} replace />,
  },
  {
    path: "/admin",
    element: <Navigate to="/administracja" replace />,
  },
  {
    path: "/admin/sms",
    element: <Navigate to="/administracja/sms" replace />,
  },
  {
    path: "/doctor/create",
    element: <Navigate to="/lekarz/utworz" replace />,
  },
  {
    path: "/admin/accounts",
    element: <Navigate to="/administracja/konta" replace />,
  },
  {
    path: "/admin/services",
    element: <Navigate to="/administracja/uslugi" replace />,
  },
  {
    path: "/admin/news",
    element: <Navigate to="/administracja/aktualnosci" replace />,
  },
  {
    path: "/doctor/settings",
    element: <Navigate to="/lekarz/ustawienia" replace />,
  },
  {
    path: "/admin/profile",
    element: <Navigate to="/administracja/profil" replace />,
  },
  {
    path: "/admin/calendar",
    element: <Navigate to="/administracja/kalendarz" replace />,
  },
  {
    path: "/help-center",
    element: <Navigate to="/centrum-pomocy" replace />,
  },
  {
    path: "/admin/data",
    element: <Navigate to="/administracja/dane" replace />,
  },
  {
    path: "/admin/billing",
    element: <Navigate to="/administracja/rozliczenia" replace />,
  },
  {
    path: "/admin/billing/details/:billId",
    element: <Navigate to={({ params }) => `/administracja/rozliczenia/szczegolyparams.billId}`} replace />,
  },
  {
    path: "/admin/contact-messages",
    element: <Navigate to="/administracja/wiadomosci-kontaktowe" replace />,
  },
  {
    path: "/admin/ip-config",
    element: <Navigate to="/administracja/konfiguracja-ip" replace />,
  },
  {
    path: "/admin/security/2fa",
    element: <Navigate to="/administracja/bezpieczenstwo/2fa" replace />,
  },
  {
    path: "/admin/appointment-config",
    element: <Navigate to="/administracja/konfiguracja-wizyt" replace />,
  },

  // Catch all route
  {
    path: "*",
    element: <NotFound404 />,
  },
]);

export default routes;
