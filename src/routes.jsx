import React, { Suspense, useEffect } from "react";
import LoginImage from "/images/new_login_wp.png";

import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import UserLayout from "./UserLayout";
import { PublicRoute } from "./components/UtilComponents/ProtectedRoutes";
import NotFound404 from "./components/UtilComponents/NotFound";
import ErrorBoundary, { RouterErrorBoundary } from "./components/UtilComponents/ErrorBoundary";
import { useScrollToTop } from "./hooks/useScrollToTop";

// Lazy load components for code splitting
const LoginScreen = React.lazy(() => import("./components/Auth/AuthScreen"));
const HomePage = React.lazy(() => import("./components/User/Pages/HomePage"));
const AboutUsPage = React.lazy(() => import("./components/User/Pages/AboutUsPage"));
const OurDoctorsPage = React.lazy(() => import("./components/User/Pages/OurDoctorsPage"));
const OurServicesPage = React.lazy(() => import("./components/User/Pages/OurServicesPage"));
const ServicesDetailPage = React.lazy(() => import("./components/User/Pages/ServicesDetailPage"));
const ProfilePage = React.lazy(() => import("./components/Auth/Profile"));
const MyAppointments = React.lazy(() => import("./components/User/MyAppointments"));
const NewsPage = React.lazy(() => import("./components/User/Pages/NewsPage"));
const NewsDetail = React.lazy(() => import("./components/User/NewsDetail"));
const PatientMedicalDetails = React.lazy(() => import("./components/User/MyDetails"));
const TwoFactorSettings = React.lazy(() => import("./components/Auth/TwoFactorSettings"));
const DoctorProfilePage = React.lazy(() => import("./components/User/Pages/DoctorProfilePage"));
const TermsPage = React.lazy(() => import("./components/User/Pages/TermsPage"));
const PrivacyPolicyPage = React.lazy(() => import("./components/User/Pages/PrivacyPolicyPage"));
const ContactPage = React.lazy(() => import("./components/User/Pages/ContactPage"));
const ProctologyTestPage = React.lazy(() => import("./components/User/Pages/ProctologyTestPage"));
const ProctologyPage = React.lazy(() => import("./components/User/Pages/ProctologyPage"));
const SkinLesionRemovalPage = React.lazy(() => import("./components/User/Pages/SkinLesionRemovalPage"));
const AlcoholImplantPage = React.lazy(() => import("./components/User/Pages/AlcoholImplantPage"));
const PediatricNeurologyPage = React.lazy(() => import("./components/User/Pages/PediatricNeurologyPage"));
const MichalSzczubkowskiPage = React.lazy(() => import("./components/User/Pages/MichalSzczubkowskiPage"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Ładowanie...</p>
    </div>
  </div>
);

// Scroll to top wrapper component
const ScrollToTopWrapper = ({ children }) => {
  useScrollToTop();
  return children;
};

// Wrapper component that adds Suspense and ErrorBoundary
const LazyRouteWrapper = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
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
    errorElement: <RouterErrorBoundary />,
    children: [
      { path: "", element: <LazyRouteWrapper><HomePage /></LazyRouteWrapper> },
      { path: "o-nas", element: <LazyRouteWrapper><AboutUsPage /></LazyRouteWrapper> },
      { path: "lekarze", element: <LazyRouteWrapper><OurDoctorsPage /></LazyRouteWrapper> },
      { path: "lekarze/michal-szczubkowski", element: <LazyRouteWrapper><MichalSzczubkowskiPage /></LazyRouteWrapper> },
      // { path: "lekarze/:doctorSlug", element: <LazyRouteWrapper><DoctorProfilePage /></LazyRouteWrapper> },
      { path: "uslugi", element: <LazyRouteWrapper><OurServicesPage /></LazyRouteWrapper> },
      // { path: "uslugi/:service", element: <LazyRouteWrapper><ServicesDetailPage /></LazyRouteWrapper> },
      { path: "aktualnosci", element: <LazyRouteWrapper><NewsPage /></LazyRouteWrapper> },
      { path: "poradnik", element: <LazyRouteWrapper><NewsPage isNews={false} /></LazyRouteWrapper> },
      { path: "kontakt", element: <LazyRouteWrapper><ContactPage /></LazyRouteWrapper> },
      { path: "aktualnosci/:slug", element: <LazyRouteWrapper><NewsDetail /></LazyRouteWrapper> },
      { path: "appointments", element: <LazyRouteWrapper><MyAppointments /></LazyRouteWrapper> },
      { path: "details", element: <LazyRouteWrapper><PatientMedicalDetails /></LazyRouteWrapper> },
      { path: "profile", element: <LazyRouteWrapper><ProfilePage /></LazyRouteWrapper> },
      { path: "security/2fa", element: <LazyRouteWrapper><TwoFactorSettings /></LazyRouteWrapper> },
      { path: "regulamin", element: <LazyRouteWrapper><TermsPage /></LazyRouteWrapper> },
      { path: "polityka-prywatnosci", element: <LazyRouteWrapper><PrivacyPolicyPage /></LazyRouteWrapper> },
      { path: "uslugi/konsultacja-proktologiczna", element: <LazyRouteWrapper><ProctologyTestPage /></LazyRouteWrapper> },
      { path: "proktolog", element: <LazyRouteWrapper><ProctologyPage /></LazyRouteWrapper> },
      { path: "uslugi/usuwanie-zmian-skornych-z-badaniem-histopatologicznym", element: <LazyRouteWrapper><SkinLesionRemovalPage /></LazyRouteWrapper> },
      { path: "uslugi/wszywka-alkoholowa-skarzysko-kamienna", element: <LazyRouteWrapper><AlcoholImplantPage /></LazyRouteWrapper> },
      { path: "uslugi/konsultacja-neurologiczna-dla-dzieci", element: <LazyRouteWrapper><PediatricNeurologyPage /></LazyRouteWrapper> },
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
    errorElement: <RouterErrorBoundary />,
    children: [
      // Login route disabled - redirecting to root
      {
        path: "/login",
        element: <LazyRouteWrapper><LoginScreen screenImg={LoginImage} isLogin={true} /></LazyRouteWrapper>,
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
