import { apiCaller } from "../utils/axiosInstance";

/**
 * Patient Services helper functions for API interactions
 */
const patientServicesHelper = {
  /**
   * Add services to a patient
   * @param {string} patientId - Patient ID
   * @param {Array} services - Array of service objects with serviceId, notes, status, etc.
   * @param {Object} options - Additional options (appointmentId)
   * @returns {Promise} - API response
   */
  addServicesToPatient: async (patientId, services, options = {}) => {
    try {
      let endpoint = "/patient-services";
      
      // Add query params if appointmentId is provided
  
      
      const response = await apiCaller("POST", endpoint, {
        patientId,
        appointmentId:options.appointmentId,
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
   * @param {Object} options - Additional options (appointmentId)
   * @returns {Promise} - API response with patient services
   */
  getPatientServices: async (patientId, options = {}) => {
    try {
      let endpoint = `/patient-services/${patientId}`;
      
      // Add query params if appointmentId is provided
      if (options.appointmentId) {
        endpoint += `?appointmentId=${options.appointmentId}`;
      }
      
      const response = await apiCaller("GET", endpoint);
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
   * @param {Object} options - Additional options (appointmentId)
   * @returns {Promise} - API response
   */
  updatePatientService: async (patientId, serviceId, updateData, options = {}) => {
    try {
      let endpoint = `/patient-services/${patientId}/service/${serviceId}`;
      
      // Add query params if appointmentId is provided
      if (options.appointmentId) {
        endpoint += `?appointmentId=${options.appointmentId}`;
      }
      
      const response = await apiCaller(
        "PATCH", 
        endpoint,
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
   * @param {Object} options - Additional options (appointmentId)
   * @returns {Promise} - API response
   */
  removeServiceFromPatient: async (patientId, serviceId, options = {}) => {
    try {
      let endpoint = `/patient-services/${patientId}/service/${serviceId}`;
      
      // Add query params if appointmentId is provided
      if (options.appointmentId) {
        endpoint += `?appointmentId=${options.appointmentId}`;
      }
      
      const response = await apiCaller(
        "DELETE", 
        endpoint
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
   * @param {Object} options - Additional options (appointmentId)
   * @returns {Promise} - API response
   */
  deleteAllPatientServices: async (patientId, options = {}) => {
    try {
      let endpoint = `/patient-services/${patientId}`;
      
      // Add query params if appointmentId is provided
      if (options.appointmentId) {
        endpoint += `?appointmentId=${options.appointmentId}`;
      }
      
      const response = await apiCaller("DELETE", endpoint);
      return response.data;
    } catch (error) {
      console.error("Error deleting all patient services:", error);
      throw error;
    }
  }
};

export default patientServicesHelper; 