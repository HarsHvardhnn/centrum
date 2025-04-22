import { apiCaller } from "../utils/axiosInstance";

class AdminService {
  // Get all non-admin users with pagination, search, and sort
  async getAllUsers(
    page = 1,
    limit = 10,
    searchTerm = "",
    sortField = "createdAt",
    sortOrder = "desc"
  ) {
    try {
      const response = await apiCaller(
        "GET",
        `/admin/users/non-admins?page=${page}&limit=${limit}&search=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Mark user as deleted
  async markUserAsDeleted(userId) {
    try {
      const response = await apiCaller(
        "PATCH",
        `/admin/users/${userId}/delete`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking user as deleted:", error);
      throw error;
    }
  }

  async reviveUser(userId) {
    try {
      const response = await apiCaller(
        "PATCH",
        `/admin/users/${userId}/revive`
      );
      return response.data;
    } catch (error) {
      console.error("Error reviving user:", error);
      throw error;
    }
  }

  // Add new receptionist
  async addReceptionist(receptionistData) {
    try {
      const response = await apiCaller(
        "POST",
        "/admin/receptionists",
        receptionistData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding receptionist:", error);
      throw error;
    }
  }

  // Get user details
  async getUserDetails(userId) {
    try {
      const response = await apiCaller("GET", `/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }
}

export default new AdminService();
