import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, Lock } from "lucide-react";

// A plain client on purpose: no cookies, no auth header and none of the app's session handling,
// so a wrong password here can never sign an administrator out of the dashboard.
const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://backend.centrummedyczne7.pl",
  timeout: 30000,
});
const BASE = "/api/auth/account-unlock";

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D837B] focus:border-[#0D837B]";

function PasswordField({ label, value, onChange, autoComplete, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );
}

export default function AccountUnlock() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [action, setAction] = useState(params.get("action") === "reset" ? "reset" : "unlock");

  const [state, setState] = useState("loading"); // loading | ready | error | done
  const [info, setInfo] = useState(null);
  const [fatal, setFatal] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setFatal("Brak tokenu w linku. Otwórz link z wiadomości e-mail.");
      setState("error");
      return undefined;
    }
    api
      .post(`${BASE}/info`, { token })
      .then((res) => {
        if (cancelled) return;
        setInfo(res.data.data);
        setState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setFatal(err.response?.data?.message || "Nie udało się sprawdzić linku. Spróbuj ponownie.");
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const minLength = info?.minPasswordLength || 8;
  const target = info?.target;

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!adminPassword) return setFormError("Podaj swoje hasło administratora.");
    if (action === "reset") {
      if (newPassword.length < minLength) return setFormError(`Nowe hasło musi mieć co najmniej ${minLength} znaków.`);
      if (newPassword !== confirmPassword) return setFormError("Hasła nie są takie same.");
    }
    setBusy(true);
    try {
      const body = action === "reset" ? { token, adminPassword, newPassword, confirmPassword } : { token, adminPassword };
      const res = await api.post(`${BASE}/${action}`, body);
      setDoneMessage(res.data.message || "Gotowe.");
      setAdminPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setState("done");
    } catch (err) {
      const data = err.response?.data;
      // The link itself stopped working (used, expired, blocked): show it as a final state.
      if (["used", "expired", "blocked", "invalid"].includes(data?.code)) {
        setFatal(data.message);
        setState("error");
      } else {
        setFormError(data?.message || "Nie udało się wykonać operacji. Spróbuj ponownie.");
      }
    } finally {
      setBusy(false);
    }
  };

  const title = useMemo(() => {
    if (state === "done") return "Gotowe";
    if (state === "error") return "Link nie działa";
    return action === "reset" ? "Odblokuj i ustaw nowe hasło" : "Odblokuj konto";
  }, [state, action]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-14">
      <Helmet>
        <title>Odblokowanie konta – Centrum Medyczne 7</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-[#0D837B]">Centrum Medyczne 7</div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
          {state === "loading" && <p className="py-10 text-center text-gray-500">Sprawdzam link…</p>}

          {state === "error" && (
            <div className="py-2 text-center">
              <AlertTriangle className="mx-auto mb-3 text-amber-500" size={36} />
              <h1 className="mb-2 text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{fatal}</p>
              <Link to="/logowanie" className="mt-6 inline-block text-sm font-semibold text-[#0D837B] underline">
                Przejdź do logowania
              </Link>
            </div>
          )}

          {state === "done" && (
            <div className="py-2 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-[#0D837B]" size={40} />
              <h1 className="mb-2 text-xl font-bold text-gray-900">{doneMessage}</h1>
              {target && (
                <p className="text-gray-600">
                  {target.name}
                  {target.email ? ` (${target.email})` : ""} może teraz{" "}
                  {action === "reset" ? "zalogować się nowym hasłem." : "ponownie się zalogować."}
                </p>
              )}
              <Link to="/logowanie" className="mt-6 inline-block text-sm font-semibold text-[#0D837B] underline">
                Przejdź do logowania
              </Link>
            </div>
          )}

          {state === "ready" && (
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div className="flex items-center gap-2 text-[#0D837B]">
                <Lock size={18} />
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zablokowane konto</div>
                <div className="mt-1 text-base font-bold text-gray-900">{target.name}</div>
                <div className="break-all text-sm text-gray-600">
                  {target.email}
                  {target.role ? ` · ${target.role}` : ""}
                </div>
                {!info.locked && (
                  <div className="mt-2 text-sm text-amber-700">To konto nie jest już zablokowane (blokada wygasła).</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1" role="tablist">
                {[
                  ["unlock", "Tylko odblokuj"],
                  ["reset", "Odblokuj + hasło"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={action === value}
                    onClick={() => {
                      setAction(value);
                      setFormError("");
                    }}
                    className={`h-10 rounded-lg text-sm font-semibold ${
                      action === value ? "bg-white text-[#0D837B] shadow-sm" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {action === "reset" && (
                <>
                  <PasswordField label="Nowe hasło użytkownika" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                  <PasswordField label="Powtórz nowe hasło" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
                  <p className="-mt-2 text-xs text-gray-500">Co najmniej {minLength} znaków. Użytkownik zostanie wylogowany ze wszystkich urządzeń.</p>
                </>
              )}

              <div className="border-t border-gray-200 pt-5">
                <PasswordField
                  label={`Twoje hasło administratora (${info.admin.name})`}
                  value={adminPassword}
                  onChange={setAdminPassword}
                  autoComplete="current-password"
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-gray-500">Potwierdzamy, że to Ty. Ta operacja jest zapisywana.</p>
              </div>

              {formError && (
                <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-full bg-[#0D837B] text-base font-bold text-white disabled:opacity-60"
              >
                {busy ? "Proszę czekać…" : action === "reset" ? "Odblokuj i zmień hasło" : "Odblokuj konto"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
