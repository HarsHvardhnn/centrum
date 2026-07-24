/**
 * Date formatting utilities
 */

/**
 * Format a date to Polish DD.MM.YYYY format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Formatted date string (e.g., "17.11.1960")
 */
export function formatPolishDate(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "";
  
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Format a date to Polish long format with month name
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Formatted date string (e.g., "17 listopada 1960")
 */
export function formatPolishDateLong(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "";
  
  const months = [
    "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
    "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
  ];
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "";
  
  return dateObj.toISOString().split('T')[0];
}