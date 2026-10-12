import React, { useEffect, useState } from "react";
import { FileText, Plus, Eye, Printer, Pencil } from "lucide-react";
import { toast } from "sonner";
import clinicDocumentsHelper from "../../../../helpers/clinicDocumentsHelper";
import ClinicDocumentSheet, { printClinicSheet } from "../../../ehealth/ClinicDocumentSheet";

function sheetProps(doc, patient, doctorName, doctorPwz) {
  const snapshot = doc.templateSnapshot || doc.template || {};
  return {
    title: snapshot.printTitle || snapshot.name,
    fields: snapshot.fields || [],
    values: doc.values || {},
    patient,
    doctorName: doctorName || doc.createdByName || "",
    doctorPwz,
    documentNumber: doc.documentNumber || "",
    status: doc.status || "draft",
  };
}

function visitHintFor(field, hints) {
  const label = `${field.key || ""} ${field.label || ""}`.toLowerCase();
  if (!hints) return "";
  if ((label.includes("rozpozn") || label.includes("icd")) && hints.diagnosis) return hints.diagnosis;
  if ((label.includes("zalecen") || label.includes("uwag")) && hints.recommendations) return hints.recommendations;
  return "";
}

const VisitClinicDocuments = ({ visitId, patientId, patient, doctorName, doctorPwz = "", visitHints = {} }) => {
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
        printTitle: doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name,
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
              <button type="button" onClick={() => {
                if (!printClinicSheet(sheetProps(doc, patient, doctorName, doctorPwz))) toast.error("Przeglądarka zablokowała okno podglądu.");
              }} className="inline-flex items-center gap-1 text-teal-700 font-medium">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3">
          <div className="bg-slate-100 rounded-2xl w-full max-w-[980px] h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-white px-5 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-teal-700">{draft.template.code ? `[${draft.template.code}]` : "Dokument"}</div>
                <h3 className="font-bold">{draft.template.printTitle || draft.template.name}</h3>
                <p className="text-xs text-slate-500">Pisz bezpośrednio na podglądzie. Wydruk pokazuje tę samą stronę.</p>
              </div>
              <button type="button" onClick={() => setDraft(null)} className="text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ClinicDocumentSheet
                mode={draft.status === "issued" ? "preview" : "fill"}
                title={draft.template.printTitle || draft.template.name}
                fields={draft.template.fields || []}
                values={draft.values}
                patient={patient}
                doctorName={doctorName}
                doctorPwz={doctorPwz}
                documentNumber={draft.documentNumber}
                status={draft.status}
                visitHint={(field) => visitHintFor(field, visitHints)}
                onChange={(key, value) => setDraft({ ...draft, values: { ...draft.values, [key]: value } })}
              />
            </div>
            <div className="bg-white px-5 py-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const ok = printClinicSheet(sheetProps({
                    templateSnapshot: draft.template,
                    values: draft.values,
                    documentNumber: draft.documentNumber,
                    status: draft.status,
                    createdByName: draft.createdByName,
                  }, patient, doctorName, doctorPwz));
                  if (!ok) toast.error("Przeglądarka zablokowała okno podglądu.");
                }}
                className="px-4 py-2 border rounded-lg inline-flex items-center gap-1"
              >
                <Printer size={14} /> Drukuj
              </button>
              {draft.status !== "issued" && (
                <>
                  <button type="button" onClick={() => save("draft")} className="px-4 py-2 border rounded-lg">Zapisz szkic</button>
                  <button type="button" onClick={() => save("issued")} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold">Zatwierdź dokument</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitClinicDocuments;
