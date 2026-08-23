import { apiCaller } from "../utils/axiosInstance";

function asId(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return asId(value._id || value.id || value.$oid || value.d_id);
  }
  return null;
}

export function collectDoctorCatalogIds(...sources) {
  const ids = [];
  const add = (value) => {
    const id = asId(value);
    if (id && !ids.includes(id)) ids.push(id);
  };
  sources.forEach(add);
  return ids;
}

function uniqueCatalogRows(rows) {
  const byId = new Map();
  rows.forEach((row) => {
    const id = asId(row?._id || row?.id);
    if (!id || byId.has(id)) return;
    byId.set(id, row);
  });
  return [...byId.values()];
}

function extractServiceArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.services)) return payload.services;
  if (Array.isArray(payload.data?.services)) return payload.data.services;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  if (Array.isArray(payload.data?.data?.services)) return payload.data.data.services;
  return [];
}

/**
 * Normalize GET /user-services/:userId/doctor response into catalog rows { _id, title, price, shortDescription }.
 */
export function mapDoctorServicesResponseToCatalog(response) {
  const raw = extractServiceArray(response?.data ?? response);
  if (!Array.isArray(raw)) return [];
  return uniqueCatalogRows(
    raw
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
      .filter(Boolean)
  );
}

/**
 * Normalize GET /services response into catalog rows { _id, title, price, shortDescription }.
 */
export function mapServicesResponseToCatalog(response) {
  const raw = extractServiceArray(response?.data ?? response);
  return uniqueCatalogRows(
    raw
      .map((svc) => {
        const item = svc?.service ?? svc;
        if (!item || (!item._id && !item.id)) return null;
        return {
          _id: item._id || item.id,
          title: item.title || "",
          price: svc?.price != null && svc?.price !== "" ? svc.price : item.price,
          shortDescription: item.shortDescription,
        };
      })
      .filter(Boolean)
  );
}

export async function loadDoctorAssignedCatalog(doctorIds) {
  const ids = collectDoctorCatalogIds(...(doctorIds || []));
  const catalogs = [];
  for (const id of ids) {
    try {
      catalogs.push(mapDoctorServicesResponseToCatalog(await userServiceHelper.getDoctorServices(id)));
    } catch {
      /* try catalog endpoint */
    }
    try {
      catalogs.push(mapServicesResponseToCatalog(await userServiceHelper.getServicesCatalog(id)));
    } catch {
      /* next id */
    }
  }
  return uniqueCatalogRows(catalogs.flat());
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
  },

  // Get active services catalog; optional doctorId limits result to doctor's assigned services
  getServicesCatalog: async (doctorId) => {
    try {
      const query = doctorId ? `?doctorId=${encodeURIComponent(doctorId)}` : "";
      const response = await apiCaller("GET", `/services${query}`);
      return response;
    } catch (error) {
      console.error("Error getting services catalog:", error);
      throw error;
    }
  }
};

export default userServiceHelper; 