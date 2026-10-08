import { apiCaller } from "../utils/axiosInstance";

const ehealthAdminHelper = {
  async getSettings() {
    const response = await apiCaller("GET", "/api/ehealth/admin/settings");
    return response.data;
  },

  async saveSettings(payload) {
    const response = await apiCaller("PUT", "/api/ehealth/admin/settings", payload);
    return response.data;
  },

  async connectionTest() {
    const response = await apiCaller("POST", "/api/ehealth/admin/connection-test");
    return response.data;
  },

  async getLicenses(yearMonth) {
    const q = yearMonth ? `?yearMonth=${encodeURIComponent(yearMonth)}` : "";
    const response = await apiCaller("GET", `/api/ehealth/admin/licenses${q}`);
    return response.data;
  },

  async saveLicenses(body) {
    const payload = body.licenseCaps ? body : { licenseCaps: body };
    const response = await apiCaller("PUT", "/api/ehealth/admin/licenses", payload);
    return response.data;
  },

  async exportLicenses() {
    const response = await apiCaller("GET", "/api/ehealth/admin/licenses/export");
    return response.data;
  },

  async saveDoctorPractitioner(doctorId, body) {
    const response = await apiCaller(
      "PUT",
      `/api/ehealth/admin/licenses/doctors/${doctorId}/practitioner`,
      body
    );
    return response.data;
  },

  async approveLicense(doctorId, service) {
    const response = await apiCaller("POST", "/api/ehealth/admin/licenses/approvals", {
      doctorId,
      service,
    });
    return response.data;
  },

  async getAudit() {
    const response = await apiCaller("GET", "/api/ehealth/admin/audit");
    return response.data;
  },

  async getQueue() {
    const response = await apiCaller("GET", "/api/ehealth/admin/queue");
    return response.data;
  },

  async getLicenseDoctors() {
    const response = await apiCaller("GET", "/api/ehealth/admin/licenses/doctors");
    return response.data;
  },

  async saveDoctorAccess(doctorId, access) {
    const response = await apiCaller("PUT", `/api/ehealth/admin/licenses/doctors/${doctorId}`, {
      access,
    });
    return response.data;
  },

  async createOrganization(payload = {}) {
    const response = await apiCaller("POST", "/api/ehealth/admin/organization", payload);
    return response.data;
  },

  async createPractitioner(payload) {
    const response = await apiCaller("POST", "/api/ehealth/admin/practitioner", payload);
    return response.data;
  },

  async uploadP1Certificates(payload) {
    const response = await apiCaller("POST", "/api/ehealth/admin/p1-certificates", payload);
    return response.data;
  },

  async uploadZusCertificate(payload) {
    const response = await apiCaller("POST", "/api/ehealth/admin/zus-certificate", payload);
    return response.data;
  },

  async configureEwus(payload) {
    const response = await apiCaller("POST", "/api/ehealth/admin/ewus", payload);
    return response.data;
  },
};

export default ehealthAdminHelper;
