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
        search,
        startDate,
        endDate,
        paymentStatus,
        appointmentId

      } = options;

      let queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });

      if (search) queryParams.append("search", search);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (paymentStatus) queryParams.append("paymentStatus", paymentStatus);
      if(appointmentId) queryParams.append("appointmentId",appointmentId)


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
   * @param {{ scope?: 'full' | 'settlement' }} [options]
   * @returns {Promise} - API response with bill details
   */
  getBillDetails: async (billId, options = {}) => {
    try {
      const scope = options.scope || "full";
      const response = await apiCaller(
        "GET",
        `/patient-bills/${billId}?scope=${encodeURIComponent(scope)}`
      );
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
   * Suggest next invoice number for a month/year
   */
  suggestInvoiceId: async (month, year) => {
    try {
      const response = await apiCaller("POST", "/api/invoice/generate-for-date", {
        month,
        year,
      });
      return response.data?.invoiceId || "";
    } catch (error) {
      console.error("Error suggesting invoice ID:", error);
      return "";
    }
  },

  /**
   * Bulk-mark bills as paid
   */
  bulkUpdatePaymentStatus: async (payload) => {
    try {
      const response = await apiCaller(
        "PATCH",
        "/patient-bills/bulk-payment-status",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error bulk updating payment status:", error);
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
      const { startDate, endDate, appointmentId } = options;
      let queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (appointmentId) queryParams.append("appointmentId", appointmentId);

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
  },

  /**
   * Settle patient (paragon or prepare invoice draft)
   */
  settlePatient: async (billId, payload) => {
    try {
      const response = await apiCaller(
        "POST",
        `/patient-bills/${billId}/settle`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error settling patient:", error);
      throw error;
    }
  },

  /**
   * Issue formal Faktura + PDF
   */
  issueInvoice: async (billId, payload) => {
    try {
      const response = await apiCaller(
        "POST",
        `/patient-bills/${billId}/issue-invoice`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error issuing invoice:", error);
      throw error;
    }
  },
};

export default billingHelper; 