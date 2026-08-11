import { useEffect, useState } from "react";
import PhoneCountrySelect from "../PhoneCountrySelect";
import { validatePhoneNumber, formatPhoneNumber, formatPhoneForDisplay } from "../../../utils/phoneUtils";
import { formatPolishPostalCode, validatePolishPostalCode } from "../../../utils/postalCodeUtils";
import { formatPolishDate } from "../../../utils/dateUtils";
import {
  formatDocumentNumberForDisplay,
  generateDocumentMetadata,
} from "../../../utils/documentNumberUtils";
import { analyzePeselForKiosk, normalizePesel } from "../../../utils/peselUtils";
import PatientDataEditModal from "../PatientDataEditModal";

export default function ConsentsStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
  onGoToStep,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentNumbers, setDocumentNumbers] = useState({});

  // Leave Nr blank on the tablet — final number (with Patient ID) is assigned
  // when the PDF is generated at signing, so we never show a mismatched Nr.
  useEffect(() => {
    const opts = { patientDisplayId: "" };
    setDocumentNumbers({
      gdpr: generateDocumentMetadata("gdpr", opts),
      examination: generateDocumentMetadata("examination", opts),
      authorization: generateDocumentMetadata("authorization", opts),
    });
  }, []);

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleSavePatientData = (editedData) => {
    // Update form data with edited values
    Object.keys(editedData).forEach(key => {
      if (editedData[key] !== formData[key]) {
        updateFormData({ [key]: editedData[key] });
      }
    });
    setShowEditModal(false);
  };

  // Helper function to validate PESEL for authorized persons
  const validateAuthorizedPersonPesel = (pesel, noPesel = false) => {
    if (noPesel) {
      return { valid: true, message: "", type: "success" };
    }

    if (!pesel || pesel.trim() === "") {
      return { valid: false, message: "PESEL jest wymagany", type: "error" };
    }

    const normalized = normalizePesel(pesel);
    
    if (normalized.length !== 11) {
      return { valid: false, message: "PESEL musi mieć dokładnie 11 cyfr", type: "error" };
    }

    const analysis = analyzePeselForKiosk(normalized);
    
    if (!analysis.valid) {
      return { valid: false, message: analysis.message, type: "error" };
    }

    return { valid: true, message: "PESEL jest prawidłowy", type: "success" };
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    if (!formData.consentHealthcare) {
      errors.push("Zgoda na przetwarzanie danych osobowych jest wymagana.");
    }
    
    if (!formData.consentExamination) {
      errors.push("Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego jest wymagana.");
    }

    // Validate authorization choice
    if (!formData.grantsAuthorization && !formData.deniesAuthorization) {
      errors.push("Musisz wybrać czy upoważniasz osoby do dostępu do informacji medycznych czy nie.");
    }

    // Validate authorized persons (only if user chose to grant authorization)
    if (formData.grantsAuthorization && formData.authorizedPersons) {
      formData.authorizedPersons.forEach((person, index) => {
        if (!person.firstName) {
          errors.push(`Imię osoby ${index + 1} jest wymagane.`);
        }
        if (!person.lastName) {
          errors.push(`Nazwisko osoby ${index + 1} jest wymagane.`);
        }
        if (person.noPesel) {
          if (!String(person.documentNumber || "").trim()) {
            errors.push(
              `Numer dokumentu tożsamości osoby ${index + 1} jest wymagany (brak PESEL).`
            );
          }
        } else if (!person.pesel) {
          errors.push(`PESEL osoby ${index + 1} jest wymagany.`);
        } else if (String(person.pesel).replace(/\D/g, "").length !== 11) {
          errors.push(`PESEL osoby ${index + 1} musi mieć 11 cyfr.`);
        }
        if (!person.relationshipToPatient) {
          errors.push(`Stosunek do pacjenta osoby ${index + 1} jest wymagany.`);
        }
        if (!person.phone) {
          errors.push(`Numer telefonu osoby ${index + 1} jest wymagany.`);
        }
        if (!person.address) {
          errors.push(`Adres osoby ${index + 1} jest wymagany.`);
        }
        if (!person.zipCode) {
          errors.push(`Kod pocztowy osoby ${index + 1} jest wymagany.`);
        }
        if (!person.city) {
          errors.push(`Miasto osoby ${index + 1} jest wymagane.`);
        }
      });

      if (formData.authorizedPersons.length === 0) {
        errors.push("Musisz dodać przynajmniej jedną osobę upoważnioną lub wybrać 'NIE UPOWAŻNIAM'.");
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Patient Data Summary Card - For Review/Correction */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900">Sprawdź swoje dane</h4>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="text-sm text-teal-700 hover:text-teal-900 font-medium underline flex items-center gap-1"
          >
            ✏️ Edytuj dane
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Imię i nazwisko:</span>
            <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
          </div>
          {patientType !== 'international' ? (
            <>
              <div>
                <span className="text-gray-600">PESEL:</span>
                <p className="font-medium text-gray-900">{formData.pesel}</p>
              </div>
              <div>
                <span className="text-gray-600">Data urodzenia:</span>
                <p className="font-medium text-gray-900">{formatPolishDate(formData.dateOfBirth)}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-600">Dokument:</span>
                <p className="font-medium text-gray-900">{formData.documentType}: {formData.documentNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Data urodzenia:</span>
                <p className="font-medium text-gray-900">{formatPolishDate(formData.dateOfBirth)}</p>
              </div>
            </>
          )}
          <div>
            <span className="text-gray-600">Adres:</span>
            <p className="font-medium text-gray-900">{formData.street}, {formData.zipCode} {formData.city}</p>
          </div>
          <div>
            <span className="text-gray-600">Telefon:</span>
            <p className="font-medium text-gray-900">{formData.phoneCode} {formData.phone}</p>
          </div>
          {formData.email && (
            <div>
              <span className="text-gray-600">E-mail:</span>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Consent Document */}
      <div className="bg-white border-2 border-teal-300 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">ZGODA NA PRZETWARZANIE DANYCH OSOBOWYCH</h2>
          <div className="text-right text-sm text-gray-600">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.gdpr?.number)}</p>
            <p>Data: {documentNumbers.gdpr?.date || generateDocumentMetadata("gdpr").date}</p>
          </div>
        </div>


        {/* Full Legal Consent Text */}
        <div className="mb-6 text-sm text-gray-800 leading-relaxed">
          <p className="mb-4">
            Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na 
            przetwarzanie moich danych osobowych przez <strong>CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</strong> z 
            siedzibą w Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5, do celów związanych z:
          </p>
        </div>

      <div className="bg-teal-50 rounded-xl p-6 space-y-4 border border-teal-200">
        {/* Consent Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-teal-300 bg-teal-50">
            <input
              type="checkbox"
              checked={!!formData.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-6 h-6 rounded border-gray-400 text-teal-700 focus:ring-teal-500"
            />
            <div className="text-sm">
              <p className="text-gray-700">
                z organizacją udzielanych świadczeń opieki zdrowotnej, w tym prowadzeniem
                dokumentacji medycznej oraz przypomnieniami o terminie wizyty
              </p>
              <p className="text-xs text-teal-800 mt-2 font-medium">WYMAGANE</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
            <input
              type="checkbox"
              checked={!!formData.consentHealthCampaigns}
              onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
              className="mt-1 w-6 h-6 rounded border-gray-400 text-teal-700 focus:ring-teal-500"
            />
            <div className="text-sm">
              <p className="text-gray-700">
                z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
              </p>
              <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
            <input
              type="checkbox"
              checked={!!formData.consentMarketing}
              onChange={(e) => update("consentMarketing", e.target.checked)}
              className="mt-1 w-6 h-6 rounded border-gray-400 text-teal-700 focus:ring-teal-500"
            />
            <div className="text-sm">
              <p className="text-gray-700">
                z otrzymywaniem newslettera z informacjami marketingowymi
              </p>
              <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
            </div>
          </div>

        </div>

      </div>

      {/* Separate Examination Consent Document */}
      <div className="bg-white border-2 border-green-400 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-green-900 mb-2">
            OŚWIADCZENIE PACJENTA o wyrażeniu zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego
          </h2>
          <div className="text-right text-sm text-gray-600">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.examination?.number)}</p>
            <p>Data: {documentNumbers.examination?.date || generateDocumentMetadata("examination").date}</p>
            <p className="text-green-800 font-medium mt-1">WYMAGANE</p>
          </div>
        </div>

        {/* Examination Consent Text */}
        <div className="mb-6 text-sm text-gray-800 leading-relaxed bg-green-50 p-4 rounded-lg">
          <p className="mb-4">
            Wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia
            zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego),
            niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z
            dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.
          </p>
          <p className="mb-4">
            Przyjmuję do wiadomości, że jeżeli planowane świadczenie wiąże się z podwyższonym
            ryzykiem lub wymaga zgody w formie pisemnej na zasadach szczególnych, personel medyczny
            przedstawi mi odrębny dokument zgody bezpośrednio przed jego udzieleniem.
          </p>
        </div>

        {/* Examination Consent Checkbox */}
        <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-green-400 bg-green-50">
          <input
            type="checkbox"
            checked={!!formData.consentExamination}
            onChange={(e) => update("consentExamination", e.target.checked)}
            className="mt-1 w-6 h-6 rounded border-gray-400 text-green-700 focus:ring-green-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-green-900 mb-1">
              Zapoznałem(-am) się z treścią oświadczenia i wyrażam zgodę *
            </p>
            <p className="text-xs text-green-800 mt-2 font-medium">WYMAGANE</p>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-4 text-xs text-gray-600 italic">
          <p>Informuję, że podczas wizyty lekarz może poprosić o wyrażenie dodatkowych zgód, w zależności od rodzaju udzielanego świadczenia zdrowotnego.</p>
        </div>
      </div>

      {/* Optional Third Document: Authorization for Close Person Access */}
      <div className="bg-white border-2 border-purple-300 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-2">
            UPOWAŻNIENIE do uzyskiwania informacji o stanie zdrowia przez osobę bliską
          </h2>
          <div className="text-right text-sm text-gray-600 mb-2">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.authorization?.number)}</p>
            <p>Data: {documentNumbers.authorization?.date || generateDocumentMetadata("authorization").date}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">OPCJONALNE</span>
            <span className="text-gray-600">Możesz pominąć ten dokument</span>
          </div>
        </div>

        {/* Authorization Choice */}
        <div className="mb-6 space-y-4">
          {/* Grant Authorization */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!formData.grantsAuthorization}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    grantsAuthorization: checked,
                    deniesAuthorization: checked ? false : formData.deniesAuthorization,
                    authorizationChoice: checked ? "authorize" : "",
                    authorizedPersons:
                      checked && (!formData.authorizedPersons || formData.authorizedPersons.length === 0)
                        ? [{}]
                        : checked
                          ? formData.authorizedPersons
                          : [],
                  });
                }}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">
                  <strong>UPOWAŻNIAM*</strong> następujące osoby do uzyskiwania informacji o moim stanie zdrowia i udzielonych świadczeniach zdrowotnych oraz uzyskania dokumentacji medycznej przewidzianej zgodnie z prawem dotyczącą mojej osoby:
                </p>
              </div>
            </div>
          </div>

          {/* Deny Authorization */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!formData.deniesAuthorization}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    deniesAuthorization: checked,
                    grantsAuthorization: checked ? false : formData.grantsAuthorization,
                    authorizationChoice: checked ? "none" : "",
                    authorizedPersons: checked ? [] : formData.authorizedPersons,
                  });
                }}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-gray-700 focus:ring-gray-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 mb-1">
                  <strong>NIE UPOWAŻNIAM*</strong> żadnych osób do uzyskiwania informacji o moim stanie zdrowia i udzielonych świadczeniach zdrowotnych
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Persons Form */}
        {formData.grantsAuthorization && formData.authorizedPersons && (
          <div className="space-y-6">
            {formData.authorizedPersons.map((person, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">OSOBA {index + 1}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię *
                    </label>
                    <input
                      type="text"
                      value={person.firstName || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, firstName: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź imię"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      value={person.lastName || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, lastName: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź nazwisko"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {person.noPesel ? "PESEL" : "PESEL *"}
                    </label>
                    <input
                      type="text"
                      value={person.pesel || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = {
                          ...person,
                          pesel: e.target.value.replace(/\D/g, "").slice(0, 11),
                        };
                        update("authorizedPersons", newPersons);
                      }}
                      disabled={!!person.noPesel}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        person.noPesel
                          ? "border-gray-200 bg-gray-100 text-gray-400"
                          : (() => {
                              const validation = validateAuthorizedPersonPesel(
                                person.pesel,
                                person.noPesel
                              );
                              if (!person.pesel) return "border-gray-300";
                              return validation.valid
                                ? "border-green-300"
                                : "border-red-300";
                            })()
                      }`}
                      placeholder="Wprowadź numer PESEL"
                      maxLength="11"
                    />
                    <label className="mt-2 flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!person.noPesel}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = {
                            ...person,
                            noPesel: checked,
                            pesel: checked ? "" : person.pesel,
                            documentNumber: checked ? person.documentNumber || "" : "",
                          };
                          update("authorizedPersons", newPersons);
                        }}
                        className="mt-0.5 w-5 h-5 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Nie posiadam numeru PESEL</span>
                    </label>
                    {person.noPesel ? (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numer dokumentu tożsamości *
                        </label>
                        <input
                          type="text"
                          value={person.documentNumber || ""}
                          onChange={(e) => {
                            const newPersons = [...formData.authorizedPersons];
                            newPersons[index] = {
                              ...person,
                              documentNumber: e.target.value,
                            };
                            update("authorizedPersons", newPersons);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="np. paszport / dowód"
                        />
                      </div>
                    ) : (
                      (() => {
                        const validation = validateAuthorizedPersonPesel(
                          person.pesel,
                          person.noPesel
                        );
                        if (!person.pesel) {
                          return (
                            <p className="text-xs text-gray-600 mt-1">* Wymagane 11 cyfr</p>
                          );
                        }
                        return (
                          <p
                            className={`text-xs mt-1 ${
                              validation.valid ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {validation.message}
                          </p>
                        );
                      })()
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stosunek do pacjenta *
                    </label>
                    <select
                      value={person.relationshipToPatient || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, relationshipToPatient: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Wybierz stosunek</option>
                      <option value="Matka">Matka</option>
                      <option value="Ojciec">Ojciec</option>
                      <option value="Żona">Żona</option>
                      <option value="Mąż">Mąż</option>
                      <option value="Córka">Córka</option>
                      <option value="Syn">Syn</option>
                      <option value="Siostra">Siostra</option>
                      <option value="Brat">Brat</option>
                      <option value="Babcia">Babcia</option>
                      <option value="Dziadek">Dziadek</option>
                      <option value="Partner">Partner</option>
                      <option value="Partnerka">Partnerka</option>
                      <option value="Przyjaciel">Przyjaciel</option>
                      <option value="Przyjaciółka">Przyjaciółka</option>
                      <option value="Kolega">Kolega</option>
                      <option value="Koleżanka">Koleżanka</option>
                      <option value="Współpracownik">Współpracownik</option>
                      <option value="Współpracowniczka">Współpracowniczka</option>
                      <option value="Opiekun">Opiekun</option>
                      <option value="Inne">Inne</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numer telefonu *
                    </label>
                    <div className="flex items-stretch gap-2 w-full">
                      <PhoneCountrySelect
                        value={person.phoneCode || "+48"}
                        onChange={(code) => {
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = { ...person, phoneCode: code, phone: "" };
                          update("authorizedPersons", newPersons);
                        }}
                        className="w-[7.5rem] sm:w-36 shrink-0"
                        buttonClassName="w-full h-12 border border-gray-300 rounded-lg px-2 sm:px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                      />
                      <input
                        type="tel"
                        value={formatPhoneForDisplay(person.phone || "", person.phoneCode || "+48")}
                        onChange={(e) => {
                          const phoneCode = person.phoneCode || "+48";
                          const cleaned = formatPhoneNumber(e.target.value);
                          const maxLength = validatePhoneNumber("", phoneCode).maxLength;
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = { ...person, phone: cleaned.slice(0, maxLength) };
                          update("authorizedPersons", newPersons);
                        }}
                        className={`flex-1 min-w-0 h-12 px-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          person.phone && !validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").valid 
                            ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={(person.phoneCode || "+48") === "+48" ? "123 456 789" : `${validatePhoneNumber("", person.phoneCode || "+48").maxLength} cyfr`}
                        maxLength={validatePhoneNumber("", person.phoneCode || "+48").maxLength + 2}
                      />
                    </div>
                    {person.phone && !validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").valid && (
                      <p className="text-xs text-red-600 mt-1">
                        {validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").message}
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres (ulica i numer) *
                    </label>
                    <input
                      type="text"
                      value={person.address || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, address: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź ulicę i numer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kod pocztowy *
                    </label>
                    <input
                      type="text"
                      value={person.zipCode || ""}
                      onChange={(e) => {
                        const formatted = formatPolishPostalCode(e.target.value);
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, zipCode: formatted };
                        update("authorizedPersons", newPersons);
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        person.zipCode && !validatePolishPostalCode(person.zipCode) 
                          ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="00-000"
                      maxLength="6"
                    />
                    {person.zipCode && !validatePolishPostalCode(person.zipCode) && (
                      <p className="text-xs text-red-600 mt-1">
                        Kod pocztowy powinien mieć format XX-XXX (np. 00-001)
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miasto *
                    </label>
                    <input
                      type="text"
                      value={person.city || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, city: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź miasto (np. Warszawa, Kraków)"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Another Person Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  const newPersons = [...(formData.authorizedPersons || []), {}];
                  update("authorizedPersons", newPersons);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                👥 Dodaj kolejną osobę
              </button>
            </div>
          </div>
        )}

        {/* Legal Notice */}
        {(formData.grantsAuthorization || formData.deniesAuthorization) && (
          <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg leading-relaxed">
            <p className="mb-2">
              <strong>Pouczenie oświadczam,</strong> iż zostałem(-am) poinformowany(-a) o możliwości cofnięcia udzielonego upoważnienia w każdym czasie oraz o tym, że dane osobowe osób upoważnionych są przetwarzane wyłącznie w celu realizacji uprawnień wynikających z niniejszego oświadczenia.
            </p>
          </div>
        )}

        {/* Information when no choice made */}
        {!formData.grantsAuthorization && !formData.deniesAuthorization && (
          <div className="text-center text-blue-600 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">
              ℹ️ Wybierz jedną z opcji powyżej aby kontynuować
            </p>
          </div>
        )}
      </div>
      </div>

      {/* Patient Data Edit Modal */}
      <PatientDataEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        onSave={handleSavePatientData}
        patientType={patientType}
        mode={mode}
      />
    </div>
  );
}