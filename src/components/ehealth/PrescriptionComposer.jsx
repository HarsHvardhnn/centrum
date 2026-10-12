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

const FORMS = [
  { value: "Rp", label: "Rp — lek gotowy, do 5 pozycji" },
  { value: "Rpw", label: "Rpw — środek odurzający lub psychotropowy, 1 pozycja" },
  { value: "Rpz", label: "Rpz — 1 pozycja" },
  { value: "recipe", label: "Receptura — opis słowny, 1 pozycja" },
];

const KINDS = [
  { value: "ZW", label: "Zwykła" },
  { value: "PA", label: "Pro auctore" },
  { value: "PF", label: "Pro familiae" },
];

const EXAMS = [
  { value: "", label: "Wybierz sposób badania" },
  { value: "BADANIE_OSOBISTE", label: "Badanie osobiste" },
  { value: "TELEPORADA", label: "Teleporada" },
];

const ENTITLEMENTS = [
  { value: "", label: "Brak uprawnienia dodatkowego" },
  { value: "IB", label: "IB" },
  { value: "IW", label: "IW" },
  { value: "ZK", label: "ZK" },
  { value: "PO", label: "PO" },
  { value: "AZ", label: "AZ" },
  { value: "WP", label: "WP" },
  { value: "CN", label: "CN" },
  { value: "DN", label: "DN" },
  { value: "C", label: "C" },
];

function itemKey(drug, index) {
  return `${drug?.ean || drug?.id || drug?.name || "lek"}-${index}-${Date.now()}`;
}

function blankItem(form, drug) {
  return {
    key: itemKey(drug, 0),
    drug: drug || { name: form === "recipe" ? "Receptura własna" : "" },
    category: form === "recipe" ? "Rp" : form,
    quantity: "1",
    dosage: "",
    payment: "100%",
    refundCode: "",
    frequency: "",
    periodHours: "24",
    durationDays: "",
    doseQuantity: "",
    doseUnit: "tabl.",
    infoForPatient: "",
    substanceName: drug?.activeSubstance || "",
    substanceQuantity: "",
    substanceUnit: "g",
    substanceWords: "",
    recipeText: "",
    recipeSummary: "M.f.",
    cito: false,
    annual: false,
    realizationFrom: "",
    noSubstitution: false,
  };
}

function itemsFromPayload(payload) {
  const form = payload?.form || "Rp";
  const source = Array.isArray(payload?.items) && payload.items.length
    ? payload.items
    : payload?.drug
      ? [payload]
      : [];
  return source.map((item, index) => ({
    ...blankItem(form, item.drug),
    ...item,
    key: `copy-${index}`,
    drug: item.drug || blankItem(form).drug,
    quantity: String(item.quantity || "1"),
    category: item.category || item.drug?.kdlek || (form === "recipe" ? "Rp" : form),
    cito: item.cito === true,
    annual: item.annual === true,
    realizationFrom: item.realizationFrom || "",
    noSubstitution: item.noSubstitution === true,
  }));
}

function headerFrom(payload) {
  return {
    form: payload?.form || "Rp",
    kind: payload?.kind || "ZW",
    issueMode: payload?.issueMode || "Z",
    examMode: payload?.examMode || "",
    entitlement: payload?.entitlement || "",
    entitlementDocument: payload?.entitlementDocument || "",
  };
}

function needsScheme(header, item) {
  return header.form !== "recipe" && (item.annual === true || (item.payment && item.payment !== "100%"));
}

function formIssues(header, items) {
  const issues = [];
  if (!items.length) issues.push("Dodaj co najmniej jeden lek.");
  if (header.form === "Rpw" && items.length > 1) {
    issues.push("Recepta Rpw może zawierać tylko jeden środek odurzający lub psychotropowy.");
  }
  if ((header.form === "Rpz" || header.form === "recipe") && items.length > 1) {
    issues.push("Ten formularz może zawierać tylko jedną pozycję.");
  }
  if (header.form === "Rp" && items.length > 5) issues.push("Jedna e-recepta Rp może mieć najwyżej 5 leków.");
  if (header.form === "Rpw" && !header.examMode) {
    issues.push("Recepta Rpw wymaga sposobu badania pacjenta: badanie osobiste albo teleporada.");
  }
  if (header.entitlement && !header.entitlementDocument.trim()) {
    issues.push("Uprawnienie dodatkowe wymaga numeru dokumentu.");
  }
  items.forEach((item) => {
    const name = item.drug?.name || "Pozycja";
    if (!item.quantity || Number(item.quantity) <= 0) issues.push(`${name}: podaj liczbę opakowań.`);
    if (header.form === "recipe") {
      if (!String(item.recipeText || "").trim()) issues.push("Receptura wymaga opisu słownego składu.");
      if (String(item.dosage || "").trim().length < 3) issues.push("Podaj sposób użycia receptury.");
    } else if (!item.drug?.ean && !item.drug?.code) {
      issues.push(`${name}: wybierz lek z bazy (EAN albo kod produktu).`);
    }
    if (needsScheme(header, item)) {
      if (!Number(item.frequency)) issues.push(`${name}: podaj, ile razy podać lek.`);
      if (!Number(item.durationDays)) issues.push(`${name}: podaj czas kuracji w dniach.`);
      if (!Number(item.doseQuantity) || !String(item.doseUnit || "").trim()) {
        issues.push(`${name}: podaj dawkę i jednostkę.`);
      }
    } else if (header.form !== "recipe" && String(item.dosage || "").trim().length < 3) {
      issues.push(`${name}: podaj dawkowanie, np. 1x1.`);
    }
    if (item.category === "Rpw" || header.form === "Rpw") {
      if (!String(item.substanceName || item.drug?.activeSubstance || "").trim()) {
        issues.push("Podaj nazwę substancji czynnej.");
      }
      if (!Number(item.substanceQuantity) || !String(item.substanceUnit || "").trim()) {
        issues.push("Podaj ilość substancji czynnej i jednostkę.");
      }
      if (!/[A-Za-zÀ-ž]/.test(String(item.substanceWords || ""))) {
        issues.push("Ilość substancji czynnej musi być zapisana słownie.");
      }
    }
    if (item.refundCode && !/^\d+$/.test(item.refundCode)) {
      issues.push(`${name}: kod wskazania refundacyjnego może zawierać tylko cyfry.`);
    }
  });
  return issues;
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
  const [header, setHeader] = useState(() => headerFrom(initialPayload));
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [historyDrugs, setHistoryDrugs] = useState([]);
  const [favourites, setFavourites] = useState(readFavourites);
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState(copied);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [signConfirmed, setSignConfirmed] = useState(false);

  const maxItems = header.form === "Rp" ? 5 : 1;

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
    if (step !== 1 || result || header.form === "recipe") return undefined;
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
  }, [query, step, result, header.form]);

  const patchHeader = (patch) => setHeader((prev) => ({ ...prev, ...patch }));

  const changeForm = (form) => {
    if (form !== "Rp" && items.length > 1) {
      toast.error("Najpierw zostaw jedną pozycję. Rpw, Rpz i receptura mieszczą tylko jeden lek.");
      return;
    }
    patchHeader({ form });
    setItems((prev) => prev.map((item) => ({
      ...item,
      category: form === "recipe" ? "Rp" : form === "Rp" ? (item.category === "OTC" ? "OTC" : "Rp") : form,
      drug: form === "recipe" ? { name: item.drug?.name || "Receptura własna" } : item.drug,
      annual: form === "recipe" || form === "Rpw" ? false : item.annual,
      realizationFrom: form === "Rpw" ? "" : item.realizationFrom,
    })));
  };

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
    if (items.length >= maxItems) {
      toast.error(header.form === "Rpw"
        ? "Recepta Rpw może zawierać tylko jeden lek."
        : `Ten formularz mieści najwyżej ${maxItems} pozycji.`);
      return;
    }
    const item = blankItem(header.form, drug);
    if (drug?.kdlek === "Rpw" || drug?.kdlek === "Rpz" || drug?.kdlek === "OTC") item.category = drug.kdlek;
    if (header.form === "Rpw") item.category = "Rpw";
    if (header.form === "Rpz") item.category = "Rpz";
    setItems((prev) => [...prev, item]);
    setQuery("");
    setCatalog([]);
  };

  const updateItem = (key, patch) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const goNext = (target) => {
    if (target === 2) {
      if (!items.length) {
        toast.error("Dodaj co najmniej jeden lek.");
        return;
      }
      if (header.form === "recipe" && !String(items[0]?.recipeText || "").trim()) {
        toast.error("Receptura wymaga opisu słownego składu.");
        return;
      }
      setStep(2);
      return;
    }
    const issues = formIssues(header, items);
    if (issues.length) {
      toast.error(issues[0]);
      return;
    }
    setStep(target);
  };

  const submit = async () => {
    if (!visitId || !patientId) {
      toast.error("Brak wizyty lub pacjenta — otwórz kartę wizyty");
      return;
    }
    const issues = formIssues(header, items);
    if (issues.length) {
      toast.error(issues[0]);
      return;
    }
    if (!signConfirmed) {
      toast.error("Potwierdź wystawienie. PIN certyfikatu nie jest wpisywany w CM7MED.");
      return;
    }
    try {
      setBusy(true);
      setSubmitError(null);
      for (const item of items) {
        const ean = item.drug?.ean;
        if (!ean || header.form === "recipe") continue;
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
          ...header,
          signConfirmed: true,
          items: items.map((item) => ({
            drug: item.drug,
            category: item.category,
            quantity: item.quantity,
            dosage: item.dosage,
            payment: item.payment,
            refundCode: item.refundCode,
            frequency: item.frequency,
            periodHours: item.periodHours,
            durationDays: item.durationDays,
            doseQuantity: item.doseQuantity,
            doseUnit: item.doseUnit,
            infoForPatient: item.infoForPatient,
            substanceName: item.substanceName,
            substanceQuantity: item.substanceQuantity,
            substanceUnit: item.substanceUnit,
            substanceWords: item.substanceWords,
            recipeText: item.recipeText,
            recipeSummary: item.recipeSummary,
            cito: item.cito === true,
            annual: header.form === "Rpw" || header.form === "recipe" ? false : item.annual === true,
            realizationFrom: header.form === "Rpw" ? "" : (item.realizationFrom || ""),
            noSubstitution: item.noSubstitution === true,
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
    setHeader(headerFrom(null));
    setResult(null);
    setSubmitError(null);
    setSignConfirmed(false);
  };

  const printResult = async () => {
    if (!result?.id) return;
    try {
      await ehealthHelper.printDocument("prescription", result.id);
    } catch (err) {
      toast.error(err.message || "Wydruk nieudany");
    }
  };

  const historyMatches = historyDrugs.filter((drug) => drugMatches(drug, query));
  const accessCode = result?.accessCode || result?.payload?.refs?.accessCode || "";

  if (result) {
    return (
      <div className="space-y-3">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusClass(result.status)}`}>
          {STATUS_LABELS[result.status] || result.status}
        </span>
        {accessCode ? (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
            <div className="text-xs text-teal-800">Kod dostępu do e-recepty</div>
            <div className="text-lg font-semibold tracking-wide text-teal-950">{accessCode}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Kodu dostępu jeszcze nie ma. Medfile zwraca go dopiero po przyjęciu recepty w P1.
          </p>
        )}
        {result.error?.message && (
          <p className={`text-sm ${result.status === "draft" ? "text-amber-800" : "text-red-700"}`}>
            {result.error.message}
          </p>
        )}
        <Preview header={header} items={items} />
        <div className="flex gap-3">
          <button type="button" onClick={printResult} className="text-sm text-teal-700 hover:underline">
            Podgląd / druk
          </button>
          <button type="button" onClick={reset} className="text-sm text-teal-700 hover:underline">
            Wystaw kolejną
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs text-gray-500">
        <span className={step === 1 ? "font-semibold text-teal-700" : ""}>1. Formularz i leki</span>
        <span className={step === 2 ? "font-semibold text-teal-700" : ""}>2. Dawkowanie i refundacja</span>
        <span className={step === 3 ? "font-semibold text-teal-700" : ""}>3. Podgląd</span>
      </div>

      {step === 1 && (
        <>
          <label className="block text-xs text-gray-600">
            Formularz recepty
            <select
              value={header.form}
              onChange={(e) => changeForm(e.target.value)}
              className="mt-1 w-full p-2 border rounded-lg text-sm"
            >
              {FORMS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-gray-600">
            Kontekst
            <select
              value={header.kind}
              onChange={(e) => patchHeader({ kind: e.target.value })}
              className="mt-1 w-full p-2 border rounded-lg text-sm"
            >
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {header.form === "recipe" ? (
            <RecipeFields item={items[0] || blankItem("recipe")} onChange={(patch) => {
              setItems((prev) => {
                const current = prev[0] || blankItem("recipe");
                return [{ ...current, ...patch }];
              });
            }} />
          ) : (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nazwa leku lub substancja czynna"
                className="w-full p-3 border rounded-lg"
              />
              {searching && <p className="text-xs text-gray-500">Szukam w bazie leków…</p>}
              <SuggestionList title="Ulubione" drugs={favourites.filter((drug) => !query.trim() || drugMatches(drug, query))} onAdd={addDrug} onFavourite={toggleFavourite} favourites={favourites} />
              <SuggestionList title="Z historii wizyt" drugs={query.trim().length >= 1 ? historyMatches : []} onAdd={addDrug} onFavourite={toggleFavourite} favourites={favourites} />
              <SuggestionList title="Baza leków" drugs={catalog} onAdd={addDrug} onFavourite={toggleFavourite} favourites={favourites} />
            </>
          )}
          <AddedList items={items} onRemove={(key) => setItems((prev) => prev.filter((item) => item.key !== key))} />
          <button type="button" disabled={!items.length} onClick={() => goNext(2)} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50">
            Dalej
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <PackageOptions header={header} onChange={patchHeader} />
          {items.map((item) => (
            <ItemFields key={item.key} item={item} header={header} onChange={(patch) => updateItem(item.key, patch)} />
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="px-3 py-2 border rounded-lg text-sm">Wstecz</button>
            <button type="button" onClick={() => goNext(3)} className="px-3 py-2 bg-teal-700 text-white rounded-lg text-sm">Podgląd</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <Preview header={header} items={items} />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={signConfirmed} onChange={(e) => setSignConfirmed(e.target.checked)} className="mt-1" />
            <span>
              Potwierdzam wystawienie. Dokument podpisze certyfikat ZUS tego lekarza, już wgrany w Medfile.
              PIN certyfikatu nie wpisuje się tutaj i nie jest zapisywany w CM7MED.
            </span>
          </label>
          {submitError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              <div className="font-medium">{ERROR_CODE_LABELS[submitError.code] || "Błąd"}</div>
              <div>{submitError.message}</div>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="px-3 py-2 border rounded-lg text-sm">Wstecz</button>
            <button type="button" disabled={busy || !signConfirmed} onClick={submit} className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm disabled:opacity-50">
              {busy ? "Wystawiam…" : "Wystaw"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function PackageOptions({ header, onChange }) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <p className="text-xs font-medium text-gray-500">Uprawnienia</p>
      {header.form === "Rpw" && (
        <label className="block text-xs text-gray-600">
          Sposób badania pacjenta
          <select value={header.examMode} onChange={(e) => onChange({ examMode: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm">
            {EXAMS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      <label className="block text-xs text-gray-600">
        Uprawnienie dodatkowe
        <select value={header.entitlement} onChange={(e) => onChange({ entitlement: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm">
          {ENTITLEMENTS.map((option) => <option key={option.value || "none"} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      {header.entitlement && (
        <label className="block text-xs text-gray-600">
          Numer dokumentu uprawnienia
          <input value={header.entitlementDocument} onChange={(e) => onChange({ entitlementDocument: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm" />
        </label>
      )}
    </div>
  );
}

function ItemFields({ item, header, onChange }) {
  const scheme = needsScheme(header, item);
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-medium text-gray-800">{item.drug?.name || "Pozycja"}</div>
      <div className="text-xs text-gray-500">
        {item.category} · {item.drug?.package || "opakowanie z bazy"}
        {item.drug?.ean ? ` · EAN ${item.drug.ean}` : ""}
      </div>
      {header.form === "Rp" && (
        <label className="block text-xs text-gray-600">
          Kategoria
          <select value={item.category} onChange={(e) => onChange({ category: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm">
            <option value="Rp">Rp</option>
            <option value="OTC">OTC</option>
          </select>
        </label>
      )}
      <label className="block text-xs text-gray-600">
        Liczba opakowań
        <input value={item.quantity} onChange={(e) => onChange({ quantity: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm" />
      </label>
      <label className="block text-xs text-gray-600">
        Odpłatność
        <select value={item.payment} onChange={(e) => onChange({ payment: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm">
          {PAYMENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="block text-xs text-gray-600">
        Kod wskazania refundacyjnego
        <input value={item.refundCode} onChange={(e) => onChange({ refundCode: e.target.value })} placeholder="tylko gdy lek ma wskazanie" className="mt-1 w-full p-2 border rounded-lg text-sm" />
      </label>
      {scheme ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ile razy" value={item.frequency} onChange={(value) => onChange({ frequency: value })} />
          <Field label="Co ile godzin" value={item.periodHours} onChange={(value) => onChange({ periodHours: value })} />
          <Field label="Przez ile dni" value={item.durationDays} onChange={(value) => onChange({ durationDays: value })} />
          <Field label="Dawka" value={item.doseQuantity} onChange={(value) => onChange({ doseQuantity: value })} />
          <Field label="Jednostka dawki" value={item.doseUnit} onChange={(value) => onChange({ doseUnit: value })} />
          <Field label="Informacja dla pacjenta" value={item.infoForPatient} onChange={(value) => onChange({ infoForPatient: value })} />
        </div>
      ) : (
        <Field label={header.form === "recipe" ? "Sposób użycia" : "Dawkowanie"} value={item.dosage} onChange={(value) => onChange({ dosage: value })} placeholder="np. 1x1" />
      )}
      {header.form !== "Rpw" && (
        <div className="space-y-2 border-t pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={item.cito === true} onChange={(e) => onChange({ cito: e.target.checked })} />
            Cito — tylko ten lek
          </label>
          {header.form !== "recipe" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.annual === true} onChange={(e) => onChange({ annual: e.target.checked })} />
              e-Recepta roczna (ważna 365 dni) — tylko ten lek
            </label>
          )}
          <label className="block text-xs text-gray-600">
            Data realizacji od — tylko ten lek
            <input type="date" value={item.realizationFrom || ""} onChange={(e) => onChange({ realizationFrom: e.target.value })} className="mt-1 w-full p-2 border rounded-lg text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={item.noSubstitution === true} onChange={(e) => onChange({ noSubstitution: e.target.checked })} />
            Nie zamieniać
          </label>
        </div>
      )}
      {header.form === "Rpw" && (
        <div className="border-t pt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={item.cito === true} onChange={(e) => onChange({ cito: e.target.checked })} />
            Cito — tylko ten lek
          </label>
          <p className="text-xs text-gray-500">Rpw: ważność 30 dni, kuracja maksymalnie 90 dni. Nie można odroczyć realizacji ani wystawić recepty na 365 dni.</p>
        </div>
      )}
      {(header.form === "Rpw" || item.category === "Rpw") && (
        <div className="space-y-2 border-t pt-2">
          <p className="text-xs font-medium text-gray-500">Środek odurzający</p>
          <Field label="Substancja czynna" value={item.substanceName} onChange={(value) => onChange({ substanceName: value })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Ilość substancji" value={item.substanceQuantity} onChange={(value) => onChange({ substanceQuantity: value })} />
            <Field label="Jednostka" value={item.substanceUnit} onChange={(value) => onChange({ substanceUnit: value })} />
          </div>
          <Field label="Ilość substancji słownie" value={item.substanceWords} onChange={(value) => onChange({ substanceWords: value })} placeholder="np. cztery dziesiąte miligrama" />
        </div>
      )}
    </div>
  );
}

function RecipeFields({ item, onChange }) {
  return (
    <div className="space-y-2">
      <Field label="Nazwa receptury" value={item.drug?.name || ""} onChange={(value) => onChange({ drug: { ...item.drug, name: value } })} />
      <label className="block text-xs text-gray-600">
        Skład słownie, każdy składnik w osobnej linii
        <textarea value={item.recipeText} onChange={(e) => onChange({ recipeText: e.target.value })} rows={5} className="mt-1 w-full p-2 border rounded-lg text-sm" />
      </label>
      <Field label="Sposób przyrządzenia" value={item.recipeSummary} onChange={(value) => onChange({ recipeSummary: value })} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-xs text-gray-600">
      {label}
      <input value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full p-2 border rounded-lg text-sm" />
    </label>
  );
}

function Preview({ header, items }) {
  const formLabel = FORMS.find((option) => option.value === header.form)?.label || header.form;
  const kindLabel = KINDS.find((option) => option.value === header.kind)?.label || header.kind;
  return (
    <div className="border rounded-lg p-3 space-y-2 text-sm">
      <div className="font-medium text-gray-800">Podgląd przed wystawieniem</div>
      <div className="text-gray-600">{formLabel}</div>
      <div className="text-gray-600">{kindLabel}</div>
      {header.examMode && <div className="text-gray-600">Badanie: {EXAMS.find((option) => option.value === header.examMode)?.label}</div>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="bg-gray-50 p-2 rounded-lg">
            <div className="font-medium">
              {item.category} · {item.drug?.name}
              {item.cito ? " · CITO" : ""}
              {item.annual ? " · 365 dni" : ""}
              {item.noSubstitution ? " · nie zamieniać" : ""}
            </div>
            {item.realizationFrom && <div className="text-gray-600">Realizacja od {item.realizationFrom}</div>}
            <div className="text-gray-600">
              {item.quantity} op. · {paymentLabel(item.payment)}
              {item.refundCode ? ` · wskazanie ${item.refundCode}` : ""}
            </div>
            <div className="text-gray-600">
              {needsScheme(header, item)
                ? `${item.frequency}× co ${item.periodHours} h, ${item.doseQuantity} ${item.doseUnit}, przez ${item.durationDays} dni`
                : (item.dosage || "bez dawkowania")}
            </div>
            {item.substanceWords && <div className="text-gray-600">Słownie: {item.substanceWords}</div>}
            {item.recipeText && <div className="text-gray-600 whitespace-pre-wrap">{item.recipeText}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function paymentLabel(value) {
  return PAYMENTS.find((option) => option.value === value)?.label || value;
}

function SuggestionList({ title, drugs, onAdd, onFavourite, favourites = [] }) {
  if (!drugs?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      {drugs.map((drug) => (
        <div key={`${title}-${drug.ean || drug.id || drug.name}`} className="flex items-center gap-2 border rounded-lg p-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-800">{drug.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {[drug.kdlek, drug.activeSubstance, drug.strength, drug.package, drug.ean ? `EAN ${drug.ean}` : ""].filter(Boolean).join(" · ")}
            </div>
          </div>
          {onFavourite && (
            <button type="button" onClick={() => onFavourite(drug)} className="text-gray-400 hover:text-amber-500" aria-label="Ulubiony">
              <Star size={16} className={favourites.some((row) => (row.ean || row.name) === (drug.ean || drug.name)) ? "fill-amber-400 text-amber-500" : ""} />
            </button>
          )}
          <button type="button" onClick={() => onAdd(drug)} className="text-teal-700" aria-label="Dodaj lek">
            <Plus size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddedList({ items, onRemove }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.key} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
          <span>{item.category} · {item.drug?.name || "Receptura"}</span>
          <button type="button" onClick={() => onRemove(item.key)} className="text-gray-400 hover:text-red-600" aria-label="Usuń">
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PrescriptionComposer;
