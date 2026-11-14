import React, { useCallback, useEffect, useState } from "react";
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
function AccessTab({ doctorId, row, reload }) {
  const [saving, setSaving] = useState("");
  const toggle = async (service, enabled) => {
    try {
      setSaving(service);
      const res = await ehealthAdminHelper.saveDoctorAccess(doctorId, { [service]: enabled });
      if (!res?.success) throw new Error(res?.error?.message || "Nie udało się zapisać");
      await reload();
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setSaving("");
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
        Włączenie nie zużywa licencji — licznik miesiąca rośnie dopiero przy pierwszym użyciu.
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr><th className="px-3 py-2 font-medium">Usługa</th><th className="px-3 py-2 font-medium">Dostęp</th><th className="px-3 py-2 font-medium">Użycie w tym miesiącu</th></tr>
          </thead>
          <tbody>
            {SERVICES.map(([service, label]) => {
              const on = row.access?.[service] !== false;
              const u = usageOf(service);
              return (
                <tr key={service} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{label}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={on} disabled={saving === service} onChange={(e) => toggle(service, e.target.checked)} />
                      <span className={on ? "text-emerald-700" : "text-gray-500"}>{on ? "włączony" : "wyłączony"}</span>
                    </label>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{u ? `${u.requestCount}×` : "nie użyto"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
          {row.access?.eligibility === false ? <Pill tone="grey">wyłączone</Pill> : ewus.configured ? <Pill tone="green">uzupełnione</Pill> : <Pill tone="red">brak</Pill>}
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const isAdmin = user?.role === "admin";
  const ownId = String(user?.id || user?._id || "");
  const isSelf = user?.role === "doctor" && ownId === String(id);
  const allowed = isAdmin || isSelf;

  const [doctor, setDoctor] = useState(null);
  const [row, setRow] = useState(null);
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "data");
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
    if (allowed) load();
  }, [allowed, load]);

  if (!allowed) return <NotFound404 />;

  const save = async (values, resetForm) => {
    try {
      showLoader();
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

  const tabs = isAdmin
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
        <h1 className="text-xl font-bold text-gray-900">{isSelf ? "Moje konto" : "Konto pracownika"}{name ? `: ${name}` : ""}</h1>
        {row && <Pill tone="grey">{ROLE_LABEL[role] || role}</Pill>}
        {row && (row.medfilePractitionerId ? <Pill tone="green">aktywne w Medfile</Pill> : <Pill tone="amber">niewysłane do Medfile</Pill>)}
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

      {!doctor ? (
        <p className="text-sm text-gray-500">Wczytywanie…</p>
      ) : (
        <>
          {tab === "data" && (
            <AddDoctorForm
              key={formKey}
              inline
              isOpen
              isEditMode
              selfMode={!isAdmin}
              initialData={doctor}
              onClose={() => navigate(isAdmin ? "/administracja/konta" : "/ustawienia")}
              onAddDoctor={save}
            />
          )}
          {tab === "access" && isAdmin && <AccessTab doctorId={id} row={row} reload={load} />}
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
