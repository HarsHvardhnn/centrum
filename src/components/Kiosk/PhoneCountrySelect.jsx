import { useEffect, useRef, useState } from "react";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";

/**
 * Country code picker with flag icons (same pattern as admin / cm7med).
 * Native <select> cannot render SVG flags, so this uses a custom dropdown.
 */
export default function PhoneCountrySelect({
  value = "+48",
  onChange,
  disabled = false,
  className = "",
  buttonClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected =
    PHONE_COUNTRY_CODES.find((c) => c.code === value) || PHONE_COUNTRY_CODES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={
          buttonClassName ||
          "w-full h-14 border border-gray-300 rounded-lg px-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex items-center justify-between disabled:bg-gray-50 disabled:opacity-70"
        }
        title={selected.country}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <FlagIcon countryCode={selected.flag} className="w-5 h-4 shrink-0 rounded-[2px] shadow-sm" />
          <span className="font-medium truncate">{selected.code}</span>
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-30 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
          role="listbox"
        >
          {PHONE_COUNTRY_CODES.map((country) => {
            const isSelected = country.code === selected.code;
            return (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange?.(country.code);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-gray-50 ${
                  isSelected ? "bg-teal-50 text-teal-800" : "text-gray-700"
                }`}
              >
                <FlagIcon countryCode={country.flag} className="w-5 h-4 shrink-0 rounded-[2px] shadow-sm" />
                <span className="font-medium">{country.code}</span>
                <span className="text-sm text-gray-500 truncate">{country.country}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
