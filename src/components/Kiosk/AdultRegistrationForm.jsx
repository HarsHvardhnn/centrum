import KioskStepWizard from "./KioskStepWizard";
import { PATIENT_TYPES } from "./PatientTypeDetector";
import * as StepComponents from "./steps";

export default function AdultRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  loading = false,
}) {
  // Determine if this is an international patient
  const patientType = initialData.isInternationalPatient ? PATIENT_TYPES.INTERNATIONAL : PATIENT_TYPES.ADULT;

  return (
    <KioskStepWizard
      patientType={patientType}
      initialData={initialData}
      mode={mode}
      onSubmit={onSubmit}
      onAutoSave={onAutoSave}
      loading={loading}
      stepComponents={StepComponents}
    />
  );
}