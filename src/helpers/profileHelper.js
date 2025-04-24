// services/userService.js
import { apiCaller } from "../utils/axiosInstance";

/**
 * Service for user-related API calls
 */
const userService = {
  /**
   * Get current user profile
   * @returns {Promise} - API response with user profile data
   */
  getUserProfile: async () => {
    try {
      const response = await apiCaller("GET", "/auth/profile/user");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile information
   * @param {Object} profileData - User profile data to update
   * @returns {Promise} - API response with updated user data
   */
  updateUserProfile: async (profileData) => {
    try {
      const formData = new FormData();

      // Handle name fields
      if (profileData.first !== undefined) {
        formData.append("name[first]", profileData.first);
      }

      if (profileData.last !== undefined) {
        formData.append("name[last]", profileData.last);
      }

      // Add other fields if they exist
      if (profileData.email !== undefined) {
        formData.append("email", profileData.email);
      }

      if (profileData.phone !== undefined) {
        formData.append("phone", profileData.phone);
      }

      if (profileData.sex !== undefined) {
        formData.append("sex", profileData.sex);
      }

      // Handle file upload separately
      if (profileData.profilePicture instanceof File) {
        formData.append("file", profileData.profilePicture);
      }

      const response = await apiCaller("PUT", "/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   * @param {File} imageFile - The image file to upload
   * @returns {Promise} - API response with updated profile picture URL
   */
  uploadProfilePicture: async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error("Image file is required");
      }

      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await apiCaller(
        "POST",
        "/users/profile/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Object containing current and new password
   * @returns {Promise} - API response with status
   */
  changePassword: async (passwordData) => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error("Current password and new password are required");
      }

      const response = await apiCaller(
        "PUT",
        "/users/profile/password",
        passwordData
      );

      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  /**
   * Get user settings
   * @returns {Promise} - API response with user settings
   */
  getUserSettings: async () => {
    try {
      const response = await apiCaller("GET", "/users/settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      throw error;
    }
  },

  /**
   * Update user settings
   * @param {Object} settingsData - User settings to update
   * @returns {Promise} - API response with updated settings
   */
  updateUserSettings: async (settingsData) => {
    try {
      const response = await apiCaller("PUT", "/users/settings", settingsData);
      return response.data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  },

  /**
   * Delete user account
   * @param {Object} confirmationData - Data required to confirm deletion
   * @returns {Promise} - API response with deletion status
   */
  deleteAccount: async (confirmationData) => {
    try {
      const response = await apiCaller(
        "DELETE",
        "/users/profile",
        confirmationData
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  },

  /**
   * Get current user's active sessions
   * @returns {Promise} - API response with list of active sessions
   */
  getUserSessions: async () => {
    try {
      const response = await apiCaller("GET", "/users/sessions");
      return response.data;
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw error;
    }
  },

  /**
   * Revoke a specific session
   * @param {string} sessionId - ID of the session to revoke
   * @returns {Promise} - API response with session revocation status
   */
  revokeSession: async (sessionId) => {
    try {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await apiCaller(
        "DELETE",
        `/users/sessions/${sessionId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error revoking session:", error);
      throw error;
    }
  },

  /**
   * Revoke all active sessions except current one
   * @returns {Promise} - API response with sessions revocation status
   */
  revokeAllSessions: async () => {
    try {
      const response = await apiCaller("DELETE", "/users/sessions");
      return response.data;
    } catch (error) {
      console.error("Error revoking all sessions:", error);
      throw error;
    }
  },
};

export default userService;
