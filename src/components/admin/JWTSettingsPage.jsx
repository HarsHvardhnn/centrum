import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, AlertCircle, Info, Clock, Shield } from "lucide-react";
import { useLoader } from "../../context/LoaderContext";
import appointmentConfigService from "../../helpers/appointmentConfigHelper";

const JWTSettingsPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jwtExpiry, setJwtExpiry] = useState("");
  const [refreshTokenExpiry, setRefreshTokenExpiry] = useState("");
  const [inactivityTimeout, setInactivityTimeout] = useState("");
  const [originalJwtExpiry, setOriginalJwtExpiry] = useState("");
  const [originalRefreshTokenExpiry, setOriginalRefreshTokenExpiry] = useState("");
  const [originalInactivityTimeout, setOriginalInactivityTimeout] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const hasJwtChange = jwtExpiry !== originalJwtExpiry;
    const hasRefreshChange = refreshTokenExpiry !== originalRefreshTokenExpiry;
    const hasTimeoutChange = inactivityTimeout !== originalInactivityTimeout;
    setHasChanges(hasJwtChange || hasRefreshChange || hasTimeoutChange);
  }, [jwtExpiry, refreshTokenExpiry, inactivityTimeout, originalJwtExpiry, originalRefreshTokenExpiry, originalInactivityTimeout]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();

      // Fetch JWT_EXPIRY_TIME
      const jwtResponse = await appointmentConfigService.getConfig("JWT_EXPIRY_TIME");
      const jwtValue = jwtResponse.data?.value || "1h";
      setJwtExpiry(jwtValue);
      setOriginalJwtExpiry(jwtValue);

      // Fetch REFRESH_TOKEN_EXPIRY_DAYS
      const refreshResponse = await appointmentConfigService.getConfig("REFRESH_TOKEN_EXPIRY_DAYS");
      const refreshValue = refreshResponse.data?.value?.toString() || "30";
      setRefreshTokenExpiry(refreshValue);
      setOriginalRefreshTokenExpiry(refreshValue);

      // Fetch INACTIVITY_TIMEOUT
      const timeoutResponse = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
      const timeoutValue = timeoutResponse.data?.value || "30m";
      // Convert number (minutes) to string format if needed
      const timeoutString = typeof timeoutValue === 'number' 
        ? `${timeoutValue}m` 
        : timeoutValue.toString();
      setInactivityTimeout(timeoutString);
      setOriginalInactivityTimeout(timeoutString);
    } catch (err) {
      console.error("Error fetching JWT settings:", err);
      setError("Wystąpił błąd podczas pobierania ustawień JWT.");
      toast.error("Nie udało się pobrać ustawień JWT");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleSave = async () => {
    try {
      showLoader();
      setError(null);

      const promises = [];

      // Update JWT_EXPIRY_TIME if changed
      if (jwtExpiry !== originalJwtExpiry) {
        promises.push(
          appointmentConfigService.updateConfig("JWT_EXPIRY_TIME", { value: jwtExpiry })
        );
      }

      // Update REFRESH_TOKEN_EXPIRY_DAYS if changed
      if (refreshTokenExpiry !== originalRefreshTokenExpiry) {
        const refreshDays = parseInt(refreshTokenExpiry, 10);
        if (isNaN(refreshDays) || refreshDays < 1 || refreshDays > 365) {
          toast.error("Czas wygaśnięcia tokena odświeżającego musi być między 1 a 365 dni");
          return;
        }
        promises.push(
          appointmentConfigService.updateConfig("REFRESH_TOKEN_EXPIRY_DAYS", { value: refreshDays })
        );
      }

      // Update INACTIVITY_TIMEOUT if changed
      if (inactivityTimeout !== originalInactivityTimeout) {
        if (inactivityTimeout && !validateJwtExpiry(inactivityTimeout)) {
          toast.error("Nieprawidłowy format czasu nieaktywności. Użyj formatu: liczba + jednostka (m=minuty, h=godziny, d=dni, w=tygodnie)");
          return;
        }
        promises.push(
          appointmentConfigService.updateConfig("INACTIVITY_TIMEOUT", { value: inactivityTimeout })
        );
      }

      if (promises.length === 0) {
        toast.info("Brak zmian do zapisania");
        return;
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        toast.success("Ustawienia JWT zostały zapisane pomyślnie");
        fetchSettings(); // Refresh to get updated values
      } else {
        toast.error("Nie udało się zapisać niektórych ustawień");
        fetchSettings();
      }
    } catch (err) {
      console.error("Error saving JWT settings:", err);
      toast.error("Wystąpił błąd podczas zapisywania ustawień JWT");
    } finally {
      hideLoader();
    }
  };

  const handleReset = async (configKey) => {
    try {
      showLoader();

      const response = await appointmentConfigService.resetConfig(configKey);

      if (response.success) {
        toast.success(`Ustawienie ${configKey} zostało zresetowane do wartości domyślnej`);
        fetchSettings();
      } else {
        toast.error(`Nie udało się zresetować ustawienia ${configKey}`);
      }
    } catch (err) {
      console.error(`Error resetting ${configKey}:`, err);
      toast.error(`Wystąpił błąd podczas resetowania ustawienia ${configKey}`);
    } finally {
      hideLoader();
    }
  };

  const validateJwtExpiry = (value) => {
    // Valid formats: "30m", "1h", "2h", "1d", "7d", "1w"
    const pattern = /^(\d+)(m|h|d|w)$/;
    return pattern.test(value);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Shield className="text-teal-700 mr-3" size={28} />
        <h1 className="text-2xl font-bold text-teal-700">Ustawienia JWT</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">Informacja</h3>
            <p className="text-sm text-blue-700">
              Ta strona pozwala na zarządzanie ustawieniami bezpieczeństwa JWT, w tym czasem wygaśnięcia tokenów oraz czasem nieaktywności użytkownika. 
              Zmiany w tych ustawieniach wpłyną na bezpieczeństwo i wygodę użytkowników.
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
              <li><strong>Token dostępu (JWT):</strong> Krótkotrwały token używany do żądań API</li>
              <li><strong>Token odświeżający:</strong> Długotrwały token przechowywany w bezpiecznym ciasteczku HTTP-only</li>
              <li><strong>Czas nieaktywności:</strong> Czas po którym użytkownik zostanie automatycznie wylogowany z powodu braku aktywności</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            {/* JWT Expiry Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Clock className="mr-2 text-teal-600" size={18} />
                  Czas wygaśnięcia tokena dostępu (JWT)
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={jwtExpiry}
                  onChange={(e) => setJwtExpiry(e.target.value)}
                  placeholder="np. 1h, 30m, 2h, 1d, 7d"
                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    jwtExpiry && !validateJwtExpiry(jwtExpiry)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                <button
                  onClick={() => handleReset("JWT_EXPIRY_TIME")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Resetuj do wartości domyślnej"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Resetuj
                </button>
              </div>
              {jwtExpiry && !validateJwtExpiry(jwtExpiry) && (
                <p className="mt-1 text-sm text-red-600">
                  Nieprawidłowy format. Użyj formatu: liczba + jednostka (m=minuty, h=godziny, d=dni, w=tygodnie)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Przykłady: "30m" (30 minut), "1h" (1 godzina), "2h" (2 godziny), "1d" (1 dzień), "7d" (7 dni), "1w" (1 tydzień)
              </p>
            </div>

            {/* Refresh Token Expiry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Shield className="mr-2 text-teal-600" size={18} />
                  Czas wygaśnięcia tokena odświeżającego (w dniach)
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={refreshTokenExpiry}
                  onChange={(e) => setRefreshTokenExpiry(e.target.value)}
                  min="1"
                  max="365"
                  placeholder="np. 30"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => handleReset("REFRESH_TOKEN_EXPIRY_DAYS")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Resetuj do wartości domyślnej"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Resetuj
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Liczba dni (1-365). Token odświeżający jest przechowywany w bezpiecznym ciasteczku HTTP-only.
              </p>
            </div>

            {/* Inactivity Timeout */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Clock className="mr-2 text-teal-600" size={18} />
                  Czas nieaktywności (Timeout)
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inactivityTimeout}
                  onChange={(e) => setInactivityTimeout(e.target.value)}
                  placeholder="np. 30m, 1h, 2h, 1d"
                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    inactivityTimeout && !validateJwtExpiry(inactivityTimeout)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                <button
                  onClick={() => handleReset("INACTIVITY_TIMEOUT")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Resetuj do wartości domyślnej"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Resetuj
                </button>
              </div>
              {inactivityTimeout && !validateJwtExpiry(inactivityTimeout) && (
                <p className="mt-1 text-sm text-red-600">
                  Nieprawidłowy format. Użyj formatu: liczba + jednostka (m=minuty, h=godziny, d=dni, w=tygodnie)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Przykłady: "30m" (30 minut), "1h" (1 godzina), "2h" (2 godziny), "1d" (1 dzień). Po tym czasie użytkownik zostanie automatycznie wylogowany z powodu braku aktywności.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  hasChanges
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={18} className="mr-2" />
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JWTSettingsPage;
