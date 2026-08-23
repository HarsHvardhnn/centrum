import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Phone } from "lucide-react";
import {
  RECEPTION_PHONE_DISPLAY,
  RECEPTION_PHONE_TEL,
} from "./OnlineBookingUnavailable";

/**
 * Empty hours list for a chosen day that has no openings.
 * Does not replace OnlineBookingUnavailable (doctor has no online schedule).
 */
export default function NoSlotsOnSelectedDay() {
  return (
    <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
      <FaCalendarAlt className="mx-auto text-gray-400 mb-2" size={24} />
      <p className="text-gray-700">
        Brak dostępnych terminów w wybranym dniu
      </p>
      <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
        W razie pilnej konsultacji prosimy o kontakt z rejestracją Centrum
        Medycznego 7.
      </p>
      <a
        href={`tel:${RECEPTION_PHONE_TEL}`}
        className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
      >
        <Phone size={18} aria-hidden />
        Zadzwoń
        <span className="font-normal opacity-90">{RECEPTION_PHONE_DISPLAY}</span>
      </a>
    </div>
  );
}
