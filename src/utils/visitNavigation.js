import appointmentHelper from "../helpers/appointmentHelper";
import { queryKeys } from "../lib/queryKeys";

export function visitPagePath(patientId, appointmentId) {
  if (!patientId) return "/szczegoly-pacjenta";
  if (!appointmentId) return `/szczegoly-pacjenta/${patientId}`;
  return `/szczegoly-pacjenta/${patientId}?appointmentId=${encodeURIComponent(appointmentId)}`;
}

const VISIT_STALE_MS = 30_000;

export function unwrapVisitConsolidated(response) {
  return response?.data || response;
}

export function prefetchVisitDetails(queryClient, appointmentId) {
  if (!queryClient || !appointmentId) return;
  queryClient.prefetchQuery({
    queryKey: queryKeys.visitConsolidated(appointmentId),
    queryFn: () => appointmentHelper.getPatientDetailsConsolidated(appointmentId),
    staleTime: VISIT_STALE_MS,
  });
}

export function fetchVisitDetails(queryClient, appointmentId) {
  if (!queryClient || !appointmentId) {
    return Promise.reject(new Error("Missing appointment id"));
  }
  return queryClient.fetchQuery({
    queryKey: queryKeys.visitConsolidated(appointmentId),
    queryFn: () => appointmentHelper.getPatientDetailsConsolidated(appointmentId),
    staleTime: VISIT_STALE_MS,
  });
}
