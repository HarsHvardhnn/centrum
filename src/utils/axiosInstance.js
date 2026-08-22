import axios from "axios";
import { isSessionEnding, notifyAccessTokenRefreshed } from "./sessionEvents";
import { endSession, AUTH_CHANNEL } from "./sessionLifecycle";

// Cookie utility functions
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;samesite=strict`;
};

// Set up base URL and other configurations
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://backend.centrummedyczne7.pl", // Use environment variable for base URL
  timeout: 100000, // Timeout for requests
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookie first, fallback to localStorage
    const token = getCookie('authToken') || localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Ensure security headers are present in every request
    config.headers = {
      ...config.headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    };

    return config;
  },
  (error) => {
    // Handle request error (like no internet, etc.)
    return Promise.reject(error);
  }
);

// Single-flight + cross-tab lock so concurrent refreshes never double-rotate
// the httpOnly refresh cookie (that was logging people out mid-click / multi-tab).
let refreshPromise = null;
const REFRESH_LOCK_KEY = "cm7_refresh_lock";
const REFRESH_LOCK_TTL_MS = 12_000;

function storeAccessToken(newToken, user) {
  localStorage.setItem("authToken", newToken);
  setCookie("authToken", newToken, 7);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  notifyAccessTokenRefreshed(newToken);
}

function getAuthChannel() {
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    return new BroadcastChannel(AUTH_CHANNEL);
  } catch {
    return null;
  }
}

function waitForCrossTabToken(channel, timeoutMs) {
  return new Promise((resolve) => {
    if (!channel) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      channel.removeEventListener("message", onMessage);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "token" && data.token) {
        storeAccessToken(data.token, data.user);
        finish(data.token);
      } else if (data.type === "refresh-failed") {
        finish(null);
      } else if (data.type === "logout") {
        finish(null);
      }
    };
    channel.addEventListener("message", onMessage);
  });
}

async function performHttpRefresh() {
  const refreshAxios = axios.create({
    baseURL: axiosInstance.defaults.baseURL,
    withCredentials: true,
  });
  const refreshResponse = await refreshAxios.post("/auth/refresh-token");
  if (!refreshResponse.data?.token) {
    throw new Error("No token in refresh response");
  }
  const newToken = refreshResponse.data.token;
  storeAccessToken(newToken, refreshResponse.data.user);
  return newToken;
}

async function coordinatedRefresh() {
  if (isSessionEnding()) {
    throw new Error("Session is ending");
  }

  const channel = getAuthChannel();
  const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const existingLock = localStorage.getItem(REFRESH_LOCK_KEY);

  if (existingLock) {
    try {
      const parsed = JSON.parse(existingLock);
      if (parsed?.at && Date.now() - parsed.at < REFRESH_LOCK_TTL_MS) {
        const tokenFromOther = await waitForCrossTabToken(channel, 8_000);
        channel?.close();
        if (tokenFromOther) return tokenFromOther;
        const latest = getCookie("authToken") || localStorage.getItem("authToken");
        if (latest) return latest;
      }
    } catch {
      /* stale lock */
    }
  }

  localStorage.setItem(
    REFRESH_LOCK_KEY,
    JSON.stringify({ id: lockId, at: Date.now() })
  );
  await new Promise((r) => setTimeout(r, 40));
  try {
    const confirm = JSON.parse(localStorage.getItem(REFRESH_LOCK_KEY) || "{}");
    if (confirm.id && confirm.id !== lockId) {
      const tokenFromOther = await waitForCrossTabToken(channel, 8_000);
      channel?.close();
      if (tokenFromOther) return tokenFromOther;
      const latest = getCookie("authToken") || localStorage.getItem("authToken");
      if (latest) return latest;
    }
  } catch {
    /* proceed as leader */
  }

  try {
    channel?.postMessage({ type: "refresh-start" });
    const newToken = await performHttpRefresh();
    channel?.postMessage({ type: "token", token: newToken });
    return newToken;
  } catch (err) {
    channel?.postMessage({ type: "refresh-failed" });
    throw err;
  } finally {
    try {
      const cur = JSON.parse(localStorage.getItem(REFRESH_LOCK_KEY) || "{}");
      if (cur.id === lockId) localStorage.removeItem(REFRESH_LOCK_KEY);
    } catch {
      localStorage.removeItem(REFRESH_LOCK_KEY);
    }
    channel?.close();
  }
}

export function refreshAccessToken() {
  if (isSessionEnding()) {
    return Promise.reject(new Error("Session is ending"));
  }
  if (!refreshPromise) {
    refreshPromise = coordinatedRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Cross-tab logout / token sync listener (one channel for the app lifetime)
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    const lifetimeChannel = new BroadcastChannel(AUTH_CHANNEL);
    lifetimeChannel.onmessage = (event) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "logout") {
        if (!isSessionEnding()) {
          // Other tab already cleared the refresh cookie — don't re-broadcast
          endSession("cross-tab-logout", { callApi: false, broadcast: false });
        }
      } else if (data.type === "token" && data.token) {
        storeAccessToken(data.token, data.user);
      }
    };
  } catch {
    /* BroadcastChannel unavailable */
  }
}

/** Pathname only — works whether config.url is relative or absolute. */
const getRequestUrlPath = (config) => {
  const u = config?.url;
  if (!u || typeof u !== "string") return "";
  if (u.startsWith("http")) {
    try {
      return new URL(u).pathname;
    } catch {
      return u.split("?")[0].split("#")[0] || "";
    }
  }
  return u.split("?")[0].split("#")[0] || "";
};

/**
 * 401 on these routes means invalid credentials / OTP / etc., not "access token expired".
 * Do not call refresh-token — that causes extra requests and can trigger rate limits on failed login.
 */
const isPublicAuthFailurePath = (urlPath) => {
  if (!urlPath) return false;
  const exact = [
    "/auth/login",
    "/auth/signup",
    "/auth/google",
    "/auth/verify-otp",
    "/auth/2fa/verify",
    "/auth/2fa/resend",
    "/auth/2fa/email-fallback",
    "/auth/request-password-reset",
    "/auth/resend-otp",
    "/auth/reset-password",
  ];
  return exact.some((p) => urlPath === p || urlPath.endsWith(p));
};

const redirectToLoginAndClearSession = () => {
  if (isSessionEnding()) return;
  endSession("axios-401");
};

// Response interceptor for handling responses
axiosInstance.interceptors.response.use(
  (response) => {
    // You can check the response status or manipulate the data here
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle various errors like unauthorized access or server issues
    if (error.response) {
      // Server responded with a status other than 2xx
      if (error.response.status === 401) {
        if (isSessionEnding()) {
          return Promise.reject(error);
        }

        const urlPath = getRequestUrlPath(originalRequest);

        // If this is a refresh token request that failed, redirect to login
        if (urlPath.includes("/auth/refresh-token")) {
          console.error("Refresh token failed. Redirecting to login.");
          redirectToLoginAndClearSession();
          return Promise.reject(error);
        }

        // Wrong password / invalid OTP / etc. — not an expired access token
        if (isPublicAuthFailurePath(urlPath)) {
          return Promise.reject(error);
        }

        if (originalRequest._retry) {
          redirectToLoginAndClearSession();
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          redirectToLoginAndClearSession();
          return Promise.reject(refreshError);
        }
      } else {
        // Other status codes handling (e.g., 500 server error)
        console.error("API Error:", error.response);
      }
    } else if (error.request) {
      // No response received from the server
      console.error("No response from server");
    } else {
      // Some other error (configuration error)
      console.error("Axios error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Function for API validation - add custom validation logic for inputs here
const validateAPIResponse = (response) => {
  // Example validation: check if response data has required fields
  if (!response || !response.data) {
    throw new Error("Invalid API response structure");
  }

  return response;
};

// API call function
const apiCaller = async (method, url, data = {}, isFormData = false) => {
  try {
    // Handle POST/PUT data validation
    // Allow empty data for endpoints that don't require a body (like refresh-token)
    const isRefreshTokenEndpoint = url === '/auth/refresh-token' || url?.includes('/auth/refresh-token');
    
    if ((method === "POST" || method === "PUT") && !isRefreshTokenEndpoint) {
      const dataIsFormData = data instanceof FormData;

      const isEmpty =
        data === null ||
        data === undefined ||
        (dataIsFormData
          ? [...data.entries()].length === 0
          : (typeof data === 'object' && Object.keys(data).length === 0));

      if (isEmpty) {
        throw new Error("Data must be provided for POST/PUT requests");
      }
    }

    // Set the proper headers for FormData requests
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    };

    if (isFormData || data instanceof FormData) {
      // For FormData, don't set Content-Type as the browser will set it with the boundary
      // The browser will automatically set the correct multipart/form-data content type with boundary
    } else if (data !== null && data !== undefined) {
      // For regular JSON requests, only set Content-Type if there's data
      headers["Content-Type"] = "application/json";
    }
    // If data is null/undefined, don't set Content-Type header

    // Build request config - only include data if it's not null/undefined
    const requestConfig = {
      method,
      url,
      headers,
    };

    // Only add data if it's provided (not null or undefined)
    if (data !== null && data !== undefined) {
      requestConfig.data = data;
    }

    const response = await axiosInstance(requestConfig);

    return validateAPIResponse(response);
  } catch (error) {
    console.error("API call error:", error.message);
    throw error;
  }
};

// Export the apiCaller for use in components
export { apiCaller, axiosInstance };

// Export cookie utilities
export { setCookie, getCookie, removeCookie };
