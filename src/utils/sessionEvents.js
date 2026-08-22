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
