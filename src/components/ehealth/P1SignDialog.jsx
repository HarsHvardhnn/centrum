import React, { useEffect, useRef, useState } from "react";

const P1SignDialog = ({ open, accent = "blue", title, doctorLine, busy, onClose, onConfirm }) => {
  const [fileName, setFileName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const boxes = useRef([]);

  useEffect(() => {
    if (!open) {
      setFileName("");
      setPin(["", "", "", ""]);
    }
  }, [open]);

  if (!open) return null;

  const complete = pin.every((digit) => digit.length === 1);
  const buttonClass = accent === "amber" ? "bg-amber-700 hover:bg-amber-800" : "bg-blue-700 hover:bg-blue-800";

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = pin.slice();
    next[index] = digit;
    setPin(next);
    if (digit && boxes.current[index + 1]) boxes.current[index + 1].focus();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Certyfikat zostaje na tym komputerze. Plik i PIN nie są wysyłane na serwer CM7MED.
          </p>
        </div>
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Plik certyfikatu (.p12, .pfx, .cer)</label>
            <input
              type="file"
              accept=".p12,.pfx,.cer"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              className="block w-full text-xs"
            />
            {fileName && <p className="mt-1 text-slate-600">Wybrano: {fileName}</p>}
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">PIN certyfikatu</label>
            <div className="flex gap-2">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    boxes.current[index] = node;
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setDigit(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-bold border border-slate-300 rounded-xl"
                />
              ))}
            </div>
          </div>
          {doctorLine && <p className="text-[11px] text-slate-500">{doctorLine}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700">
              Anuluj
            </button>
            <button
              type="button"
              disabled={!fileName || !complete || busy}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl font-bold text-white disabled:opacity-50 ${buttonClass}`}
            >
              {busy ? "Wysyłanie…" : "Podpisz i wyślij"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P1SignDialog;
