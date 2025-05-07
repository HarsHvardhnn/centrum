import { apiCaller } from "../utils/axiosInstance";

class AppointmentService {
  // Get all appointments with pagination, search, filtering and sorting
  async getAllAppointments(
    page = 1,
    limit = 10,
    searchTerm = "",
    filters = {},
    sortField = "appointmentDate",
    sortOrder = "desc"
  ) {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: searchTerm,
        sortField,
        sortOrder,
        ...filters,
      });

      const response = await apiCaller(
        "GET",
        `/appointments?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  // Get appointment details by ID
  async getAppointmentById(appointmentId) {
    try {
      const response = await apiCaller("GET", `/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  }

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await apiCaller(
        "POST",
        "/appointments",
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }

  // Update appointment details
  async updateAppointment(appointmentId, updatedData) {
    try {
      const response = await apiCaller(
        "PUT",
        `/appointments/${appointmentId}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  }

  // Cancel appointment
  // async cancelAppointment(appointmentId, cancellationReason) {
  //   try {
  //     const response = await apiCaller(
  //       "PATCH",
  //       `/appointments/${appointmentId}/cancel`,
  //       { cancellationReason }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error canceling appointment:", error);
  //     throw error;
  //   }
  // }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newScheduleData) {
    try {
      const response = await apiCaller(
        "PATCH",
        `/appointments/${appointmentId}/reschedule`,
        newScheduleData
      );
      return response.data;
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      throw error;
    }
  }

  // Mark appointment as completed
  async completeAppointment(appointmentId, appointmentSummary) {
    try {
      const response = await apiCaller(
        "PATCH",
        `/appointments/${appointmentId}/complete`,
        { appointmentSummary }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking appointment as completed:", error);
      throw error;
    }
  }

  // Get patient's appointment history
  async getPatientAppointments(patientId, filters = {}) {
    try {
      const { status, startDate, endDate } = filters;
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiCaller(
        "GET",
        `/appointments/patient/${patientId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      throw error;
    }
  }

  // Get doctor's appointments
  async getDoctorAppointments(
    doctorId,
    startDate,
    endDate,
    status = "all",
    page = 1,
    limit = 10
  ) {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        status,
        page,
        limit,
      });

      const response = await apiCaller(
        "GET",
        `/appointments/doctor/${doctorId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      throw error;
    }
  }

  // Check doctor availability for specific date and time
  async checkDoctorAvailability(doctorId, date, startTime, endTime) {
    try {
      const queryParams = new URLSearchParams({
        date,
        startTime,
        endTime,
      });

      const response = await apiCaller(
        "GET",
        `/appointments/availability/doctor/${doctorId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking doctor availability:", error);
      throw error;
    }
  }

  // Get available slots for a doctor on a specific date
  async getDoctorAvailableSlots(doctorId, date) {
    try {
      const response = await apiCaller(
        "GET",
        `/appointments/slots/doctor/${doctorId}?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor available slots:", error);
      throw error;
    }
  }

  // Get appointment statistics
  async getAppointmentStatistics(period = "month", doctorId = null) {
    try {
      let endpoint = `/appointments/statistics?period=${period}`;
      if (doctorId) {
        endpoint += `&doctorId=${doctorId}`;
      }

      const response = await apiCaller("GET", endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment statistics:", error);
      throw error;
    }
  }

  async getAppointmentsDashboard(page = 1, limit = 4) {
    try {
      const response = await apiCaller(
        "GET",
        `/appointments/dashboard?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard appointments:", error);
      throw error;
    }
  }
  async cancelAppointment(appointmentId, reason = "Canceled by user") {
    try {
      // Validate inputs
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }

      const response = await apiCaller(
        "PATCH",
        `/appointments/cancel/${appointmentId}`,
        { cancellationReason: reason }
      );

      // You can add additional success handling here if needed
      console.log("Appointment successfully canceled");

      return response.data;
    } catch (error) {
      console.error("Error canceling appointment:", error);

      // You can add specific error handling based on error types
      if (error.response && error.response.status === 404) {
        throw new Error("Appointment not found");
      }

      throw error;
    }
  }

  async completeCheckIn(appointmentId,patientId) {
    try {
      // Validate inputs
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }

      const response = await apiCaller(
        "PATCH",
        `/appointments/check-in/${appointmentId}?patientId=${patientId}`,
      );

      // You can add additional success handling here if needed
      console.log("Appointment successfully completed");

      return response.data;
    } catch (error) {
      console.error("Error completing appointment:", error);

      // You can add specific error handling based on error types
      if (error.response && error.response.status === 404) {
        throw new Error("Appointment not found");
      }

      throw error;
    }
  }

  // Update appointment details (consultation, medications, tests)
  async updateAppointmentDetails(appointmentId, data) {
    try {
      const response = await apiCaller(
        "PUT",
        `/appointments/${appointmentId}/details`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment details:", error);
      throw error;
    }
  }

  // Create new appointment
  async createAppointment(data) {
    try {
      const response = await apiCaller(
        "POST",
        "/appointments",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }
}

export default new AppointmentService();
