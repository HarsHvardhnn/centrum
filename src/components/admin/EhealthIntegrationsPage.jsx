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

const emptyEnv = () => ({
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
  const [tab, setTab] = useState("credentials");
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
  const [runtimeProvider, setRuntimeProvider] = useState("mock");
  const [licenseCaps, setLicenseCaps] = useState({
    prescription: 0,
    drugs: 0,
    referral: 0,
    ezla: 0,
    eligibility: 0,
  });
  const [licenseSnapshot, setLicenseSnapshot] = useState(null);
  const [licenseDoctors, setLicenseDoctors] = useState([]);
  const [savingAccessKey, setSavingAccessKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ firstName: "", lastName: "", npwz: "" });
  const [oidRoot, setOidRoot] = useState("");
  const [tlsFile, setTlsFile] = useState(null);
  const [wssFile, setWssFile] = useState(null);
  const [p1Password, setP1Password] = useState("");
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
      const [settingsRes, licensesRes, doctorsRes] = await Promise.all([
        ehealthAdminHelper.getSettings(),
        ehealthAdminHelper.getLicenses(),
        ehealthAdminHelper.getLicenseDoctors(),
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
      setEwusMfaConfigured(Boolean(d.ewusMfaConfigured));
      setLiveSendEnabled(Boolean(d.liveSendEnabled));
      setLastConnectionTest(d.lastConnectionTest || null);
      setRuntimeProvider(d.runtimeProvider || "mock");
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
      if (doctorsRes?.success) {
        setLicenseDoctors(doctorsRes.data?.doctors || []);
      }
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
          oidRoot,
          ...(test.secret.trim() ? { secret: test.secret.trim() } : {}),
        },
        production: {
          integratorUuid: production.integratorUuid,
          organizationUuid: production.organizationUuid,
          practitionerUuid: production.practitionerUuid,
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
      const res = await ehealthAdminHelper.saveLicenses(licenseCaps);
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
            Provider runtime: <strong>{runtimeProvider}</strong>
            {runtimeProvider === "mock" && " (mock — bez wywołania Medfile)"}.
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

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("credentials")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "credentials" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Poświadczenia
        </button>
        <button
          type="button"
          onClick={() => setTab("licenses")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "licenses" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Licencje
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500" />
        </div>
      ) : tab === "credentials" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
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
              <p className="mt-1 text-xs text-gray-500">Secret zapisany: {envForm.secretMasked}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization UUID (opcjonalnie)
            </label>
            <input
              type="text"
              value={envForm.organizationUuid}
              onChange={(e) => setEnvForm({ ...envForm, organizationUuid: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="OID P1 (oidRoot) z maila przy certyfikatach"
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
                  toast.success("Organizacja utworzona przez API");
                } catch (err) {
                  toast.error(err.message || "Nie udało się utworzyć organizacji");
                } finally {
                  setCreatingOrg(false);
                }
              }}
              className="mt-2 text-sm text-teal-700 hover:underline"
            >
              {creatingOrg ? "Tworzę…" : "Utwórz organizację przez API (dane CM7)"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practitioner UUID (lekarz w API, nie konto HIS)
            </label>
            <input
              type="text"
              value={envForm.practitionerUuid}
              onChange={(e) => setEnvForm({ ...envForm, practitionerUuid: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="off"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              <input
                placeholder="Imię"
                value={doctorForm.firstName}
                onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
              <input
                placeholder="Nazwisko"
                value={doctorForm.lastName}
                onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
              <input
                placeholder="PWZ (NPWZ)"
                value={doctorForm.npwz}
                onChange={(e) => setDoctorForm({ ...doctorForm, npwz: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              disabled={creatingDoc}
              onClick={async () => {
                try {
                  setCreatingDoc(true);
                  const res = await ehealthAdminHelper.createPractitioner({
                    firstName: doctorForm.firstName,
                    lastName: doctorForm.lastName,
                    npwz: doctorForm.npwz,
                  });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setEnvForm({ ...envForm, practitionerUuid: res.data.practitionerUuid || envForm.practitionerUuid });
                  toast.success("Lekarz utworzony w Medfile");
                } catch (err) {
                  toast.error(err.message || "Nie udało się utworzyć lekarza");
                } finally {
                  setCreatingDoc(false);
                }
              }}
              className="mt-2 text-sm text-teal-700 hover:underline"
            >
              {creatingDoc ? "Tworzę…" : "Utwórz lekarza przez API"}
            </button>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">
              Certyfikaty P1 (TLS + WSS) — pliki produkcyjne, wysyłka do API
            </p>
            <p className="text-xs text-gray-500">
              Status: TLS {facilityTlsStatus} · WSS {facilityWssStatus}. Pliki nie są zapisywane w CM7MED.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                placeholder="Hasło do certyfikatów"
                value={p1Password}
                onChange={(e) => setP1Password(e.target.value)}
                className="p-2 border rounded-lg text-sm"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              disabled={uploadingCerts}
              onClick={async () => {
                if (!tlsFile || !wssFile || !p1Password) {
                  toast.error("Wskaż TLS, WSS i hasło");
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
                    tlsPassword: p1Password,
                    wssPassword: p1Password,
                  });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setFacilityTlsStatus("present");
                  setFacilityWssStatus("present");
                  setP1Password("");
                  toast.success("Certyfikaty P1 wysłane do API");
                } catch (err) {
                  toast.error(err.message || "Nie udało się wysłać certyfikatów P1");
                } finally {
                  setUploadingCerts(false);
                }
              }}
              className="text-sm text-teal-700 hover:underline"
            >
              {uploadingCerts ? "Wysyłam…" : "Wyślij TLS + WSS do API"}
            </button>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">Certyfikat ZUS (.pfx) — eZLA</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="file" className="text-sm" onChange={(e) => setZusFile(e.target.files?.[0] || null)} />
              <input
                type="password"
                placeholder="Hasło .pfx"
                value={zusPassword}
                onChange={(e) => setZusPassword(e.target.value)}
                className="p-2 border rounded-lg text-sm"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              disabled={uploadingCerts}
              onClick={async () => {
                if (!zusFile || !zusPassword) {
                  toast.error("Wskaż .pfx i hasło");
                  return;
                }
                try {
                  setUploadingCerts(true);
                  const certificate = await fileToBase64(zusFile);
                  const res = await ehealthAdminHelper.uploadZusCertificate({
                    certificate,
                    password: zusPassword,
                  });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setZusPassword("");
                  toast.success("Certyfikat ZUS wysłany do API");
                } catch (err) {
                  toast.error(err.message || "Nie udało się wysłać certyfikatu ZUS");
                } finally {
                  setUploadingCerts(false);
                }
              }}
              className="text-sm text-teal-700 hover:underline"
            >
              Wyślij ZUS .pfx do API
            </button>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">eWUŚ — operator NFZ (dane publiczne / test)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                placeholder="Oddział NFZ (13 = Świętokrzyski)"
                value={ewusForm.domain}
                onChange={(e) => setEwusForm({ ...ewusForm, domain: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
              <input
                placeholder="Login NFZ"
                value={ewusForm.username}
                onChange={(e) => setEwusForm({ ...ewusForm, username: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
              <input
                type="password"
                placeholder="Hasło NFZ"
                value={ewusForm.password}
                onChange={(e) => setEwusForm({ ...ewusForm, password: e.target.value })}
                className="p-2 border rounded-lg text-sm"
                autoComplete="new-password"
              />
              <input
                placeholder="Identyfikator (jeśli wymagany)"
                value={ewusForm.identifier}
                onChange={(e) => setEwusForm({ ...ewusForm, identifier: e.target.value })}
                className="p-2 border rounded-lg text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={ewusMfaConfigured}
                onChange={(e) => setEwusMfaConfigured(e.target.checked)}
              />
              MFA (TOTP) wymagane
            </label>
            <label className="flex items-center gap-2 text-sm text-red-800">
              <input
                type="checkbox"
                checked={liveSendEnabled}
                onChange={(e) => setLiveSendEnabled(e.target.checked)}
              />
              Wystawianie na żywo (P1) — tylko uzgodniony test issue + cancel. Domyślnie wyłączone (tylko validate).
            </label>
            <button
              type="button"
              disabled={uploadingCerts}
              onClick={async () => {
                try {
                  setUploadingCerts(true);
                  const res = await ehealthAdminHelper.configureEwus({
                    ...ewusForm,
                    mfa: ewusMfaConfigured,
                  });
                  if (!res?.success) throw new Error(res?.error?.message || "Błąd");
                  setEwusForm({ ...ewusForm, password: "" });
                  toast.success("eWUŚ skonfigurowane w API");
                } catch (err) {
                  toast.error(err.message || "Nie udało się zapisać eWUŚ");
                } finally {
                  setUploadingCerts(false);
                }
              }}
              className="text-sm text-teal-700 hover:underline"
            >
              Zapisz operatora eWUŚ w API
            </button>
          </div>

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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
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
                  <div className="text-sm text-gray-600">
                    Użyte: <strong>{snap?.uniqueDoctors ?? 0}</strong>
                    {snap?.cap > 0 && (
                      <>
                        {" "}/ {snap.cap}
                        {snap.overCap && (
                          <span className="ml-2 text-red-600 font-medium">ponad limit</span>
                        )}
                      </>
                    )}
                    {(!snap?.cap || snap.cap === 0) && (
                      <span className="text-gray-400"> (bez limitu)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSaveLicenses}
            className="px-4 py-2 bg-teal-700 text-white rounded-lg flex items-center gap-2 hover:bg-teal-800"
          >
            <Save size={16} />
            Zapisz limity
          </button>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Dostęp lekarzy</h3>
            <p className="text-xs text-gray-500 mb-3">
              Włączenie usługi nie zużywa licencji. Licznik miesiąca rośnie dopiero przy pierwszym użyciu.
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
                    <th className="py-2 pl-2 font-medium">Użycie w miesiącu</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseDoctors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-gray-500">
                        Brak aktywnych lekarzy.
                      </td>
                    </tr>
                  )}
                  {licenseDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 text-gray-800 whitespace-nowrap">{doctor.name}</td>
                      {Object.keys(SERVICE_LABELS).map((service) => {
                        const key = `${doctor.id}:${service}`;
                        return (
                          <td key={service} className="py-2 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={doctor.access?.[service] !== false}
                              disabled={savingAccessKey === key}
                              aria-label={`${doctor.name} ${SERVICE_LABELS[service]}`}
                              onChange={(e) => handleDoctorAccess(doctor.id, service, e.target.checked)}
                            />
                          </td>
                        );
                      })}
                      <td className="py-2 pl-2 text-gray-600">
                        {doctor.usedServices?.length
                          ? doctor.usedServices
                              .map((service) => `${USAGE_SHORT[service] || service}: użyto`)
                              .join("; ")
                          : "Nie użyto"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EhealthIntegrationsPage;
