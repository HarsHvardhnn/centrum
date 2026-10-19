import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import clinicFlowHelper from "../../helpers/clinicFlowHelper";

export default function InternalOrdersPanel() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const load = () => {
    clinicFlowHelper.listOrders("open").then((data) => setRows(Array.isArray(data) ? data : [])).catch(() => setRows([]));
  };

  useEffect(() => { load(); }, []);

  if (!rows.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-200 mt-6 p-4">
      <h2 className="text-sm font-bold text-slate-900">Zlecenia wewnętrzne</h2>
      <p className="text-xs text-slate-500 mt-1">Badania zlecone w przychodni. Umów wizytę tak jak zwykle. Status pacjenta się nie zmienia.</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{row.exam}</div>
              <div className="text-xs text-slate-600 mt-0.5">
                {row.patientName || "Pacjent"} · zlecił {row.orderedByName || "lekarz"}
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
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Anuluj
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
