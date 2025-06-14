import React, { useState } from "react";
import Header from "./components/User/Header";
import Footer from "./components/User/Footer";
import { Outlet, useOutletContext } from "react-router-dom";
import TawkToWidget from "./components/UtilComponents/TawkToWidget";
import CookieConsent from "./components/User/CookieConsent";
import CookiePreferences from "./components/User/CookiePreferences";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import SEO from "./components/SEO/SEO";
import SEOTester from "./components/SEO/SEOTester";

const UserLayout = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  return (
    <CookieConsentProvider>
      <div className="flex flex-col min-h-screen">
        <SEO />
        <TawkToWidget />
        <Header />
        <main className="flex-1 pt-[15px]">
          <Outlet
            context={{
              selectedDepartment,
              setSelectedDepartment,
              selectedDoctorId,
              setSelectedDoctorId,
            }}
          />
        </main>
        <Footer />
        <CookieConsent />
        <CookiePreferences />
        <SEOTester />
      </div>
    </CookieConsentProvider>
  );
};

export default UserLayout;

export function useAppointmentContext() {
  return useOutletContext();
}
