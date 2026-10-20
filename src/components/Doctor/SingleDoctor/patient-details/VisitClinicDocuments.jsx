import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Eye, Printer, Pencil, User, X, Upload, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../../../../context/userContext";
import clinicDocumentsHelper from "../../../../helpers/clinicDocumentsHelper";
import clinicFlowHelper from "../../../../helpers/clinicFlowHelper";
import patientService from "../../../../helpers/patientHelper";
import { apiCaller } from "../../../../utils/axiosInstance";
import ClinicDocumentSheet, { ClinicSheetPdfView, initialFieldValue, printClinicSheet } from "../../../ehealth/ClinicDocumentSheet";

const UPLOAD_TYPES = [
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

function withSectionLabels(fields, labels) {
  return (fields || []).map((field) => ({
    ...field,
    templateLabel: field.templateLabel || field.label,
    label: labels?.[field.key] || field.label,
  }));
}

function sheetProps(doc, patient, doctorName, doctorPwz, doctorTitle) {
  const snapshot = doc.templateSnapshot || doc.template || {};
  const saved = doc.patientSnapshot;
  const hasSaved = saved && (saved.name || saved.pesel || saved.birthDate || saved.address);
  return {
    title: doc.headerTitle || snapshot.printTitle || snapshot.name,
    fields: withSectionLabels(snapshot.fields, doc.sectionLabels),
    values: doc.values || {},
    patient: hasSaved ? saved : patient,
    doctorName: doctorName || doc.createdByName || "",
    doctorTitle,
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

function addressParts(patient) {
  const street = String(patient?.street || "").trim();
  const postalCode = String(patient?.postalCode || patient?.pinCode || "").trim();
  const city = String(patient?.city || "").trim();
  if (street || postalCode || city) return { street, postalCode, city };
  const raw = String(patient?.address || "").trim();
  const postal = raw.match(/(\d{2}-\d{3}|\d{5})/);
  if (!postal) return { street: raw, postalCode: "", city: "" };
  const before = raw.slice(0, postal.index).replace(/[,\s]+$/, "").trim();
  const after = raw.slice(postal.index + postal[0].length).replace(/^[,\s]+/, "");
  return { street: before, postalCode: postal[0], city: after.split(",")[0].trim() };
}

function printedAddress(parts) {
  return [parts.street, parts.postalCode, parts.city].map((part) => String(part || "").trim()).filter(Boolean).join(", ");
}

function patientForSheet(patient) {
  const parts = addressParts(patient);
  return {
    name: patient?.name || "",
    pesel: patient?.pesel || "",
    birthDate: String(patient?.birthDate || "").slice(0, 10),
    street: parts.street,
    postalCode: parts.postalCode,
    city: parts.city,
    address: printedAddress(parts) || String(patient?.address || "").trim(),
  };
}

function PatientDetailsDialog({ patient, busy, onClose, onSave }) {
  const address = addressParts(patient);
  const [form, setForm] = useState({
    name: patient?.name || "",
    pesel: patient?.pesel || "",
    birthDate: String(patient?.birthDate || "").slice(0, 10),
    street: address.street,
    postalCode: address.postalCode,
    city: address.city,
  });
  const [scope, setScope] = useState("document");
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center"><User size={16} /></span>
            <div>
              <h3 className="font-bold text-slate-900">Edytuj dane pacjenta</h3>
              <p className="text-xs text-slate-500">Korekta danych personalnych na potrzeby dokumentu</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Zamknij"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm">Imię i nazwisko <span className="text-red-500">*</span>
            <input value={form.name} onChange={set("name")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">PESEL
            <input value={form.pesel} onChange={set("pesel")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">Data urodzenia
            <input type="date" value={form.birthDate} onChange={set("birthDate")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">Ulica
            <input value={form.street} onChange={set("street")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Kod pocztowy
              <input value={form.postalCode} onChange={set("postalCode")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-sm">Miasto
              <input value={form.city} onChange={set("city")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">Zakres zmiany</p>
            <label className={`block rounded-xl border px-3 py-2 mb-2 cursor-pointer ${scope === "document" ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
              <span className="flex items-start gap-2">
                <input type="radio" className="mt-1" checked={scope === "document"} onChange={() => setScope("document")} />
                <span>
                  <span className="block text-sm font-semibold">Tylko w tym dokumencie</span>
                  <span className="block text-xs text-slate-500">Zmiana wpłynie wyłącznie na bieżący szkic dokumentu.</span>
                </span>
              </span>
            </label>
            <label className={`block rounded-xl border px-3 py-2 cursor-pointer ${scope === "record" ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
              <span className="flex items-start gap-2">
                <input type="radio" className="mt-1" checked={scope === "record"} onChange={() => setScope("record")} />
                <span>
                  <span className="block text-sm font-semibold">Zaktualizuj również kartę pacjenta</span>
                  <span className="block text-xs text-slate-500">Poprawione dane będą używane w kolejnych dokumentach pacjenta.</span>
                </span>
              </span>
            </label>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="text-sm text-slate-600">Anuluj</button>
          <button type="button" disabled={busy} onClick={() => onSave(form, scope)} className="px-4 py-2 rounded-lg bg-[#1b766a] text-white text-sm font-semibold disabled:opacity-60">
            {busy ? "Zapisuję…" : "Zapisz dane"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionRenameDialog({ field, onClose, onSave }) {
  const templateName = field.templateLabel || field.label || "Pole";
  const [name, setName] = useState(field.label || templateName);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center"><Pencil size={16} /></span>
            <div>
              <h3 className="font-bold text-slate-900">Zmień nazwę sekcji</h3>
              <p className="text-xs text-slate-500">Modyfikacja nagłówka sekcji dla bieżącego dokumentu</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nazwa we wzorze:</p>
            <p className="text-sm font-semibold text-slate-800">{templateName}</p>
          </div>
          <label className="block text-sm font-medium">Nazwa w bieżącym dokumencie <span className="text-red-500">*</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-teal-600 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-1 focus:ring-teal-600" />
          </label>
          <p className="text-xs text-slate-500">Zmiana wpłynie wyłącznie na ten dokument i jego wydruk. Globalny wzór administratora pozostanie niezmieniony.</p>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm text-slate-600">Anuluj</button>
          <button
            type="button"
            onClick={() => onSave(name)}
            className="px-4 py-2 rounded-lg bg-[#1b766a] text-white text-sm font-semibold"
          >
            Zapisz nazwę
          </button>
        </div>
      </div>
    </div>
  );
}

function orderStatusBadge(status) {
  if (status === "cancelled") return { label: "Anulowane", className: "bg-slate-50 text-slate-700 border-slate-200" };
  if (status === "booked") return { label: "Umówione", className: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  return { label: "Czeka na recepcję", className: "bg-amber-50 text-amber-800 border-amber-200" };
}

function formatDocumentWhen(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function visitCardVersions(reports) {
  const cards = (reports || []).filter((report) => report.type === "visit-card" || report.type === "Visit Card");
  return cards
    .map((card) => ({
      id: card._id || card.fileUrl || card.url,
      url: card.fileUrl || card.url || card.downloadUrl || card.path || "",
      at: card.uploadedAt || card.createdAt || card.updatedAt || card.uploadDate,
    }))
    .filter((card) => card.url)
    .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0))
    .map((card, index, all) => ({ ...card, version: index + 1, total: all.length }));
}

function openVisitCard(url) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

export function VisitFilePreview({ title, url, onClose }) {
  const [src, setSrc] = useState("");
  const [kind, setKind] = useState("pdf");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setSrc("");
    setFailed(false);
    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("plik");
        const blob = await response.blob();
        const type = blob.type || "";
        const image = type.startsWith("image/") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
        objectUrl = URL.createObjectURL(new Blob([blob], { type: image ? (type || "image/jpeg") : (type || "application/pdf") }));
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setKind(image ? "image" : "pdf");
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-3">
      <div className="bg-slate-100 rounded-2xl w-full max-w-[980px] h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-white px-5 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold">{title || "Karta wizyty"}</h3>
          <button type="button" onClick={onClose} className="text-xl leading-none" aria-label="Zamknij">×</button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4">
          {failed ? (
            <p className="text-sm text-slate-600">Nie udało się otworzyć podglądu karty wizyty.</p>
          ) : !src ? (
            <p className="text-sm text-slate-500">Otwieram podgląd…</p>
          ) : kind === "image" ? (
            <img src={src} alt={title || "Karta wizyty"} className="mx-auto max-h-full max-w-full bg-white" />
          ) : (
            <iframe title={title || "Karta wizyty"} src={src} className="w-full h-full bg-white rounded-lg border-0" />
          )}
        </div>
        <div className="bg-white px-5 py-3 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Zamknij</button>
          <button type="button" onClick={() => printVisitFile(url)} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold inline-flex items-center gap-1">
            <Printer size={14} /> Drukuj
          </button>
        </div>
      </div>
    </div>
  );
}

async function printVisitFile(url) {
  if (!url) return;
  let source = url;
  let objectUrl = "";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("plik");
    objectUrl = URL.createObjectURL(await response.blob());
    source = objectUrl;
  } catch {
    toast.error("Nie udało się otworzyć podglądu wydruku.");
    return;
  }
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;";
  frame.src = source;
  const cleanup = () => {
    frame.onload = null;
    frame.remove();
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };
  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      frame.contentWindow.onafterprint = cleanup;
      setTimeout(cleanup, 60000);
    } catch {
      cleanup();
      toast.error("Nie udało się otworzyć podglądu wydruku.");
    }
  };
  document.body.appendChild(frame);
}

function uploadedVisitFiles(reports) {
  return (reports || [])
    .filter((report) => report.type !== "visit-card" && report.type !== "Visit Card")
    .map((report) => ({
      id: report._id,
      name: report.name || report.fileName || report.originalName || "Dokument",
      type: report.documentType || report.type || "Załącznik",
      description: report.description || "",
      url: report.downloadUrl || report.fileUrl || report.url || report.path || "",
      at: report.uploadedAt || report.uploadDate || report.createdAt || report.updatedAt,
    }));
}

function UploadVisitFileDialog({ busy, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Wybierz typ...");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const takeFile = (next) => {
    if (!next) return;
    if (next.size > 10 * 1024 * 1024) {
      toast.error("Rozmiar pliku przekracza limit 10MB");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(next.type)) {
      toast.error("Dozwolone: PDF, JPG, PNG");
      return;
    }
    setFile(next);
    if (!name) setName(next.name.replace(/\.[^.]+$/, ""));
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-4">
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onSubmit={(event) => {
          event.preventDefault();
          if (!file) return;
          onSubmit({ name, type: type === "Wybierz typ..." ? UPLOAD_TYPES[UPLOAD_TYPES.length - 1] : type, description, file });
        }}
      >
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Dodaj plik wizyty</h3>
            <p className="text-xs text-slate-500">Załącznik z opisem, zapisany przy dokumentach tej wizyty</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Zamknij"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm">Nazwa dokumentu
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nazwa dokumentu..." className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">Typ dokumentu
            <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 bg-white">
              <option>Wybierz typ...</option>
              {UPLOAD_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm">Opis
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="Krótki komentarz do wgranego dokumentu..." className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>
          <div
            onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => { event.preventDefault(); setDragOver(false); takeFile(event.dataTransfer?.files?.[0]); }}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center ${dragOver ? "border-teal-500 bg-teal-50" : "border-slate-300"}`}
          >
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600">Przeciągnij plik lub kliknij</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG (max 10MB)</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(event) => { takeFile(event.target.files?.[0]); event.target.value = ""; }} />
          </div>
          {file && (
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Usuń plik"><X size={14} /></button>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="text-sm text-slate-600">Anuluj</button>
          <button type="submit" disabled={busy || !file} className="px-4 py-2 rounded-lg bg-[#1b766a] text-white text-sm font-semibold disabled:opacity-60">
            {busy ? "Przesyłanie..." : "Dodaj dokument"}
          </button>
        </div>
      </form>
    </div>
  );
}

const EXAMS = ["EEG", "USG", "RTG", "TK", "MR", "Holter"];

const VisitClinicDocuments = ({ visitId, patientId, patient, doctorName, doctorTitle = "", doctorPwz = "", visitHints = {}, reports = [], onPatientRecordSaved, onReportsChanged }) => {
  const { user } = useUser();
  const canShare = user?.role === "doctor" || user?.role === "admin";
  const [templates, setTemplates] = useState([]);
  const [docs, setDocs] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(null);
  const [patientEditorOpen, setPatientEditorOpen] = useState(false);
  const [patientSaveBusy, setPatientSaveBusy] = useState(false);
  const [renameField, setRenameField] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cardPreview, setCardPreview] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [visitOrders, setVisitOrders] = useState([]);
  const [shareTarget, setShareTarget] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);
  const [exam, setExam] = useState(EXAMS[0]);
  const [customExam, setCustomExam] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [sharedPreview, setSharedPreview] = useState(null);
  const [sharedClinicDoc, setSharedClinicDoc] = useState(null);
  const issuedPdfRef = useRef(null);
  const previewPdfRef = useRef(null);

  const loadDocs = async () => {
    if (!visitId) return;
    try {
      setDocs(await clinicDocumentsHelper.listIssued(visitId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loadFlow = () => {
    if (!visitId) return;
    clinicFlowHelper.incomingShares(visitId).then((rows) => setIncoming(Array.isArray(rows) ? rows : [])).catch(() => setIncoming([]));
    clinicFlowHelper.outgoingShares(visitId).then((rows) => setOutgoing(Array.isArray(rows) ? rows : [])).catch(() => setOutgoing([]));
    clinicFlowHelper.ordersForVisit(visitId).then((rows) => setVisitOrders(Array.isArray(rows) ? rows : [])).catch(() => setVisitOrders([]));
  };

  useEffect(() => {
    loadDocs();
    loadFlow();
    clinicDocumentsHelper.listTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, [visitId]);

  const openShare = (file) => {
    setShareTarget(file);
    setDoctorQuery("");
    clinicFlowHelper.doctors().then((rows) => setDoctors(Array.isArray(rows) ? rows : [])).catch(() => setDoctors([]));
  };

  const sendShare = async (doctor) => {
    if (!visitId || !shareTarget) return;
    try {
      await clinicFlowHelper.shareReport({
        visitId,
        reportId: shareTarget.id,
        clinicDocumentId: shareTarget.clinicDocumentId,
        toDoctorId: doctor._id,
      });
      toast.success(`Dokument wysłany do ${doctor.name}. Reszta wizyty zostaje prywatna.`);
      setShareTarget(null);
      loadFlow();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Nie udało się udostępnić dokumentu");
    }
  };

  const openIncoming = async (share) => {
    try {
      const file = await clinicFlowHelper.openSharedFile(share.id);
      if (file?.kind === "clinic-document" && file.document) {
        setSharedClinicDoc({ ...share, document: file.document, name: file.name || share.fileName });
        return;
      }
      setSharedPreview({ ...share, url: file?.url, name: file?.name || share.fileName });
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się otworzyć wyniku");
    }
  };

  const markReviewed = async (share) => {
    try {
      await clinicFlowHelper.reviewShare(share.id);
      toast.success("Wynik oznaczony jako przejrzany");
      setSharedPreview(null);
      loadFlow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się zapisać przeglądu");
    }
  };

  const cancelVisitOrder = async (row) => {
    if (row.status === "cancelled") return;
    try {
      await clinicFlowHelper.cancelOrder(row.id);
      toast.success("Zlecenie anulowane. Recepcja już go nie umawia.");
      loadFlow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się anulować zlecenia");
    }
  };

  const submitOrder = async () => {
    const chosen = exam === "Inne" ? customExam.trim() : exam;
    if (!chosen) {
      toast.error("Podaj nazwę badania.");
      return;
    }
    try {
      await clinicFlowHelper.createOrder({ visitId, exam: chosen, note: orderNote });
      toast.success("Zlecenie trafiło do recepcji. Wizyta pozostaje bez zmian.");
      setOrderOpen(false);
      setOrderNote("");
      loadFlow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się zapisać zlecenia");
    }
  };

  const openNew = (template) => {
    const values = {};
    (template.fields || []).forEach((field) => {
      values[field.key] = initialFieldValue(field);
    });
    setDraft({
      template,
      values,
      headerTitle: template.printTitle || template.name || "",
      patient: patientForSheet(patient),
      sectionLabels: {},
      existingId: null,
      status: "draft",
    });
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
      headerTitle: doc.headerTitle || doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name || "",
      patient: (doc.patientSnapshot && (doc.patientSnapshot.name || doc.patientSnapshot.pesel || doc.patientSnapshot.birthDate || doc.patientSnapshot.address || doc.patientSnapshot.street))
        ? patientForSheet(doc.patientSnapshot)
        : patientForSheet(patient),
      sectionLabels: { ...(doc.sectionLabels || {}) },
      existingId: doc._id,
      status: doc.status,
      documentNumber: doc.documentNumber,
      createdByName: doc.createdByName,
    });
  };

  const save = async (status) => {
    const missing = (draft.template.fields || []).filter((field) => field.required && !String(draft.values[field.key] || "").trim());
    if (status === "issued" && missing.length) {
      toast.error(`Uzupełnij: ${missing.map((field) => draft.sectionLabels?.[field.key] || field.label).join(", ")}`);
      return;
    }
    const headerTitle = String(draft.headerTitle || draft.template.printTitle || draft.template.name || "").trim();
    if (!headerTitle) {
      toast.error("Podaj tytuł dokumentu.");
      return;
    }
    try {
      const saved = draft.existingId
        ? await clinicDocumentsHelper.updateIssued(draft.existingId, { values: draft.values, headerTitle, patientSnapshot: draft.patient, sectionLabels: draft.sectionLabels || {}, status })
        : await clinicDocumentsHelper.createIssued({
          visitId,
          patientId,
          templateId: draft.template._id,
          values: draft.values,
          headerTitle,
          patientSnapshot: draft.patient,
          sectionLabels: draft.sectionLabels || {},
          status,
          createdByName: doctorName,
        });
      loadDocs();
      if (status === "issued") {
        setDraft((current) => ({
          ...current,
          existingId: saved?._id || current.existingId,
          status: "issued",
          documentNumber: saved?.documentNumber || current.documentNumber,
          headerTitle,
        }));
        toast.success("Dokument zatwierdzony");
        return;
      }
      toast.success("Zapisano szkic");
      setDraft(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const draftSheet = () => sheetProps({
    headerTitle: draft.headerTitle,
    patientSnapshot: draft.patient,
    sectionLabels: draft.sectionLabels,
    templateSnapshot: draft.template,
    values: draft.values,
    documentNumber: draft.documentNumber,
    status: draft.status,
    createdByName: draft.createdByName,
  }, patient, doctorName, doctorPwz, doctorTitle);

  const cards = visitCardVersions(reports).slice().reverse();
  const files = uploadedVisitFiles(reports);
  const documentRows = [
    ...cards.map((card) => ({ kind: "card", at: new Date(card.at || 0).getTime() || 0, key: `card-${card.id}`, card })),
    ...files.map((file) => ({ kind: "file", at: new Date(file.at || 0).getTime() || 0, key: `file-${file.id || file.url}`, file })),
    ...docs.map((doc) => ({
      kind: "doc",
      at: new Date((doc.status === "issued" ? doc.issuedAt || doc.createdAt || doc.updatedAt : doc.updatedAt || doc.createdAt) || 0).getTime() || 0,
      key: `doc-${doc._id}`,
      doc,
    })),
  ].sort((a, b) => b.at - a.at);

  const uploadFile = async ({ name, type, description, file }) => {
    if (!visitId) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("name", name || file.name);
    body.append("type", type);
    body.append("description", description);
    try {
      await apiCaller("POST", `/appointments/rep/${visitId}/upload-report`, body, true);
      toast.success("Dokument dodany do wizyty");
      setUploadOpen(false);
      onReportsChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się przesłać dokumentu");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileId) => {
    if (!visitId || !fileId || !window.confirm("Usunąć ten plik z wizyty?")) return;
    try {
      await apiCaller("DELETE", `/appointments/${visitId}/reports/${fileId}`);
      toast.success("Plik usunięty");
      onReportsChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się usunąć pliku");
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
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex gap-2">
        <button type="button" onClick={() => setPickerOpen(true)} className="flex-1 h-10 rounded-lg bg-[#1b766a] text-white text-sm font-semibold inline-flex items-center justify-center gap-2">
          <Plus size={16} /> Wystaw dokument
        </button>
        <button type="button" onClick={() => setUploadOpen(true)} className="h-10 px-3 rounded-lg border border-[#1b766a] bg-white text-[#1b766a] text-sm font-semibold inline-flex items-center gap-1.5">
          <Upload size={16} /> Dodaj plik
        </button>
        {canShare && (
          <button type="button" onClick={() => setOrderOpen(true)} className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold">
            Zleć badanie
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {incoming.map((share) => (
          <div key={share.id} className="border border-amber-300 bg-amber-50 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Wynik do przeglądu: {share.fileName}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Wysłał {share.fromDoctorName || "lekarz"}{share.sourceVisitLabel ? ` · wizyta ${share.sourceVisitLabel}` : ""}
                </div>
                <p className="text-xs text-slate-500 mt-1">Widać tylko ten plik. Pozostała część tamtej wizyty zostaje u lekarza, który ją prowadził.</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${share.reviewedAt ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
                {share.reviewedAt ? "Przejrzane" : "Do przeglądu"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-amber-200 text-xs">
              <button type="button" onClick={() => openIncoming(share)} className="inline-flex items-center gap-1 text-teal-800 font-medium">
                <Eye size={14} /> Otwórz wynik
              </button>
              {!share.reviewedAt && (
                <button type="button" onClick={() => markReviewed(share)} className="inline-flex items-center gap-1 text-slate-700 font-medium">
                  Oznacz jako przejrzane
                </button>
              )}
            </div>
          </div>
        ))}
        {visitOrders.filter((row) => String(row.sourceVisitId) === String(visitId)).map((row) => {
          const badge = orderStatusBadge(row.status);
          const canCancelOrder = canShare && row.status !== "cancelled";
          return (
          <div key={row.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Zlecenie w przychodni: {row.exam}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {row.createdAt ? formatDocumentWhen(row.createdAt) : "Zlecone z tej wizyty"}
                  {row.note ? ` · ${row.note}` : ""}
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>{badge.label}</span>
            </div>
            {canCancelOrder && (
              <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-100 text-xs">
                <button type="button" onClick={() => cancelVisitOrder(row)} className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  Anuluj
                </button>
              </div>
            )}
          </div>
          );
        })}
        {documentRows.length === 0 && incoming.length === 0 && visitOrders.length === 0 && (
          <p className="text-xs text-gray-400">Brak dokumentów tej wizyty.</p>
        )}
        {documentRows.map((row) => row.kind === "card" ? (() => { const card = row.card; return (
          <div key={card.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Karta wizyty</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {card.at ? formatDocumentWhen(card.at) : "Wygenerowana"}
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                {card.total > 1 ? `Wersja ${card.version}` : "Wygenerowana"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
              <button type="button" onClick={() => setCardPreview(card)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                <Eye size={14} /> Otwórz dokument
              </button>
              <button type="button" onClick={() => printVisitFile(card.url)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                <Printer size={14} /> Drukuj
              </button>
            </div>
          </div>
        ); })() : row.kind === "file" ? (() => { const file = row.file; return (
          <div key={file.id || file.url} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{file.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {file.type}{file.at ? ` · ${formatDocumentWhen(file.at)}` : ""}
                </div>
                {file.description ? <p className="text-xs text-gray-500 mt-1">{file.description}</p> : null}
                {outgoing.filter((share) => String(share.reportId) === String(file.id) || String(share.clinicDocumentId) === String(file.id)).map((share) => (
                  <p key={share.id} className="text-xs text-slate-500 mt-1">
                    Udostępniono {share.toDoctorName}: {share.reviewedAt ? "przejrzane" : "do przeglądu"}
                  </p>
                ))}
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">Plik</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
              <button type="button" onClick={() => openVisitCard(file.url)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                <Eye size={14} /> Otwórz dokument
              </button>
              <div className="flex items-center gap-3">
                {canShare && (
                  <button type="button" onClick={() => openShare(file)} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                    <Share2 size={14} /> Udostępnij
                  </button>
                )}
                <button type="button" onClick={() => removeFile(file.id)} className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Trash2 size={14} /> Usuń
                </button>
              </div>
            </div>
          </div>
        ); })() : (() => { const doc = row.doc; return (
          <div key={doc._id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{doc.headerTitle || doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name}</div>
                {doc.headerTitle && doc.headerTitle !== (doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name) && (
                  <div className="text-[11px] text-gray-400">Wzór: {doc.templateSnapshot?.name}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5">
                  {doc.status === "issued"
                    ? `${formatDocumentWhen(doc.issuedAt || doc.createdAt || doc.updatedAt)}${doc.documentNumber ? ` · Nr ${doc.documentNumber}` : ""}`
                    : `Ostatnia zmiana: ${formatDocumentWhen(doc.updatedAt || doc.createdAt)}`}
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
              <div className="flex items-center gap-3">
                {canShare && doc.status === "issued" && (
                  <button
                    type="button"
                    onClick={() => openShare({
                      id: `clinic-${doc._id}`,
                      name: doc.headerTitle || doc.templateSnapshot?.printTitle || doc.templateSnapshot?.name || "Dokument",
                      clinicDocumentId: doc._id,
                    })}
                    className="inline-flex items-center gap-1 text-teal-700 font-medium"
                  >
                    <Share2 size={14} /> Udostępnij
                  </button>
                )}
                <button type="button" onClick={() => { printClinicSheet(sheetProps(doc, patient, doctorName, doctorPwz, doctorTitle)); }} className="inline-flex items-center gap-1 text-teal-700 font-medium">
                  <Printer size={14} /> Drukuj
                </button>
              </div>
            </div>
            {outgoing.filter((share) => String(share.clinicDocumentId) === String(doc._id) || String(share.reportId) === `clinic-${doc._id}`).map((share) => (
              <p key={share.id} className="text-xs text-slate-500 mt-2">
                Udostępniono {share.toDoctorName}: {share.reviewedAt ? "przejrzane" : "do przeglądu"}
              </p>
            ))}
          </div>
        ); })())}
      </div>

      {cardPreview && (
        <VisitFilePreview
          title={cardPreview.total > 1 ? `Karta wizyty · Wersja ${cardPreview.version}` : "Karta wizyty"}
          url={cardPreview.url}
          onClose={() => setCardPreview(null)}
        />
      )}

      {uploadOpen && (
        <UploadVisitFileDialog busy={uploading} onClose={() => !uploading && setUploadOpen(false)} onSubmit={uploadFile} />
      )}

      {sharedPreview && (
        <VisitFilePreview title={sharedPreview.name || "Wynik"} url={sharedPreview.url} onClose={() => setSharedPreview(null)} />
      )}

      {sharedClinicDoc && (
        <div className="fixed inset-0 z-[75] bg-slate-900/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-[980px] h-[92vh] overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold">{sharedClinicDoc.name || "Dokument"}</h3>
                <p className="text-xs text-slate-500">Wysłany przez {sharedClinicDoc.fromDoctorName || "lekarza"} · widać tylko ten dokument</p>
              </div>
              <button type="button" onClick={() => setSharedClinicDoc(null)} aria-label="Zamknij"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <ClinicDocumentSheet {...sheetProps(sharedClinicDoc.document, patient, sharedClinicDoc.document?.createdByName, "", "")} />
            </div>
          </div>
        </div>
      )}

      {shareTarget && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-bold">Udostępnij do przeglądu</h3>
              <p className="text-xs text-slate-500 mt-1">{shareTarget.name}. Lekarz zobaczy tylko ten dokument, nie całą wizytę.</p>
              <input value={doctorQuery} onChange={(event) => setDoctorQuery(event.target.value)} placeholder="Szukaj lekarza..." className="mt-3 w-full border rounded-lg px-3 py-2 text-sm" />
              {visitOrders.filter((row) => String(row.bookedVisitId) === String(visitId) && row.orderedById).map((row) => (
                <button key={row.id} type="button" onClick={() => sendShare({ _id: row.orderedById, name: row.orderedByName })} className="mt-2 w-full text-left rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                  Odeślij do lekarza zlecającego: {row.orderedByName}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto p-3 space-y-1">
              {doctors
                .filter((doctor) => ![user?._id, user?.id, user?.d_id].filter(Boolean).map(String).includes(String(doctor._id)))
                .filter((doctor) => !doctorQuery.trim() || `${doctor.name} ${(doctor.specializations || []).join(" ")}`.toLowerCase().includes(doctorQuery.trim().toLowerCase()))
                .map((doctor) => (
                  <button key={doctor._id} type="button" onClick={() => sendShare(doctor)} className="w-full text-left border rounded-lg px-3 py-2 hover:border-teal-400">
                    <div className="text-sm font-semibold">{doctor.name}</div>
                    <div className="text-xs text-slate-500">{(doctor.specializations || []).join(", ")}</div>
                  </button>
                ))}
            </div>
            <div className="p-3 border-t flex justify-end">
              <button type="button" onClick={() => setShareTarget(null)} className="px-3 py-1.5 border rounded-lg text-sm">Zamknij</button>
            </div>
          </div>
        </div>
      )}

      {orderOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 flex items-center justify-center p-4">
          <form
            className="bg-white rounded-xl w-full max-w-md p-4 space-y-3"
            onSubmit={(event) => { event.preventDefault(); submitOrder(); }}
          >
            <h3 className="font-bold">Zleć badanie w przychodni</h3>
            <p className="text-xs text-slate-500">Recepcja umówi termin. To nie jest e-skierowanie i nie zmienia statusu tej wizyty.</p>
            <label className="block text-sm">Badanie
              <select value={exam} onChange={(event) => setExam(event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
                {EXAMS.map((item) => <option key={item}>{item}</option>)}
                <option>Inne</option>
              </select>
            </label>
            {exam === "Inne" && (
              <input value={customExam} onChange={(event) => setCustomExam(event.target.value)} placeholder="Nazwa badania" className="w-full border rounded-lg px-3 py-2 text-sm" />
            )}
            <textarea value={orderNote} onChange={(event) => setOrderNote(event.target.value)} rows={3} placeholder="Krótka informacja dla recepcji i lekarza wykonującego" className="w-full border rounded-lg px-3 py-2 text-sm" />
            {visitOrders.some((row) => String(row.bookedVisitId) === String(visitId) && row.orderedByName) && (
              <p className="text-xs text-slate-500">Wynik tego badania odeślij przez „Udostępnij” do lekarza, który je zlecił.</p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOrderOpen(false)} className="px-3 py-1.5 border rounded-lg text-sm">Anuluj</button>
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#1b766a] text-white text-sm font-semibold">Wyślij do recepcji</button>
            </div>
          </form>
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Wystaw dokument</h3>
              <button type="button" onClick={() => setPickerOpen(false)}>×</button>
            </div>
            <div className="p-4 space-y-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj wzoru..." className="w-full border rounded-lg px-3 py-2 text-sm" />
              <Link to="/moje-wzory-dokumentow" className="inline-flex text-xs font-semibold text-teal-700">Zarządzaj moimi wzorami</Link>
            </div>
            <div className="overflow-y-auto px-4 pb-4 space-y-2">
              {filtered.length === 0 && <p className="text-sm text-gray-500">Brak wzorów przypisanych do tego lekarza.</p>}
              {filtered.map((template) => (
                <button key={template._id} type="button" onClick={() => openNew(template)} className="w-full text-left border rounded-lg p-3 hover:border-teal-400">
                  <div className="text-[11px] font-bold text-teal-700">[{template.code}]{template.ownerId ? " · Mój wzór" : ""}</div>
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
          <div className={`bg-slate-100 rounded-2xl w-full h-[92vh] overflow-hidden flex flex-col shadow-2xl ${draft.status === "issued" ? "max-w-[980px]" : "max-w-[1400px]"}`}>
            <div className="bg-white px-5 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-teal-700">{draft.template.code ? `[${draft.template.code}]` : "Dokument"}</div>
                {draft.status === "issued" ? (
                  <h3 className="font-bold">{draft.headerTitle || draft.template.printTitle || draft.template.name}</h3>
                ) : (
                  <input
                    value={draft.headerTitle || ""}
                    onChange={(event) => setDraft({ ...draft, headerTitle: event.target.value })}
                    aria-label="Tytuł tego dokumentu"
                    className="mt-0.5 w-full max-w-md border border-slate-200 rounded-md px-2 py-1 text-sm font-bold"
                  />
                )}
                <p className="text-xs text-slate-500">
                  {draft.status === "issued"
                    ? "Dokument zatwierdzony. Wydrukuj go albo zamknij podgląd."
                    : "Po prawej jest dokładny wydruk. Jeśli podpis zejdzie na następną stronę, skróć treść, żeby został na pierwszej."}
                </p>
              </div>
              <button type="button" onClick={() => setDraft(null)} className="text-xl leading-none">×</button>
            </div>
            <div className={`flex-1 min-h-0 min-w-0 overflow-hidden ${draft.status === "issued" ? "p-4" : "grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(340px,460px)]"}`}>
              {draft.status === "issued" ? (
                <ClinicSheetPdfView ref={issuedPdfRef} {...draftSheet()} />
              ) : (
                <>
                  <div className="h-full min-h-0 overflow-auto p-4">
                    <ClinicDocumentSheet
                      mode="fill"
                      title={draft.headerTitle || draft.template.printTitle || draft.template.name}
                      fields={withSectionLabels(draft.template.fields, draft.sectionLabels)}
                      values={draft.values}
                      patient={draft.patient || patient}
                      doctorName={doctorName}
                      doctorTitle={doctorTitle}
                      doctorPwz={doctorPwz}
                      documentNumber={draft.documentNumber}
                      status={draft.status}
                      visitHint={(field) => visitHintFor(field, visitHints)}
                      onChange={(key, value) => setDraft({ ...draft, values: { ...draft.values, [key]: value } })}
                      onTitleChange={(headerTitle) => setDraft({ ...draft, headerTitle })}
                      onEditPatient={() => setPatientEditorOpen(true)}
                      onRenameSection={(field) => setRenameField(field)}
                    />
                  </div>
                  <div className="h-full min-h-0 border-t xl:border-t-0 xl:border-l border-slate-300 bg-slate-200 p-3">
                    <ClinicSheetPdfView ref={previewPdfRef} debounceMs={700} {...draftSheet()} />
                  </div>
                </>
              )}
            </div>
            <div className="bg-white px-5 py-3 border-t flex justify-end gap-2">
              {draft.status === "issued" ? (
                <>
                  <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 border rounded-lg">Zamknij</button>
                  {canShare && draft.existingId && (
                    <button
                      type="button"
                      onClick={() => openShare({
                        id: `clinic-${draft.existingId}`,
                        name: draft.headerTitle || draft.template?.printTitle || draft.template?.name || "Dokument",
                        clinicDocumentId: draft.existingId,
                      })}
                      className="px-4 py-2 border rounded-lg inline-flex items-center gap-1"
                    >
                      <Share2 size={14} /> Udostępnij
                    </button>
                  )}
                  <button type="button" onClick={() => issuedPdfRef.current?.print()} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold inline-flex items-center gap-1">
                    <Printer size={14} /> Drukuj
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => previewPdfRef.current?.print()} className="px-4 py-2 border rounded-lg inline-flex items-center gap-1">
                    <Printer size={14} /> Drukuj podgląd
                  </button>
                  <button type="button" onClick={() => save("draft")} className="px-4 py-2 border rounded-lg">Zapisz szkic</button>
                  <button type="button" onClick={() => save("issued")} className="px-4 py-2 bg-[#1b766a] text-white rounded-lg font-semibold">Zatwierdź dokument</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {renameField && (
        <SectionRenameDialog
          field={renameField}
          onClose={() => setRenameField(null)}
          onSave={(name) => {
            const next = String(name || "").trim();
            if (!next) {
              toast.error("Podaj nazwę sekcji.");
              return;
            }
            const templateName = renameField.templateLabel || renameField.label;
            setDraft((current) => {
              const labels = { ...(current.sectionLabels || {}) };
              if (next === templateName) delete labels[renameField.key];
              else labels[renameField.key] = next;
              return { ...current, sectionLabels: labels };
            });
            setRenameField(null);
            toast.success("Nazwa sekcji zmieniona w tym dokumencie.");
          }}
        />
      )}
      {patientEditorOpen && draft && (
        <PatientDetailsDialog
          patient={draft.patient || patient}
          busy={patientSaveBusy}
          onClose={() => !patientSaveBusy && setPatientEditorOpen(false)}
          onSave={async (form, scope) => {
            const street = String(form.street || "").trim();
            const postalCode = String(form.postalCode || "").trim();
            const city = String(form.city || "").trim();
            const next = {
              name: String(form.name || "").trim(),
              pesel: String(form.pesel || "").replace(/\s+/g, ""),
              birthDate: String(form.birthDate || "").slice(0, 10),
              street,
              postalCode,
              city,
              address: printedAddress({ street, postalCode, city }),
            };
            if (!next.name) {
              toast.error("Podaj imię i nazwisko.");
              return;
            }
            setDraft((current) => ({ ...current, patient: next }));
            if (scope !== "record") {
              setPatientEditorOpen(false);
              toast.success("Dane zapisane w tym dokumencie.");
              return;
            }
            try {
              setPatientSaveBusy(true);
              await patientService.updatePatient(patientId, {
                fullName: next.name,
                govtId: next.pesel,
                ...(next.birthDate ? { dateOfBirth: next.birthDate } : {}),
                address: street,
                pinCode: postalCode,
                city,
              });
              onPatientRecordSaved?.({
                name: next.name,
                pesel: next.pesel,
                birthDate: next.birthDate,
                address: street,
                pinCode: postalCode,
                city,
              });
              setPatientEditorOpen(false);
              toast.success("Dane zapisane w dokumencie i w karcie pacjenta.");
            } catch (err) {
              toast.error(err?.response?.data?.message || err?.message || "Nie udało się zapisać karty pacjenta.");
            } finally {
              setPatientSaveBusy(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default VisitClinicDocuments;
