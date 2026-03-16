// services/patientService.js

import { apiCaller } from "../utils/axiosInstance";

/**
 * Service for patient-related API calls
 *
 * Backend contract – International patient identification (when isInternationalPatient = true):
 * - Field name: internationalPatientDocumentKey (string)
 * - Format: "country|documentType|documentNumber" (trimmed, pipe-separated). Example: "Germany|Passport|AB123456"
 * - Backend should store this for duplicate prevention and PATIENT_ID; recommend also verifying with documentDateOfBirth.
 * - On create: if a patient already exists with the same key, respond with HTTP 409 and body: { existingPatientId: "<_id>" }.
 * - Frontend will then show "Pacjent z tym dokumentem już istnieje w systemie." and open the existing patient for editing.
 */
const patientService = {
  /**
   * Create a new patient with multipart/form-data
   * @param {Object} patientData - Patient form data
   * @returns {Promise} - API response with created patient
   */
  createPatient: async (patientData) => {
    try {
      console.log("Patient Helper - Received data:", {
        contactPerson1PhoneCode: patientData.contactPerson1PhoneCode,
        contactPerson1Phone: patientData.contactPerson1Phone,
        contactPerson2PhoneCode: patientData.contactPerson2PhoneCode,
        contactPerson2Phone: patientData.contactPerson2Phone
      });
      
      const formData = new FormData();

      // Helper function to append only if value exists and is not null/undefined
      const appendIfExists = (key, value) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      };

      // Append all fields only if they exist
      appendIfExists("address", patientData.address);
      appendIfExists("alternateContact", patientData.alternateContact);
      appendIfExists("birthWeight", patientData.birthWeight);
      appendIfExists("city", patientData.city);
      // Special handling for consents array
      if (patientData.consents?.length) {
        formData.append("consents", JSON.stringify(patientData.consents));
      }
      appendIfExists("consultingDepartment", patientData.consultingDepartment);
      appendIfExists("consultingSpecialization", patientData.consultingSpecialization);
      appendIfExists("consultingDoctor", patientData.consultingDoctor);
      appendIfExists("country", patientData.country);
      appendIfExists("dateOfBirth", patientData.dateOfBirth);
      appendIfExists("district", patientData.district);
      appendIfExists("education", patientData.education);
      appendIfExists("email", patientData.email);
      appendIfExists("ethnicity", patientData.ethnicity);
      appendIfExists("fatherName", patientData.fatherName);
      appendIfExists("fullName", patientData.fullName);
      appendIfExists("govtId", patientData.govtId);
      appendIfExists("isInternationalPatient", patientData.isInternationalPatient);
      appendIfExists("documentCountry", patientData.documentCountry);
      appendIfExists("documentType", patientData.documentType);
      appendIfExists("documentNumber", patientData.documentNumber);
      appendIfExists("documentDateOfBirth", patientData.documentDateOfBirth);
      appendIfExists("documentExpiryDate", patientData.documentExpiryDate);
      appendIfExists("citizenship", patientData.citizenship);
      // Email and phone are sent only as email / mobileNumber+phoneCode (not documentEmail/documentPhone)
      // Backend contract: internationalPatientDocumentKey = "country|documentType|documentNumber" for duplicate check and PATIENT_ID.
      // Recommend also verifying with documentDateOfBirth. On duplicate return 409 with body: { existingPatientId: string }.
      appendIfExists("internationalPatientDocumentKey", patientData.internationalPatientDocumentKey);
      appendIfExists("smsConsentAgreed", patientData.smsConsentAgreed);
      appendIfExists("ivrLanguage", patientData.ivrLanguage);
      appendIfExists("mainComplaint", patientData.mainComplaint);
      appendIfExists("maritalStatus", patientData.maritalStatus);
      appendIfExists("mobileNumber", patientData.mobileNumber);
      appendIfExists("phoneCode", patientData.phoneCode);
      appendIfExists("phone", patientData.phone);
      appendIfExists("motherName", patientData.motherName);
      appendIfExists("motherTongue", patientData.motherTongue);
      appendIfExists("occupation", patientData.occupation);
      appendIfExists("otherHospitalIds", patientData.otherHospitalIds);
      appendIfExists("pinCode", patientData.pinCode);
      appendIfExists("referrerEmail", patientData.referrerEmail);
      appendIfExists("referrerName", patientData.referrerName);
      appendIfExists("referrerNumber", patientData.referrerNumber);
      appendIfExists("referrerType", patientData.referrerType);
      appendIfExists("religion", patientData.religion);
      appendIfExists("reviewNotes", patientData.reviewNotes);
      appendIfExists("sex", patientData.sex);
      appendIfExists("spouseName", patientData.spouseName);
      appendIfExists("state", patientData.state);
      appendIfExists("isAdult", patientData.isAdult);
      appendIfExists("contactPerson1Name", patientData.contactPerson1Name);
      appendIfExists("contactPerson1PhoneCode", patientData.contactPerson1PhoneCode);
      appendIfExists("contactPerson1Phone", patientData.contactPerson1Phone);
      // Only append phone full if both code and phone number exist
      if (patientData.contactPerson1PhoneCode && patientData.contactPerson1Phone) {
        formData.append("contactPerson1PhoneFull", patientData.contactPerson1PhoneCode + patientData.contactPerson1Phone);
        console.log("Contact Person 1 Phone Full:", patientData.contactPerson1PhoneCode + patientData.contactPerson1Phone);
      }
      appendIfExists("contactPerson1Address", patientData.contactPerson1Address);
      appendIfExists("contactPerson1Pesel", patientData.contactPerson1Pesel);
      appendIfExists("contactPerson1Relationship", patientData.contactPerson1Relationship);
      appendIfExists("contactPerson2Name", patientData.contactPerson2Name);
      appendIfExists("contactPerson2PhoneCode", patientData.contactPerson2PhoneCode);
      appendIfExists("contactPerson2Phone", patientData.contactPerson2Phone);
      // Only append phone full if both code and phone number exist
      if (patientData.contactPerson2PhoneCode && patientData.contactPerson2Phone) {
        formData.append("contactPerson2PhoneFull", patientData.contactPerson2PhoneCode + patientData.contactPerson2Phone);
        console.log("Contact Person 2 Phone Full:", patientData.contactPerson2PhoneCode + patientData.contactPerson2Phone);
      }
      appendIfExists("contactPerson2Address", patientData.contactPerson2Address);
      appendIfExists("contactPerson2Pesel", patientData.contactPerson2Pesel);
      appendIfExists("contactPerson2Relationship", patientData.contactPerson2Relationship);
      appendIfExists("allergies", patientData.allergies);
      appendIfExists("preferredLanguage", patientData.preferredLanguage);

      // Append documents (multiple files)
      if (patientData.documents?.length) {
        patientData.documents.forEach((file) => {
          formData.append("files", file.file);
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
    if (patientData.isInternationalPatient !== undefined) formData.append("isInternationalPatient", patientData.isInternationalPatient);
    if (patientData.documentCountry !== undefined) formData.append("documentCountry", patientData.documentCountry);
    if (patientData.documentType !== undefined) formData.append("documentType", patientData.documentType);
    if (patientData.documentNumber !== undefined) formData.append("documentNumber", patientData.documentNumber);
    if (patientData.documentDateOfBirth !== undefined) formData.append("documentDateOfBirth", patientData.documentDateOfBirth);
    if (patientData.documentExpiryDate !== undefined) formData.append("documentExpiryDate", patientData.documentExpiryDate);
    if (patientData.citizenship !== undefined) formData.append("citizenship", patientData.citizenship);
    if (patientData.internationalPatientDocumentKey !== undefined) formData.append("internationalPatientDocumentKey", patientData.internationalPatientDocumentKey);
    if (patientData.ivrLanguage !== undefined) formData.append("ivrLanguage", patientData.ivrLanguage);
    if (patientData.mainComplaint !== undefined) formData.append("mainComplaint", patientData.mainComplaint);
    if (patientData.maritalStatus !== undefined) formData.append("maritalStatus", patientData.maritalStatus);
    if (patientData.mobileNumber !== undefined) formData.append("mobileNumber", patientData.mobileNumber);
    if (patientData.phoneCode !== undefined) formData.append("phoneCode", patientData.phoneCode);
    if (patientData.phone !== undefined) formData.append("phone", patientData.phone);
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
    if (patientData.appointmentSpecificDocument !== undefined) formData.append("appointmentSpecificDocument", patientData.appointmentSpecificDocument);
    if (patientData.isAdult !== undefined) formData.append("isAdult", patientData.isAdult==="TAK");
    if (patientData.contactPerson1Name !== undefined) formData.append("contactPerson1Name", patientData.contactPerson1Name);
    if (patientData.contactPerson1PhoneCode !== undefined) formData.append("contactPerson1PhoneCode", patientData.contactPerson1PhoneCode);
    if (patientData.contactPerson1Phone !== undefined) formData.append("contactPerson1Phone", patientData.contactPerson1Phone);
    if (patientData.contactPerson1PhoneCode !== undefined && patientData.contactPerson1Phone !== undefined) {
      formData.append("contactPerson1PhoneFull", patientData.contactPerson1PhoneCode + patientData.contactPerson1Phone);
    }
    if (patientData.contactPerson1Address !== undefined) formData.append("contactPerson1Address", patientData.contactPerson1Address);
    if (patientData.contactPerson1Pesel !== undefined) formData.append("contactPerson1Pesel", patientData.contactPerson1Pesel);
    if (patientData.contactPerson1Relationship !== undefined) formData.append("contactPerson1Relationship", patientData.contactPerson1Relationship);
    if (patientData.contactPerson2Name !== undefined) formData.append("contactPerson2Name", patientData.contactPerson2Name);
    if (patientData.contactPerson2PhoneCode !== undefined) formData.append("contactPerson2PhoneCode", patientData.contactPerson2PhoneCode);
    if (patientData.contactPerson2Phone !== undefined) formData.append("contactPerson2Phone", patientData.contactPerson2Phone);
    if (patientData.contactPerson2PhoneCode !== undefined && patientData.contactPerson2Phone !== undefined) {
      formData.append("contactPerson2PhoneFull", patientData.contactPerson2PhoneCode + patientData.contactPerson2Phone);
    }
    if (patientData.contactPerson2Address !== undefined) formData.append("contactPerson2Address", patientData.contactPerson2Address);
    if (patientData.contactPerson2Pesel !== undefined) formData.append("contactPerson2Pesel", patientData.contactPerson2Pesel);
    if (patientData.contactPerson2Relationship !== undefined) formData.append("contactPerson2Relationship", patientData.contactPerson2Relationship);
    if (patientData.allergies !== undefined) formData.append("allergies", patientData.allergies);
    if (patientData.preferredLanguage !== undefined) formData.append("preferredLanguage", patientData.preferredLanguage);

    // Add health metrics
    if (patientData.bloodPressure !== undefined) formData.append("bloodPressure", patientData.bloodPressure);
    if (patientData.temperature !== undefined) formData.append("temperature", patientData.temperature);
    if (patientData.weight !== undefined) formData.append("weight", patientData.weight);
    if (patientData.height !== undefined) formData.append("height", patientData.height);

    // Handle new documents to add (if any)
    if (patientData?.documents?.length) {
      patientData.documents.forEach((file) => {
        //("file", file);
        if (file.file) {
          formData.append("files", file.file);
        } 
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

      //("Response from updatePatientDetails:", response.data);
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


  getSimpliefiedAppointmentsList: async (options = {}) => {
    try {
      const {
        search = "",
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
        status,
        startDate,
        endDate,
        patientLessOnly,
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
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (patientLessOnly === true) queryParams.append("patientLessOnly", "true");
      if (doctor) queryParams.append("doctor", doctor);
      if (sex) queryParams.append("sex", sex);
      if (minAge) queryParams.append("minAge", minAge);
      if (maxAge) queryParams.append("maxAge", maxAge);

      const url = `/patients/data/appointments?${queryParams.toString()}`;

      const response = await apiCaller("GET", url);
      const body = response.data || {};
      // Support both shapes: { data, pagination } and { appointments, currentPage, total, pages }
      const rawList = body.appointments ?? body.data ?? [];
      const pagination = body.pagination ?? {};
      const normalizedList = rawList.map((a) => ({
        ...a,
        visitReason: a.visitReason ?? a.metadata?.visitType ?? a.consultationType,
        visitTypeVerified: a.visitTypeVerified,
      }));
      return {
        appointments: normalizedList,
        currentPage: body.currentPage ?? pagination.page ?? 1,
        total: body.total ?? pagination.total ?? 0,
        pages: body.pages ?? pagination.pages ?? 1,
      };
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

  /**
   * Get patient visit history (simple list for modals).
   * GET /patients/:patientId/visits
   * @param {string} patientId - Patient _id
   * @returns {Promise<{ success: boolean, count: number, data: Array<{ visitId, date, time, startTime, endTime, doctor, visitType, mode, status }> }>}
   */
  getPatientVisits: async (patientId) => {
    try {
      if (!patientId) throw new Error("Patient ID is required");
      const response = await apiCaller("GET", `/patients/${patientId}/visits`);
      return response.data ?? response;
    } catch (error) {
      console.error("Error fetching patient visits:", error);
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
   * Check if a patient exists by PESEL (11 digits). Uses GET /patients/by-pesel.
   * Used for duplicate-PESEL handling (e.g. before Complete registration).
   * @param {string} pesel - 11-digit PESEL (non-digits stripped by backend)
   * @returns {Promise<{ success: boolean, exists: boolean, message: string, patientId?: string, patient?: object, peselWarning?: string }>}
   */
  getPatientByPesel: async (pesel) => {
    try {
      const normalized = String(pesel).replace(/\D/g, "").slice(0, 11);
      if (normalized.length !== 11) {
        return { exists: false };
      }
      const response = await apiCaller(
        "GET",
        `/patients/by-pesel?pesel=${encodeURIComponent(normalized)}`
      );
      return response.data ?? response;
    } catch (error) {
      console.error("Error checking patient by PESEL:", error);
      throw error;
    }
  },

  /**
   * Get full patient details by PESEL. Use after "check by-pesel" for "Załaduj dane" / "Użyj tego pacjenta".
   * GET /patients/by-pesel/details?pesel=...
   * @param {string} pesel - 11-digit PESEL (non-digits stripped by backend)
   * @returns {Promise<object>} Full patient document (same shape as GET /patients/:id). 404 if no patient.
   */
  getPatientDetailsByPesel: async (pesel) => {
    const normalized = String(pesel).replace(/\D/g, "").slice(0, 11);
    if (normalized.length !== 11) {
      throw new Error("Podaj prawidłowy numer PESEL (11 cyfr).");
    }
    const response = await apiCaller(
      "GET",
      `/patients/by-pesel/details?pesel=${encodeURIComponent(normalized)}`
    );
    return response.data ?? response;
  },

  /**
   * Check if a patient exists by identity document (for international patients).
   * Uses GET /patients/by-document. Key format: "country|documentType|documentNumber".
   * @param {string} documentNumber - Document number (required)
   * @param {string} [documentCountry] - Country of document issue
   * @param {string} [documentType] - Document type (e.g. Passport, ID Card)
   * @returns {Promise<{ success?: boolean, exists: boolean, message?: string, patientId?: string, patient?: object }>}
   */
  getPatientByDocumentNumber: async (documentNumber, documentCountry, documentType) => {
    try {
      const num = String(documentNumber ?? "").trim();
      if (!num) return { exists: false };
      const key = [documentCountry, documentType, num].filter(Boolean).map((s) => String(s).trim()).join("|");
      if (!key) return { exists: false };
      const response = await apiCaller(
        "GET",
        `/patients/by-document?${new URLSearchParams({ key: key }).toString()}`
      );
      return response.data ?? response;
    } catch (error) {
      if (error.response?.status === 404) return { exists: false };
      console.error("Error checking patient by document number:", error);
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
  /**
   * Remove patient email by setting it to empty string
   * @param {string} patientId - Patient ID
   * @returns {Promise} - API response
   */
  removePatientEmail: async (patientId) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/patients/${patientId}/email`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing patient email:", error);
      throw error;
    }
  }
};

export default patientService;
