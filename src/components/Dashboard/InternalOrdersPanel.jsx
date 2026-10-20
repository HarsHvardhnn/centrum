import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import clinicFlowHelper, { formatOrderWhen, orderStatusMeta } from "../../helpers/clinicFlowHelper";

export default function InternalOrdersPanel() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const load = () => {
    clinicFlowHelper.listOrders("open").then((data) => setRows(Array.isArray(data) ? data : [])).catch(() => setRows([]));
  };

  useEffect(() => { load(); }, []);

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
    <div className="bg-white rounded-lg shadow-sm border border-amber-200 mt-6 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900">Zlecenia wewnętrzne</h2>
        <Link to="/administracja/zlecenia-wewnetrzne" className="text-xs font-semibold text-teal-800">Historia zleceń</Link>
      </div>
      <p className="text-xs text-slate-500 mt-1">Badania i konsultacje zlecone w przychodni. Umów wizytę tak jak zwykle. Status pacjenta się nie zmienia.</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => {
          const badge = orderStatusMeta(row.status);
          return (
            <div key={row.id} className="border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-slate-900">{row.exam}</div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>{badge.label}</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {row.patientName || "Pacjent"} · zlecił {row.orderedByName || "lekarz"}
                  {row.createdAt ? ` · ${formatOrderWhen(row.createdAt)}` : ""}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {row.specialization || ""}
                  {row.requestedDoctorName ? ` · ${row.requestedDoctorName}` : row.anySpecialist ? " · Dowolny specjalista" : ""}
                </div>
                {row.note ? <p className="text-xs text-slate-500 mt-1">{row.note}</p> : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/wizyta/utworz?orderId=${row.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#1b766a] text-white text-xs font-semibold"
                >
                  Umów wizytę
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await clinicFlowHelper.cancelOrder(row.id);
                      toast.success("Zlecenie anulowane");
                      load();
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Nie udało się anulować zlecenia");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Anuluj
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
