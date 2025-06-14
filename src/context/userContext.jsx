import React, { createContext, useState, useEffect, useContext } from "react";
import { apiCaller, setCookie, getCookie, removeCookie } from "../utils/axiosInstance";

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
      // First try to get token from cookie
      const token = getCookie('authToken');
      let storedUser = null;

      if (token) {
        // If token exists in cookie, try to get user from cookie
        const userCookie = getCookie('user');
        if (userCookie) {
          try {
            storedUser = JSON.parse(userCookie);
          } catch (error) {
            console.error("Error parsing user cookie:", error);
            removeCookie('user');
          }
        }
      } else {
        // Fallback to localStorage if cookie doesn't exist
        const localToken = localStorage.getItem("authToken");
        const localUser = localStorage.getItem("user");

        if (localToken && localUser) {
          try {
            storedUser = JSON.parse(localUser);
            // Migrate to cookies
            setCookie('authToken', localToken, 7);
            setCookie('user', localUser, 7);
            // Clear localStorage
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            localStorage.removeItem("user");
          }
        }
      }

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUserProfile = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getCookie('authToken') || localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiCaller("GET", "/auth/profile/user");
      const { name, role, profilePicture, _id, email } = response.data.data;
      const updatedUser = {
        id: _id,
        name: `${name.first} ${name.last}`,
        role,
        profilePicture,
        email
      };

      setUser(updatedUser);

      // Update both cookie and localStorage
      const userStr = JSON.stringify(updatedUser);
      setCookie('user', userStr, 7);
      localStorage.setItem("user", userStr);
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
    const userStr = JSON.stringify(updatedUser);
    
    // Update both cookie and localStorage
    setCookie('user', userStr, 7);
    localStorage.setItem("user", userStr);
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
    setUser(userData);
    setIsAuthenticated(true);
    
    const userStr = JSON.stringify(userData);
    
    // Set both cookie and localStorage
    setCookie('authToken', token, 7);
    setCookie('user', userStr, 7);
    localStorage.setItem("user", userStr);
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear both cookie and localStorage
    removeCookie('authToken');
    removeCookie('user');
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
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
