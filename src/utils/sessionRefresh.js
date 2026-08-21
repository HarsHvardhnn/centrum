import { refreshAccessToken } from "./axiosInstance";
import { getAccessToken, getTimeUntilExpiry } from "./jwtUtils";

const NEAR_EXPIRY_MS = 5 * 60 * 1000;
const CHECK_THROTTLE_MS = 4000;

let lastCheckAt = 0;
/** When the banking-style expiry modal is open, do not silent-refresh on clicks. */
let sessionWarningActive = false;

export function setSessionWarningActive(active) {
  sessionWarningActive = !!active;
}

export function isSessionWarningActive() {
  return sessionWarningActive;
}

/**
 * Extend the access token when it is expired or close to expiry.
 * No-ops while the token still has plenty of life left, or while the
 * session-expiry popup is waiting for the user to choose extend / logout.
 */
export async function maybeRefreshSession() {
  if (sessionWarningActive) {
    return null;
  }

  const now = Date.now();
  if (now - lastCheckAt < CHECK_THROTTLE_MS) {
    return null;
  }
  lastCheckAt = now;

  const token = getAccessToken();
  if (!token) return null;

  const remaining = getTimeUntilExpiry(token);
  // Leave the last 5 minutes for the popup — only soft-refresh earlier (e.g. 5–10 min window via interceptor)
  if (remaining !== null && remaining > NEAR_EXPIRY_MS) {
    return token;
  }
  // When inside warning window, let TokenExpiryPopup handle it
  if (remaining !== null && remaining <= NEAR_EXPIRY_MS) {
    return null;
  }

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}
