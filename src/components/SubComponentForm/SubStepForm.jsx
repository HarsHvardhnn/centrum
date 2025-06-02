import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useFormContext } from "../../context/SubStepFormContext";

export const SubStepFormContext = createContext(null);

export const useSubStepForm = () => {
  const context = useContext(SubStepFormContext);
  if (!context) {
    throw new Error("useSubStepForm must be used within a SubStepFormProvider");
  }
  return context;
};

const SubStepForm = ({ 
  children, 
  currentSubStep, 
  goToSubStep, 
  onComplete,
  hideButtons = false, // Prop to optionally hide navigation buttons
  subStepTitles = [] // Array of sub-step titles for back button text
}) => {
  const { formData } = useFormContext();
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const subSteps = useMemo(() => Array.isArray(children) ? children : [children], [children]);
    // Extract sub-step titles from children if not provided
  useEffect(() => {
    if (subStepTitles.length === 0 && subSteps.length > 0) {
      const extractedTitles = subSteps.map(step => step.props.title || "Untitled");
    }
  }, [subSteps, subStepTitles]);

  // Validate current step
  useEffect(() => {
    if (currentSubStep === 0) { // Demographics form
      const emailError = formData.email ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) : false;
      const phoneError = formData.mobileNumber ? !/^\d{9}$/.test(formData.mobileNumber) : false;
      const dateError = !formData.dateOfBirth;
      const sexError = !formData.sex;
      setHasValidationErrors(emailError || phoneError || dateError || sexError);
    } else if (currentSubStep === 1) { // Referrer form
      const doctorError = !formData.consultingDoctor;
      setHasValidationErrors(doctorError);
    } else {
      setHasValidationErrors(false);
    }
  }, [currentSubStep, formData.email, formData.mobileNumber, formData.dateOfBirth, formData.sex, formData.consultingDoctor]);

  const getPreviousButtonText = () => {
    if (currentSubStep > 0) {
      const prevSubStepTitle = subStepTitles[currentSubStep - 1] || 
                              (subSteps[currentSubStep - 1]?.props.title || "Poprzedni");
      return `Wróć do ${prevSubStepTitle}`;
    }
    return "Poprzedni";
  };

  return (
    <SubStepFormContext.Provider value={{ currentSubStep }}>
      <div className="sub-step-form">
        <div className="sub-step-indicator bg-primary-lighter rounded-lg p-2 mb-6 inline-block">
          <div className="flex items-center gap-4">
            {subSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => !hasValidationErrors && goToSubStep(index)}
                className={`p-2 text-center rounded-md transition-all font-medium ${
                  currentSubStep === index
                    ? "bg-primary-light text-white font-medium"
                    : hasValidationErrors
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray hover:bg-gray-200"
                }`}
                disabled={hasValidationErrors}
              >
                {subSteps[index].props.title}
              </button>
            ))}
          </div>
        </div>

        <div className="sub-step-content">
          {subSteps[currentSubStep]}
        </div>

        {/* Show navigation buttons only if hideButtons is false */}
        {!hideButtons && (
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => currentSubStep > 0 && goToSubStep(currentSubStep - 1)} 
              disabled={currentSubStep === 0}
              className={`px-4 py-2 rounded ${
                currentSubStep === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {getPreviousButtonText()}
            </button>
            <button 
              onClick={() => {
                if (currentSubStep < subSteps.length - 1) {
                  goToSubStep(currentSubStep + 1);
                } else {
                  onComplete();
                }
              }}
              disabled={hasValidationErrors}
              className={`px-4 py-2 rounded ${
                hasValidationErrors
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {currentSubStep === subSteps.length - 1 ? "Zakończ rejestrację" : "Następna"}
            </button>
          </div>
        )}
      </div>
    </SubStepFormContext.Provider>
  );
};

export default SubStepForm;