/**
 * Open / print a PDF URL (blob + hidden iframe), matching invoice print.
 * Cross-origin CDNs (Cloudinary) must be fetched without cookies:
 * they send Access-Control-Allow-Origin: *, which browsers reject with credentials.
 */

function shouldSendCredentials(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

async function fetchPdfBlob(url) {
  const res = await fetch(url, {
    credentials: shouldSendCredentials(url) ? "include" : "omit",
    mode: "cors",
  });
  if (!res.ok) {
    throw new Error(`Nie udało się pobrać PDF (${res.status})`);
  }
  return res.blob();
}

function printFromObjectUrl(objectUrl) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Druk PDF");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = objectUrl;
  document.body.appendChild(iframe);

  const cleanup = () => {
    iframe.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (_) {
      const fallback = window.open(objectUrl, "_blank");
      fallback?.print?.();
    }
  };

  iframe.addEventListener("load", () => {
    setTimeout(triggerPrint, 300);
  });
  setTimeout(triggerPrint, 1200);
  setTimeout(cleanup, 120_000);
}

function printViaNewTab(url) {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    throw new Error("Nie udało się otworzyć okna drukowania");
  }
  const tryPrint = () => {
    try {
      win.focus();
      win.print();
    } catch (_) {
      /* PDF viewer may still show; user can print from there */
    }
  };
  win.addEventListener?.("load", () => setTimeout(tryPrint, 400));
  setTimeout(tryPrint, 1500);
}

export async function openPdfUrl(url) {
  if (!url) return;
  try {
    const blob = await fetchPdfBlob(url);
    const objectUrl = URL.createObjectURL(
      new Blob([blob], { type: "application/pdf" })
    );
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export async function printPdfFromUrl(url) {
  if (!url) return;
  try {
    const blob = await fetchPdfBlob(url);
    const objectUrl = URL.createObjectURL(
      new Blob([blob], { type: "application/pdf" })
    );
    printFromObjectUrl(objectUrl);
  } catch {
    printViaNewTab(url);
  }
}
