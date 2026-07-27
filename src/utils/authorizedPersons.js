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

function splitFullName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function contactFieldsToAuthorizedPersons(patient = {}) {
  const persons = [];
  const addLegacyPerson = (prefix) => {
    const name = patient[`${prefix}Name`];
    const pesel = patient[`${prefix}Pesel`];
    const phone = patient[`${prefix}Phone`];
    const address = patient[`${prefix}Address`];
    if (!name && !pesel && !phone && !address) return;
    const { firstName, lastName } = splitFullName(name || "");
    persons.push({
      firstName,
      lastName,
      pesel: String(pesel || "").replace(/\D/g, "").slice(0, 11),
      phoneCode: patient[`${prefix}PhoneCode`] || "+48",
      phone: String(phone || "").replace(/\D/g, "").slice(0, 15),
      street: String(address || "").trim(),
      zipCode: "",
      city: "",
    });
  };
  addLegacyPerson("contactPerson1");
  addLegacyPerson("contactPerson2");
  return persons;
}

export function mapPatientAuthorizationFields(patient = {}) {
  if (patient.authorizedPersons?.length) {
    return {
      authorizationChoice: patient.authorizationChoice || "authorize",
      authorizedPersons: patient.authorizedPersons.map((person) => ({
        ...EMPTY_AUTHORIZED_PERSON(),
        ...person,
        street: person.street || person.address || "",
        phoneCode: person.phoneCode || "+48",
      })),
    };
  }
  const persons = contactFieldsToAuthorizedPersons(patient);
  return {
    authorizationChoice: patient.authorizationChoice || (persons.length ? "authorize" : ""),
    authorizedPersons: persons.length ? persons : [EMPTY_AUTHORIZED_PERSON()],
  };
}

export function isAuthorizationDocument(doc) {
  if (!doc) return false;
  if (doc.kioskDocumentType === "auth_health_status") return true;
  return /^upowaznienie-/i.test(doc.fileName || doc.originalName || doc.name || "");
}
