import {
  INTERNATIONAL_MINOR_BLOCKED_MESSAGE,
  INTERNATIONAL_MINOR_BLOCKED_TITLE,
} from "./PatientTypeDetector";

export default function KioskInternationalMinorBlockedModal({
  open,
  onClose,
  closeLabel = "Zamknij",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kiosk-international-minor-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl">
        <h2
          id="kiosk-international-minor-title"
          className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4"
        >
          {INTERNATIONAL_MINOR_BLOCKED_TITLE}
        </h2>
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center mb-8">
          {INTERNATIONAL_MINOR_BLOCKED_MESSAGE}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-lg py-3.5 px-6 rounded-xl touch-manipulation"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
