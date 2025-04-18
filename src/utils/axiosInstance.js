import axios from "axios";

// Set up base URL and other configurations
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_REACT_APP_API_BASE_URL || "https://api.example.com", // Use environment variable for base URL
  timeout: 10000, // Timeout for requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authorization token to the headers if available
    const token = localStorage.getItem("authToken"); // or sessionStorage or redux state
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

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
        // Optionally, navigate to login page
        window.location.href = "/login";
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
const apiCaller = async (method, url, data = {}, headers = {}) => {
  try {
    // Data validation (you can extend it for specific APIs)
    if (method === "POST" || method === "PUT") {
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Data must be provided for POST/PUT requests");
      }
    }

    // Make the API call
    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
    });

    // Validate response data structure
    return validateAPIResponse(response);
  } catch (error) {
    // Log errors or handle them here
    console.error("API call failed:", error);
    throw error; // Propagate error for further handling
  }
};

// Export the apiCaller for use in components
export { apiCaller, axiosInstance };
