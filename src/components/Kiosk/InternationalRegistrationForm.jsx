import KioskStepWizard from "./KioskStepWizard";
import { PATIENT_TYPES } from "./PatientTypeDetector";
import * as StepComponents from "./steps";

export default function InternationalRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  loading = false,
}) {
  // Ensure we have the required international patient fields
  const formDataWithDefaults = {
    ...initialData,
    isInternationalPatient: true,
    documentCountry: initialData.documentCountry || "",
    documentType: initialData.documentType || "",
    documentNumber: initialData.documentNumber || "",
    dateOfBirth: initialData.dateOfBirth || "",
    consentExamination: initialData.consentExamination !== false,
    // ID document photos
    idPhotoFront: initialData.idPhotoFront || "",
    idPhotoBack: initialData.idPhotoBack || "",
  };

  return (
    <KioskStepWizard
      patientType={PATIENT_TYPES.INTERNATIONAL}
      initialData={formDataWithDefaults}
      mode={mode}
      onSubmit={onSubmit}
      onAutoSave={onAutoSave}
      loading={loading}
      stepComponents={StepComponents}
    />
  );
}