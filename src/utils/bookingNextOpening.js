import doctorService from "../helpers/doctorHelper";
import {
  buildWeekDays,
  collectDaysWithSlots,
  normalizeYmd,
  pickBookableDate,
  weekOffsetFromYmd,
} from "./polandTimezone";

async function loadWeekAvailability(doctorId, days) {
  if (!doctorId || !days?.length) {
    return { daysWithSlots: new Set(), availability: [], data: null };
  }

  const response = await doctorService.getWeekAvailability(
    doctorId,
    days[0],
    days[days.length - 1]
  );

  if (!response?.success || !response.data?.availability) {
    return { daysWithSlots: new Set(), availability: [], data: null };
  }

  return {
    daysWithSlots: collectDaysWithSlots(response.data.availability),
    availability: response.data.availability,
    data: response.data,
  };
}

function slotsForDate(availability, date) {
  const ymd = normalizeYmd(date);
  const match = (availability || []).find(
    (day) => normalizeYmd(day.date) === ymd
  );
  if (!match?.availableSlots) return [];
  return match.availableSlots.filter((slot) => slot.available !== false);
}

/**
 * Walk week windows until a day actually has slots. The next-available API
 * date is only a hint — the label and selection must match week availability.
 */
export async function findConfirmedOpening(doctorId, hintedDate, { maxWeeks = 8 } = {}) {
  let offset = weekOffsetFromYmd(hintedDate);

  for (let i = 0; i < maxWeeks; i += 1) {
    const days = buildWeekDays(offset);
    const loaded = await loadWeekAvailability(doctorId, days);
    const bookableDate = pickBookableDate(
      days,
      loaded.daysWithSlots,
      i === 0 ? hintedDate : ""
    );

    if (bookableDate) {
      return {
        offset,
        days,
        bookableDate,
        daysWithSlots: loaded.daysWithSlots,
        weekData: loaded.data,
        availableSlots: slotsForDate(loaded.availability, bookableDate),
      };
    }

    offset += 1;
  }

  const days = buildWeekDays(weekOffsetFromYmd(hintedDate));
  return {
    offset: weekOffsetFromYmd(hintedDate),
    days,
    bookableDate: "",
    daysWithSlots: new Set(),
    weekData: null,
    availableSlots: [],
  };
}

export { loadWeekAvailability, slotsForDate };
