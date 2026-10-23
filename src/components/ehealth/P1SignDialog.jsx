import React, { useCallback, useEffect, useRef, useState } from "react";
import { Shield, X, AlertCircle, Lock, MessageSquare } from "lucide-react";
import ehealthHelper, { clearAuthToken, unwrapEhealthError } from "../../helpers/ehealthHelper";
import { registerAuthPrompt } from "./ehealthAuthPrompt";

const PIN_LENGTH = 4;
const CODE_LENGTH = 6;

function DigitInput({ digits, onChange, onEnter, autoFocus, ringStyle, label }) {
  const refs = useRef([]);
  const length = digits.length;

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (index, value) => {
    const next = digits.slice();
    next[index] = value;
    onChange(next);
  };

  const handleChange = (index, raw) => {
    const clean = String(raw || "").replace(/\D/g, "");
    if (!clean) return setAt(index, "");
    const next = digits.slice();
    for (let i = 0; i < clean.length && index + i < length; i += 1) next[index + i] = clean[i];
    onChange(next);
    refs.current[Math.min(length - 1, index + clean.length)]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next);
        refs.current[index - 1]?.focus();
      } else {
        setAt(index, "");
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (event.key === "Enter") {
      onEnter?.();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = digits.slice();
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    onChange(next);
    refs.current[Math.min(length - 1, pasted.length)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-3" onPaste={handlePaste} role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type={length === PIN_LENGTH ? "password" : "text"}
          inputMode="numeric"
          autoComplete={length === CODE_LENGTH ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          placeholder="•"
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={`${length === PIN_LENGTH ? "w-14 h-16 text-3xl" : "w-11 h-14 text-2xl"} text-center font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 outline-none placeholder:text-slate-300 placeholder:font-normal ${ringStyle}`}
        />
      ))}
    </div>
  );
}

const emptyPin = () => Array(PIN_LENGTH).fill("");
const emptyCode = () => Array(CODE_LENGTH).fill("");

/**
 * PIN → SMS code. When both are accepted the API token is stored (see ehealthHelper)
 * and onAuthorized runs. Used inside the sign dialog and the global prompt.
 */
export function EhealthAuthFlow({ purpose = "issue", actionText = "Autoryzuj", isDestructive = false, onAuthorized }) {
  const [status, setStatus] = useState(null);
  const [stage, setStage] = useState("loading");
  const [pin, setPin] = useState(emptyPin);
  const [pinRepeat, setPinRepeat] = useState(emptyPin);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(emptyCode);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const ringStyle = isDestructive ? "focus:border-rose-600 focus:ring-rose-600/20" : "focus:border-slate-800 focus:ring-slate-800/15";
  const primary = isDestructive ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white";

  const load = useCallback(async () => {
    setStage("loading");
    setError("");
    try {
      const res = await ehealthHelper.authStatus();
      setStatus(res.data);
      setStage(res.data?.pinSet ? "pin" : "setup");
    } catch (err) {
      setError(unwrapEhealthError(err).message);
      setStage("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (task) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const savePin = () => run(async () => {
    if (pin.join("").length < PIN_LENGTH) throw new Error(`PIN musi składać się z ${PIN_LENGTH} cyfr.`);
    if (pin.join("") !== pinRepeat.join("")) throw new Error("PIN-y nie są takie same.");
    if (!password) throw new Error("Podaj hasło do swojego konta.");
    await ehealthHelper.setAuthPin(pin.join(""), password);
    setPassword("");
    setPinRepeat(emptyPin());
    setStatus((prev) => ({ ...prev, pinSet: true }));
    setStage("pin");
  });

  const sendCode = () => run(async () => {
    if (pin.join("").length < PIN_LENGTH) throw new Error(`PIN musi składać się z ${PIN_LENGTH} cyfr.`);
    const res = await ehealthHelper.verifyAuthPin(pin.join(""), purpose);
    setChallenge(res.data);
    setCode(emptyCode());
    setStage("code");
  });

  const confirmCode = () => run(async () => {
    if (code.join("").length < CODE_LENGTH) throw new Error(`Kod SMS składa się z ${CODE_LENGTH} cyfr.`);
    await ehealthHelper.verifyAuthCode(challenge.challengeId, code.join(""));
    await onAuthorized?.();
  });

  if (stage === "loading") {
    return <p className="text-sm text-slate-500 text-center py-8">Sprawdzanie ustawień autoryzacji…</p>;
  }
  if (stage === "error") {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-rose-600">{error}</p>
        <button type="button" onClick={load} className="px-4 h-9 rounded-xl border border-slate-200 text-xs font-semibold">Spróbuj ponownie</button>
      </div>
    );
  }

  const errorLine = error && (
    <div className="mt-3 text-xs text-rose-600 font-medium flex items-center justify-center gap-1.5">
      <AlertCircle size={14} className="shrink-0" />
      <span>{error}</span>
    </div>
  );

  if (stage === "setup") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold text-slate-800">Ustaw swój PIN do autoryzacji</p>
        <p className="text-[11px] text-slate-500">To jednorazowa konfiguracja. PIN zostaje zapisany tylko w postaci zaszyfrowanej i będzie wymagany przy wystawianiu i anulowaniu dokumentów.</p>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Nowy PIN (4 cyfry)</label>
          <DigitInput digits={pin} onChange={(next) => { setPin(next); setError(""); }} autoFocus ringStyle={ringStyle} label="Nowy PIN" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Powtórz PIN</label>
          <DigitInput digits={pinRepeat} onChange={(next) => { setPinRepeat(next); setError(""); }} ringStyle={ringStyle} label="Powtórz PIN" />
        </div>
        <div className="text-left">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Hasło do konta</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(""); }}
            onKeyDown={(event) => { if (event.key === "Enter") savePin(); }}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
          />
        </div>
        {errorLine}
        <button type="button" disabled={busy} onClick={savePin} className={`w-full h-10 rounded-xl text-xs font-semibold ${primary} disabled:opacity-50`}>
          {busy ? "Zapisywanie…" : "Zapisz PIN"}
        </button>
      </div>
    );
  }

  if (stage === "pin") {
    const ready = pin.join("").length === PIN_LENGTH;
    return (
      <div className="text-center">
        <label className="text-xs font-semibold text-slate-600 mb-3 inline-flex items-center gap-1.5">
          <Lock size={14} className="text-slate-400" />
          <span>Wprowadź swój 4-cyfrowy PIN</span>
        </label>
        <DigitInput digits={pin} onChange={(next) => { setPin(next); setError(""); }} onEnter={() => ready && sendCode()} autoFocus ringStyle={ringStyle} label="PIN" />
        {errorLine}
        <p className="mt-4 text-[11px] text-slate-400">Po PIN-ie wyślemy kod SMS na numer zapisany na Twoim koncie{status?.phoneMasked ? ` (${status.phoneMasked})` : ""}.</p>
        <button type="button" disabled={!ready || busy} onClick={sendCode} className={`mt-4 w-full h-10 rounded-xl text-xs font-semibold ${ready ? primary : "bg-slate-200 text-slate-400 cursor-not-allowed"} disabled:opacity-60`}>
          {busy ? "Wysyłanie kodu…" : ready ? "Dalej — wyślij kod SMS" : "Wprowadź PIN…"}
        </button>
      </div>
    );
  }

  const codeReady = code.join("").length === CODE_LENGTH;
  return (
    <div className="text-center">
      <label className="text-xs font-semibold text-slate-600 mb-1 inline-flex items-center gap-1.5">
        <MessageSquare size={14} className="text-slate-400" />
        <span>Wpisz kod z SMS</span>
      </label>
      <p className="text-[11px] text-slate-500 mb-3">Wysłaliśmy 6-cyfrowy kod na numer {challenge?.phoneMasked}. Jest ważny 5 minut.</p>
      <DigitInput digits={code} onChange={(next) => { setCode(next); setError(""); }} onEnter={() => codeReady && confirmCode()} autoFocus ringStyle={ringStyle} label="Kod SMS" />
      {errorLine}
      <button type="button" disabled={!codeReady || busy} onClick={confirmCode} className={`mt-4 w-full h-10 rounded-xl text-xs font-semibold ${codeReady ? primary : "bg-slate-200 text-slate-400 cursor-not-allowed"} disabled:opacity-60`}>
        {busy ? "Trwa autoryzacja…" : codeReady ? actionText : "Wpisz kod SMS…"}
      </button>
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px]">
        <button type="button" disabled={busy} onClick={() => { setStage("pin"); setError(""); }} className="text-slate-500 underline underline-offset-4">
          Wyślij kod ponownie
        </button>
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
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState("");
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (shown) {
      setWorking(false);
      setFailure("");
      setRound((value) => value + 1);
    }
  }, [shown]);

  if (!shown) return null;

  const authorized = async () => {
    setWorking(true);
    setFailure("");
    try {
      await onConfirm?.();
    } catch (err) {
      setFailure(err?.message || "Operacja nie powiodła się.");
      setRound((value) => value + 1);
    } finally {
      clearAuthToken();
      setWorking(false);
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
          {!working && (
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100" title="Zamknij">
              <X size={18} />
            </button>
          )}
        </div>

        {working ? (
          <div className="px-8 py-16 flex flex-col items-center justify-center text-center">
            <div className={`w-12 h-12 rounded-full border-4 animate-spin ${isDestructive ? "border-rose-100 border-t-rose-600" : "border-slate-200 border-t-slate-900"}`} />
            <h3 className="text-base font-bold text-slate-900 mt-6">Przetwarzanie w Systemie e-Zdrowie (P1)...</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">Autoryzacja przyjęta. Trwa wysyłka i podpisanie dokumentu. Proszę czekać.</p>
          </div>
        ) : (
          <div className="p-6">
            {children ? <div className="mb-5">{children}</div> : null}
            {failure && (
              <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{failure}</span>
              </div>
            )}
            <EhealthAuthFlow
              key={round}
              purpose={isDestructive ? "cancel" : "issue"}
              actionText={actionText}
              isDestructive={isDestructive}
              onAuthorized={authorized}
            />
          </div>
        )}

        {!working && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-400 font-medium truncate mr-3">{doctorLine || "Autoryzacja PIN + SMS"}</div>
            <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100">
              Anuluj
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Mounted once: shows the PIN + SMS dialog when an API call needs authorization. */
export function EhealthAuthHost() {
  const [request, setRequest] = useState(null);

  useEffect(() => registerAuthPrompt((purpose) => new Promise((resolve, reject) => {
    setRequest({ purpose, resolve, reject });
  })), []);

  if (!request) return null;
  const close = (error) => {
    if (error) request.reject(error);
    setRequest(null);
  };
  const destructive = request.purpose === "cancel";
  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-base text-slate-900">{destructive ? "Autoryzacja anulowania" : "Autoryzacja operacji"}</h3>
          <button type="button" onClick={() => close(new Error("Autoryzacja anulowana."))} className="text-slate-400 p-1.5" title="Zamknij"><X size={18} /></button>
        </div>
        <div className="p-6">
          <EhealthAuthFlow
            purpose={request.purpose}
            isDestructive={destructive}
            actionText="Autoryzuj"
            onAuthorized={() => { request.resolve(); setRequest(null); }}
          />
        </div>
      </div>
    </div>
  );
}

export default P1SignDialog;
