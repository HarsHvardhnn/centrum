import MultiStepForm from './components/MultiStepForm';
import Step from './components/MultiStepForm/Step';
import PatientSelectionStep from './components/AppointmentForm/PatientSelectionStep';
import AppointmentDetailsStep from './components/AppointmentForm/AppointmentDetailsStep';
import ConfirmationStep from './components/AppointmentForm/ConfirmationStep';
import PatientStepForm from './components/SubComponentForm/PatientStepForm';

function FormCompTest() {
  const handleFormComplete = (formData) => {
    console.log('Form completed with data:', formData);
    // Submit to API, etc.
  };

  return (
    <div className="relative h-screen bg-gray-100 flex items-center justify-center p-4">
      <MultiStepForm 
        title="Add Appointment" 
        onComplete={handleFormComplete}
        onClose={() => console.log('Modal closed')}
      >
        <Step>
          <PatientSelectionStep />
        </Step>
        <Step>
          <PatientStepForm />
        </Step>
        <Step>
          <ConfirmationStep />
        </Step>
      </MultiStepForm>
    </div>
  );
}


export default FormCompTest;
