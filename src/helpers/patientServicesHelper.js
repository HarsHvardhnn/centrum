import { apiCaller } from "../utils/axiosInstance";

/**
 * Patient Services helper functions for API interactions
 */
const patientServicesHelper = {
  /**
   * Add services to a patient
   * @param {string} patientId - Patient ID
   * @param {Array} services - Array of service objects with serviceId, notes, status, etc.
   * @returns {Promise} - API response
   */
  addServicesToPatient: async (patientId, services) => {
    try {
      const response = await apiCaller("POST", "/patient-services", {
        patientId,
        services: services.map(service => ({
          serviceId: service.serviceId,
          notes: service.notes || "",
          status: service.status || "active",
          quantity: service.quantity || 1
        }))
      });
      return response.data;
    } catch (error) {
      console.error("Error adding services to patient:", error);
      throw error;
    }
  },

  /**
   * Get services for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise} - API response with patient services
   */
  getPatientServices: async (patientId) => {
    try {
      const response = await apiCaller("GET", `/patient-services/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting patient services:", error);
      throw error;
    }
  },

  /**
   * Update a specific service for a patient
   * @param {string} patientId - Patient ID
   * @param {string} serviceId - Service ID
   * @param {Object} updateData - Data to update (status, notes)
   * @returns {Promise} - API response
   */
  updatePatientService: async (patientId, serviceId, updateData) => {
    try {
      const response = await apiCaller(
        "PATCH", 
        `/patient-services/${patientId}/service/${serviceId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating patient service:", error);
      throw error;
    }
  },

  /**
   * Remove a specific service from a patient
   * @param {string} patientId - Patient ID
   * @param {string} serviceId - Service ID
   * @returns {Promise} - API response
   */
  removeServiceFromPatient: async (patientId, serviceId) => {
    try {
      const response = await apiCaller(
        "DELETE", 
        `/patient-services/${patientId}/service/${serviceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing service from patient:", error);
      throw error;
    }
  },

  /**
   * Delete all services for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise} - API response
   */
  deleteAllPatientServices: async (patientId) => {
    try {
      const response = await apiCaller("DELETE", `/patient-services/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting all patient services:", error);
      throw error;
    }
  }
};

export default patientServicesHelper; 