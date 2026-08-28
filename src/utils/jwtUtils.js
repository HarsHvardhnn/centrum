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
const SHORT_JWT_WARNING_MS = 2 * 60 * 1000; // ≤30m / under 1h access tokens
const LONG_JWT_THRESHOLD_MS = 60 * 60 * 1000; // 1h+

/**
 * How long before access-token expiry the “session ending” modal should appear.
 * - JWT under 1 hour (e.g. 5m, 30m): warn at last 2 minutes
 * - JWT 1 hour or longer: warn at last 5 minutes
 * Always capped below token lifetime so “Przedłuż sesję” can clear the modal.
 */
export const getJwtWarningThresholdMs = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return SHORT_JWT_WARNING_MS;

  const lifetimeMs =
    typeof decoded.iat === "number"
      ? Math.max(0, (decoded.exp - decoded.iat) * 1000)
      : Math.max(0, decoded.exp * 1000 - Date.now());

  if (lifetimeMs <= 0) return SHORT_JWT_WARNING_MS;

  const preferred =
    lifetimeMs >= LONG_JWT_THRESHOLD_MS
      ? DEFAULT_JWT_WARNING_MS
      : SHORT_JWT_WARNING_MS;

  // Never warn for the whole lifetime (extend must buy quiet time)
  const maxWarn = Math.max(30_000, lifetimeMs - 30_000);
  return Math.min(preferred, maxWarn);
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
