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
   * Fetch appointment statistics for a specific doctor
   * @param {Object} options - Options for filtering stats
   * @param {string} options.doctorId - Required doctor ID
   * @param {string} options.timeframe - Optional predefined timeframe ('today', 'week', 'month', 'year')
   * @param {string} options.startDate - Optional start date for custom range (YYYY-MM-DD format)
   * @param {string} options.endDate - Optional end date for custom range (YYYY-MM-DD format)
   * @param {string} options.groupBy - Optional grouping granularity ('day', 'week', 'month', 'year', default: 'month')
   * @param {boolean} options.includeRevenue - Optional flag to include revenue statistics (default: false)
   * @returns {Promise} - API response with statistics
   */
  getDoctorStats: async (options = {}) => {
    try {
      const { doctorId, startDate, endDate, timeframe, groupBy, includeRevenue } = options;
      
      // Validate required parameter
      if (!doctorId) {
        throw new Error('doctorId is required');
      }
      
      // Build endpoint with required doctorId
      const endpoint = `/doctor-stats/${doctorId}/appointment-stats`;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (timeframe) queryParams.append('timeframe', timeframe);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (groupBy) queryParams.append('groupBy', groupBy);
      if (includeRevenue !== undefined) queryParams.append('includeRevenue', includeRevenue.toString());
      
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