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

  async printDocument(service, id) {
    try {
      const res = await axiosInstance.get(`/api/ehealth/${pathFor(service)}/${id}/print`, {
        responseType: "blob",
      });
      const blob = res.data;
      if (blob?.type && blob.type.includes("json")) {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        throw Object.assign(new Error(parsed?.error?.message || "Wydruk nieudany"), {
          response: { data: parsed },
        });
      }
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

  history({ visitId, patientId } = {}) {
    const params = new URLSearchParams();
    if (visitId) params.set("visitId", visitId);
    if (patientId) params.set("patientId", patientId);
    const q = params.toString();
    return apiCaller("GET", `/api/ehealth/history${q ? `?${q}` : ""}`).then(unwrap);
  },
};

export default ehealthHelper;
