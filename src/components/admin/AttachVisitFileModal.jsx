import { useState } from "react";
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

export default function AttachVisitFileModal({ isOpen, appointmentId, patientName, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!appointmentId || !file) return;
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    body.append("name", name || file.name);
    body.append("type", type);
    body.append("description", description);
    try {
      await apiCaller("POST", `/appointments/rep/${appointmentId}/upload-report`, body, true);
      toast.success("Plik dodany do wizyty. Status wizyty bez zmian.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się dodać pliku");
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
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">Typ
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
              {TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm">Opis
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm border border-dashed rounded-lg px-3 py-3 cursor-pointer">
            <Upload size={16} />
            <span className="truncate">{file ? file.name : "PDF, JPG lub PNG, do 10 MB"}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(event) => {
                const next = event.target.files?.[0];
                if (!next) return;
                if (next.size > 10 * 1024 * 1024) {
                  toast.error("Plik jest większy niż 10 MB");
                  return;
                }
                setFile(next);
                if (!name) setName(next.name.replace(/\.[^.]+$/, ""));
              }}
            />
          </label>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 border rounded-lg">Anuluj</button>
          <button type="submit" disabled={busy || !file} className="px-4 py-2 rounded-lg bg-[#1b766a] text-white font-semibold disabled:opacity-60">
            {busy ? "Wysyłanie..." : "Dodaj plik"}
          </button>
        </div>
      </form>
    </div>
  );
}
