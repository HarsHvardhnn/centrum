export const queryKeys = {
  appointmentsList: (params) => ["appointments-list", params],
  dashboardAppointments: (page, limit) => ["dashboard-appointments", page, limit],
  dashboardStats: (doctorId, timeframe) => ["dashboard-stats", doctorId, timeframe],
  doctorsList: ["doctors-list"],
  visitReasons: ["visit-reasons"],
  billingList: (params) => ["billing-list", params],
  billingSummary: (params) => ["billing-summary", params],
};
