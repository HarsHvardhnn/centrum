import { useState } from "react";
import MultiStepForm from "../../MultiStepForm";
import Step from "../../MultiStepForm/Step";
import PatientStepForm from "../../SubComponentForm/PatientStepForm";

function AppointmentFormModal({ onClose, onComplete, doctorId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [totalSubSteps, setTotalSubSteps] = useState(6);
  const [completedSteps, setCompletedSteps] = useState({});
  const [formData, setFormData] = useState({
    doctorId: doctorId,
    patientId: null,
    patientName: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "",
    notes: "",
    isNewPatient: false,
    patientDetails: {},
  });

  // Define sub-step titles for back button text
  const subStepTitles = [
    "Demographics",
    "Referrer",
    "Address",
    "Photo",
    "Details",
    "Notes",
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
    // If we're on the last step, complete the form
    if (currentStep === steps.length - 1) {
      onComplete(formData);
      return;
    }

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

  // Handle form data updates
  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      isNewPatient: false,
    }));
    markStepAsCompleted(0);
  };

  // Handle new patient option
  const handleNewPatient = () => {
    setFormData((prev) => ({
      ...prev,
      patientId: null,
      isNewPatient: true,
    }));
    markStepAsCompleted(0);
    // Optionally auto-advance to next step
    nextStep();
  };

  // Handle patient details update
  const handlePatientDetailsUpdate = (details) => {
    setFormData((prev) => ({
      ...prev,
      patientDetails: {
        ...prev.patientDetails,
        ...details,
      },
    }));
  };

  // Handle appointment details update
  const handleAppointmentDetailsUpdate = (details) => {
    setFormData((prev) => ({
      ...prev,
      ...details,
    }));
    markStepAsCompleted(2);
  };

  return (
    <MultiStepForm
      title="Add Appointment"
      onComplete={() => onComplete(formData)}
      onClose={onClose}
      currentStep={currentStep}
      nextStep={nextStep}
      prevStep={prevStep}
      goToStep={goToStep}
      steps={steps}
      setSteps={setSteps}
      currentSubStep={currentSubStep}
      totalSubSteps={totalSubSteps}
      subStepTitles={subStepTitles}
      handleSubStepNavigation={handleSubStepNavigation}
    >
      {/* <Step>
        <PatientSelectionStep
          onPatientSelect={handlePatientSelect}
          onNewPatient={handleNewPatient}
          markStepAsCompleted={() => markStepAsCompleted(0)}
        />
      </Step> */}
      <Step>
        <PatientStepForm
          currentSubStep={currentSubStep}
          goToSubStep={goToSubStep}
          onUpdateDetails={handlePatientDetailsUpdate}
          markStepAsCompleted={() => markStepAsCompleted(1)}
          hideButtons={true} // Hide the sub-step form's own buttons
          subStepTitles={subStepTitles} // Pass down sub-step titles
        />
      </Step>
      {/* <Step>
        <AppointmentDetailsStep
          doctorId={doctorId}
          onUpdateDetails={handleAppointmentDetailsUpdate}
          markStepAsCompleted={() => markStepAsCompleted(2)}
        />
      </Step> */}
    </MultiStepForm>
  );
}

export default AppointmentFormModal;
