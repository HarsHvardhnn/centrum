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
  const [originalInactivityTimeout, setOriginalInactivityTimeout] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const hasJwtChange = jwtExpiry !== originalJwtExpiry;
    const hasRefreshChange = refreshTokenExpiry !== originalRefreshTokenExpiry;
    const timeoutNum = parseInt(inactivityTimeout, 10) || 0;
    const hasTimeoutChange = timeoutNum !== originalInactivityTimeout;
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
      const timeoutValue = timeoutResponse.data?.value || 30;
      // Convert to number (minutes) - handle both number and string formats
      let timeoutMinutes = 30; // default
      if (typeof timeoutValue === 'number') {
        timeoutMinutes = timeoutValue;
      } else if (typeof timeoutValue === 'string') {
        // Parse string format like "30m", "1h", etc. to minutes
        const match = timeoutValue.match(/^(\d+)(m|h|d|w)$/);
        if (match) {
          const value = parseInt(match[1], 10);
          const unit = match[2];
          if (unit === 'm') timeoutMinutes = value;
          else if (unit === 'h') timeoutMinutes = value * 60;
          else if (unit === 'd') timeoutMinutes = value * 60 * 24;
          else if (unit === 'w') timeoutMinutes = value * 60 * 24 * 7;
        } else {
          // Try to parse as plain number
          const parsed = parseInt(timeoutValue, 10);
          if (!isNaN(parsed)) timeoutMinutes = parsed;
        }
      }
      setInactivityTimeout(timeoutMinutes.toString());
      setOriginalInactivityTimeout(timeoutMinutes);
    } catch (err) {
      console.error("Error fetching JWT settings:", err);
      setError("An error occurred while loading JWT settings.");
      toast.error("Failed to load JWT settings");
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
          toast.error("Refresh token expiry must be between 1 and 365 days");
          return;
        }
        promises.push(
          appointmentConfigService.updateConfig("REFRESH_TOKEN_EXPIRY_DAYS", { value: refreshDays })
        );
      }

      // Update INACTIVITY_TIMEOUT if changed
      const timeoutMinutes = parseInt(inactivityTimeout, 10);
      if (timeoutMinutes !== originalInactivityTimeout) {
        if (isNaN(timeoutMinutes) || timeoutMinutes < 1) {
          toast.error("Inactivity timeout must be greater than 0 (minutes)");
          return;
        }
        promises.push(
          appointmentConfigService.updateConfig("INACTIVITY_TIMEOUT", { value: timeoutMinutes })
        );
      }

      if (promises.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        toast.success("JWT settings saved successfully");
        fetchSettings(); // Refresh to get updated values
      } else {
        toast.error("Failed to save some settings");
        fetchSettings();
      }
    } catch (err) {
      console.error("Error saving JWT settings:", err);
      toast.error("An error occurred while saving JWT settings");
    } finally {
      hideLoader();
    }
  };

  const handleReset = async (configKey) => {
    try {
      showLoader();

      const response = await appointmentConfigService.resetConfig(configKey);

      if (response.success) {
        toast.success(`Setting ${configKey} was reset to its default value`);
        fetchSettings();
      } else {
        toast.error(`Failed to reset setting ${configKey}`);
      }
    } catch (err) {
      console.error(`Error resetting ${configKey}:`, err);
      toast.error(`An error occurred while resetting setting ${configKey}`);
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
        <h1 className="text-2xl font-bold text-teal-700">JWT settings</h1>
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
            <h3 className="font-medium text-blue-800">Information</h3>
            <p className="text-sm text-blue-700">
              This page manages JWT security settings, including token expiry and user inactivity timeout.
              Changes affect both security and user experience.
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
              <li><strong>Access token (JWT):</strong> Short-lived token used for API requests</li>
              <li><strong>Refresh token:</strong> Long-lived token stored in a secure HTTP-only cookie</li>
              <li><strong>Inactivity timeout:</strong> Time after which the user is logged out automatically due to inactivity</li>
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
                  Access token (JWT) expiry
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={jwtExpiry}
                  onChange={(e) => setJwtExpiry(e.target.value)}
                  placeholder="e.g. 1h, 30m, 2h, 1d, 7d"
                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    jwtExpiry && !validateJwtExpiry(jwtExpiry)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                <button
                  onClick={() => handleReset("JWT_EXPIRY_TIME")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Reset to default"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
              </div>
              {jwtExpiry && !validateJwtExpiry(jwtExpiry) && (
                <p className="mt-1 text-sm text-red-600">
                  Invalid format. Use: number + unit (m=minutes, h=hours, d=days, w=weeks)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Examples: &quot;30m&quot; (30 minutes), &quot;1h&quot; (1 hour), &quot;2h&quot; (2 hours), &quot;1d&quot; (1 day), &quot;7d&quot; (7 days), &quot;1w&quot; (1 week)
              </p>
            </div>

            {/* Refresh Token Expiry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Shield className="mr-2 text-teal-600" size={18} />
                  Refresh token expiry (days)
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={refreshTokenExpiry}
                  onChange={(e) => setRefreshTokenExpiry(e.target.value)}
                  min="1"
                  max="365"
                  placeholder="e.g. 30"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => handleReset("REFRESH_TOKEN_EXPIRY_DAYS")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Reset to default"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Number of days (1–365). The refresh token is stored in a secure HTTP-only cookie.
              </p>
            </div>

            {/* Inactivity Timeout */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Clock className="mr-2 text-teal-600" size={18} />
                  Inactivity timeout
                </div>
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={inactivityTimeout}
                  onChange={(e) => setInactivityTimeout(e.target.value)}
                  min="1"
                  placeholder="e.g. 30"
                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    inactivityTimeout && (isNaN(parseInt(inactivityTimeout, 10)) || parseInt(inactivityTimeout, 10) < 1)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-teal-500'
                  }`}
                />
                <span className="flex items-center px-3 text-gray-600">minutes</span>
                <button
                  onClick={() => handleReset("INACTIVITY_TIMEOUT")}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center"
                  title="Reset to default"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
              </div>
              {inactivityTimeout && (isNaN(parseInt(inactivityTimeout, 10)) || parseInt(inactivityTimeout, 10) < 1) && (
                <p className="mt-1 text-sm text-red-600">
                  Inactivity timeout must be greater than 0 (minutes)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Time in minutes (e.g. 30 = 30 minutes, 60 = 1 hour, 120 = 2 hours). After this period the user is logged out due to inactivity.
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
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JWTSettingsPage;
