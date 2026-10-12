import React, { useEffect, useState } from "react";
import { FileText, Plus, Eye, Printer, Pencil } from "lucide-react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../../../helpers/clinicDocumentsHelper";

function printDocument(doc, patient, doctorName) {
  const fields = doc.templateSnapshot?.fields || [];
  const rows = fields.map((field) => {
    const value = doc.values?.[field.key] || "—";
    return `<p><strong>${field.label}</strong><br/>${String(value).replace(/\n/g, "<br/>")}</p>`;
  }).join("");
  const html = `<!doctype html><html><head><title>${doc.templateSnapshot?.name || "Dokument"}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#111} h1{font-size:20px;margin-bottom:4px} .muted{color:#555;font-size:13px}</style>
    </head><body>
    <div class="muted">Centrum Medyczne 7</div>
    <h1>${doc.templateSnapshot?.name || "Dokument"}</h1>
    <p class="muted">${doc.documentNumber ? `Nr ${doc.documentNumber}` : "Szkic"} · ${patient?.name || ""} · PESEL ${patient?.pesel || "—"}</p>
    ${rows}
    <p class="muted" style="margin-top:40px">Wystawił: ${doctorName || doc.createdByName || ""}</p>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`;
  const popup = window.open("", "_blank");
  if (!popup) {
    toast.error("Przeglądarka zablokowała okno podglądu.");
    return;
  }
  popup.document.write(html);
  popup.document.close();
}

const VisitClinicDocuments = ({ visitId, patientId, patient, doctorName }) => {
  const [templates, setTemplates] = useState([]);
  const [docs, setDocs] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(null);

  const loadDocs = async () => {
    if (!visitId) return;
    try {
      setDocs(await clinicDocumentsHelper.listIssued(visitId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadDocs();
    clinicDocumentsHelper.listTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, [visitId]);

  const openNew = (template) => {
    const values = {};
    (template.fields || []).forEach((field) => { values[field.key] = ""; });
    setDraft({ template, values, existingId: null, status: "draft" });
    setPickerOpen(false);
  };

  const openExisting = (doc) => {
    setDraft({
      template: {
        _id: doc.templateId,
        name: doc.templateSnapshot?.name,
        code: doc.templateSnapshot?.code,
        fields: doc.templateSnapshot?.fields || [],
      },
      values: { ...(doc.values || {}) },
      existingId: doc._id,
      status: doc.status,
      documentNumber: doc.documentNumber,
      createdByName: doc.createdByName,
    });
  };

  const save = async (status) => {
    const missing = (draft.template.fields || []).filter((field) => field.required && !String(draft.values[field.key] || "").trim());
    if (status === "issued" && missing.length) {
      toast.error(`Uzupełnij: ${missing.map((field) => field.label).join(", ")}`);
      return;
    }
    try {
      if (draft.existingId) {
        await clinicDocumentsHelper.updateIssued(draft.existingId, { values: draft.values, status });
      } else {
        await clinicDocumentsHelper.createIssued({
          visitId,
          patientId,
          templateId: draft.template._id,
          values: draft.values,
          status,
          createdByName: doctorName,
        });
      }
      toast.success(status === "issued" ? "Dokument zatwierdzony" : "Zapisano szkic");
      setDraft(null);
      loadDocs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = templates.filter((row) => {
    const q = query.trim().toLowerCase();
    return !q || `${row.name} ${row.code} ${row.description}`.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <FileText size={16} className="text-teal-700" />
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Dokumenty z tej wizyty</h2>
          <p className="text-xs text-gray-500">Dokumenty utworzone podczas bieżącej wizyty, poza systemem P1.</p>
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <button type="button" onClick={() => setPickerOpen(true)} className="w-full h-10 rounded-lg bg-[#1b766a] text-white text-sm font-semibold inline-flex items-center justify-center gap-2">
          <Plus size={16} /> Wystaw dokument
        </button>
      </div>
      <div className="p-4 space-y-2">
        {docs.length === 0 && <p className="text-xs text-gray-400">Brak dokumentów tej wizyty.</p>}
        {docs.map((doc) => (
          <div key={doc._id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{doc.templateSnapshot?.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {doc.status === "issued"
                    ? `${new Date(doc.issuedAt || doc.updatedAt).toLocaleDateString("pl-PL")}${doc.documentNumber ? ` · Nr ${doc.documentNumber}` : ""}`
                    : `Ostatnia zmiana: ${new Date(doc.updatedAt).toLocaleDateString("pl-PL")}`}
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${doc.status === "issued" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                {doc.status === "issued" ? "Zatwierdzony" : "Szkic"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
              <button type="button" onClick={() => openExisting(doc)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                {doc.status === "issued" ? <Eye size={14} /> : <Pencil size={14} />}
                {doc.status === "issued" ? "Otwórz dokument" : "Kontynuuj edycję"}
              </button>
              <button type="button" onClick={() => printDocument(doc, patient, doctorName)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                <Printer size={14} /> Drukuj
              </button>
            </div>
          </div>
        ))}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Wystaw dokument</h3>
              <button type="button" onClick={() => setPickerOpen(false)}>×</button>
            </div>
            <div className="p-4">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj wzoru..." className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="overflow-y-auto px-4 pb-4 space-y-2">
              {filtered.length === 0 && <p className="text-sm text-gray-500">Brak wzorów przypisanych do tego lekarza.</p>}
              {filtered.map((template) => (
                <button key={template._id} type="button" onClick={() => openNew(template)} className="w-full text-left border rounded-lg p-3 hover:border-teal-400">
                  <div className="text-[11px] font-bold text-teal-700">[{template.code}]</div>
                  <div className="font-semibold text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-bold text-teal-700">[{draft.template.code}]</div>
                <h3 className="font-bold text-lg">{draft.template.name}</h3>
                {draft.documentNumber && <p className="text-xs text-gray-500">Nr {draft.documentNumber}</p>}
              </div>
              <button type="button" onClick={() => setDraft(null)}>×</button>
            </div>
            <p className="text-xs text-gray-500">{patient?.name} · PESEL {patient?.pesel || "—"}</p>
            {(draft.template.fields || []).map((field) => (
              <label key={field.key} className="block text-sm">
                {field.label}{field.required ? " *" : ""}
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    disabled={draft.status === "issued"}
                    value={draft.values[field.key] || ""}
                    onChange={(e) => setDraft({ ...draft, values: { ...draft.values, [field.key]: e.target.value } })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    disabled={draft.status === "issued"}
                    value={draft.values[field.key] || ""}
                    onChange={(e) => setDraft({ ...draft, values: { ...draft.values, [field.key]: e.target.value } })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2">
              {draft.status !== "issued" && (
                <>
                  <button type="button" onClick={() => save("draft")} className="px-4 py-2 border rounded-lg">Zapisz szkic</button>
                  <button type="button" onClick={() => save("issued")} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold">Zatwierdź</button>
                </>
              )}
              {draft.status === "issued" && (
                <button
                  type="button"
                  onClick={() => printDocument({ ...draft, templateSnapshot: draft.template, values: draft.values, documentNumber: draft.documentNumber }, patient, doctorName)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Drukuj
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitClinicDocuments;
