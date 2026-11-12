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

  /** Creates or updates the doctor in Medfile from the saved professional data. */
  async syncDoctorPractitioner(doctorId) {
    const response = await apiCaller("POST", `/api/ehealth/admin/licenses/doctors/${doctorId}/practitioner/sync`);
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

  async getErrorLog() {
    const response = await apiCaller("GET", "/api/ehealth/admin/error-log");
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

  async getEwus() {
    const response = await apiCaller("GET", "/api/ehealth/admin/ewus");
    return response.data;
  },

  async testEwus(code) {
    const response = await apiCaller("POST", "/api/ehealth/admin/ewus/test", code ? { code } : {});
    return response.data;
  },

  async getMyEwus() {
    const response = await apiCaller("GET", "/api/ehealth/ewus/me");
    return response.data;
  },

  async putMyEwus(payload) {
    const response = await apiCaller("PUT", "/api/ehealth/ewus/me", payload);
    return response.data;
  },

  /** Uploads the ZUS certificate for good (it stays with Medfile); afterwards only a PIN per document is asked for. */
  async uploadMyZusCertificate(signing) {
    const response = await apiCaller("POST", "/api/ehealth/me/zus-certificate", { signing });
    return response.data;
  },

  async refreshMyZus(pin) {
    const response = await apiCaller("POST", "/api/ehealth/me/zus-refresh", { signing: { certificate: "", pin } });
    return response.data;
  },

  async deleteMyZusCertificate(pin) {
    const response = await apiCaller("POST", "/api/ehealth/me/zus-certificate/delete", { signing: { certificate: "", pin } });
    return response.data;
  },

  async sendMyChangeRequest(message) {
    const response = await apiCaller("POST", "/api/ehealth/me/change-request", { message });
    return response.data;
  },

  async getMyProfile() {
    const response = await apiCaller("GET", "/api/ehealth/me/profile");
    return response.data;
  },

  async putMyPaAddress(address) {
    const response = await apiCaller("PUT", "/api/ehealth/me/pa-address", address);
    return response.data;
  },

  async putMyDefaultCell(cellId) {
    const response = await apiCaller("PUT", "/api/ehealth/me/default-cell", { cellId });
    return response.data;
  },

  async putMyZlaWorkplace(workplaceId) {
    const response = await apiCaller("PUT", "/api/ehealth/me/zla-workplace", { workplaceId });
    return response.data;
  },

  /** Reads the doctor's data and workplaces from ZUS with the presented certificate; nothing is stored but metadata. */
  async checkMyZus(signing) {
    const response = await apiCaller("POST", "/api/ehealth/me/zus-check", { signing });
    return response.data;
  },

  async listCells() {
    const response = await apiCaller("GET", "/api/ehealth/admin/cells");
    return response.data;
  },

  async createCell(payload) {
    const response = await apiCaller("POST", "/api/ehealth/admin/cells", payload);
    return response.data;
  },

  async updateCell(id, payload) {
    const response = await apiCaller("PUT", `/api/ehealth/admin/cells/${id}`, payload);
    return response.data;
  },

  async deleteCell(id) {
    const response = await apiCaller("DELETE", `/api/ehealth/admin/cells/${id}`);
    return response.data;
  },

  async seedCells() {
    const response = await apiCaller("POST", "/api/ehealth/admin/cells/seed", { seed: true });
    return response.data;
  },

  async syncCell(id) {
    const response = await apiCaller("POST", `/api/ehealth/admin/cells/${id}/sync`, { sync: true });
    return response.data;
  },

  async syncAllCells() {
    const response = await apiCaller("POST", "/api/ehealth/admin/cells/sync-all", { all: true });
    return response.data;
  },

  /** Cells the signed-in person (or the given doctor) may issue documents under. */
  async doctorCells(doctorId) {
    const response = await apiCaller("GET", `/api/ehealth/cells/doctor${doctorId ? `?doctorId=${doctorId}` : ""}`);
    return response.data;
  },

  async listDoctorEwus() {
    const response = await apiCaller("GET", "/api/ehealth/admin/ewus/doctors");
    return response.data;
  },

  async getDoctorEwus(doctorId) {
    const response = await apiCaller("GET", `/api/ehealth/admin/ewus/doctors/${doctorId}`);
    return response.data;
  },

  async putDoctorEwus(doctorId, payload) {
    const response = await apiCaller("PUT", `/api/ehealth/admin/ewus/doctors/${doctorId}`, payload);
    return response.data;
  },

  async testDoctorEwus(doctorId, code) {
    const response = await apiCaller("POST", `/api/ehealth/admin/ewus/doctors/${doctorId}/test`, code ? { code } : {});
    return response.data;
  },

  async loginMyEwus(code) {
    const response = await apiCaller("POST", "/api/ehealth/ewus/login", code ? { code } : {});
    return response.data;
  },
};

export default ehealthAdminHelper;
