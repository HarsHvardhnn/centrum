/** Client-side checks for cookie / session persistence health. */

const TEST_COOKIE = "cm7_cookie_probe";

/**
 * Whether document.cookie can store readable cookies (not httpOnly).
 */
export function canUseDocumentCookies() {
  if (typeof navigator !== "undefined" && navigator.cookieEnabled === false) {
    return false;
  }
  if (typeof document === "undefined") return true;
  try {
    document.cookie = `${TEST_COOKIE}=1; path=/; max-age=60; SameSite=Lax`;
    const ok = document.cookie.includes(`${TEST_COOKIE}=`);
    document.cookie = `${TEST_COOKIE}=; path=/; max-age=0`;
    return ok;
  } catch {
    return false;
  }
}

export function isSecureContext() {
  if (typeof window === "undefined") return true;
  return window.isSecureContext === true || window.location.protocol === "https:";
}

export function getRefreshErrorCode(error) {
  return error?.refreshErrorCode || error?.response?.data?.code || null;
}

export function isRefreshTokenMissingError(error) {
  return getRefreshErrorCode(error) === "REFRESH_TOKEN_MISSING";
}

export function isRefreshTokenInvalidError(error) {
  return getRefreshErrorCode(error) === "REFRESH_TOKEN_INVALID";
}
