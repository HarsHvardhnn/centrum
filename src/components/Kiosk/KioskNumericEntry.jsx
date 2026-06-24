import KioskNumericKeypad from "./KioskNumericKeypad";

const BOX_STYLES = {
  lg: {
    box: "w-12 h-14 sm:w-14 sm:h-16 text-2xl sm:text-3xl",
    gap: "gap-2",
    fullKeypad: true,
  },
  pesel: {
    box: "w-10 h-12 sm:w-11 sm:h-14 text-2xl",
    gap: "gap-1.5 sm:gap-2",
    fullKeypad: true,
  },
  md: {
    box: "w-8 h-11 sm:w-9 sm:h-12 text-xl",
    gap: "gap-1.5",
    fullKeypad: false,
  },
  sm: {
    box: "w-8 h-10 text-lg",
    gap: "gap-1.5",
    fullKeypad: false,
  },
};

export default function KioskNumericEntry({
  value = "",
  onChange,
  maxLength,
  size = "lg",
  showKeypad = true,
  compactKeypad = false,
  showActiveCursor = false,
  disabled = false,
  className = "",
}) {
  const digits = String(value).replace(/\D/g, "").slice(0, maxLength);
  const boxes = Array.from({ length: maxLength }, (_, index) => digits[index] || "");
  const styles = BOX_STYLES[size] || BOX_STYLES.lg;
  const activeIndex = digits.length;

  const appendDigit = (digit) => {
    if (digits.length >= maxLength) return;
    onChange?.(digits + digit);
  };

  const backspace = () => {
    onChange?.(digits.slice(0, -1));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div
        className={`flex justify-center flex-wrap ${styles.gap}`}
        role="group"
        aria-label="Wprowadzane cyfry"
      >
        {boxes.map((digit, index) => {
          const isActive = showActiveCursor && index === activeIndex && activeIndex < maxLength;
          const isFilled = Boolean(digit);

          return (
            <div
              key={index}
              className={`${styles.box} rounded-xl border-2 flex items-center justify-center font-mono font-semibold transition-colors ${
                isFilled || isActive ? "border-teal-600 text-gray-900" : "border-gray-200"
              }`}
              aria-hidden
            >
              {digit || (isActive ? <span className="text-teal-600 animate-pulse">|</span> : null)}
            </div>
          );
        })}
      </div>

      {showKeypad && (
        <KioskNumericKeypad
          onDigit={appendDigit}
          onBackspace={backspace}
          disabled={disabled}
          compact={compactKeypad || !styles.fullKeypad}
        />
      )}
    </div>
  );
}
