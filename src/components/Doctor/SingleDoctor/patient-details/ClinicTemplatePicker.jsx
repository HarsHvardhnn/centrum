import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Search, Star, X } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "all", label: "Wszystkie dokumenty" },
  { value: "favorites", label: "Ulubione" },
  { value: "certificate", label: "Zaświadczenia i orzeczenia" },
  { value: "recommendations", label: "Zalecenia i informacje" },
  { value: "referral", label: "Skierowania" },
  { value: "consent", label: "Zgody i oświadczenia" },
  { value: "administrative", label: "Dokumenty administracyjne" },
  { value: "other", label: "Inne dokumenty" },
];

const CATEGORY_NAMES = Object.fromEntries(
  CATEGORY_OPTIONS.filter((option) => option.value !== "all" && option.value !== "favorites").map((option) => [option.value, option.label])
);

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function storageKey(doctorId) {
  return `cm7med-document-template-preferences:${doctorId || "me"}`;
}

function readFavorites(doctorId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(doctorId)) || "null");
    return Array.isArray(parsed?.favoriteTemplateIds) ? parsed.favoriteTemplateIds.map(String) : [];
  } catch {
    return [];
  }
}

function writeFavorites(doctorId, ids) {
  try {
    localStorage.setItem(storageKey(doctorId), JSON.stringify({ doctorId, favoriteTemplateIds: ids }));
  } catch {
    /* favorites stay for this session only */
  }
}

export default function ClinicTemplatePicker({ templates, doctorId, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState(() => readFavorites(doctorId));
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Drop favourites of templates that no longer exist or were switched off.
  const activeIds = useMemo(() => new Set(templates.map((template) => String(template._id))), [templates]);
  const favorites = useMemo(() => favoriteIds.filter((id) => activeIds.has(id)), [favoriteIds, activeIds]);

  const toggleFavorite = (templateId) => {
    const id = String(templateId);
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavoriteIds(next);
    writeFavorites(doctorId, next);
  };

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return templates.filter((template) => {
      const id = String(template._id);
      if (category === "favorites" && !favorites.includes(id)) return false;
      if (category !== "all" && category !== "favorites" && (template.category || "other") !== category) return false;
      if (!needle) return true;
      return normalize(`${template.name} ${template.code} ${template.description}`).includes(needle);
    });
  }, [templates, favorites, category, query]);

  const searching = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinic-template-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 id="clinic-template-picker-title" className="font-bold">Wystaw dokument</h3>
          <button type="button" onClick={onClose} aria-label="Zamknij okno"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-2 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj wzoru..."
                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filtr kategorii"
              className="w-full sm:w-56 border rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
            >
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <Link to="/moje-wzory-dokumentow" className="inline-flex text-xs font-semibold text-teal-700">Zarządzaj moimi wzorami</Link>
        </div>
        <div className="overflow-y-auto px-4 py-3 space-y-2">
          {visible.length === 0 && (
            <p className="text-sm text-gray-500 py-6 text-center">
              {category === "favorites" && !searching
                ? "Nie masz jeszcze ulubionych dokumentów. Kliknij gwiazdkę przy wzorze, aby go tu dodać."
                : templates.length === 0
                  ? "Brak wzorów przypisanych do tego lekarza."
                  : "Nie znaleziono dokumentu. Zmień wyszukiwanie lub kategorię."}
            </p>
          )}
          {visible.map((template) => {
            const isFavorite = favorites.includes(String(template._id));
            return (
              <div key={template._id} className="flex items-center border rounded-lg hover:border-teal-400 group">
                <button type="button" onClick={() => onSelect(template)} className="flex-1 min-w-0 flex items-center gap-3 text-left p-3">
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-700">
                    <FileText size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-teal-700">[{template.code}]{template.ownerId ? " · Mój wzór" : ""}</span>
                    <span className="block font-semibold text-sm">{template.name}</span>
                    <span className="block text-xs text-gray-500">{template.description || CATEGORY_NAMES[template.category] || CATEGORY_NAMES.other}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(template._id)}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? `Usuń ${template.name} z ulubionych` : `Dodaj ${template.name} do ulubionych`}
                  title={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  className={`w-9 h-9 mr-1 shrink-0 inline-flex items-center justify-center rounded-md hover:bg-amber-50 ${isFavorite ? "text-amber-600" : "text-slate-400 hover:text-amber-600"}`}
                >
                  <Star size={18} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <ChevronRight size={16} className="mr-3 shrink-0 text-slate-400" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
