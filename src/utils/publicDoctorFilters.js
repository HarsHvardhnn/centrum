/**
 * Doctors hidden from public listings (home, /lekarze, booking dropdowns).
 * IDs are MongoDB string forms (_id / id).
 */
const EXCLUDED_PUBLIC_DOCTOR_IDS = new Set(["69bd758b7da69f75a1c8af75"]);

export function isDoctorHiddenFromPublic(doctorId) {
  if (doctorId == null || doctorId === "") return false;
  return EXCLUDED_PUBLIC_DOCTOR_IDS.has(String(doctorId));
}

/**
 * @param {Array} doctors
 * @param {(item: object) => string} getId - returns canonical id string
 */
export function filterPublicDoctorList(doctors, getId) {
  if (!Array.isArray(doctors)) return [];
  const idOf = getId || ((d) => d?.id ?? d?._id ?? "");
  return doctors.filter((d) => !isDoctorHiddenFromPublic(idOf(d)));
}
