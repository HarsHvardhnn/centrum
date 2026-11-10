import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import { promptEwusCode } from "./ewusCodePrompt";

const FALLBACK_BRANCHES = {
  "01": "Dolnośląski", "02": "Kujawsko-Pomorski", "03": "Lubelski", "04": "Lubuski", "05": "Łódzki", "06": "Małopolski",
  "07": "Mazowiecki", "08": "Opolski", "09": "Podkarpacki", "10": "Podlaski", "11": "Pomorski", "12": "Śląski",
  "13": "Świętokrzyski", "14": "Warmińsko-Mazurski", "15": "Wielkopolski", "16": "Zachodniopomorski", "17": "Centrala",
};
const FALLBACK_ID_BRANCHES = ["01", "04", "05", "06", "08", "09", "11", "12"];

const input = "w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400";

/**
 * NFZ eWUŚ account. scope="facility": the clinic's account, or only the NFZ branch when every doctor uses their own.
 * scope="me": the signed-in doctor's own account (used when the clinic chose "account of each doctor").
 * scope="doctor": the same account, filled in by an administrator for the doctor given in `doctorId`.
 * Password and MFA key are write-only: the screen never receives them back.
 */
export default function EwusAccountForm({ scope = "facility", doctorId, onSaved }) {
  const isDoctor = scope === "doctor";
  const isMe = scope === "me" || isDoctor;
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState({ branches: FALLBACK_BRANCHES, identifierBranches: FALLBACK_ID_BRANCHES, own: true });
  const [form, setForm] = useState({ operatorType: "SWD", mode: "auto", domain: "", identifier: "", username: "" });
  const [secrets, setSecrets] = useState({ password: "", totpSecret: "" });
  const [stored, setStored] = useState({ hasPassword: false, hasTotp: false, configured: false });
  const [loginResult, setLoginResult] = useState(null);

  const load = async () => {
    try {
      const res = await (isDoctor ? ehealthAdminHelper.getDoctorEwus(doctorId) : isMe ? ehealthAdminHelper.getMyEwus() : ehealthAdminHelper.getEwus());
      const d = res?.data || {};
      setInfo({
        branches: d.branches || FALLBACK_BRANCHES,
        identifierBranches: d.identifierBranches || FALLBACK_ID_BRANCHES,
        own: isMe ? Boolean(d.own) : true,
      });
      setForm({
        operatorType: isMe ? "LEK" : d.operatorType || "SWD",
        mode: d.mode || "auto",
        domain: d.domain || (isMe ? d.facilityDomain || "" : ""),
        identifier: d.identifier || "",
        username: d.username || "",
      });
      setStored({ hasPassword: Boolean(d.hasPassword), hasTotp: Boolean(d.hasTotp), configured: Boolean(d.configured) });
    } catch (err) {
      toast.error(err?.message || "Nie udało się wczytać ustawień eWUŚ");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, doctorId]);

  if (!loaded) return <p className="text-sm text-gray-500">Wczytywanie ustawień eWUŚ…</p>;
  if (isMe && !info.own) {
    return (
      <p className="text-sm text-gray-600">
        Placówka używa teraz wspólnego konta eWUŚ, więc nie musisz podawać własnego loginu. Aby każdy lekarz używał własnego konta NFZ,
        administrator musi w Administracja → Integracje e-Zdrowie wybrać „Konto każdego lekarza” i zapisać. Wtedy w tym miejscu pojawią się pola
        na login, hasło i klucz MFA.
      </p>
    );
  }

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const clinicAccount = isMe || form.operatorType === "SWD";
  const needsId = info.identifierBranches.includes(form.domain);

  const save = async () => {
    try {
      setBusy(true);
      const payload = { ...form, password: secrets.password, totpSecret: secrets.totpSecret };
      const res = await (isDoctor ? ehealthAdminHelper.putDoctorEwus(doctorId, payload) : isMe ? ehealthAdminHelper.putMyEwus(payload) : ehealthAdminHelper.configureEwus(payload));
      if (!res?.success) throw new Error(res?.error?.message || res?.message || "Błąd zapisu");
      setSecrets({ password: "", totpSecret: "" });
      await load();
      onSaved?.();
      const failed = res.data?.failed || [];
      toast.success(
        isMe
          ? "Zapisano konto eWUŚ"
          : `Zapisano i wysłano do Medfile (${res.data?.synced ?? 0} osób)${failed.length ? `, błędy: ${failed.length}` : ""}`
      );
      if (failed.length) toast.error(failed.map((f) => `${f.doctor}: ${f.message}`).join("; "));
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Nie udało się zapisać eWUŚ");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    try {
      setBusy(true);
      setLoginResult(null);
      let res = isDoctor ? await ehealthAdminHelper.testDoctorEwus(doctorId) : isMe ? await ehealthAdminHelper.loginMyEwus() : await ehealthAdminHelper.testEwus();
      if (res?.data?.needsCode) {
        const code = await promptEwusCode(res.data.message);
        if (!code) return;
        res = isDoctor ? await ehealthAdminHelper.testDoctorEwus(doctorId, code) : isMe ? await ehealthAdminHelper.loginMyEwus(code) : await ehealthAdminHelper.testEwus(code);
      }
      setLoginResult({ ok: Boolean(res?.data?.ok), text: res?.data?.message || (res?.data?.ok ? "Zalogowano" : "Nie zalogowano") });
    } catch (err) {
      setLoginResult({ ok: false, text: err?.response?.data?.error?.message || err?.message || "Logowanie nie powiodło się" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {!isMe && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-800">
          <span className="font-medium">Czyje konto:</span>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={form.operatorType === "SWD"} onChange={() => set({ operatorType: "SWD" })} />
            Konto przychodni
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={form.operatorType === "LEK"} onChange={() => set({ operatorType: "LEK" })} />
            Konto każdego lekarza
          </label>
        </div>
      )}
      {!isMe && form.operatorType === "LEK" && (
        <p className="text-xs text-gray-500">Każdy lekarz wpisuje login, hasło i klucz MFA w swoich ustawieniach. Tutaj zostaje tylko oddział NFZ.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="text-xs text-gray-600">
          Oddział NFZ *
          <select className={input} value={form.domain} onChange={(e) => set({ domain: e.target.value })}>
            <option value="">— wybierz —</option>
            {Object.entries(info.branches).map(([code, name]) => (
              <option key={code} value={code}>{code} — {name}</option>
            ))}
          </select>
        </label>
        {clinicAccount && (
          <>
            <label className="text-xs text-gray-600">
              Identyfikator świadczeniodawcy {needsId ? "*" : ""}
              <input
                className={input}
                value={needsId ? form.identifier : ""}
                disabled={!needsId}
                placeholder={needsId ? "np. T/11/040" : "niewymagany w tym oddziale"}
                onChange={(e) => set({ identifier: e.target.value })}
              />
            </label>
            <label className="text-xs text-gray-600">
              Login NFZ *
              <input className={input} value={form.username} autoComplete="off" onChange={(e) => set({ username: e.target.value })} />
            </label>
            <label className="text-xs text-gray-600">
              Hasło NFZ {stored.hasPassword ? "(zapisane — wpisz, aby zmienić)" : "*"}
              <input
                type="password"
                className={input}
                autoComplete="new-password"
                placeholder={stored.hasPassword ? "••••••••••••" : ""}
                value={secrets.password}
                onChange={(e) => setSecrets({ ...secrets, password: e.target.value })}
              />
            </label>
          </>
        )}
      </div>

      {clinicAccount && (
        <>
          <div className="flex flex-wrap gap-4 text-sm text-gray-800">
            <span className="font-medium">Skąd brać kod MFA:</span>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={form.mode === "auto"} onChange={() => set({ mode: "auto" })} />
              System generuje kod sam
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={form.mode === "manual"} onChange={() => set({ mode: "manual" })} />
              Osoba wpisuje kod z telefonu
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={form.mode === "none"} onChange={() => set({ mode: "none" })} />
              Konto bez MFA (testowe konta NFZ)
            </label>
          </div>
          {form.mode === "auto" ? (
            <label className="block text-xs text-gray-600">
              Klucz MFA (base32) {stored.hasTotp ? "(zapisany — wpisz, aby zmienić)" : "*"}
              <input
                type="password"
                className={input}
                autoComplete="off"
                placeholder={stored.hasTotp ? "••••••••••••" : "klucz z konfiguracji aplikacji uwierzytelniającej NFZ"}
                value={secrets.totpSecret}
                onChange={(e) => setSecrets({ ...secrets, totpSecret: e.target.value })}
              />
              <span className="text-gray-500">Serwer wylicza z niego 6-cyfrowy kod (30 s) przy każdym logowaniu. Nie jest pokazywany ponownie.</span>
            </label>
          ) : form.mode === "none" ? (
            <p className="text-xs text-gray-500">Dla kont testowych NFZ, które nie używają kodu. Konta produkcyjne wymagają MFA.</p>
          ) : (
            <p className="text-xs text-gray-500">Po wygaśnięciu sesji (14 minut) system poprosi o kod z aplikacji NFZ.</p>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={save} className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {isMe ? "Zapisz" : "Zapisz i wyślij do Medfile"}
        </button>
        {(clinicAccount && stored.configured) && (
          <button type="button" disabled={busy} onClick={test} className="px-3 py-1.5 border border-teal-700 text-teal-800 rounded-lg text-sm disabled:opacity-50">
            Sprawdź logowanie
          </button>
        )}
        {loginResult && (
          <span className={`text-sm ${loginResult.ok ? "text-emerald-700" : "text-red-700"}`}>{loginResult.ok ? "Zalogowano" : loginResult.text}</span>
        )}
      </div>
    </div>
  );
}
