import React, { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import CertificateFields from "./CertificateFields";
import { verifyCertificate } from "./ehealthSigning";

/**
 * The one window that asks for the doctor's certificate + PIN. Variants:
 *  - needsCertificate: file + PIN, checked on the server first (verify=true) before onSubmit runs
 *  - no certificate needed: a plain confirmation
 * `onSubmit(signing | null)` may throw; its message is shown in the window.
 */
const CertificateModal = ({
  open,
  title,
  actionText = "Podpisz i wyślij",
  isDestructive = false,
  doctorLine,
  needsCertificate = true,
  verify = true,
  plainText = "Potwierdź wykonanie tej operacji.",
  busyText = "Trwa podpisywanie i wysyłka. Proszę czekać.",
  children,
  onCancel,
  onSubmit,
}) => {
  const [signing, setSigning] = useState({ certificate: "", pin: "" });
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (open) {
      setSigning({ certificate: "", pin: "" });
      setInfo(null);
      setError("");
      setBusy(false);
      setVersion((v) => v + 1);
    }
  }, [open]);

  if (!open) return null;

  const ready = !needsCertificate || (signing.certificate && signing.pin);

  const submit = async () => {
    if (busy || !ready) return;
    setError("");
    setBusy(true);
    try {
      if (needsCertificate) {
        if (verify) setInfo(await verifyCertificate(signing));
      }
      await onSubmit?.(needsCertificate ? signing : null);
      setSigning({ certificate: "", pin: "" });
    } catch (err) {
      const apiMessage = err?.response?.data?.error?.message || err?.response?.data?.message;
      setError(apiMessage || err?.message || "Podpis nie powiódł się.");
      setBusy(false);
      return;
    }
    setBusy(false);
  };

  const accent = isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-[2px]">
      <div className="flex w-[500px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDestructive ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700"}`}>
              <Shield size={18} />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
          </div>
          {!busy && (
            <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Zamknij">
              <X size={18} />
            </button>
          )}
        </div>

        {busy && (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className={`h-12 w-12 animate-spin rounded-full border-4 ${isDestructive ? "border-rose-100 border-t-rose-600" : "border-slate-200 border-t-slate-900"}`} />
            <p className="mt-6 max-w-sm text-sm text-slate-600">{busyText}</p>
          </div>
        )}
        {/* Stays mounted while busy so the chosen file and PIN survive a failed attempt. */}
        {(
          <div className="p-6" style={{ display: busy ? "none" : "block" }}>
            {children ? <div className="mb-5">{children}</div> : null}
            {needsCertificate ? (
              <CertificateFields
                key={version}
                onChange={(next) => {
                  setSigning(next);
                  setError("");
                }}
                onSubmit={submit}
                info={info}
                error={error}
                destructive={isDestructive}
              />
            ) : (
              <>
                <p className="text-sm text-slate-600">{plainText}</p>
                {error && (
                  <div role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!busy && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div className="mr-3 truncate text-xs font-medium text-slate-400">{doctorLine || "Bezpieczny podpis P1"}</div>
            <div className="flex shrink-0 items-center gap-2.5">
              <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Anuluj
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={submit}
                className={`h-10 rounded-xl px-5 text-xs font-semibold ${ready ? `${accent} text-white` : "cursor-not-allowed bg-slate-200 text-slate-400"}`}
              >
                {ready ? actionText : needsCertificate ? "Wybierz plik i wpisz PIN…" : actionText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateModal;
