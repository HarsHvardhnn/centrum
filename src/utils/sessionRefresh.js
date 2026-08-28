import { getAccessToken, getMsUntilExpiry, getJwtWarningThresholdMs } from "./jwtUtils";
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
 * Soft-extend check on activity. Near-expiry / expired is owned by the JWT modal —
 * do not silent-refresh there (that was dismissing or preventing the popup).
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

  // Modal territory: near expiry OR already expired
  if (remaining <= warningMs) {
    return null;
  }

  return token;
}