import { refreshAccessToken } from "./axiosInstance";
import { getAccessToken, getMsUntilExpiry } from "./jwtUtils";
import { isSessionEnding } from "./sessionEvents";

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

  // Leave the last 5 minutes for the JWT popup — SessionProvider owns extend there
  if (remaining > 0 && remaining <= NEAR_EXPIRY_MS) {
    return null;
  }
  if (remaining > NEAR_EXPIRY_MS) {
    return token;
  }

  // Access JWT already expired but refresh cookie may still be valid
  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}
