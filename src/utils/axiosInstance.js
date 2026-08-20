import axios from "axios";

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

// Single-flight refresh so a click, a 401 retry, and the idle timer never
// rotate the refresh cookie twice (that was logging people out mid-click).
let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshAxios = axios.create({
        baseURL: axiosInstance.defaults.baseURL,
        withCredentials: true,
      });
      const refreshResponse = await refreshAxios.post("/auth/refresh-token");
      if (!refreshResponse.data?.token) {
        throw new Error("No token in refresh response");
      }
      const newToken = refreshResponse.data.token;
      localStorage.setItem("authToken", newToken);
      setCookie("authToken", newToken, 7);
      if (refreshResponse.data.user) {
        localStorage.setItem("user", JSON.stringify(refreshResponse.data.user));
      }
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
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
  removeCookie("authToken");
  removeCookie("user");
  localStorage.clear();
  if (window.location.pathname !== "/logowanie") {
    window.location.href = "/logowanie";
  }
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
