import { useState, useEffect } from "react";
import { toast } from "sonner";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientService from "../../helpers/patientHelper";
import { normalizePesel, getPeselChecksumWarning } from "../../utils/peselUtils";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";

/**
 * Admin: Complete registration for a visit that has no patient yet.
 * Calls POST /api/appointments/:visitId/complete-registration.
 * Handles duplicate PESEL (GET by-pesel, "Załaduj dane istniejącego pacjenta") and peselWarning from response.
 */
export default function CompleteRegistrationModal({ isOpen, onClose, appointment, onSuccess }) {
  const visitId = appointment?.id ?? appointment?._id;
  const registrationData = appointment?.registrationData || {};
  const [completeRegPesel, setCompleteRegPesel] = useState("");
  const [peselExists, setPeselExists] = useState(false);
  const [existingPatientData, setExistingPatientData] = useState(null);
  const [peselWarningFromApi, setPeselWarningFromApi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [peselCheckLoading, setPeselCheckLoading] = useState(false);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [showExistingPatientModal, setShowExistingPatientModal] = useState(false);
  const [fullExistingPatient, setFullExistingPatient] = useState(null);
  const [loadingFullPatient, setLoadingFullPatient] = useState(false);
  const [linkingToExisting, setLinkingToExisting] = useState(false);
  const [editingExistingPatientId, setEditingExistingPatientId] = useState(null);
  const regInitial = appointment?.registrationData || {};
  const [formData, setFormData] = useState({
    firstName: regInitial?.firstName ?? (regInitial?.name ? regInitial.name.split(/\s+/)[0] : "") ?? "",
    lastName: regInitial?.lastName ?? (regInitial?.name ? regInitial.name.split(/\s+/).slice(1).join(" ") : "") ?? "",
    dateOfBirth: regInitial?.dateOfBirth ? (String(regInitial.dateOfBirth).slice(0, 10)) : "",
    phoneCode: "+48",
    phone: (regInitial?.phone || "").replace(/\D/g, "").slice(0, 9),
    email: regInitial?.email ?? "",
    sex: regInitial?.sex ?? regInitial?.gender ?? "",
    street: regInitial?.street ?? regInitial?.address ?? "",
    zipCode: regInitial?.zipCode ?? regInitial?.pinCode ?? "",
    city: regInitial?.city ?? "",
    isInternationalPatient: !!regInitial?.isInternationalPatient,
    documentCountry: regInitial?.documentCountry ?? "",
    documentType: regInitial?.documentType ?? "",
    documentNumber: regInitial?.documentNumber ?? ""
  });

  useEffect(() => {
    if (!isOpen) return;
    const reg = appointment?.registrationData || {};
    const rawPhone = (reg.phone || "").trim();
    let phoneCode = "+48";
    let phoneDigits = rawPhone.replace(/\D/g, "");
    const match = PHONE_COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length).find((c) => phoneDigits.startsWith(c.code.replace(/\D/g, "")));
    if (match) {
      phoneCode = match.code;
      phoneDigits = phoneDigits.slice(match.code.replace(/\D/g, "").length).slice(0, match.maxLength);
    } else {
      phoneDigits = phoneDigits.slice(0, 9);
    }
    const dob = reg.dateOfBirth;
    const dateOfBirthStr = dob ? (typeof dob === "string" && dob.length >= 10 ? dob.slice(0, 10) : (new Date(dob).toISOString?.()?.slice(0, 10) ?? "")) : "";
    setFormData({
      firstName: reg.firstName ?? (reg.name ? reg.name.split(/\s+/)[0] : "") ?? "",
      lastName: reg.lastName ?? (reg.name ? reg.name.split(/\s+/).slice(1).join(" ") : "") ?? "",
      dateOfBirth: dateOfBirthStr,
      phoneCode,
      phone: phoneDigits,
      email: reg.email ?? "",
      sex: reg.sex ?? reg.gender ?? "",
      street: reg.street ?? reg.address ?? "",
      zipCode: reg.zipCode ?? reg.pinCode ?? "",
      city: reg.city ?? "",
      isInternationalPatient: !!reg.isInternationalPatient,
      documentCountry: reg.documentCountry ?? "",
      documentType: reg.documentType ?? "",
      documentNumber: reg.documentNumber ?? ""
    });
    const peselFromReg = (reg.pendingPesel ?? reg.govtId ?? reg.pesel ?? reg.npesei ?? "").toString().trim();
    setCompleteRegPesel(peselFromReg ? normalizePesel(peselFromReg) : "");
    setPeselExists(false);
    setExistingPatientData(null);
    setPeselWarningFromApi(null);
    setPhoneDropdownOpen(false);
    setShowExistingPatientModal(false);
    setFullExistingPatient(null);
    setEditingExistingPatientId(null);
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!phoneDropdownOpen) return;
    const close = () => setPhoneDropdownOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [phoneDropdownOpen]);

  useEffect(() => {
    if (!isOpen || !visitId || formData.isInternationalPatient || completeRegPesel.replace(/\D/g, "").length !== 11) {
      setPeselExists(false);
      setExistingPatientData(null);
      setPeselWarningFromApi(null);
      return;
    }
    const normalized = normalizePesel(completeRegPesel);
    let cancelled = false;
    setPeselCheckLoading(true);
    patientService.getPatientByPesel(normalized).then((res) => {
      if (cancelled) return;
      setPeselExists(!!res?.exists);
      setExistingPatientData(res?.exists && res?.patient ? res.patient : null);
      setPeselWarningFromApi(res?.peselWarning ?? null);
    }).catch(() => {
      if (!cancelled) setPeselExists(false);
      if (!cancelled) setPeselWarningFromApi(null);
    }).finally(() => {
      if (!cancelled) setPeselCheckLoading(false);
    });
    return () => { cancelled = true; };
  }, [isOpen, visitId, completeRegPesel, formData.isInternationalPatient]);

  const parsePhoneForForm = (rawPhone) => {
    const raw = (rawPhone || "").trim();
    let phoneCode = "+48";
    let phoneDigits = raw.replace(/\D/g, "");
    const match = PHONE_COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length).find((c) => phoneDigits.startsWith(c.code.replace(/\D/g, "")));
    if (match) {
      phoneCode = match.code;
      phoneDigits = phoneDigits.slice(match.code.replace(/\D/g, "").length).slice(0, match.maxLength);
    } else {
      phoneDigits = phoneDigits.slice(0, 9);
    }
    return { phoneCode, phone: phoneDigits };
  };

  const handleLoadExisting = () => {
    const normalized = normalizePesel(completeRegPesel);
    if (normalized.length !== 11) return;
    setLoadingFullPatient(true);
    patientService.getPatientDetailsByPesel(normalized).then((data) => {
      const patient = data?.patient ?? data;
      const { phoneCode, phone } = parsePhoneForForm(patient.phone ?? patient.mobileNumber);
      const dob = patient.dateOfBirth ?? patient.dob;
      const dateStr = dob ? (typeof dob === "string" && dob.match(/^\d{4}-\d{2}-\d{2}/) ? dob.slice(0, 10) : new Date(dob).toISOString().slice(0, 10)) : "";
      setFormData({
        firstName: patient.name?.first ?? patient.firstName ?? "",
        lastName: patient.name?.last ?? patient.lastName ?? "",
        dateOfBirth: dateStr,
        phoneCode,
        phone,
        email: patient.email ?? "",
        sex: patient.sex ?? "",
        street: patient.street ?? patient.address ?? "",
        zipCode: patient.zipCode ?? patient.pinCode ?? "",
        city: patient.city ?? "",
        isInternationalPatient: !!patient.isInternationalPatient,
        documentCountry: patient.documentCountry ?? "",
        documentType: patient.documentType ?? "",
        documentNumber: patient.documentNumber ?? ""
      });
      setEditingExistingPatientId(patient._id ?? patient.id ?? null);
      toast.success("Dane pacjenta załadowane. Możesz je edytować i kliknąć «Zakończ rejestrację».");
    }).catch((err) => {
      const msg = err.response?.data?.message || err.message || "Nie udało się pobrać danych pacjenta.";
      toast.error(msg);
    }).finally(() => setLoadingFullPatient(false));
  };

  const handleUseExistingPatient = () => {
    const normalized = normalizePesel(completeRegPesel);
    if (normalized.length !== 11) return;
    setLoadingFullPatient(true);
    setFullExistingPatient(null);
    patientService.getPatientDetailsByPesel(normalized).then((data) => {
      setFullExistingPatient(data);
      setShowExistingPatientModal(true);
    }).catch((err) => {
      const msg = err.response?.data?.message || err.message || "Nie udało się pobrać danych pacjenta.";
      toast.error(msg);
    }).finally(() => setLoadingFullPatient(false));
  };

  const handleConfirmUseExistingPatient = async () => {
    if (!fullExistingPatient || !visitId) return;
    const patientId = fullExistingPatient._id ?? fullExistingPatient.id;
    if (!patientId) {
      toast.error("Brak ID pacjenta.");
      return;
    }
    setLinkingToExisting(true);
    try {
      const response = await appointmentHelper.completeRegistration(visitId, {
        isExisting: true,
        patientId
      });
      toast.success("Wizyta została przypisana do istniejącego pacjenta.");
      setShowExistingPatientModal(false);
      setFullExistingPatient(null);
      onSuccess?.(response);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Nie udało się przypisać wizyty do pacjenta.";
      toast.error(msg);
    } finally {
      setLinkingToExisting(false);
    }
  };

  const handleSubmit = async () => {
    const isInternational = !!formData.isInternationalPatient;
    if (!isInternational) {
      const normalizedPesel = normalizePesel(completeRegPesel);
      if (normalizedPesel.length !== 11) {
        toast.error("Wprowadź prawidłowy numer PESEL (11 cyfr).");
        return;
      }
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        toast.error("Imię i nazwisko są wymagane.");
        return;
      }
      if (!formData.sex?.trim()) {
        toast.error("Płeć jest wymagana.");
        return;
      }
    } else {
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        toast.error("Imię i nazwisko są wymagane.");
        return;
      }
      if (!formData.documentCountry?.trim() || !formData.documentType?.trim() || !formData.documentNumber?.trim()) {
        toast.error("Wypełnij wszystkie pola dokumentu (kraj wydania, typ dokumentu, numer).");
        return;
      }
    }
    setLoading(true);
    try {
      const fullPhone = formData.phone ? formData.phoneCode + formData.phone : undefined;
      let payload;
      if (editingExistingPatientId) {
        payload = {
          isExisting: true,
          patientId: editingExistingPatientId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth?.trim() || undefined,
          phone: fullPhone,
          phoneCode: formData.phone ? formData.phoneCode : undefined,
          mobileNumber: formData.phone ? formData.phone : undefined,
          email: formData.email?.trim() || undefined,
          sex: formData.sex || undefined,
          street: formData.street?.trim() || undefined,
          zipCode: formData.zipCode?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          smsConsentAgreed: true,
          consents: []
        };
        if (isInternational) {
          payload.isInternationalPatient = true;
          payload.documentCountry = formData.documentCountry?.trim() ?? "";
          payload.documentType = formData.documentType?.trim() ?? "";
          payload.documentNumber = formData.documentNumber?.trim() ?? "";
          payload.internationalPatientDocumentKey = [payload.documentCountry, payload.documentType, payload.documentNumber].join("|");
        } else {
          payload.pesel = normalizePesel(completeRegPesel);
        }
      } else if (isInternational) {
        const documentCountry = formData.documentCountry?.trim() ?? "";
        const documentType = formData.documentType?.trim() ?? "";
        const documentNumber = formData.documentNumber?.trim() ?? "";
        payload = {
          isInternationalPatient: true,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth?.trim() || undefined,
          documentCountry,
          documentType,
          documentNumber,
          internationalPatientDocumentKey: [documentCountry, documentType, documentNumber].join("|"),
          phone: fullPhone,
          phoneCode: formData.phone ? formData.phoneCode : undefined,
          mobileNumber: formData.phone ? formData.phone : undefined,
          email: formData.email?.trim() || undefined,
          sex: formData.sex || undefined,
          street: formData.street?.trim() || undefined,
          zipCode: formData.zipCode?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          smsConsentAgreed: true,
          consents: []
        };
      } else {
        const normalizedPesel = normalizePesel(completeRegPesel);
        payload = {
          pesel: normalizedPesel,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth || undefined,
          phone: fullPhone,
          phoneCode: formData.phone ? formData.phoneCode : undefined,
          mobileNumber: formData.phone ? formData.phone : undefined,
          email: formData.email?.trim() || undefined,
          sex: formData.sex || undefined,
          street: formData.street?.trim() || undefined,
          zipCode: formData.zipCode?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          smsConsentAgreed: true,
          consents: []
        };
      }
      const response = await appointmentHelper.completeRegistration(visitId, payload);
      if (response?.peselWarning) {
        toast.warning(response.peselWarning);
      }
      toast.success(editingExistingPatientId ? "Wizyta przypisana do pacjenta; dane zaktualizowane." : "Rejestracja zakończona.");
      onSuccess?.(response);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Nie udało się zakończyć rejestracji.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isInternational = !!formData.isInternationalPatient;
  const canSubmit = isInternational
    ? (formData.firstName?.trim() && formData.lastName?.trim() &&
       formData.documentCountry?.trim() && formData.documentType?.trim() && formData.documentNumber?.trim())
    : (normalizePesel(completeRegPesel).length === 11 &&
       formData.firstName?.trim() && formData.lastName?.trim() && formData.sex?.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Zakończ rejestrację pacjenta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Wprowadź PESEL i dane pacjenta. Identyfikator pacjenta zostanie utworzony po zatwierdzeniu.</p>
        {editingExistingPatientId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Edytujesz dane istniejącego pacjenta</p>
            <p className="text-xs text-blue-700 mt-0.5">Po zatwierdzeniu wizyta zostanie przypisana do tego pacjenta z zaktualizowanymi danymi (np. nowy adres).</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL {!isInternational && <span className="text-red-500">*</span>}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={completeRegPesel}
              onChange={(e) => setCompleteRegPesel(normalizePesel(e.target.value))}
              placeholder={isInternational ? "Nie dotyczy – pacjent międzynarodowy" : "11 cyfr"}
              disabled={isInternational}
              className={`w-full p-2 border border-gray-300 rounded-lg ${isInternational ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            />
            {!isInternational && peselCheckLoading && <p className="text-xs text-gray-500 mt-1">Sprawdzam PESEL...</p>}
            {!isInternational && completeRegPesel.length === 11 && (peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)) && (
              <p className="mt-1 text-sm text-amber-600">{peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)}</p>
            )}
            {!isInternational && peselExists && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Pacjent o podanym numerze PESEL już istnieje w systemie.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={handleUseExistingPatient} disabled={loadingFullPatient} className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 disabled:opacity-50">
                    {loadingFullPatient ? "Pobieram dane..." : "Użyj tego pacjenta"}
                  </button>
                  <button type="button" onClick={handleLoadExisting} disabled={loadingFullPatient} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {loadingFullPatient ? "Ładowanie..." : "Załaduj dane do formularza (edycja)"}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="complete-reg-international"
                checked={isInternational}
                onChange={(e) => {
                  const checked = !!e.target.checked;
                  setFormData((prev) => ({ ...prev, isInternationalPatient: checked }));
                  if (checked) {
                    setCompleteRegPesel("");
                    setPeselExists(false);
                    setExistingPatientData(null);
                    setPeselWarningFromApi(null);
                    setEditingExistingPatientId(null);
                  }
                }}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded"
              />
              <label htmlFor="complete-reg-international" className="text-sm text-gray-700">Pacjent międzynarodowy (bez PESEL)</label>
            </div>
            {isInternational && (
              <p className="mt-1 text-sm text-gray-500">PESEL nie dotyczy pacjentów międzynarodowych.</p>
            )}
          </div>

          {isInternational && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-medium text-gray-800 mb-3">Dane dokumentu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kraj wydania dokumentu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.documentCountry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, documentCountry: e.target.value }))}
                    placeholder="np. Niemcy, Polska"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ dokumentu <span className="text-red-500">*</span></label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, documentType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Wybierz</option>
                    <option value="Passport">Paszport</option>
                    <option value="ID Card">Dowód osobisty</option>
                    <option value="Residence Card">Karta pobytu</option>
                    <option value="Other">Inny</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numer dokumentu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, documentNumber: e.target.value }))}
                    placeholder="Numer dokumentu"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Imię*</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nazwisko*</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Data urodzenia</label>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Płeć*</label>
              <select value={formData.sex} onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))} className="w-full p-2 border rounded-lg">
                <option value="">Wybierz płeć</option>
                <option value="Male">Mężczyzna</option>
                <option value="Female">Kobieta</option>
                <option value="Others">Inna</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefon</label>
              <div className="flex">
                <div className="relative w-24">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPhoneDropdownOpen((open) => !open); }}
                    className="w-full h-[42px] px-3 border border-gray-300 rounded-l-lg border-r-0 bg-gray-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <span className="mr-1">
                        <FlagIcon countryCode={PHONE_COUNTRY_CODES.find((c) => c.code === formData.phoneCode)?.flag || "PL"} />
                      </span>
                      <span className="text-xs">{formData.phoneCode}</span>
                    </span>
                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {phoneDropdownOpen && (
                    <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      {PHONE_COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            const maxLen = country.maxLength ?? 9;
                            setFormData((prev) => ({ ...prev, phoneCode: country.code, phone: prev.phone.slice(0, maxLen) }));
                            setPhoneDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${formData.phoneCode === country.code ? "bg-teal-50 text-teal-700" : "text-gray-700"}`}
                        >
                          <span className="mr-2"><FlagIcon countryCode={country.flag} /></span>
                          <span className="mr-2">{country.code}</span>
                          <span className="text-xs text-gray-500">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => {
                    const country = PHONE_COUNTRY_CODES.find((c) => c.code === formData.phoneCode);
                    const maxLen = country?.maxLength ?? 9;
                    setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, maxLen) }));
                  }}
                  placeholder={PHONE_COUNTRY_CODES.find((c) => c.code === formData.phoneCode)?.maxLength ? `${PHONE_COUNTRY_CODES.find((c) => c.code === formData.phoneCode).maxLength} cyfr` : "9 cyfr"}
                  className="flex-1 h-[42px] px-3 border border-gray-300 rounded-r-lg min-w-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Adres (opcjonalnie)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Ulica</label>
                <input type="text" value={formData.street} onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))} placeholder="np. ul. Marszałkowska 1" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kod pocztowy</label>
                <input type="text" value={formData.zipCode} onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value.replace(/\s/g, "").slice(0, 10) }))} placeholder="00-001" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Miasto</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} placeholder="np. Warszawa" className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Anuluj</button>
            <button type="button" onClick={handleSubmit} disabled={!canSubmit || loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Zapisywanie..." : "Zakończ rejestrację"}
            </button>
          </div>
        </div>
      </div>

      {/* Existing patient detail modal – full details and "Użyj tego pacjenta" */}
      {showExistingPatientModal && fullExistingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Dane istniejącego pacjenta</h3>
              <button type="button" onClick={() => { setShowExistingPatientModal(false); setFullExistingPatient(null); }} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Imię i nazwisko:</span> {[fullExistingPatient.name?.first, fullExistingPatient.name?.last].filter(Boolean).join(" ") || "—"}</p>
              <p><span className="text-gray-500">PESEL:</span> {fullExistingPatient.govtId || "—"}</p>
              <p><span className="text-gray-500">ID pacjenta:</span> {fullExistingPatient.patientId || fullExistingPatient._id || "—"}</p>
              <p><span className="text-gray-500">Email:</span> {fullExistingPatient.email || "—"}</p>
              <p><span className="text-gray-500">Telefon:</span> {(fullExistingPatient.phone != null && String(fullExistingPatient.phone).trim() !== "" && !String(fullExistingPatient.phone).trim().startsWith("__no_phone_")) ? fullExistingPatient.phone : "Numer telefonu niedostępny"}</p>
              {fullExistingPatient.dateOfBirth && <p><span className="text-gray-500">Data urodzenia:</span> {new Date(fullExistingPatient.dateOfBirth).toLocaleDateString("pl-PL")}</p>}
              {fullExistingPatient.sex && <p><span className="text-gray-500">Płeć:</span> {fullExistingPatient.sex === "Male" ? "Mężczyzna" : fullExistingPatient.sex === "Female" ? "Kobieta" : fullExistingPatient.sex}</p>}
            </div>
            <p className="mt-4 text-sm text-gray-600">Przypisz tę wizytę do tego pacjenta bez tworzenia nowego wpisu.</p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => { setShowExistingPatientModal(false); setFullExistingPatient(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Anuluj
              </button>
              <button type="button" onClick={handleConfirmUseExistingPatient} disabled={linkingToExisting} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {linkingToExisting ? "Przypisywanie..." : "Użyj tego pacjenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
