/**
 * Utility functions for handling dates in Poland/Warsaw timezone (Europe/Warsaw)
 */

/**
 * Get current date in Poland timezone as YYYY-MM-DD string
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getCurrentDateInPoland() {
  const now = new Date();
  // Convert to Poland timezone and format as YYYY-MM-DD
  const polandDate = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
  
  const year = polandDate.getFullYear();
  const month = String(polandDate.getMonth() + 1).padStart(2, "0");
  const day = String(polandDate.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Get current Date object adjusted to Poland timezone
 * @returns {Date} Date object representing current time in Poland
 */
export function getCurrentDateObjectInPoland() {
  const now = new Date();
  // Get the time string in Poland timezone
  const polandTimeString = now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" });
  return new Date(polandTimeString);
}

/**
 * Format a date string to YYYY-MM-DD using Poland timezone
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateToPolandTimezone(date) {
  if (!date) return "";
  
  let dateObj;
  if (typeof date === "string") {
    // If it's already a YYYY-MM-DD string, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Convert to Poland timezone
  const polandDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
  
  const year = polandDate.getFullYear();
  const month = String(polandDate.getMonth() + 1).padStart(2, "0");
  const day = String(polandDate.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is in the past (using Poland timezone)
 * @param {string|Date} date - Date string (YYYY-MM-DD) or Date object
 * @returns {boolean} True if date is in the past
 */
export function isDateInPast(date) {
  if (!date) return false;
  
  const today = getCurrentDateInPoland();
  const dateStr = typeof date === "string" ? date : formatDateToPolandTimezone(date);
  
  return dateStr < today;
}

/**
 * Get a date with time set to midnight in Poland timezone
 * @param {string|Date} date - Date string (YYYY-MM-DD) or Date object
 * @returns {Date} Date object set to midnight in Poland timezone
 */
export function getDateAtMidnightPoland(date) {
  const dateStr = typeof date === "string" ? date : formatDateToPolandTimezone(date);
  const [year, month, day] = dateStr.split("-").map(Number);
  
  // Create date in Poland timezone
  const polandDate = new Date();
  polandDate.setFullYear(year, month - 1, day);
  polandDate.setHours(0, 0, 0, 0);
  
  return polandDate;
}

/**
 * Compare two dates using Poland timezone
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Negative if date1 < date2, 0 if equal, positive if date1 > date2
 */
export function compareDatesPoland(date1, date2) {
  const date1Str = typeof date1 === "string" ? date1 : formatDateToPolandTimezone(date1);
  const date2Str = typeof date2 === "string" ? date2 : formatDateToPolandTimezone(date2);
  
  return date1Str.localeCompare(date2Str);
}
