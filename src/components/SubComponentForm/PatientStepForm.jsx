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
  currentPatientId = null
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
        <SubStep title="Dane Podstawowe">
          <DemographicsForm />
        </SubStep>
        <SubStep title="Skierowanie">
          <ReferrerForm />
        </SubStep>
        <SubStep title="Adres">
          <AddressForm />
        </SubStep>
        <SubStep title="Zgody">
          <ConsentDocumentUpload currentPatientId={currentPatientId} />
        </SubStep>
        <SubStep title="Szczegóły">
          <DetailsForm />
        </SubStep>
        <SubStep title="Notatki">
          <NotesForm />
        </SubStep>
      </SubStepForm>
    </div>
  );
};

export default PatientStepForm;
