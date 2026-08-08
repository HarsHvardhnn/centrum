const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.72;

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Compress an image File/Blob for kiosk upload. Returns JPEG data URL + approx size.
 * Non-images are returned as raw data URLs without transformation.
 */
export async function compressImageFile(file, options = {}) {
  const maxDimension = options.maxDimension || MAX_DIMENSION;
  const quality = options.quality ?? JPEG_QUALITY;

  if (!file?.type?.startsWith("image/") && file?.type) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      type: file.type || "application/octet-stream",
      size: file.size || 0,
      name: file.name || "plik",
    };
  }

  let width;
  let height;
  let drawable;

  if (typeof createImageBitmap === "function") {
    try {
      drawable = await createImageBitmap(file);
      width = drawable.width;
      height = drawable.height;
    } catch {
      drawable = null;
    }
  }

  if (!drawable) {
    drawable = await loadImageElement(file);
    width = drawable.naturalWidth || drawable.width;
    height = drawable.naturalHeight || drawable.height;
  }

  try {
    const scale = Math.min(1, maxDimension / Math.max(width, height, 1));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(drawable, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const size = Math.round((dataUrl.length * 3) / 4);

    return {
      dataUrl,
      type: "image/jpeg",
      size,
      name: (file.name || "photo").replace(/\.\w+$/, "") + ".jpg",
    };
  } finally {
    drawable.close?.();
  }
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
