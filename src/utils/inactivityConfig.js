/** Parse INACTIVITY_TIMEOUT config value (minutes) from API bodies or raw values. */
export function parseInactivityTimeoutMinutes(raw, fallback = 30) {
  if (raw === null || raw === undefined || raw === "") return fallback;
  if (typeof raw === "number" && raw > 0) return raw;
  if (typeof raw === "string") {
    const match = raw.match(/^(\d+)(m|h|d|w)$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === "m") return value;
      if (unit === "h") return value * 60;
      if (unit === "d") return value * 60 * 24;
      if (unit === "w") return value * 60 * 24 * 7;
    }
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

/** Convert minutes to milliseconds for idle timers. */
export function inactivityMinutesToMs(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n * 60 * 1000;
}

/** Extract `value` from appointment-config GET/PUT API payloads. */
export function extractAppointmentConfigValue(apiBody) {
  if (!apiBody) return undefined;
  if (
    apiBody.data &&
    typeof apiBody.data === "object" &&
    "value" in apiBody.data
  ) {
    return apiBody.data.value;
  }
  if ("value" in apiBody && (apiBody.key || apiBody._id)) {
    return apiBody.value;
  }
  return undefined;
}
