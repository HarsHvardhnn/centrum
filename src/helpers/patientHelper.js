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
      formData.append("isInternationalPatient", patientData.isInternationalPatient);
      formData.append("smsConsentAgreed", patientData.smsConsentAgreed);
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


  updatePatient: async (patientId, patientData) => {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required for update");
    }

    const formData = new FormData();

    // Only append fields that are provided in patientData
    if (patientData.address !== undefined) formData.append("address", patientData.address);
    if (patientData.alternateContact !== undefined) formData.append("alternateContact", patientData.alternateContact);
    if (patientData.birthWeight !== undefined) formData.append("birthWeight", patientData.birthWeight);
    if (patientData.city !== undefined) formData.append("city", patientData.city);
    if (patientData.consents !== undefined) formData.append("consents", JSON.stringify(patientData.consents));
    if (patientData.consultingDepartment !== undefined) formData.append("consultingDepartment", patientData.consultingDepartment);
    if (patientData.consultingDoctor !== undefined) formData.append("consultingDoctor", patientData.consultingDoctor);
    if (patientData.consultingSpecialization !== undefined) formData.append("consultingSpecialization", patientData.consultingSpecialization);
    if (patientData.country !== undefined) formData.append("country", patientData.country);
    if (patientData.dateOfBirth !== undefined) formData.append("dateOfBirth", patientData.dateOfBirth);
    if (patientData.district !== undefined) formData.append("district", patientData.district);
    if (patientData.education !== undefined) formData.append("education", patientData.education);
    if (patientData.email !== undefined) formData.append("email", patientData.email);
    if (patientData.ethnicity !== undefined) formData.append("ethnicity", patientData.ethnicity);
    if (patientData.fatherName !== undefined) formData.append("fatherName", patientData.fatherName);
    if (patientData.fullName !== undefined) formData.append("fullName", patientData.fullName);
    if (patientData.govtId !== undefined) formData.append("govtId", patientData.govtId);
    if (patientData.hospId !== undefined) formData.append("hospId", patientData.hospId);
    if (patientData.isInternationalPatient !== undefined) formData.append("isInternationalPatient", patientData.isInternationalPatient);
    if (patientData.ivrLanguage !== undefined) formData.append("ivrLanguage", patientData.ivrLanguage);
    if (patientData.mainComplaint !== undefined) formData.append("mainComplaint", patientData.mainComplaint);
    if (patientData.maritalStatus !== undefined) formData.append("maritalStatus", patientData.maritalStatus);
    if (patientData.mobileNumber !== undefined) formData.append("mobileNumber", patientData.mobileNumber);
    if (patientData.motherName !== undefined) formData.append("motherName", patientData.motherName);
    if (patientData.motherTongue !== undefined) formData.append("motherTongue", patientData.motherTongue);
    if (patientData.occupation !== undefined) formData.append("occupation", patientData.occupation);
    if (patientData.otherHospitalIds !== undefined) formData.append("otherHospitalIds", patientData.otherHospitalIds);
    if (patientData.pinCode !== undefined) formData.append("pinCode", patientData.pinCode);
    if (patientData.referrerEmail !== undefined) formData.append("referrerEmail", patientData.referrerEmail);
    if (patientData.referrerName !== undefined) formData.append("referrerName", patientData.referrerName);
    if (patientData.referrerNumber !== undefined) formData.append("referrerNumber", patientData.referrerNumber);
    if (patientData.referrerType !== undefined) formData.append("referrerType", patientData.referrerType);
    if (patientData.religion !== undefined) formData.append("religion", patientData.religion);
    if (patientData.reviewNotes !== undefined) formData.append("reviewNotes", patientData.reviewNotes);
    if (patientData.sex !== undefined) formData.append("sex", patientData.sex);
    if (patientData.spouseName !== undefined) formData.append("spouseName", patientData.spouseName);
    if (patientData.state !== undefined) formData.append("state", patientData.state);
    if (patientData.treatmentCategory !== undefined) formData.append("treatmentCategory", patientData.treatmentCategory);

    // Handle new documents to add (if any)
    if (patientData?.documents?.length) {
      patientData.documents.forEach((file) => {
        formData.append("files", file.file);
      });
    }

    // Handle photo update if available
    if (patientData.photo) {
      formData.append("photo", patientData.photo);
    }

    // Handle document deletions if specified
    if (patientData.documentsToDelete?.length) {
      formData.append("documentsToDelete", JSON.stringify(patientData.documentsToDelete));
    }

    // Send the PUT request
    const response = await apiCaller("PUT", `/patients/${patientId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
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

  getPatientDetails: async (id) => {
    try {
      if (!id) throw new Error("Patient ID is required");

      const response = await apiCaller("GET", `/patients/details/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching detailed patient info with ID ${id}:`,
        error
      );
      throw error;
    }
  },

  updatePatientDetails: async (
    id,
    patientData,
    consultationData,
    medications,
    tests,
    uploadedFiles,
    notifyPatient
  ) => {
    try {
      const token = localStorage.getItem("token");

      // Create form data if there are files to upload
      let data;
      let headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (
        uploadedFiles &&
        uploadedFiles.some((file) => file.file instanceof File)
      ) {
        // If we have actual File objects, use FormData
        data = new FormData();
        data.append("patientData", JSON.stringify(patientData));
        data.append("consultationData", JSON.stringify(consultationData));
        data.append("medications", JSON.stringify(medications));
        data.append("tests", JSON.stringify(tests));
        data.append("notifyPatient", JSON.stringify(notifyPatient));

        // Append actual files
        uploadedFiles.forEach((fileInfo, index) => {
          if (fileInfo.file instanceof File) {
            data.append(`files`, fileInfo.file);
          }
        });

        // When using FormData, let the browser set the Content-Type
        delete headers["Content-Type"];
      } else {
        // Regular JSON if no files
        data = {
          patientData,
          consultationData,
          medications,
          tests,
          uploadedFiles,
          notifyPatient,
        };
      }

      const response = await apiCaller("PUT", `/patients/details/${id}`, data, {
        headers,
      });

      console.log("Response from updatePatientDetails:", response.data);
      return response.data.data;
    } catch (error) {
      return error.response?.data || error.message;
      // return handleError(error);
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
