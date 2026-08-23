import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { apiCaller, setCookie, getCookie, removeCookie } from "../utils/axiosInstance";
import { clearAllListState } from "../hooks/usePersistedListState";
import {
  registerAuthClearer,
  resetSessionEnding,
} from "../utils/sessionEvents";
import { endSession } from "../utils/sessionLifecycle";

// Create the context
const UserContext = createContext(null);
const SESSION_STORAGE_KEY = "cm7_session_start";

// Custom hook
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    removeCookie("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    clearAllListState();
  }, []);

  useEffect(() => {
    registerAuthClearer(clearAuthState);
    return () => registerAuthClearer(() => {});
  }, [clearAuthState]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from cookie for API calls
        let token = getCookie("authToken");
        if (!token) {
          token = localStorage.getItem("authToken");
        }
        // Get user data from localStorage
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          try {
            // Verify token validity with backend
            const response = await apiCaller("GET", "/auth/profile/user");
            const { name, role, profilePicture, _id, email, d_id } = response.data.data;
            const freshUserData = {
              id: _id,
              name: `${name.first} ${name.last}`,
              role,
              profilePicture,
              email,
              d_id: d_id || "",
            };

            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(freshUserData));
            setUser(freshUserData);
            setIsAuthenticated(true);
            resetSessionEnding();
          } catch (error) {
            console.error("Error verifying token:", error);
            clearAuthState();
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error in checkAuth:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearAuthState]);

  const refreshUserProfile = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getCookie("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiCaller("GET", "/auth/profile/user");
      const { name, role, profilePicture, _id, email, d_id } = response.data.data;
      const updatedUser = {
        id: _id,
        name: `${name.first} ${name.last}`,
        role,
        profilePicture,
        email,
        d_id: d_id || "",
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      if (error.response?.status === 401) {
        logout();
      }
      setLoading(false);
    }
  };

  const updateUserField = (field, value) => {
    if (!user || !isAuthenticated) return;

    const updatedUser = {
      ...user,
      [field]: value,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const updateProfilePicture = async (imageFile) => {
    if (!isAuthenticated) return null;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("profilePicture", imageFile);

      const response = await apiCaller(
        "POST",
        "/api/user/update-profile-picture",
        formData,
        {
          "Content-Type": "multipart/form-data",
        }
      );

      const { profilePictureUrl } = response.data;
      updateUserField("profilePicture", profilePictureUrl);

      return profilePictureUrl;
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    resetSessionEnding();
    setUser(userData);
    setIsAuthenticated(true);
    // Store token in cookie for API calls
    setCookie("authToken", token, 7);
    localStorage.setItem("authToken", token);
    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    // Reset session countdown start on every fresh login
    sessionStorage.setItem(SESSION_STORAGE_KEY, String(Date.now()));
  };

  /** Prefer endSession so refresh cookie is cleared via POST /auth/logout. */
  const logout = () => {
    endSession("manual");
  };

  const hasRole = (allowedRoles) => {
    if (!user || !isAuthenticated) return false;
    if (!allowedRoles || allowedRoles.length === 0) return isAuthenticated;
    return user.role && allowedRoles.includes(user.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUserProfile,
    updateUserField,
    updateProfilePicture,
    hasRole,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
