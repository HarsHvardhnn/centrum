import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";

const TYPES = [
  "Wynik badania laboratoryjnego",
  "Wynik histopatologiczny",
  "Opis badania obrazowego (USG / RTG / TK / MR)",
  "Zlecenie badania",
  "Dokument z konsultacji",
  "Inny dokument medyczny",
];

const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;

function fileTitle(file) {
  return file.name.replace(/\.[^.]+$/, "");
}

function addedLabel(count) {
  if (count === 1) return "Plik dodany do wizyty. Status wizyty bez zmian.";
  const mod10 = count % 10;
  const mod100 = count % 100;
  const noun = mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "pliki" : "plików";
  return `Dodano ${count} ${noun} do wizyty. Status wizyty bez zmian.`;
}

export default function AttachVisitFileModal({ isOpen, appointmentId, patientName, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setType(TYPES[0]);
    setDescription("");
    setFiles([]);
    setDragOver(false);
  }, [isOpen, appointmentId]);

  if (!isOpen) return null;

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const accepted = [];
    incoming.forEach((file) => {
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} jest większy niż 10 MB`);
        return;
      }
      accepted.push(file);
    });
    setFiles((current) => {
      const room = MAX_FILES - current.length;
      if (accepted.length > room) {
        toast.error(`Można dodać najwyżej ${MAX_FILES} plików naraz.`);
      }
      const next = [...current, ...accepted.slice(0, Math.max(room, 0))];
      if (current.length === 0 && next.length === 1 && !name) {
        setName(fileTitle(next[0]));
      }
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!appointmentId || !files.length) return;
    setBusy(true);
    let added = 0;
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("name", files.length === 1 ? (name.trim() || file.name) : file.name);
        body.append("type", type);
        body.append("description", description);
        await apiCaller("POST", `/appointments/rep/${appointmentId}/upload-report`, body, true);
        added += 1;
      }
      toast.success(addedLabel(added));
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Nie udało się dodać pliku");
      if (added > 0) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Dodaj plik do wizyty</h3>
            <p className="text-xs text-slate-500 mt-1">
              {patientName ? `${patientName}. ` : ""}Plik zobaczy lekarz tej wizyty. Status wizyty się nie zmienia.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Zamknij"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm">Nazwa
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={files.length > 1}
              placeholder={files.length > 1 ? "Przy kilku plikach używana jest nazwa każdego pliku" : ""}
              className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-slate-50"
            />
          </label>
          <label className="block text-sm">Typ
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
              {TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm">Opis
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </label>
          <div
            onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              addFiles(event.dataTransfer?.files);
            }}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center ${dragOver ? "border-teal-500 bg-teal-50" : "border-slate-300"}`}
          >
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-700">Kliknij, aby wybrać pliki, albo przeciągnij je tutaj</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG lub PNG, do 10 MB każdy. Można dodać kilka plików naraz.</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Usuń ${file.name}`}
                    onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 border rounded-lg">Anuluj</button>
          <button type="submit" disabled={busy || !files.length} className="px-4 py-2 rounded-lg bg-[#1b766a] text-white font-semibold disabled:opacity-60">
            {busy ? "Wysyłanie..." : files.length > 1 ? `Dodaj pliki (${files.length})` : "Dodaj plik"}
          </button>
        </div>
      </form>
    </div>
  );
}
