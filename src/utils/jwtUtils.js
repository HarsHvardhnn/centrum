import { jwtDecode } from 'jwt-decode';
import { getCookie } from './axiosInstance';

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token string
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get token expiry time in milliseconds
 * @param {string} token - JWT token string
 * @returns {number|null} - Expiry time in milliseconds or null if invalid
 */
export const getTokenExpiry = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  // exp is in seconds, convert to milliseconds
  return decoded.exp * 1000;
};

/**
 * Get signed time until token expires in milliseconds (negative if already expired).
 * @param {string} token - JWT token string
 * @returns {number|null} - ms until expiry, or null if token invalid / missing exp
 */
export const getMsUntilExpiry = (token) => {
  const expiryTime = getTokenExpiry(token);
  if (!expiryTime) return null;
  return expiryTime - Date.now();
};

const DEFAULT_JWT_WARNING_MS = 5 * 60 * 1000;

/**
 * How long before access-token expiry the “session ending” modal should appear.
 * Must be shorter than the JWT lifetime — otherwise a 5m token reopens the modal
 * immediately after “Przedłuż sesję”.
 */
export const getJwtWarningThresholdMs = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return DEFAULT_JWT_WARNING_MS;

  const lifetimeMs =
    typeof decoded.iat === "number"
      ? Math.max(0, (decoded.exp - decoded.iat) * 1000)
      : 0;

  // No iat claim: infer short TTL when remaining ≤ default warning window
  if (lifetimeMs <= 0) {
    const remainingMs = decoded.exp * 1000 - Date.now();
    if (remainingMs > 0 && remainingMs <= DEFAULT_JWT_WARNING_MS) {
      return Math.max(30_000, Math.min(60_000, Math.floor(DEFAULT_JWT_WARNING_MS * 0.2)));
    }
    return DEFAULT_JWT_WARNING_MS;
  }

  // Short-lived JWT (≤10m): warn in last 20% (clamped 30s–60s) → 5m token → last 1m
  if (lifetimeMs <= DEFAULT_JWT_WARNING_MS * 2) {
    return Math.max(30_000, Math.min(60_000, Math.floor(lifetimeMs * 0.2)));
  }

  // Longer JWT: classic last-5-minutes window, never more than 25% of lifetime
  return Math.min(DEFAULT_JWT_WARNING_MS, Math.floor(lifetimeMs * 0.25));
};

export { DEFAULT_JWT_WARNING_MS };

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token string
 * @returns {number|null} - Time until expiry in milliseconds or null if invalid/expired
 */
export const getTimeUntilExpiry = (token) => {
  const timeUntilExpiry = getMsUntilExpiry(token);
  if (timeUntilExpiry === null) return null;
  // Return null if already expired (legacy callers)
  return timeUntilExpiry > 0 ? timeUntilExpiry : null;
};

/**
 * Check if token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  return timeUntilExpiry === null;
};

/**
 * Get current access token from storage
 * @returns {string|null} - Access token or null if not found
 */
export const getAccessToken = () => {
  // Try cookie first, then localStorage
  const token = getCookie('authToken') || localStorage.getItem('authToken');
  return token;
};

/**
 * Format time in milliseconds to human-readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} - Formatted string (e.g., "5 minutes", "1 hour")
 */
export const formatTimeRemaining = (ms) => {
  if (!ms || ms <= 0) return '0 seconds';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'dzień' : 'dni'}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'godzina' : hours < 5 ? 'godziny' : 'godzin'}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minuta' : minutes < 5 ? 'minuty' : 'minut'}`;
  } else {
    return `${seconds} ${seconds === 1 ? 'sekunda' : seconds < 5 ? 'sekundy' : 'sekund'}`;
  }
};
