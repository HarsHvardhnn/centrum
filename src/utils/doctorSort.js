/** Doctor _id that should always appear first in doctors lists. */
export const PINNED_DOCTOR_ID = "6877dbf8635211ff3ec6322d";

/**
 * Returns a copy of the doctors array with the pinned doctor first.
 * Handles both `id` and `_id` on each doctor.
 * @param {Array<{ id?: string, _id?: string }>} doctors
 * @returns {Array}
 */
export function sortDoctorsWithPinnedFirst(doctors) {
  if (!Array.isArray(doctors) || doctors.length === 0) return doctors;
  const list = [...doctors];
  const getDocId = (d) => d.id ?? d._id;
  list.sort((a, b) => {
    const aFirst = getDocId(a) === PINNED_DOCTOR_ID ? -1 : 0;
    const bFirst = getDocId(b) === PINNED_DOCTOR_ID ? -1 : 0;
    if (aFirst !== bFirst) return aFirst - bFirst;
    return 0;
  });
  return list;
}
