import { useEffect } from "react";

const VISIBLE_CLASS =
  "flex items-center w-full min-h-[3.25rem] box-border border border-gray-300 rounded-lg px-4 py-3 text-base sm:text-lg pointer-events-none";

function formatPl(ymd) {
  const raw = String(ymd || "").slice(0, 10);
  const [year, month, day] = raw.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("kiosk-date-input-styles")) return;
  const style = document.createElement("style");
  style.id = "kiosk-date-input-styles";
  style.textContent = `
    input.kiosk-date-native {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      opacity: 0.011;
      background: transparent;
      color: transparent;
      font-size: 16px;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      color-scheme: light;
    }
    input.kiosk-date-native::-webkit-calendar-picker-indicator {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      opacity: 0;
      cursor: pointer;
    }
    input.kiosk-date-native::-webkit-date-and-time-value,
    input.kiosk-date-native::-webkit-datetime-edit {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}

export default function KioskDateInput({
  className = "",
  value,
  onChange,
  onClick,
  readOnly = false,
  disabled = false,
  ...props
}) {
  useEffect(() => {
    injectStyles();
  }, []);

  const ymd = value ? String(value).slice(0, 10) : "";
  const display = formatPl(ymd);
  const locked = readOnly || disabled;

  return (
    <div className="relative w-full min-w-0">
      <div
        className={`${VISIBLE_CLASS} ${
          locked ? "bg-gray-50 text-gray-600" : "bg-white text-gray-900"
        } ${className}`.trim()}
      >
        <span className={`truncate ${display ? "" : "text-gray-400"}`}>
          {display || "Wybierz datę"}
        </span>
        {!locked && (
          <svg
            className="ml-auto shrink-0 w-5 h-5 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        )}
      </div>
      <input
        type="date"
        className={`kiosk-date-native${locked ? " pointer-events-none" : ""}`}
        value={ymd}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || locked) return;
          try {
            event.currentTarget.showPicker?.();
          } catch {
            /* already open, or Safari without showPicker */
          }
        }}
        {...props}
      />
    </div>
  );
}
