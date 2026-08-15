import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  activatePin,
  checkKioskPesel,
  clearKioskToken,
  completeKioskRegistration,
  releaseKioskSession,
  releaseKioskSessionOnUnload,
  saveKioskForm,
} from "../../helpers/kioskHelper";
import { normalizePesel } from "../../utils/peselUtils";
import AdultRegistrationForm from "./AdultRegistrationForm";
import InternationalRegistrationForm from "./InternationalRegistrationForm";
import MinorRegistrationForm from "./MinorRegistrationForm";
import InternationalPatientStep from "./InternationalPatientStep";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";
import KioskNumericEntry from "./KioskNumericEntry";

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
  const [peselAttempts, setPeselAttempts] = useState(0);
  const [showPeselFallback, setShowPeselFallback] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState("");
  const idleTimerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(0);

  const resetToPin = useCallback(() => {
    clearKioskToken();
    setStep(STEPS.PIN);
    setPin("");
    setPesel("");
    setSessionInfo(null);
    setFormData({});
    setMode("full_registration");
    setPatientType(PATIENT_TYPES.ADULT);
    setPeselAttempts(0);
    setShowPeselFallback(false);
    setLastErrorMessage("");
  }, []);

  /** Expire session on server so reception listing updates, then return to PIN. */
  const endSessionAndReset = useCallback(
    async (reason = "interrupted") => {
      await releaseKioskSession(reason);
      resetToPin();
    },
    [resetToPin]
  );

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (step === STEPS.PIN || step === STEPS.DONE) return;
    idleTimerRef.current = setTimeout(() => {
      toast.info("Sesja wygasła z powodu braku aktywności.");
      endSessionAndReset("idle");
    }, IDLE_TIMEOUT_MS);
  }, [step, endSessionAndReset]);

  // Throttled save function to prevent infinite API calls
  const handleFormDataChange = useCallback((updatedFormData) => {
    setFormData(updatedFormData);

    // Valid PESEL → type from PESEL age; fallback → type from manually entered DOB
    const detectedType = detectPatientType(updatedFormData);
    setPatientType((prev) => {
      if (prev === detectedType) return prev;

      if (
        detectedType === PATIENT_TYPES.MINOR_UNDER_16 ||
        detectedType === PATIENT_TYPES.MINOR_16_17
      ) {
        toast.info(
          detectedType === PATIENT_TYPES.MINOR_UNDER_16
            ? "Wykryto pacjenta poniżej 16 lat — wymagane dane i podpis opiekuna."
            : "Wykryto pacjenta 16–17 lat — wymagane dane opiekuna oraz podpisy pacjenta i opiekuna."
        );
      }

      return detectedType;
    });
  }, []);

  const throttledSaveKioskForm = useCallback((formData) => {
    // Keep heavy scan payloads out of autosave (sent on complete). Avoids 413 / iPad freezes.
    const {
      documentScans: _scans,
      uploadedDocuments: _uploaded,
      ...lightweightForm
    } = formData || {};

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    
    // Prevent saves more frequent than every 3 seconds
    if (timeSinceLastSave < 3000) {
      // Clear existing timeout and set a new one
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        lastSaveRef.current = Date.now();
        saveKioskForm(lightweightForm).catch(err => {
          console.error('Auto-save failed:', err);
        });
        saveTimeoutRef.current = null;
      }, 3000 - timeSinceLastSave);
      
      return;
    }
    
    // Save immediately if enough time has passed
    lastSaveRef.current = now;
    saveKioskForm(lightweightForm).catch(err => {
      console.error('Auto-save failed:', err);
    });
  }, []);

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
      onAutoSave: throttledSaveKioskForm,
      onFormDataChange: handleFormDataChange,
      loading,
    };

    // Remount when patient type changes (e.g. fallback DOB switches adult → minor)
    const formKey = `${patientType}-${formData.peselFallbackMode ? "fallback" : "valid"}`;

    switch (patientType) {
      case PATIENT_TYPES.INTERNATIONAL:
        return <InternationalRegistrationForm key={formKey} {...commonProps} />;
      case PATIENT_TYPES.MINOR_UNDER_16:
      case PATIENT_TYPES.MINOR_16_17:
        return <MinorRegistrationForm key={formKey} {...commonProps} />;
      default:
        return <AdultRegistrationForm key={formKey} {...commonProps} />;
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
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resetIdleTimer]);

  // After hard refresh: leftover token means the previous session was interrupted
  useEffect(() => {
    if (step !== STEPS.PIN) return undefined;
    let cancelled = false;
    (async () => {
      const released = await releaseKioskSession("interrupted");
      if (!cancelled && released) {
        clearKioskToken();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step]);

  // Refresh / close tab: expire session so reception status leaves "Formularz w trakcie"
  useEffect(() => {
    if (step === STEPS.PIN || step === STEPS.DONE) return undefined;

    const onUnload = () => {
      releaseKioskSessionOnUnload("interrupted");
    };

    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [step]);

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
        pesel: normalized,
        peselFallbackMode: false, // Valid PESEL → DOB/gender from PESEL take priority
      };
      
      // Detect patient type based on PESEL/age
      const detectedType = detectPatientType(updatedFormData);
      
      setFormData(updatedFormData);
      setMode(res.mode || "full_registration");
      setPatientType(detectedType);
      setSessionInfo(res.sessionInfo || null);
      setStep(STEPS.FORM);
      
      // Reset attempts on success
      setPeselAttempts(0);
      setShowPeselFallback(false);
      setLastErrorMessage("");
      
      // Show appropriate message based on patient type
      let message = res.message || "PESEL zweryfikowany.";
      if (detectedType === PATIENT_TYPES.MINOR_UNDER_16) {
        message = "Pacjent poniżej 16 lat - wymagany podpis opiekuna.";
      } else if (detectedType === PATIENT_TYPES.MINOR_16_17) {
        message = "Pacjent 16-17 lat - wymagane podpisy pacjenta i opiekuna.";
      }
      
      toast.success(message);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Nie można zweryfikować PESEL.";
      const newAttempts = peselAttempts + 1;
      
      setPeselAttempts(newAttempts);
      setLastErrorMessage(errorMessage);
      
      // Show fallback option after 2 failed attempts
      if (newAttempts >= 2) {
        setShowPeselFallback(true);
        toast.error(`${errorMessage} Po ${newAttempts} nieudanych próbach możesz wybrać opcję kontynuowania.`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePeselFallback = async () => {
    const normalized = normalizePesel(pesel);

    // Fallback: do NOT trust PESEL-extracted DOB/gender — user must enter them
    const fallbackFormData = {
      pesel: normalized,
      peselFallbackMode: true,
      dateOfBirth: "",
      sex: "",
    };

    setFormData(fallbackFormData);
    setMode("full_registration");
    setPatientType(PATIENT_TYPES.ADULT); // updated after manual DOB is entered
    setSessionInfo(null);
    setStep(STEPS.FORM);

    setPeselAttempts(0);
    setShowPeselFallback(false);
    setLastErrorMessage("");

    toast.success(
      "Kontynuowanie mimo błędu PESEL. Wprowadź datę urodzenia i płeć ręcznie — dane zweryfikuje personel."
    );
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

  // Calculate total steps based on patient type
  const isMinorPatient = patientType === PATIENT_TYPES.MINOR_UNDER_16 || patientType === PATIENT_TYPES.MINOR_16_17;
  const totalSteps = isMinorPatient ? 6 : 5; // Minors have 6 steps, adults have 5
  const stepIndicator = step === STEPS.PESEL ? 1 : step === STEPS.FORM ? 2 : step === STEPS.DONE ? totalSteps + 1 : 0;

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-gradient-to-b from-teal-50 to-white flex flex-col">
      <header className="shrink-0 sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <img
            src="/images/cm7-logo.png"
            alt="Centrum Medyczne 7"
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
          />
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">CM7</h1>
            <p className="text-xs sm:text-sm text-gray-500">Rejestracja pacjenta</p>
          </div>
        </div>
        {stepIndicator > 0 && step !== STEPS.DONE && (
          <div className="max-w-3xl mx-auto mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <div className="text-xs sm:text-sm text-gray-500">
                Krok {stepIndicator} z {totalSteps}
                {step === STEPS.PESEL && " · Weryfikacja tożsamości"}
                {step === STEPS.FORM && ` · ${getFormTitle(patientType)}`}
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full ${stepIndicator >= n ? "bg-teal-600" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      <main
        className={`flex-1 min-h-0 flex flex-col ${
          step === STEPS.FORM ? "overflow-hidden" : "overflow-y-auto overscroll-contain"
        }`}
      >
        <div
          className={`w-full max-w-3xl mx-auto flex flex-col min-h-0 ${
            step === STEPS.FORM ? "flex-1 h-full px-3 sm:px-4 pb-0 pt-2" : "px-4 sm:px-6 py-3"
          }`}
        >
          {step === STEPS.PIN && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5">
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Wprowadź kod PIN</h2>
              <p className="text-center text-gray-500 mb-3 text-sm">Kod otrzymasz od pracownika rejestracji</p>
              <KioskNumericEntry
                value={pin}
                onChange={setPin}
                maxLength={6}
                size="lg"
                compactKeypad
                disabled={loading}
                enableHardwareKeyboard
                autoFocus
                className="mb-3"
              />
              <button
                type="button"
                onClick={handleActivate}
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-3 rounded-xl"
              >
                {loading ? "Łączenie..." : "Dalej"}
              </button>
            </div>
          )}

          {step === STEPS.PESEL && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5">
              <button
                type="button"
                onClick={() => endSessionAndReset("interrupted")}
                className="text-sm text-teal-700 mb-2 hover:underline"
              >
                ← Wróć do PIN
              </button>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Weryfikacja tożsamości</h2>
              <p className="text-center text-gray-500 mb-3 text-sm">Wprowadź numer PESEL lub wybierz pacjent zagraniczny</p>
              
              <KioskNumericEntry
                value={pesel}
                onChange={(value) => {
                  setPesel(value);
                  // Reset fallback state when PESEL changes
                  if (value !== pesel) {
                    setPeselAttempts(0);
                    setShowPeselFallback(false);
                    setLastErrorMessage("");
                  }
                }}
                maxLength={11}
                size="pesel"
                compactKeypad
                showActiveCursor
                disabled={loading}
                enableHardwareKeyboard
                autoFocus
                className="mb-3"
              />
              
              <button
                type="button"
                onClick={handlePeselCheck}
                disabled={loading || pesel.length !== 11}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-3 rounded-xl mb-3"
              >
                {loading ? "Sprawdzanie..." : "Weryfikuj PESEL"}
              </button>

              {showPeselFallback && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-800">System nie może zweryfikować tego numeru PESEL</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Ostatni błąd: {lastErrorMessage}</p>
                        <p className="mt-2">
                          Jeśli jesteś pewien, że numer PESEL jest poprawny, możesz kontynuować rejestrację. 
                          Dane będą wymagały dodatkowej weryfikacji przez personel.
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handlePeselFallback}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm py-3 px-4 rounded-lg transition-colors"
                        >
                          Kontynuuj mimo błędu walidacji
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 border-b border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    if (patientType === PATIENT_TYPES.INTERNATIONAL) {
                      setStep(STEPS.INTERNATIONAL);
                    } else {
                      setStep(STEPS.PESEL);
                    }
                  }}
                  className="text-sm text-teal-700 mb-1 hover:underline touch-manipulation"
                >
                  ← Wróć do weryfikacji
                </button>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {mode === "sign_only"
                    ? "Podpis dokumentów"
                    : mode === "data_correction"
                      ? "Aktualizacja danych pacjenta"
                      : getFormTitle(patientType)}
                </h2>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">{renderForm()}</div>
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
