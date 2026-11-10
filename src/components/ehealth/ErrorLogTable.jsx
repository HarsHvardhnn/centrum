import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";

const RETRY = {
  prescription: (id) => ehealthHelper.retryPrescription(id),
  referral: (id) => ehealthHelper.retryReferral(id),
  ezla: (id) => ehealthHelper.retryEzla(id),
};

/**
 * "Dziennik błędów": failed documents grouped by document + doctor + cause. The cause is the full P1 / Medfile
 * answer (with the error code), the next column says what to do, "Ponów" retries the newest document of a group.
 */
export default function ErrorLogTable() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [open, setOpen] = useState(null);

  const load = async () => {
    try {
      const res = await ehealthAdminHelper.getErrorLog();
      setData(res?.data || { groups: [], total: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Nie udało się wczytać dziennika błędów");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const retry = async (g) => {
    const fn = RETRY[g.service];
    if (!fn) return toast.error("Tego dokumentu nie da się ponowić z tego miejsca.");
    try {
      setBusy(g.key);
      const res = await fn(g.retryDocumentId);
      const status = res?.data?.status;
      toast[status === "failed" ? "error" : "success"](status === "failed" ? "Ponowienie nie powiodło się — sprawdź przyczynę." : "Ponowiono dokument.");
      await load();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy("");
    }
  };

  if (!data) return <p className="text-sm text-gray-500">Wczytywanie dziennika błędów…</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Dziennik błędów <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{data.groups.length}</span></h3>
        <button type="button" onClick={load} className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-700">Odśwież</button>
      </div>
      {data.groups.length === 0 ? (
        <p className="text-xs text-gray-500">Brak błędów. Dokumenty, które się nie udały, pojawią się tutaj.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Ostatnio</th>
                <th className="px-3 py-2 text-left">Dokument</th>
                <th className="px-3 py-2 text-left">Lekarz</th>
                <th className="px-3 py-2 text-left">Przyczyna</th>
                <th className="px-3 py-2 text-left">Co zrobić</th>
                <th className="px-3 py-2 text-right">Razy</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => (
                <tr key={g.key} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{g.lastSeen ? new Date(g.lastSeen).toLocaleString("pl-PL") : "—"}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{g.label}</td>
                  <td className="px-3 py-2 text-gray-700">{g.doctorName || "—"}</td>
                  <td className="px-3 py-2 text-gray-800 max-w-xs">
                    <div>{g.message}</div>
                    {g.providerCode && <div className="font-mono text-[11px] text-gray-500">kod: {g.providerCode}</div>}
                    {g.detail && g.detail !== g.message && (
                      <>
                        <button type="button" onClick={() => setOpen(open === g.key ? null : g.key)} className="mt-0.5 text-[11px] font-semibold text-teal-700 underline">
                          {open === g.key ? "Ukryj pełną odpowiedź" : "Pełna odpowiedź"}
                        </button>
                        {open === g.key && <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-gray-50 p-2 text-[11px] text-gray-700">{g.detail}</pre>}
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs">{g.hint || "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold">{g.count}</td>
                  <td className="px-3 py-2 text-right">
                    {RETRY[g.service] && (
                      <button type="button" disabled={busy === g.key} onClick={() => retry(g)} className="rounded-lg border border-teal-700 px-2.5 py-1 font-semibold text-teal-800 disabled:opacity-50">
                        {busy === g.key ? "…" : "Ponów"}
                      </button>
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
}
