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
 * Calendar day for a clinic appointment.
 * Booking stores `date` as a naive `YYYY-MM-DDTHH:mm:00` instant (UTC on the server).
 * Formatting in the browser timezone (e.g. IST) flips late slots like 23:15 to the next day.
 * Use UTC date parts so doctor/reception screens match the booked civil date.
 */
export function formatClinicDate(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    const dotted = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dotted) return trimmed;
    const isoDay = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDay && !trimmed.includes("T")) {
      return `${isoDay[3]}.${isoDay[2]}.${isoDay[1]}`;
    }
  }
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("pl-PL", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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