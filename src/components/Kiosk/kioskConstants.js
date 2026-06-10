export const KIOSK_STEPS = {
  PIN: "pin",
  PESEL: "pesel",
  PERSONAL: "personal",
  ADDRESS: "address",
  CONTACT: "contact",
  CONSENTS: "consents",
  SIGNATURE: "signature",
  DONE: "done",
};

export const STEP_ORDER_FULL = [
  KIOSK_STEPS.PESEL,
  KIOSK_STEPS.PERSONAL,
  KIOSK_STEPS.ADDRESS,
  KIOSK_STEPS.CONTACT,
  KIOSK_STEPS.CONSENTS,
  KIOSK_STEPS.SIGNATURE,
];

export const STEP_LABELS = {
  [KIOSK_STEPS.PESEL]: "Weryfikacja",
  [KIOSK_STEPS.PERSONAL]: "Dane osobowe",
  [KIOSK_STEPS.ADDRESS]: "Adres zamieszkania",
  [KIOSK_STEPS.CONTACT]: "Dane kontaktowe",
  [KIOSK_STEPS.CONSENTS]: "Zgody",
  [KIOSK_STEPS.SIGNATURE]: "Podpis",
};

export const CONSENT_TEXT = {
  healthcare:
    "z organizacją udzielanych świadczeń opieki zdrowotnej (w tym przypomnienie o wizycie)",
  healthCampaigns: "z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych",
  marketing: "z otrzymywaniem newslettera z informacjami marketingowymi",
  sms: "Wyrażam zgodę na otrzymywanie powiadomień SMS i e-mail dotyczących mojej wizyty (np. przypomnienia, zmiany terminu).",
  examinationAck:
    "Zapoznałem(-am) się z treścią oświadczenia i wyrażam zgodę",
};

export const DOCUMENT_TYPES = [
  { value: "", label: "Wybierz" },
  { value: "Passport", label: "Paszport" },
  { value: "ID Card", label: "Dowód osobisty" },
  { value: "Residence Card", label: "Karta pobytu" },
  { value: "Other", label: "Inny" },
];

export const EMPTY_AUTHORIZED_PERSON = () => ({
  firstName: "",
  lastName: "",
  pesel: "",
  phoneCode: "+48",
  phone: "",
  street: "",
  zipCode: "",
  city: "",
});

export function buildInternationalDocumentKey(form) {
  const country = form.documentCountry?.trim();
  const type = form.documentType?.trim();
  const number = form.documentNumber?.trim();
  if (!country || !type || !number) return "";
  return [country, type, number].join("|");
}

export function createDefaultKioskForm(initial = {}) {
  return {
    isInternationalPatient: false,
    documentCountry: "",
    documentType: "",
    documentNumber: "",
    internationalPatientDocumentKey: "",
    npesei: "",
    pesel: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    street: "",
    zipCode: "",
    city: "",
    province: "",
    phoneCode: "+48",
    phone: "",
    email: "",
    sex: "",
    consentHealthcare: false,
    consentHealthCampaigns: false,
    consentMarketing: false,
    consentExamination: false,
    authorizationChoice: "",
    authorizedPersons: [EMPTY_AUTHORIZED_PERSON()],
    documentScans: [],
    signature: "",
    ...initial,
  };
}

export function formatKioskAddress(form) {
  const parts = [form.street, form.zipCode, form.city].filter(Boolean);
  return parts.join(", ");
}

export function formatKioskDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("pl-PL");
}

export function syncSmsConsentFromHealthcare(form) {
  const key = form.isInternationalPatient ? buildInternationalDocumentKey(form) : "";
  return {
    ...form,
    smsConsentAgreed: form.consentHealthcare === true,
    ...(form.isInternationalPatient && key ? { internationalPatientDocumentKey: key } : {}),
  };
}

export function formatKioskDocumentLabel(form) {
  if (!form.isInternationalPatient) return null;
  const typeLabel = DOCUMENT_TYPES.find((t) => t.value === form.documentType)?.label || form.documentType;
  return [typeLabel, form.documentNumber].filter(Boolean).join(" · ");
}
