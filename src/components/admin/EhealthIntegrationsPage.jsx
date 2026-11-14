import EwusAccountForm from "../ehealth/EwusAccountForm";
import DoctorEwusPanel from "../ehealth/DoctorEwusPanel";
import CellsPanel from "../ehealth/CellsPanel";
import ErrorLogTable from "../ehealth/ErrorLogTable";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Plug,
  RefreshCw,
  Save,
  Shield,
} from "lucide-react";
import { useLoader } from "../../context/LoaderContext";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";

const ROLE_LABELS = { LEK: "lekarz", LEKD: "lekarz dentysta", FIZJO: "fizjoterapeuta", PIEL: "pielęgniarka" };
const SERVICE_LABELS = {
  prescription: "e-Recepta",
  drugs: "Baza leków",
  referral: "e-Skierowanie",
  ezla: "e-ZLA",
  eligibility: "eWUŚ",
};

const USAGE_SHORT = {
  prescription: "e-Rx",
  drugs: "baza",
  referral: "skier.",
  ezla: "e-ZLA",
  eligibility: "eWUŚ",
};

const ORG_FIELD_LABELS = [
  ["rpwdl", "Numer księgi RPWDL (część I)", "000000928201"],
  ["rpwdlUnit", "Jednostka organizacyjna (część V)", "np. 01"],
  ["unitName", "Nazwa jednostki", ""],
  ["name", "Nazwa podmiotu", ""],
  ["regon", "REGON", ""],
  ["nip", "NIP", ""],
  ["phone", "Telefon", "+48..."],
  ["street", "Ulica", ""],
  ["houseNumber", "Numer domu", ""],
  ["unitId", "Numer lokalu", ""],
  ["city", "Miejscowość", ""],
  ["postalCode", "Kod pocztowy", ""],
  ["nfzDepartment", "Oddział NFZ (2 cyfry)", "np. 07"],
  ["nfzContract", "Numer umowy z NFZ (opcjonalnie)", "np. 01-06-02336-20-03/06"],
];

// Checksums the Polish registers use (NIP, REGON); the same rules the briefs ask for.
const digits = (v) => String(v || "").replace(/\D/g, "");
const nipOk = (v) => {
  const d = digits(v);
  if (d.length !== 10) return false;
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = w.reduce((a, x, i) => a + x * Number(d[i]), 0) % 11;
  return sum !== 10 && sum === Number(d[9]);
};
const regonOk = (v) => {
  const d = digits(v);
  if (d.length === 9) {
    const w = [8, 9, 2, 3, 4, 5, 6, 7];
    const sum = w.reduce((a, x, i) => a + x * Number(d[i]), 0) % 11;
    return (sum === 10 ? 0 : sum) === Number(d[8]);
  }
  return d.length === 14;
};
function validateEntity(org = {}) {
  const problems = [];
  if (!String(org.name || "").trim()) problems.push("Podaj nazwę podmiotu.");
  if (org.nip && !nipOk(org.nip)) problems.push("NIP: 10 cyfr z poprawną sumą kontrolną.");
  if (org.regon && !regonOk(org.regon)) problems.push("REGON: 9 cyfr (z sumą kontrolną) albo 14 cyfr jednostki.");
  if (org.rpwdl && digits(org.rpwdl).length !== 12) problems.push("Numer księgi rejestrowej (RPWDL): 12 cyfr.");
  if (org.rpwdlUnit && !/^\d{2}$/.test(String(org.rpwdlUnit).trim())) problems.push("Kod jednostki (część V): 2 cyfry.");
  if (org.postalCode && !/^\d{2}-\d{3}$/.test(String(org.postalCode).trim())) problems.push("Kod pocztowy: 00-000.");
  if (org.phone && !/^\+48\d{9}$/.test(String(org.phone).replace(/\s/g, ""))) problems.push("Telefon: +48 i 9 cyfr.");
  return problems;
}

const emptyEnv = () => ({
  org: {},
  integratorUuid: "",
  organizationUuid: "",
  practitionerUuid: "",
  oidRoot: "",
  practitionerNpwz: "",
  secret: "",
  hasSecret: false,
  secretMasked: "",
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EhealthIntegrationsPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const [tab, setTab] = useState("connection");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEnvironment, setActiveEnvironment] = useState("test");
  const [test, setTest] = useState(emptyEnv());
  const [production, setProduction] = useState(emptyEnv());
  const [facilityTlsStatus, setFacilityTlsStatus] = useState("missing");
  const [facilityWssStatus, setFacilityWssStatus] = useState("missing");
  const [ewusMfaConfigured, setEwusMfaConfigured] = useState(false);
  const [liveSendEnabled, setLiveSendEnabled] = useState(false);
  const [lastConnectionTest, setLastConnectionTest] = useState(null);
  const [runtimeProvider, setRuntimeProvider] = useState(""); // empty until the settings have loaded
  const [licenseCaps, setLicenseCaps] = useState({
    prescription: 0,
    drugs: 0,
    referral: 0,
    ezla: 0,
    eligibility: 0,
  });
  const [licenseSnapshot, setLicenseSnapshot] = useState(null);
  const [licenseDoctors, setLicenseDoctors] = useState([]);
  const [warningPercent, setWarningPercent] = useState(80);
  const [overCapMode, setOverCapMode] = useState({});
  const [auditRows, setAuditRows] = useState([]);
  const [configAudit, setConfigAudit] = useState([]);
  const [queueRows, setQueueRows] = useState([]);
  const [savingAccessKey, setSavingAccessKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ firstName: "", lastName: "", npwz: "" });
  const [oidRoot, setOidRoot] = useState("");
  const [tlsFile, setTlsFile] = useState(null);
  const [wssFile, setWssFile] = useState(null);
  const [certInfo, setCertInfo] = useState({ tls: null, wss: null });
  const [tlsPassword, setTlsPassword] = useState("");
  const [wssPassword, setWssPassword] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [zusFile, setZusFile] = useState(null);
  const [zusPassword, setZusPassword] = useState("");
  const [ewusForm, setEwusForm] = useState({
    domain: "13",
    operatorType: "LEK",
    identifier: "",
    username: "",
    password: "",
  });
  const [uploadingCerts, setUploadingCerts] = useState(false);

  const envForm = activeEnvironment === "production" ? production : test;
  const setEnvForm = activeEnvironment === "production" ? setProduction : setTest;

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();
      const [settingsRes, licensesRes, doctorsRes, auditRes, queueRes] = await Promise.all([
        ehealthAdminHelper.getSettings(),
        ehealthAdminHelper.getLicenses(),
        ehealthAdminHelper.getLicenseDoctors(),
        ehealthAdminHelper.getAudit(),
        ehealthAdminHelper.getQueue(),
      ]);
      if (!settingsRes?.success) {
        throw new Error(settingsRes?.error?.message || "Nie udało się pobrać ustawień");
      }
      const d = settingsRes.data;
      setActiveEnvironment(d.activeEnvironment || "test");
      setTest({
        ...emptyEnv(),
        ...d.test,
        secret: "",
      });
      setProduction({
        ...emptyEnv(),
        ...d.production,
        secret: "",
      });
      setOidRoot(d.test?.oidRoot || d.production?.oidRoot || "2.16.840.1.113883.3.4424.2.7.153506");
      setFacilityTlsStatus(d.facilityTlsStatus || "missing");
      setFacilityWssStatus(d.facilityWssStatus || "missing");
      setCertInfo({ tls: d.facilityCertInfo?.tls || null, wss: d.facilityCertInfo?.wss || null });
      setEwusMfaConfigured(Boolean(d.ewusMfaConfigured));
      setLiveSendEnabled(Boolean(d.liveSendEnabled));
      setLastConnectionTest(d.lastConnectionTest || null);
      setRuntimeProvider(d.runtimeProvider || "");
      setLicenseCaps({
        prescription: d.licenseCaps?.prescription || 0,
        drugs: d.licenseCaps?.drugs || 0,
        referral: d.licenseCaps?.referral || 0,
        ezla: d.licenseCaps?.ezla || 0,
        eligibility: d.licenseCaps?.eligibility || 0,
      });
      if (licensesRes?.success) {
        setLicenseSnapshot(licensesRes.data);
      }
      if (d.licensePolicy) {
        setWarningPercent(d.licensePolicy.warningPercent || 80);
        setOverCapMode(d.licensePolicy.overCapMode || {});
        setNotifyEmail(d.licensePolicy.notifyEmail || "");
      }
      if (doctorsRes?.success) {
        setLicenseDoctors(doctorsRes.data?.doctors || []);
      }
      if (auditRes?.success) {
        setAuditRows(auditRes.data?.events || []);
        setConfigAudit(auditRes.data?.config || []);
      }
      if (queueRes?.success) setQueueRows(queueRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać ustawień integracji e-Zdrowie.");
      toast.error("Błąd pobierania ustawień e-Zdrowie");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveCredentials = async () => {
    const problems = validateEntity(envForm.org || {});
    if (problems.length) {
      toast.error(problems.join(" "));
      return;
    }
    try {
      showLoader();
      const payload = {
        activeEnvironment,
        facilityTlsStatus,
        facilityWssStatus,
        ewusMfaConfigured,
        liveSendEnabled,
        test: {
          integratorUuid: test.integratorUuid,
          organizationUuid: test.organizationUuid,
          practitionerUuid: test.practitionerUuid,
          org: test.org || {},
          oidRoot,
          ...(test.secret.trim() ? { secret: test.secret.trim() } : {}),
        },
        production: {
          integratorUuid: production.integratorUuid,
          organizationUuid: production.organizationUuid,
          practitionerUuid: production.practitionerUuid,
          org: production.org || {},
          ...(production.secret.trim() ? { secret: production.secret.trim() } : {}),
        },
      };
      const res = await ehealthAdminHelper.saveSettings(payload);
      if (!res?.success) {
        throw new Error(res?.error?.message || "Save failed");
      }
      toast.success("Ustawienia zapisane");
      setTest((prev) => ({ ...prev, secret: "", hasSecret: res.data.test?.hasSecret, secretMasked: res.data.test?.secretMasked }));
      setProduction((prev) => ({
        ...prev,
        secret: "",
        hasSecret: res.data.production?.hasSecret,
        secretMasked: res.data.production?.secretMasked,
      }));
      setLastConnectionTest(res.data.lastConnectionTest || lastConnectionTest);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się zapisać ustawień");
    } finally {
      hideLoader();
    }
  };

  const handleConnectionTest = async () => {
    try {
      setTesting(true);
      const res = await ehealthAdminHelper.connectionTest();
      if (!res?.success) {
        throw new Error(res?.error?.message || "Test failed");
      }
      setLastConnectionTest(res.data.lastConnectionTest || res.data);
      if (res.data.ok) {
        toast.success(res.data.message || "Połączenie OK");
      } else {
        toast.error(res.data.message || "Test nieudany");
      }
    } catch (err) {
      console.error(err);
      toast.error("Błąd testu połączenia");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveLicenses = async () => {
    try {
      showLoader();
      const res = await ehealthAdminHelper.saveLicenses({
        licenseCaps,
        licensePolicy: { warningPercent, overCapMode, notifyEmail },
      });
      if (!res?.success) {
        throw new Error(res?.error?.message || "Save failed");
      }
      toast.success("Limity licencji zapisane");
      setLicenseSnapshot(res.data.snapshot || licenseSnapshot);
      if (res.data.licenseCaps) setLicenseCaps(res.data.licenseCaps);
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się zapisać limitów");
    } finally {
      hideLoader();
    }
  };

  const handleDoctorAccess = async (doctorId, service, enabled) => {
    const key = `${doctorId}:${service}`;
    const previous = licenseDoctors;
    setSavingAccessKey(key);
    setLicenseDoctors((rows) =>
      rows.map((row) =>
        String(row.id) === String(doctorId)
          ? { ...row, access: { ...row.access, [service]: enabled } }
          : row
      )
    );
    try {
      const res = await ehealthAdminHelper.saveDoctorAccess(doctorId, { [service]: enabled });
      if (!res?.success) {
        throw new Error(res?.error?.message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      setLicenseDoctors(previous);
      toast.error("Nie udało się zmienić dostępu lekarza");
    } finally {
      setSavingAccessKey("");
    }
  };

  const holdersOf = (service) => {
    const list = licenseDoctors
      .filter((d) => d.usage?.some((u) => u.service === service))
      .map((d) => `${d.name} (${d.usage.find((u) => u.service === service).requestCount || 1}×)`);
    return list.length ? list.join(", ") : "nikt jeszcze w tym miesiącu";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Plug className="text-teal-700 mr-3" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-teal-700">Integracje e-Zdrowie</h1>
          <p className="text-sm text-gray-500">P1 / Medfile — poświadczenia i licencje (tylko admin)</p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1" size={20} />
          <div className="text-sm text-blue-800">
            Brak konta Medfile HIS — tylko API. Secret po zapisaniu nie wraca na ekran.
            {runtimeProvider && (
              <>
                Provider runtime: <strong>{runtimeProvider}</strong>
                {runtimeProvider === "mock" && " (mock — bez wywołania Medfile)"}.{" "}
              </>
            )}
            Certyfikaty P1/ZUS są wysyłane do API i nie są trzymane w CM7MED.
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("connection")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "connection" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Połączenie
        </button>
        <button
          type="button"
          onClick={() => setTab("entity")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "entity" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Podmiot i certyfikaty
        </button>
        <button
          type="button"
          onClick={() => setTab("ewus")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "ewus" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          eWUŚ
        </button>
        <button
          type="button"
          onClick={() => setTab("cells")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "cells" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Komórki organizacyjne
        </button>
        <button
          type="button"
          onClick={() => setTab("access")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "access" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Dostęp lekarzy
        </button>
        <button
          type="button"
          onClick={() => setTab("licences")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "licences" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Licencje i limity
        </button>
        <button
          type="button"
          onClick={() => setTab("errors")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "errors" ? "border-teal-700 text-teal-800" : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Dziennik błędów
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />
        </div>
      ) : ["connection", "entity", "ewus", "cells"].includes(tab) ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
          {(tab === "connection") && (
            <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Środowisko</label>
            <div className="flex gap-2">
              {["test", "production"].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setActiveEnvironment(env)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeEnvironment === env
                      ? "bg-teal-700 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {env === "test" ? "Test" : "Produkcja"}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Aktywne środowisko używane do połączenia: <strong>{activeEnvironment}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medfile Integrator UUID
            </label>
            <input
              type="text"
              value={envForm.integratorUuid}
              onChange={(e) => setEnvForm({ ...envForm, integratorUuid: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="off"
            />
            {envForm.integratorUuidFromEnv && (
              <p className="mt-1 text-xs text-amber-700">Wartość pochodzi ze zmiennych środowiska serwera (nie jest zapisana w bazie). Zapis tego ekranu zapisze ją w bazie.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medfile Integrator Secret
            </label>
            <input
              type="password"
              value={envForm.secret}
              onChange={(e) => setEnvForm({ ...envForm, secret: e.target.value })}
              placeholder={
                envForm.hasSecret
                  ? "Zapisany (wpisz nowy, aby nadpisać)"
                  : "Wklej secret"
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="new-password"
            />
            {envForm.hasSecret && (
              <p className="mt-1 text-xs text-gray-500">Secret: {envForm.secretMasked}{envForm.secretFromEnv ? " — połączenie z niego korzysta; wpisz nowy tylko, aby go zmienić." : ""}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tryb wystawiania</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveSendEnabled(false)}
                className={`px-4 py-2 rounded-lg text-sm ${!liveSendEnabled ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Tylko sprawdzanie
              </button>
              <button
                type="button"
                onClick={() => {
                  if (liveSendEnabled) return;
                  if (window.confirm("Wystawianie na żywo wysyła dokumenty do pacjentów i do P1. Włączyć?")) setLiveSendEnabled(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm ${liveSendEnabled ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Wystawianie na żywo
              </button>
              {liveSendEnabled && <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">NA ŻYWO</span>}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Domyślnie „Tylko sprawdzanie”: dokument jest weryfikowany, ale nic nie trafia do pacjenta. Zmiana zapisuje się przyciskiem „Zapisz”.
            </p>
          </div>

            </>
          )}
          {(tab === "entity") && (
            <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identyfikator w Medfile (UUID organizacji)
            </label>
            <input
              type="text"
              readOnly
              value={envForm.organizationUuid || ""}
              placeholder="Nadaje Medfile po wysłaniu danych organizacji"
              className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
            />
            <label className="mt-3 block text-sm font-medium text-gray-700">OID przychodni</label>
            <p className="text-xs text-gray-500">Numer OID przychodzi e-mailem z P1 po wygenerowaniu certyfikatów. Format: 2.16.840.1.113883.3.4424.2.7.N</p>
            <input
              type="text"
              placeholder="np. 2.16.840.1.113883.3.4424.2.7.153506"
              value={oidRoot}
              onChange={(e) => setOidRoot(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded-lg text-sm"
              autoComplete="off"
            />
            <button
              type="button"
              disabled={creatingOrg}
              onClick={async () => {
                try {
                  setCreatingOrg(true);
                  const res = await ehealthAdminHelper.createOrganization({ oidRoot });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setEnvForm({ ...envForm, organizationUuid: res.data.organizationUuid || envForm.organizationUuid });
                  toast.success(res.data?.updatedInPlace ? "Dane organizacji zaktualizowane w Medfile" : "Organizacja utworzona w Medfile");
                } catch (err) {
                  toast.error(err.message || "Nie udało się utworzyć organizacji");
                } finally {
                  setCreatingOrg(false);
                }
              }}
              className="mt-2 text-sm text-teal-700 hover:underline"
            >
              {creatingOrg ? "Wysyłam…" : "Wyślij dane organizacji do Medfile"}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700">Dane podmiotu i jednostki</p>
            <p className="mt-1 text-xs text-gray-500">
              Numery z rejestru RPWDL. Komórki organizacyjne dodajesz w osobnej zakładce. Po zapisaniu kliknij „Wyślij dane organizacji do Medfile”.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ORG_FIELD_LABELS.filter(([key]) => !["nfzDepartment", "nfzContract"].includes(key)).map(([key, label, placeholder]) => (
                <label key={key} className="block text-xs text-gray-600">
                  {label}
                  <input
                    type="text"
                    value={envForm.org?.[key] || ""}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setEnvForm({ ...envForm, org: { ...(envForm.org || {}), [key]: e.target.value } })
                    }
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    autoComplete="off"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={envForm.org?.hasNfz === "true"}
                  onChange={(e) => setEnvForm({ ...envForm, org: { ...(envForm.org || {}), hasNfz: e.target.checked ? "true" : "" } })}
                />
                Przychodnia ma umowę z NFZ
              </label>
              <p className="text-xs text-gray-500">
                Domyślnie wyłączone: placówka prywatna bez kontraktu, recepty refundowane wystawia lekarz na własny numer PWZ. Gdy wyłączone, oddział i numer umowy nie są wymagane ani wysyłane.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[["nfzDepartment", "Oddział NFZ (01–16)", "np. 07"], ["nfzContract", "Numer umowy z NFZ", "np. 01-06-02336-20-03/06"]].map(([key, label, ph]) => (
                  <label key={key} className="block text-xs text-gray-600">
                    {label}
                    <input
                      type="text"
                      disabled={envForm.org?.hasNfz !== "true"}
                      value={envForm.org?.[key] || ""}
                      placeholder={ph}
                      onChange={(e) => setEnvForm({ ...envForm, org: { ...(envForm.org || {}), [key]: e.target.value } })}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                      autoComplete="off"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">
              Certyfikaty P1 (TLS + WSS) — pliki produkcyjne, wysyłka do API
            </p>
            <p className="text-xs text-gray-500">
              Pliki i hasła nie są zapisywane w CM7MED. Przed wysyłką sprawdzamy hasło, klucz i ważność każdego pliku; poniżej zostają tylko jawne dane certyfikatu.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[["TLS", "tls", facilityTlsStatus], ["WSS", "wss", facilityWssStatus]].map(([label, key, status]) => {
                const info = certInfo[key];
                const left = info?.notAfter ? Math.ceil((new Date(info.notAfter) - Date.now()) / 86400000) : null;
                const expired = left !== null && left < 0;
                return (
                  <div key={key} className={`rounded-lg border p-3 text-xs ${status !== "present" ? "border-gray-200 bg-gray-50 text-gray-600" : expired ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-900"}`}>
                    <p className="font-semibold">{label}: {status !== "present" ? "brak certyfikatu" : expired ? "WYGASŁ" : "wgrany i sprawdzony"}</p>
                    {status === "present" && info ? (
                      <>
                        <p>Podmiot: {info.name || "—"}</p>
                        <p>Wystawca: {info.issuer || "—"}</p>
                        <p>Ważny: {String(info.notBefore).slice(0, 10)} → {String(info.notAfter).slice(0, 10)}{left !== null && !expired ? ` (jeszcze ${left} dni)` : ""}</p>
                        <p>Sprawdzono: {info.checkedAt ? new Date(info.checkedAt).toLocaleString("pl-PL") : "—"}</p>
                      </>
                    ) : status === "present" ? (
                      <p>Wgrany przed wprowadzeniem sprawdzania — wgraj ponownie, aby zobaczyć dane i ważność.</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="text-xs text-gray-600">
                TLS .p12
                <input type="file" className="block mt-1 text-sm" onChange={(e) => setTlsFile(e.target.files?.[0] || null)} />
              </label>
              <label className="text-xs text-gray-600">
                WSS .p12
                <input type="file" className="block mt-1 text-sm" onChange={(e) => setWssFile(e.target.files?.[0] || null)} />
              </label>
              <input
                type="password"
                placeholder="Hasło do TLS"
                value={tlsPassword}
                onChange={(e) => setTlsPassword(e.target.value)}
                className="p-2 border rounded-lg text-sm"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Hasło do WSS"
                value={wssPassword}
                onChange={(e) => setWssPassword(e.target.value)}
                className="p-2 border rounded-lg text-sm"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              disabled={uploadingCerts}
              onClick={async () => {
                if (!tlsFile || !wssFile || !tlsPassword || !wssPassword) {
                  toast.error("Wskaż pliki TLS i WSS oraz hasło do każdego z nich");
                  return;
                }
                try {
                  setUploadingCerts(true);
                  const [tlsCertificate, wssCertificate] = await Promise.all([
                    fileToBase64(tlsFile),
                    fileToBase64(wssFile),
                  ]);
                  const res = await ehealthAdminHelper.uploadP1Certificates({
                    tlsCertificate,
                    wssCertificate,
                    tlsPassword,
                    wssPassword,
                  });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setFacilityTlsStatus("present");
                  setFacilityWssStatus("present");
                  if (res.data?.certificates) setCertInfo({ tls: res.data.certificates.tls || null, wss: res.data.certificates.wss || null });
                  setTlsPassword("");
                  setWssPassword("");
                  toast.success("Certyfikaty P1 wysłane do API");
                } catch (err) {
                  toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || err.message || "Nie udało się wysłać certyfikatów P1");
                } finally {
                  setUploadingCerts(false);
                }
              }}
              className="text-sm text-teal-700 hover:underline"
            >
              {uploadingCerts ? "Wysyłam…" : "Wyślij TLS + WSS do API"}
            </button>
          </div>

            </>
          )}
          {(tab === "cells") && (
            <>
          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <CellsPanel />
          </div>

            </>
          )}
          {(tab === "ewus") && (
            <>
          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">eWUŚ — konto NFZ (Portal Świadczeniodawcy)</p>
            <EwusAccountForm scope="facility" />
            <div className="border-t border-gray-100 pt-3"><DoctorEwusPanel /></div>
          </div>

            </>
          )}
          {(tab === "connection" || tab === "entity") && (
            <>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={handleSaveCredentials}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg flex items-center gap-2 hover:bg-teal-800"
            >
              <Save size={16} />
              Zapisz
            </button>
            <button
              type="button"
              onClick={handleConnectionTest}
              disabled={testing}
              className="px-4 py-2 border border-teal-700 text-teal-700 rounded-lg flex items-center gap-2 hover:bg-teal-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={testing ? "animate-spin" : ""} />
              Test połączenia
            </button>
          </div>

            </>
          )}
          {(tab === "connection") && (
            <>
          {lastConnectionTest?.at && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                lastConnectionTest.ok
                  ? "bg-green-50 text-green-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {lastConnectionTest.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div>
                <div className="font-medium">
                  Ostatni test: {lastConnectionTest.ok ? "OK" : "Nieudany"}
                </div>
                <div>{lastConnectionTest.message}</div>
                <div className="text-xs opacity-80 mt-1">
                  {new Date(lastConnectionTest.at).toLocaleString("pl-PL")} ·{" "}
                  {lastConnectionTest.environment} · {lastConnectionTest.provider}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
          {tab === "licences" && (
            <>
          <div className="flex items-center gap-2 text-gray-700">
            <Shield size={18} className="text-teal-700" />
            <span className="text-sm">
              Unikalni lekarze w miesiącu (Europa/Warszawa)
              {licenseSnapshot?.yearMonth ? `: ${licenseSnapshot.yearMonth}` : ""}
            </span>
          </div>

          <div className="space-y-4">
            {Object.keys(SERVICE_LABELS).map((service) => {
              const snap = licenseSnapshot?.services?.find((s) => s.service === service);
              return (
                <div key={service} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border-b border-gray-100 pb-4">
                  <div className="font-medium text-gray-800">{SERVICE_LABELS[service]}</div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Limit (cap)</label>
                    <input
                      type="number"
                      min={0}
                      value={licenseCaps[service] ?? 0}
                      onChange={(e) =>
                        setLicenseCaps({
                          ...licenseCaps,
                          [service]: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <label className="block text-xs text-gray-500">
                      Po przekroczeniu
                      <select
                        value={overCapMode[service] || "block"}
                        onChange={(e) => setOverCapMode({ ...overCapMode, [service]: e.target.value })}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="notify">Pozwól – dodatkowo płatne</option>
                        <option value="approval">Wymagaj zgody administratora</option>
                        <option value="block">Blokuj kolejne osoby</option>
                      </select>
                    </label>
                    Użyte: <strong>{snap?.uniqueDoctors ?? 0}</strong>{snap?.paidOverPool > 0 && <span className="ml-2 font-medium text-red-600">+{snap.paidOverPool} płatne</span>}
                    {snap?.cap > 0 && (
                      <>
                        {" "}/ {snap.cap}
                        {snap.nearWarning && !snap.overCap && (
                          <span className="ml-2 text-amber-700 font-medium">próg {warningPercent}%</span>
                        )}
                        {snap.overCap && (
                          <span className="ml-2 text-red-600 font-medium">ponad limit</span>
                        )}
                      </>
                    )}
                    {(!snap?.cap || snap.cap === 0) && (
                      <span className="text-gray-400"> (bez limitu)</span>
                    )}
                    <div className="text-xs text-gray-500">Licencję mają: {holdersOf(service)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <label className="block text-sm text-gray-700 max-w-xs">
            Próg ostrzeżenia (%)
            <input
              type="number"
              min={1}
              max={100}
              value={warningPercent}
              onChange={(e) => setWarningPercent(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 80)))}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            />
          </label>

          <label className="block text-sm text-gray-700 max-w-md">
            E-mail do powiadomień
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="np. administrator@przychodnia.pl"
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            />
            <span className="block text-xs text-gray-500">Wiadomość przychodzi po przekroczeniu progu ostrzeżenia oraz przy pierwszej licencji ponad pulę (raz w miesiącu dla usługi).</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveLicenses}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg flex items-center gap-2 hover:bg-teal-800"
            >
              <Save size={16} />
              Zapisz limity
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const csv = await ehealthAdminHelper.exportLicenses();
                  const blob = new Blob([typeof csv === "string" ? csv : ""], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "medfile-licenses.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  toast.error("Nie udało się pobrać CSV");
                }
              }}
              className="px-4 py-2 border border-teal-700 text-teal-800 rounded-lg text-sm"
            >
              Pobierz CSV
            </button>
          </div>

            </>
          )}
          {tab === "access" && (
            <>
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Dostęp lekarzy</h3>
            <p className="text-xs text-gray-500 mb-3">
              Przegląd wszystkich kont. Dane, dostęp do usług i konto eWUŚ konkretnej osoby ustawiasz w jej karcie konta (Konta użytkowników → Edytuj, albo link „Otwórz kartę konta” w wierszu). Włączenie usługi nie zużywa licencji.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-2 pr-3 font-medium">Lekarz</th>
                    {Object.entries(SERVICE_LABELS).map(([service, label]) => (
                      <th key={service} className="py-2 px-2 font-medium whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                    <th className="py-2 px-2 font-medium whitespace-nowrap">Certyfikat ZUS</th>
                    <th className="py-2 px-2 font-medium whitespace-nowrap">Konto eWUŚ</th>
                    <th className="py-2 pl-2 font-medium">Użycie w miesiącu</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseDoctors.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-4 text-gray-500">
                        Brak aktywnych lekarzy.
                      </td>
                    </tr>
                  )}
                  {licenseDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 text-gray-800">
                        <div className="whitespace-nowrap">{doctor.name}</div>
                        <p className="mt-1 text-xs text-gray-500">
                          {ROLE_LABELS[doctor.medfileRole || "LEK"] || doctor.medfileRole} · PWZ {doctor.npwz || "—"}
                        </p>
                        <p className="text-xs">
                          {doctor.medfilePractitionerId ? (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">konto w Medfile</span>
                          ) : (
                            <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700">nie wysłano do Medfile</span>
                          )}
                        </p>
                        <a href={`/konto/${doctor.id}`} className="mt-1 inline-block text-xs text-teal-700 hover:underline">
                          Otwórz kartę konta (dane, dostęp, Medfile) →
                        </a>
                      </td>
                      {Object.keys(SERVICE_LABELS).map((service) => {
                        const key = `${doctor.id}:${service}`;
                        return (
                          <td key={service} className="py-2 px-2 text-center">
                            <span
                              className={doctor.access?.[service] !== false ? "text-emerald-600" : "text-gray-400"}
                              title={`${doctor.name}: ${SERVICE_LABELS[service]} ${doctor.access?.[service] !== false ? "włączony" : "wyłączony"} (zmiana w karcie konta)`}
                            >
                              {doctor.access?.[service] !== false ? "✓" : "✗"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-xs whitespace-nowrap">
                        {!["LEK", "LEKD"].includes(doctor.medfileRole || "LEK") ? (
                          <span className="text-gray-400">nie dotyczy</span>
                        ) : !doctor.zusCert ? (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700">brak</span>
                        ) : new Date(doctor.zusCert.validTo).getTime() < Date.now() ? (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700">wygasł</span>
                        ) : new Date(doctor.zusCert.validTo).getTime() - Date.now() < 30 * 86400000 ? (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-800">wygasa {new Date(doctor.zusCert.validTo).toLocaleDateString("pl-PL")}</span>
                        ) : (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">{doctor.zusStored ? "wgrany" : "sprawdzony"} do {new Date(doctor.zusCert.validTo).toLocaleDateString("pl-PL")}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-xs whitespace-nowrap">
                        {doctor.access?.eligibility === false ? (
                          <span className="text-gray-400">wyłączone</span>
                        ) : !doctor.ewusAccount?.configured ? (
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700">brak</span>
                        ) : doctor.ewusAccount.mode === "auto" && !doctor.ewusAccount.hasTotp ? (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-800">brak klucza MFA</span>
                        ) : (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">konto uzupełnione</span>
                        )}
                      </td>
                      <td className="py-2 pl-2 text-gray-600">
                        {doctor.usage?.length
                          ? doctor.usage.map((row) => (
                              <div key={row.service} className="text-xs">
                                {USAGE_SHORT[row.service] || row.service}: {row.requestCount || 1}× {row.lastResult || "użyto"}
                                {row.lastExternalId ? ` · ${row.lastExternalId}` : ""}
                              </div>
                            ))
                          : "Nie użyto"}
                        {Object.entries(overCapMode)
                          .filter(([, mode]) => mode === "approval")
                          .map(([service]) => (
                            <button
                              key={service}
                              type="button"
                              className="mt-1 block text-xs text-teal-800 underline"
                              onClick={() =>
                                ehealthAdminHelper
                                  .approveLicense(doctor.id, service)
                                  .then(() => toast.success("Zgoda zapisana"))
                              }
                            >
                              Zgoda: {SERVICE_LABELS[service]}
                            </button>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            </>
          )}
          {tab === "errors" && (
            <>
          <div className="pt-4 space-y-2">
            <ErrorLogTable />
            <h3 className="text-sm font-semibold text-gray-800 pt-2">Audyt integracji</h3>
            {auditRows.slice(0, 15).map((row, index) => (
              <div key={`${row.correlationId}-${index}`} className="text-xs text-gray-600">
                {row.at ? new Date(row.at).toLocaleString("pl-PL") : ""} · {row.action} · {row.service} · {row.status}
                {row.errorCategory ? ` · ${row.errorCategory}` : ""}
              </div>
            ))}
            <h3 className="text-sm font-semibold text-gray-800 pt-2">Audyt konfiguracji</h3>
            {configAudit.slice(0, 10).map((row, index) => (
              <div key={`${row.action}-${index}`} className="text-xs text-gray-600">
                {row.at ? new Date(row.at).toLocaleString("pl-PL") : ""} · {row.action}
                {row.service ? ` · ${row.service}` : ""}
              </div>
            ))}
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EhealthIntegrationsPage;
