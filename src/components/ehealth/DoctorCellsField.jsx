import React, { useEffect, useState } from "react";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";

/**
 * Cells (komórki) a doctor works in, taken from the list kept in the integration settings. The default cell is
 * what the e-prescription, e-referral and e-ZLA windows start with.
 */
export default function DoctorCellsField({ cellIds = [], defaultCellId = "", onChange }) {
  const [cells, setCells] = useState(null);

  useEffect(() => {
    let cancelled = false;
    ehealthAdminHelper
      .listCells()
      .then((res) => {
        if (!cancelled) setCells((res?.data?.cells || []).filter((c) => c.active));
      })
      .catch(() => {
        if (!cancelled) setCells([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (cells === null) return <p className="text-xs text-gray-500">Wczytywanie komórek…</p>;

  const toggle = (id) => {
    const next = cellIds.includes(id) ? cellIds.filter((x) => x !== id) : [...cellIds, id];
    onChange(next, next.includes(defaultCellId) ? defaultCellId : next[0] || "");
  };

  return (
    <div>
      <p className="block text-xs font-medium text-gray-700 mb-1">Komórki / miejsce pracy (z ustawień integracji e-Zdrowie)</p>
      {cells.length === 0 ? (
        <p className="text-xs text-gray-500">
          Brak komórek na liście. Dodaj je w Administracja → Integracje e-Zdrowie → Komórki organizacyjne.
        </p>
      ) : (
        <div className="space-y-1 rounded-md border border-gray-200 p-2">
          {cells.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-800">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={cellIds.includes(c.id)} onChange={() => toggle(c.id)} />
                <span className="font-mono text-xs text-gray-500">{c.code}</span>
                <span>{c.name}</span>
              </label>
              {!c.synced && <span className="rounded bg-rose-50 px-1.5 text-[11px] text-rose-700">nie wysłana do Medfile</span>}
              {cellIds.includes(c.id) && cellIds.length > 1 && (
                <label className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                  <input type="radio" name="defaultCell" checked={defaultCellId === c.id} onChange={() => onChange(cellIds, c.id)} />
                  domyślna
                </label>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-500">Bez przypisania lekarz może wystawiać dokumenty w każdej aktywnej komórce.</p>
    </div>
  );
}
