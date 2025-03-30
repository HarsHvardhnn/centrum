
// components/AppointmentForm/PatientSelectionStep.jsx
import { FormProvider } from '../../context/SubStepFormContext';
import SubStepForm from './SubStepForm';
import SubStep from './SubStep';
import DemographicsForm from './DemographicForm';
import ReferrerForm from './ReferrerForm';
import AddressForm from './AddressForm';
import PhotoUpload from './PhotoForm';
import DetailsForm from './DetailsForm';
import NotesForm from './NotesForm';

const PatientStepForm = () => {
  return (
    <FormProvider>
      <div>
        <SubStepForm>
          <SubStep title="Demographics">
            <DemographicsForm />
          </SubStep>
          <SubStep title="Referrer">
            <ReferrerForm />
          </SubStep>
          <SubStep title="Address">
            <AddressForm />
          </SubStep>
          <SubStep title="Photo">
            <PhotoUpload />
          </SubStep>
          <SubStep title="Details">
            <DetailsForm />
          </SubStep>
          <SubStep title="Notes">
            <NotesForm />
          </SubStep>
        </SubStepForm>
      </div>
    </FormProvider>
  );
};

export default PatientStepForm;
