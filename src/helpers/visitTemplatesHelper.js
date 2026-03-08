import { apiCaller } from "../utils/axiosInstance";

const BASE = "/api/visit-templates";

/**
 * Visit documentation templates API.
 * Section templates: one field (e.g. Wywiad). Global templates: full visit (all sections).
 * Auth: Bearer token; roles doctor | admin.
 */
const visitTemplatesHelper = {
  // --- Section keys (for dropdowns / mapping) ---
  async getSectionKeys() {
    const res = await apiCaller("GET", `${BASE}/sections/keys`);
    const data = res?.data ?? res;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  },

  // --- Section templates (one field) ---
  async listSectionTemplates(sectionKey = null) {
    const q = sectionKey ? `?sectionKey=${encodeURIComponent(sectionKey)}` : "";
    const res = await apiCaller("GET", `${BASE}/sections${q}`);
    const data = res?.data ?? res;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  },

  async createSectionTemplate({ sectionKey, name, content }) {
    const res = await apiCaller("POST", `${BASE}/sections`, {
      sectionKey,
      name,
      content: content ?? "",
    });
    const data = res?.data ?? res;
    if (data?.success) return data.data;
    throw new Error(data?.message || "Nie udało się utworzyć szablonu");
  },

  async updateSectionTemplate(id, { name, content }) {
    const res = await apiCaller("PATCH", `${BASE}/sections/${id}`, {
      ...(name !== undefined && { name }),
      ...(content !== undefined && { content }),
    });
    const data = res?.data ?? res;
    if (data?.success) return data.data;
    throw new Error(data?.message || "Nie udało się zaktualizować szablonu");
  },

  async deleteSectionTemplate(id) {
    const res = await apiCaller("DELETE", `${BASE}/sections/${id}`);
    const data = res?.data ?? res;
    if (data?.success) return true;
    throw new Error(data?.message || "Nie udało się usunąć szablonu");
  },

  // --- Global visit templates (full visit) ---
  async listGlobalTemplates() {
    const res = await apiCaller("GET", `${BASE}/global`);
    const data = res?.data ?? res;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  },

  async createGlobalTemplate({ name, sections }) {
    const res = await apiCaller("POST", `${BASE}/global`, {
      name,
      sections: sections ?? {},
    });
    const data = res?.data ?? res;
    if (data?.success) return data.data;
    throw new Error(data?.message || "Nie udało się utworzyć szablonu globalnego");
  },

  async updateGlobalTemplate(id, { name, sections }) {
    const res = await apiCaller("PATCH", `${BASE}/global/${id}`, {
      ...(name !== undefined && { name }),
      ...(sections !== undefined && { sections }),
    });
    const data = res?.data ?? res;
    if (data?.success) return data.data;
    throw new Error(data?.message || "Nie udało się zaktualizować szablonu");
  },

  async deleteGlobalTemplate(id) {
    const res = await apiCaller("DELETE", `${BASE}/global/${id}`);
    const data = res?.data ?? res;
    if (data?.success) return true;
    throw new Error(data?.message || "Nie udało się usunąć szablonu");
  },
};

export default visitTemplatesHelper;
