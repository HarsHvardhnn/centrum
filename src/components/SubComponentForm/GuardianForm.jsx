import { useState, useEffect } from "react";
import { useFormContext } from "../../context/SubStepFormContext";
import { normalizePesel } from "../../utils/peselUtils";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";
import { FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { resolveDocumentOpenUrl } from "../../utils/documentUrl";
import {
  GUARDIAN_RELATION_OPTIONS,
  isGuardianStatementDocument,
} from "../../utils/guardian";

const NEEDS_COURT = new Set(["opiekun_prawny", "kurator"]);

const GuardianForm = () => {
  const { formData, updateFormData } = useFormContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const phoneCode = formData.guardianPhoneCode || "+48";
  const currentCountry =
    PHONE_COUNTRY_CODES.find((c) => c.code === phoneCode) || PHONE_COUNTRY_CODES[0];
  const relation = String(formData.guardianRelation || "");
  const showCourt = NEEDS_COURT.has(relation);
  const showFactualNote = relation === "opiekun_faktyczny";

  const guardianDocs = (formData.documents || []).filter(isGuardianStatementDocument);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".guardian-country-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const update = (field, value) => updateFormData(field, value);

  const openDocument = (doc) => {
    const url = resolveDocumentOpenUrl(doc);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("Nie można otworzyć oświadczenia przedstawiciela / opiekuna.");
  };

  return (
    <div className="space-y-6">
      {guardianDocs.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Dokument oświadczenia przedstawiciela / opiekuna
          </h3>
          <div className="space-y-2">
            {guardianDocs.map((doc) => (
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
                    {doc.fileName || doc.name || "Oświadczenie opiekuna"}
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

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Dane przedstawiciela / opiekuna
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
            <input
              type="text"
              value={formData.guardianFirstName || ""}
              onChange={(e) => update("guardianFirstName", e.target.value)}
              placeholder="Imię"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
            <input
              type="text"
              value={formData.guardianLastName || ""}
              onChange={(e) => update("guardianLastName", e.target.value)}
              placeholder="Nazwisko"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.guardianPesel || ""}
              onChange={(e) => update("guardianPesel", normalizePesel(e.target.value))}
              placeholder="11 cyfr"
              maxLength={11}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ przedstawicielstwa
            </label>
            <select
              value={formData.guardianRelation || ""}
              onChange={(e) => update("guardianRelation", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Wybierz…</option>
              {GUARDIAN_RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numer telefonu</label>
            <div className="flex">
              <div className="relative w-24 guardian-country-dropdown">
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
                          update("guardianPhoneCode", country.code);
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
                value={formData.guardianPhone || ""}
                onChange={(e) =>
                  update(
                    "guardianPhone",
                    e.target.value.replace(/\D/g, "").slice(0, currentCountry.maxLength)
                  )
                }
                placeholder={`${currentCountry.maxLength} cyfr`}
                maxLength={currentCountry.maxLength}
                className="flex-1 h-[42px] px-3 border border-gray-300 rounded-r-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
            <input
              type="email"
              value={formData.guardianEmail || ""}
              onChange={(e) => update("guardianEmail", e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres zamieszkania (ulica i numer)
            </label>
            <input
              type="text"
              value={formData.guardianStreet || ""}
              onChange={(e) => update("guardianStreet", e.target.value)}
              placeholder="Ulica i numer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy</label>
            <input
              type="text"
              value={formData.guardianZipCode || ""}
              onChange={(e) => update("guardianZipCode", e.target.value)}
              placeholder="00-000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Miasto</label>
            <input
              type="text"
              value={formData.guardianCity || ""}
              onChange={(e) => update("guardianCity", e.target.value)}
              placeholder="Miasto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {showCourt && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Orzeczenie / postanowienie sądu</h3>
          <p className="text-xs text-amber-800 mb-4">
            Wymagane dla opiekuna prawnego oraz kuratora.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa sądu</label>
              <input
                type="text"
                value={formData.courtName || ""}
                onChange={(e) => update("courtName", e.target.value)}
                placeholder="Nazwa sądu"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numer orzeczenia
              </label>
              <input
                type="text"
                value={formData.courtNumber || ""}
                onChange={(e) => update("courtNumber", e.target.value)}
                placeholder="Nr orzeczenia"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data wydania</label>
              <input
                type="date"
                value={formData.courtDate ? String(formData.courtDate).slice(0, 10) : ""}
                onChange={(e) => update("courtDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {showFactualNote && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-900">
          <strong>Uwaga — opiekun faktyczny:</strong> zgodnie z art. 32 ust. 5 ustawy o zawodach
          lekarza i lekarza dentysty, opiekun faktyczny uprawniony jest wyłącznie do wyrażenia zgody
          na przeprowadzenie badania. Dla innych świadczeń wymagana jest zgoda przedstawiciela
          ustawowego lub orzeczenie sądu opiekuńczego.
        </div>
      )}

      {!guardianDocs.length &&
        !formData.guardianFirstName &&
        !formData.guardianLastName && (
          <p className="text-sm text-gray-500">
            Brak zapisanych danych przedstawiciela. Uzupełnij pola poniżej lub wygeneruj PIN
            aktualizacji na tablecie, aby pacjent / opiekun ponownie przeszedł rejestrację.
          </p>
        )}
    </div>
  );
};

export default GuardianForm;
