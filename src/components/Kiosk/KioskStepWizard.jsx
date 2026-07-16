import { useState, useCallback } from "react";
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
    { id: "personal", title: "Dane pacjenta", component: "MinorPersonalDataStep" },
    { id: "address", title: "Adres zamieszkania", component: "AddressStep" },
    { id: "contact", title: "Dane kontaktowe", component: "ContactStep" },
    { id: "guardian", title: "Dane opiekuna", component: "GuardianDataStep" },
    { id: "consents", title: "Zgody", component: "MinorConsentsStep" },
    { id: "documents", title: "Dokumenty", component: "DocumentUploadStep" },
    { id: "signature", title: "Podpis", component: "MinorSignatureStep" },
  ],
  [PATIENT_TYPES.MINOR_16_17]: [
    { id: "personal", title: "Dane pacjenta", component: "MinorPersonalDataStep" },
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

  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Auto-save after a delay
      if (onAutoSave) {
        setTimeout(() => onAutoSave(newData), 800);
      }
      return newData;
    });
  }, [onAutoSave]);

  const validateCurrentStep = useCallback((data) => {
    // This will be implemented by each step component
    // Return { isValid: boolean, errors: string[] }
    return { isValid: true, errors: [] };
  }, []);

  const goToNextStep = useCallback(() => {
    const validation = validateCurrentStep(formData);
    setStepValidation(prev => ({ ...prev, [currentStep.id]: validation }));
    
    if (validation.isValid && !isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (validation.isValid && isLastStep) {
      onSubmit?.(formData);
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