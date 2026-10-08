import React, { useEffect, useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import ehealthHelper, {
  unwrapEhealthError,
  drugsFromHistory,
  drugMatches,
} from "../../helpers/ehealthHelper";
import { ERROR_CODE_LABELS, STATUS_LABELS, statusClass } from "./ehealthStatus";

const PAYMENTS = [
  { value: "100%", label: "100% — pełnopłatny" },
  { value: "50%", label: "50%" },
  { value: "30%", label: "30%" },
  { value: "R", label: "Ryczałt" },
  { value: "B", label: "Bezpłatny" },
];

const MAX_ITEMS = 5;

function itemKey(drug, index) {
  return `${drug?.ean || drug?.id || drug?.name || "lek"}-${index}-${Date.now()}`;
}

function newItem(drug) {
  return {
    key: itemKey(drug),
    drug,
    quantity: "1",
    dosage: "",
    payment: "100%",
  };
}

function itemsFromPayload(payload) {
  if (Array.isArray(payload?.items) && payload.items.length) {
    return payload.items.map((item, index) => ({
      key: `copy-${index}`,
      drug: item.drug,
      quantity: String(item.quantity || "1"),
      dosage: item.dosage || "",
      payment: item.payment || "100%",
    }));
  }
  if (payload?.drug) {
    return [{
      key: "copy-0",
      drug: payload.drug,
      quantity: String(payload.quantity || "1"),
      dosage: payload.dosage || "",
      payment: payload.payment || "100%",
    }];
  }
  return [];
}

function favouriteKey() {
  return "cm7-ehealth-favourite-drugs";
}

function readFavourites() {
  try {
    const raw = JSON.parse(localStorage.getItem(favouriteKey()) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const PrescriptionComposer = ({ visitId, patientId, onDocumentsChanged, initialPayload }) => {
  const copied = itemsFromPayload(initialPayload);
  const [step, setStep] = useState(copied.length ? 2 : 1);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [historyDrugs, setHistoryDrugs] = useState([]);
  const [favourites, setFavourites] = useState(readFavourites);
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState(copied);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!patientId) return undefined;
    let cancelled = false;
    ehealthHelper
      .history({ patientId })
      .then((res) => {
        if (!cancelled) setHistoryDrugs(drugsFromHistory(res?.data));
      })
      .catch(() => {
        if (!cancelled) setHistoryDrugs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (step !== 1 || result) return undefined;
    const term = query.trim();
    if (term.length < 2) {
      setCatalog([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await ehealthHelper.searchDrugs(term);
        if (cancelled) return;
        if (!res?.success) throw new Error(res?.error?.message || "Szukanie nieudane");
        setCatalog(res.data || []);
      } catch (err) {
        if (!cancelled) {
          setCatalog([]);
          toast.error(unwrapEhealthError(err).message);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, step, result]);

  const toggleFavourite = (drug) => {
    setFavourites((prev) => {
      const key = drug.ean || drug.name;
      const next = prev.some((row) => (row.ean || row.name) === key)
        ? prev.filter((row) => (row.ean || row.name) !== key)
        : [drug, ...prev].slice(0, 20);
      localStorage.setItem(favouriteKey(), JSON.stringify(next));
      return next;
    });
  };

  const addDrug = (drug) => {
    if (items.length >= MAX_ITEMS) {
      toast.error("Jedna e-recepta może mieć najwyżej 5 leków.");
      return;
    }
    setItems((prev) => [...prev, newItem(drug)]);
    setQuery("");
    setCatalog([]);
  };

  const updateItem = (key, patch) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const submit = async () => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    if (!items.length) return;
    try {
      setBusy(true);
      setSubmitError(null);
      for (const item of items) {
        const ean = item.drug?.ean;
        if (!ean) continue;
        const check = await ehealthHelper.searchDrugs(item.drug.name || ean);
        const rows = check?.data || [];
        if (!rows.some((row) => row.ean === ean)) {
          throw new Error(`Lek ${item.drug.name} nie jest już w bazie Medfile. Wybierz go ponownie.`);
        }
      }
      const res = await ehealthHelper.submitPrescription({
        visitId,
        patientId,
        payload: {
          items: items.map(({ drug, quantity, dosage, payment }) => ({
            drug,
            quantity,
            dosage,
            payment,
          })),
        },
      });
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      setResult(res.data);
      onDocumentsChanged?.();
      if (res.data?.status === "failed") {
        toast.error(res.data.error?.message || "e-Recepta: błąd");
        return;
      }
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      toast.success(`e-Recepta: ${STATUS_LABELS[res.data?.status] || res.data?.status}`);
    } catch (err) {
      const parsed = unwrapEhealthError(err);
      setSubmitError(parsed);
      toast.error(parsed.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(1);
    setQuery("");
    setCatalog([]);
    setItems([]);
    setResult(null);
    setSubmitError(null);
  };

  const historyMatches = historyDrugs.filter((drug) => drugMatches(drug, query));

  if (result) {
    return (
      <div className="space-y-3">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusClass(result.status)}`}>
          {STATUS_LABELS[result.status] || result.status}
        </span>
        {result.error?.message && (
          <p className={`text-sm ${result.status === "draft" ? "text-amber-800" : "text-red-700"}`}>
            {result.error.message}
          </p>
        )}
        <ul className="text-sm text-gray-700 space-y-1">
          {items.map((item) => (
            <li key={item.key}>
              {item.drug.name} · {item.quantity} op. · {paymentLabel(item.payment)}
            </li>
          ))}
        </ul>
        <button type="button" onClick={reset} className="text-sm text-teal-700 hover:underline">
          Wystaw kolejną
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs text-gray-500">
        <span className={step === 1 ? "font-semibold text-teal-700" : ""}>1. Leki</span>
        <span className={step === 2 ? "font-semibold text-teal-700" : ""}>2. Opakowanie i odpłatność</span>
        <span className={step === 3 ? "font-semibold text-teal-700" : ""}>3. Potwierdź</span>
      </div>

      {step === 1 && (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nazwa leku lub substancja czynna"
            className="w-full p-3 border rounded-lg"
          />
          {searching && <p className="text-xs text-gray-500">Szukam w bazie leków…</p>}
          <SuggestionList
            title="Ulubione"
            drugs={favourites.filter((drug) => !query.trim() || drugMatches(drug, query))}
            onAdd={addDrug}
            onFavourite={toggleFavourite}
            favourites={favourites}
          />
          <SuggestionList
            title="Z historii wizyt"
            drugs={query.trim().length >= 1 ? historyMatches : []}
            onAdd={addDrug}
            onFavourite={toggleFavourite}
            favourites={favourites}
          />
          <SuggestionList
            title="Baza leków"
            drugs={catalog}
            onAdd={addDrug}
            onFavourite={toggleFavourite}
            favourites={favourites}
          />
          <AddedList items={items} onRemove={(key) => setItems((prev) => prev.filter((item) => item.key !== key))} />
          <button
            type="button"
            disabled={!items.length}
            onClick={() => setStep(2)}
            className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            Dalej
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {items.map((item) => (
            <div key={item.key} className="border rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">{item.drug.name}</div>
              <div className="text-xs text-gray-500">
                Opakowanie: {item.drug.package || "—"}
                {item.drug.strength ? ` · ${item.drug.strength}` : ""}
              </div>
              <label className="block text-xs text-gray-600">
                Liczba opakowań
                <input
                  value={item.quantity}
                  onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                />
              </label>
              <label className="block text-xs text-gray-600">
                Dawkowanie
                <input
                  value={item.dosage}
                  onChange={(e) => updateItem(item.key, { dosage: e.target.value })}
                  placeholder="np. 1×2"
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                />
              </label>
              <label className="block text-xs text-gray-600">
                Odpłatność
                <select
                  value={item.payment}
                  onChange={(e) => updateItem(item.key, { payment: e.target.value })}
                  className="mt-1 w-full p-2 border rounded-lg text-sm"
                >
                  {PAYMENTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="px-3 py-2 border rounded-lg text-sm">
              Wstecz
            </button>
            <button type="button" onClick={() => setStep(3)} className="px-3 py-2 bg-teal-700 text-white rounded-lg text-sm">
              Dalej
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.key} className="text-sm bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">{item.drug.name}</div>
                <div className="text-gray-600">
                  {item.quantity} op.
                  {item.drug.package ? ` (${item.drug.package})` : ""}
                  {" · "}
                  {item.dosage || "bez dawkowania"}
                  {" · "}
                  {paymentLabel(item.payment)}
                </div>
              </li>
            ))}
          </ul>
          {submitError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              <div className="font-medium">{ERROR_CODE_LABELS[submitError.code] || "Błąd"}</div>
              <div>{submitError.message}</div>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="px-3 py-2 border rounded-lg text-sm">
              Wstecz
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {busy ? "Wystawiam…" : "Wystaw"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function paymentLabel(value) {
  return PAYMENTS.find((option) => option.value === value)?.label || value;
}

function SuggestionList({ title, drugs, onAdd, onFavourite, favourites = [] }) {
  if (!drugs?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      {drugs.map((drug) => (
        <div
          key={`${title}-${drug.ean || drug.id || drug.name}`}
          className="flex items-center gap-2 border rounded-lg p-2"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-800">{drug.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {[drug.activeSubstance, drug.strength, drug.package, drug.ean ? `EAN ${drug.ean}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          {onFavourite && (
            <button
              type="button"
              onClick={() => onFavourite(drug)}
              className="shrink-0 p-2 text-amber-600"
              aria-label={`Ulubiony ${drug.name}`}
            >
              <Star size={16} fill={favourites.some((row) => (row.ean || row.name) === (drug.ean || drug.name)) ? "currentColor" : "none"} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onAdd(drug)}
            className="shrink-0 p-2 rounded-lg bg-teal-700 text-white"
            aria-label={`Dodaj ${drug.name}`}
          >
            <Plus size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddedList({ items, onRemove }) {
  if (!items.length) {
    return <p className="text-xs text-gray-400">Dodaj leki przyciskiem plus, potem przejdź dalej.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Dodane leki ({items.length}/{MAX_ITEMS})</p>
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-2 border rounded-lg p-2">
          <div className="text-sm text-gray-800">{item.drug.name}</div>
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            className="p-1 text-gray-500 hover:text-red-600"
            aria-label={`Usuń ${item.drug.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default PrescriptionComposer;
