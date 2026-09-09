import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCaller } from "../utils/axiosInstance";
import { useUser } from "./userContext";
import { fetchStaffPickerServices } from "../helpers/userServiceHelper";

const ServicesContext = createContext();

export const useServices = () => useContext(ServicesContext);

const STAFF_ROLES = ["admin", "receptionist", "doctor"];

export const ServicesProvider = ({ children }) => {
  const { user } = useUser();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      if (STAFF_ROLES.includes(user?.role)) {
        const rows = await fetchStaffPickerServices();
        setServices(rows);
      } else {
        const response = await apiCaller("GET", "/services");
        setServices(response.data);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("błąd serwera.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // Re-fetch after login so staff get the internal catalog
  }, [user?.role, user?.id]);

  return (
    <ServicesContext.Provider
      value={{ services, loading, error, fetchServices }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
