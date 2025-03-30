import { useState, createContext, useContext } from "react";

export const MultiStepFormContext = createContext(null);

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepForm must be used within a MultiStepFormProvider"
    );
  }
  return context;
};

const MultiStepForm = ({ title, children, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = Array.isArray(children) ? children : [children];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete && onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const contextValue = {
    currentStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    nextStep,
    prevStep,
    goToStep,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg w-[60%]  mx-auto relative">
        <MultiStepFormContext.Provider value={contextValue}>
          {/* Header with title and close button */}
          <div className="flex justify-between items-center p-6 border-b">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Progress indicator (only show if multiple steps) */}
            {/* {steps.length > 1 && (
              <div className="mb-6">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={steps.length}
                />
              </div>
            )} */}

            {/* Current step content */}
            <div className="form-step-content max-h-[calc(100vh-250px)] overflow-y-auto">
              {steps[currentStep]}
            </div>

            {/* Navigation buttons - only show if multiple steps or on last step */}
            {(steps.length > 1 || currentStep === steps.length - 1) && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-4 py-2 rounded ${
                    currentStep === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  {currentStep === steps.length - 1 ? "Complete" : "Next"}
                </button>
              </div>
            )}
          </div>
        </MultiStepFormContext.Provider>
      </div>
    </div>
  );
};

export default MultiStepForm;
