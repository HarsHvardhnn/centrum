import { apiCaller } from "../utils/axiosInstance";

class AppointmentConfigService {
  /**
   * Get all configuration settings
   * @returns {Promise} - API response with all configuration settings
   */
  async getAllConfigs() {
    try {
      const response = await apiCaller("GET", "/api/appointment-config");
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment configurations:", error);
      throw error;
    }
  }

  /**
   * Get configuration settings as a simple object
   * @returns {Promise} - API response with configuration settings as object
   */
  async getConfigsAsObject() {
    try {
      const response = await apiCaller("GET", "/api/appointment-config/object");
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment configurations as object:", error);
      throw error;
    }
  }

  /**
   * Get a specific configuration by key
   * @param {string} key - Configuration key
   * @returns {Promise} - API response with configuration details
   */
  async getConfig(key) {
    try {
      const response = await apiCaller("GET", `/api/appointment-config/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment configuration for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update a configuration value
   * @param {string} key - Configuration key
   * @param {object} data - Object containing the new value
   * @returns {Promise} - API response with updated configuration
   */
  async updateConfig(key, data) {
    try {
      const response = await apiCaller("PUT", `/api/appointment-config/${key}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment configuration for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Reset a configuration to its default value
   * @param {string} key - Configuration key
   * @returns {Promise} - API response with reset configuration
   */
  async resetConfig(key) {
    try {
      const response = await apiCaller("POST", `/api/appointment-config/${key}/reset`);
      return response.data;
    } catch (error) {
      console.error(`Error resetting appointment configuration for key ${key}:`, error);
      throw error;
    }
  }
}

const appointmentConfigService = new AppointmentConfigService();
export default appointmentConfigService;
