import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";
import { normalizePesel } from "../../utils/peselUtils";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";
import { FileText, ExternalLink, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { resolveDocumentOpenUrl } from "../../utils/documentUrl";
import { EMPTY_AUTHORIZED_PERSON, isAuthorizationDocument } from "../../utils/authorizedPersons";

function AuthorizedPersonFields({ person, index, onChange, onRemove, canRemove }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const phoneCode = person.phoneCode || "+48";
  const currentCountry = PHONE_COUNTRY_CODES.find((c) => c.code === phoneCode) || PHONE_COUNTRY_CODES[0];

  const update = (field, value) => {
    onChange(index, { ...person, [field]: value });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".country-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Osoba Upoważniona {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-sm text-red-600 hover:underline"
          >
            Usuń
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
          <input
            type="text"
            value={person.firstName || ""}
            onChange={(e) => update("firstName", e.target.value)}
            placeholder="Imię"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
          <input
            type="text"
            value={person.lastName || ""}
            onChange={(e) => update("lastName", e.target.value)}
            placeholder="Nazwisko"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PESEL</label>
          <input
            type="text"
            inputMode="numeric"
            value={person.pesel || ""}
            onChange={(e) => update("pesel", normalizePesel(e.target.value))}
            placeholder="11 cyfr"
            maxLength={11}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numer telefonu</label>
          <div className="flex">
            <div className="relative w-24 country-dropdown">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-l-md border-r-0 bg-gray-50 text-sm text-left flex items-center justify-between"
              >
                <span className="flex items-center">
                  <span className="mr-1">{currentCountry.flag}</span>
                  <span className="text-xs">{currentCountry.code}</span>
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {PHONE_COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        update("phoneCode", country.code);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-gray-700"
                    >
                      <span className="mr-2">
                        <FlagIcon countryCode={country.flag} />
                      </span>
                      <span className="mr-2">{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              value={person.phone || ""}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, currentCountry.maxLength))}
              placeholder={`${currentCountry.maxLength} cyfr`}
              maxLength={currentCountry.maxLength}
              className="flex-1 h-[42px] px-3 border border-gray-300 rounded-r-md"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adres (ulica i numer)</label>
          <input
            type="text"
            value={person.street || ""}
            onChange={(e) => update("street", e.target.value)}
            placeholder="Ulica i numer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy</label>
          <input
            type="text"
            value={person.zipCode || ""}
            onChange={(e) => update("zipCode", e.target.value)}
            placeholder="00-000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Miasto</label>
          <input
            type="text"
            value={person.city || ""}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Miasto"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

const DetailsForm = () => {
  const { formData, updateFormData } = useFormContext();
  const authorizedPersons = formData.authorizedPersons?.length
    ? formData.authorizedPersons
    : [EMPTY_AUTHORIZED_PERSON()];
  const authorizationDocs = (formData.documents || []).filter(isAuthorizationDocument);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const setAuthorizationChoice = (choice) => {
    updateFormData("authorizationChoice", choice);
    if (choice === "authorize" && !formData.authorizedPersons?.length) {
      updateFormData("authorizedPersons", [EMPTY_AUTHORIZED_PERSON()]);
    }
    if (choice === "none") {
      updateFormData("authorizedPersons", []);
    }
  };

  const updatePerson = (index, person) => {
    const next = [...authorizedPersons];
    next[index] = person;
    updateFormData("authorizedPersons", next);
  };

  const addPerson = () => {
    if (authorizedPersons.length >= 3) return;
    updateFormData("authorizedPersons", [...authorizedPersons, EMPTY_AUTHORIZED_PERSON()]);
  };

  const removePerson = (index) => {
    const next = authorizedPersons.filter((_, i) => i !== index);
    updateFormData("authorizedPersons", next.length ? next : [EMPTY_AUTHORIZED_PERSON()]);
  };

  const openDocument = (doc) => {
    const url = resolveDocumentOpenUrl(doc);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("Nie można otworzyć dokumentu upoważnienia.");
  };

  return (
    <div className="space-y-6">
      {authorizationDocs.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Dokument upoważnienia</h3>
          <div className="space-y-2">
            {authorizationDocs.map((doc) => (
              <button
                key={doc._id || doc.id || doc.fileName}
                type="button"
                onClick={() => openDocument(doc)}
                className="w-full flex items-center gap-3 p-3 bg-white border border-teal-100 rounded-md hover:bg-teal-50/50 text-left"
              >
                <div className="w-10 h-10 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {doc.fileName || doc.name || "Upoważnienie"}
                  </p>
                  <p className="text-xs text-teal-700 inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Otwórz PDF
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Upoważnienie osób bliskich</h3>
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
          <input
            type="radio"
            name="authorizationChoice"
            checked={formData.authorizationChoice === "authorize"}
            onChange={() => setAuthorizationChoice("authorize")}
            className="mt-1"
          />
          <span className="text-sm text-gray-800">
            <strong>UPOWAŻNIAM</strong> następujące osoby do uzyskiwania informacji o stanie zdrowia i
            dokumentacji medycznej.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
          <input
            type="radio"
            name="authorizationChoice"
            checked={formData.authorizationChoice === "none"}
            onChange={() => setAuthorizationChoice("none")}
            className="mt-1"
          />
          <span className="text-sm text-gray-800">
            <strong>NIE UPOWAŻNIAM</strong> żadnych osób.
          </span>
        </label>
      </div>

      {formData.authorizationChoice === "authorize" && (
        <div className="space-y-4">
          {authorizedPersons.map((person, index) => (
            <AuthorizedPersonFields
              key={index}
              person={person}
              index={index}
              onChange={updatePerson}
              onRemove={removePerson}
              canRemove={authorizedPersons.length > 1}
            />
          ))}
          {authorizedPersons.length < 3 && (
            <button
              type="button"
              onClick={addPerson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-300 text-teal-800 bg-white hover:bg-teal-50 text-sm font-medium"
            >
              <UserPlus size={16} />
              Dodaj kolejną osobę upoważnioną
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alergie</label>
          <input
            type="text"
            name="allergies"
            value={formData.allergies || ""}
            onChange={handleChange}
            placeholder="Wprowadź alergie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferowany język</label>
          <select
            name="preferredLanguage"
            value={formData.preferredLanguage || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              Wybierz język
            </option>
            <option value="Polski">Polski</option>
            <option value="Angielski">Angielski</option>
            <option value="Hiszpański">Hiszpański</option>
            <option value="Rosyjski">Rosyjski</option>
            <option value="Niemiecki">Niemiecki</option>
            <option value="Ukraiński">Ukraiński</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;
