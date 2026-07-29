import KioskStepWizard from "./KioskStepWizard";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";
import * as StepComponents from "./steps";

export default function MinorRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  onFormDataChange,
  loading = false,
}) {
  // Detect the specific minor patient type (fallback prefers manual DOB)
  const patientType = detectPatientType(initialData);

  // Ensure we have the required guardian fields with defaults
  const formDataWithDefaults = {
    ...initialData,
    guardianFirstName: initialData.guardianFirstName || "",
    guardianLastName: initialData.guardianLastName || "",
    guardianPesel: initialData.guardianPesel || "",
    guardianPhoneCode: initialData.guardianPhoneCode || "+48",
    guardianPhone: initialData.guardianPhone || "",
    guardianEmail: initialData.guardianEmail || "",
    guardianRelation: initialData.guardianRelation || "matka",
    consentHealthcareGuardian: !!initialData.consentHealthcareGuardian,
    consentHealthCampaignsGuardian: !!initialData.consentHealthCampaignsGuardian,
    consentMarketingGuardian: !!initialData.consentMarketingGuardian,
    consentExamination: !!initialData.consentExamination,
    consentExaminationGuardian: !!initialData.consentExaminationGuardian,
  };

  return (
    <KioskStepWizard
      patientType={patientType}
      initialData={formDataWithDefaults}
      mode={mode}
      onSubmit={onSubmit}
      onAutoSave={onAutoSave}
      onFormDataChange={onFormDataChange}
      loading={loading}
      stepComponents={StepComponents}
    />
  );
}