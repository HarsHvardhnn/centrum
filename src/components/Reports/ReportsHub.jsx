import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, ClipboardList, ChevronLeft } from "lucide-react";
import ReportsDashboard from "./ReportsDashboard";
import OrdersReportDialog from "../Dashboard/OrdersReportDialog";

const REPORT_TYPES = [
  {
    id: "wizyty",
    title: "Raport wizyt lekarskich",
    description: "Zestawienia statystyczne i raporty z przeprowadzonych wizyt lekarskich.",
    icon: BarChart3,
  },
  {
    id: "zlecenia",
    title: "Raport zleceń wewnętrznych",
    description: "Badania i konsultacje specjalistyczne zlecone w przychodni, wraz z informacją o umówieniu i anulowaniu.",
    icon: ClipboardList,
  },
];

const emptyOrderFilters = { q: "", status: "all", from: "", to: "", kind: "" };

const fieldClass = "mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white";

function OrdersReportPanel() {
  const [filters, setFilters] = useState(emptyOrderFilters);
  const [reportFilters, setReportFilters] = useState(null);
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-4xl">
      <h2 className="text-lg font-bold text-slate-900">Raport zleceń wewnętrznych</h2>
      <p className="text-sm text-slate-600 mt-1">Wybierz zakres, a potem wygeneruj raport. Podgląd otworzy się w tym oknie, z opcją wydruku oraz pobrania PDF, CSV i XML.</p>
      <form
        className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-x-5 gap-y-4"
        onSubmit={(event) => { event.preventDefault(); setReportFilters({ ...filters }); }}
      >
        <label className="text-xs font-semibold text-slate-600 md:col-span-2">Pacjent
          <input type="search" value={filters.q} onChange={(event) => setFilter("q", event.target.value)} placeholder="Imię, nazwisko lub PESEL" className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-600">Utworzono od
          <input type="date" value={filters.from} onChange={(event) => setFilter("from", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-600">Utworzono do
          <input type="date" value={filters.to} onChange={(event) => setFilter("to", event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-600">Status
          <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)} className={fieldClass}>
            <option value="all">Wszystkie</option>
            <option value="open">Skierowana</option>
            <option value="booked">Zarezerwowana</option>
            <option value="completed">Zakończona</option>
            <option value="cancelled">Anulowana</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Typ zlecenia
          <select value={filters.kind} onChange={(event) => setFilter("kind", event.target.value)} className={fieldClass}>
            <option value="">Wszystkie</option>
            <option value="exam">Badanie</option>
            <option value="consultation">Konsultacja specjalistyczna</option>
          </select>
        </label>
        <div className="md:col-span-4 flex items-center gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#1b766a] text-white text-sm font-semibold">Generuj raport</button>
          <button type="button" onClick={() => setFilters(emptyOrderFilters)} className="px-4 py-2 rounded-lg border text-sm font-semibold text-slate-600">Wyczyść</button>
        </div>
      </form>
      {reportFilters && <OrdersReportDialog filters={reportFilters} onClose={() => setReportFilters(null)} />}
    </div>
  );
}

export default function ReportsHub() {
  const [params, setParams] = useSearchParams();
  const type = params.get("typ");
  const selected = REPORT_TYPES.find((item) => item.id === type);

  if (selected?.id === "wizyty") {
    return (
      <div>
        <div className="px-6 pt-4">
          <button type="button" onClick={() => setParams({})} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800">
            <ChevronLeft size={16} /> Wszystkie raporty
          </button>
        </div>
        <ReportsDashboard />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 lg:px-10 py-6">
      {selected ? (
        <button type="button" onClick={() => setParams({})} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 mb-4">
          <ChevronLeft size={16} /> Wszystkie raporty
        </button>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-teal-800">Raporty</h1>
          <p className="text-sm text-slate-600 mt-1">Wybierz rodzaj raportu, który chcesz wygenerować.</p>
        </>
      )}
      {selected?.id === "zlecenia" ? (
        <OrdersReportPanel />
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setParams({ typ: item.id })}
                className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-500 hover:shadow-sm transition"
              >
                <span className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center"><Icon size={20} /></span>
                <span className="block mt-3 text-base font-bold text-slate-900">{item.title}</span>
                <span className="block mt-1 text-sm text-slate-600">{item.description}</span>
                <span className="block mt-3 text-sm font-semibold text-teal-700">Wybierz →</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
