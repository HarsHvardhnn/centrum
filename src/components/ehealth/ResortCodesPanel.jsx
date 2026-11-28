import React, { useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { apiCaller, axiosInstance } from "../../utils/axiosInstance";
import { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { refreshResortCodes, useResortCodes } from "./resortCodes";

/** Administrator: download the unit-code list, or replace it with a new CSV file (no program change needed). */
export default function ResortCodesPanel() {
  const { rows, versionDate, error } = useResortCodes();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    try {
      const res = await axiosInstance.get("/api/ehealth/admin/resort-codes/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "kody-komorek-cz-VIII.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !window.confirm(`Zastąpić cały wykaz kodów zawartością pliku „${file.name}”?`)) return;
    const form = new FormData();
    form.append("file", file);
    try {
      setBusy(true);
      const res = await apiCaller("POST", "/api/ehealth/admin/resort-codes/import", form, true);
      const data = res.data?.data || {};
      await refreshResortCodes();
      toast.success(`Wgrano ${data.count} kodów (usunięto ${data.removed}).`);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Kody komórek organizacyjnych (cz. VIII)</h3>
      <p className="mt-1 text-xs text-gray-600">
        {error || `${rows.length} kodów w wykazie${versionDate ? `, wersja z ${versionDate}` : ""}.`} Aby zaktualizować: pobierz plik, popraw go w arkuszu, zapisz jako „CSV UTF-8” i wgraj. Kolumny: code; name; types; hidden; source; version_date.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
          <Download size={14} /> Pobierz CSV
        </button>
        <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white ${busy ? "pointer-events-none opacity-60" : ""}`}>
          <Upload size={14} /> {busy ? "Wgrywam…" : "Wgraj nową listę"}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={upload} />
        </label>
      </div>
    </section>
  );
}
