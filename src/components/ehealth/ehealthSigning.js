import { apiCaller } from "../../utils/axiosInstance";

/**
 * Doctor signing with the personal certificate (flash-drive file + PIN, entered every time).
 * The file and PIN only ever live in memory here: they go to the server with the request that
 * needs them and are never saved in the browser.
 */

let statusPromise = null;
let statusAt = 0;
const STATUS_TTL_MS = 5 * 60 * 1000;
const PENDING_TTL_MS = 2 * 60 * 1000;

let pending = null;
let host = null;

/** Does the logged-in user have to present a certificate? (doctors yes, admin/reception no) */
export function signingRequired() {
  if (!statusPromise || Date.now() - statusAt > STATUS_TTL_MS) {
    statusAt = Date.now();
    statusPromise = apiCaller("GET", "/api/ehealth/signing/status")
      .then((res) => Boolean(res?.data?.data?.required))
      .catch(() => false);
  }
  return statusPromise;
}

export function resetSigningStatus() {
  statusPromise = null;
}

/** A dialog that already collected the certificate hands it over for the next request. */
export function provideSigning(signing) {
  pending = { signing, at: Date.now() };
}

export function clearSigning() {
  pending = null;
}

function takePending() {
  if (!pending) return null;
  const fresh = Date.now() - pending.at < PENDING_TTL_MS;
  const { signing } = pending;
  pending = null;
  return fresh ? signing : null;
}

/** Mounted once for the whole app; asks the doctor for the certificate when no dialog did. */
export function registerSigningHost(handler) {
  host = handler;
  return () => {
    if (host === handler) host = null;
  };
}

/**
 * Returns { certificate, pin } to send with a request, or null when this user does not sign.
 * Rejects when the doctor cancels the prompt.
 */
export async function obtainSigning(options = {}) {
  if (!(await signingRequired())) return null;
  const provided = takePending();
  if (provided) return provided;
  if (!host) throw new Error("Nie można otworzyć okna podpisu. Odśwież stronę.");
  return new Promise((resolve, reject) => host({ options, resolve, reject }));
}

export function readCertificateFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Wybierz plik certyfikatu (.p12 / .pfx)."));
    if (file.size > 200 * 1024) return reject(new Error("Plik jest zbyt duży, to nie wygląda na certyfikat."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.onload = () => {
      const text = String(reader.result || "");
      resolve(text.slice(text.indexOf("base64,") + 7));
    };
    reader.readAsDataURL(file);
  });
}

/** Checks the file and PIN on the server without sending anything anywhere else. */
export async function verifyCertificate({ certificate, pin }) {
  const res = await apiCaller("POST", "/api/ehealth/signing/verify", { signing: { certificate, pin } });
  return res.data.data;
}

export async function startZusSession({ certificate, pin }) {
  const res = await apiCaller("POST", "/api/ehealth/ezla/signing/start", { signing: { certificate, pin } });
  return res.data.data;
}

export async function endZusSession() {
  try {
    // apiCaller refuses POSTs with an empty body, so the call carries a flag.
    await apiCaller("POST", "/api/ehealth/ezla/signing/end", { end: true });
  } catch {
    /* the server removes it after a few minutes anyway */
  }
}
