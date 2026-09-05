import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import ehealthHelper from "../../helpers/ehealthHelper";
import { SERVICE_LABELS, STATUS_LABELS, statusClass } from "./ehealthStatus";

const EhealthHistoryPage = () => {
  const [searchParams] = useSearchParams();
  const [visitId, setVisitId] = useState(searchParams.get("visitId") || "");
  const [patientId, setPatientId] = useState(searchParams.get("patientId") || "");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ehealthHelper.history({
        visitId: visitId || undefined,
        patientId: patientId || undefined,
      });
      if (!res?.success) throw new Error(res?.error?.message || "Błąd historii");
      setRows(res.data || []);
    } catch (err) {
      toast.error(err.message || "Nie udało się pobrać historii");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-2">Historia e-Zdrowie</h1>
      <p className="text-sm text-gray-500 mb-6">
        Dokumenty z CM7MED (mock / Medfile). Filtr po wizycie lub pacjencie.
      </p>

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={visitId}
          onChange={(e) => setVisitId(e.target.value)}
          placeholder="ID wizyty"
          className="p-2 border rounded-lg text-sm"
        />
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="ID pacjenta"
          className="p-2 border rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm"
        >
          Filtruj
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-3">Typ</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Czas</th>
                <th className="text-left p-3">Id zewnętrzny</th>
                <th className="text-left p-3">Wizyta</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Brak dokumentów. Wystaw je z karty wizyty.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{SERVICE_LABELS[row.service] || row.service}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
                      {STATUS_LABELS[row.status] || row.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString("pl-PL") : "—"}
                  </td>
                  <td className="p-3 font-mono text-xs">{row.externalId || "—"}</td>
                  <td className="p-3">
                    {row.visitId ? (
                      <Link
                        className="text-teal-700 hover:underline"
                        to={`/szczegoly-pacjenta/${row.patientId || ""}?appointmentId=${row.visitId}`}
                      >
                        Karta wizyty
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EhealthHistoryPage;
