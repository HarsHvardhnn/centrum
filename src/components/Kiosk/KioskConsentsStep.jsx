import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes";
import KioskPatientSummaryCard from "./KioskPatientSummaryCard";
import KioskEditPatientModal from "./KioskEditPatientModal";
import KioskDocumentUploadSection from "./KioskDocumentUploadSection";
import KioskNumericEntry from "./KioskNumericEntry";
import { formatPolishPostalCode } from "../../utils/postalCodeUtils";
import { getRequiredPhoneLength } from "../../utils/phoneUtils";
import {
  CONSENT_TEXT,
  EMPTY_AUTHORIZED_PERSON,
  syncSmsConsentFromHealthcare,
} from "./kioskConstants";

function ConsentCard({ title, required, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide leading-snug">{title}</h4>
        {required && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
            Wymagane
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({ checked, onChange, children, required }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-2">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
        required={required}
      />
      <span className="text-sm text-gray-800 leading-relaxed">
        {children}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </span>
    </label>
  );
}

function AuthorizedPersonCard({ person, index, onChange, onRemove, canRemove }) {
  const update = (field, value) => {
    const next = { ...person, [field]: value };
    onChange(index, next);
  };

  return (
    <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Osoba {index + 1}</p>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-600 hover:underline">
            Usuń
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Imię *" value={person.firstName} onChange={(v) => update("firstName", v)} />
        <Input label="Nazwisko *" value={person.lastName} onChange={(v) => update("lastName", v)} />
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            {person.noPesel ? "PESEL" : "PESEL *"}
          </label>
          {!person.noPesel && (
            <KioskNumericEntry
              value={person.pesel}
              onChange={(value) => update("pesel", value)}
              maxLength={11}
              size="md"
              compactKeypad
            />
          )}
          <label className="mt-2 flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!person.noPesel}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange(index, {
                  ...person,
                  noPesel: checked,
                  pesel: checked ? "" : person.pesel,
                  documentNumber: checked ? person.documentNumber || "" : "",
                });
              }}
              className="mt-0.5 w-4 h-4 rounded border-gray-400 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-700">Nie posiadam numeru PESEL</span>
          </label>
          {person.noPesel && (
            <div className="mt-3">
              <Input
                label="Numer dokumentu tożsamości *"
                value={person.documentNumber}
                onChange={(v) => update("documentNumber", v)}
              />
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-2">Numer telefonu *</label>
          <div className="flex gap-2 mb-3">
            <select
              value={person.phoneCode}
              onChange={(e) => update("phoneCode", e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm bg-white"
            >
              {PHONE_COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <KioskNumericEntry
            value={person.phone}
            onChange={(value) => {
              const maxLength = getRequiredPhoneLength(person.phoneCode || "+48");
              update("phone", value.slice(0, maxLength));
            }}
            maxLength={getRequiredPhoneLength(person.phoneCode || "+48")}
            size="sm"
            compactKeypad
          />
        </div>
        <Input
          label="Adres (ulica i numer) *"
          value={person.street}
          onChange={(v) => update("street", v)}
          className="sm:col-span-2"
        />
        <Input 
          label="Kod pocztowy *" 
          value={person.zipCode} 
          onChange={(v) => update("zipCode", formatPolishPostalCode(v))}
          placeholder="00-000"
          maxLength="6"
        />
        <Input label="Miasto *" value={person.city} onChange={(v) => update("city", v)} />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, className = "", placeholder, maxLength }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
      />
    </div>
  );
}

export default function KioskConsentsStep({ form, onChange, errors = [] }) {
  const [showEdit, setShowEdit] = useState(false);
  const [editDraft, setEditDraft] = useState(form);

  const setForm = (next) => onChange(syncSmsConsentFromHealthcare(next));

  const updatePerson = (index, person) => {
    const authorizedPersons = [...(form.authorizedPersons || [])];
    authorizedPersons[index] = person;
    setForm({ ...form, authorizedPersons });
  };

  const addPerson = () => {
    if ((form.authorizedPersons || []).length >= 3) return;
    setForm({
      ...form,
      authorizedPersons: [...(form.authorizedPersons || []), EMPTY_AUTHORIZED_PERSON()],
    });
  };

  const removePerson = (index) => {
    const authorizedPersons = (form.authorizedPersons || []).filter((_, i) => i !== index);
    setForm({
      ...form,
      authorizedPersons: authorizedPersons.length ? authorizedPersons : [EMPTY_AUTHORIZED_PERSON()],
    });
  };

  const openEdit = () => {
    setEditDraft(form);
    setShowEdit(true);
  };

  const saveEdit = () => {
    setForm(editDraft);
    setShowEdit(false);
  };

  return (
    <div>
      <KioskPatientSummaryCard form={form} onEdit={openEdit} />

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
          <p className="font-medium mb-1">Uzupełnij wszystkie wymagane zgody przed przejściem dalej.</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <ConsentCard title="Zgoda na przetwarzanie danych osobowych" required>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i
          wyrażam zgodę na przetwarzanie moich danych osobowych przez{" "}
          <strong>CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</strong> z siedzibą w
          Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5, do celów związanych:
        </p>
        <div className="space-y-1 border border-gray-100 rounded-xl p-3 bg-gray-50/80">
          <CheckboxRow
            checked={form.consentHealthcare}
            required
            onChange={(checked) => setForm({ ...form, consentHealthcare: checked })}
          >
            {CONSENT_TEXT.healthcare}
          </CheckboxRow>
          <CheckboxRow
            checked={form.consentHealthCampaigns}
            onChange={(checked) => setForm({ ...form, consentHealthCampaigns: checked })}
          >
            {CONSENT_TEXT.healthCampaigns}
          </CheckboxRow>
          <CheckboxRow
            checked={form.consentMarketing}
            onChange={(checked) => setForm({ ...form, consentMarketing: checked })}
          >
            {CONSENT_TEXT.marketing}
          </CheckboxRow>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mt-4">
          Administratorem Danych Osobowych jest CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z
          siedzibą w Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5 (dalej „Spółka”).
          Szczegółowe informacje na temat przetwarzania danych osobowych można znaleźć w
          ogólnodostępnej klauzuli informacyjnej RODO obowiązującej w Spółce i/lub w Polityce
          Prywatności na stronie internetowej Spółki pod adresem{" "}
          <a href="https://www.centrummedyczne7.pl" className="text-teal-700 underline">
            www.centrummedyczne7.pl
          </a>
          .
        </p>
      </ConsentCard>

      <ConsentCard
        title="Oświadczenie pacjenta o wyrażeniu zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego"
        required
      >
        <div className="text-sm text-gray-700 leading-relaxed mb-3 space-y-3">
          <p>
            Wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia
            zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego),
            niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z
            dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.
          </p>
          <p>
            Przyjmuję do wiadomości, że jeżeli planowane świadczenie wiąże się z podwyższonym
            ryzykiem lub wymaga zgody w formie pisemnej na zasadach szczególnych, personel medyczny
            przedstawi mi odrębny dokument zgody bezpośrednio przed jego udzieleniem.
          </p>
        </div>
        <CheckboxRow
          checked={form.consentExamination}
          required
          onChange={(checked) => setForm({ ...form, consentExamination: checked })}
        >
          {CONSENT_TEXT.examinationAck}
        </CheckboxRow>
        <p className="text-xs text-gray-500 mt-3 italic">
          Informujemy, że podczas wizyty lekarz może poprosić o wyrażenie dodatkowych zgód, w
          zależności od rodzaju udzielanego świadczenia zdrowotnego.
        </p>
      </ConsentCard>

      <ConsentCard
        title="Oświadczenie pacjenta o upoważnieniu osoby bliskiej do uzyskiwania informacji o stanie zdrowia i udzielonych świadczeniach zdrowotnych oraz do uzyskiwania dokumentacji medycznej"
        required={false}
      >
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          Ja niżej podpisany(-a), na zasadach określonych w Art. 26 ust. 1 ustawy z dnia 6 listopada
          2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta oraz Rozporządzeniu Ministra Zdrowia z
          dnia 6 kwietnia 2020 r., oświadczam, że:
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
            <input
              type="radio"
              name="authorizationChoice"
              checked={form.authorizationChoice === "authorize"}
              onChange={() =>
                setForm({
                  ...form,
                  authorizationChoice: "authorize",
                  authorizedPersons:
                    form.authorizedPersons?.length > 0
                      ? form.authorizedPersons
                      : [EMPTY_AUTHORIZED_PERSON()],
                })
              }
              className="mt-1"
            />
            <span className="text-sm text-gray-800">
              <strong>UPOWAŻNIAM*</strong> następujące osoby do uzyskiwania informacji o moim stanie
              zdrowia i udzielonych świadczeniach zdrowotnych oraz do uzyskiwania dokumentacji
              medycznej przewidzianej zgodnie z prawem dotyczącej mojej osoby:
            </span>
          </label>

          {form.authorizationChoice === "authorize" && (
            <div className="space-y-3 pl-1">
              {(form.authorizedPersons || []).map((person, index) => (
                <AuthorizedPersonCard
                  key={index}
                  person={person}
                  index={index}
                  onChange={updatePerson}
                  onRemove={removePerson}
                  canRemove={(form.authorizedPersons || []).length > 1}
                />
              ))}
              {(form.authorizedPersons || []).length < 3 && (
                <button
                  type="button"
                  onClick={addPerson}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-300 text-teal-800 bg-white hover:bg-teal-50 text-sm font-medium"
                >
                  <UserPlus size={16} />
                  Dodaj kolejną osobę
                </button>
              )}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
            <input
              type="radio"
              name="authorizationChoice"
              checked={form.authorizationChoice === "none"}
              onChange={() => setForm({ ...form, authorizationChoice: "none", authorizedPersons: [] })}
              className="mt-1"
            />
            <span className="text-sm text-gray-800">
              <strong>NIE UPOWAŻNIAM*</strong> żadnych osób do uzyskiwania informacji o moim stanie
              zdrowia, udzielonych świadczeniach zdrowotnych oraz dokumentacji medycznej.
            </span>
          </label>
        </div>

        <p className="text-xs text-gray-500 mt-4 italic leading-relaxed">
          Ponadto oświadczam, iż zostałem(-am) poinformowany(-a) o możliwości cofnięcia udzielonego
          upoważnienia w każdym czasie oraz o tym, że dane osobowe osób upoważnionych są
          przetwarzane wyłącznie w celu realizacji uprawnień wynikających z niniejszego
          oświadczenia.
        </p>
        <p className="text-[10px] text-gray-400 mt-2">* właściwe zakreślić</p>
      </ConsentCard>

      <KioskDocumentUploadSection
        scans={form.documentScans || []}
        onChange={(documentScans) => setForm({ ...form, documentScans })}
      />

      {showEdit && (
        <KioskEditPatientModal
          form={editDraft}
          onChange={setEditDraft}
          onClose={() => setShowEdit(false)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
