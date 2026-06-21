import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  activatePin,
  checkKioskPesel,
  clearKioskToken,
  completeKioskRegistration,
  saveKioskForm,
} from "../../helpers/kioskHelper";
import { normalizePesel } from "../../utils/peselUtils";
import AdultRegistrationForm from "./AdultRegistrationForm";
import InternationalRegistrationForm from "./InternationalRegistrationForm";
import MinorRegistrationForm from "./MinorRegistrationForm";
import InternationalPatientStep from "./InternationalPatientStep";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";

const STEPS = {
  PIN: "pin",
  PESEL: "pesel",
  INTERNATIONAL: "international",
  FORM: "form",
  DONE: "done",
};

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export default function KioskApp() {
  const [step, setStep] = useState(STEPS.PIN);
  const [pin, setPin] = useState("");
  const [pesel, setPesel] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [mode, setMode] = useState("full_registration");
  const [patientType, setPatientType] = useState(PATIENT_TYPES.ADULT);
  const idleTimerRef = useRef(null);

  const resetToPin = useCallback(() => {
    clearKioskToken();
    setStep(STEPS.PIN);
    setPin("");
    setPesel("");
    setSessionInfo(null);
    setFormData({});
    setMode("full_registration");
    setPatientType(PATIENT_TYPES.ADULT);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (step === STEPS.PIN || step === STEPS.DONE) return;
    idleTimerRef.current = setTimeout(() => {
      toast.info("Sesja wygasła z powodu braku aktywności.");
      resetToPin();
    }, IDLE_TIMEOUT_MS);
  }, [step, resetToPin]);

  const getFormTitle = (type) => {
    switch (type) {
      case PATIENT_TYPES.INTERNATIONAL:
        return "Rejestracja pacjenta zagranicznego";
      case PATIENT_TYPES.MINOR_UNDER_16:
        return "Rejestracja pacjenta poniżej 16 lat";
      case PATIENT_TYPES.MINOR_16_17:
        return "Rejestracja pacjenta 16-17 lat";
      default:
        return "Dane rejestracyjne";
    }
  };

  const renderForm = () => {
    const commonProps = {
      initialData: formData,
      mode,
      onSubmit: handleComplete,
      onAutoSave: saveKioskForm,
      loading,
    };

    switch (patientType) {
      case PATIENT_TYPES.INTERNATIONAL:
        return <InternationalRegistrationForm {...commonProps} />;
      case PATIENT_TYPES.MINOR_UNDER_16:
      case PATIENT_TYPES.MINOR_16_17:
        return <MinorRegistrationForm {...commonProps} />;
      default:
        return <AdultRegistrationForm {...commonProps} />;
    }
  };

  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown", "scroll"];
    const handler = () => resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const handleActivate = async () => {
    if (pin.replace(/\D/g, "").length !== 6) {
      toast.error("Wprowadź 6-cyfrowy kod PIN.");
      return;
    }
    setLoading(true);
    try {
      const res = await activatePin(pin);
      setSessionInfo(res.session);
      setStep(STEPS.PESEL);
      toast.success("Połączono z sesją rejestracji.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Nieprawidłowy kod PIN.");
    } finally {
      setLoading(false);
    }
  };

  const handlePeselCheck = async () => {
    if (pesel.length !== 11) {
      toast.error("PESEL musi mieć 11 cyfr.");
      return;
    }

    const normalized = normalizePesel(pesel);
    setLoading(true);
    try {
      const res = await checkKioskPesel(normalized);
      const updatedFormData = { 
        ...res.formData, 
        pesel: normalized 
      };
      
      // Detect patient type based on PESEL/age
      const detectedType = detectPatientType(updatedFormData);
      
      setFormData(updatedFormData);
      setMode(res.mode || "full_registration");
      setPatientType(detectedType);
      setSessionInfo(res.sessionInfo || null);
      setStep(STEPS.FORM);
      
      // Show appropriate message based on patient type
      let message = res.message || "PESEL zweryfikowany.";
      if (detectedType === PATIENT_TYPES.MINOR_UNDER_16) {
        message = "Pacjent poniżej 16 lat - wymagany podpis opiekuna.";
      } else if (detectedType === PATIENT_TYPES.MINOR_16_17) {
        message = "Pacjent 16-17 lat - wymagane podpisy pacjenta i opiekuna.";
      }
      
      toast.success(message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie można zweryfikować PESEL.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (form) => {
    setLoading(true);
    try {
      await saveKioskForm(form);
      const res = await completeKioskRegistration(form);
      setStep(STEPS.DONE);
      toast.success(res.message || "Rejestracja zakończona.");
      setTimeout(resetToPin, 12000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się zakończyć rejestracji.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = step === STEPS.PESEL ? 1 : step === STEPS.FORM ? 2 : step === STEPS.DONE ? 3 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Centrum Medyczne 7</h1>
            <p className="text-sm text-gray-500">Rejestracja pacjenta</p>
          </div>
          <img
            src="https://res.cloudinary.com/dca740eqo/image/upload/v1760432824/hospital_app/logos/centrum_logo_email.png.png"
            alt="CM7"
            className="h-10"
          />
        </div>
        {stepIndicator > 0 && step !== STEPS.DONE && (
          <div className="max-w-3xl mx-auto mt-4 flex gap-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full ${stepIndicator >= n ? "bg-teal-600" : "bg-gray-200"}`}
              />
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {step === STEPS.PIN && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Wprowadź kod PIN</h2>
              <p className="text-center text-gray-500 mb-8">Kod otrzymasz od pracownika rejestracji</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full text-center text-4xl tracking-[0.5em] font-mono border-2 border-teal-200 rounded-xl py-6 mb-6 focus:border-teal-600 focus:outline-none"
                placeholder="••••••"
                autoFocus
              />
              <button
                type="button"
                onClick={handleActivate}
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl"
              >
                {loading ? "Łączenie..." : "Dalej"}
              </button>
            </div>
          )}

          {step === STEPS.PESEL && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <button
                type="button"
                onClick={resetToPin}
                className="text-sm text-teal-700 mb-4 hover:underline"
              >
                ← Wróć do PIN
              </button>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Weryfikacja tożsamości</h2>
              <p className="text-center text-gray-500 mb-8">Wprowadź numer PESEL lub wybierz pacjent zagraniczny</p>
              
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={pesel}
                onChange={(e) => setPesel(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="w-full text-center text-3xl tracking-widest font-mono border-2 border-teal-200 rounded-xl py-5 mb-6 focus:border-teal-600 focus:outline-none"
                placeholder="00000000000"
                autoFocus
              />
              
              <button
                type="button"
                onClick={handlePeselCheck}
                disabled={loading || pesel.length !== 11}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl mb-4"
              >
                {loading ? "Sprawdzanie..." : "Weryfikuj PESEL"}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(STEPS.INTERNATIONAL)}
                  className="text-teal-700 hover:text-teal-900 font-medium text-sm underline"
                >
                  Pacjent zagraniczny (bez PESEL)
                </button>
              </div>
            </div>
          )}

          {step === STEPS.INTERNATIONAL && (
            <InternationalPatientStep
              onVerified={(data) => {
                setFormData(data.formData);
                setPatientType(data.patientType);
                setMode(data.mode);
                setSessionInfo(data.sessionInfo);
                setStep(STEPS.FORM);
              }}
              onBack={() => setStep(STEPS.PESEL)}
              loading={loading}
            />
          )}

          {step === STEPS.FORM && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <button
                type="button"
                onClick={() => {
                  if (patientType === PATIENT_TYPES.INTERNATIONAL) {
                    setStep(STEPS.INTERNATIONAL);
                  } else {
                    setStep(STEPS.PESEL);
                  }
                }}
                className="text-sm text-teal-700 mb-4 hover:underline"
              >
                ← Wróć do weryfikacji
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {mode === "sign_only" ? "Podpis dokumentów" : getFormTitle(patientType)}
              </h2>
              {renderForm()}
            </div>
          )}

          {step === STEPS.DONE && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Rejestracja zakończona</h2>
              <p className="text-gray-600 mb-8">Dziękujemy. Proszę oddać urządzenie pracownikowi rejestracji.</p>
              <button
                type="button"
                onClick={resetToPin}
                className="text-teal-700 font-medium hover:underline"
              >
                Zamknij
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
