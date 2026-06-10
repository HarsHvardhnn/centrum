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
  const token = sessionStorage.getItem(KIOSK_TOKEN_KEY);
  return token ? { "X-Kiosk-Token": token } : {};
}

export function setKioskToken(token) {
  if (token) sessionStorage.setItem(KIOSK_TOKEN_KEY, token);
  else sessionStorage.removeItem(KIOSK_TOKEN_KEY);
}

export function clearKioskToken() {
  sessionStorage.removeItem(KIOSK_TOKEN_KEY);
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

export async function getSessionByPatient(patientId) {
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
  const res = await kioskApi.get(`/api/kiosk/pdf-jobs/by-session/${sessionId}`, {
    headers: staffHeaders(),
  });
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

export async function checkKioskDocument(payload) {
  const res = await kioskApi.post("/api/kiosk/check-document", payload, { headers: kioskHeaders() });
  return res.data;
}

export async function completeKioskRegistration(payload) {
  const res = await kioskApi.post("/api/kiosk/complete", payload, { headers: kioskHeaders() });
  return res.data;
}
