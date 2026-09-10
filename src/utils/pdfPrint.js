/**
 * Open / print a PDF URL the same way invoices do (blob + iframe print).
 */

async function fetchPdfBlob(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Nie udało się pobrać PDF (${res.status})`);
  }
  return res.blob();
}

export async function openPdfUrl(url) {
  if (!url) return;
  const blob = await fetchPdfBlob(url);
  const objectUrl = URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" })
  );
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function printPdfFromUrl(url) {
  if (!url) return;
  const blob = await fetchPdfBlob(url);
  const objectUrl = URL.createObjectURL(
    new Blob([blob], { type: "application/pdf" })
  );
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
