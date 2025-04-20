import SubStepForm from "./SubStepForm";
import SubStep from "./SubStep";
import DemographicsForm from "./DemographicForm";
import ReferrerForm from "./ReferrerForm";
import AddressForm from "./AddressForm";
import PhotoUpload from "./PhotoForm";
import DetailsForm from "./DetailsForm";
import NotesForm from "./NotesForm";
import ConsentDocumentUpload from "./PhotoForm";

const PatientStepForm = ({
  currentSubStep,
  goToSubStep,
  markStepAsCompleted,
  hideButtons = false,
  subStepTitles = [],
}) => {
  return (
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
          <ConsentDocumentUpload />
        </SubStep>
        <SubStep title="Details">
          <DetailsForm />
        </SubStep>
        <SubStep title="Notes">
          <NotesForm />
        </SubStep>
      </SubStepForm>
    </div>
  );
};

export default PatientStepForm;
