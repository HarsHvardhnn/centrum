import { apiCaller } from "../utils/axiosInstance";

function unwrap(response) {
  return response?.data?.data;
}

const clinicFlowHelper = {
  incomingShares(visitId) {
    return apiCaller("GET", `/api/clinic-flow/shares/incoming?visitId=${visitId}`).then(unwrap);
  },
  outgoingShares(visitId) {
    return apiCaller("GET", `/api/clinic-flow/shares/outgoing?visitId=${visitId}`).then(unwrap);
  },
  shareReport({ visitId, reportId, clinicDocumentId, toDoctorId }) {
    return apiCaller("POST", "/api/clinic-flow/shares", { visitId, reportId, clinicDocumentId, toDoctorId }).then(unwrap);
  },
  openSharedFile(shareId) {
    return apiCaller("GET", `/api/clinic-flow/shares/${shareId}/file`).then(unwrap);
  },
  reviewShare(shareId) {
    return apiCaller("POST", `/api/clinic-flow/shares/${shareId}/review`, {}).then(unwrap);
  },
  createOrder({ visitId, exam, note, kind, specialization, requestedDoctorId }) {
    return apiCaller("POST", "/api/clinic-flow/orders", {
      visitId,
      exam,
      note,
      kind,
      specialization,
      requestedDoctorId,
    }).then(unwrap);
  },
  listOrders(filters = "open") {
    const params = new URLSearchParams();
    if (typeof filters === "string") {
      params.set("status", filters || "open");
    } else {
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value != null && String(value).trim() !== "") params.set(key, String(value).trim());
      });
    }
    return apiCaller("GET", `/api/clinic-flow/orders?${params.toString()}`).then(unwrap);
  },
  ordersForVisit(visitId) {
    return apiCaller("GET", `/api/clinic-flow/orders/for-visit/${visitId}`).then(unwrap);
  },
  getOrder(orderId) {
    return apiCaller("GET", `/api/clinic-flow/orders/${orderId}`).then(unwrap);
  },
  bookOrder(orderId, visitId) {
    return apiCaller("POST", `/api/clinic-flow/orders/${orderId}/book`, { visitId }).then(unwrap);
  },
  cancelOrder(orderId) {
    return apiCaller("POST", `/api/clinic-flow/orders/${orderId}/cancel`, {}).then(unwrap);
  },
  doctors() {
    return apiCaller("GET", "/doctor-stats/doctors-list").then((response) => response?.data?.data || []);
  },
};

export const CONSULTATION_EXAM = "Konsultacja specjalistyczna";

export function orderStatusMeta(status) {
  if (status === "cancelled") {
    return { label: "Anulowana", className: "bg-slate-50 text-slate-700 border-slate-200" };
  }
  if (status === "completed") {
    return { label: "Zrealizowana", className: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  }
  if (status === "booked") {
    return { label: "Zarezerwowana", className: "bg-sky-50 text-sky-800 border-sky-200" };
  }
  return { label: "Skierowana", className: "bg-amber-50 text-amber-800 border-amber-200" };
}

export function formatOrderWhen(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default clinicFlowHelper;
