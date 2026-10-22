import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../../context/userContext";
import clinicFlowHelper, {
  CONSULTATION_EXAM,
  formatOrderWhen,
  orderStatusMeta,
} from "../../helpers/clinicFlowHelper";
import { OrderDetailsDialog } from "./InternalOrdersPanel";

const STATUSES = [
  { id: "all", label: "Wszystkie" },
  { id: "open", label: "Skierowana" },
  { id: "booked", label: "Zarezerwowana" },
  { id: "completed", label: "Zakończona" },
  { id: "cancelled", label: "Anulowana" },
];

const emptyFilters = {
  status: "all",
  from: "",
  to: "",
  orderedBy: "",
  requestedDoctor: "",
  specialization: "",
  exam: "",
  kind: "",
};

export default function InternalOrdersHistory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [openId, setOpenId] = useState(null);
  const isStaff = user?.role === "admin" || user?.role === "receptionist";

  const load = (next = filters) => {
    clinicFlowHelper
      .listOrders(next)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  };

  useEffect(() => {
    load(emptyFilters);
    clinicFlowHelper.doctors().then((data) => setDoctors(Array.isArray(data) ? data : [])).catch(() => setDoctors([]));
  }, []);

  const specializations = useMemo(
    () => [...new Set(doctors.flatMap((doctor) => doctor.specializations || []))].sort(),
    [doctors]
  );

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const selected = rows.find((row) => row.id === openId) || null;

  const cancel = async (row) => {
    try {
      await clinicFlowHelper.cancelOrder(row.id);
      toast.success("Zlecenie anulowane");
      setOpenId(null);
      load(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Nie udało się anulować");
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-6 lg:px-10 py-6">
      <h1 className="text-2xl font-bold text-teal-800">Historia zleceń wewnętrznych</h1>
      <p className="text-sm text-slate-600 mt-1">
        Badania i konsultacje specjalistyczne zlecone w przychodni. Status zmienia się wraz z umówioną wizytą.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4 bg-white border border-slate-200 rounded-xl p-5">
        <label className="text-xs font-semibold text-slate-600">Status
          <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
            {STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Od
          <input type="date" value={filters.from} onChange={(event) => setFilter("from", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-slate-600">Do
          <input type="date" value={filters.to} onChange={(event) => setFilter("to", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-slate-600">Typ
          <select value={filters.kind} onChange={(event) => setFilter("kind", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Wszystkie</option>
            <option value="exam">Badanie</option>
            <option value="consultation">Konsultacja specjalistyczna</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Badanie
          <select value={filters.exam} onChange={(event) => setFilter("exam", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Wszystkie</option>
            {["EEG", "USG", "RTG", "TK", "MR", "Holter", CONSULTATION_EXAM].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Specjalizacja
          <select value={filters.specialization} onChange={(event) => setFilter("specialization", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Wszystkie</option>
            {specializations.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        {isStaff && (
          <label className="text-xs font-semibold text-slate-600">Lekarz zlecający
            <select value={filters.orderedBy} onChange={(event) => setFilter("orderedBy", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Wszyscy</option>
              {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
            </select>
          </label>
        )}
        {isStaff && (
          <label className="text-xs font-semibold text-slate-600">Lekarz wykonujący
            <select value={filters.requestedDoctor} onChange={(event) => setFilter("requestedDoctor", event.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Wszyscy</option>
              {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="button" onClick={() => load(filters)} className="px-4 py-2 rounded-lg bg-[#1b766a] text-white text-sm font-semibold">Filtruj</button>
          <button
            type="button"
            onClick={() => { setFilters(emptyFilters); load(emptyFilters); }}
            className="px-4 py-2 rounded-lg border text-sm font-semibold text-slate-600"
          >
            Wyczyść
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Utworzono</th>
              <th className="px-4 py-3">Pacjent</th>
              <th className="px-4 py-3">Zlecenie</th>
              <th className="px-4 py-3">Lekarze</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Brak zleceń dla wybranych filtrów.</td></tr>
            )}
            {rows.map((row) => {
              const badge = orderStatusMeta(row.status);
              return (
                <tr key={row.id} className="border-t border-slate-100 align-middle">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatOrderWhen(row.createdAt) || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.patientName || "Pacjent"}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{row.exam}</div>
                    {row.specialization ? <div className="text-xs text-slate-500">{row.specialization}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    <div><span className="text-slate-500">Zlecił:</span> {row.orderedByName || "—"}</div>
                    <div>
                      <span className="text-slate-500">Wykonanie:</span> {row.performingDoctorName || row.requestedDoctorName || (row.anySpecialist ? "Dowolny specjalista" : "—")}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setOpenId(row.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                      >
                        Zobacz szczegóły
                      </button>
                      {row.status === "open" && isStaff && (
                        <button
                          type="button"
                          onClick={() => navigate(`/wizyta/utworz?orderId=${row.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#1b766a] text-white text-xs font-semibold"
                        >
                          Umów wizytę
                        </button>
                      )}
                      {row.status === "open" && (
                        <button
                          type="button"
                          onClick={() => cancel(row)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-semibold text-red-600"
                        >
                          Anuluj
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && (
        <OrderDetailsDialog
          row={selected}
          onClose={() => setOpenId(null)}
          onBook={isStaff ? () => navigate(`/wizyta/utworz?orderId=${selected.id}`) : undefined}
          onCancel={() => cancel(selected)}
        />
      )}
    </div>
  );
}
