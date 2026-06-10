export const VOIVODESHIPS = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
];

export function validateVerificationStep(form) {
  const errors = [];
  if (form.isInternationalPatient) {
    if (!form.documentCountry?.trim()) errors.push("Kraj wydania dokumentu jest wymagany.");
    if (!form.documentType?.trim()) errors.push("Typ dokumentu jest wymagany.");
    if (!form.documentNumber?.trim()) errors.push("Numer dokumentu jest wymagany.");
    if (!form.dateOfBirth) errors.push("Data urodzenia jest wymagana.");
  } else if (!form.pesel || String(form.pesel).replace(/\D/g, "").length !== 11) {
    errors.push("PESEL musi mieć 11 cyfr.");
  }
  return errors;
}

export function validatePersonalStep(form) {
  const errors = [];
  if (!form.firstName?.trim()) errors.push("Imię jest wymagane.");
  if (!form.lastName?.trim()) errors.push("Nazwisko jest wymagane.");
  if (!form.sex?.trim()) errors.push("Płeć jest wymagana.");
  if (form.isInternationalPatient && !form.dateOfBirth) {
    errors.push("Data urodzenia jest wymagana.");
  }
  return errors;
}

export function validateAddressStep(form) {
  const errors = [];
  if (!form.street?.trim()) errors.push("Ulica jest wymagana.");
  if (!form.zipCode?.trim()) errors.push("Kod pocztowy jest wymagany.");
  if (!form.city?.trim()) errors.push("Miejscowość jest wymagana.");
  if (!form.province?.trim()) errors.push("Województwo jest wymagane.");
  return errors;
}

export function validateContactStep(form) {
  const errors = [];
  if (!form.phone?.trim()) errors.push("Numer telefonu jest wymagany.");
  else {
    const digits = form.phone.replace(/\D/g, "");
    if (form.isInternationalPatient) {
      if (digits.length < 6 || digits.length > 15) {
        errors.push("Podaj prawidłowy numer telefonu (6–15 cyfr).");
      }
    } else if (!/^[0-9]{9}$/.test(digits)) {
      errors.push("Numer telefonu musi składać się z 9 cyfr.");
    }
  }
  return errors;
}

export function validateConsentsStep(form) {
  const errors = [];
  if (!form.consentHealthcare) {
    errors.push("Zgoda na organizację świadczeń opieki zdrowotnej jest wymagana.");
  }
  if (!form.consentExamination) {
    errors.push("Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego jest wymagana.");
  }
  if (!form.authorizationChoice) {
    errors.push("Wybierz opcję upoważnienia osoby bliskiej lub oświadczenie o braku upoważnienia.");
  }
  if (form.authorizationChoice === "authorize") {
    const persons = form.authorizedPersons || [];
    if (!persons.length) {
      errors.push("Dodaj co najmniej jedną upoważnioną osobę.");
    }
    persons.forEach((p, i) => {
      if (!p.firstName?.trim()) errors.push(`Osoba ${i + 1}: imię jest wymagane.`);
      if (!p.lastName?.trim()) errors.push(`Osoba ${i + 1}: nazwisko jest wymagane.`);
      if (!p.pesel?.trim() || p.pesel.replace(/\D/g, "").length !== 11) {
        errors.push(`Osoba ${i + 1}: PESEL musi mieć 11 cyfr.`);
      }
      if (!p.phone?.trim()) errors.push(`Osoba ${i + 1}: telefon jest wymagany.`);
      if (!p.street?.trim()) errors.push(`Osoba ${i + 1}: adres jest wymagany.`);
      if (!p.zipCode?.trim()) errors.push(`Osoba ${i + 1}: kod pocztowy jest wymagany.`);
      if (!p.city?.trim()) errors.push(`Osoba ${i + 1}: miasto jest wymagane.`);
    });
  }
  return errors;
}
