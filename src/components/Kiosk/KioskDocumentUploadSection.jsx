import { useRef } from "react";
import { Camera, FolderOpen, ImagePlus } from "lucide-react";

const MAX_SCANS = 3;
const MAX_BYTES = 10 * 1024 * 1024;

export default function KioskDocumentUploadSection({ scans = [], onChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const next = [...scans];
    for (const file of files) {
      if (next.length >= MAX_SCANS) break;
      if (file.size > MAX_BYTES) continue;
      const dataUrl = await readFileAsDataUrl(file);
      next.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        dataUrl,
      });
    }
    onChange(next);
  };

  const removeScan = (id) => onChange(scans.filter((s) => s.id !== id));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-6">
      <h4 className="text-base font-bold text-gray-900 mb-1">
        Wgraj skan dokumentu / Zrób zdjęcie
      </h4>
      <p className="text-sm text-gray-600 mb-4">
        Opcjonalnie: dodaj skany lub zdjęcia dokumentów tożsamości, upoważnień lub innej
        dokumentacji medycznej.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 text-sm font-medium"
        >
          <Camera size={18} />
          Otwórz aparat
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
        >
          <FolderOpen size={18} />
          Przeglądaj pliki
        </button>
        <span className="text-sm text-gray-500 self-center">Liczba zdjęć: {scans.length}</span>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: MAX_SCANS }).map((_, index) => {
          const scan = scans[index];
          return (
            <div
              key={scan?.id || `slot-${index}`}
              className="border-2 border-dashed border-gray-200 rounded-xl min-h-[120px] flex flex-col items-center justify-center p-3 bg-gray-50 relative"
            >
              {scan ? (
                <>
                  {scan.type?.startsWith("image/") ? (
                    <img src={scan.dataUrl} alt={scan.name} className="max-h-24 object-contain" />
                  ) : (
                    <p className="text-xs text-gray-600 text-center break-all">{scan.name}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => removeScan(scan.id)}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Usuń
                  </button>
                </>
              ) : (
                <>
                  <ImagePlus className="text-gray-300 mb-2" size={28} />
                  <span className="text-xs text-gray-400">Slot {index + 1}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">Obsługiwane formaty: JPG, PNG, PDF (max. 10MB)</p>
    </div>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
