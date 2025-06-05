/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace Polish characters with ASCII equivalents
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-');
};

/**
 * Generate a slug from service title for URL
 * @param {string} serviceTitle - The service title
 * @returns {string} - URL-friendly slug
 */
export const generateServiceSlug = (serviceTitle) => {
  return generateSlug(serviceTitle);
};

/**
 * Generate a slug from news title for URL
 * @param {string} newsTitle - The news title
 * @returns {string} - URL-friendly slug
 */
export const generateNewsSlug = (newsTitle) => {
  return generateSlug(newsTitle);
}; 