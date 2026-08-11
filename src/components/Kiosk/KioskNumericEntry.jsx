import { useCallback, useEffect, useRef } from "react";
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

function isEditableTarget(el) {
  if (!el || !(el instanceof Element)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest?.("input, textarea, select, [contenteditable='true']"));
}

/**
 * Digit boxes + on-screen keypad.
 * Physical keyboards (desktop / iPad Magic Keyboard) work via window keydown —
 * there is no text <input>, so the iOS/Android soft keyboard never opens.
 */
export default function KioskNumericEntry({
  value = "",
  onChange,
  maxLength,
  size = "lg",
  showKeypad = true,
  compactKeypad = false,
  showActiveCursor = false,
  disabled = false,
  /** Capture digit/Backspace from a connected keyboard without opening soft keyboard.
   *  Keep false for compact in-form pads (multiple can mount); enable on PIN/PESEL screens. */
  enableHardwareKeyboard = false,
  className = "",
  autoFocus = false,
}) {
  const digits = String(value).replace(/\D/g, "").slice(0, maxLength);
  const boxes = Array.from({ length: maxLength }, (_, index) => digits[index] || "");
  const styles = BOX_STYLES[size] || BOX_STYLES.lg;
  const activeIndex = digits.length;
  const rootRef = useRef(null);
  const digitsRef = useRef(digits);
  const onChangeRef = useRef(onChange);
  const maxLengthRef = useRef(maxLength);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    digitsRef.current = digits;
  }, [digits]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    maxLengthRef.current = maxLength;
  }, [maxLength]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const appendDigit = useCallback((digit) => {
    if (disabledRef.current) return;
    const current = digitsRef.current;
    const max = maxLengthRef.current;
    if (current.length >= max) return;
    onChangeRef.current?.(current + digit);
  }, []);

  const backspace = useCallback(() => {
    if (disabledRef.current) return;
    const current = digitsRef.current;
    if (!current.length) return;
    onChangeRef.current?.(current.slice(0, -1));
  }, []);

  useEffect(() => {
    if (!enableHardwareKeyboard) return undefined;

    const onKeyDown = (e) => {
      if (disabledRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Don't steal typing from real form fields elsewhere on the page
      if (isEditableTarget(e.target)) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        appendDigit(e.key);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [appendDigit, backspace, enableHardwareKeyboard]);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    // Focus the non-input container so hardware keys are clearly "in" this control.
    // Focusing a div never opens the mobile soft keyboard.
    rootRef.current?.focus?.({ preventScroll: true });
  }, [autoFocus, disabled]);

  return (
    <div
      ref={rootRef}
      className={`space-y-6 outline-none ${className}`}
      tabIndex={enableHardwareKeyboard ? 0 : undefined}
      role="group"
      aria-label="Wprowadzanie cyfr"
      data-kiosk-numeric-entry="true"
    >
      <div
        className={`flex justify-center flex-wrap ${styles.gap}`}
        role="group"
        aria-label="Wprowadzane cyfry"
        aria-live="polite"
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
