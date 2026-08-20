import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  activatePin,
  checkKioskPesel,
  clearKioskToken,
  completeKioskRegistration,
  getKioskToken,
  pingKioskSession,
  releaseKioskSessionReliable,
  releaseKioskSessionOnUnload,
  saveKioskForm,
} from "../../helpers/kioskHelper";
import { analyzePeselForKiosk, normalizePesel } from "../../utils/peselUtils";
import AdultRegistrationForm from "./AdultRegistrationForm";
import InternationalRegistrationForm from "./InternationalRegistrationForm";
import MinorRegistrationForm from "./MinorRegistrationForm";
import InternationalPatientStep from "./InternationalPatientStep";
import { detectPatientType, PATIENT_TYPES, isInternationalMinor, INTERNATIONAL_MINOR_BLOCKED_CODE } from "./PatientTypeDetector";
import KioskNumericEntry from "./KioskNumericEntry";
import KioskLoadingOverlay from "./KioskLoadingOverlay";
import KioskInternationalMinorBlockedModal from "./KioskInternationalMinorBlockedModal";

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
  const [showMinorBlocked, setShowMinorBlocked] = useState(false);
  const [restoring, setRestoring] = useState(() => !!getKioskToken());
  const idleTimerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(0);
  const submittingRef = useRef(false);
  const capturingFileRef = useRef(false);
  const lockTimerRef = useRef(null);
  const heartbeatFailRef = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  const resetToPin = useCallback(() => {
    submittingRef.current = false;
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
    setShowMinorBlocked(false);
  }, []);

  /** Expire session on server so reception listing updates, then return to PIN. */
  const endSessionAndReset = useCallback(
    async (reason = "interrupted") => {
      await releaseKioskSessionReliable(reason);
      resetToPin();
    },
    [resetToPin]
  );

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (step === STEPS.PIN || step === STEPS.DONE || submittingRef.current) return;
    idleTimerRef.current = setTimeout(() => {
      if (submittingRef.current) return;
      toast.info("Sesja została przerwana z powodu braku aktywności.");
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
    if (submittingRef.current) return;
    // Keep heavy scan payloads out of autosave (sent on complete). Avoids 413 / iPad freezes.
    const lightweightScans = (formData.documentScans || [])
      .filter((s) => s?.existingDocumentId && !s?.dataUrl)
      .map((s) => ({
        id: s.id,
        existingDocumentId: s.existingDocumentId,
        name: s.name,
        type: s.type,
        size: s.size,
        url: s.url,
      }));
    const {
      documentScans: _scans,
      uploadedDocuments: _uploaded,
      ...restForm
    } = formData || {};
    const lightweightForm = {
      ...restForm,
      documentScans: lightweightScans,
      existingDocumentScansLoaded: formData.existingDocumentScansLoaded,
    };

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
      onEndRegistration: () => endSessionAndReset("interrupted"),
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

  // Refresh / leftover token = interrupt. Never resume an in-flight form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getKioskToken()) {
        setRestoring(false);
        return;
      }
      try {
        await releaseKioskSessionReliable("interrupted");
      } catch {
        /* best-effort; reception poll / inactivity expire still catch it */
      }
      if (!cancelled) {
        resetToPin();
        setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resetToPin]);

  // Closing the tab, leaving /kiosk, locking the iPad, or going offline
  // must mark the session Interrupted so reception is not left “in progress”.
  useEffect(() => {
    const shouldReleaseOnLeave = () => {
      if (submittingRef.current) return false;
      const current = stepRef.current;
      if (current === STEPS.PIN || current === STEPS.DONE) return false;
      return !!getKioskToken();
    };

    const onLeave = (reason = "interrupted") => {
      if (shouldReleaseOnLeave()) {
        releaseKioskSessionOnUnload(reason);
      }
    };

    const onFilePointerDown = (event) => {
      const target = event.target;
      if (target?.matches?.('input[type="file"]')) {
        capturingFileRef.current = true;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        capturingFileRef.current = false;
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
        return;
      }
      if (document.visibilityState !== "hidden") return;
      if (capturingFileRef.current) return;
      if (!shouldReleaseOnLeave()) return;

      // Ignore Control Center flashes; camera capture is skipped via capturingFileRef.
      lockTimerRef.current = setTimeout(() => {
        lockTimerRef.current = null;
        if (document.visibilityState !== "hidden") return;
        if (capturingFileRef.current) return;
        onLeave("device_lock");
      }, 2500);
    };

    const onLeaveInterrupted = () => onLeave("interrupted");
    const onFreeze = () => onLeave("device_lock");
    const onOffline = () => onLeave("connection_lost");

    document.addEventListener("pointerdown", onFilePointerDown, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeaveInterrupted);
    window.addEventListener("beforeunload", onLeaveInterrupted);
    window.addEventListener("freeze", onFreeze);
    window.addEventListener("offline", onOffline);
    return () => {
      document.removeEventListener("pointerdown", onFilePointerDown, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeaveInterrupted);
      window.removeEventListener("beforeunload", onLeaveInterrupted);
      window.removeEventListener("freeze", onFreeze);
      window.removeEventListener("offline", onOffline);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  // Intercept iPad/browser Back after PIN so the session ends instead of
  // leaving a live "Formularz w trakcie" / "Aktywna" status in reception.
  useEffect(() => {
    if (step === STEPS.PIN || step === STEPS.DONE) return undefined;

    if (window.history.state?.kioskSession !== true) {
      window.history.pushState({ kioskSession: true }, "");
    }

    const onPopState = () => {
      if (submittingRef.current) return;
      endSessionAndReset("interrupted");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [step, endSessionAndReset]);

  // Keep server status aligned with a live kiosk screen.
  useEffect(() => {
    if (restoring || step === STEPS.PIN || step === STEPS.DONE) return undefined;
    let cancelled = false;

    const ping = async () => {
      try {
        const res = await pingKioskSession();
        if (cancelled) return;
        heartbeatFailRef.current = 0;
        if (res?.status && ["expired", "cancelled", "locked", "abandoned"].includes(res.status)) {
          toast.info("Sesja rejestracji została zakończona.");
          resetToPin();
        }
      } catch (err) {
        const status = err.response?.data?.status;
        if (err.response?.status === 401 || ["expired", "cancelled", "locked", "abandoned"].includes(status)) {
          clearKioskToken();
          resetToPin();
          return;
        }
        heartbeatFailRef.current += 1;
        if (heartbeatFailRef.current >= 3 && getKioskToken()) {
          const released = await releaseKioskSessionReliable("connection_lost");
          if (released && !cancelled) {
            toast.info("Sesja została przerwana z powodu utraty połączenia.");
            resetToPin();
          }
        }
      }
    };

    ping();
    const interval = setInterval(ping, 25000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [restoring, step, resetToPin]);

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
    const localCheck = analyzePeselForKiosk(normalized);
    if (!localCheck.valid) {
      toast.error(localCheck.message || "Nie można zweryfikować PESEL.");
      const newAttempts = peselAttempts + 1;
      setPeselAttempts(newAttempts);
      setLastErrorMessage(localCheck.message || "");
      if (localCheck.errorCode !== "future_date_of_birth" && newAttempts >= 2) {
        setShowPeselFallback(true);
      }
      return;
    }

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
      const errorCode = err.response?.data?.errorCode;
      const newAttempts = peselAttempts + 1;
      
      setPeselAttempts(newAttempts);
      setLastErrorMessage(errorMessage);
      
      if (errorCode !== "future_date_of_birth" && newAttempts >= 2) {
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
    if (submittingRef.current) return;
    if (
      isInternationalMinor({
        ...form,
        patientType,
        isInternationalPatient:
          form.isInternationalPatient || patientType === PATIENT_TYPES.INTERNATIONAL,
      })
    ) {
      setShowMinorBlocked(true);
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    try {
      await saveKioskForm(form);
      const res = await completeKioskRegistration(form);
      setStep(STEPS.DONE);
      toast.success(res.message || "Rejestracja zakończona.");
      setTimeout(resetToPin, 12000);
    } catch (err) {
      submittingRef.current = false;
      if (err.response?.data?.errorCode === INTERNATIONAL_MINOR_BLOCKED_CODE) {
        setShowMinorBlocked(true);
      } else {
        toast.error(err.response?.data?.message || "Nie udało się zakończyć rejestracji.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total steps based on patient type
  const isMinorPatient = patientType === PATIENT_TYPES.MINOR_UNDER_16 || patientType === PATIENT_TYPES.MINOR_16_17;
  const totalSteps = isMinorPatient ? 6 : 5; // Minors have 6 steps, adults have 5
  const stepIndicator = step === STEPS.PESEL ? 1 : step === STEPS.FORM ? 2 : step === STEPS.DONE ? totalSteps + 1 : 0;

  const isSubmittingForm = loading && step === STEPS.FORM;

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-gradient-to-b from-teal-50 to-white flex flex-col pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      {restoring && (
        <KioskLoadingOverlay
          title="Zamykanie poprzedniej sesji"
          message="Poprzednia sesja została przerwana. Wprowadź nowy kod PIN od recepcji."
        />
      )}
      {isSubmittingForm && (
        <KioskLoadingOverlay
          title="Zapisywanie rejestracji"
          message="Proszę czekać. Nie zamykaj tej strony i nie klikaj przycisków — trwa zapis danych."
        />
      )}
      <header className="shrink-0 sticky top-0 z-50 bg-white border-b border-gray-200 px-5 sm:px-8 py-3 sm:py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <img
            src="/images/cm7-logo.png"
            alt="Centrum Medyczne 7"
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
          />
          <div className="text-right min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">CM7</h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Rejestracja pacjenta</p>
          </div>
        </div>
        {stepIndicator > 0 && step !== STEPS.DONE && (
          <div className="max-w-5xl mx-auto mt-3">
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
          className={`w-full max-w-5xl mx-auto flex flex-col min-h-0 ${
            step === STEPS.FORM ? "flex-1 h-full px-5 sm:px-8 pb-0 pt-2" : "px-5 sm:px-8 py-3"
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
              onEndRegistration={() => endSessionAndReset("interrupted")}
              loading={loading}
            />
          )}

          {step === STEPS.FORM && (
            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="shrink-0 px-5 sm:px-8 pt-3 pb-2 border-b border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    if (loading) return;
                    if (patientType === PATIENT_TYPES.INTERNATIONAL) {
                      setStep(STEPS.INTERNATIONAL);
                    } else {
                      setStep(STEPS.PESEL);
                    }
                  }}
                  disabled={loading}
                  className="text-sm text-teal-700 mb-1 hover:underline touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
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
              <div
                className={`flex-1 min-h-0 flex flex-col ${loading ? "pointer-events-none select-none" : ""}`}
                aria-hidden={loading}
              >
                {renderForm()}
              </div>
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
      <KioskInternationalMinorBlockedModal
        open={showMinorBlocked}
        onClose={() => setShowMinorBlocked(false)}
        onEndRegistration={() => endSessionAndReset("interrupted")}
      />
    </div>
  );
}
