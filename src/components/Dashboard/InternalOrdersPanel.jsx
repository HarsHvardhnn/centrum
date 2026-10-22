import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import clinicFlowHelper, { formatOrderWhen, orderStatusMeta } from "../../helpers/clinicFlowHelper";

function detailRows(row) {
  const doctor = row.requestedDoctorName
    ? row.requestedDoctorName
    : row.anySpecialist
      ? "Dowolny specjalista"
      : "";
  return [
    ["Pacjent", row.patientName || "Pacjent"],
    ["Zlecił", row.orderedByName || "Lekarz"],
    ["Data i godzina", formatOrderWhen(row.createdAt) || "—"],
    row.specialization ? ["Specjalizacja", row.specialization] : null,
    doctor ? ["Lekarz", doctor] : null,
    row.performingDoctorName ? ["Wykonuje", row.performingDoctorName] : null,
  ].filter(Boolean);
}

export function OrderDetailsDialog({ row, onClose, onBook, onCancel }) {
  const badge = orderStatusMeta(row.status);
  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <h3 id="order-details-title" className="text-base font-bold text-slate-900">{row.exam}</h3>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>{badge.label}</span>
            <button type="button" onClick={onClose} className="text-slate-500 text-xl leading-none" aria-label="Zamknij">×</button>
          </div>
        </div>
        <dl className="px-5 py-4 space-y-3">
          {detailRows(row).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-slate-900 font-medium">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-sm text-slate-500">Opis</dt>
            <dd className="mt-1 text-sm text-slate-800 whitespace-pre-wrap break-words">{row.note || "Brak opisu."}</dd>
          </div>
        </dl>
        <div className="px-5 py-3 border-t grid grid-cols-3 items-center gap-2">
          <button type="button" onClick={onClose} className="justify-self-start px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600">Zamknij</button>
          <div className="justify-self-center">
            {row.status === "open" && onCancel && (
              <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-red-300 text-sm font-semibold text-red-600">Anuluj zlecenie</button>
            )}
          </div>
          <div className="justify-self-end">
            {row.status === "open" && onBook && (
              <button type="button" onClick={onBook} className="px-3 py-1.5 rounded-lg bg-[#1b766a] text-white text-sm font-semibold">Umów wizytę</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternalOrdersPanel() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    clinicFlowHelper.listOrders("open").then((data) => setRows(Array.isArray(data) ? data : [])).catch(() => setRows([]));
  };

  useEffect(() => { load(); }, []);

  const selected = rows.find((row) => row.id === openId) || null;

  const cancel = async (row) => {
    try {
      await clinicFlowHelper.cancelOrder(row.id);
      toast.success("Zlecenie anulowane");
      setOpenId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Nie udało się anulować zlecenia");
    }
  };

  if (!rows.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-6 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Zlecenia wewnętrzne</h2>
          <Link to="/administracja/zlecenia-wewnetrzne" className="text-xs font-semibold text-teal-800">Historia zleceń</Link>
        </div>
        <p className="text-xs text-slate-500 mt-1">Brak otwartych zleceń. Recepcja umawia je bez zmiany statusu pacjenta.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#1b766a] mt-6 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900">Zlecenia wewnętrzne</h2>
        <Link to="/administracja/zlecenia-wewnetrzne" className="text-xs font-semibold text-teal-800">Historia zleceń</Link>
      </div>
      <p className="text-xs text-slate-500 mt-1">Badania i konsultacje zlecone w przychodni. Szczegóły i opis są w oknie podglądu.</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => {
          const badge = orderStatusMeta(row.status);
          return (
            <div key={row.id} className="border border-slate-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900 truncate">{row.exam}</div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>{badge.label}</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5 truncate">
                  <span className="text-slate-500">Pacjent:</span> <span className="font-medium text-slate-800">{row.patientName || "—"}</span>
                  <span className="text-slate-300"> · </span>
                  <span className="text-slate-500">Zlecił:</span> <span className="font-medium text-slate-800">{row.orderedByName || "—"}</span>
                  {row.createdAt ? <span className="text-slate-500">{` · ${formatOrderWhen(row.createdAt)}`}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setOpenId(row.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Zobacz szczegóły
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/wizyta/utworz?orderId=${row.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#1b766a] text-white text-xs font-semibold"
                >
                  Umów wizytę
                </button>
                <button
                  type="button"
                  onClick={() => cancel(row)}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                >
                  Anuluj
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {selected && (
        <OrderDetailsDialog
          row={selected}
          onClose={() => setOpenId(null)}
          onBook={() => navigate(`/wizyta/utworz?orderId=${selected.id}`)}
          onCancel={() => cancel(selected)}
        />
      )}
    </div>
  );
}
