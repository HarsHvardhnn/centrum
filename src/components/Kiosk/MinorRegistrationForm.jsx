import KioskStepWizard from "./KioskStepWizard";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";
import * as StepComponents from "./steps";

export default function MinorRegistrationForm({
  initialData = {},
  mode = "full_registration",
  onSubmit,
  onAutoSave,
  onFormDataChange,
  onEndRegistration,
  loading = false,
}) {
  // Detect the specific minor patient type (fallback prefers manual DOB)
  const patientType = detectPatientType(initialData);

  // Ensure we have the required guardian fields with defaults
  // Contact-step values (phone/email) seed guardian contact when empty
  const is1617 = patientType === PATIENT_TYPES.MINOR_16_17;
  const formDataWithDefaults = {
    ...initialData,
    patientType,
    guardianFirstName: initialData.guardianFirstName || "",
    guardianLastName: initialData.guardianLastName || "",
    guardianPesel: initialData.guardianPesel || "",
    guardianNoPesel: !!initialData.guardianNoPesel,
    guardianDocumentNumber: initialData.guardianDocumentNumber || "",
    guardianDocumentType: initialData.guardianDocumentType || "",
    guardianDocumentCountry: initialData.guardianDocumentCountry || "",
    guardianDocumentIssueDate: initialData.guardianDocumentIssueDate || "",
    guardianDocumentExpiryDate: initialData.guardianDocumentExpiryDate || "",
    guardianPhoneCode: initialData.guardianPhoneCode || initialData.phoneCode || "+48",
    guardianPhone: initialData.guardianPhone || initialData.phone || "",
    guardianEmail: initialData.guardianEmail || initialData.email || "",
    guardianRelation: initialData.guardianRelation || "",
    representationType: initialData.representationType || "",
    // Separate guardian consent fields only for 16–17 (PDF Number 6 dual-consent)
    ...(is1617
      ? {
          consentHealthcareGuardian: !!initialData.consentHealthcareGuardian,
          consentHealthCampaignsGuardian: !!initialData.consentHealthCampaignsGuardian,
          consentMarketingGuardian: !!initialData.consentMarketingGuardian,
          consentExaminationGuardian: !!initialData.consentExaminationGuardian,
        }
      : {}),
    consentExamination: !!initialData.consentExamination,
  };

  return (
    <div className="h-full min-h-0">
      <KioskStepWizard
        patientType={patientType}
        initialData={formDataWithDefaults}
        mode={mode}
        onSubmit={onSubmit}
        onAutoSave={onAutoSave}
        onFormDataChange={onFormDataChange}
        onEndRegistration={onEndRegistration}
        loading={loading}
        stepComponents={StepComponents}
      />
    </div>
  );
}