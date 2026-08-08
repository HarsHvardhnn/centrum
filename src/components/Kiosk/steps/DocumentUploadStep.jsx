import { useEffect, useId, useState } from "react";
import { Camera, Upload, X, FileImage, Plus } from "lucide-react";
import { compressImageFile, readFileAsDataUrl } from "../utils/compressImage";

const MAX_FILES = 15;
const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];

/** Normalize legacy uploadedDocuments or documentScans into backend-ready scans */
function normalizeInitialScans(formData) {
  const fromScans = Array.isArray(formData.documentScans) ? formData.documentScans : [];
  if (fromScans.length) {
    return fromScans
      .filter((s) => s?.dataUrl)
      .map((s) => ({
        id: s.id || `${Date.now()}-${s.name || "scan"}`,
        name: s.name || "skan",
        size: s.size,
        type: s.type || "image/jpeg",
        dataUrl: s.dataUrl,
        preview: s.type?.startsWith("image/") ? s.dataUrl : null,
      }));
  }

  const legacy = Array.isArray(formData.uploadedDocuments) ? formData.uploadedDocuments : [];
  return legacy
    .filter((s) => s?.preview || s?.dataUrl)
    .map((s) => ({
      id: s.id || `${Date.now()}-${s.name || "scan"}`,
      name: s.name || "skan",
      size: s.size,
      type: s.type || "image/jpeg",
      dataUrl: s.dataUrl || s.preview,
      preview: (s.type || "").startsWith("image/") ? s.dataUrl || s.preview : null,
    }));
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUploadStep({
  formData = {},
  updateFormData,
  onValidationChange,
}) {
  const [uploadedFiles, setUploadedFiles] = useState(() => normalizeInitialScans(formData));
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const cameraInputId = useId();
  const fileInputId = useId();

  // Persist as documentScans (dataUrl) — backend merges them into the package PDF
  useEffect(() => {
    const documentScans = uploadedFiles.map(({ id, name, type, dataUrl, size }) => ({
      id,
      name,
      type,
      dataUrl,
      size,
    }));
    updateFormData({ documentScans, uploadedDocuments: documentScans });
  }, [uploadedFiles]);

  useEffect(() => {
    onValidationChange?.({ isValid: true, errors: [] });
  }, [onValidationChange]);

  const addFiles = async (fileList, { fromCamera = false } = {}) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setBusy(true);
    setStatusMessage(fromCamera ? "Zapisywanie zdjęcia…" : "Przetwarzanie plików…");

    try {
      const additions = [];
      let skippedFormat = false;
      let skippedSize = false;

      for (const file of files) {
        if (additions.length >= MAX_FILES) break;

        const typeOk =
          ALLOWED_TYPES.includes(file.type) ||
          (file.type || "").startsWith("image/") ||
          /\.(jpe?g|png|webp|pdf|heic|heif)$/i.test(file.name || "");

        if (!typeOk) {
          skippedFormat = true;
          continue;
        }

        if (file.size > MAX_BYTES) {
          skippedSize = true;
          continue;
        }

        let processed;
        if (file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")) {
          const dataUrl = await readFileAsDataUrl(file);
          processed = {
            dataUrl,
            type: "application/pdf",
            size: file.size,
            name: file.name || `dokument-${Date.now()}.pdf`,
          };
        } else {
          processed = await compressImageFile(file);
        }

        additions.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: processed.name,
          size: processed.size,
          type: processed.type,
          dataUrl: processed.dataUrl,
          preview: processed.type.startsWith("image/") ? processed.dataUrl : null,
          uploadedAt: new Date().toISOString(),
        });
      }

      if (additions.length) {
        setUploadedFiles((prev) => {
          const room = Math.max(0, MAX_FILES - prev.length);
          if (room === 0) return prev;
          return [...prev, ...additions.slice(0, room)];
        });
        setStatusMessage(
          fromCamera
            ? "Zdjęcie dodane. Kliknij „Kolejne zdjęcie”, aby dodać następną stronę."
            : `Dodano ${additions.length} plik(ów).`
        );
      } else if (skippedSize) {
        setStatusMessage("Pominięto zbyt duży plik (max 12 MB przed kompresją).");
      } else if (skippedFormat) {
        setStatusMessage("Pominięto nieobsługiwany format. Dozwolone: JPG, PNG, WEBP, PDF.");
      }
    } catch (err) {
      console.error("Failed to process document files:", err);
      setStatusMessage("Nie udało się przetworzyć pliku. Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const totalSize = uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Wgraj skan dokumentu / Zrób zdjęcie
        </h3>
        <p className="text-gray-600">
          <strong>Opcjonalnie:</strong> zrób zdjęcia stron dokumentów — po każdym zdjęciu dodaj kolejne
          jednym kliknięciem. System skompresuje je i dołączy do pakietu PDF.
        </p>
      </div>

      {/* Native inputs — labels (not programmatic .click) so iPad Safari accepts the gesture */}
      <input
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy || uploadedFiles.length >= MAX_FILES}
        onChange={async (e) => {
          const files = e.target.files;
          await addFiles(files, { fromCamera: true });
          e.target.value = "";
        }}
      />
      <input
        id={fileInputId}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
        className="sr-only"
        disabled={busy || uploadedFiles.length >= MAX_FILES}
        onChange={async (e) => {
          await addFiles(e.target.files, { fromCamera: false });
          e.target.value = "";
        }}
      />

      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <label
            htmlFor={cameraInputId}
            className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white text-base font-semibold select-none touch-manipulation ${
              busy || uploadedFiles.length >= MAX_FILES
                ? "bg-teal-400 cursor-not-allowed pointer-events-none"
                : "bg-teal-700 active:bg-teal-900 cursor-pointer"
            }`}
          >
            <Camera size={22} />
            {uploadedFiles.length === 0 ? "Zrób zdjęcie" : "Kolejne zdjęcie"}
          </label>

          <label
            htmlFor={fileInputId}
            className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white text-base font-semibold select-none touch-manipulation ${
              busy || uploadedFiles.length >= MAX_FILES
                ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-gray-700 active:bg-gray-900 cursor-pointer"
            }`}
          >
            <Upload size={22} />
            Wybierz pliki
          </label>
        </div>

        {uploadedFiles.length > 0 && uploadedFiles.length < MAX_FILES && (
          <p className="text-center text-sm text-teal-900 mt-4 font-medium">
            Gotowe? Kliknij <strong>Kolejne zdjęcie</strong>, aby od razu dodać następną stronę.
          </p>
        )}
      </div>

      {statusMessage && (
        <p className="text-sm text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {busy ? "…" : ""} {statusMessage}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <p className="font-medium text-gray-900">
              Liczba stron: {uploadedFiles.length}
              {uploadedFiles.length > 0 && (
                <span className="text-gray-500 font-normal"> · ~{formatFileSize(totalSize)}</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Zdjęcia są kompresowane i dołączane do końcowego PDF rejestracji.
            </p>
          </div>
          {uploadedFiles.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setUploadedFiles([]);
                setStatusMessage("Usunięto wszystkie zdjęcia.");
              }}
              className="text-red-600 hover:text-red-700 text-sm shrink-0 touch-manipulation"
            >
              Usuń wszystkie
            </button>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center text-gray-400">
            <Camera size={36} className="mb-2" />
            <p className="text-sm">Brak zdjęć — ten krok możesz pominąć</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className="relative border border-gray-200 rounded-lg p-2 bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1.5 touch-manipulation"
                  aria-label="Usuń"
                >
                  <X size={14} />
                </button>
                <p className="text-[11px] font-medium text-gray-500 mb-1">Strona {index + 1}</p>
                {file.preview || (file.type || "").startsWith("image/") ? (
                  <img
                    src={file.preview || file.dataUrl}
                    alt={file.name}
                    className="w-full h-28 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-200 rounded flex items-center justify-center">
                    <FileImage size={28} className="text-gray-400" />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 truncate">{formatFileSize(file.size)}</p>
              </div>
            ))}

            {uploadedFiles.length < MAX_FILES && (
              <label
                htmlFor={cameraInputId}
                className="border-2 border-dashed border-teal-300 rounded-lg min-h-[8.5rem] flex flex-col items-center justify-center text-teal-800 bg-teal-50/50 cursor-pointer touch-manipulation active:bg-teal-100"
              >
                <Plus size={28} className="mb-1" />
                <span className="text-sm font-semibold">Kolejne zdjęcie</span>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Ten krok jest opcjonalny. Możesz pominąć przesyłanie dokumentów i przejść dalej, lub dodać
          je później podczas wizyty w placówce.
        </p>
      </div>
    </div>
  );
}
