import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { PATIENT_TYPES } from "./PatientTypeDetector";
import { isFactualGuardian } from "../../utils/guardian";

const STEP_DEFINITIONS = {
  [PATIENT_TYPES.ADULT]: [
    { id: "personal", title: "Dane osobowe", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "data_preview", title: "Sprawdź dane", component: "DataPreviewStep" },
    { id: "consent_rodo", title: "Zgoda RODO", component: "ConsentsStep", documentSection: "rodo" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "ConsentsStep", documentSection: "examination" },
    { id: "consent_authorization", title: "Upoważnienie", component: "ConsentsStep", documentSection: "authorization" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "SignatureStep" },
  ],
  [PATIENT_TYPES.INTERNATIONAL]: [
    { id: "personal", title: "Dane osobowe", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "data_preview", title: "Sprawdź dane", component: "DataPreviewStep" },
    { id: "consent_rodo", title: "Zgoda RODO", component: "ConsentsStep", documentSection: "rodo" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "ConsentsStep", documentSection: "examination" },
    { id: "consent_authorization", title: "Upoważnienie", component: "ConsentsStep", documentSection: "authorization" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "SignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_UNDER_16]: [
    { id: "personal", title: "Dane pacjenta", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "data_preview", title: "Sprawdź dane", component: "DataPreviewStep" },
    { id: "consent_guardian_statement", title: "Oświadczenie przedstawiciela", component: "MinorConsentsStep", documentSection: "guardian_statement" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "MinorConsentsStep", documentSection: "examination" },
    { id: "consent_rodo", title: "Zgoda RODO", component: "MinorConsentsStep", documentSection: "rodo" },
    { id: "consent_authorization", title: "Upoważnienie", component: "MinorConsentsStep", documentSection: "authorization" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "MinorSignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_16_17]: [
    { id: "personal", title: "Dane pacjenta", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "data_preview", title: "Sprawdź dane", component: "DataPreviewStep" },
    { id: "consent_guardian_statement", title: "Oświadczenie przedstawiciela", component: "MinorConsentsStep", documentSection: "guardian_statement" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "MinorConsentsStep", documentSection: "examination" },
    { id: "consent_rodo", title: "Zgoda RODO", component: "MinorConsentsStep", documentSection: "rodo" },
    { id: "consent_authorization", title: "Upoważnienie", component: "MinorConsentsStep", documentSection: "authorization" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "MinorSignatureStep" },
  ],
};

export default function KioskStepWizard({
  patientType = PATIENT_TYPES.ADULT,
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  onFormDataChange,
  loading = false,
  stepComponents = {},
}) {
  const baseSteps = STEP_DEFINITIONS[patientType] || STEP_DEFINITIONS[PATIENT_TYPES.ADULT];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [stepValidation, setStepValidation] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const contentRef = useRef(null);

  // Factual caregiver may only sign examination (+ statement).
  const steps = useMemo(() => {
    if (!isFactualGuardian(formData)) return baseSteps;
    return baseSteps.filter((s) => {
      if (patientType === PATIENT_TYPES.MINOR_UNDER_16) {
        if (s.id === "consent_rodo" || s.id === "consent_authorization") return false;
      }
      return true;
    });
  }, [baseSteps, formData, patientType]);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(Math.max(0, steps.length - 1));
    }
  }, [currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const totalSteps = steps.length;
  const currentValidation = stepValidation[currentStep?.id];

  const autoSaveTimeoutRef = useRef(null);
  const lastAutoSaveRef = useRef(Date.now());

  const scrollContentToTop = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    // Instant jump — smooth scroll runs against the *previous* document on iPad
    // and leaves the next consent stuck at the bottom.
    el.scrollTop = 0;
    el.scrollTo(0, 0);
  }, []);

  // Reset after the new document has painted. Checking the box at the bottom
  // then tapping Dalej used to keep the same scroll offset on the next screen.
  useEffect(() => {
    scrollContentToTop();
    const raf = requestAnimationFrame(() => {
      scrollContentToTop();
      requestAnimationFrame(scrollContentToTop);
    });
    const timeoutId = window.setTimeout(scrollContentToTop, 50);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeoutId);
    };
  }, [currentStepIndex, currentStep?.id, scrollContentToTop]);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };

      if (onFormDataChange) {
        queueMicrotask(() => onFormDataChange(newData));
      }
      
      if (onAutoSave && !loading) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        const now = Date.now();
        const timeSinceLastSave = now - lastAutoSaveRef.current;
        
        if (timeSinceLastSave > 2000) {
          autoSaveTimeoutRef.current = setTimeout(() => {
            lastAutoSaveRef.current = Date.now();
            onAutoSave(newData);
            autoSaveTimeoutRef.current = null;
          }, 1500);
        }
      }
      
      return newData;
    });
  }, [loading, onAutoSave, onFormDataChange]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleValidationChange = useCallback((validation) => {
    if (!currentStep?.id) return;
    setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }));
  }, [currentStep?.id]);

  const validateCurrentStep = useCallback(() => {
    if (currentValidation) {
      return currentValidation;
    }
    return { isValid: false, errors: ["Sprawdź wszystkie pola w tym kroku."] };
  }, [currentValidation]);

  const goToNextStep = useCallback(() => {
    if (loading) return;
    const validation = validateCurrentStep();
    setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }));

    if (validation.isValid && !isLastStep) {
      setShowErrors(false);
      setCurrentStepIndex(prev => prev + 1);
      scrollContentToTop();
    } else if (validation.isValid && isLastStep) {
      setShowErrors(false);
      onSubmit?.(formData);
    } else {
      setShowErrors(true);
      const isGuardianPeselStep =
        currentStep.component === "ContactStep" ||
        currentStep.component === "GuardianDataStep";
      const guardianPeselDigits = String(formData.guardianPesel || "").replace(/\D/g, "");
      const hasGuardianPeselError = (validation.errors || []).some((e) =>
        /PESEL|daty urodzenia|suma kontrolna/i.test(String(e || ""))
      );
      if (
        isGuardianPeselStep &&
        !formData.guardianNoPesel &&
        !formData.guardianPeselFallbackMode &&
        guardianPeselDigits.length === 11 &&
        hasGuardianPeselError
      ) {
        updateFormData({
          guardianPeselFailAttempts: (formData.guardianPeselFailAttempts || 0) + 1,
        });
      }
      scrollContentToTop();
    }
  }, [currentStep?.component, currentStep?.id, formData, isLastStep, loading, onSubmit, updateFormData, validateCurrentStep, scrollContentToTop]);

  const goToPreviousStep = useCallback(() => {
    if (loading || isFirstStep) return;
    setShowErrors(false);
    setCurrentStepIndex(prev => prev - 1);
    scrollContentToTop();
  }, [isFirstStep, loading, scrollContentToTop]);

  const goToStep = useCallback((stepIndex) => {
    if (loading) return;
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setShowErrors(false);
      setCurrentStepIndex(stepIndex);
      scrollContentToTop();
    }
  }, [loading, totalSteps, scrollContentToTop]);

  const StepComponent = stepComponents[currentStep?.component];

  if (!StepComponent) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Step component '{currentStep?.component}' not found</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col w-full">
      {/* Sticky step header */}
      <div className="shrink-0 sticky top-0 z-30 bg-white px-5 sm:px-8 pt-3 pb-3 border-b border-gray-100">
        <div className="flex justify-between items-center gap-3 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {currentStep.title}
          </h3>
          <span className="text-xs sm:text-sm text-gray-500 shrink-0">
            Krok {currentStepIndex + 1} z {totalSteps}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= currentStepIndex ? "bg-teal-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scrollable content — only this region scrolls on iPad */}
      <div
        ref={contentRef}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-8 py-5 ${loading ? "pointer-events-none select-none" : ""}`}
      >
        <div className="pb-2" key={currentStep?.id}>
          <StepComponent
            formData={formData}
            updateFormData={updateFormData}
            patientType={patientType}
            mode={mode}
            validation={currentValidation}
            onValidationChange={handleValidationChange}
            onGoToStep={goToStep}
            documentSection={currentStep.documentSection}
          />
        </div>

        {showErrors && currentValidation && !currentValidation.isValid && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Popraw następujące błędy, aby przejść do kolejnego kroku:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="space-y-1">
                    {currentValidation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer — always visible on iPad */}
      <div className="shrink-0 sticky bottom-0 z-30 border-t border-gray-200 bg-white px-5 sm:px-8 py-3 sm:py-4 flex justify-between items-center gap-3 shadow-[0_-6px_16px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={isFirstStep || loading}
          className="min-w-[7rem] px-5 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors touch-manipulation text-base"
        >
          Wstecz
        </button>

        <button
          type="button"
          onClick={goToNextStep}
          disabled={loading}
          className="min-w-[9rem] px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold transition-colors touch-manipulation text-base"
        >
          {loading
            ? "Zapisywanie..."
            : isLastStep
              ? "Zakończ"
              : currentStep?.id === "data_preview"
                ? "Dalej do dokumentów"
                : "Dalej"}
        </button>
      </div>
    </div>
  );
}

export { STEP_DEFINITIONS };
