/**
 * Generate a URL-friendly slug from text
 * @param {string} text - The text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace Polish characters
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace special characters and spaces with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive dashes with single dash
    .replace(/-+/g, '-');
};

/**
 * Generate a doctor profile slug from doctor data
 * @param {Object} doctor - Doctor object with name information
 * @returns {string} - Doctor profile slug
 */
export const generateDoctorSlug = (doctor) => {
  if (!doctor || !doctor.name) return '';
  
  const firstName = doctor.name.first || '';
  const lastName = doctor.name.last || '';
  
  // Create full name and generate slug
  const fullName = `${firstName} ${lastName}`.trim();
  return generateSlug(fullName);
};

/**
 * Generate doctor profile URL
 * @param {Object} doctor - Doctor object with name information
 * @returns {string} - Full doctor profile URL path
 */
export const generateDoctorProfileUrl = (doctor) => {
  const slug = generateDoctorSlug(doctor);
  return slug ? `/lekarze/${slug}` : '/lekarze';
};

/**
 * Validate if a slug is valid (not empty, undefined, or invalid)
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether the slug is valid
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  const trimmedSlug = slug.trim();
  return (
    trimmedSlug !== '' &&
    trimmedSlug !== 'undefined' &&
    trimmedSlug !== 'null' &&
    !trimmedSlug.includes('undefined') &&
    !trimmedSlug.includes('tel:') &&
    !trimmedSlug.includes('mailto:')
  );
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