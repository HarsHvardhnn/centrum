import { apiCaller } from "../utils/axiosInstance";

const unwrap = (response) => response.data;

const ehealthHelper = {
  searchDrugs(q) {
    return apiCaller("GET", `/api/ehealth/drugs?q=${encodeURIComponent(q || "")}`).then(unwrap);
  },

  submitPrescription(body) {
    return apiCaller("POST", "/api/ehealth/prescriptions", body).then(unwrap);
  },

  retryPrescription(id) {
    return apiCaller("POST", `/api/ehealth/prescriptions/${id}/retry`).then(unwrap);
  },

  submitReferral(body) {
    return apiCaller("POST", "/api/ehealth/referrals", body).then(unwrap);
  },

  retryReferral(id) {
    return apiCaller("POST", `/api/ehealth/referrals/${id}/retry`).then(unwrap);
  },

  submitEzla(body) {
    return apiCaller("POST", "/api/ehealth/ezla", body).then(unwrap);
  },

  retryEzla(id) {
    return apiCaller("POST", `/api/ehealth/ezla/${id}/retry`).then(unwrap);
  },

  handoffEzla(id) {
    return apiCaller("POST", `/api/ehealth/ezla/${id}/handoff`).then(unwrap);
  },

  checkEwus(body) {
    return apiCaller("POST", "/api/ehealth/ewus/check", body).then(unwrap);
  },

  history({ visitId, patientId } = {}) {
    const params = new URLSearchParams();
    if (visitId) params.set("visitId", visitId);
    if (patientId) params.set("patientId", patientId);
    const q = params.toString();
    return apiCaller("GET", `/api/ehealth/history${q ? `?${q}` : ""}`).then(unwrap);
  },
};

export default ehealthHelper;
