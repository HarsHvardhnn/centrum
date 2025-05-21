import { apiCaller } from "../utils/axiosInstance";

/**
 * Billing helper functions for API interactions
 */
const billingHelper = {
  /**
   * Generate a bill for an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} billData - Bill data with services, amounts, etc.
   * @returns {Promise} - API response
   */
  generateBill: async (appointmentId, billData) => {
    try {
      const response = await apiCaller(
        "POST",
        `/patient-bills/generate/${appointmentId}`,
        billData
      );
      return response.data;
    } catch (error) {
      console.error("Error generating bill:", error);
      throw error;
    }
  },

  /**
   * Get all bills with pagination and filtering
   * @param {Object} options - Query options for pagination, sorting, and filtering
   * @returns {Promise} - API response with bills list and pagination
   */
  getAllBills: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "billedAt",
        sortOrder = -1,
        patientId,
        startDate,
        endDate,
        paymentStatus,

      } = options;

      let queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });

      if (patientId) queryParams.append("patientId", patientId);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (paymentStatus) queryParams.append("paymentStatus", paymentStatus);


      const response = await apiCaller(
        "GET",
        `/patient-bills/all?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching bills:", error);
      throw error;
    }
  },

  /**
   * Get bills for a specific patient
   * @param {string} patientId - Patient ID
   * @param {Object} options - Pagination options
   * @returns {Promise} - API response with patient's bills
   */
  getPatientBills: async (patientId, options = {}) => {
    try {
      const { page = 1, limit = 10 } = options;
      const queryParams = new URLSearchParams({ page, limit });

      const response = await apiCaller(
        "GET",
        `/patient-bills/patient/${patientId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient bills:", error);
      throw error;
    }
  },

  /**
   * Get details of a specific bill
   * @param {string} billId - Bill ID
   * @returns {Promise} - API response with bill details
   */
  getBillDetails: async (billId) => {
    try {
      const response = await apiCaller("GET", `/patient-bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bill details:", error);
      throw error;
    }
  },

  /**
   * Update payment status of a bill
   * @param {string} billId - Bill ID
   * @param {Object} paymentData - Payment status data
   * @returns {Promise} - API response
   */
  updatePaymentStatus: async (billId, paymentData) => {
    try {
      const response = await apiCaller(
        "PATCH",
        `/patient-bills/${billId}/payment-status`,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

  /**
   * Delete a bill (soft delete)
   * @param {string} billId - Bill ID
   * @returns {Promise} - API response
   */
  deleteBill: async (billId) => {
    try {
      const response = await apiCaller("DELETE", `/patient-bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting bill:", error);
      throw error;
    }
  },

  /**
   * Generate invoice PDF for a bill
   * @param {string} billId - Bill ID
   * @returns {Promise} - API response with invoice URL
   */
  generateInvoice: async (billId) => {
    try {
      const response = await apiCaller(
        "GET",
        `/patient-bills/${billId}/invoice`
      );
      return response.data;
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  },

  /**
   * Get billing statistics
   * @param {Object} options - Filter options (startDate, endDate)
   * @returns {Promise} - API response with statistics
   */
  getBillingStatistics: async (options = {}) => {
    try {
      const { startDate, endDate } = options;
      let queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const response = await apiCaller(
        "GET",
        `/patient-bills/statistics/summary?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching billing statistics:", error);
      throw error;
    }
  },

  /**
   * Update a bill
   * @param {string} billId - Bill ID
   * @param {Object} updateData - Data to update the bill with
   * @returns {Promise} - API response
   */
  updateBill: async (billId, updateData) => {
    try {
      const response = await apiCaller(
        "PUT",
        `/patient-bills/${billId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating bill:", error);
      throw error;
    }
  }
};

export default billingHelper; 