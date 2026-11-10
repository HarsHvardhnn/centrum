import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";

const EMPTY = { code: "", name: "", specialityCode: "", speciality: "", unitCode: "", unitName: "" };
const input = "w-full p-2 border border-gray-300 rounded-lg text-sm";

const errText = (err) => err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Operacja nie powiodła się";

/**
 * The clinic's organizational cells (komórki). Medfile treats each cell as its own organization, so a cell
 * must be sent to Medfile once before documents can be issued under it. Doctors are assigned to cells in their form.
 */
export default function CellsPanel() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null); // null = closed, {id?, ...fields}
  const [busy, setBusy] = useState("");

  const load = async () => {
    try {
      const res = await ehealthAdminHelper.listCells();
      setData(res?.data || { cells: [] });
    } catch (err) {
      toast.error(errText(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p className="text-sm text-gray-500">Wczytywanie komórek…</p>;
  const cells = data.cells || [];
  const pending = cells.filter((c) => c.active && !c.synced).length;

  const run = async (key, fn, okText) => {
    try {
      setBusy(key);
      const res = await fn();
      if (res?.success === false) throw new Error(res?.error?.message || res?.message || "Błąd");
      if (okText) toast.success(typeof okText === "function" ? okText(res) : okText);
      await load();
      return res;
    } catch (err) {
      toast.error(errText(err));
      return null;
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    const payload = { ...form };
    const res = await run(
      "save",
      () => (form.id ? ehealthAdminHelper.updateCell(form.id, payload) : ehealthAdminHelper.createCell(payload)),
      "Zapisano komórkę. Wyślij ją do Medfile, aby można było wystawiać dokumenty."
    );
    if (res) setForm(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">Komórki organizacyjne (miejsca pracy)</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setForm({ ...EMPTY })} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white">
            + Dodaj komórkę
          </button>
          {cells.length === 0 && (
            <button
              type="button"
              disabled={busy === "seed"}
              onClick={() => run("seed", () => ehealthAdminHelper.seedCells(), (r) => `Dodano ${r?.data?.created ?? 0} komórek. Sprawdź kody i nazwy.`)}
              className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-800 disabled:opacity-50"
            >
              Wczytaj komórki Centrum (11)
            </button>
          )}
          {cells.length > 0 && (
            <button
              type="button"
              disabled={busy === "all" || !pending}
              onClick={() =>
                run("all", () => ehealthAdminHelper.syncAllCells(), (r) => {
                  const f = r?.data?.failed || [];
                  return `Wysłano do Medfile: ${r?.data?.synced ?? 0}${f.length ? `, błędy: ${f.length}` : ""}`;
                }).then((r) => {
                  const f = r?.data?.failed || [];
                  if (f.length) toast.error(f.map((x) => `${x.cell}: ${x.message}`).join("; "));
                })
              }
              className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-800 disabled:opacity-50"
            >
              {busy === "all" ? "Wysyłam…" : `Wyślij wszystkie do Medfile${pending ? ` (${pending})` : ""}`}
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Środowisko: {data.environment === "production" ? "produkcja" : "test"}. Kody jak w rejestrze RPWDL: komórka (część VII) 3 cyfry, specjalność (część VIII) 4 cyfry.
        Certyfikaty P1 wysłane powyżej trafiają też do wszystkich wysłanych komórek.
      </p>

      {form && (
        <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3 space-y-2">
          <p className="text-sm font-medium text-gray-800">{form.id ? "Edytuj komórkę" : "Nowa komórka"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="text-xs text-gray-600">Kod komórki (część VII) *
              <input className={input} value={form.code} maxLength={3} placeholder="np. 007" onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "") })} />
            </label>
            <label className="text-xs text-gray-600">Nazwa komórki *
              <input className={input} value={form.name} placeholder="np. Poradnia Kardiologiczna" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="text-xs text-gray-600">Kod specjalności (część VIII)
              <input className={input} value={form.specialityCode} maxLength={4} placeholder="np. 1100" onChange={(e) => setForm({ ...form, specialityCode: e.target.value.replace(/\D/g, "") })} />
            </label>
            <label className="text-xs text-gray-600">Nazwa specjalności
              <input className={input} value={form.speciality} placeholder="np. Poradnia kardiologiczna" onChange={(e) => setForm({ ...form, speciality: e.target.value })} />
            </label>
            <label className="text-xs text-gray-600">Kod jednostki (część V) — puste = z danych placówki
              <input className={input} value={form.unitCode} maxLength={2} placeholder="np. 01" onChange={(e) => setForm({ ...form, unitCode: e.target.value.replace(/\D/g, "") })} />
            </label>
            <label className="text-xs text-gray-600">Nazwa jednostki — puste = z danych placówki
              <input className={input} value={form.unitName} onChange={(e) => setForm({ ...form, unitName: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={busy === "save"} onClick={save} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Zapisz</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700">Anuluj</button>
          </div>
        </div>
      )}

      {cells.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          Brak komórek. Dopóki lista jest pusta, dokumenty są wystawiane na organizacji z ustawień powyżej (jedna komórka).
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Kod</th>
                <th className="px-3 py-2 text-left">Nazwa</th>
                <th className="px-3 py-2 text-left">Specjalność</th>
                <th className="px-3 py-2 text-left">Medfile</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {cells.map((c) => (
                <tr key={c.id} className={`border-t border-gray-100 ${c.active ? "" : "opacity-50"}`}>
                  <td className="px-3 py-2 font-mono">{c.code}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{c.name}</td>
                  <td className="px-3 py-2 text-gray-600">{c.specialityCode || "—"}{c.speciality ? ` · ${c.speciality}` : ""}</td>
                  <td className="px-3 py-2">
                    {c.synced ? <span className="text-emerald-700">wysłana</span> : <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700">nie wysłana</span>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap space-x-1">
                    <button type="button" disabled={busy === `s${c.id}`} onClick={() => run(`s${c.id}`, () => ehealthAdminHelper.syncCell(c.id), c.synced ? "Zaktualizowano w Medfile" : "Wysłano do Medfile")} className="rounded-lg border border-teal-700 px-2 py-1 text-xs font-semibold text-teal-800 disabled:opacity-50">
                      {c.synced ? "Aktualizuj" : "Wyślij do Medfile"}
                    </button>
                    <button type="button" onClick={() => setForm({ ...c })} className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700">Edytuj</button>
                    <button type="button" onClick={() => run(`t${c.id}`, () => ehealthAdminHelper.updateCell(c.id, { active: !c.active }))} className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700">{c.active ? "Wyłącz" : "Włącz"}</button>
                    <button type="button" onClick={() => { if (window.confirm(`Usunąć komórkę ${c.code} ${c.name}? Zostanie odpięta od lekarzy.`)) run(`d${c.id}`, () => ehealthAdminHelper.deleteCell(c.id), "Usunięto komórkę"); }} className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700">Usuń</button>
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
