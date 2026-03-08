import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useUser } from "../../../../context/userContext";
import PatientDetailsPage from "./PatientDetails";

/**
 * For receptionists, block access to the doctor's appointment card and redirect to edit patient (Settings).
 * Admin and doctor can access the appointment card as usual.
 */
const PatientDetailsGuard = () => {
  const { id } = useParams();
  const { user } = useUser();

  if (user?.role === "receptionist" && id) {
    return <Navigate to={`/administracja/konta?edytujPacjenta=${id}`} replace />;
  }

  return <PatientDetailsPage />;
};

export default PatientDetailsGuard;
