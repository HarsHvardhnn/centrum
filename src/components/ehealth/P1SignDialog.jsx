import React, { useEffect, useRef, useState } from "react";
import { Shield, KeyRound, X, AlertCircle, Lock } from "lucide-react";

const CERT_NAME_KEY = "cm7med_zus_cert_filename";

function readSavedCertName() {
  try {
    return localStorage.getItem(CERT_NAME_KEY) || "";
  } catch {
    return "";
  }
}

function saveCertName(name) {
  try {
    if (name) localStorage.setItem(CERT_NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function P1CertificatePinAuth({
  certFileName,
  onCertificateChange,
  pinDigits,
  onPinDigitsChange,
  pinError,
  onClearPinError,
  onSubmitOnEnter,
  isDestructive = false,
}) {
  const fileInputRef = useRef(null);
  const digitRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const ringStyle = isDestructive
    ? "focus:border-rose-600 focus:ring-rose-600/20"
    : "focus:border-slate-800 focus:ring-slate-800/15";

  const handleDigitChange = (index, val) => {
    onClearPinError?.();
    const cleanVal = String(val || "").replace(/\D/g, "");
    if (!cleanVal) {
      const next = pinDigits.slice();
      next[index] = "";
      onPinDigitsChange(next);
      return;
    }
    if (cleanVal.length > 1) {
      const next = pinDigits.slice();
      for (let i = 0; i < cleanVal.length && index + i < 4; i += 1) next[index + i] = cleanVal[i];
      onPinDigitsChange(next);
      digitRefs[Math.min(3, index + cleanVal.length)].current?.focus();
      return;
    }
    const next = pinDigits.slice();
    next[index] = cleanVal.slice(-1);
    onPinDigitsChange(next);
    if (index < 3) digitRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!pinDigits[index] && index > 0) {
        const next = pinDigits.slice();
        next[index - 1] = "";
        onPinDigitsChange(next);
        digitRefs[index - 1].current?.focus();
      } else if (pinDigits[index]) {
        const next = pinDigits.slice();
        next[index] = "";
        onPinDigitsChange(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      digitRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      digitRefs[index + 1].current?.focus();
    } else if (e.key === "Enter") {
      onSubmitOnEnter?.();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasteData) return;
    onClearPinError?.();
    const next = pinDigits.slice();
    for (let i = 0; i < pasteData.length; i += 1) next[i] = pasteData[i];
    onPinDigitsChange(next);
    digitRefs[Math.min(3, pasteData.length)].current?.focus();
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".p12,.pfx,.cer"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            saveCertName(file.name);
            onCertificateChange(file.name);
            onClearPinError?.();
          }
          e.target.value = "";
        }}
      />
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Certyfikat podpisu cyfrowego (.p12)
        </label>
        <div className="border border-slate-200 rounded-xl bg-slate-50 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white text-slate-700 rounded-lg w-9 h-9 flex items-center justify-center shrink-0 border border-slate-200">
              <KeyRound size={18} className="text-slate-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate font-mono">
                  {certFileName || "Brak wybranego certyfikatu"}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                  ZUS / P1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Klucz prywatny RSA • Podpis kwalifikowany / ZUS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium shrink-0 ml-3 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-800"
          >
            Zmień plik
          </button>
        </div>
      </div>

      <div className="pt-1 pb-2 flex flex-col items-center justify-center text-center">
        <label className="text-xs font-semibold text-slate-600 mb-3 inline-flex items-center gap-1.5">
          <Lock size={14} className="text-slate-400" />
          <span>Wprowadź 4-cyfrowy kod PIN</span>
        </label>
        <div className="flex items-center justify-center gap-3.5" onPaste={handlePaste}>
          {pinDigits.map((digit, index) => (
            <input
              key={index}
              ref={digitRefs[index]}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={1}
              value={digit}
              placeholder="•"
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 text-center text-3xl font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 outline-none placeholder:text-slate-300 placeholder:font-normal ${ringStyle}`}
            />
          ))}
        </div>
        {pinError && (
          <div className="mt-3 text-xs text-rose-600 font-medium flex items-center justify-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{pinError}</span>
          </div>
        )}
        <p className="mt-4 text-[11px] text-slate-400">
          Wymagany każdorazowo do autoryzacji operacji w Systemie e-Zdrowie (P1).
        </p>
      </div>
    </div>
  );
}

const P1SignDialog = ({
  open,
  isOpen,
  onClose,
  onConfirm,
  title = "Autoryzacja wysyłki do P1",
  actionText = "Podpisz i wyślij",
  isDestructive = false,
  doctorLine,
  children,
}) => {
  const shown = open ?? isOpen;
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [certFileName, setCertFileName] = useState(readSavedCertName);

  const pin = pinDigits.join("");
  const hasValidPin = pin.length === 4;
  const waiting = submitting;

  useEffect(() => {
    if (shown) {
      setPinDigits(["", "", "", ""]);
      setPinError("");
      setSubmitting(false);
      setCertFileName(readSavedCertName());
    }
  }, [shown]);

  if (!shown) return null;

  const handleConfirm = async () => {
    if (waiting) return;
    if (!certFileName) {
      setPinError("Wybierz plik certyfikatu ZUS (.p12 / .pfx) przed autoryzacją.");
      return;
    }
    if (pin.length < 4) {
      setPinError("Kod PIN musi składać się z 4 cyfr.");
      return;
    }
    setPinError("");
    setSubmitting(true);
    try {
      await onConfirm?.({ pin, certFileName });
    } catch (err) {
      setPinError(err?.message || "Autoryzacja nie powiodła się.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDestructive ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"}`}>
              <Shield size={18} />
            </div>
            <h3 className="text-slate-900 font-semibold text-base tracking-tight">{title}</h3>
          </div>
          {!waiting && (
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100" title="Zamknij">
              <X size={18} />
            </button>
          )}
        </div>

        {waiting ? (
          <div className="px-8 py-16 flex flex-col items-center justify-center text-center">
            <div className={`w-12 h-12 rounded-full border-4 animate-spin ${isDestructive ? "border-rose-100 border-t-rose-600" : "border-slate-200 border-t-slate-900"}`} />
            <h3 className="text-base font-bold text-slate-900 mt-6">Autoryzacja w Systemie e-Zdrowie (P1)...</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              Trwa podpisywanie żądania kluczem kryptograficznym i bezpieczna transmisja. Proszę czekać.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {children ? <div className="mb-5">{children}</div> : null}
            <P1CertificatePinAuth
              certFileName={certFileName}
              onCertificateChange={setCertFileName}
              pinDigits={pinDigits}
              onPinDigitsChange={setPinDigits}
              pinError={pinError}
              onClearPinError={() => setPinError("")}
              onSubmitOnEnter={() => {
                if (hasValidPin) handleConfirm();
              }}
              isDestructive={isDestructive}
            />
          </div>
        )}

        {!waiting && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-400 font-medium truncate mr-3">
              {doctorLine || "Bezpieczny podpis P1"}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100">
                Anuluj
              </button>
              <button
                type="button"
                disabled={!hasValidPin}
                onClick={handleConfirm}
                className={`px-5 h-10 rounded-xl font-semibold text-xs ${
                  !hasValidPin
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : isDestructive
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {hasValidPin ? actionText : "Wprowadź PIN..."}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default P1SignDialog;
