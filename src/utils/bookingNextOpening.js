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

function emptyOpening(offset = 0) {
  const days = buildWeekDays(offset);
  return {
    onlineBookingUnavailable: false,
    offset,
    days,
    bookableDate: "",
    daysWithSlots: new Set(),
    weekData: null,
    availableSlots: [],
  };
}

/**
 * Walk week windows until a day actually has slots. The next-available API
 * date is only a hint — the label and selection must match week availability.
 */
export async function findConfirmedOpening(
  doctorId,
  hintedDate,
  { maxWeeks = 8, startOffset } = {}
) {
  let offset =
    startOffset != null ? startOffset : weekOffsetFromYmd(hintedDate);

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
        onlineBookingUnavailable: false,
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

  return emptyOpening(startOffset ?? weekOffsetFromYmd(hintedDate));
}

/**
 * Faster first paint: load this week and "next available" together.
 * If this week already has slots, use them without waiting on further weeks.
 */
export async function loadInitialOpening(doctorId, { maxWeeks = 8 } = {}) {
  const week0Days = buildWeekDays(0);
  const [nextRes, week0] = await Promise.all([
    doctorService.getNextAvailableDate(doctorId).catch(() => ({
      success: false,
    })),
    loadWeekAvailability(doctorId, week0Days),
  ]);

  if (nextRes?.onlineBookingUnavailable) {
    return {
      ...emptyOpening(0),
      onlineBookingUnavailable: true,
    };
  }

  const week0Bookable = pickBookableDate(week0Days, week0.daysWithSlots, "");
  if (week0Bookable) {
    return {
      onlineBookingUnavailable: false,
      offset: 0,
      days: week0Days,
      bookableDate: week0Bookable,
      daysWithSlots: week0.daysWithSlots,
      weekData: week0.data,
      availableSlots: slotsForDate(week0.availability, week0Bookable),
    };
  }

  const hintedDate = normalizeYmd(nextRes?.nextAvailableDate);
  const hintedOffset = hintedDate ? weekOffsetFromYmd(hintedDate) : 1;
  return findConfirmedOpening(doctorId, hintedDate, {
    maxWeeks,
    startOffset: Math.max(1, hintedOffset),
  });
}

export { loadWeekAvailability, slotsForDate };
