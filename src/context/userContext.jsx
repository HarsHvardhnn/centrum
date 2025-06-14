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
    const checkAuth = async () => {
      try {
        // Get token from cookie for API calls
        let token = getCookie('authToken');
        if(!token){
          token = localStorage.getItem('authToken');
        }
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            // Verify token validity with backend
            const response = await apiCaller("GET", "/auth/profile/user");
            const { name, role, profilePicture, _id, email } = response.data.data;
            const freshUserData = {
              id: _id,
              name: `${name.first} ${name.last}`,
              role,
              profilePicture,
              email
            };
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));
            setUser(freshUserData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error verifying token:", error);
            // If token is invalid, clear everything
            removeCookie('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
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
  }, []);

  const refreshUserProfile = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getCookie('authToken');

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
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
    // Store token in cookie for API calls
    setCookie('authToken', token, 7);
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear both cookie and localStorage
    removeCookie('authToken');
    localStorage.removeItem('user');
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
