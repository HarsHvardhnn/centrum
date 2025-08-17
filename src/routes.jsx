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
import TermsPage from "./components/User/Pages/TermsPage";
import PrivacyPolicyPage from "./components/User/Pages/PrivacyPolicyPage";
import ContactPage from "./components/User/Pages/ContactPage";
import { useScrollToTop } from "./hooks/useScrollToTop";

// Scroll to top wrapper component
const ScrollToTopWrapper = ({ children }) => {
  useScrollToTop();
  return children;
};

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
      onDragStart={(e) => e.preventDefault() }
    />
  );
};

const routes = createBrowserRouter([
  // Root route - will show the same content as /user
  {
    path: "/",
    element: (
      <ScrollToTopWrapper>
        <UserLayout />
      </ScrollToTopWrapper>
    ),
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
      { path: "regulamin", element: <TermsPage /> },
      { path: "polityka-prywatnosci", element: <PrivacyPolicyPage /> },
      { path: "*", element: <NotFound404 /> },
    ],
  },

  // Public routes group
  {
    element: (
      <ScrollToTopWrapper>
        <PublicRoute />
      </ScrollToTopWrapper>
    ),
    children: [
      // Login route disabled - redirecting to root
      {
        path: "/login",
        element: <Navigate to="/" replace />,
      },
    ],
  },

  // Remove the /user redirects that were causing the redirect loop
  // The root route now serves the same content directly

  // Protected image route
  {
    path: "/protected-image/*",
    element: (
      <ScrollToTopWrapper>
        <ProtectedImage />
      </ScrollToTopWrapper>
    )
  },

  // Catch all route
  {
    path: "*",
    element: (
      <ScrollToTopWrapper>
        <NotFound404 />
      </ScrollToTopWrapper>
    ),
  },
]);

export default routes;
