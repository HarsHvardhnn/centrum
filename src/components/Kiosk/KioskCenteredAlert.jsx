import { AlertCircle, Info, RotateCcw } from "lucide-react";

export default function KioskCenteredAlert({
  title,
  message,
  variant = "error",
  actionLabel = "Spróbuj ponownie",
  onAction,
}) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : Info;

  return (
    <div className="text-center py-4 px-2">
      <div
        className={`mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center ${
          isError ? "bg-red-50" : "bg-teal-50"
        }`}
      >
        <Icon className={`w-8 h-8 ${isError ? "text-red-600" : "text-teal-700"}`} aria-hidden="true" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed max-w-md mx-auto mb-8">{message}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[220px] bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base py-3.5 px-6 rounded-xl"
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
