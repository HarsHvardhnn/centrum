import React from "react";
import { Phone } from "lucide-react";

export const RECEPTION_PHONE_DISPLAY = "797-127-487";
export const RECEPTION_PHONE_TEL = "+48797127487";

/**
 * Shown when a doctor has no online schedule configured.
 * Emphasizes calling reception (ClickUp: 797-127-487).
 */
export default function OnlineBookingUnavailable() {
  return (
    <div className="text-center py-8 px-4 bg-teal-50 border-2 border-teal-300 rounded-xl">
      <p className="text-gray-900 font-semibold text-lg mb-2">
        Brak możliwości rezerwacji online
      </p>
      <p className="text-gray-700 text-sm mb-5 max-w-md mx-auto">
        Ten lekarz nie ma obecnie ustawionych terminów w systemie. Prosimy o
        rejestrację telefoniczną w recepcji.
      </p>
      <a
        href={`tel:${RECEPTION_PHONE_TEL}`}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-teal-700 text-white text-xl font-bold tracking-wide hover:bg-teal-800 shadow-sm transition-colors"
      >
        <Phone size={22} aria-hidden />
        {RECEPTION_PHONE_DISPLAY}
      </a>
      <p className="mt-3 text-xs text-gray-500">
        Kliknij numer, aby zadzwonić
      </p>
    </div>
  );
}
