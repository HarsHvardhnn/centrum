import React, { createContext, useState, useEffect, useContext } from "react";
import { apiCaller } from "../utils/axiosInstance";

// Create the context
const UserContext = createContext(null);

// Custom hook
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // Clear invalid data
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUserProfile = async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      // Using apiCaller instead of direct axios call
      const response = await apiCaller("GET", "/api/user/profile");
      const updatedUser = response.data;
      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
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

      // Using apiCaller instead of direct axios call
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
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));

    if (token) {
      localStorage.setItem("authToken", token);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  // Check if user has required roles
  const hasRole = (allowedRoles) => {
    if (!user || !isAuthenticated) return false;

    // If no specific roles required, just check authentication
    if (!allowedRoles || allowedRoles.length === 0) return isAuthenticated;

    // Check if user's role is included in allowed roles
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
    setUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
