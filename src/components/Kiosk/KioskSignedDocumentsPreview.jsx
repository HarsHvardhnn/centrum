import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import { getKioskSessionDocuments } from "../../helpers/kioskHelper";
import { resolveDocumentOpenUrl } from "../../utils/documentUrl";

export default function KioskSignedDocumentsPreview({ onClose }) {
  const [status, setStatus] = useState("processing");
  const [documents, setDocuments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      attempts += 1;
      try {
        const res = await getKioskSessionDocuments();
        if (cancelled) return;
        const nextStatus = res.status || "processing";
        setStatus(nextStatus);
        setErrorMessage(res.errorMessage || "");
        const docs = Array.isArray(res.documents) ? res.documents : [];
        setDocuments(docs);
        if (nextStatus === "completed" || nextStatus === "failed" || attempts >= 45) {
          return true;
        }
      } catch (err) {
        if (cancelled) return;
        if (attempts >= 8) {
          setStatus("failed");
          setErrorMessage(err.response?.data?.message || "Nie udało się pobrać dokumentów.");
          return true;
        }
      }
      return false;
    };

    const tick = async () => {
      const done = await load();
      if (!cancelled && !done) {
        timer = setTimeout(tick, 2000);
      }
    };

    let timer = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const openPreview = (doc) => {
    const url = resolveDocumentOpenUrl(doc) || doc?.pdfUrl;
    if (!url) return;
    setPreviewTitle(doc.label || doc.fileName || "Dokument");
    setPreviewUrl(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 w-full">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Rejestracja zakończona</h2>
      <p className="text-gray-600 text-center mb-6">
        Poniżej możesz otworzyć podpisane dokumenty. Potem oddaj urządzenie pracownikowi rejestracji.
      </p>

      {status !== "completed" && status !== "failed" && (
        <p className="text-center text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 mb-5">
          Przygotowujemy podpisane dokumenty PDF…
        </p>
      )}
      {status === "failed" && (
        <p className="text-center text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          {errorMessage || "Nie udało się wygenerować dokumentów. Recepcja może pobrać je z panelu."}
        </p>
      )}

      {documents.length > 0 && (
        <ul className="space-y-3 mb-6">
          {documents.map((doc, index) => (
            <li key={`${doc.documentType || "doc"}-${index}`}>
              <button
                type="button"
                onClick={() => openPreview(doc)}
                className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-teal-700 shrink-0" />
                <span className="font-medium text-gray-900">
                  {doc.label || doc.fileName || "Dokument PDF"}
                </span>
                <span className="ml-auto text-sm text-teal-700">Podgląd</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto mx-auto block px-6 py-3 rounded-xl bg-teal-700 text-white font-medium hover:bg-teal-800"
      >
        Zamknij
      </button>

      {previewUrl && (
        <div className="fixed inset-0 z-[80] bg-black/60 p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 truncate">{previewTitle}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-700 hover:underline"
                >
                  Otwórz w nowym oknie
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewUrl("")}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Zamknij podgląd"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe title={previewTitle} src={previewUrl} className="flex-1 w-full bg-gray-100" />
          </div>
        </div>
      )}
    </div>
  );
}
