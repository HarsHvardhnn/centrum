import React, { useState } from "react";
import Header from "./components/User/Header";
import Footer from "./components/User/Footer";
import { Outlet, useOutletContext } from "react-router-dom";
import TawkToWidget from "./components/UtilComponents/TawkToWidget";
import CookieConsent from "./components/User/CookieConsent";

const UserLayout = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  return (
    <div className="flex flex-col min-h-screen">
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
    </div>
  );
};

export default UserLayout;

export function useAppointmentContext() {
  return useOutletContext();
}
