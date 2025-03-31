import MultiStepForm from "./components/MultiStepForm";
import Step from "./components/MultiStepForm/Step";
import PatientSelectionStep from "./components/AppointmentForm/PatientSelectionStep";
import PatientStepForm from "./components/SubComponentForm/PatientStepForm";
import { useState, useEffect } from "react";

function FormCompTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [totalSubSteps, setTotalSubSteps] = useState(6); // Assuming 6 sub-steps based on your code
  const [completedSteps, setCompletedSteps] = useState({}); // Track step completion
  
  // Define sub-step titles for back button text
  const subStepTitles = [
    "Demographics", 
    "Referrer", 
    "Address", 
    "Photo", 
    "Details", 
    "Notes"
  ];

  // Determine if we're handling sub-steps (when on the PatientStepForm)
  const handleSubStepNavigation = currentStep === 1;

  // Function to mark a step as completed
  const markStepAsCompleted = (stepIndex) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepIndex]: true,
    }));
  };

  const isStepCompleted = (stepIndex) => completedSteps[stepIndex] || false;

  // Combined navigation function that handles both main steps and sub-steps
  const nextStep = () => {
    // Handle sub-step navigation when on the PatientStepForm step
    if (handleSubStepNavigation) {
      // If not on the last sub-step, move to next sub-step
      if (currentSubStep < totalSubSteps - 1) {
        setCurrentSubStep(currentSubStep + 1);
      } 
      // If on the last sub-step, mark current step as complete and move to next main step
      else {
        markStepAsCompleted(currentStep);
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setCurrentSubStep(0);
        }
      }
    } 
    // Regular main step navigation
    else {
      if (currentStep < steps.length - 1) {
        markStepAsCompleted(currentStep);
        setCurrentStep(currentStep + 1);
        setCurrentSubStep(0);
      }
    }
  };

  const prevStep = () => {
    // Handle sub-step navigation when on the PatientStepForm step
    if (handleSubStepNavigation && currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } 
    // Regular main step navigation
    else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // If moving back to PatientStepForm from a later step, restore the last sub-step
      if (currentStep - 1 === 1) {
        // You could either start at the beginning or remember the last sub-step
        // For simplicity, we're starting at the beginning here
        setCurrentSubStep(0);
      }
    }
  };

  const goToStep = (step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      // Reset sub-step when navigating directly to a main step
      setCurrentSubStep(0);
    }
  };

  // Function for PatientStepForm to use for navigating to a specific sub-step
  const goToSubStep = (subStep) => {
    if (subStep >= 0 && subStep < totalSubSteps) {
      setCurrentSubStep(subStep);
    }
  };

  return (
    <div className="relative">
      <MultiStepForm
        title="Add Appointment"
        onComplete={(data) => console.log("Form Completed", data)}
        onClose={() => console.log("Modal closed")}
        currentStep={currentStep}
        nextStep={nextStep}
        prevStep={prevStep}
        goToStep={goToStep}
        steps={steps}
        setSteps={setSteps}
        // Pass sub-step related props
        currentSubStep={currentSubStep}
        totalSubSteps={totalSubSteps}
        subStepTitles={subStepTitles} // Pass sub-step titles for back button text
        handleSubStepNavigation={handleSubStepNavigation}
      >
        <Step>
          <PatientSelectionStep markStepAsCompleted={() => markStepAsCompleted(0)} />
        </Step>
        <Step>
          <PatientStepForm
            currentSubStep={currentSubStep}
            goToSubStep={goToSubStep}
            markStepAsCompleted={() => markStepAsCompleted(1)}
            hideButtons={true} // Hide the sub-step form's own buttons
            subStepTitles={subStepTitles} // Pass down sub-step titles
          />
        </Step>
      </MultiStepForm>
    </div>
  );
}

export default FormCompTest;