import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import Map from "../Map";
import ScheduleCard from "../ScheduleCard";
import BookAppointment from "../BookAppointment";

const AppointmentPage = () => {
  return (
    <>
      <PageHeader
        title="Book an Appointment"
        path="Home / Appointment"
        bgurl="/images/about-header.jpg"
      />

      <div className="flex max-lg:flex-col max-w-6xl mx-auto">
        <div className="flex-1">
          <BookAppointment page="appointment" />
        </div>
        <div className="flex-1 px-4">
          <ScheduleCard />
        </div>
      </div>
      <Map />
      <ContactSection />
    </>
  );
};

export default AppointmentPage;
