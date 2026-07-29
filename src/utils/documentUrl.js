const CLOUDINARY_CLOUD_NAME = "dca740eqo";

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function isCloudinaryPath(value) {
  const s = String(value || "").trim();
  if (!s || isAbsoluteUrl(s)) return false;
  return s.startsWith("hospital_app/") || s.includes("/");
}

/**
 * Turn a Cloudinary public_id / folder path into a raw PDF HTTPS URL.
 */
export function buildCloudinaryPdfUrl(publicIdOrPath) {
  if (!publicIdOrPath) return null;
  const raw = String(publicIdOrPath).trim();
  const publicId = raw.replace(/\.pdf$/i, "");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.pdf`;
}

/**
 * Turn a Cloudinary public_id into an image HTTPS URL.
 */
export function buildCloudinaryImageUrl(publicIdOrPath) {
  if (!publicIdOrPath) return null;
  const publicId = String(publicIdOrPath).trim().replace(/\.(jpe?g|png|gif|webp)$/i, "");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
}

/**
 * Resolve document url/path fields to an absolute URL safe for window.open / href.
 */
export function resolveDocumentOpenUrl(docOrUrl) {
  const isPdf =
    typeof docOrUrl === "object" &&
    docOrUrl &&
    (docOrUrl.isPdf === true ||
      docOrUrl.type === "application/pdf" ||
      docOrUrl.mimeType === "application/pdf" ||
      /\.pdf$/i.test(String(docOrUrl.fileName || docOrUrl.name || "")));

  const candidates =
    typeof docOrUrl === "string"
      ? [docOrUrl]
      : [
          docOrUrl?.downloadUrl,
          docOrUrl?.url,
          docOrUrl?.preview,
          docOrUrl?.pdfUrl,
          docOrUrl?.path,
          docOrUrl?.fileUrl,
        ].filter(Boolean);

  for (const candidate of candidates) {
    const value = String(candidate).trim();
    if (!value) continue;
    if (isAbsoluteUrl(value)) return value;
    if (isCloudinaryPath(value)) {
      return isPdf ? buildCloudinaryPdfUrl(value) : buildCloudinaryImageUrl(value);
    }
  }

  return null;
}
