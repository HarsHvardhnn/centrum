import { useState, useEffect } from "react";
import { toast } from "sonner";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientService from "../../helpers/patientHelper";
import { normalizePesel, getPeselChecksumWarning } from "../../utils/peselUtils";

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
  const [formData, setFormData] = useState({
    firstName: registrationData?.firstName ?? "",
    lastName: registrationData?.lastName ?? "",
    dateOfBirth: registrationData?.dateOfBirth ?? "",
    phone: (registrationData?.phone || "").replace(/\D/g, "").slice(0, 9),
    email: registrationData?.email ?? "",
    sex: registrationData?.sex ?? ""
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      firstName: registrationData?.firstName ?? "",
      lastName: registrationData?.lastName ?? "",
      dateOfBirth: registrationData?.dateOfBirth ?? "",
      phone: (registrationData?.phone || "").replace(/\D/g, "").slice(0, 9),
      email: registrationData?.email ?? "",
      sex: registrationData?.sex ?? ""
    });
    setCompleteRegPesel("");
    setPeselExists(false);
    setExistingPatientData(null);
    setPeselWarningFromApi(null);
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!isOpen || !visitId || completeRegPesel.replace(/\D/g, "").length !== 11) {
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
  }, [isOpen, visitId, completeRegPesel]);

  const handleLoadExisting = () => {
    if (!existingPatientData) return;
    const name = existingPatientData.name || {};
    setFormData({
      firstName: name.first ?? "",
      lastName: name.last ?? "",
      dateOfBirth: existingPatientData.dateOfBirth ?? formData.dateOfBirth,
      phone: (existingPatientData.phone || "").replace(/\D/g, "").slice(0, 9),
      email: existingPatientData.email ?? formData.email,
      sex: existingPatientData.sex ?? formData.sex
    });
    toast.info("Dane istniejącego pacjenta załadowane. Kliknij „Zakończ rejestrację”.");
  };

  const handleSubmit = async () => {
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
    setLoading(true);
    try {
      const payload = {
        pesel: normalizedPesel,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone ? (formData.phone.length === 9 ? "+48" + formData.phone : formData.phone) : undefined,
        email: formData.email?.trim() || undefined,
        sex: formData.sex || undefined,
        smsConsentAgreed: true,
        consents: []
      };
      const response = await appointmentHelper.completeRegistration(visitId, payload);
      if (response?.peselWarning) {
        toast.warning(response.peselWarning);
      }
      toast.success("Rejestracja zakończona.");
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

  const canSubmit = normalizePesel(completeRegPesel).length === 11 &&
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.sex?.trim();

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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PESEL <span className="text-red-500">*</span></label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={completeRegPesel}
              onChange={(e) => setCompleteRegPesel(normalizePesel(e.target.value))}
              placeholder="11 cyfr"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {peselCheckLoading && <p className="text-xs text-gray-500 mt-1">Sprawdzam PESEL...</p>}
            {completeRegPesel.length === 11 && (peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)) && (
              <p className="mt-1 text-sm text-amber-600">{peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)}</p>
            )}
            {peselExists && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Pacjent o podanym numerze PESEL już istnieje w systemie.</p>
                <button type="button" onClick={handleLoadExisting} className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                  Załaduj dane istniejącego pacjenta
                </button>
              </div>
            )}
          </div>
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
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))} placeholder="9 cyfr" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full p-2 border rounded-lg" />
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
    </div>
  );
}
