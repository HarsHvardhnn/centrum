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
    import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://api.example.com", // Use environment variable for base URL
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

// Response interceptor for handling responses
axiosInstance.interceptors.response.use(
  (response) => {
    // You can check the response status or manipulate the data here
    return response;
  },
  (error) => {
    // Handle various errors like unauthorized access or server issues
    if (error.response) {
      // Server responded with a status other than 2xx
      if (error.response.status === 401) {
        // Handle unauthorized errors (for example, redirect to login)
        console.error("Unauthorized access. Please login.");
        // Clear both cookie and localStorage
        removeCookie('authToken');
        removeCookie('user');
        localStorage.clear();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
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
    if (method === "POST" || method === "PUT") {
      const dataIsFormData = data instanceof FormData;

      const isEmpty =
        !data ||
        (dataIsFormData
          ? [...data.entries()].length === 0
          : Object.keys(data).length === 0);

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
    } else {
      // For regular JSON requests
      headers["Content-Type"] = "application/json";
    }

    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
    });

    return validateAPIResponse(response);
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Export the apiCaller for use in components
export { apiCaller, axiosInstance };

// Export cookie utilities
export { setCookie, getCookie, removeCookie };
