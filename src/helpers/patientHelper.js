// services/patientService.js

import { apiCaller } from "../utils/axiosInstance";

/**
 * Service for patient-related API calls
 */
const patientService = {
  /**
   * Create a new patient with multipart/form-data
   * @param {Object} patientData - Patient form data
   * @returns {Promise} - API response with created patient
   */
  createPatient: async (patientData) => {
    try {
      const formData = new FormData();

      // Append all fields manually
      formData.append("address", patientData.address);
      formData.append("alternateContact", patientData.alternateContact);
      formData.append("birthWeight", patientData.birthWeight);
      formData.append("city", patientData.city);
      formData.append("consents", JSON.stringify(patientData.consents)); // Assuming consents is an array
      formData.append("consultingDepartment", patientData.consultingDepartment);
      formData.append("consultingDoctor", patientData.consultingDoctor);
      formData.append("country", patientData.country);
      formData.append("dateOfBirth", patientData.dateOfBirth);
      formData.append("district", patientData.district);
      formData.append("education", patientData.education);
      formData.append("email", patientData.email);
      formData.append("ethnicity", patientData.ethnicity);
      formData.append("fatherName", patientData.fatherName);
      formData.append("fullName", patientData.fullName);
      formData.append("govtId", patientData.govtId);
      formData.append("hospId", patientData.hospId);
      formData.append(
        "isInternationalPatient",
        patientData.isInternationalPatient
      );
      formData.append("ivrLanguage", patientData.ivrLanguage);
      formData.append("mainComplaint", patientData.mainComplaint);
      formData.append("maritalStatus", patientData.maritalStatus);
      formData.append("mobileNumber", patientData.mobileNumber);
      formData.append("motherName", patientData.motherName);
      formData.append("motherTongue", patientData.motherTongue);
      formData.append("occupation", patientData.occupation);
      formData.append("otherHospitalIds", patientData.otherHospitalIds);
      formData.append("pinCode", patientData.pinCode);
      formData.append("referrerEmail", patientData.referrerEmail);
      formData.append("referrerName", patientData.referrerName);
      formData.append("referrerNumber", patientData.referrerNumber);
      formData.append("referrerType", patientData.referrerType);
      formData.append("religion", patientData.religion);
      formData.append("reviewNotes", patientData.reviewNotes);
      formData.append("sex", patientData.sex);
      formData.append("spouseName", patientData.spouseName);
      formData.append("state", patientData.state);

      // Append documents (multiple files)
      if (patientData.documents?.length) {
        patientData.documents.forEach((file) => {
          formData.append("files", file.file); // Backend should use `upload.array("Files")`
        });
      }

      // Append photo if available
      if (patientData.photo) {
        formData.append("photo", patientData.photo);
      }

      // Send the request
      const response = await apiCaller("POST", "/patients", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  },

  /**
   * Get all patients
   * @param {Object} filters - Optional filters
   * @returns {Promise} - List of patients
   */
  getAllPatients: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      for (const key in filters) {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      }

      const url = queryParams.toString()
        ? `/patients?${queryParams}`
        : `/patients`;

      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  /**
   * Get all patients
   * @param {Object} filters - Optional filters
   * @returns {Promise} - List of patients
   */
  getSimpliefiedPatientsList: async (options = {}) => {
    try {
      const {
        search = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,
        doctor,
        sex,
        minAge,
        maxAge,
      } = options;

      const queryParams = new URLSearchParams();

      // Add all parameters that have values
      if (search) queryParams.append("search", search);
      if (page) queryParams.append("page", page);
      if (limit) queryParams.append("limit", limit);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);
      if (status) queryParams.append("status", status);
      if (doctor) queryParams.append("doctor", doctor);
      if (sex) queryParams.append("sex", sex);
      if (minAge) queryParams.append("minAge", minAge);
      if (maxAge) queryParams.append("maxAge", maxAge);

      const url = `/patients/data/simple?${queryParams.toString()}`;

      const response = await apiCaller("GET", url);
      return response.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  /**
   * Get a single patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise} - Patient details
   */
  getPatientById: async (id) => {
    try {
      if (!id) throw new Error("Patient ID is required");

      const response = await apiCaller("GET", `/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient with ID ${id}:`, error);
      throw error;
    }
  },

  getPatientsByDoctors: async (doctorId) => {
    try {
      if (!doctorId) throw new Error("Patient ID is required");

      const response = await apiCaller(
        "GET",
        `/patients/by-doctor/${doctorId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient with ID ${doctorId}:`, error);
      throw error;
    }
  },
  /**
   * Update patient info
   * @param {string} id - Patient ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} - Updated patient
   */
  updatePatient: async (id, updateData) => {
    try {
      if (!id) throw new Error("Patient ID is required");

      const response = await apiCaller(
        "PUT",
        `/api/patients/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating patient with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check if a patient is available for appointment
   * @param {string} patientId - Patient ID
   * @param {string} date - Date in ISO format
   * @param {string} time - Time in HH:MM
   * @returns {Promise} - Availability result
   */
  checkPatientAvailability: async (patientId, date, time) => {
    try {
      if (!patientId || !date || !time) {
        throw new Error("Patient ID, date, and time are required");
      }

      const response = await apiCaller(
        "GET",
        `/api/patients/${patientId}/availability?date=${date}&time=${time}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking patient availability:", error);
      throw error;
    }
  },
};

export default patientService;
