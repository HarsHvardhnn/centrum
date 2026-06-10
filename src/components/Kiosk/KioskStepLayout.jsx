import { STEP_LABELS, STEP_ORDER_FULL } from "./kioskConstants";

export default function KioskStepLayout({
  currentStep,
  stepIndex,
  totalSteps,
  onBack,
  onHelp,
  children,
  footer,
}) {
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="min-h-[60vh] flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4 text-sm text-gray-500">
        <span>
          Krok {stepIndex + 1} z {totalSteps}
          {STEP_LABELS[currentStep] ? ` · ${STEP_LABELS[currentStep]}` : ""}
        </span>
        {onHelp && (
          <button type="button" onClick={onHelp} className="text-teal-700 hover:underline">
            Potrzebujesz pomocy?
          </button>
        )}
      </div>

      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-teal-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1">{children}</div>

      {footer && (
        <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Wstecz
            </button>
          ) : (
            <span />
          )}
          {footer}
        </div>
      )}
    </div>
  );
}

export function getStepIndex(step, mode) {
  const order =
    mode === "sign_only"
      ? STEP_ORDER_FULL.filter((s) => s !== "personal" && s !== "address" && s !== "contact")
      : STEP_ORDER_FULL;
  return { order, index: order.indexOf(step) };
}
