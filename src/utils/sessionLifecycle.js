import axios from "axios";
import { clearAllListState } from "../hooks/usePersistedListState";
import {
  isSessionEnding,
  setSessionEnding,
  runAuthClearer,
} from "./sessionEvents";

const API_BASE =
  import.meta.env.VITE_REACT_APP_API_BASE_URL ||
  "https://backend.centrummedyczne7.pl";

const AUTH_CHANNEL = "cm7-auth-refresh";

function removeCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;samesite=strict`;
}

/** Clear client-side auth artifacts (does not touch unrelated app data except list state). */
export function clearClientSession() {
  removeCookie("authToken");
  removeCookie("user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("cm7_refresh_lock");
  sessionStorage.removeItem("cm7_session_start");
  clearAllListState();
}

function broadcastLogout() {
  try {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage({ type: "logout" });
    channel.close();
  } catch {
    /* ignore */
  }
}

/**
 * Single logout path for popups, axios, and UI.
 * Calls POST /auth/logout (best-effort) so the httpOnly refresh cookie is cleared.
 * @param {string} _reason
 * @param {{ callApi?: boolean, broadcast?: boolean, redirect?: boolean }} options
 */
export async function endSession(_reason = "unknown", options = {}) {
  const { callApi = true, broadcast = true, redirect = true } = options;
  if (isSessionEnding()) return;
  setSessionEnding(true);

  if (callApi) {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true, timeout: 8000 }
      );
    } catch {
      /* best-effort — still clear local state */
    }
  }

  runAuthClearer();
  clearClientSession();
  if (broadcast) broadcastLogout();

  if (redirect && window.location.pathname !== "/logowanie") {
    window.location.href = "/logowanie";
  }
}

export { AUTH_CHANNEL };