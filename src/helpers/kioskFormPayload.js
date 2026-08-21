/**
 * Build a kiosk form JSON body that won't trip proxy 413 limits.
 *
 * Document photos were previously sent twice (documentScans + uploadedDocuments)
 * as base64, so a ~350KB JPEG became ~1MB+ and hit common 1MB nginx limits.
 */

function mapScanForComplete(scan) {
  if (!scan || typeof scan !== "object") return null;
  const out = {
    id: scan.id,
    name: scan.name,
    type: scan.type,
    size: scan.size,
  };
  if (scan.existingDocumentId) out.existingDocumentId = scan.existingDocumentId;
  if (scan.url) out.url = scan.url;
  if (scan.dataUrl && String(scan.dataUrl).startsWith("data:")) {
    out.dataUrl = scan.dataUrl;
  }
  return out;
}

function mapScanForAutosave(scan) {
  if (!scan?.existingDocumentId || scan?.dataUrl) return null;
  return {
    id: scan.id,
    existingDocumentId: scan.existingDocumentId,
    name: scan.name,
    type: scan.type,
    size: scan.size,
    url: scan.url,
  };
}

/**
 * @param {object} formData
 * @param {{ includeDocumentScans?: boolean }} [options]
 *   includeDocumentScans=true for final save/complete (sends dataUrls once)
 *   includeDocumentScans=false for autosave (metadata / existing refs only)
 */
export function sanitizeKioskFormPayload(formData, options = {}) {
  const includeDocumentScans = options.includeDocumentScans === true;
  const {
    documentScans,
    uploadedDocuments: _uploaded,
    ...rest
  } = formData || {};

  const scans = Array.isArray(documentScans) ? documentScans : [];
  const payload = {
    ...rest,
    documentScans: includeDocumentScans
      ? scans.map(mapScanForComplete).filter(Boolean)
      : scans.map(mapScanForAutosave).filter(Boolean),
  };

  // Never send the legacy duplicate field — backend only reads documentScans.
  delete payload.uploadedDocuments;

  return payload;
}
