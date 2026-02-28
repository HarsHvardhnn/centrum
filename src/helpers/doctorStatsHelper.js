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
   * Fetch simplified appointment stats for Wizyty lekarskie (tiles + date range only).
   * @param {string} doctorId - Doctor ID
   * @param {string} timeframe - 'day' | 'today' | 'week' | 'month' (default: 'month')
   * @returns {Promise<{ success: boolean, data: { zarezerwowane, zakończone, anulowane, rangeLabel, ... } }>}
   */
  getAppointmentStats: async (doctorId, timeframe = "month") => {
    try {
      if (!doctorId) {
        throw new Error("doctorId is required");
      }
      const normalized = timeframe === "today" ? "day" : timeframe;
      const url = `/doctor-stats/${doctorId}/appointment-stats?timeframe=${encodeURIComponent(normalized)}`;
      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      throw error;
    }
  },

  /**
   * @deprecated Use getAppointmentStats for Wizyty lekarskie. Kept for backward compatibility.
   */
  getDoctorStats: async (options = {}) => {
    try {
      const { doctorId, startDate, endDate, timeframe, groupBy, includeRevenue } = options;
      if (!doctorId) throw new Error("doctorId is required");
      const endpoint = `/doctor-stats/${doctorId}/appointment-stats`;
      const queryParams = new URLSearchParams();
      if (timeframe) queryParams.append("timeframe", timeframe);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (groupBy) queryParams.append("groupBy", groupBy);
      if (includeRevenue !== undefined) queryParams.append("includeRevenue", includeRevenue.toString());
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor statistics:", error);
      throw error;
    }
  },
};

export default doctorStatsHelper; 