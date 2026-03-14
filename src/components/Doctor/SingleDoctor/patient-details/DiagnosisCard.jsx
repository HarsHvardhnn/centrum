import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const DEBOUNCE_MS = 300;

const DiagnosisCard = ({
  diagnoses = [],
  onAddDiagnosis,
  onRemoveDiagnosis,
  onSearchIcd10,
  disabled,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!onSearchIcd10 || !searchValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const results = await onSearchIcd10(searchValue);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchValue, onSearchIcd10]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (item) => {
    const code = item?.code ?? "";
    const name = item?.name ?? item?.title ?? "";
    onAddDiagnosis?.({ code, name, isPrimary: diagnoses.length === 0 });
    setSearchValue("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Rozpoznanie (ICD-10)</h3>
      <div className="relative mb-4" ref={dropdownRef}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder="Wyszukaj wg kodu ICD-10 lub nazwy choroby..."
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-gray-50"
        />
        {showDropdown && (searchValue.trim() || searchResults.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto">
            {searchLoading ? (
              <div className="p-3 text-sm text-gray-500">Szukam...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Brak wyników</div>
            ) : (
              searchResults.map((item, i) => (
                <button
                  key={(item?.code ?? "") + "-" + i}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-teal-800">{item?.code ?? ""}</span>
                  <span className="text-gray-700 ml-2">{item?.name ?? item?.title ?? ""}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {diagnoses.length > 0 && (
        <div className="space-y-2 mb-4">
          {diagnoses.map((d, i) => (
            <div
              key={d.id || d._id || i}
              className="flex items-center flex-wrap gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-100"
            >
              <span className="text-xs font-medium text-teal-800 px-2 py-0.5 rounded bg-teal-100">
                {d.isPrimary ? "Główne" : "Dodatkowe"}
              </span>
              <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">
                {d.code} {d.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveDiagnosis?.(d.id || d._id)}
                disabled={disabled}
                className="p-1 rounded hover:bg-teal-200/50 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label="Usuń"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">Wpisz kod lub nazwę, wybierz z listy, aby dodać rozpoznanie.</p>
    </div>
  );
};

export default DiagnosisCard;
