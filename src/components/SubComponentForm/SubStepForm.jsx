import { useState, createContext, useContext } from "react";
import { useFormContext } from "../../context/SubStepFormContext";

export const SubStepFormContext = createContext(null);

export const useSubStepForm = () => {
  const context = useContext(SubStepFormContext);
  if (!context) {
    throw new Error(
      "useSubStepForm must be used within a SubStepFormProvider"
    );
  }
  return context;
};

const SubStepForm = ({ children, onComplete }) => {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const subSteps = Array.isArray(children) ? children : [children];
  const { formData } = useFormContext();


  const nextSubStep = () => {
    if (currentSubStep < subSteps.length - 1) {
      setCurrentSubStep(currentSubStep + 1);
    } else {
      onComplete && onComplete();
    }
  };

  const prevSubStep = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    }
  };

  const goToSubStep = (step) => {
    if (step >= 0 && step < subSteps.length) {
        console.log('form data',formData);
      setCurrentSubStep(step);
    }
  };

  const contextValue = {
    currentSubStep,
    totalSubSteps: subSteps.length,
    isFirstSubStep: currentSubStep === 0,
    isLastSubStep: currentSubStep === subSteps.length - 1,
    nextSubStep,
    prevSubStep,
    goToSubStep,
  };

  return (
    <SubStepFormContext.Provider value={contextValue}>
      <div className="sub-step-form">
        {/* Sub-step indicator */}
        <div className="sub-step-indicator  bg-primary-lighter rounded-lg p-2 mb-6 inline-block">
          <div className="flex items-center gap-4">
            {subSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSubStep(index)}
                className={` p-2 text-center rounded-md transition-all font-medium ${
                  currentSubStep === index
                    ? "bg-primary-light text-white font-medium"
                    : "text-gray hover:bg-gray-200"
                }`}
              >
                {subSteps[index].props.title}
              </button>
            ))}
          </div>
        </div>

        {/* Current sub-step content */}
        <div className="sub-step-content">
          {subSteps[currentSubStep]}
        </div>
      </div>
    </SubStepFormContext.Provider>
  );
};

export default SubStepForm;
