// services/doctorService.js

import { apiCaller } from "../utils/axiosInstance";

/**
 * Service for doctor-related API calls
 */
const doctorService = {
  /**
   * Create a new doctor
   * @param {Object} doctorData - Doctor information
   * @returns {Promise} - API response with doctor data
   */
  createDoctor: async (doctorData) => {
    try {
      const formData = new FormData();

      // Handle name fields
      formData.append(
        "name[first]",
        doctorData.firstName || doctorData.name?.first || ""
      );
      formData.append(
        "name[last]",
        doctorData.lastName || doctorData.name?.last || ""
      );

      formData.append("email", doctorData.email);
      formData.append("phone", doctorData.phone);
      formData.append("department", doctorData.department);
      formData.append("password", doctorData.password);
      formData.append("signupMethod", doctorData.signupMethod || "email");
      formData.append("bio", doctorData.bio || "");
      formData.append("experience", doctorData.experience || 0);
      formData.append("consultationFee", doctorData.consultationFee || 0);

      // Handle arrays
      (doctorData.specializations || doctorData.specialization || []).forEach(
        (item) => formData.append("specialization[]", item)
      );
      (doctorData.qualifications || []).forEach((item) =>
        formData.append("qualifications[]", item)
      );
      (doctorData.weeklyShifts || []).forEach((item) =>
        formData.append("weeklyShifts[]", JSON.stringify(item))
      );
      (doctorData.offSchedule || []).forEach((item) =>
        formData.append("offSchedule[]", JSON.stringify(item))
      );

      if (doctorData.profilePicture || doctorData.image) {
        formData.append("file", doctorData.profilePicture || doctorData.image);
      }

      const response = await apiCaller("POST", "/docs/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw error;
    }
  },
  /**
   * Get all doctors
   * @param {Object} filters - Optional filters for doctors
   * @returns {Promise} - API response with list of doctors
   */
  getAllDoctors: async (filters = {}) => {
    try {
      // Convert filters to query parameters if needed
      const queryParams = new URLSearchParams();

      if (filters.specialization) {
        queryParams.append("specialization", filters.specialization);
      }

      if (filters.experience) {
        queryParams.append("experience", filters.experience);
      }
         if (filters.department) {
           queryParams.append("department", filters.department);
         }


      // Add more filters as needed

      const queryString = queryParams.toString();
      const url = queryString ? `/docs?${queryString}` : "/docs";

      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  },

  /**
   * Get doctor by ID
   * @param {string} id - Doctor ID
   * @returns {Promise} - API response with doctor data
   */
  getDoctorById: async (id) => {
    try {
      if (!id) {
        throw new Error("Doctor ID is required");
      }

      const response = await apiCaller("GET", `/docs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check doctor availability for a specific date and time
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date in ISO format
   * @param {string} time - Time in HH:MM format
   * @returns {Promise} - API response with availability status
   */
  checkDoctorAvailability: async (doctorId, date, time) => {
    try {
      if (!doctorId || !date || !time) {
        throw new Error("Doctor ID, date and time are required");
      }

      const response = await apiCaller(
        "GET",
        `/api/doctors/${doctorId}/availability?date=${date}&time=${time}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking doctor availability:", error);
      throw error;
    }
  },

  /**
   * Update doctor information
   * @param {string} id - Doctor ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} - API response with updated doctor data
   */
  updateDoctor: async (id, updateData) => {
    try {
      if (!id) {
        throw new Error("Doctor ID is required");
      }

      const response = await apiCaller("PUT", `/api/doctors/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating doctor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update doctor weekly schedule
   * @param {string} doctorId - Doctor ID
   * @param {Array} weeklyShifts - Array of shift objects
   * @returns {Promise} - API response with updated schedule
   */
  updateDoctorSchedule: async (doctorId, weeklyShifts) => {
    try {
      if (!doctorId || !weeklyShifts) {
        throw new Error("Doctor ID and weekly shifts are required");
      }

      const response = await apiCaller(
        "PUT",
        `/api/doctors/${doctorId}/schedule`,
        { weeklyShifts }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
      throw error;
    }
  },

  /**
   * Add off-schedule time for a doctor
   * @param {string} doctorId - Doctor ID
   * @param {Object} offTime - Off schedule object with date and time ranges
   * @returns {Promise} - API response with updated off schedule
  //  */
  // addDoctorOffTime: async (doctorId, offTime) => {
  //   try {
  //     if (!doctorId || !offTime) {
  //       throw new Error("Doctor ID and off time details are required");
  //     }

  //     const response = await apiCaller(
  //       "POST",
  //       `/api/doctors/${doctorId}/off-schedule`,
  //       offTime
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error adding doctor off time:", error);
  //     throw error;
  //   }
  // },

  getDoctorWeeklyShifts: async (doctorId = null) => {
    const url = doctorId
      ? `/docs/schedule/shifts?doctorId=${doctorId}`
      : "/docs/schedule/shifts";

    return apiCaller("GET", url);
  },
  updateDoctorWeeklyShifts: async (shifts, doctorId = null) => {
    const url = doctorId
      ? `/docs/schedule/shifts?doctorId=${doctorId}`
      : "/docs/schedule/shifts";

    return apiCaller("PUT", url, { shifts });
  },

  getDoctorOffSchedule: async (doctorId = null) => {
    const url = doctorId
      ? `/docs/schedule/off-time/${doctorId}`
      : "/docs/schedule/off-time";

    return apiCaller("GET", url);
  },
  addDoctorOffTime: async (offTimeData, doctorId = null) => {
    const url = doctorId
      ? `/docs/schedule/off-time/${doctorId}`
      : "/docs/schedule/off-time";

    return apiCaller("POST", url, offTimeData);
  },
  removeDoctorOffTime: async (date, doctorId = null) => {
    const url = doctorId
      ? `/docs/schedule/off-time/${doctorId}`
      : "/docs/schedule/off-time";

    return apiCaller("DELETE", url, { date });
  },

  getDoctorAvailableSlots: async (doctorId, date) => {
    return apiCaller(
      "GET",
      `/docs/schedule/available-slots/${doctorId}`,
      null,
      {},
      {
        params: { date },
      }
    );
  },
};

export default doctorService;
