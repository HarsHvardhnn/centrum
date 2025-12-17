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
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token string
 * @returns {number|null} - Time until expiry in milliseconds or null if invalid/expired
 */
export const getTimeUntilExpiry = (token) => {
  const expiryTime = getTokenExpiry(token);
  if (!expiryTime) return null;
  
  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;
  
  // Return null if already expired
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
