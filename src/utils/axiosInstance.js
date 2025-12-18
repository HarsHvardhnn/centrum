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

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
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
        // If this is a refresh token request that failed, redirect to login
        if (originalRequest.url === '/auth/refresh-token' || originalRequest.url?.includes('/auth/refresh-token')) {
          console.error("Refresh token failed. Redirecting to login.");
          removeCookie('authToken');
          removeCookie('user');
          localStorage.clear();
          if (window.location.pathname !== "/logowanie") {
            window.location.href = "/logowanie";
          }
          return Promise.reject(error);
        }

        // If we're already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        // Try to refresh the token
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Create a new axios instance for refresh to avoid interceptors
          // Refresh token endpoint uses HTTP-only cookies, no Authorization header, no body
          const refreshAxios = axios.create({
            baseURL: axiosInstance.defaults.baseURL,
            withCredentials: true
            // No headers - refresh token uses cookies only, no body needed
          });
          
          // Don't send any body - refresh token uses HTTP-only cookies only
          const refreshResponse = await refreshAxios.post('/auth/refresh-token');

          if (refreshResponse.data && refreshResponse.data.token) {
            const newToken = refreshResponse.data.token;
            
            // Update token in storage
            localStorage.setItem("authToken", newToken);
            setCookie('authToken', newToken, 7);
            
            // Update user data if provided
            if (refreshResponse.data.user) {
              localStorage.setItem("user", JSON.stringify(refreshResponse.data.user));
            }

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Process queued requests
            processQueue(null, newToken);
            
            // Retry the original request
            return axiosInstance(originalRequest);
          } else {
            throw new Error("No token in refresh response");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          processQueue(refreshError, null);
          
          // Clear tokens and redirect to login
          removeCookie('authToken');
          removeCookie('user');
          localStorage.clear();
          
          if (window.location.pathname !== "/logowanie") {
            window.location.href = "/logowanie";
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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
