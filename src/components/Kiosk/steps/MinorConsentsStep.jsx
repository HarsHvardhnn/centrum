import { useEffect, useState } from "react";
import { PATIENT_TYPES } from "../PatientTypeDetector";
import { PHONE_COUNTRY_CODES } from "../../../constants/phoneCountryCodes";
import { validatePhoneNumber, formatPhoneNumber, formatPhoneForDisplay } from "../../../utils/phoneUtils";
import { formatPolishPostalCode, validatePolishPostalCode } from "../../../utils/postalCodeUtils";
import { formatPolishDate } from "../../../utils/dateUtils";
import { generateDocumentMetadata } from "../../../utils/documentNumberUtils";
import { analyzePeselForKiosk, normalizePesel } from "../../../utils/peselUtils";
import PatientDataEditModal from "../PatientDataEditModal";

export default function MinorConsentsStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
  onGoToStep,
}) {
  const requiresPatientConsent = patientType === PATIENT_TYPES.MINOR_16_17;
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentNumbers, setDocumentNumbers] = useState({});

  // Generate document numbers when component mounts
  useEffect(() => {
    console.log('Generating document numbers for minor...');
    const numbers = {
      gdpr: generateDocumentMetadata('gdpr'),
      examination: generateDocumentMetadata('examination'),
      authorization: generateDocumentMetadata('authorization')
    };
    console.log('Generated document numbers for minor:', numbers);
    setDocumentNumbers(numbers);
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
  const validateAuthorizedPersonPesel = (pesel) => {
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
    
    // Check required consents based on patient type
    if (patientType === PATIENT_TYPES.MINOR_UNDER_16) {
      // Only guardian consent required for under 16
      if (!formData.consentHealthcare) {
        errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
      }
    } else if (patientType === PATIENT_TYPES.MINOR_16_17) {
      // Both patient AND guardian consent required for 16-17
      if (!formData.consentHealthcare) {
        errors.push("Zgoda pacjenta na przetwarzanie danych osobowych jest wymagana.");
      }
      if (!formData.consentHealthcareGuardian) {
        errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
      }
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
        if (!person.pesel) {
          errors.push(`PESEL osoby ${index + 1} jest wymagany.`);
        } else if (person.pesel.length !== 11) {
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
  }, [formData, patientType, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Complete Patient & Guardian Data Summary Card - For Review/Correction */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-900">Sprawdź dane pacjenta i opiekuna</h4>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="text-sm text-teal-700 hover:text-teal-900 font-medium underline flex items-center gap-1"
          >
            ✏️ Edytuj dane
          </button>
        </div>
        
        {/* Patient Data */}
        <div className="mb-4">
          <h5 className="font-medium text-blue-900 mb-2">Dane pacjenta:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-blue-50 p-3 rounded-lg">
            <div>
              <span className="text-blue-700">Pacjent:</span>
              <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <span className="text-blue-700">PESEL:</span>
              <p className="font-medium">{formData.pesel}</p>
            </div>
            <div>
              <span className="text-blue-700">Adres:</span>
              <p className="font-medium">{formData.street}, {formData.zipCode} {formData.city}</p>
            </div>
          </div>
        </div>

        {/* Guardian Data */}
        <div>
          <h5 className="font-medium text-yellow-900 mb-2">Dane opiekuna prawnego:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-yellow-50 p-3 rounded-lg">
            <div>
              <span className="text-yellow-700">Opiekun:</span>
              <p className="font-medium">{formData.guardianFirstName} {formData.guardianLastName}</p>
            </div>
            <div>
              <span className="text-yellow-700">Stosunek:</span>
              <p className="font-medium">{formData.guardianRelation}</p>
            </div>
            <div>
              <span className="text-yellow-700">PESEL opiekuna:</span>
              <p className="font-medium">{formData.guardianPesel}</p>
            </div>
            <div>
              <span className="text-yellow-700">Telefon:</span>
              <p className="font-medium">{formData.guardianPhoneCode} {formData.guardianPhone}</p>
            </div>
            {formData.guardianEmail && (
              <div>
                <span className="text-yellow-700">E-mail:</span>
                <p className="font-medium">{formData.guardianEmail}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Consent Document for Minor */}
      <div className="bg-white border-2 border-blue-300 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">ZGODA NA PRZETWARZANIE DANYCH OSOBOWYCH</h2>
          <p className="text-sm text-blue-800 font-medium">
            {patientType === PATIENT_TYPES.MINOR_16_17 ? "PACJENT NIEPEŁNOLETNI 16-17 LAT" : "PACJENT NIEPEŁNOLETNI PONIŻEJ 16 LAT"}
          </p>
          <div className="text-right text-sm text-gray-600 mt-2">
            <p>Nr: {(() => {
              try {
                return documentNumbers.gdpr?.number || generateDocumentMetadata('gdpr').number;
              } catch (e) {
                console.error('Error generating GDPR document number:', e);
                return `RODO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900000) + 100000)}`;
              }
            })()}</p>
            <p>Data: {(() => {
              try {
                return documentNumbers.gdpr?.date || generateDocumentMetadata('gdpr').date;
              } catch (e) {
                const now = new Date();
                return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
              }
            })()}</p>
          </div>
        </div>


        {/* Guardian Data Section */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="font-semibold text-yellow-900 mb-3">DANE OPIEKUNA PRAWNEGO</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-yellow-700">IMIĘ I NAZWISKO</strong>
              <p className="font-semibold">{formData.guardianFirstName} {formData.guardianLastName}</p>
            </div>
            <div>
              <strong className="text-yellow-700">NR PESEL</strong>
              <p className="font-semibold">{formData.guardianPesel}</p>
            </div>
            <div>
              <strong className="text-yellow-700">STOSUNEK POKREWIEŃSTWA</strong>
              <p className="font-semibold">{formData.guardianRelation}</p>
            </div>
            <div>
              <strong className="text-yellow-700">NUMER TELEFONU</strong>
              <p className="font-semibold">{formData.guardianPhoneCode} {formData.guardianPhone}</p>
            </div>
            {formData.guardianEmail && (
              <div>
                <strong className="text-yellow-700">ADRES E-MAIL</strong>
                <p className="font-semibold">{formData.guardianEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full Legal Consent Text for Minors */}
        <div className="mb-6 text-sm text-gray-800 leading-relaxed">
          <p className="mb-4">
            {patientType === PATIENT_TYPES.MINOR_16_17 ? (
              <>Ja niżej podpisana(-ny) jako pacjent w wieku 16-17 lat oraz niżej podpisany(-na) opiekun prawny oświadczamy, że zapoznaliśmy się z Klauzulą Informacyjną RODO i wyrażamy zgodę na przetwarzanie danych osobowych przez </>
            ) : (
              <>Ja niżej podpisany(-na) jako opiekun prawny pacjenta niepełnoletniego poniżej 16. roku życia oświadczam, że zapoznałem(-am) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych mojego dziecka przez </>
            )}
            <strong>CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</strong> z siedzibą w Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5, do celów związanych z:
          </p>
        </div>

      </div>

      {/* Age Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-lg">👶</span>
          <div>
            <p className="font-medium">
              {patientType === PATIENT_TYPES.MINOR_UNDER_16 
                ? "Pacjent poniżej 16 roku życia"
                : "Pacjent 16-17 lat"
              }
            </p>
            <p>
              {patientType === PATIENT_TYPES.MINOR_UNDER_16
                ? "Wymagana jest tylko zgoda opiekuna prawnego."
                : "Wymagane są zgody zarówno pacjenta jak i opiekuna prawnego."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Patient Consent Block (only for 16-17 year olds) */}
      {requiresPatientConsent && (
        <div className="bg-blue-50 rounded-lg p-6 space-y-3 border border-blue-200">
          <h4 className="font-semibold text-blue-900">Blok A - Zgoda pacjenta (16-17 lat)</h4>
          <div className="text-sm text-blue-800 mb-3 p-3 bg-white rounded-lg border border-blue-100">
            „Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO 
            i wyrażam zgodę na przetwarzanie moich danych osobowych przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
            <input
              type="checkbox"
              checked={!!formData.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-6 h-6 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
            />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                Zgoda pacjenta na przetwarzanie danych osobowych (wymagana) *
              </p>
              <p className="text-gray-700">
                z organizacją udzielanych świadczeń opieki zdrowotnej
              </p>
              <p className="text-xs text-blue-800 mt-2 font-medium">WYMAGANE</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
            <input
              type="checkbox"
              checked={!!formData.consentHealthCampaigns}
              onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
              className="mt-1 w-6 h-6 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
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
              className="mt-1 w-6 h-6 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
            />
            <div className="text-sm">
              <p className="text-gray-700">
                z otrzymywaniem newslettera z informacjami marketingowymi
              </p>
              <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Consent Block */}
      <div className="bg-yellow-50 rounded-lg p-6 space-y-3 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900">
          {requiresPatientConsent ? "Blok B - Zgoda opiekuna prawnego" : "Zgoda opiekuna prawnego"}
        </h4>
        <div className="text-sm text-yellow-800 mb-3 p-3 bg-white rounded-lg border border-yellow-100">
          „Ja niżej podpisana(-ny), działając jako przedstawiciel ustawowy małoletniego pacjenta{" "}
          <strong>{formData.firstName} {formData.lastName}</strong> (PESEL: <strong>{formData.pesel}</strong>), 
          oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie 
          danych osobowych małoletniego przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
        </div>
        
        {/* Guardian consent checkboxes */}
        {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
          // For under 16, use main consent fields
          <>
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50">
              <input
                type="checkbox"
                checked={!!formData.consentHealthcare}
                onChange={(e) => update("consentHealthcare", e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 mb-1">
                  Zgoda opiekuna na przetwarzanie danych osobowych małoletniego (wymagana) *
                </p>
                <p className="text-gray-700">
                  z organizacją udzielanych świadczeń opieki zdrowotnej
                </p>
                <p className="text-xs text-yellow-800 mt-2 font-medium">WYMAGANE</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
              <input
                type="checkbox"
                checked={!!formData.consentHealthCampaigns}
                onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
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
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
              />
              <div className="text-sm">
                <p className="text-gray-700">
                  z otrzymywaniem newslettera z informacjami marketingowymi
                </p>
                <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
              </div>
            </div>
          </>
        ) : (
          // For 16-17, use separate guardian consent fields
          <>
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50">
              <input
                type="checkbox"
                checked={!!formData.consentHealthcareGuardian}
                onChange={(e) => update("consentHealthcareGuardian", e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-yellow-900 mb-1">
                  Zgoda opiekuna na przetwarzanie danych osobowych małoletniego (wymagana) *
                </p>
                <p className="text-gray-700">
                  z organizacją udzielanych świadczeń opieki zdrowotnej
                </p>
                <p className="text-xs text-yellow-800 mt-2 font-medium">WYMAGANE</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
              <input
                type="checkbox"
                checked={!!formData.consentHealthCampaignsGuardian}
                onChange={(e) => update("consentHealthCampaignsGuardian", e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
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
                checked={!!formData.consentMarketingGuardian}
                onChange={(e) => update("consentMarketingGuardian", e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-yellow-700 focus:ring-yellow-500"
              />
              <div className="text-sm">
                <p className="text-gray-700">
                  z otrzymywaniem newslettera z informacjami marketingowymi
                </p>
                <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Separate Examination Consent Document for Minors */}
      <div className="bg-white border-2 border-green-400 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-green-900 mb-2">
            OŚWIADCZENIE {patientType === PATIENT_TYPES.MINOR_16_17 ? "PACJENTA I OPIEKUNA" : "OPIEKUNA PRAWNEGO"} o wyrażeniu zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego
          </h2>
          <div className="text-right text-sm text-gray-600">
            <p>Nr: {(() => {
              try {
                return documentNumbers.examination?.number || generateDocumentMetadata('examination').number;
              } catch (e) {
                console.error('Error generating examination document number:', e);
                return `BAD/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900000) + 100000)}`;
              }
            })()}</p>
            <p>Data: {(() => {
              try {
                return documentNumbers.examination?.date || generateDocumentMetadata('examination').date;
              } catch (e) {
                const now = new Date();
                return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
              }
            })()}</p>
            <p className="text-green-800 font-medium mt-1">WYMAGANE</p>
          </div>
        </div>

        {/* Patient Summary for Reference */}
        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm">
          <p><strong>Pacjent:</strong> {formData.firstName} {formData.lastName} (PESEL: {formData.pesel})</p>
          {patientType === PATIENT_TYPES.MINOR_16_17 && (
            <p><strong>Opiekun:</strong> {formData.guardianFirstName} {formData.guardianLastName}</p>
          )}
        </div>

        {/* Examination Consent Text */}
        <div className="mb-6 text-sm text-gray-800 leading-relaxed bg-green-50 p-4 rounded-lg">
          <p className="mb-4">
            {patientType === PATIENT_TYPES.MINOR_16_17 ? (
              <>Wyrażamy zgodę (pacjent i opiekun prawny) na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego dla pacjenta niepełnoletniego, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008r. o prawach pacjenta i Rzeczniku Praw Pacjenta.</>
            ) : (
              <>Wyrażam zgodę jako opiekun prawny na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego dla pacjenta niepełnoletniego, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008r. o prawach pacjenta i Rzeczniku Praw Pacjenta.</>
            )}
          </p>
          <p className="mb-4">
            Zostałem(-am) poinformowany(-a) o celu, przebiegu oraz możliwych następstwach planowanego świadczenia 
            zdrowotnego i potwierdzam, że moja zgoda ma charakter świadomy i dobrowolny.
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

      {/* Optional Third Document: Authorization for Close Person Access (Minor Version) */}
      <div className="bg-white border-2 border-purple-300 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-2">
            UPOWAŻNIENIE {patientType === PATIENT_TYPES.MINOR_16_17 ? "(PACJENT I OPIEKUN)" : "(OPIEKUN PRAWNY)"} do uzyskiwania informacji o stanie zdrowia przez osobę bliską
          </h2>
          <div className="text-right text-sm text-gray-600 mb-2">
            <p>Nr: {(() => {
              try {
                return documentNumbers.authorization?.number || generateDocumentMetadata('authorization').number;
              } catch (e) {
                console.error('Error generating authorization document number:', e);
                return `UPO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900000) + 100000)}`;
              }
            })()}</p>
            <p>Data: {(() => {
              try {
                return documentNumbers.authorization?.date || generateDocumentMetadata('authorization').date;
              } catch (e) {
                const now = new Date();
                return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
              }
            })()}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">OPCJONALNE</span>
            <span className="text-gray-600">Możesz pominąć ten dokument</span>
          </div>
        </div>

        {/* Patient Reference */}
        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm">
          <p><strong>Pacjent niepełnoletni:</strong> {formData.firstName} {formData.lastName} (PESEL: {formData.pesel})</p>
          <p><strong>Opiekun prawny:</strong> {formData.guardianFirstName} {formData.guardianLastName}</p>
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
                  <strong>UPOWAŻNIAM*</strong> następujące osoby do uzyskiwania informacji o stanie zdrowia {patientType === PATIENT_TYPES.MINOR_16_17 ? "pacjenta" : "dziecka"} i udzielonych świadczeniach zdrowotnych oraz uzyskania dokumentacji medycznej przewidzianej zgodnie z prawem:
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
                  <strong>NIE UPOWAŻNIAM*</strong> żadnych osób do uzyskiwania informacji o stanie zdrowia {patientType === PATIENT_TYPES.MINOR_16_17 ? "pacjenta" : "dziecka"} i udzielonych świadczeniach zdrowotnych
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
                      PESEL *
                    </label>
                    <input
                      type="text"
                      value={person.pesel || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, pesel: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        (() => {
                          const validation = validateAuthorizedPersonPesel(person.pesel);
                          if (!person.pesel) return 'border-gray-300';
                          return validation.valid ? 'border-green-300' : 'border-red-300';
                        })()
                      }`}
                      placeholder="Wprowadź numer PESEL"
                      maxLength="11"
                    />
                    {(() => {
                      const validation = validateAuthorizedPersonPesel(person.pesel);
                      if (!person.pesel) {
                        return <p className="text-xs text-gray-600 mt-1">* Wymagane 11 cyfr</p>;
                      }
                      return (
                        <p className={`text-xs mt-1 ${validation.valid ? 'text-green-600' : 'text-red-600'}`}>
                          {validation.message}
                        </p>
                      );
                    })()}
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numer telefonu *
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full max-w-full">
                      <select
                        value={person.phoneCode || "+48"}
                        onChange={(e) => {
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = { ...person, phoneCode: e.target.value, phone: "" };
                          update("authorizedPersons", newPersons);
                        }}
                        className="w-full sm:w-40 shrink-0 h-12 px-3 border border-gray-300 rounded-lg text-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title={PHONE_COUNTRY_CODES.find(c => c.code === (person.phoneCode || "+48"))?.country || ""}
                      >
                        {PHONE_COUNTRY_CODES.map((country) => (
                          <option key={country.code} value={country.code} title={country.country}>
                            {country.code} {country.country}
                          </option>
                        ))}
                      </select>
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
                        className={`flex-1 min-w-0 h-12 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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