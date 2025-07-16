import React, {useEffect } from "react";

import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import UserLayout from "./UserLayout";
import HomePage from "./components/User/Pages/HomePage";
import AboutUsPage from "./components/User/Pages/AboutUsPage";
import OurDoctorsPage from "./components/User/Pages/OurDoctorsPage";
import OurServicesPage from "./components/User/Pages/OurServicesPage";
import ServicesDetailPage from "./components/User/Pages/ServicesDetailPage";
import NotFound404 from "./components/UtilComponents/NotFound";
import { PublicRoute } from "./components/UtilComponents/ProtectedRoutes";
import ProfilePage from "./components/Auth/Profile";
import MyAppointments from "./components/User/MyAppointments";

import NewsPage from "./components/User/Pages/NewsPage";
import NewsDetail from "./components/User/NewsDetail";
import PatientMedicalDetails from "./components/User/MyDetails";
import TwoFactorSettings from "./components/Auth/TwoFactorSettings";
import DoctorProfilePage from "./components/User/Pages/DoctorProfilePage";

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


const routes = createBrowserRouter([
  // Root route - will show the same content as /user
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "o-nas", element: <AboutUsPage /> },
      { path: "lekarze", element: <OurDoctorsPage /> },
      { path: "lekarze/:doctorSlug", element: <DoctorProfilePage /> },
      { path: "uslugi", element: <OurServicesPage /> },
      { path: "uslugi/:service", element: <ServicesDetailPage /> },
      { path: "aktualnosci", element: <NewsPage /> },
      { path: "poradnik", element: <NewsPage isNews={false} /> },
      { path: "kontakt", element: <ContactPage /> },
      { path: "aktualnosci/:slug", element: <NewsDetail /> },
      { path: "appointments", element: <MyAppointments /> },
      { path: "details", element: <PatientMedicalDetails /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "security/2fa", element: <TwoFactorSettings /> },
      { path: "*", element: <NotFound404 /> },
    ],
  },

  // Public routes group
  {
    element: <PublicRoute />,
    children: [
      // Login route disabled - redirecting to root
      {
        path: "/login",
        element: <Navigate to="/" replace />,
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

  {
    path: "/doctors/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/doctor-details/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/patients/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/clinic/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/appointment/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/patients-details/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/admin/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/doctor/*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/help-center",
    element: <Navigate to="/" replace />,
  },

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
