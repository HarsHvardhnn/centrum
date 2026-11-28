import { useEffect, useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";

/** Part VIII resort codes, served from the database (replaced by CSV upload in the e-Zdrowie settings). */
export const RESORT_SECTIONS = {
  "0": "Podstawowa opieka zdrowotna",
  "1": "Poradnie specjalistyczne",
  "2": "Ośrodki (zespoły) opieki pozaszpitalnej",
  "3": "Pomoc doraźna i ratownictwo medyczne",
  "4": "Oddziały szpitalne i inne komórki opieki szpitalnej",
  "5": "Zakłady opiekuńczo-lecznicze i pielęgnacyjno-opiekuńcze",
  "6": "Jednostki lecznictwa uzdrowiskowego",
  "7": "Pracownie diagnostyczne lub zabiegowe",
  "8": "Pracownie protetyczne, przedmiotów ortopedycznych, środków pomocniczych, krwi i tkanek",
  "9": "Inne komórki organizacyjne działalności medycznej",
};

let cache = null;
const listeners = new Set();

export function loadResortCodes(force = false) {
  if (force || !cache) {
    cache = apiCaller("GET", "/api/ehealth/resort-codes")
      .then((res) => {
        const data = res.data?.data || { rows: [], versionDate: "" };
        return {
          versionDate: data.versionDate,
          rows: data.rows.map((row) => ({ ...row, group: RESORT_SECTIONS[row.code[0]] || "", full: `${row.code} - ${row.name}` })),
        };
      })
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
}

/** Called after an upload so that open screens show the new list. */
export async function refreshResortCodes() {
  const next = await loadResortCodes(true);
  listeners.forEach((listener) => listener(next));
  return next;
}

export function useResortCodes() {
  const [state, setState] = useState({ rows: [], versionDate: "", loading: true, error: "" });
  useEffect(() => {
    let cancelled = false;
    const apply = (data) => !cancelled && setState({ ...data, loading: false, error: "" });
    listeners.add(apply);
    loadResortCodes().then(apply).catch(() => !cancelled && setState({ rows: [], versionDate: "", loading: false, error: "Nie udało się pobrać wykazu kodów komórek. Odśwież stronę." }));
    return () => {
      cancelled = true;
      listeners.delete(apply);
    };
  }, []);
  return state;
}
