import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { PATIENT_TYPES } from "./PatientTypeDetector";
import { isFactualGuardian } from "../../utils/guardian";

const STEP_DEFINITIONS = {
  [PATIENT_TYPES.ADULT]: [
    { id: "personal", title: "Dane osobowe", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
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
    { id: "consent_rodo", title: "Zgoda RODO", component: "MinorConsentsStep", documentSection: "rodo" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "MinorConsentsStep", documentSection: "examination" },
    { id: "consent_guardian_statement", title: "Oświadczenie przedstawiciela", component: "MinorConsentsStep", documentSection: "guardian_statement" },
    { id: "consent_authorization", title: "Upoważnienie", component: "MinorConsentsStep", documentSection: "authorization" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "MinorSignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_16_17]: [
    { id: "personal", title: "Dane pacjenta", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "consent_rodo", title: "Zgoda RODO", component: "MinorConsentsStep", documentSection: "rodo" },
    { id: "consent_examination", title: "Zgoda na badanie", component: "MinorConsentsStep", documentSection: "examination" },
    { id: "consent_guardian_statement", title: "Oświadczenie przedstawiciela", component: "MinorConsentsStep", documentSection: "guardian_statement" },
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
  // Only show validation messages after the user tries to continue
  const [showErrors, setShowErrors] = useState(false);

  // Factual caregiver may only sign examination (+ statement).
  // Under-16: skip RODO + authorization entirely.
  // 16–17: keep patient RODO + patient authorization; guardian RODO block is hidden in UI/PDF.
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

  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };

      // Notify parent immediately (e.g. re-detect minor/adult after fallback DOB)
      if (onFormDataChange) {
        queueMicrotask(() => onFormDataChange(newData));
      }
      
      // Debounced auto-save to prevent infinite calls
      if (onAutoSave) {
        // Clear any existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        // Only auto-save if enough time has passed since last save
        const now = Date.now();
        const timeSinceLastSave = now - lastAutoSaveRef.current;
        
        if (timeSinceLastSave > 2000) { // Minimum 2 seconds between saves
          autoSaveTimeoutRef.current = setTimeout(() => {
            lastAutoSaveRef.current = Date.now();
            onAutoSave(newData);
            autoSaveTimeoutRef.current = null;
          }, 1500); // Debounce delay
        }
      }
      
      return newData;
    });
  }, [onAutoSave, onFormDataChange]);

  // Cleanup timeout on unmount
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

    // Default to invalid if no validation state is available
    return { isValid: false, errors: ["Sprawdź wszystkie pola w tym kroku."] };
  }, [currentValidation]);

  const goToNextStep = useCallback(() => {
    const validation = validateCurrentStep();
    setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }));

    if (validation.isValid && !isLastStep) {
      setShowErrors(false);
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (validation.isValid && isLastStep) {
      setShowErrors(false);
      onSubmit?.(formData);
    } else {
      setShowErrors(true);
      // Same as first kiosk PESEL step: after 2 failed Dalej attempts on an
      // invalid guardian PESEL, the step can offer "continue despite error".
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
    }
  }, [currentStep.component, currentStep.id, formData, isLastStep, onSubmit, updateFormData, validateCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setShowErrors(false);
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFirstStep]);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setShowErrors(false);
      setCurrentStepIndex(stepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalSteps]);

  // Get the component for current step
  const StepComponent = stepComponents[currentStep?.component];

  if (!StepComponent) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Step component '{currentStep?.component}' not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">{currentStep.title}</h2>
          <span className="text-sm text-gray-500">
            Krok {currentStepIndex + 1} z {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
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

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 min-h-[400px]">
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

      {/* Validation Error Summary — only after user attempts to continue */}
      {showErrors && currentValidation && !currentValidation.isValid && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
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

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm border">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Wstecz
        </button>

        <button
          type="button"
          onClick={goToNextStep}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold transition-colors"
        >
          {loading ? "Zapisywanie..." : isLastStep ? "Zakończ rejestrację" : "Dalej"}
        </button>
      </div>
    </div>
  );
}

export { STEP_DEFINITIONS };