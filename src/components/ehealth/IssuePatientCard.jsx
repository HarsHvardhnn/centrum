import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import patientService from "../../helpers/patientHelper";

export function normalizePatient(patient) {
  const street = String(patient?.street || "").trim();
  const city = String(patient?.city || "").trim();
  const postalCode = String(patient?.postalCode || "").trim();
  const legacy = String(patient?.address || "").trim();
  const resolvedStreet = street || (!city && !postalCode ? legacy : street);
  return {
    ...(patient || {}),
    street: resolvedStreet,
    city,
    postalCode,
    address: [resolvedStreet, postalCode, city].filter(Boolean).join(", "),
  };
}

export function patientForDocument(patient) {
  const parts = String(patient?.name || "").trim().split(/\s+/).filter(Boolean);
  return {
    given: parts[0] || "",
    family: parts.slice(1).join(" "),
    pesel: String(patient?.pesel || "").replace(/\D/g, ""),
    birthDate: String(patient?.birthDate || "").slice(0, 10),
    street: patient?.street || "",
    postalCode: patient?.postalCode || "",
    city: patient?.city || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
  };
}

function birthFromPesel(pesel) {
  const digits = String(pesel || "").replace(/\D/g, "");
  if (digits.length !== 11) return "";
  let year = Number(digits.slice(0, 2));
  let month = Number(digits.slice(2, 4));
  const day = digits.slice(4, 6);
  if (month > 80) { year += 1800; month -= 80; }
  else if (month > 60) { year += 2200; month -= 60; }
  else if (month > 40) { year += 2100; month -= 40; }
  else if (month > 20) { year += 2000; month -= 20; }
  else year += 1900;
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}

export default function IssuePatientCard({ patient, patientId, onChange, onSavedToRecord }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const card = normalizePatient(patient);
  const address = card.address || "Brak adresu";

  const apply = async (form, mode) => {
    const pesel = String(form.pesel || "").replace(/\D/g, "");
    if (pesel.length !== 11) {
      toast.error("PESEL musi mieć 11 cyfr.");
      return;
    }
    if (!form.street.trim() || !form.postalCode.trim() || !form.city.trim()) {
      toast.error("Ulica, kod pocztowy i miasto są wymagane.");
      return;
    }
    const next = normalizePatient({
      ...card,
      name: `${form.first} ${form.last}`.trim(),
      pesel,
      birthDate: form.birthDate,
      street: form.street.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
    try {
      setBusy(true);
      if (mode === "record") {
        await patientService.updatePatient(patientId, {
          fullName: next.name,
          govtId: pesel,
          ...(form.birthDate ? { dateOfBirth: form.birthDate } : {}),
          address: next.street,
          pinCode: next.postalCode,
          city: next.city,
          phone: next.phone,
          email: next.email,
        });
        onSavedToRecord?.(next);
        toast.success("Dane zapisane w karcie pacjenta.");
      } else {
        toast.success("Dane użyte tylko na tym dokumencie.");
      }
      onChange?.(next);
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Nie udało się zapisać danych pacjenta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dane pacjenta na dokumencie</div>
          <p className="mt-1 text-sm font-bold text-slate-900 break-words">{card.name || "—"}</p>
          <p className="mt-1 text-xs text-slate-700 break-all">PESEL {card.pesel || "—"} · ur. {card.birthDate ? String(card.birthDate).slice(0, 10) : birthFromPesel(card.pesel) || "—"}</p>
          <p className="mt-1 text-xs text-slate-800 break-words whitespace-pre-wrap">{address}</p>
          <p className="mt-1 text-xs text-slate-600 break-all">{[card.phone, card.email].filter(Boolean).join(" · ") || "Brak telefonu i e-maila"}</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-xs font-semibold text-[#0D5C46]">
          Popraw dane
        </button>
      </div>
      {open && <PatientEditDialog patient={card} busy={busy} canSaveRecord={Boolean(patientId)} onClose={() => !busy && setOpen(false)} onApply={apply} />}
    </section>
  );
}

function PatientEditDialog({ patient, busy, canSaveRecord, onClose, onApply }) {
  const parts = String(patient?.name || "").trim().split(/\s+/).filter(Boolean);
  const [form, setForm] = useState({
    first: parts[0] || "",
    last: parts.slice(1).join(" "),
    pesel: patient?.pesel || "",
    birthDate: String(patient?.birthDate || birthFromPesel(patient?.pesel) || "").slice(0, 10),
    street: patient?.street || "",
    postalCode: patient?.postalCode || "",
    city: patient?.city || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
  });
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Popraw dane pacjenta</h3>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Zamknij"><X size={16} /></button>
        </div>
        <p className="text-xs text-slate-500 break-words">Zapis w karcie pacjenta zmienia dane na stałe. Druga opcja poprawia tylko ten dokument.</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Imię" value={form.first} onChange={set("first")} />
          <Field label="Nazwisko" value={form.last} onChange={set("last")} />
          <Field label="PESEL" value={form.pesel} onChange={set("pesel")} />
          <label className="text-xs block">Data urodzenia
            <input type="date" value={form.birthDate} onChange={set("birthDate")} className="mt-1 w-full p-2 border rounded-lg" />
          </label>
          <label className="col-span-2 text-xs block">Ulica i numer
            <textarea value={form.street} onChange={set("street")} rows={3} className="mt-1 w-full p-2 border rounded-lg break-words" />
          </label>
          <Field label="Kod pocztowy" value={form.postalCode} onChange={set("postalCode")} />
          <Field label="Miasto" value={form.city} onChange={set("city")} />
          <Field label="Telefon" value={form.phone} onChange={set("phone")} />
          <Field label="E-mail" value={form.email} onChange={set("email")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <button type="button" disabled={busy} onClick={() => onApply(form, "document")} className="py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
            Tylko w tym dokumencie
          </button>
          <button type="button" disabled={busy || !canSaveRecord} onClick={() => onApply(form, "record")} className="py-2.5 rounded-xl bg-[#0D5C46] text-white text-sm font-semibold disabled:opacity-50">
            {busy ? "Zapisuję…" : "Zapisz w karcie pacjenta"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="text-xs block">{label}
      <input value={value} onChange={onChange} className="mt-1 w-full p-2 border rounded-lg" />
    </label>
  );
}
