import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCaller } from "../utils/axiosInstance";

const ServicesContext = createContext();

export const useServices = () => useContext(ServicesContext);

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiCaller("GET", "/services");
      console.log("response",response)
      setServices(response.data);
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
  }, []);

  return (
    <ServicesContext.Provider
      value={{ services, loading, error, fetchServices }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
