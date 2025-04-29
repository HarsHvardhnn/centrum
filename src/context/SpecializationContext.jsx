import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCaller } from "../utils/axiosInstance";

const SpecializationContext = createContext();

export const useSpecializations = () => useContext(SpecializationContext);

export const SpecializationProvider = ({ children }) => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const { data } = await apiCaller("GET","/admin/specs");
      setSpecializations(data);
      console.log("Specializations:", data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch specializations"
      );
      console.error("Error fetching specializations:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = async (specializationData) => {
    try {
      setLoading(true);

      const { data } = await apiCaller("POST",
        "/admin/specs",
        specializationData,
      );

      setSpecializations([...specializations, data]);
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to add specialization";
      console.error("Error adding specialization:", err);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialization = async (id, specializationData) => {
    try {
      setLoading(true);
      const { data } = await apiCaller(
        "PUT",
        `/admin/specs/${id}`,
        specializationData
      );

      setSpecializations(
        specializations.map((spec) => (spec._id === id ? data : spec))
      );
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update specialization";
      console.error("Error updating specialization:", err);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecialization = async (id) => {
    try {
      setLoading(true);


      await apiCaller("DELETE", `/admin/specs/${id}`);
      setSpecializations(specializations.filter((spec) => spec._id !== id));
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete specialization";
      console.error("Error deleting specialization:", err);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    specializations,
    loading,
    error,
    fetchSpecializations,
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
  };

  return (
    <SpecializationContext.Provider value={value}>
      {children}
    </SpecializationContext.Provider>
  );
};
