import { useState } from "react";

/**
 * In-app confirmation (replaces window.confirm). Matches CM7 dashboard dialogs.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Usuń",
  cancelLabel = "Anuluj",
  onConfirm,
  onClose,
  danger = true,
}) {
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm?.();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm7-confirm-title"
      >
        <h2
          id="cm7-confirm-title"
          className={`text-xl font-semibold mb-2 ${danger ? "text-red-600" : "text-gray-900"}`}
        >
          {title}
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {busy ? "Proszę czekać…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
