import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { SERVICE_LABELS, accessCodeOf, canCancel, canPrint } from "./ehealthStatus";

function statusView(status) {
  if (status === "cancelled") return { label: "Anulowana w P1", className: "bg-red-50 text-red-700" };
  if (status === "issued" || status === "submitted" || status === "confirmed") {
    return { label: "Wystawiona w P1", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "draft") return { label: "Sprawdzona, niewysłana", className: "bg-amber-50 text-amber-800" };
  if (status === "failed" || status === "retry") return { label: "Błąd wysyłki", className: "bg-red-50 text-red-700" };
  return { label: status || "—", className: "bg-gray-100 text-gray-600" };
}

function summaryOf(row) {
  const payload = row.payload || {};
  if (row.service === "prescription") {
    const items = Array.isArray(payload.items) && payload.items.length ? payload.items : payload.drug ? [payload] : [];
    const line = items
      .map((item) => {
        const name = item.drug?.name || item.recipeText || item.name || "";
        if (!name) return "";
        return item.quantity ? `${name} (${item.quantity} op.)` : name;
      })
      .filter(Boolean)
      .join(", ");
    return line;
  }
  if (row.service === "referral") {
    return [payload.title, payload.icd10Code].filter(Boolean).join(" · ");
  }
  if (row.service === "ezla") {
    const range = payload.from && payload.to ? `${payload.from} — ${payload.to}` : "";
    return [range, payload.icd10, payload.payerName].filter(Boolean).join(" · ");
  }
  return "";
}

function titleOf(service, index) {
  const name = SERVICE_LABELS[service] || "Dokument";
  return `${name} #${index + 1}`;
}

const VisitIssuedDocuments = ({ service, visitId, patientId, refreshKey = 0, patientPhone, onCopy, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    if (!visitId) {
      setRows([]);
      return;
    }
    try {
      const res = await ehealthHelper.history({ visitId, patientId: patientId || undefined, service });
      const list = Array.isArray(res?.data) ? res.data : [];
      setRows(list.filter((row) => row.service === service));
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    }
  };

  useEffect(() => {
    load();
  }, [visitId, patientId, service, refreshKey]);

  const run = async (id, fn, okMessage) => {
    try {
      setBusyId(id);
      await fn();
      if (okMessage) toast.success(okMessage);
      onChanged?.();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message || err.message);
    } finally {
      setBusyId("");
    }
  };

  const sendSms = (row) => {
    const code = accessCodeOf(row);
    if (!code) {
      toast.error("Kod dostępu pojawi się dopiero po przyjęciu dokumentu przez P1.");
      return;
    }
    const phone = String(patientPhone || "").trim();
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error("Brak numeru telefonu pacjenta.");
      return;
    }
    const text = `Kod ${SERVICE_LABELS[row.service] || "dokumentu"}: ${code}`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(text)}`;
  };

  if (!rows.length) {
    return <p className="text-xs text-gray-400">Brak dokumentów tej wizyty.</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map((row, index) => {
        const badge = statusView(row.status);
        const code = accessCodeOf(row);
        const summary = summaryOf(row);
        const busy = busyId === row.id;
        const cancelled = row.status === "cancelled";
        const buttonClass = "px-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50";
        return (
          <li key={row.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{titleOf(service, index)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}>{badge.label}</span>
                  {code && <span className="text-xs text-gray-600">PIN: <span className="font-mono font-semibold">{code}</span></span>}
                </div>
                {summary && <p className="text-xs text-gray-600 mt-1">{summary}</p>}
                {row.error?.message && (
                  <p className={`text-[11px] mt-1 ${row.status === "draft" ? "text-amber-800" : "text-red-700"}`}>{row.error.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {onCopy && (
                <button type="button" className={buttonClass} onClick={() => onCopy(row)}>Kopiuj</button>
              )}
              {canPrint(row) && (
                <button
                  type="button"
                  disabled={busy}
                  className={buttonClass}
                  onClick={() => run(row.id, () => ehealthHelper.previewDocument(row.service, row.id))}
                >
                  Podgląd PDF
                </button>
              )}
              {canPrint(row) && (
                <button
                  type="button"
                  disabled={busy}
                  className={buttonClass}
                  onClick={() => run(row.id, () => ehealthHelper.printDocument(row.service, row.id))}
                >
                  Drukuj
                </button>
              )}
              {!cancelled && (
                <button type="button" className={buttonClass} onClick={() => sendSms(row)}>Wyślij SMS</button>
              )}
              {canCancel(row) && (
                <button
                  type="button"
                  disabled={busy}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  onClick={() => {
                    if (!window.confirm("Anulować ten dokument?")) return;
                    const reason = row.service === "prescription" ? window.prompt("Powód anulowania e-recepty (co najmniej 5 znaków)") : "I";
                    if (row.service === "prescription" && (!reason || reason.trim().length < 5)) return;
                    run(row.id, () => ehealthHelper.cancelDocument(row.service, row.id, reason.trim()), "Anulowano");
                  }}
                >
                  Anuluj
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default VisitIssuedDocuments;
