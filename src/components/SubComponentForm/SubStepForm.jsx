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
  subStepTitles = [], // Array of sub-step titles for back button text
  isEditMode = false,
  /** Optional content rendered between Back and Next/Save in the footer */
  footerCenter = null,
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

  // Validate current step (in edit mode, document fields are hidden so we don't require them)
  useEffect(() => {
    if (currentSubStep === 0) { // Demographics form
      const fullNameError = !formData.fullName || formData.fullName.trim() === "";
      const isInternational = !!formData.isInternationalPatient;
      const govtIdError = !isInternational && (!formData.govtId || formData.govtId.trim() === "");
      const sexError = !formData.sex;
      const identityDocError = !isEditMode && isInternational && (
        !formData.documentCountry?.trim() ||
        !formData.documentType?.trim() ||
        !formData.documentNumber?.trim() ||
        !formData.documentDateOfBirth
      );
      setHasValidationErrors(fullNameError || govtIdError || sexError || identityDocError);
    } else if (currentSubStep === 1) { // Referrer form
      const doctorError = !formData.consultingDoctor;
      setHasValidationErrors(doctorError);
    } else {
      setHasValidationErrors(false);
    }
  }, [currentSubStep, isEditMode, formData.fullName, formData.govtId, formData.sex, formData.consultingDoctor, formData.isInternationalPatient, formData.documentCountry, formData.documentType, formData.documentNumber, formData.documentDateOfBirth]);

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
          <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-100">
            <button 
              onClick={() => currentSubStep > 0 && goToSubStep(currentSubStep - 1)} 
              disabled={currentSubStep === 0}
              className={`shrink-0 px-4 py-2 rounded ${
                currentSubStep === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Wstecz
            </button>

            {footerCenter}

            <button 
              onClick={() => {
                if (currentSubStep < subSteps.length - 1) {
                  goToSubStep(currentSubStep + 1);
                } else {
                  onComplete();
                }
              }}
              disabled={hasValidationErrors}
              className={`shrink-0 px-4 py-2 rounded ${
                hasValidationErrors
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {currentSubStep === subSteps.length - 1 ? "Zapisz dane pacjenta" : "Następna"}
            </button>
          </div>
        )}
      </div>
    </SubStepFormContext.Provider>
  );
};

export default SubStepForm;