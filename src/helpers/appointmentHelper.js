import { apiCaller } from "../utils/axiosInstance";

class AppointmentService {
  // Get all appointments with pagination, search, filtering and sorting
  async getAllAppointments(
    page = 1,
    limit = 10,
    searchTerm = "",
    filters = {},
    sortBy = "date",
    sortOrder = "desc"
  ) {
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(searchTerm && { searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.doctorId && { doctorId: filters.doctorId }),
        ...(filters.isClinicIp && { isClinicIp: filters.isClinicIp }),
        ...(filters.patientLessOnly === true && { patientLessOnly: "true" }),
        ...(filters.visitReason && { visitReason: filters.visitReason }),
        ...(filters.mode && { mode: filters.mode }),
      });

      const response = await apiCaller(
        "GET",
        `/appointments/details/list?${queryParams.toString()}`
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

  // Create appointment with reception override (new enhanced API)
  async createReceptionAppointment(appointmentData) {
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
  }

  /**
   * Complete registration: create or link patient to visit (PATIENT_ID created here).
   * Body: pesel (required), firstName, lastName, dateOfBirth, phone, email, sex, smsConsentAgreed, consents.
   * Response may include peselWarning (non-blocking).
   */
  async completeRegistration(visitId, data) {
    try {
      const response = await apiCaller(
        "POST",
        `/appointments/${visitId}/complete-registration`,
        data
      );
      return response.data ?? response;
    } catch (error) {
      console.error("Error completing registration:", error);
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

  /**
   * Get visit reason dictionary (categories + types) for registration and doctor verification.
   * GET /api/appointments/visit-reasons
   */
  async getVisitReasons() {
    try {
      const response = await apiCaller("GET", "/appointments/visit-reasons");
      return response?.data ?? response;
    } catch (error) {
      console.error("Error fetching visit reasons:", error);
      throw error;
    }
  }

  /**
   * Update consultation (doctor verification of visit type).
   * PUT /api/appointments/:id/consultation
   * Body: { visitReason?, visitTypeVerified?, interview?, physicalExamination?, treatment?, recommendations?, ... }
   */
  async updateConsultation(appointmentId, data) {
    try {
      const response = await apiCaller(
        "PUT",
        `/appointments/${appointmentId}/consultation`,
        data
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("Error updating consultation:", error);
      throw error;
    }
  }

  /**
   * Update appointment status (e.g. complete visit).
   * PATCH /api/appointments/:id/status
   * Body: { status: "completed" }
   * May return 400 with code VISIT_TYPE_NOT_VERIFIED if visit type not verified.
   */
  async updateAppointmentStatus(appointmentId, body) {
    try {
      const response = await apiCaller(
        "PATCH",
        `/appointments/${appointmentId}/status`,
        body
      );
      return response?.data ?? response;
    } catch (error) {
      console.error("Error updating appointment status:", error);
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

  // Get doctor's appointments. When excludeCancelled is true, backend should return only non-cancelled and total count should match (so counts and list stay in sync).
  async getDoctorAppointments(
    doctorId,
    startDate,
    endDate,
    status = "all",
    page = 1,
    limit = 10,
    searchQuery = "",
    excludeCancelled = true,
  ) {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        status,
        page,
        limit,
        ...(excludeCancelled && { excludeCancelled: "true" }),
        ...(searchQuery && { search: searchQuery }),
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

  /**
   * Fetch appointments for admin dashboard (e.g. "Nadchodzące Wizyty").
   * @param {number} page
   * @param {number} limit
   * @param {boolean} excludePatientLess - If true, request only appointments that have a patient (backend may support query param).
   */
  async getAppointmentsDashboard(page = 1, limit = 4, excludePatientLess = true) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (excludePatientLess) params.set("excludePatientLess", "true");
      const response = await apiCaller(
        "GET",
        `/appointments/dashboard?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard appointments:", error);
      throw error;
    }
  }
  async cancelAppointment(appointmentId, reason = "Canceled by user", sendSMSNotification = false, sendEmailNotification = false) {
    try {
      // Validate inputs
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }

      const response = await apiCaller(
        "PATCH",
        `/appointments/cancel/${appointmentId}`,
        { 
          cancellationReason: reason,
          sendSMSNotification: sendSMSNotification,
          sendEmailNotification: sendEmailNotification
        }
      );

      // You can add additional success handling here if needed
      //("Appointment successfully canceled");
      return response.data;
    } catch (error) {
      console.error("Error canceling appointment:", error);
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
      //("Appointment successfully completed");

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

  // --- ICD-10 / ICD-9 (visit diagnoses & procedures) ---
  async getVisitDiagnoses(visitId) {
    try {
      const response = await apiCaller("GET", `/appointments/${visitId}/diagnoses`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching visit diagnoses:", error);
      return [];
    }
  }

  async getVisitProcedures(visitId) {
    try {
      const response = await apiCaller("GET", `/appointments/${visitId}/procedures`);
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error fetching visit procedures:", error);
      return [];
    }
  }

  async addVisitDiagnosis(visitId, payload) {
    const response = await apiCaller("POST", `/appointments/${visitId}/diagnoses`, payload);
    return response.data;
  }

  async removeVisitDiagnosis(visitId, diagnosisId) {
    await apiCaller("DELETE", `/appointments/${visitId}/diagnoses/${diagnosisId}`);
  }

  async updateVisitDiagnosis(visitId, diagnosisId, payload) {
    const response = await apiCaller("PATCH", `/appointments/${visitId}/diagnoses/${diagnosisId}`, payload);
    return response?.data;
  }

  async addVisitProcedure(visitId, payload) {
    const response = await apiCaller("POST", `/appointments/${visitId}/procedures`, payload);
    return response.data;
  }

  async removeVisitProcedure(visitId, procedureId) {
    await apiCaller("DELETE", `/appointments/${visitId}/procedures/${procedureId}`);
  }

  /** Normalize ICD search result so each item has { code, name } for dropdown and add */
  _normalizeIcdItem(item) {
    if (!item || typeof item !== "object") return null;
    const code = item.code ?? item.icdCode ?? item.id ?? item._id ?? "";
    const name = item.name ?? item.title ?? item.displayName ?? item.description ?? item.label ?? "";
    if (!code && !name) return null;
    return { code: String(code), name: String(name) };
  }

  async searchIcd10(query) {
    if (!query?.trim()) return [];
    try {
      const response = await apiCaller("GET", `/api/icd10/search?q=${encodeURIComponent(query.trim())}`);
      const raw = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      return raw.map((item) => this._normalizeIcdItem(item)).filter(Boolean);
    } catch (error) {
      console.error("Error searching ICD-10:", error);
      return [];
    }
  }

  async searchIcd9(query) {
    if (!query?.trim()) return [];
    try {
      const response = await apiCaller("GET", `/api/icd9/search?q=${encodeURIComponent(query.trim())}`);
      const raw = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      return raw.map((item) => this._normalizeIcdItem(item)).filter(Boolean);
    } catch (error) {
      console.error("Error searching ICD-9:", error);
      return [];
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

  async generateVisitCard(appointmentId, forceNew = false) {
    try {
      const queryParams = forceNew ? '?forceNew=true' : '';
      const response = await apiCaller(
        'POST',
        `/visit-cards/appointment/${appointmentId}${queryParams}`,
        { data: '' }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating visit card:', error);
      throw error;
    }
  }

  /**
   * Get all visit cards for a patient. Returns list with appointment context and visitCard.url per visit.
   * GET /visit-cards/patient/:patientId
   */
  async getVisitCardsByPatient(patientId) {
    try {
      const response = await apiCaller("GET", `/visit-cards/patient/${patientId}`);
      return response?.data ?? response;
    } catch (error) {
      console.error("Error fetching visit cards by patient:", error);
      throw error;
    }
  }
}

const appointmentHelper = new AppointmentService();

export default appointmentHelper;
