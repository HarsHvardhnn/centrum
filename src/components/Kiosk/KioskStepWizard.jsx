import { useState, useCallback, useRef, useEffect } from "react";
import { PATIENT_TYPES } from "./PatientTypeDetector";

const STEP_DEFINITIONS = {
  [PATIENT_TYPES.ADULT]: [
    { id: "personal", title: "Dane osobowe", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "consents", title: "Zgody", component: "ConsentsStep" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "SignatureStep" },
  ],
  [PATIENT_TYPES.INTERNATIONAL]: [
    { id: "personal", title: "Dane osobowe", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "consents", title: "Zgody", component: "ConsentsStep" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "SignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_UNDER_16]: [
    { id: "personal", title: "Dane pacjenta", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "consents", title: "Zgody", component: "MinorConsentsStep" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "MinorSignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_16_17]: [
    { id: "personal", title: "Dane pacjenta", component: "PersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "consents", title: "Zgody", component: "MinorConsentsStep" },
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
  const steps = STEP_DEFINITIONS[patientType] || STEP_DEFINITIONS[PATIENT_TYPES.ADULT];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [stepValidation, setStepValidation] = useState({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const totalSteps = steps.length;

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

  const validateCurrentStep = useCallback((data) => {
    // Get the current step's validation state
    const currentValidation = stepValidation[currentStep.id];
    if (currentValidation) {
      return currentValidation;
    }
    
    // Default to invalid if no validation state is available
    return { isValid: false, errors: ["Sprawdź wszystkie pola w tym kroku."] };
  }, [stepValidation, currentStep.id]);

  const goToNextStep = useCallback(() => {
    const validation = validateCurrentStep(formData);
    setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }));
    
    if (validation.isValid && !isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (validation.isValid && isLastStep) {
      onSubmit?.(formData);
    } else if (!validation.isValid) {
      // Don't proceed if validation fails - button should be disabled anyway
      console.warn("Cannot proceed to next step due to validation errors:", validation.errors);
    }
  }, [currentStep.id, formData, isLastStep, onSubmit, validateCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStepIndex(stepIndex);
    }
  }, [totalSteps]);

  // Get the component for current step
  const StepComponent = stepComponents[currentStep.component];

  if (!StepComponent) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Step component '{currentStep.component}' not found</p>
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
          validation={stepValidation[currentStep.id]}
          onValidationChange={(validation) => 
            setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }))
          }
          onGoToStep={goToStep}
        />
      </div>

      {/* Validation Error Summary */}
      {stepValidation[currentStep.id] && !stepValidation[currentStep.id].isValid && (
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
                  {stepValidation[currentStep.id].errors.map((error, index) => (
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
          disabled={loading || (stepValidation[currentStep.id] && !stepValidation[currentStep.id].isValid)}
          className="px-8 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold transition-colors"
        >
          {loading ? "Zapisywanie..." : isLastStep ? "Zakończ rejestrację" : "Dalej"}
        </button>
      </div>
    </div>
  );
}

export { STEP_DEFINITIONS };