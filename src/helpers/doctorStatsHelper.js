import { apiCaller } from "../utils/axiosInstance";

/**
 * Helper functions for doctor statistics
 */
const doctorStatsHelper = {
  /**
   * Fetch simplified list of doctors (for dropdowns/selectors)
   * @returns {Promise} - API response with doctors list
   */
  getDoctorsList: async () => {
    try {
      const response = await apiCaller("GET", "/doctor-stats/doctors-list");
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors list:", error);
      throw error;
    }
  },

  /**
   * Fetch statistics for a specific doctor or all doctors
   * @param {Object} options - Options for filtering stats
   * @param {string} options.doctorId - Optional doctor ID to filter stats
   * @param {string} options.startDate - Optional start date for stats range
   * @param {string} options.endDate - Optional end date for stats range
   * @param {string} options.timeframe - Optional timeframe ('day', 'week', 'month')
   * @returns {Promise} - API response with statistics
   */
  getDoctorStats: async (options = {}) => {
    try {
      const { doctorId, startDate, endDate, timeframe = 'month' } = options;
      
      let endpoint = '/doctor-stats';
      if (doctorId) {
        endpoint = `/doctor-stats/${doctorId}/appointment-stats`;
      }
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (timeframe) queryParams.append('timeframe', timeframe);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor statistics:", error);
      throw error;
    }
  }
};

export default doctorStatsHelper; 