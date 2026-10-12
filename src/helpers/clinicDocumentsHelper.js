import { apiCaller } from "../utils/axiosInstance";

const BASE = "/api/clinic-documents";

const unwrap = (res) => res?.data ?? res;

const clinicDocumentsHelper = {
  async listTemplates() {
    const data = unwrap(await apiCaller("GET", `${BASE}/templates`));
    if (!data?.success) throw new Error(data?.message || "Nie udało się pobrać wzorów");
    return data.data || [];
  },
  async saveTemplate(payload, id) {
    const data = unwrap(
      id
        ? await apiCaller("PATCH", `${BASE}/templates/${id}`, payload)
        : await apiCaller("POST", `${BASE}/templates`, payload)
    );
    if (!data?.success) throw new Error(data?.message || "Nie udało się zapisać wzoru");
    return data.data;
  },
  async deleteTemplate(id) {
    const data = unwrap(await apiCaller("DELETE", `${BASE}/templates/${id}`));
    if (!data?.success) throw new Error(data?.message || "Nie udało się usunąć wzoru");
  },
  async listIssued(visitId) {
    const data = unwrap(await apiCaller("GET", `${BASE}/issued?visitId=${encodeURIComponent(visitId)}`));
    if (!data?.success) throw new Error(data?.message || "Nie udało się pobrać dokumentów");
    return data.data || [];
  },
  async createIssued(payload) {
    const data = unwrap(await apiCaller("POST", `${BASE}/issued`, payload));
    if (!data?.success) throw new Error(data?.message || "Nie udało się zapisać dokumentu");
    return data.data;
  },
  async updateIssued(id, payload) {
    const data = unwrap(await apiCaller("PATCH", `${BASE}/issued/${id}`, payload));
    if (!data?.success) throw new Error(data?.message || "Nie udało się zapisać dokumentu");
    return data.data;
  },
};

export default clinicDocumentsHelper;
