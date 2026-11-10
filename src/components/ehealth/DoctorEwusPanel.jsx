import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import EwusAccountForm from "./EwusAccountForm";

const MODE_LABEL = { auto: "klucz MFA zapisany", manual: "kod wpisuje lekarz", none: "bez MFA (konto testowe)" };

/**
 * Admin overview of every doctor's own eWUŚ account. The administrator can fill an account in on the doctor's
 * behalf (login, password, MFA key); passwords and keys are never shown again.
 */
export default function DoctorEwusPanel() {
  const [data, setData] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    try {
      const res = await ehealthAdminHelper.listDoctorEwus();
      setData(res?.data || null);
    } catch (err) {
      toast.error(err?.message || "Nie udało się wczytać kont eWUŚ lekarzy");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p className="text-sm text-gray-500">Wczytywanie kont eWUŚ lekarzy…</p>;
  const configured = data.doctors.filter((d) => d.configured).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">eWUŚ — konta lekarzy</p>
        <span className="text-xs text-gray-600">Uzupełnione: {configured} z {data.doctors.length}</span>
      </div>
      {!data.perDoctor && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
          Teraz eWUŚ działa na koncie wspólnym przychodni. Aby każdy lekarz używał własnego konta NFZ, wybierz powyżej „Konto każdego lekarza” i zapisz.
          Dane lekarzy poniżej można uzupełnić już teraz.
        </p>
      )}
      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Lekarz</th>
              <th className="px-3 py-2 text-left">PWZ</th>
              <th className="px-3 py-2 text-left">Konto NFZ</th>
              <th className="px-3 py-2 text-left">Oddział</th>
              <th className="px-3 py-2 text-left">Kod MFA</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {data.doctors.map((d) => (
              <React.Fragment key={d.id}>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-900">{d.name}</td>
                  <td className="px-3 py-2 text-gray-600">{d.pwz || "—"}</td>
                  <td className="px-3 py-2">
                    {d.configured ? (
                      <span className="text-emerald-700">{d.username}</span>
                    ) : (
                      <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700">brak danych</span>
                    )}
                    {!d.hasPractitioner && <div className="text-xs text-amber-700">brak practitionera w Medfile</div>}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{d.domain ? `${d.domain} — ${data.branches[d.domain] || ""}` : "—"}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {d.configured ? (d.mode === "auto" && !d.hasTotp ? <span className="text-rose-700">brak klucza</span> : MODE_LABEL[d.mode] || d.mode) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" onClick={() => setOpenId(openId === d.id ? null : d.id)} className="rounded-lg border border-teal-700 px-2.5 py-1 text-xs font-semibold text-teal-800">
                      {openId === d.id ? "Zwiń" : d.configured ? "Edytuj" : "Uzupełnij"}
                    </button>
                  </td>
                </tr>
                {openId === d.id && (
                  <tr className="border-t border-gray-100 bg-gray-50/60">
                    <td colSpan={6} className="px-3 py-3">
                      <EwusAccountForm scope="doctor" doctorId={d.id} onSaved={load} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
