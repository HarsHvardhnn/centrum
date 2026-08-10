import { useEffect, useState } from "react";
import { FileText, FolderOpen, Image as ImageIcon, X } from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import { resolveDocumentOpenUrl } from "../../utils/documentUrl";

const DOC_TYPE_LABELS = {
  consent_personal_data: "Zgoda RODO",
  consent_examination: "Zgoda na badanie",
  auth_health_status: "Upoważnienie",
  auth_medical_docs: "Upoważnienie do dokumentacji",
  guardian_statement: "Oświadczenie opiekuna",
  registration_bundle: "Pakiet rejestracyjny",
};

function formatDocDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getDocTitle(doc) {
  if (doc?.fileName) return String(doc.fileName).replace(/\.[^.]+$/, "") || doc.fileName;
  if (doc?.name) return doc.name;
  if (doc?.documentType && DOC_TYPE_LABELS[doc.documentType]) {
    return DOC_TYPE_LABELS[doc.documentType];
  }
  if (doc?.documentType) return doc.documentType;
  return "Dokument";
}

function isPdfDoc(doc) {
  return (
    doc?.isPdf === true ||
    doc?.type === "application/pdf" ||
    doc?.mimeType === "application/pdf" ||
    /\.pdf$/i.test(String(doc?.fileName || doc?.name || "")) ||
    doc?.source === "registration"
  );
}

/**
 * Modal listing all documents linked to a patient (uploads + registration PDFs).
 */
export default function PatientDocumentsModal({
  isOpen,
  onClose,
  patientId,
  patientName = "Pacjent",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [resolvedName, setResolvedName] = useState(patientName);

  useEffect(() => {
    if (!isOpen || !patientId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDocuments([]);
    setResolvedName(patientName || "Pacjent");

    apiCaller("GET", `/patients/${patientId}/documents?limit=200`)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data ?? res;
        const docs = Array.isArray(payload?.documents) ? payload.documents : [];
        setDocuments(docs);
        const p = payload?.patient;
        if (p?.name?.first || p?.name?.last) {
          setResolvedName(`${p.name.first || ""} ${p.name.last || ""}`.trim());
        }
        if (payload?.success === false) {
          setError(payload?.message || "Nie udało się pobrać dokumentów.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Nie udało się pobrać dokumentów."
        );
        setDocuments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, patientId, patientName]);

  if (!isOpen) return null;

  const openDoc = (doc) => {
    const url = resolveDocumentOpenUrl(doc);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-teal-700 shrink-0" />
              Dokumenty pacjenta
            </h3>
            <p className="text-sm text-gray-500 truncate">{resolvedName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Ładowanie dokumentów…</div>
          ) : error ? (
            <div className="py-4 text-sm text-red-600">{error}</div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Brak dokumentów powiązanych z tym pacjentem.
            </div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc, index) => {
                const url = resolveDocumentOpenUrl(doc);
                const pdf = isPdfDoc(doc);
                const title = getDocTitle(doc);
                const dateLabel = formatDocDate(doc.uploadDate || doc.signedAt || doc.createdAt);
                const typeLabel =
                  DOC_TYPE_LABELS[doc.documentType] ||
                  (doc.source === "registration" ? "Rejestracja" : null);

                return (
                  <li key={doc._id || doc.id || `doc-${index}`}>
                    <button
                      type="button"
                      disabled={!url}
                      onClick={() => openDoc(doc)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        url
                          ? "border-gray-200 hover:bg-teal-50/60 hover:border-teal-200 cursor-pointer"
                          : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          pdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {pdf ? <FileText size={22} /> : <ImageIcon size={22} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[typeLabel, dateLabel, url ? "Otwórz" : "Brak pliku"]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
