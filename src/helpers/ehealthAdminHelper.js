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

  async saveLicenses(licenseCaps) {
    const response = await apiCaller("PUT", "/api/ehealth/admin/licenses", {
      licenseCaps,
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
