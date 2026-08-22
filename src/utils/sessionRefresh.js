import { refreshAccessToken } from "./axiosInstance";
import {
  getAccessToken,
  getMsUntilExpiry,
  getJwtWarningThresholdMs,
} from "./jwtUtils";
import { isSessionEnding } from "./sessionEvents";

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
 * Soft-extend the access token on activity when it is expired or close to expiry.
 * No-ops while the JWT warning modal owns extend, or while the session is ending.
 */
export async function maybeRefreshSession() {
  if (sessionWarningActive || isSessionEnding()) {
    return null;
  }

  const now = Date.now();
  if (now - lastCheckAt < CHECK_THROTTLE_MS) {
    return null;
  }
  lastCheckAt = now;

  const token = getAccessToken();
  if (!token) return null;

  const remaining = getMsUntilExpiry(token);
  if (remaining === null) return null;

  const warningMs = getJwtWarningThresholdMs(token);

  // Leave the warning window for the JWT popup — SessionProvider owns extend there
  if (remaining > 0 && remaining <= warningMs) {
    return null;
  }
  if (remaining > warningMs) {
    return token;
  }

  // Access JWT already expired but refresh cookie may still be valid
  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}