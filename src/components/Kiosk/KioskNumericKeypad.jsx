import { Delete } from "lucide-react";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "backspace"],
];

export default function KioskNumericKeypad({ onDigit, onBackspace, disabled = false, compact = false }) {
  const handleKey = (key) => {
    if (disabled) return;
    if (key === "backspace") onBackspace?.();
    else if (key) onDigit?.(key);
  };

  const buttonClass = compact
    ? "h-11 rounded-xl border border-gray-200 text-lg font-semibold flex items-center justify-center active:bg-gray-50 disabled:opacity-40 touch-manipulation"
    : "h-12 rounded-2xl border border-gray-200 text-xl font-semibold flex items-center justify-center active:bg-gray-50 disabled:opacity-40 touch-manipulation";

  return (
    <div className="mx-auto max-w-[260px] w-full select-none" role="group" aria-label="Klawiatura numeryczna">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-3 gap-2 ${rowIndex < ROWS.length - 1 ? "mb-2" : ""}`}>
          {row.map((key, keyIndex) => {
            if (key === null) {
              return <div key={keyIndex} aria-hidden />;
            }

            if (key === "backspace") {
              return (
                <button
                  key={keyIndex}
                  type="button"
                  onClick={() => handleKey(key)}
                  disabled={disabled}
                  aria-label="Usuń ostatnią cyfrę"
                  className={`${buttonClass} bg-sky-50 text-gray-700 active:bg-sky-100`}
                >
                  <Delete className={compact ? "w-5 h-5" : "w-6 h-6"} />
                </button>
              );
            }

            return (
              <button
                key={keyIndex}
                type="button"
                onClick={() => handleKey(key)}
                disabled={disabled}
                className={`${buttonClass} bg-white text-gray-900`}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
