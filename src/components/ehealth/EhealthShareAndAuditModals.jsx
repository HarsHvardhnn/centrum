import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import clinicFlowHelper from "../../helpers/clinicFlowHelper";
import { SERVICE_LABELS } from "./ehealthStatus";

const shell = "fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4";

/** The issuing doctor decides which colleagues may see this P1 document. */
export function DocumentAccessModal({ doc, onClose, onChanged }) {
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [shared, setShared] = useState(doc.sharedWith || []);

  useEffect(() => {
    clinicFlowHelper.doctors().then((rows) => setDoctors(Array.isArray(rows) ? rows : [])).catch(() => setDoctors([]));
  }, []);

  const sharedIds = useMemo(() => new Set(shared.map((row) => String(row.doctorId))), [shared]);
  const candidates = doctors
    .filter((d) => String(d._id) !== String(doc.doctorId) && !sharedIds.has(String(d._id)))
    .filter((d) => !query.trim() || `${d.name} ${(d.specializations || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));

  const grant = async (doctor) => {
    setBusy(String(doctor._id));
    try {
      await ehealthHelper.shareDocument(doc.id, doctor._id);
      setShared((rows) => [...rows, { doctorId: String(doctor._id), name: doctor.name, sharedAt: new Date().toISOString() }]);
      toast.success(`Udostępniono: ${doctor.name}`);
      onChanged?.();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message || err.message);
    } finally {
      setBusy("");
    }
  };

  const revoke = async (row) => {
    setBusy(row.doctorId);
    try {
      await ehealthHelper.unshareDocument(doc.id, row.doctorId);
      setShared((rows) => rows.filter((item) => item.doctorId !== row.doctorId));
      onChanged?.();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message || err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className={shell}>
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-bold">Dostęp do dokumentu</h3>
            <p className="text-xs text-slate-500">{SERVICE_LABELS[doc.service] || doc.service}{doc.patientName ? ` · ${doc.patientName}` : ""}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
          <p className="mb-3 text-xs text-slate-500">
            Dokument jest widoczny tylko dla wystawiającego lekarza. Wskaż lekarzy, którym chcesz udzielić dostępu.
          </p>
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Mają dostęp</h4>
          {shared.length === 0 && <p className="mb-3 text-xs text-slate-400">Nikt poza wystawiającym.</p>}
          <ul className="mb-4 space-y-1">
            {shared.map((row) => (
              <li key={row.doctorId} className="flex items-center justify-between rounded-lg border px-3 py-1.5">
                <span>{row.name || row.doctorId}</span>
                <button type="button" disabled={busy === row.doctorId} onClick={() => revoke(row)} className="text-xs text-red-700 hover:underline disabled:opacity-50">Cofnij</button>
              </li>
            ))}
          </ul>
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Udostępnij lekarzowi</h4>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj lekarza…" className="mb-2 w-full rounded-lg border px-3 py-2 text-sm" />
          <ul className="space-y-1">
            {candidates.map((d) => (
              <li key={d._id} className="flex items-center justify-between rounded-lg border px-3 py-1.5">
                <span>
                  <span className="block font-medium">{d.name}</span>
                  <span className="block text-xs text-slate-500">{(d.specializations || []).join(", ") || "Lekarz"}</span>
                </span>
                <button type="button" disabled={busy === String(d._id)} onClick={() => grant(d)} className="rounded-lg bg-[#1b766a] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50">Udostępnij</button>
              </li>
            ))}
            {candidates.length === 0 && <li className="text-xs text-slate-400">Brak lekarzy do wyboru.</li>}
          </ul>
        </div>
        <div className="flex justify-end border-t px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white">Zamknij</button>
        </div>
      </div>
    </div>
  );
}

const ACTION_LABELS = {
  submit: "Wystawienie",
  retry: "Ponowienie",
  cancel: "Anulowanie",
  print: "Wydruk",
  preview: "Podgląd PDF",
  details: "Szczegóły techniczne",
  open_visit: "Przejście do wizyty",
  share: "Udostępnienie lekarzowi",
  unshare: "Cofnięcie dostępu",
  history_search: "Wyszukiwanie w historii",
  history: "Wyszukiwanie w historii",
  validate: "Sprawdzenie dokumentu",
};

const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** Admin: every logged action on P1 documents - who did what and when. */
export function AuditLogModal({ onClose }) {
  const [filters, setFilters] = useState({ from: "", to: "", service: "", action: "", userId: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    clinicFlowHelper.doctors().then((list) => setDoctors(Array.isArray(list) ? list : [])).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ehealthHelper
      .auditLog({ ...filters, limit: 1000 })
      .then((res) => !cancelled && setRows(res?.data || []))
      .catch((err) => !cancelled && toast.error(unwrapEhealthError(err).message || err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [filters]);

  const exportCsv = () => {
    const header = ["Data i godzina", "Użytkownik", "Rola", "Akcja", "Usługa", "Numer dokumentu P1", "Pacjent", "Lekarz wystawiający", "Status", "Szczegóły"];
    const lines = rows.map((r) => [
      new Date(r.at).toLocaleString("pl-PL"),
      r.userName || r.userId,
      r.userRole,
      ACTION_LABELS[r.action] || r.action,
      SERVICE_LABELS[r.service] || r.service,
      r.externalId,
      r.patientName,
      r.doctorName,
      r.status,
      r.detail,
    ].map(csvCell).join(";"));
    const blob = new Blob(["﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dziennik-p1-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const set = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const input = "rounded-lg border px-2 py-1.5 text-sm";

  return (
    <div className={shell}>
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-bold">Dziennik zdarzeń dokumentów P1</h3>
            <p className="text-xs text-slate-500">Kto, co i kiedy zrobił z dokumentami P1 wszystkich lekarzy.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij"><X size={18} /></button>
        </div>
        <div className="flex flex-wrap items-end gap-2 border-b bg-slate-50 px-4 py-3 text-xs">
          <label>Od<input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={`${input} ml-1`} /></label>
          <label>Do<input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={`${input} ml-1`} /></label>
          <select value={filters.userId} onChange={(e) => set({ userId: e.target.value })} className={input}>
            <option value="">Wszyscy użytkownicy</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={filters.service} onChange={(e) => set({ service: e.target.value })} className={input}>
            <option value="">Wszystkie usługi</option>
            <option value="prescription">e-Recepta</option>
            <option value="referral">e-Skierowanie</option>
            <option value="ezla">e-ZLA</option>
            <option value="history">Historia</option>
          </select>
          <select value={filters.action} onChange={(e) => set({ action: e.target.value })} className={input}>
            <option value="">Wszystkie akcje</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="button" onClick={exportCsv} disabled={!rows.length} className="ml-auto rounded-lg border bg-white px-3 py-1.5 font-semibold disabled:opacity-50">Eksport CSV</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 text-gray-500">
              <tr>
                {["Data i godzina", "Użytkownik", "Akcja", "Usługa", "Numer dokumentu P1", "Pacjent", "Lekarz wystawiający", "Status", "Szczegóły"].map((h) => (
                  <th key={h} className="p-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="p-6 text-center text-slate-400">Ładowanie…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-slate-400">Brak zdarzeń dla wybranych filtrów.</td></tr>}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="whitespace-nowrap p-2">{new Date(r.at).toLocaleString("pl-PL")}</td>
                  <td className="p-2">{r.userName || r.userId || "—"}{r.userRole ? <span className="block text-[10px] text-slate-400">{r.userRole}</span> : null}</td>
                  <td className="p-2 font-medium">{ACTION_LABELS[r.action] || r.action}</td>
                  <td className="p-2">{SERVICE_LABELS[r.service] || r.service || "—"}</td>
                  <td className="break-all p-2 font-mono text-[11px]">{r.externalId || "—"}</td>
                  <td className="p-2">{r.patientName || "—"}</td>
                  <td className="p-2">{r.doctorName || "—"}</td>
                  <td className="p-2">{r.status}{r.errorCategory ? <span className="block text-[10px] text-red-600">{r.errorCategory}</span> : null}</td>
                  <td className="p-2 text-slate-600">{r.detail || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
