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

const MINOR_FILE_KINDS = {
  guardian_statement: "oswiadczenie-opiekun",
  consent_examination: "zgoda-swiadczenie-minor",
  consent_personal_data: "zgoda-rodo-minor",
  auth_health_status: "upowaznienie-minor",
};

const ADULT_FILE_KINDS = {
  consent_examination: "zgoda-swiadczenie",
  consent_personal_data: "zgoda-rodo",
  auth_health_status: "upowaznienie",
};

const ENGLISH_FILE_STEM =
  /^(registration_bundle|auth_health_status|consent_personal_data|consent_examination|guardian_statement)(?:-v\d+)?$/i;

function inferPatientFileSlug(documents = []) {
  for (const d of documents) {
    const candidates = [d.fileName, d.name, d.kioskDocNumber, d.docNumber];
    for (const raw of candidates) {
      const value = String(raw || "");
      const bundle = value.match(/^(\d{11})-dokumenty-rejestracyjne/i);
      if (bundle) return bundle[1];
      const polish = value.match(
        /(?:oswiadczenie-opiekun|zgoda-swiadczenie(?:-minor)?|zgoda-rodo(?:-minor)?|upowaznienie(?:-minor)?)-(\d{11})(?:-v\d+)?/i
      );
      if (polish) return polish[1];
    }
  }
  return "";
}

function polishEnglishDocTitle(doc, { fileSlug, isMinor } = {}) {
  const stem = String(doc?.fileName || doc?.name || "").replace(/\.pdf$/i, "");
  if (!ENGLISH_FILE_STEM.test(stem)) return null;
  const type = String(doc?.documentType || stem.replace(/-v\d+$/i, ""));
  const versionMatch = String(doc?.kioskDocNumber || doc?.docNumber || stem).match(
    /(?:-v-?| v| - )(\d+)\s*$/i
  );
  const versionFromMeta = Number(doc?.metadata?.versionNumber);
  const version =
    Number.isFinite(versionFromMeta) && versionFromMeta > 0
      ? versionFromMeta
      : versionMatch
        ? Number(versionMatch[1])
        : 1;
  const slug = fileSlug || "patient";
  if (type === "registration_bundle") {
    const fromNr = String(doc?.kioskDocNumber || doc?.docNumber || "")
      .trim()
      .replace(/\s+/g, "-");
    if (fromNr) return fromNr.replace(/\.pdf$/i, "");
    return `${slug}-dokumenty-rejestracyjne-v${version}`;
  }
  const kinds = isMinor ? MINOR_FILE_KINDS : ADULT_FILE_KINDS;
  const kind = kinds[type];
  if (!kind) return null;
  return `${kind}-${slug}-v${version}`;
}

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

function getDocTitle(doc, { fileSlug, isMinor } = {}) {
  const polished = polishEnglishDocTitle(doc, { fileSlug, isMinor });
  if (polished) return polished;

  const raw = doc?.fileName || doc?.name || "";
  let title = String(raw).replace(/\.[^.]+$/, "") || String(raw);
  if (!title) {
    if (doc?.documentType && DOC_TYPE_LABELS[doc.documentType]) {
      title = DOC_TYPE_LABELS[doc.documentType];
    } else if (doc?.documentType) {
      title = doc.documentType;
    } else {
      title = "Dokument";
    }
  }

  const versionFromMeta = Number(doc?.metadata?.versionNumber);
  const versionFromNr = String(doc?.kioskDocNumber || doc?.docNumber || "").match(
    /(?:-v-?| v| - )(\d+)\s*$/i
  );
  const version = Number.isFinite(versionFromMeta) && versionFromMeta > 0
    ? versionFromMeta
    : versionFromNr
      ? Number(versionFromNr[1])
      : NaN;
  const alreadyVersioned =
    /(?:-v-?|_v)\d+$/i.test(title) || /dokumenty-rejestracyjne-v\d+/i.test(title);
  if (Number.isFinite(version) && version > 0 && !alreadyVersioned) {
    title = `${title}-v${version}`;
  }
  return title;
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

  const fileSlug = inferPatientFileSlug(documents);
  const isMinor = documents.some(
    (d) =>
      d.documentType === "guardian_statement" ||
      /oswiadczenie-opiekun|zgoda-swiadczenie-minor|zgoda-rodo-minor|upowaznienie-minor/i.test(
        String(d.fileName || d.name || "")
      )
  );

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
                const title = getDocTitle(doc, { fileSlug, isMinor });
                const dateLabel = formatDocDate(doc.uploadDate || doc.signedAt || doc.createdAt);
                const typeLabel =
                  DOC_TYPE_LABELS[doc.documentType] ||
                  (doc.source === "registration" ? "Rejestracja" : null);
                const docNumber =
                  doc.docNumber ||
                  doc.kioskDocNumber ||
                  doc.metadata?.docNumber ||
                  "";

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
                        {docNumber ? (
                          <p className="text-xs text-gray-700 mt-0.5 truncate">Nr: {docNumber}</p>
                        ) : null}
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
