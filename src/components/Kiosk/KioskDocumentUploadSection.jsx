import { useId, useState } from "react";
import { Camera, FolderOpen, Plus, X, FileImage } from "lucide-react";
import { compressImageFile, readFileAsDataUrl } from "./utils/compressImage";

const MAX_SCANS = 15;
const MAX_BYTES = 12 * 1024 * 1024;

export default function KioskDocumentUploadSection({ scans = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const cameraInputId = useId();
  const fileInputId = useId();

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setBusy(true);
    try {
      const next = [...scans];
      for (const file of files) {
        if (next.length >= MAX_SCANS) break;
        if (file.size > MAX_BYTES) continue;

        let processed;
        if (file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")) {
          const dataUrl = await readFileAsDataUrl(file);
          processed = {
            dataUrl,
            type: "application/pdf",
            size: file.size,
            name: file.name || `dokument-${Date.now()}.pdf`,
          };
        } else if (file.type?.startsWith("image/") || !file.type) {
          processed = await compressImageFile(file);
        } else {
          continue;
        }

        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: processed.name,
          type: processed.type,
          dataUrl: processed.dataUrl,
          size: processed.size,
        });
      }
      onChange(next.slice(0, MAX_SCANS));
    } finally {
      setBusy(false);
    }
  };

  const removeScan = (id) => onChange(scans.filter((s) => s.id !== id));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-6">
      <h4 className="text-base font-bold text-gray-900 mb-1">
        Wgraj skan dokumentu / Zrób zdjęcie
      </h4>
      <p className="text-sm text-gray-600 mb-4">
        Opcjonalnie: zrób zdjęcie, potem „Kolejne zdjęcie”. Pliki są kompresowane i dołączane do
        pakietu PDF.
      </p>

      <input
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy || scans.length >= MAX_SCANS}
        onChange={async (e) => {
          await addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
        multiple
        className="sr-only"
        disabled={busy || scans.length >= MAX_SCANS}
        onChange={async (e) => {
          await addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <label
          htmlFor={cameraInputId}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium touch-manipulation select-none ${
            busy || scans.length >= MAX_SCANS
              ? "bg-teal-400 pointer-events-none"
              : "bg-teal-700 active:bg-teal-900 cursor-pointer"
          }`}
        >
          <Camera size={18} />
          {scans.length === 0 ? "Zrób zdjęcie" : "Kolejne zdjęcie"}
        </label>
        <label
          htmlFor={fileInputId}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium touch-manipulation select-none ${
            busy || scans.length >= MAX_SCANS
              ? "opacity-50 pointer-events-none"
              : "active:bg-gray-100 cursor-pointer"
          }`}
        >
          <FolderOpen size={18} />
          Przeglądaj pliki
        </label>
        <span className="text-sm text-gray-500 self-center">Liczba stron: {scans.length}</span>
      </div>

      {scans.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {scans.map((scan, index) => (
            <div
              key={scan.id}
              className="relative border border-gray-200 rounded-xl p-2 bg-gray-50 min-h-[120px]"
            >
              <button
                type="button"
                onClick={() => removeScan(scan.id)}
                className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 touch-manipulation"
                aria-label="Usuń"
              >
                <X size={12} />
              </button>
              <p className="text-[11px] text-gray-500 mb-1">Strona {index + 1}</p>
              {scan.type?.startsWith("image/") ? (
                <img src={scan.dataUrl} alt={scan.name} className="max-h-24 w-full object-contain" />
              ) : (
                <div className="h-24 flex flex-col items-center justify-center text-gray-400">
                  <FileImage size={24} />
                  <p className="text-xs mt-1 text-center break-all px-1">{scan.name}</p>
                </div>
              )}
            </div>
          ))}
          {scans.length < MAX_SCANS && (
            <label
              htmlFor={cameraInputId}
              className="border-2 border-dashed border-teal-300 rounded-xl min-h-[120px] flex flex-col items-center justify-center text-teal-800 cursor-pointer touch-manipulation"
            >
              <Plus size={24} className="mb-1" />
              <span className="text-xs font-semibold">Kolejne zdjęcie</span>
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Obsługiwane: JPG, PNG, WEBP, PDF · max {MAX_SCANS} stron · kompresja automatyczna
      </p>
    </div>
  );
}
