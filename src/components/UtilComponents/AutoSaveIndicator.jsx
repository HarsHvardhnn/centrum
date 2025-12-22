import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

/**
 * Small auto-save indicator component
 * Shows the current status of auto-save (saving, saved, error)
 */
export default function AutoSaveIndicator({ status, className = "" }) {
  if (status === 'idle') {
    return null; // Don't show anything when idle
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Zapisywanie...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
        };
      case 'saved':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Zapisano',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Błąd zapisu',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.color} ${className}`}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}

