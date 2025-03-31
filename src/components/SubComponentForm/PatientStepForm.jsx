import { FormProvider } from '../../context/SubStepFormContext';
import SubStepForm from './SubStepForm';
import SubStep from './SubStep';
import DemographicsForm from './DemographicForm';
import ReferrerForm from './ReferrerForm';
import AddressForm from './AddressForm';
import PhotoUpload from './PhotoForm';
import DetailsForm from './DetailsForm';
import NotesForm from './NotesForm';

const PatientStepForm = ({ 
  currentSubStep, 
  goToSubStep, 
  markStepAsCompleted,
  hideButtons = false,
  subStepTitles = []
}) => {
  return (
    <FormProvider>
      <div>
        <SubStepForm
          currentSubStep={currentSubStep}
          goToSubStep={goToSubStep}
          onComplete={markStepAsCompleted}
          hideButtons={hideButtons}
          subStepTitles={subStepTitles}
        >
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