import { apiCaller, axiosInstance } from "../utils/axiosInstance";

const unwrap = (response) => response.data;

const SERVICE_PATH = {
  prescription: "prescriptions",
  referral: "referrals",
  ezla: "ezla",
};

export function unwrapEhealthError(err) {
  const data = err?.response?.data;
  const nested = data?.error;
  const message =
    nested?.message ||
    data?.message ||
    (typeof nested === "string" ? nested : "") ||
    err?.message ||
    "Nie udało się wykonać operacji.";
  return {
    message,
    code: nested?.code || data?.code || "UNKNOWN",
    retryable: Boolean(nested?.retryable),
  };
}

export function drugsFromHistory(rows) {
  const seen = new Set();
  const drugs = [];
  for (const row of rows || []) {
    const fromItems = Array.isArray(row?.payload?.items) ? row.payload.items.map((item) => item?.drug) : [];
    const candidates = row?.service === "prescription" ? [...fromItems, row.payload?.drug] : [];
    for (const drug of candidates) {
      if (!drug?.name && !drug?.activeSubstance) continue;
      const key = String(drug.ean || drug.id || `${drug.name}|${drug.activeSubstance}`);
      if (seen.has(key)) continue;
      seen.add(key);
      drugs.push({ ...drug, fromHistory: true });
    }
  }
  return drugs;
}

export function drugMatches(drug, term) {
  const q = String(term || "").trim().toLowerCase();
  if (q.length < 1 || !drug) return false;
  return [drug.name, drug.activeSubstance, drug.ean, drug.code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function pathFor(service) {
  return SERVICE_PATH[service] || service;
}

function printBlob(blob, title) {
  const type = blob.type || "";
  const objectUrl = URL.createObjectURL(blob);
  if (type.includes("html")) {
    const w = window.open(objectUrl, "_blank", "noopener,noreferrer");
    const trigger = () => {
      try {
        w?.focus();
        w?.print();
      } catch {
        /* ignore */
      }
    };
    if (w) {
      w.addEventListener("load", () => setTimeout(trigger, 300));
    }
    setTimeout(trigger, 1200);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", title || "Wydruk e-zdrowie");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = objectUrl;
  document.body.appendChild(iframe);
  const cleanup = () => {
    iframe.remove();
    URL.revokeObjectURL(objectUrl);
  };
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.open(objectUrl, "_blank")?.print?.();
    }
  };
  iframe.addEventListener("load", () => setTimeout(triggerPrint, 300));
  setTimeout(triggerPrint, 1200);
  setTimeout(cleanup, 120_000);
}

const ehealthHelper = {
  unwrapEhealthError,

  runtime() {
    return apiCaller("GET", "/api/ehealth/runtime").then(unwrap);
  },

  searchDrugs(q) {
    return apiCaller("GET", `/api/ehealth/drugs?q=${encodeURIComponent(q || "")}`).then(unwrap);
  },

  submitPrescription(body) {
    return apiCaller("POST", "/api/ehealth/prescriptions", body).then(unwrap);
  },

  retryPrescription(id) {
    return apiCaller("POST", `/api/ehealth/prescriptions/${id}/retry`, { retry: true }).then(unwrap);
  },

  submitReferral(body) {
    return apiCaller("POST", "/api/ehealth/referrals", body).then(unwrap);
  },

  retryReferral(id) {
    return apiCaller("POST", `/api/ehealth/referrals/${id}/retry`, { retry: true }).then(unwrap);
  },

  submitEzla(body) {
    return apiCaller("POST", "/api/ehealth/ezla", body).then(unwrap);
  },

  ezlaContext(patientId, institution) {
    const params = new URLSearchParams({
      patientId: String(patientId || ""),
      institution: institution || "ZUS",
    });
    return apiCaller("GET", `/api/ehealth/ezla/context?${params.toString()}`).then(unwrap);
  },

  retryEzla(id) {
    return apiCaller("POST", `/api/ehealth/ezla/${id}/retry`, { retry: true }).then(unwrap);
  },

  handoffEzla(id) {
    return apiCaller("POST", `/api/ehealth/ezla/${id}/handoff`, { handoff: true }).then(unwrap);
  },

  cancelDocument(service, id) {
    return apiCaller("POST", `/api/ehealth/${pathFor(service)}/${id}/cancel`, {
      reason: "I",
    }).then(unwrap);
  },

  async fetchDocumentBlob(service, id) {
    const res = await axiosInstance.get(`/api/ehealth/${pathFor(service)}/${id}/print`, {
      responseType: "blob",
    });
    const blob = res.data;
    if (blob?.type && blob.type.includes("json")) {
      const text = await blob.text();
      const parsed = JSON.parse(text);
      throw Object.assign(new Error(parsed?.error?.message || "Podgląd nieudany"), {
        response: { data: parsed },
      });
    }
    return blob;
  },

  async previewDocument(service, id) {
    try {
      const blob = await this.fetchDocumentBlob(service, id);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
      return { success: true };
    } catch (err) {
      const { message } = unwrapEhealthError(err);
      throw new Error(message);
    }
  },

  async printDocument(service, id) {
    try {
      const blob = await this.fetchDocumentBlob(service, id);
      printBlob(blob, "Wydruk e-zdrowie");
      return { success: true };
    } catch (err) {
      const { message } = unwrapEhealthError(err);
      throw new Error(message);
    }
  },

  checkEwus(body) {
    return apiCaller("POST", "/api/ehealth/ewus/check", body).then(unwrap);
  },

  history(filters = {}) {
    const params = new URLSearchParams();
    ["visitId", "patientId", "service", "status", "doctorId", "from", "to", "q", "mine"].forEach((key) => {
      if (filters[key]) params.set(key, String(filters[key]));
    });
    const q = params.toString();
    return apiCaller("GET", `/api/ehealth/history${q ? `?${q}` : ""}`).then(unwrap);
  },

  referralReadout({ code, pesel, key }) {
    const params = new URLSearchParams();
    if (code) params.set("code", code);
    if (pesel) params.set("pesel", pesel);
    if (key) params.set("key", key);
    return apiCaller("GET", `/api/ehealth/referrals/readout?${params.toString()}`).then(unwrap);
  },

  referralRealize(body) {
    return apiCaller("POST", "/api/ehealth/referrals/realize", body).then(unwrap);
  },
};

export default ehealthHelper;
