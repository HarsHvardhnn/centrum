import axios from "axios";

const KIOSK_TOKEN_KEY = "kioskSessionToken";

function getAuthToken() {
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1];
  return fromCookie || localStorage.getItem("authToken") || null;
}

const kioskApi = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://backend.centrummedyczne7.pl",
  timeout: 180000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function staffHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function kioskHeaders() {
  const token = getKioskToken();
  return token ? { "X-Kiosk-Token": token } : {};
}

export function getKioskToken() {
  try {
    return sessionStorage.getItem(KIOSK_TOKEN_KEY) || localStorage.getItem(KIOSK_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setKioskToken(token) {
  if (token) {
    sessionStorage.setItem(KIOSK_TOKEN_KEY, token);
    try {
      localStorage.setItem(KIOSK_TOKEN_KEY, token);
    } catch {
      /* private mode / quota */
    }
  } else {
    clearKioskToken();
  }
}

export function clearKioskToken() {
  sessionStorage.removeItem(KIOSK_TOKEN_KEY);
  try {
    localStorage.removeItem(KIOSK_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function createSession(visitId) {
  const res = await kioskApi.post("/api/kiosk/sessions", { visitId }, { headers: staffHeaders() });
  return res.data;
}

export async function createCorrectionSession(patientId) {
  const res = await kioskApi.post(
    "/api/kiosk/sessions/correction",
    { patientId },
    { headers: staffHeaders() }
  );
  return res.data;
}

export async function getSessionsByPatient(patientId) {
  const res = await kioskApi.get(`/api/kiosk/sessions/by-patient/${patientId}`, {
    headers: staffHeaders(),
  });
  return res.data;
}

export async function getSessionByVisit(visitId) {
  const res = await kioskApi.get(`/api/kiosk/sessions/by-visit/${visitId}`, { headers: staffHeaders() });
  return res.data;
}

export async function getSessionStatus(sessionId) {
  const res = await kioskApi.get(`/api/kiosk/sessions/${sessionId}/status`, { headers: staffHeaders() });
  return res.data;
}

export async function cancelSession(sessionId) {
  const res = await kioskApi.post(`/api/kiosk/sessions/${sessionId}/cancel`, {}, { headers: staffHeaders() });
  return res.data;
}

export async function downloadPackage(packageId) {
  const res = await kioskApi.get(`/api/kiosk/documents/${packageId}/download`, { headers: staffHeaders() });
  return res.data;
}

export async function getPdfJobBySession(sessionId) {
  const res = await kioskApi.get(`/api/kiosk/pdf-jobs/by-session/${sessionId}`, { headers: staffHeaders() });
  return res.data;
}

export async function getPdfJob(jobId) {
  const res = await kioskApi.get(`/api/kiosk/pdf-jobs/${jobId}`, { headers: staffHeaders() });
  return res.data;
}

export async function activatePin(pin) {
  const res = await kioskApi.post("/api/kiosk/activate", { pin });
  if (res.data?.token) setKioskToken(res.data.token);
  return res.data;
}

export async function getKioskForm() {
  const res = await kioskApi.get("/api/kiosk/form", { headers: kioskHeaders() });
  return res.data;
}

export async function saveKioskForm(formData) {
  const res = await kioskApi.put("/api/kiosk/form", formData, { headers: kioskHeaders() });
  return res.data;
}

export async function checkKioskPesel(pesel) {
  const res = await kioskApi.post("/api/kiosk/check-pesel", { pesel }, { headers: kioskHeaders() });
  return res.data;
}

export async function checkKioskDocument(documentData) {
  const res = await kioskApi.post("/api/kiosk/check-document", documentData, { headers: kioskHeaders() });
  return res.data;
}

export async function completeKioskRegistration(payload) {
  const res = await kioskApi.post("/api/kiosk/complete", payload, { headers: kioskHeaders() });
  return res.data;
}

/** Mark current kiosk session abandoned (idle timeout / interrupt). Best-effort. */
export async function releaseKioskSession(reason = "idle") {
  const token = getKioskToken();
  if (!token) return null;
  try {
    const res = await kioskApi.post(
      "/api/kiosk/session/release",
      { reason },
      { headers: kioskHeaders() }
    );
    return res.data;
  } catch {
    return null;
  }
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry a few times so reception sees Przerwana even on a flaky iPad network. */
export async function releaseKioskSessionReliable(reason = "interrupted", attempts = 3) {
  for (let i = 0; i < attempts; i += 1) {
    const result = await releaseKioskSession(reason);
    if (result) return result;
    if (i < attempts - 1) await wait(400 * (i + 1));
  }
  return null;
}

export async function pingKioskSession() {
  const res = await kioskApi.post("/api/kiosk/session/heartbeat", {}, { headers: kioskHeaders() });
  return res.data;
}

/**
 * Best-effort release during tab close / browser back / iPad lock.
 * Uses a simple POST (no custom headers) so iOS Safari can send it during unload
 * without a CORS preflight. Token travels in the query + body for sendBeacon.
 * The token is intentionally left in storage so a refresh can finish the
 * abandon call if this beacon is dropped.
 */
export function releaseKioskSessionOnUnload(reason = "interrupted") {
  const token = getKioskToken();
  if (!token) return;

  const base =
    import.meta.env.VITE_REACT_APP_API_BASE_URL ||
    "https://backend.centrummedyczne7.pl";
  const url = `${String(base).replace(/\/$/, "")}/api/kiosk/session/release`;
  const payload = new URLSearchParams({ token, reason });
  const beaconUrl = `${url}?token=${encodeURIComponent(token)}&reason=${encodeURIComponent(reason)}`;

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload.toString()], {
        type: "application/x-www-form-urlencoded",
      });
      if (navigator.sendBeacon(beaconUrl, blob)) {
        return;
      }
    }
  } catch {
    /* fall through to fetch keepalive */
  }

  try {
    fetch(beaconUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    /* ignore unload failures */
  }
}