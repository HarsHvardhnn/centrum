import { Loader2 } from "lucide-react";

export default function KioskLoadingOverlay({ title, message }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/40 backdrop-blur-sm px-6 touch-none"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={title}
      onPointerDown={(e) => e.preventDefault()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-teal-100 px-8 py-10 max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
          <Loader2 className="w-9 h-9 text-teal-700 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        {message && <p className="text-sm text-gray-600 leading-relaxed">{message}</p>}
      </div>
    </div>
  );
}
