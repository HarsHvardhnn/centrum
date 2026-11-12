import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import { readCertificateFile, resetSigningStatus } from "./ehealthSigning";
import EwusAccountForm from "./EwusAccountForm";

const inp = "w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400";
const errText = (err) => err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Operacja nie powiodła się";
const ROLE_LABEL = { LEK: "Lekarz", LEKD: "Lekarz dentysta", PIEL: "Pielęgniarka / położna", FIZJO: "Fizjoterapeuta" };

function Badge({ tone, children }) {
  const cls = { red: "bg-rose-50 text-rose-700", green: "bg-emerald-50 text-emerald-700", yellow: "bg-amber-50 text-amber-800", grey: "bg-gray-100 text-gray-600" }[tone] || "bg-gray-100 text-gray-600";
  return <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function Card({ title, hint, children }) {
  return (
    <div className="grid gap-4 rounded-lg border border-gray-100 p-4 md:grid-cols-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
      <div className="md:col-span-2 space-y-3">{children}</div>
    </div>
  );
}

/**
 * "Moje ustawienia e-Zdrowie": what a staff member sets up about themselves. Professional data is read-only
 * (the administrator changes it). Passwords, keys and the certificate file are never shown again.
 */
export default function MyEhealthSettings() {
  const [p, setP] = useState(null);
  const [tab, setTab] = useState("ready");
  const [busy, setBusy] = useState(false);
  const [pa, setPa] = useState(null);
  const [zusFile, setZusFile] = useState(null);
  const [zusPin, setZusPin] = useState("");
  const [actionPin, setActionPin] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeText, setChangeText] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const res = await ehealthAdminHelper.getMyProfile();
      setP(res?.data || null);
      setPa(res?.data?.pa?.address || null);
    } catch (err) {
      toast.error(errText(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!p) return <div className="p-6 text-sm text-gray-500">Wczytywanie…</div>;

  const todo = p.readiness.filter((r) => !r.ready).length;
  const cert = p.zus.cert;
  const certTone = !cert ? "red" : cert.state === "expiring" || cert.state === "expired" ? "yellow" : "green";
  const certText = !cert ? "brak" : cert.state === "expired" ? "wygasł" : cert.state === "expiring" ? "wygasa" : p.zus.stored ? "wgrany" : "sprawdzony";
  const paTone = !p.pa.allowed ? "grey" : p.pa.filled ? "green" : "yellow";
  const paText = !p.pa.allowed ? "wyłączone" : p.pa.filled ? "włączone" : "uzupełnij";
  const ewusTone = !p.ewus.enabled ? "grey" : p.ewus.configured || !p.ewus.perDoctor ? "green" : "red";
  const ewusText = !p.ewus.enabled ? "wyłączone" : p.ewus.configured || !p.ewus.perDoctor ? "działa" : "brak";

  const tabs = [
    { id: "ready", label: "Gotowość", badge: <Badge tone={todo ? "yellow" : "green"}>{todo ? `${todo} do zrobienia` : "gotowe"}</Badge> },
    { id: "mydata", label: "Moje dane" },
    ...(p.zus.applicable ? [{ id: "zus", label: "Certyfikat ZUS", badge: <Badge tone={certTone}>{certText}</Badge> }] : []),
    { id: "ewus", label: "eWUŚ", badge: <Badge tone={ewusTone}>{ewusText}</Badge> },
    ...(p.pa.applicable ? [{ id: "pa", label: "Recepty dla siebie i rodziny", badge: <Badge tone={paTone}>{paText}</Badge> }] : []),
    { id: "defaults", label: "Domyślne" },
  ];

  const run = async (fn, ok) => {
    try {
      setBusy(true);
      const res = await fn();
      if (res?.success === false) throw new Error(res?.error?.message || "Błąd");
      if (res?.data) {
        setP(res.data);
        setPa(res.data.pa?.address || pa);
      }
      if (ok) toast.success(ok);
      return res;
    } catch (err) {
      toast.error(errText(err));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const resetUpload = () => {
    setZusPin("");
    setZusFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Upload once: the file and its password go to Medfile and stay there; from now on only a PIN per document.
  const uploadZus = async () => {
    try {
      const certificate = await readCertificateFile(zusFile);
      if (!zusPin) throw new Error("Wpisz PIN (hasło) certyfikatu.");
      const res = await run(() => ehealthAdminHelper.uploadMyZusCertificate({ certificate, pin: zusPin }), "Certyfikat wgrany i sprawdzony w ZUS. Przy dokumentach wystarczy teraz PIN.");
      if (res) {
        resetUpload();
        setReplacing(false);
        resetSigningStatus();
        if (res.warning) toast.warning(res.warning);
      }
    } catch (err) {
      toast.error(errText(err));
    }
  };

  const refreshZus = async () => {
    if (!actionPin) return toast.error("Wpisz PIN certyfikatu.");
    const res = await run(() => ehealthAdminHelper.refreshMyZus(actionPin), "Dane z ZUS odświeżone.");
    if (res) setActionPin("");
  };

  const removeZus = async () => {
    if (!actionPin) return toast.error("Wpisz PIN certyfikatu, aby go usunąć.");
    if (!window.confirm("Usunąć certyfikat? Do czasu wgrania nowego e-ZLA i podpis e-skierowań będą zablokowane.")) return;
    const res = await run(() => ehealthAdminHelper.deleteMyZusCertificate(actionPin), "Certyfikat usunięty.");
    if (res) {
      setActionPin("");
      resetSigningStatus();
    }
  };

  const mfaBadge = p.medfile.hasPractitioner ? <Badge tone="green">Aktywne w P1</Badge> : <Badge tone="yellow">Niewysłane</Badge>;

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Moje ustawienia e-Zdrowie</h1>
        <div className="text-sm text-gray-700">{p.fullName}{mfaBadge}</div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
            {t.label}{t.badge}
          </button>
        ))}
      </div>

      {tab === "ready" && (
        <div className="space-y-4">
          <Card title="Twoje konto" hint="Dane zawodowe ustawia administrator.">
            <p className="text-sm text-gray-800"><b>{p.fullName}</b> · {ROLE_LABEL[p.role] || p.role} · PWZ {p.pwz || "—"}</p>
          </Card>
          {p.readiness.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Administrator nie włączył Ci jeszcze żadnej usługi e-Zdrowie.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-600"><tr><th className="px-3 py-2 text-left">Usługa</th><th className="px-3 py-2 text-left">Stan</th><th className="px-3 py-2 text-left">Co zrobić</th><th className="px-3 py-2" /></tr></thead>
                <tbody>
                  {p.readiness.map((r) => (
                    <tr key={r.service} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{r.label}</td>
                      <td className="px-3 py-2">{r.ready ? <Badge tone="green">gotowe</Badge> : <Badge tone="red">do uzupełnienia</Badge>}</td>
                      <td className="px-3 py-2 text-gray-600">{r.todo || "—"}</td>
                      <td className="px-3 py-2 text-right"><button type="button" onClick={() => setTab(r.tab)} className="rounded-lg border border-teal-700 px-2.5 py-1 text-xs font-semibold text-teal-800">Ustaw</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "mydata" && (
        <div className="space-y-3">
          <Card title="Dane zawodowe" hint="Tylko do odczytu. Zmienia je administrator.">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
              <div><dt className="text-xs text-gray-500">Imię i nazwisko</dt><dd className="font-medium">{p.fullName}</dd></div>
              <div><dt className="text-xs text-gray-500">Numer prawa wykonywania zawodu</dt><dd className="font-medium">{p.pwz || "—"}</dd></div>
              {p.doctorLike ? (
                <div className="md:col-span-2"><dt className="text-xs text-gray-500">Specjalizacje</dt><dd className="font-medium">{p.noSpecialization ? "Bez specjalizacji" : p.specialties.map((s) => `${s.code} ${s.display}`).join("; ") || "—"}</dd></div>
              ) : (
                <div><dt className="text-xs text-gray-500">Uprawnienia do recept</dt><dd className="font-medium">{{ none: "brak", "on-order": "na zlecenie lekarza", independent: "samodzielnie" }[p.prescribingRights] || p.prescribingRights}</dd></div>
              )}
              <div className="md:col-span-2"><dt className="text-xs text-gray-500">Komórki, w których pracuję</dt><dd className="font-medium">{p.cellsAssigned ? p.cells.map((c) => `${c.code} ${c.name}`).join("; ") : "wszystkie aktywne komórki (nie przypisano)"}</dd></div>
              <div className="md:col-span-2"><dt className="text-xs text-gray-500">Usługi</dt><dd className="flex flex-wrap gap-1.5">{p.services.map((s) => <Badge key={s.service} tone={s.enabled ? "green" : "grey"}>{s.label}</Badge>)}</dd></div>
            </dl>
            <p className="text-xs text-gray-500">Jeśli coś się nie zgadza, zgłoś zmianę — administrator dostanie e-mail.</p>
            {!changeOpen ? (
              <button type="button" onClick={() => setChangeOpen(true)} className="rounded-lg border border-teal-700 px-3 py-1.5 text-sm font-semibold text-teal-800">Zgłoś zmianę danych</button>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs text-gray-600">Co zmienić
                  <textarea className={inp} rows={3} value={changeText} onChange={(e) => setChangeText(e.target.value)} placeholder="np. dodać specjalizację, poprawić numer PWZ" />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy || changeText.trim().length < 5}
                    onClick={async () => {
                      try {
                        setBusy(true);
                        await ehealthAdminHelper.sendMyChangeRequest(changeText.trim());
                        toast.success("Zgłoszenie wysłane do administratora.");
                        setChangeOpen(false);
                        setChangeText("");
                      } catch (err) {
                        toast.error(errText(err));
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >Wyślij zgłoszenie</button>
                  <button type="button" onClick={() => setChangeOpen(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Anuluj</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "zus" && (
        <div className="space-y-3">
          <Card
            title="Certyfikat ZUS"
            hint="Wgrywasz go raz. Plik i hasło trafiają do Medfile i tam zostają — CM7Med nie przechowuje pliku ani hasła. Potem przy każdym dokumencie (e-ZLA, e-skierowanie) wpisujesz tylko PIN."
          >
            {p.zus.stored && !replacing ? (
              <>
                <p className="text-sm text-gray-800">
                  <Badge tone={cert?.state === "expired" ? "red" : cert?.state === "expiring" ? "yellow" : "green"}>
                    {cert?.state === "expired" ? "wygasł" : cert?.state === "expiring" ? `wygasa za ${cert.daysLeft} dni` : "wgrany"}
                  </Badge>
                  <span className="ml-2">Wystawiony dla: <b>{cert?.owner || "—"}</b> · ważny do: <b>{cert?.validTo ? new Date(cert.validTo).toLocaleDateString("pl-PL") : "—"}</b></span>
                </p>
                <input type="password" className={inp} placeholder="PIN certyfikatu (do odświeżenia lub usunięcia)" value={actionPin} onChange={(e) => setActionPin(e.target.value)} autoComplete="off" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={refreshZus} className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Pracuję…" : "Odśwież dane z ZUS"}</button>
                  <button type="button" disabled={busy} onClick={() => setReplacing(true)} className="rounded-lg border border-teal-700 px-3 py-1.5 text-sm font-semibold text-teal-800">Wymień certyfikat</button>
                  <button type="button" disabled={busy} onClick={removeZus} className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-700">Usuń certyfikat</button>
                </div>
              </>
            ) : (
              <>
                <input ref={fileRef} type="file" accept=".p12,.pfx" onChange={(e) => setZusFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
                <input type="password" className={inp} placeholder="PIN (hasło) certyfikatu" value={zusPin} onChange={(e) => setZusPin(e.target.value)} autoComplete="off" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy || !zusFile || !zusPin} onClick={uploadZus} className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                    {busy ? "Wgrywam i sprawdzam…" : "Wgraj i sprawdź w ZUS"}
                  </button>
                  {replacing && <button type="button" onClick={() => { setReplacing(false); resetUpload(); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Anuluj</button>}
                </div>
                <p className="text-xs text-gray-500">Plik .p12 / .pfx musi należeć do Ciebie (numer PESEL w certyfikacie jest porównywany z Twoim kontem). Zapamiętaj PIN — bez niego nie podpiszesz dokumentu.</p>
              </>
            )}
          </Card>
          {p.zus.compare && (
            <Card title="Dane w ZUS" hint="ZUS porównuje dane z rozróżnieniem wielkości liter. Różnicę zgłoś administratorowi.">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-gray-600"><tr><th className="py-1 text-left">Pole</th><th className="py-1 text-left">W CM7Med</th><th className="py-1 text-left">W ZUS</th><th /></tr></thead>
                <tbody>
                  {p.zus.compare.rows.map((r) => (
                    <tr key={r.field} className="border-t border-gray-100">
                      <td className="py-1.5 font-medium">{r.field}</td><td className="py-1.5">{r.cm7}</td><td className="py-1.5">{r.zus}</td>
                      <td className="py-1.5">{r.same ? null : <Badge tone="yellow">Różnica</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          <Card title="Miejsce wystawiania e-zwolnień" hint="Lista pochodzi z ZUS. Wybierz miejsce, w którym wystawiasz e-ZLA.">
            {p.zus.workplaces.length === 0 ? (
              <p className="text-sm text-gray-600">{p.zus.stored ? "Wpisz PIN powyżej i kliknij „Odśwież dane z ZUS”, aby pobrać listę miejsc." : "Najpierw wgraj certyfikat ZUS (powyżej)."}</p>
            ) : (
              <>
                <select className={inp} value={p.zus.workplaceId} onChange={(e) => run(() => ehealthAdminHelper.putMyZlaWorkplace(e.target.value), "Zapisano miejsce wystawiania.")}>
                  <option value="">— wybierz —</option>
                  {p.zus.workplaces.map((w) => <option key={w.id} value={w.id}>{w.name} — {w.address} (NIP {w.nip})</option>)}
                </select>
              </>
            )}
          </Card>
        </div>
      )}

      {tab === "ewus" && (
        <Card title="eWUŚ — moje konto NFZ" hint="Konto eWUŚ jest osobiste: regulamin zabrania przekazywania loginu i hasła innym osobom. Konto zakłada administrator eWUŚ placówki w Portalu Świadczeniodawcy NFZ.">
          <EwusAccountForm scope="me" onSaved={load} />
        </Card>
      )}

      {tab === "pa" && pa && (
        <Card title="Recepty dla siebie i rodziny" hint="Na takiej recepcie Twój adres i telefon zastępują dane placówki.">
          {!p.pa.allowed && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">Wyłączone przez administratora. Gdy administrator włączy tę opcję, uzupełnisz tu adres i telefon.</p>
          )}
          <fieldset disabled={!p.pa.allowed || busy} className={`grid grid-cols-6 gap-2 ${p.pa.allowed ? "" : "opacity-50"}`}>
            <input className={`${inp} col-span-6 sm:col-span-3`} placeholder="Ulica" value={pa.street} onChange={(e) => setPa({ ...pa, street: e.target.value })} />
            <input className={`${inp} col-span-3 sm:col-span-1`} placeholder="Nr domu" value={pa.house} onChange={(e) => setPa({ ...pa, house: e.target.value })} />
            <input className={`${inp} col-span-3 sm:col-span-2`} placeholder="Lokal" value={pa.unit} onChange={(e) => setPa({ ...pa, unit: e.target.value })} />
            <input className={`${inp} col-span-2`} placeholder="00-000" value={pa.zip} onChange={(e) => setPa({ ...pa, zip: e.target.value })} />
            <input className={`${inp} col-span-4`} placeholder="Miejscowość" value={pa.city} onChange={(e) => setPa({ ...pa, city: e.target.value })} />
            <input className={`${inp} col-span-6`} placeholder="Telefon (+48 i 9 cyfr)" value={pa.phone} onChange={(e) => setPa({ ...pa, phone: e.target.value })} />
          </fieldset>
          <button type="button" disabled={!p.pa.allowed || busy} onClick={() => run(() => ehealthAdminHelper.putMyPaAddress(pa), "Zapisano adres.")} className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Zapisz</button>
        </Card>
      )}

      {tab === "defaults" && (
        <Card title="Domyślna komórka" hint="Używana, gdy wizyta nie ma komórki. Przy dokumencie można ją zmienić.">
          {p.cells.length === 0 ? (
            <p className="text-sm text-gray-600">Brak komórek na liście. Dodaje je administrator.</p>
          ) : (
            <select className={inp} value={p.defaultCellId} onChange={(e) => run(() => ehealthAdminHelper.putMyDefaultCell(e.target.value), "Zapisano komórkę domyślną.")}>
              {p.cells.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          )}
        </Card>
      )}
    </div>
  );
}
