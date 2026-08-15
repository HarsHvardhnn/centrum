import KioskStepWizard from "./KioskStepWizard";
import { PATIENT_TYPES } from "./PatientTypeDetector";
import * as StepComponents from "./steps";

export default function AdultRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  onFormDataChange,
  loading = false,
}) {
  // Prefer detected type (fallback DOB can mark minor; parent switches form when that happens)
  const patientType = initialData.isInternationalPatient
    ? PATIENT_TYPES.INTERNATIONAL
    : PATIENT_TYPES.ADULT;

  return (
    <div className="h-full min-h-0">
      <KioskStepWizard
        patientType={patientType}
        initialData={initialData}
        mode={mode}
        onSubmit={onSubmit}
        onAutoSave={onAutoSave}
        onFormDataChange={onFormDataChange}
        loading={loading}
        stepComponents={StepComponents}
      />
    </div>
  );
}