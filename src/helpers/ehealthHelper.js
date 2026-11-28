import { toast } from "sonner";
import { apiCaller, axiosInstance } from "../utils/axiosInstance";
import { obtainSigning, signingStored, takeProvidedSigning } from "../components/ehealth/ehealthSigning";

const unwrap = (response) => response.data;
const busyPrintouts = new Set();

const SERVICE_PATH = {
  prescription: "prescriptions",
  referral: "referrals",
  ezla: "ezla",
};

export function unwrapEhealthError(err) {
  const data = err?.response?.data;
  const nested = data?.error;
  // No answer at all means the connection failed.
  const offline = Boolean(err?.request) && !err?.response;
  const message =
    nested?.message ||
    data?.message ||
    (typeof nested === "string" ? nested : "") ||
    (offline ? "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie." : err?.message) ||
    "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
  return {
    message,
    code: nested?.code || data?.code || "UNKNOWN",
    offline,
    eventId: nested?.eventId || "",
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

/** Prints through an off-screen frame (a pop-up opened after an async fetch is blocked by browsers). Falls back to the preview modal. */
function printBlob(blob, title, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", title || "Wydruk e-zdrowie");
  // Not display:none and not 0x0 - browsers print those as blank pages.
  iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0";
  let done = false;
  const cleanup = () => {
    iframe.remove();
    URL.revokeObjectURL(objectUrl);
  };
  const triggerPrint = () => {
    if (done) return;
    done = true;
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(cleanup, 120_000);
    } catch {
      cleanup();
      const fallback = URL.createObjectURL(blob);
      window.dispatchEvent(new CustomEvent("ehealth:preview", { detail: { url: fallback, type: blob.type, title: title || "Wydruk e-zdrowie", filename: filename || "dokument" } }));
    }
  };
  iframe.addEventListener("load", () => setTimeout(triggerPrint, 500));
  iframe.src = objectUrl;
  document.body.appendChild(iframe);
  setTimeout(triggerPrint, 3000);
}

const ehealthHelper = {
  unwrapEhealthError,

  runtime() {
    return apiCaller("GET", "/api/ehealth/runtime").then(unwrap);
  },

  searchDrugs(q, kind, rx) {
    const params = new URLSearchParams({ q: q || "" });
    if (kind) params.set("kind", kind);
    if (rx) params.set("rx", rx);
    return apiCaller("GET", `/api/ehealth/drugs?${params}`, null).then(unwrap);
  },

  async submitPrescription(body) {
    const signing = await obtainSigning({ title: "Podpis e-recepty", actionText: "Podpisz i wyślij" });
    return apiCaller("POST", "/api/ehealth/prescriptions", signing ? { ...body, signing } : body).then(unwrap);
  },

  retryPrescription(id) {
    return apiCaller("POST", `/api/ehealth/prescriptions/${id}/retry`, { retry: true }).then(unwrap);
  },

  async submitReferral(body) {
    const signing = await obtainSigning({ title: "Podpis e-skierowania", actionText: "Podpisz i wyślij" });
    return apiCaller("POST", "/api/ehealth/referrals", signing ? { ...body, signing } : body).then(unwrap);
  },

  retryReferral(id) {
    return apiCaller("POST", `/api/ehealth/referrals/${id}/retry`, { retry: true }).then(unwrap);
  },

  submitEzla(body) {
    // With a stored certificate the dialog handed over the PIN; otherwise the e-ZLA session is used.
    const signing = takeProvidedSigning();
    return apiCaller("POST", "/api/ehealth/ezla", signing ? { ...body, signing } : body).then(unwrap);
  },

  ezlaAddresses(patientId) {
    const params = new URLSearchParams({ patientId: String(patientId || "") });
    return apiCaller("GET", `/api/ehealth/ezla/addresses?${params.toString()}`).then(unwrap);
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

  async cancelDocument(service, id, reason) {
    // e-ZLA with an uploaded certificate needs no PIN.
    const signing = service === "ezla" && (await signingStored())
      ? null
      : await obtainSigning({ title: "Podpis anulowania", actionText: "Podpisz i anuluj", isDestructive: true });
    return apiCaller("POST", `/api/ehealth/${pathFor(service)}/${id}/cancel`, {
      reason: reason || "I",
      ...(signing ? { signing } : {}),
    }).then(unwrap);
  },

  shareDocument(id, toDoctorId) {
    return apiCaller("POST", `/api/ehealth/documents/${id}/share`, { toDoctorId }).then(unwrap);
  },

  unshareDocument(id, doctorId) {
    return apiCaller("DELETE", `/api/ehealth/documents/${id}/share/${doctorId}`).then(unwrap);
  },

  /** Reports a click that has no backend call of its own, for the P1 audit log. */
  logDocumentAction(id, action) {
    return apiCaller("POST", `/api/ehealth/documents/${id}/log`, { action }).then(unwrap).catch(() => null);
  },

  auditLog(filters = {}) {
    const params = new URLSearchParams();
    ["from", "to", "service", "action", "userId", "limit"].forEach((key) => {
      if (filters[key]) params.set(key, String(filters[key]));
    });
    return apiCaller("GET", `/api/ehealth/admin/audit/log?${params.toString()}`).then(unwrap);
  },

  async fetchDocumentBlob(service, id, { purpose } = {}) {
    let res;
    try {
      res = await axiosInstance.get(`/api/ehealth/${pathFor(service)}/${id}/print`, {
        responseType: "blob",
        params: purpose ? { purpose } : undefined,
      });
    } catch (err) {
      // A refused printout answers with JSON, which arrives as a blob here: read it so the reason can be shown.
      if (err?.response?.data instanceof Blob) {
        try {
          err.response.data = JSON.parse(await err.response.data.text());
          err.message = err.response.data?.error?.message || err.message;
        } catch {
          /* not JSON: keep the original error */
        }
      }
      throw err;
    }
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
    const key = `${service}:${id}`;
    // One request at a time, and the window opens at once with "preparing" so the click is visibly heard.
    if (busyPrintouts.has(key)) return { success: true };
    busyPrintouts.add(key);
    window.dispatchEvent(new CustomEvent("ehealth:preview", { detail: { loading: true, title: "Podgląd wydruku" } }));
    try {
      const blob = await this.fetchDocumentBlob(service, id);
      const objectUrl = URL.createObjectURL(blob);
      window.dispatchEvent(new CustomEvent("ehealth:preview", { detail: { url: objectUrl, type: blob.type, title: "Podgląd wydruku", filename: `${service}-${id}` } }));
      return { success: true };
    } catch (err) {
      window.dispatchEvent(new CustomEvent("ehealth:preview", { detail: null }));
      const { message } = unwrapEhealthError(err);
      throw new Error(message);
    } finally {
      busyPrintouts.delete(key);
    }
  },

  async printDocument(service, id) {
    const key = `print:${service}:${id}`;
    if (busyPrintouts.has(key)) return { success: true };
    busyPrintouts.add(key);
    const notice = toast.loading("Przygotowuję wydruk…");
    try {
      const blob = await this.fetchDocumentBlob(service, id);
      printBlob(blob, "Wydruk e-zdrowie", `${service}-${id}`);
      return { success: true };
    } catch (err) {
      const { message } = unwrapEhealthError(err);
      throw new Error(message);
    } finally {
      toast.dismiss(notice);
      busyPrintouts.delete(key);
    }
  },

  checkEwus(body) {
    return apiCaller("POST", "/api/ehealth/ewus/check", body).then(unwrap);
  },

  ewusLogin(code) {
    return apiCaller("POST", "/api/ehealth/ewus/login", { code: code || "" }).then(unwrap);
  },

  /** eWUŚ check that asks for the NFZ app code when the 14-minute session ran out (manual MFA mode). */
  async checkEwusWithLogin(body) {
    let res = await ehealthHelper.checkEwus(body);
    if (res?.data?.error?.code === "EWUS_MFA") {
      const { promptEwusCode } = await import("../components/ehealth/ewusCodePrompt");
      const code = await promptEwusCode(res.data.error.message);
      if (!code) return res;
      const login = await ehealthHelper.ewusLogin(code);
      if (!login?.data?.ok) throw new Error(login?.data?.message || "Logowanie do eWUŚ nie powiodło się");
      res = await ehealthHelper.checkEwus(body);
    }
    return res;
  },

  prescriptionHistory({ patientId, range = "12m" } = {}) {
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", String(patientId));
    if (range) params.set("range", String(range));
    return apiCaller("GET", `/api/ehealth/prescriptions/history?${params.toString()}`).then(unwrap);
  },

  ezlaHistory({ patientId } = {}) {
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", String(patientId));
    return apiCaller("GET", `/api/ehealth/ezla/history?${params.toString()}`).then(unwrap);
  },

  history(filters = {}) {
    const params = new URLSearchParams();
    [
      "visitId", "patientId", "service", "status", "doctorId", "from", "to", "q", "mine",
      "patient", "visitFrom", "visitTo", "visitType", "visitDoctorId", "issuerId",
      "drug", "icd10", "pin", "documentNumber", "text",
    ].forEach((key) => {
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
