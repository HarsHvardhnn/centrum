import { refreshAccessToken } from "./axiosInstance";
import { getAccessToken, getTimeUntilExpiry } from "./jwtUtils";

const NEAR_EXPIRY_MS = 5 * 60 * 1000;
const CHECK_THROTTLE_MS = 4000;

let lastCheckAt = 0;

/**
 * Extend the access token when it is expired or close to expiry.
 * No-ops while the token still has plenty of life left.
 */
export async function maybeRefreshSession() {
  const now = Date.now();
  if (now - lastCheckAt < CHECK_THROTTLE_MS) {
    return null;
  }
  lastCheckAt = now;

  const token = getAccessToken();
  if (!token) return null;

  const remaining = getTimeUntilExpiry(token);
  if (remaining !== null && remaining > NEAR_EXPIRY_MS) {
    return token;
  }

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}
