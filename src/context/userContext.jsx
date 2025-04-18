import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios"; // Make sure axios is installed

// Create the context
const UserContext = createContext(null);

// Custom hook
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const refreshUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    if (!user) return;

    const updatedUser = {
      ...user,
      [field]: value,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const updateProfilePicture = async (imageFile) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("profilePicture", imageFile);

      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        "/api/user/update-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
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

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserProfile,
    updateUserField,
    updateProfilePicture,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
