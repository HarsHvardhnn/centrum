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
  referral: "e-Skierowanie",
  ezla: "e-ZLA",
  eligibility: "eWUŚ",
};

const STATUS_OPTIONS = [
  { value: "missing", label: "Brak" },
  { value: "present", label: "Obecny" },
  { value: "expired", label: "Wygasły" },
];

const emptyEnv = () => ({
  integratorUuid: "",
  organizationUuid: "",
  secret: "",
  hasSecret: false,
  secretMasked: "",
});

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
  const [lastConnectionTest, setLastConnectionTest] = useState(null);
  const [runtimeProvider, setRuntimeProvider] = useState("mock");
  const [licenseCaps, setLicenseCaps] = useState({
    prescription: 0,
    referral: 0,
    ezla: 0,
    eligibility: 0,
  });
  const [licenseSnapshot, setLicenseSnapshot] = useState(null);
  const [testing, setTesting] = useState(false);

  const envForm = activeEnvironment === "production" ? production : test;
  const setEnvForm = activeEnvironment === "production" ? setProduction : setTest;

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();
      const [settingsRes, licensesRes] = await Promise.all([
        ehealthAdminHelper.getSettings(),
        ehealthAdminHelper.getLicenses(),
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
      setFacilityTlsStatus(d.facilityTlsStatus || "missing");
      setFacilityWssStatus(d.facilityWssStatus || "missing");
      setEwusMfaConfigured(Boolean(d.ewusMfaConfigured));
      setLastConnectionTest(d.lastConnectionTest || null);
      setRuntimeProvider(d.runtimeProvider || "mock");
      setLicenseCaps({
        prescription: d.licenseCaps?.prescription || 0,
        referral: d.licenseCaps?.referral || 0,
        ezla: d.licenseCaps?.ezla || 0,
        eligibility: d.licenseCaps?.eligibility || 0,
      });
      if (licensesRes?.success) {
        setLicenseSnapshot(licensesRes.data);
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
        test: {
          integratorUuid: test.integratorUuid,
          organizationUuid: test.organizationUuid,
          ...(test.secret.trim() ? { secret: test.secret.trim() } : {}),
        },
        production: {
          integratorUuid: production.integratorUuid,
          organizationUuid: production.organizationUuid,
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
            Secret po zapisaniu nie jest ponownie wyświetlany. Lekarze nie mają dostępu do tej strony.
            Provider runtime: <strong>{runtimeProvider}</strong>
            {runtimeProvider === "mock" && " (mock — bez wywołania Medfile)"}.
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TLS placówki</label>
              <select
                value={facilityTlsStatus}
                onChange={(e) => setFacilityTlsStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WSS placówki</label>
              <select
                value={facilityWssStatus}
                onChange={(e) => setFacilityWssStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700 pb-3">
                <input
                  type="checkbox"
                  checked={ewusMfaConfigured}
                  onChange={(e) => setEwusMfaConfigured(e.target.checked)}
                />
                eWUŚ MFA skonfigurowane
              </label>
            </div>
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
        </div>
      )}
    </div>
  );
};

export default EhealthIntegrationsPage;
