import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Windows-style cascade dropdown: one trigger, categories on the left,
 * hovering a category opens a submenu to the right with its types.
 *
 * @param {Object} props
 * @param {{ id: string, label: string, types: { id: string, displayName: string }[] }[]} props.categories
 * @param {string} props.value - Selected type displayName
 * @param {(displayName: string) => void} props.onChange
 * @param {boolean} [props.disabled]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 */
const VisitReasonCascadeDropdown = ({
  categories = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Wybierz rodzaj wizyty...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hoveredCategory = hoveredCategoryIndex >= 0 && categories[hoveredCategoryIndex] ? categories[hoveredCategoryIndex] : null;
  const types = hoveredCategory?.types ?? [];

  const handleSelect = (displayName) => {
    onChange?.(displayName);
    setOpen(false);
  };

  if (!categories.length) return null;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm min-w-[200px] bg-white hover:border-gray-400 disabled:opacity-60 text-left"
      >
        <span className={value ? "text-gray-900" : "text-gray-500 truncate"}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-[100] flex rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden min-w-[320px]">
          {/* Left: categories */}
          <ul className="w-40 border-r border-gray-100 bg-gray-50/80 py-1 max-h-[280px] overflow-y-auto">
            {categories.map((cat, idx) => (
              <li
                key={cat.id}
                onMouseEnter={() => setHoveredCategoryIndex(idx)}
                className={`px-3 py-2 text-sm cursor-pointer whitespace-nowrap flex items-center justify-between ${
                  hoveredCategoryIndex === idx ? "bg-teal-50 text-teal-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{cat.label || cat.id}</span>
                <span className="text-gray-400 text-xs">→</span>
              </li>
            ))}
          </ul>
          {/* Right: types submenu */}
          <div className="flex-1 min-w-[200px] py-1 max-h-[280px] overflow-y-auto">
            {hoveredCategory ? (
              <ul>
                {types.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => handleSelect(t.displayName)}
                    className="px-3 py-2 text-sm text-gray-800 hover:bg-teal-50 hover:text-teal-800 cursor-pointer"
                  >
                    {t.displayName}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500">Najedź na kategorię</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitReasonCascadeDropdown;
