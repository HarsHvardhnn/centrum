import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";

/**
 * Custom phone country code dropdown using SVG flags (avoids emoji rendering issues on Windows/some browsers).
 * Dropdown is portaled to document.body so it opens correctly inside modals (no overflow clipping).
 */
export default function PhoneCodeSelect({ value, onChange, className = "", triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 208) });
    }
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        const dropdown = document.getElementById("phone-code-dropdown");
        if (dropdown && !dropdown.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = PHONE_COUNTRY_CODES.find((c) => c.code === value) || PHONE_COUNTRY_CODES[0];

  const dropdownContent = open ? (
    <div
      id="phone-code-dropdown"
      role="listbox"
      className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {PHONE_COUNTRY_CODES.map((country) => (
        <button
          key={country.code}
          type="button"
          role="option"
          aria-selected={value === country.code}
          onClick={() => {
            onChange(country.code);
            setOpen(false);
          }}
          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${value === country.code ? "bg-teal-50 text-teal-700" : "text-gray-700"}`}
        >
          <span className="flex-shrink-0 overflow-visible">
            <FlagIcon countryCode={country.flag} className="w-4 h-4" />
          </span>
          <span className="font-medium">{country.code}</span>
          <span className="text-xs text-gray-500 truncate">{country.country}</span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className={`relative flex ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full min-h-[42px] h-full px-2 sm:px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-teal-500 flex items-center justify-between min-w-[90px] sm:min-w-[120px] ${triggerClassName}`}
        style={{ lineHeight: "1.5" }}
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          <span className="flex-shrink-0 overflow-visible inline-flex">
            <FlagIcon countryCode={current.flag} className="w-5 h-4" />
          </span>
          <span>{current.code}</span>
        </span>
        <svg className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {createPortal(dropdownContent, document.body)}
    </div>
  );
}
