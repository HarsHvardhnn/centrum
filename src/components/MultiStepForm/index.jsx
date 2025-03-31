import { useState, createContext, useContext, useEffect } from "react";

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

const MultiStepForm = ({ 
  title, 
  children, 
  onComplete, 
  onClose, 
  currentStep,
  nextStep,
  prevStep,
  goToStep,
  setSteps,
  steps,
  currentSubStep, // Track sub-step state
  totalSubSteps,  // Total sub-steps
  subStepTitles = [], // Array of sub-step titles
  handleSubStepNavigation = false // Flag to indicate if we're handling sub-steps
}) => {

  useEffect(() => {
    setSteps(Array.isArray(children) ? children : [children]);
  }, [children, setSteps]);

  const contextValue = {
    currentStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    nextStep,
    prevStep,
    goToStep,
    currentSubStep,
    totalSubSteps,
    handleSubStepNavigation,
    subStepTitles
  };

  // Function to determine button text based on step and sub-step
  const getNextButtonText = () => {
    if (currentStep === steps.length - 1) return "Add Appointment";
    
    // If we're handling sub-steps and on the last sub-step
    if (handleSubStepNavigation && currentStep === 1 && currentSubStep === totalSubSteps - 1) {
      return "Complete Step";
    }
    
    return "Next";
  };

  // Function to determine previous button text
  const getPreviousButtonText = () => {
    // If we're on a sub-step (not the first one), show custom back text
    if (handleSubStepNavigation && currentSubStep > 0 && subStepTitles.length > 0) {
      const prevSubStepName = subStepTitles[currentSubStep - 1];
      return `← Back to ${prevSubStepName}`;
    }
    
    return "Previous";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg w-[60%] mx-auto relative">
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
            {/* Current step content */}
            <div className="form-step-content max-h-[calc(100vh-250px)] overflow-y-auto">
              {steps[currentStep]}
            </div>

            {/* Navigation buttons - only show if multiple steps or on last step */}
            {(steps.length > 1 || currentStep === steps.length - 1) && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0 && (!handleSubStepNavigation || currentSubStep === 0)}
                  className={`px-4 py-2 rounded ${
                    currentStep === 0 && (!handleSubStepNavigation || currentSubStep === 0)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {getPreviousButtonText()}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center"
                  >
                    {getNextButtonText()}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </MultiStepFormContext.Provider>
      </div>
    </div>
  );
};

export default MultiStepForm;