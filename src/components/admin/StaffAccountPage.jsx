import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../../context/userContext";
import { useLoader } from "../../context/LoaderContext";
import doctorService from "../../helpers/doctorHelper";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import AddDoctorForm from "../Doctor/CreateDoctor";
import MyEhealthSettings from "../ehealth/MyEhealthSettings";
import EwusAccountForm from "../ehealth/EwusAccountForm";
import NotFound404 from "../UtilComponents/NotFound";

const SERVICES = [
  ["prescription", "e-Recepta"],
  ["drugs", "Baza leków"],
  ["referral", "e-Skierowanie"],
  ["ezla", "e-ZLA"],
  ["eligibility", "eWUŚ (sprawdzanie ubezpieczenia)"],
];
const ROLE_LABEL = { LEK: "lekarz", LEKD: "lekarz dentysta", FIZJO: "fizjoterapeuta", PIEL: "pielęgniarka" };
const errText = (err) => err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Operacja nie powiodła się";

function Pill({ tone, children }) {
  const cls = { red: "bg-rose-50 text-rose-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-800", grey: "bg-gray-100 text-gray-600" }[tone];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

/** Administrator: which e-health services this person may use, with usage and the state of their certificate / eWUŚ account. */
function AccessTab({ doctorId, row, setRow, reload }) {
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState({});
  const pending = useRef(0);
  // The switch moves at once (optimistic); the server answer confirms it, or the switch goes back with an error.
  const toggle = async (service, enabled) => {
    const prev = row?.access || {};
    setRow((r) => (r ? { ...r, access: { ...r.access, [service]: enabled } } : r));
    setSaving((m) => ({ ...m, [service]: true }));
    pending.current += 1;
    try {
      const res = await ehealthAdminHelper.saveDoctorAccess(doctorId, { [service]: enabled });
      if (!res?.success) throw new Error(res?.error?.message || "Nie udało się zapisać");
      const confirmed = res?.data?.access;
      if (confirmed) setRow((r) => (r ? { ...r, access: { ...r.access, ...confirmed } } : r));
    } catch (err) {
      setRow((r) => (r ? { ...r, access: { ...r.access, [service]: prev[service] } } : r));
      toast.error(errText(err));
    } finally {
      setSaving((m) => ({ ...m, [service]: false }));
      pending.current -= 1;
      // once the last change is saved, refresh the derived state (blocked-by-professional-data notes) quietly
      if (pending.current === 0) ehealthAdminHelper.getStaffRow(doctorId).then((r) => r?.data && setRow(r.data)).catch(() => {});
    }
  };
  if (!row) return <p className="text-sm text-gray-500">Wczytywanie…</p>;
  const usageOf = (service) => (row.usage || []).find((u) => u.service === service);
  const zus = row.zusCert;
  const ewus = row.ewusAccount || {};
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        To jest jedyne miejsce, w którym włączasz i wyłączasz usługi e-Zdrowie tej osoby. Wyłączona usługa znika z jej menu i przycisków, a serwer odrzuca jej użycie.
        Nowe konto startuje ze wszystkimi usługami wyłączonymi. Dokumenty działają dopiero, gdy usługa jest włączona tutaj ORAZ konto ma w danych zawodowych „Wystawia e-dokumenty” (recepty: także uprawnienia inne niż „Brak”). Włączenie nie zużywa licencji — licznik miesiąca rośnie dopiero przy pierwszym użyciu.
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr><th className="px-3 py-2 font-medium">Usługa</th><th className="px-3 py-2 font-medium">Dostęp</th><th className="px-3 py-2 font-medium">Użycie w tym miesiącu</th></tr>
          </thead>
          <tbody>
            {SERVICES.map(([service, label]) => {
              const on = row.access?.[service] === true;
              const u = usageOf(service);
              return (
                <tr key={service} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{label}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={on} disabled={!!saving[service]} onChange={(e) => toggle(service, e.target.checked)} />
                      <span className={on ? "text-emerald-700" : "text-gray-500"}>{on ? "włączony" : "wyłączony"}</span>
                    </label>
                    {on && (((service === "referral" || service === "ezla") && !row.issuesEDocuments) || ((service === "prescription" || service === "drugs") && (!row.issuesEDocuments || (row.prescribingRights || "none") === "none"))) && (
                      <p className="mt-1 text-xs text-amber-700">Włączony, ale zablokowany: {!row.issuesEDocuments ? "w zapisanych danych zawodowych nie ma zaznaczonego „Wystawia e-dokumenty” (zaznacz i zapisz konto)" : "uprawnienia do recept w zapisanych danych to „Brak” (zmień i zapisz konto)"}.</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{u ? `${u.requestCount}×` : "nie użyto"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(() => {
        const st = row.medfileSync || { status: "never", missing: [] };
        const missing = st.missing || [];
        let label = "Wyślij do Medfile";
        if (sending) label = "Wysyłam…";
        else if (st.status === "synced") label = "Wysłano do Medfile ✓";
        else if (st.status === "outdated") label = "Wyślij zmiany do Medfile";
        const disabled = sending || missing.length > 0 || st.status === "synced";
        const hint = missing.length
          ? `Uzupełnij w danych zawodowych: ${missing.join(", ")}.`
          : st.status === "synced" ? "Dane w Medfile są aktualne."
          : st.status === "outdated" ? "Dane zmieniły się od ostatniej wysyłki do Medfile."
          : "Gdy usługi są ustawione, wyślij konto do Medfile.";
        return (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50/50 p-3">
            <p className="max-w-xl text-sm text-gray-700">{hint}</p>
            <button
              type="button"
              id="sendToMedfileAccess"
              disabled={disabled}
              className="rounded-md border border-[#1b766a] bg-white px-4 py-2 text-sm font-semibold text-[#1b766a] hover:bg-[#1b766a]/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={async () => {
                try {
                  setSending(true);
                  const res = await ehealthAdminHelper.syncDoctorPractitioner(doctorId);
                  toast.success(res?.created ? "Konto utworzone w Medfile" : "Dane zaktualizowane w Medfile");
                  await reload();
                } catch (err) {
                  toast.error(errText(err));
                } finally {
                  setSending(false);
                }
              }}
            >
              {label}
            </button>
          </div>
        );
      })()}
      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Konto w Medfile</p>
          {row.medfilePractitionerId ? <Pill tone="green">utworzone</Pill> : <Pill tone="red">nie wysłano</Pill>}
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Certyfikat ZUS</p>
          {!["LEK", "LEKD"].includes(row.medfileRole || "LEK") ? <Pill tone="grey">nie dotyczy</Pill>
            : !zus ? <Pill tone="red">brak</Pill>
            : new Date(zus.validTo).getTime() < Date.now() ? <Pill tone="red">wygasł</Pill>
            : <Pill tone="green">{row.zusStored ? "wgrany" : "sprawdzony"} do {new Date(zus.validTo).toLocaleDateString("pl-PL")}</Pill>}
          <p className="mt-1 text-xs text-gray-500">Certyfikat wgrywa sama osoba (plik i PIN są jej).</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Konto eWUŚ</p>
          {row.access?.eligibility !== true ? <Pill tone="grey">wyłączone</Pill>
            : !ewus.configured ? <Pill tone="red">brak</Pill>
            : ewus.lastLogin?.ok === true ? <Pill tone="green">logowanie działa</Pill>
            : ewus.lastLogin?.ok === false ? <Pill tone="red">błędne dane logowania</Pill>
            : <Pill tone="amber">uzupełnione, nie sprawdzono</Pill>}
          {ewus.lastLogin?.at && <p className="mt-1 text-[11px] text-gray-500">{new Date(ewus.lastLogin.at).toLocaleString("pl-PL")}{ewus.lastLogin.ok === false && ewus.lastLogin.message ? " — " + ewus.lastLogin.message : ""}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * One place for a staff account. The administrator creates and edits everything here (data, professional data, cells,
 * addresses, website profile, access to services, eWUŚ account). A doctor opens the same page for their own account:
 * what only the administrator may change is locked, the rest (contact, addresses, certificate, eWUŚ, prescriptions for
 * themselves, defaults) they edit themselves.
 */
export default function StaffAccountPage() {
  const { id: routeId } = useParams();
  const id = routeId ?? "nowy"; // /konto/nowy has no :id
  const navigate = useNavigate();
  const { user } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const isAdmin = user?.role === "admin";
  const creating = id === "nowy";
  const ownId = String(user?.id || user?._id || "");
  const isSelf = !creating && user?.role === "doctor" && ownId === String(id);
  const allowed = isAdmin || isSelf;

  const [doctor, setDoctor] = useState(null);
  const [row, setRow] = useState(null);
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "data");
  // the same page instance is reused when saving a new account moves on to /konto/:id?tab=access
  useEffect(() => {
    const wanted = params.get("tab");
    if (wanted) setTab(wanted);
  }, [params]);
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await doctorService.getDoctorDetailsById(id);
      setDoctor(res?.data || null);
      if (isAdmin) {
        const rowRes = await ehealthAdminHelper.getStaffRow(id);
        setRow(rowRes?.data || null);
      }
    } catch (err) {
      toast.error(errText(err));
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (allowed && !creating) load();
  }, [allowed, creating, load]);

  if (!allowed) return <NotFound404 />;

  const save = async (values, resetForm) => {
    try {
      showLoader();
      if (creating) {
        const created = await doctorService.createDoctor(values);
        const newId = created?.doctor?._id || created?.doctor?.id;
        toast.success("Konto utworzone. Następny krok: przycisk „Wyślij do Medfile” na końcu formularza, potem zakładka „Dostęp do usług”.", { duration: 9000 });
        if (newId) navigate(`/konto/${newId}?tab=data`, { replace: true });
        else navigate("/administracja/konta");
        return;
      }
      const res = await doctorService.updateDoctor(id, values);
      toast.success("Zapisano zmiany");
      if (res?.medfile?.warning) toast.warning(res.medfile.warning);
      await load();
      setFormKey((k) => k + 1);
    } catch (err) {
      toast.error("Nie udało się zapisać: " + errText(err));
      throw err;
    } finally {
      hideLoader();
    }
  };

  const tabs = creating
    ? [["data", "Dane i uprawnienia zawodowe"]]
    : isAdmin
    ? [["data", "Dane i uprawnienia zawodowe"], ["access", "Dostęp do usług"], ["ewus", "Konto eWUŚ"]]
    : [["data", "Moje dane"], ["ehealth", "e-Zdrowie: certyfikat ZUS, eWUŚ, recepty dla siebie"]];

  const name = doctor ? [doctor.name?.first, doctor.name?.last].filter(Boolean).join(" ") : "";
  const role = row?.medfileRole || "LEK";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && (
          <button type="button" onClick={() => navigate("/administracja/konta")} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
            <ArrowLeft size={16} /> Konta użytkowników
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900">{creating ? "Nowe konto pracownika" : isSelf ? "Moje konto" : "Konto pracownika"}{name ? `: ${name}` : ""}</h1>
        {row && <Pill tone="grey">{ROLE_LABEL[role] || role}</Pill>}
        {row && (row.medfileSync?.status === "synced" ? <Pill tone="green">wysłane do Medfile</Pill> : row.medfileSync?.status === "outdated" ? <Pill tone="amber">zmiany niewysłane do Medfile</Pill> : <Pill tone="amber">niewysłane do Medfile</Pill>)}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === key ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {creating && (
        <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          Tu zakładasz konto lekarza, pielęgniarki lub fizjoterapeuty: dane osobowe, rola, PWZ, PESEL, specjalizacje, komórki. Po zapisaniu wyślesz je do Medfile przyciskiem na końcu formularza,
          a ta sama strona pokaże zakładki „Dostęp do usług” i „Konto eWUŚ”.
        </p>
      )}
      {!creating && !doctor ? (
        <p className="text-sm text-gray-500">Wczytywanie…</p>
      ) : (
        <>
          {tab === "data" && (
            <AddDoctorForm
              key={formKey}
              inline
              isOpen
              isEditMode={!creating}
              selfMode={!isAdmin}
              initialData={creating ? undefined : doctor}
              onClose={() => navigate(isAdmin ? "/administracja/konta" : "/ustawienia")}
              onAddDoctor={save}
              onMedfileSynced={load}
            />
          )}
          {tab === "access" && isAdmin && <AccessTab doctorId={id} row={row} setRow={setRow} reload={load} />}
          {tab === "ewus" && isAdmin && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm text-gray-600">Konto eWUŚ jest osobiste. Możesz je uzupełnić w imieniu osoby (login, hasło, klucz MFA); hasła i klucze nie są potem pokazywane.</p>
              <EwusAccountForm scope="doctor" doctorId={id} onSaved={load} />
            </div>
          )}
          {tab === "ehealth" && isSelf && <MyEhealthSettings embedded onOpenData={() => setTab("data")} />}
        </>
      )}
    </div>
  );
}
