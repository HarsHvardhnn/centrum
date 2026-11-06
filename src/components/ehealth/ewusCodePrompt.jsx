import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function CodeDialog({ message, onDone }) {
  const [code, setCode] = useState("");
  const valid = /^\d{6}$/.test(code);
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/50 flex items-center justify-center p-4">
      <form
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onDone(code);
        }}
      >
        <h3 className="text-base font-bold text-gray-900">Podaj kod z aplikacji NFZ</h3>
        <p className="text-sm text-gray-600">{message || "Sesja eWUŚ wygasła. Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej NFZ."}</p>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full p-2 border border-gray-300 rounded-lg text-center text-xl tracking-[0.4em] font-mono"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onDone(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:underline">
            Anuluj
          </button>
          <button type="submit" disabled={!valid} className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            Zaloguj do eWUŚ
          </button>
        </div>
      </form>
    </div>
  );
}

/** Opens the one-time-code dialog and resolves with the 6 digits, or null when cancelled. */
export function promptEwusCode(message) {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const finish = (value) => {
      root.unmount();
      host.remove();
      resolve(value);
    };
    root.render(<CodeDialog message={message} onDone={finish} />);
  });
}
