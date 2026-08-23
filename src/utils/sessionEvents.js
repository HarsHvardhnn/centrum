/**
 * Tiny session flags / callbacks with no axios imports (avoids circular deps).
 */

let sessionEnding = false;
let authClearer = () => {};
const tokenRefreshedListeners = new Set();

export function isSessionEnding() {
  return sessionEnding;
}

export function setSessionEnding(value) {
  sessionEnding = !!value;
}

/** Reset after a successful login so a new session can run. */
export function resetSessionEnding() {
  sessionEnding = false;
}

export function registerAuthClearer(fn) {
  authClearer = typeof fn === "function" ? fn : () => {};
}

export function runAuthClearer() {
  try {
    authClearer();
  } catch {
    /* ignore */
  }
}

export function onAccessTokenRefreshed(listener) {
  tokenRefreshedListeners.add(listener);
  return () => tokenRefreshedListeners.delete(listener);
}

export function notifyAccessTokenRefreshed(token) {
  tokenRefreshedListeners.forEach((fn) => {
    try {
      fn(token);
    } catch {
      /* ignore */
    }
  });
}

const inactivityTimeoutListeners = new Set();

/** Subscribe when admin updates INACTIVITY_TIMEOUT (ms). */
export function onInactivityTimeoutUpdated(listener) {
  inactivityTimeoutListeners.add(listener);
  return () => inactivityTimeoutListeners.delete(listener);
}

/** Notify all sessions that the idle timeout changed (milliseconds). */
export function notifyInactivityTimeoutUpdated(timeoutMs) {
  const ms = Number(timeoutMs);
  if (!Number.isFinite(ms) || ms <= 0) return;
  inactivityTimeoutListeners.forEach((fn) => {
    try {
      fn(ms);
    } catch {
      /* ignore */
    }
  });
}
