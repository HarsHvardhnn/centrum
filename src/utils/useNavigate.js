// navigationConfig.js
import { useNavigate } from "react-router-dom";

// Custom hook that extends the base useNavigate functionality
export const useNavigation = () => {
  const navigate = useNavigate();

  return {
    // Original navigate function
    navigate,

    // Common navigation shortcuts
    goBack: () => navigate(-1),
    goHome: () => navigate("/admin"),
    goToDashboard: () => navigate("/dashboard"),
    goToProfile: () => navigate("/profile"),
    goToSettings: () => navigate("/settings"),

    // Function to navigate with state
    navigateWithState: (path, state) => navigate(path, { state }),

    // Function to navigate with replace (won't add to history)
    navigateReplace: (path) => navigate(path, { replace: true }),

    // Navigate to a page with query parameters
    navigateWithParams: (path, params) => {
      const queryString = new URLSearchParams(params).toString();
      navigate(`${path}?${queryString}`);
    },

    // Navigate to a nested route with an ID
    navigateToResource: (basePath, id) => navigate(`${basePath}/${id}`),
  };
};

// You can also define common route paths here to avoid hardcoding
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  MEDICAL_RECORDS: "/medical-records",
  HELP_CENTER: "/help",
  NOT_FOUND: "/404",
};

// Optional: Create a router context provider if you want to access these functions without hooks
// This is useful for non-functional components or utility functions
export const createNavigationUtils = (navigate) => ({
  goBack: () => navigate(-1),
  goHome: () => navigate("/admin"),
  goToDashboard: () => navigate("/dashboard"),
  // ... add other navigation functions similar to above
});
