import React, { useRef, useState } from "react";
import { FileKey2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { readCertificateFile } from "./ehealthSigning";

/**
 * File picker (certificate from the flash drive) + PIN. Holds the file and PIN only in this
 * component's state; the parent gets them through `onChange`.
 */
const CertificateFields = ({ onChange, onSubmit, info, error, disabled, destructive = false }) => {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [certificate, setCertificate] = useState("");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState("");

  const emit = (nextCert, nextPin) => onChange?.({ certificate: nextCert, pin: nextPin });

  const pick = async (e) => {
    const file = e.target.files?.[0];
    setLocalError("");
    if (!file) return;
    try {
      const b64 = await readCertificateFile(file);
      setFileName(file.name);
      setCertificate(b64);
      emit(b64, pin);
    } catch (err) {
      setLocalError(err.message);
      setFileName("");
      setCertificate("");
      emit("", pin);
    }
  };

  const ring = destructive ? "focus:border-rose-600 focus:ring-rose-600/20" : "focus:border-slate-800 focus:ring-slate-800/15";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Certyfikat z pendrive’a (.p12 / .pfx)</label>
        <input ref={fileRef} type="file" accept=".p12,.pfx,application/x-pkcs12" onChange={pick} disabled={disabled} className="hidden" />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 disabled:opacity-50"
        >
          <FileKey2 size={20} className="shrink-0 text-slate-500" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
            {fileName || "Wybierz plik certyfikatu z pendrive’a…"}
          </span>
          <span className="shrink-0 text-xs font-semibold text-slate-500">{fileName ? "Zmień" : "Wybierz"}</span>
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">PIN certyfikatu</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pin}
            autoComplete="off"
            disabled={disabled}
            onChange={(e) => {
              setPin(e.target.value);
              setLocalError("");
              emit(certificate, e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit?.();
            }}
            className={`h-11 w-full rounded-xl border border-slate-300 px-3 pr-11 text-sm tracking-widest outline-none focus:ring-2 ${ring}`}
            placeholder="Wpisz PIN"
          />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ukryj PIN" : "Pokaż PIN"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">PIN i plik nie są nigdzie zapisywane. Podajesz je przy każdym podpisie.</p>
      </div>

      {info && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>{info.name}</strong>
            {info.notAfter ? ` · ważny do ${new Date(info.notAfter).toLocaleDateString("pl-PL")}` : ""}
          </span>
        </div>
      )}
      {(error || localError) && (
        <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error || localError}
        </div>
      )}
    </div>
  );
};

export default CertificateFields;
