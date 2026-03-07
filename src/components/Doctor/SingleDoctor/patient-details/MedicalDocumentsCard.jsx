import React, { useState } from "react";
import { CloudUpload, ChevronDown, X } from "lucide-react";
import { apiCaller } from "../../../../utils/axiosInstance";
import { toast } from "sonner";

const DOC_TYPES = [
  "Wynik badania laboratoryjnego",
  "Wynik histopatologiczny",
  "Opis badania obrazowego (USG / RTG / TK / MR)",
  "Zlecenie badania",
  "Dokument z konsultacji",
  "Dokument zabiegu / procedury",
  "Zalecenia medyczne",
  "Recepta / informacja o leczeniu",
  "Inny dokument medyczny",
];

const MedicalDocumentsCard = ({ appointmentId, onSuccess }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Wybierz typ...");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
    e.target.value = "";
  };

  const validateAndSetFile = (f) => {
    if (f.size > 10 * 1024 * 1024) {
      setError("Rozmiar pliku przekracza limit 10MB");
      return;
    }
    const accepted = ["image/jpeg", "image/png", "application/pdf"];
    if (!accepted.includes(f.type)) {
      setError("Dozwolone: PDF, JPG, PNG");
      return;
    }
    setFile(f);
    setError("");
    if (!reportName) setReportName(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !appointmentId) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", reportName || file.name);
    formData.append("type", reportType === "Wybierz typ..." ? DOC_TYPES[0] : reportType);
    formData.append("description", description);
    try {
      await apiCaller("POST", `/appointments/rep/${appointmentId}/upload-report`, formData, true);
      setFile(null);
      setReportName("");
      setReportType("Wybierz typ...");
      setDescription("");
      toast.success("Dokument przesłany");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Błąd przesyłania");
      toast.error("Nie udało się przesłać dokumentu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h3 className="text-base font-semibold text-gray-800">Dokumenty medyczne</h3>
        <ChevronDown size={18} className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>
      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa dokumentu</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Nazwa dokumentu..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 appearance-none pr-8"
              >
                <option>Wybierz typ...</option>
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis badania</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Krótki komentarz do wgranego dokumentu/wyniku..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-y"
              />
            </div>
            <div className="relative">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-colors min-h-[120px] ${dragOver ? "border-teal-400 bg-teal-50/30" : "border-gray-300 bg-white"}`}
              >
                <CloudUpload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Przeciągnij plik lub kliknij</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG (max 10MB)</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="p-1 rounded hover:bg-gray-100">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 text-sm font-medium"
            >
              {uploading ? "Przesyłanie..." : "Dodaj dokument"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentsCard;
