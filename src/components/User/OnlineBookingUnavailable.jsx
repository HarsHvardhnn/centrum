import React from "react";

export const RECEPTION_PHONE_DISPLAY = "797-127-487";
export const RECEPTION_PHONE_TEL = "+48797127487";

export default function OnlineBookingUnavailable() {
  return (
    <div className="text-center py-8 px-4 bg-teal-50 border border-teal-200 rounded-lg">
      <p className="text-gray-900 font-semibold text-base mb-2">
        Brak możliwości rezerwacji online
      </p>
      <p className="text-gray-700 text-sm mb-4">
        Ten lekarz nie ma obecnie ustawionych terminów w systemie. Prosimy o rejestrację telefoniczną.
      </p>
      <a
        href={`tel:${RECEPTION_PHONE_TEL}`}
        className="inline-block text-2xl font-bold text-teal-700 hover:text-teal-800 tracking-wide"
      >
        {RECEPTION_PHONE_DISPLAY}
      </a>
    </div>
  );
}
