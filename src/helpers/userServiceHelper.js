import { apiCaller } from "../utils/axiosInstance";

/**
 * Normalize GET /user-services/:userId/doctor response into catalog rows { _id, title, price, shortDescription }.
 */
export function mapDoctorServicesResponseToCatalog(response) {
  const raw = response?.data?.data?.services ?? response?.data?.services ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const svc = item?.service ?? item;
      if (!svc || (!svc._id && !svc.id)) return null;
      const price = item?.price != null && item?.price !== "" ? item.price : svc.price;
      return {
        _id: svc._id || svc.id,
        title: svc.title || "",
        price,
        shortDescription: svc.shortDescription,
      };
    })
    .filter(Boolean);
}

// User services helper
const userServiceHelper = {
  // Add services to a doctor
  addDoctorServices: async (doctorId, services) => {
    try {
      const response = await apiCaller("POST", "/user-services", {
        userId: doctorId,
        userType: "doctor",
        services: services,
      });
      return response;
    } catch (error) {
      console.error("Error adding doctor services:", error);
      throw error;
    }
  },

  // Get doctor services
  getDoctorServices: async (doctorId) => {
    try {
      const response = await apiCaller(
        "GET",
        `/user-services/${doctorId}/doctor`
      );
      return response;
    } catch (error) {
      console.error("Error getting doctor services:", error);
      throw error;
    }
  },
  
  // Remove a service from a doctor
  removeDoctorService: async (doctorId, serviceId) => {
    try {
      const response = await apiCaller(
        "DELETE",
        `/user-services/${doctorId}/doctor/service/${serviceId}`
      );
      return response;
    } catch (error) {
      console.error("Error removing doctor service:", error);
      throw error;
    }
  },

  // Get services for multiple doctors
  getServicesForDoctors: async (doctorIds) => {
    try {
      const response = await apiCaller(
        "POST", 
        `/user-services/batch/doctors`, 
        { doctorIds }
      );
      return response;
    } catch (error) {
      console.error("Error getting services for multiple doctors:", error);
      throw error;
    }
  },

  // Get all available services (for admin or general selection)
  getAllServices: async () => {
    try {
      const response = await apiCaller("GET", "/services");
      return response;
    } catch (error) {
      console.error("Error getting all services:", error);
      throw error;
    }
  }
};

export default userServiceHelper; 