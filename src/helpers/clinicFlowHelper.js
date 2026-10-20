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
  createOrder({ visitId, exam, note }) {
    return apiCaller("POST", "/api/clinic-flow/orders", { visitId, exam, note }).then(unwrap);
  },
  listOrders(status = "open") {
    return apiCaller("GET", `/api/clinic-flow/orders?status=${status}`).then(unwrap);
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

export default clinicFlowHelper;
