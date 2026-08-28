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
      if (doctorData.password) {
        formData.append("password", doctorData.password);
      }
      formData.append("signupMethod", doctorData.signupMethod || "email");
      formData.append("bio", doctorData.bio || "");
      formData.append("experience", doctorData.experience || 0);
      formData.append("shortDescription", doctorData.shortDescription || "");
      
      // Update consultation fee fields to include both online and offline fees
      formData.append("onlineConsultationFee", doctorData.consultationFee || 0);
      formData.append("offlineConsultationFee", doctorData.offlineConsultationFee || 0);

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

   getPatientDetailsAndReports: async (patientId,appointmentId) => {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const response = await apiCaller("GET", `/patients/det/reports/${patientId}?appointmentId=${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient details with ID ${patientId}:`, error);
    throw error;
  }
  },
  

  /**
   * Get all doctors with optional filters (Lista lekarzy + other consumers).
   * Query params sent to backend: search, specialization, date, status, visitType, availability,
   * experience, department (see backend spec BACKEND_DOCTORS_LIST_FILTERS.md).
   * @param {Object} filters - Optional: search, specialization/specialty, date, status, visitType, availability, experience, department, doctor (alias for search)
   * @returns {Promise} - API response with { doctors: [...] }
   */
  getAllDoctors: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      const search = filters.search ?? filters.doctor ?? "";
      if (search && String(search).trim()) {
        queryParams.append("search", String(search).trim());
      }
      const specialization = filters.specialization ?? filters.specialty ?? "";
      if (specialization) {
        queryParams.append("specialization", specialization);
      }
      if (filters.date) {
        queryParams.append("date", filters.date);
      }
      if (filters.status) {
        queryParams.append("status", filters.status);
      }
      if (filters.visitType) {
        queryParams.append("visitType", filters.visitType);
      }
      if (filters.availability === true) {
        queryParams.append("availability", "true");
      }
      if (filters.experience != null && filters.experience !== "") {
        queryParams.append("experience", filters.experience);
      }
      if (filters.department) {
        queryParams.append("department", filters.department);
      }
      if (filters.page) {
        queryParams.append("page", String(filters.page));
      }
      if (filters.limit != null && filters.limit !== "") {
        queryParams.append("limit", String(filters.limit));
      }

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
   * @param {string} [date] - Optional date (YYYY-MM-DD) to get shiftsForDate for that day
   * @returns {Promise} - API response with doctor data (and shiftsForDate when date is provided)
   */
  getDoctorById: async (id, date) => {
    try {
      if (!id) {
        throw new Error("Doctor ID is required");
      }

      const url = date ? `/docs/${id}?date=${encodeURIComponent(date)}` : `/docs/${id}`;
      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor with ID ${id}:`, error);
      throw error;
    }
  },

  getDoctorDetailsById: async (id) => {
    try {
      if (!id) {
        throw new Error("Doctor ID is required");
      }

      const response = await apiCaller("GET", `/docs/details/${id}`);
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

      const formData = new FormData();

      // Handle name fields
      if (updateData.firstName || updateData.lastName) {
        formData.append("name[first]", updateData.firstName || "");
        formData.append("name[last]", updateData.lastName || "");
      }

      // Handle other fields
      if (updateData.email) formData.append("email", updateData.email);
      if (updateData.phone) formData.append("phone", updateData.phone);
      if (updateData.bio) formData.append("bio", updateData.bio);
      if (updateData.experience) formData.append("experience", updateData.experience);
      if (updateData.consultationFee) formData.append("onlineConsultationFee", updateData.consultationFee);
      if (updateData.offlineConsultationFee) formData.append("offlineConsultationFee", updateData.offlineConsultationFee);
      if (updateData.shortDescription) formData.append("shortDescription", updateData.shortDescription);
      // Handle arrays
      if (updateData.specialization) {
        updateData.specialization.forEach(item => {
          formData.append("specialization[]", item);
        });
      }
      if (updateData.qualifications) {
        updateData.qualifications.forEach(item => {
          formData.append("qualifications[]", item);
        });
      }
      if (updateData.weeklyShifts) {
        updateData.weeklyShifts.forEach(item => {
          formData.append("weeklyShifts[]", JSON.stringify(item));
        });
      }
      if (updateData.offSchedule) {
        updateData.offSchedule.forEach(item => {
          formData.append("offSchedule[]", JSON.stringify(item));
        });
      }

      // Handle profile picture
      // Check if profilePicture is a File object (new upload) or a string (existing URL to preserve)
      if (updateData.profilePicture) {
        // If it's a File object, append it as a file for upload
        if (updateData.profilePicture instanceof File) {
          formData.append("file", updateData.profilePicture);
        }
        // If it's a string (URL), send it as a field to preserve the existing image
        else if (typeof updateData.profilePicture === 'string') {
          formData.append("profilePicture", updateData.profilePicture);
        }
      }

      const response = await apiCaller("PATCH", `/docs/details/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
      `/docs/schedule/available-slots/${doctorId}?date=${date}`,
      null,
      {},
      {
        params: { date },
      }
    );
  },

  /**
   * Get next available date and slots for a doctor
   * @param {string} doctorId - Doctor ID
   * @returns {Promise} - API response with next available date and slots
   */
  getNextAvailableDate: async (doctorId, options = {}) => {
    try {
      if (!doctorId) {
        throw new Error("Doctor ID is required");
      }

      const params = new URLSearchParams();
      if (options.after) params.set("after", options.after);
      if (options.before) params.set("before", options.before);
      if (options.allowPast) params.set("allowPast", "true");
      const query = params.toString();

      const response = await apiCaller(
        "GET",
        `/docs/schedule/next-available/${doctorId}${query ? `?${query}` : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching next available date:", error);
      throw error;
    }
  },

  // ===== NEW SCHEDULE MANAGEMENT APIs =====

  /**
   * Create or update doctor schedule for a specific date
   * @param {Object} scheduleData - Schedule data with doctorId, date, timeBlocks, notes
   * @returns {Promise} - API response
   */
  createOrUpdateSchedule: async (scheduleData) => {
    try {
      console.log("=== createOrUpdateSchedule called ===");
      console.log("scheduleData:", scheduleData);
      console.log("Making API call to /api/schedule/schedule");
      
      const response = await apiCaller(
        "POST",
        "/api/schedule/schedule",
        scheduleData
      );
      console.log("createOrUpdateSchedule response:", response);
      return response.data;
    } catch (error) {
      console.error("=== Error in createOrUpdateSchedule ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      throw error;
    }
  },

  /**
   * Get doctor schedule for a date range
   * @param {string} doctorId - Doctor ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} - API response
   */
  getSchedule: async (doctorId, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await apiCaller(
        "GET",
        `/api/schedule/schedule/${doctorId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  },

  /**
   * Delete doctor schedule for a specific date
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date to delete (YYYY-MM-DD)
   * @returns {Promise} - API response
   */
  deleteSchedule: async (doctorId, date) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/api/schedule/schedule/${doctorId}/${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  },

  /**
   * Permanently delete schedule by its MongoDB _id (e.g. from Edit modal).
   * @param {string} scheduleId - Schedule document _id
   * @returns {Promise} - API response
   */
  deleteScheduleById: async (scheduleId) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/api/schedule/schedule/id/${scheduleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting schedule by id:", error);
      throw error;
    }
  },

  /**
   * Delete a single time block from a schedule.
   * DELETE /api/schedule/schedule/id/:scheduleId/blocks/:blockIndex
   * @param {string} scheduleId - Schedule document _id
   * @param {number} blockIndex - 0-based index of the block in timeBlocks
   * @returns {Promise<{ success, remainingBlocks?, scheduleDeleted? }>} - remainingBlocks when block removed; scheduleDeleted true when last block removed and schedule deleted
   */
  deleteScheduleTimeBlock: async (scheduleId, blockIndex) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/api/schedule/schedule/id/${scheduleId}/blocks/${blockIndex}`
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("Error deleting schedule time block:", error);
      throw error;
    }
  },

  /**
   * Create schedule exception
   * @param {Object} exceptionData - Exception data
   * @returns {Promise} - API response
   */
  createException: async (exceptionData) => {
    try {
      console.log("=== createException called ===");
      console.log("exceptionData:", exceptionData);
      console.log("Making API call to /api/schedule/exception");
      
      const response = await apiCaller(
        "POST",
        "/api/schedule/exception",
        exceptionData
      );
      console.log("createException response:", response);
      return response.data;
    } catch (error) {
      console.error("=== Error in createException ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      throw error;
    }
  },

  /**
   * Get schedule exceptions for a doctor
   * @param {string} doctorId - Doctor ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} - API response
   */
  getExceptions: async (doctorId, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await apiCaller(
        "GET",
        `/api/schedule/exception/${doctorId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching exceptions:", error);
      throw error;
    }
  },

  /**
   * Delete schedule exception
   * @param {string} exceptionId - Exception ID
   * @returns {Promise} - API response
   */
  deleteException: async (exceptionId) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/api/schedule/exception/${exceptionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting exception:", error);
      throw error;
    }
  },

  /**
   * Create appointment with reception override
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} - API response
   */
  createReceptionAppointment: async (appointmentData) => {
    try {
      const response = await apiCaller(
        "POST",
        "/appointments/reception",
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating reception appointment:", error);
      throw error;
    }
  },
};

export default doctorService;
