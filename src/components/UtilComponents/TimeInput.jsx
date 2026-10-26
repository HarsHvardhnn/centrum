import { useEffect, useState } from "react";

const COMPLETE = /^([01]\d|2[0-3]):[0-5]\d$/;

function mask(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits.length === 2 && raw.length > 2 ? `${digits}:` : digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * 24h HH:mm field. Replaces <input type="time">, whose hour -> minute focus
 * jump does not work in Safari. Typing "0930" or "09" + "30" lands in the
 * right place; onChange fires only with a complete valid time or "".
 */
export default function TimeInput({ value = "", onChange, name, className = "", disabled, ...rest }) {
  const [text, setText] = useState(value || "");
  useEffect(() => { setText(value || ""); }, [value]);

  const handle = (event) => {
    const typed = event.target.value;
    // Deleting the colon removes a digit too, so backspace keeps working.
    const next = typed.length < text.length ? typed.replace(/[^\d:]/g, "") : mask(typed);
    setText(next);
    if (next === "") onChange?.({ target: { name, value: "" } });
    else if (COMPLETE.test(next)) onChange?.({ target: { name, value: next } });
  };

  const handleBlur = () => {
    if (text && !COMPLETE.test(text)) setText(value || "");
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="GG:MM"
      maxLength={5}
      name={name}
      value={text}
      disabled={disabled}
      onChange={handle}
      onBlur={handleBlur}
      className={className}
    />
  );
}
