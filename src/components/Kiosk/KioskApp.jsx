import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  activatePin,
  checkKioskDocument,
  checkKioskPesel,
  clearKioskToken,
  completeKioskRegistration,
  saveKioskForm,
} from "../../helpers/kioskHelper";
import { normalizePesel } from "../../utils/peselUtils";
import KioskLoadingOverlay from "./KioskLoadingOverlay";
import KioskStepLayout from "./KioskStepLayout";
import KioskConsentsStep from "./KioskConsentsStep";
import KioskVerificationStep from "./KioskVerificationStep";
import {
  KIOSK_STEPS,
  createDefaultKioskForm,
  syncSmsConsentFromHealthcare,
} from "./kioskConstants";
import {
  KioskPersonalStep,
  KioskAddressStep,
  KioskContactStep,
  KioskSignatureStep,
} from "./KioskFormSteps";
import {
  validatePersonalStep,
  validateAddressStep,
  validateContactStep,
  validateConsentsStep,
  validateVerificationStep,
} from "./kioskShared";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export default function KioskApp() {
  const [step, setStep] = useState(KIOSK_STEPS.PIN);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("full_registration");
  const [form, setForm] = useState(createDefaultKioskForm());
  const [consentErrors, setConsentErrors] = useState([]);
  const idleTimerRef = useRef(null);

  const flowSteps =
    mode === "sign_only"
      ? [KIOSK_STEPS.CONSENTS, KIOSK_STEPS.SIGNATURE]
      : [
          KIOSK_STEPS.PERSONAL,
          KIOSK_STEPS.ADDRESS,
          KIOSK_STEPS.CONTACT,
          KIOSK_STEPS.CONSENTS,
          KIOSK_STEPS.SIGNATURE,
        ];

  const resetToPin = useCallback(() => {
    clearKioskToken();
    setStep(KIOSK_STEPS.PIN);
    setPin("");
    setForm(createDefaultKioskForm());
    setMode("full_registration");
    setConsentErrors([]);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (step === KIOSK_STEPS.PIN || step === KIOSK_STEPS.DONE) return;
    idleTimerRef.current = setTimeout(() => {
      toast.info("Sesja wygasła z powodu braku aktywności.");
      resetToPin();
    }, IDLE_TIMEOUT_MS);
  }, [step, resetToPin]);

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

  const autoSaveTimer = useRef(null);
  useEffect(() => {
    if (step === KIOSK_STEPS.PIN || step === KIOSK_STEPS.PESEL || step === KIOSK_STEPS.DONE) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveKioskForm(syncSmsConsentFromHealthcare(form)).catch(() => {});
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, step]);

  const handleActivate = async () => {
    if (pin.replace(/\D/g, "").length !== 6) {
      toast.error("Wprowadź 6-cyfrowy kod PIN.");
      return;
    }
    setLoading(true);
    try {
      await activatePin(pin);
      setStep(KIOSK_STEPS.PESEL);
      toast.success("Połączono z sesją rejestracji.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Nieprawidłowy kod PIN.");
    } finally {
      setLoading(false);
    }
  };

  const applyCheckResponse = (res, overrides = {}) => {
    if (res.peselWarning) toast.warning(res.peselWarning);
    const nextForm = createDefaultKioskForm({
      ...(res.formData || {}),
      ...overrides,
      authorizationChoice: res.formData?.authorizationChoice || "",
      authorizedPersons: res.formData?.authorizedPersons?.length
        ? res.formData.authorizedPersons
        : [{ firstName: "", lastName: "", pesel: "", phoneCode: "+48", phone: "", street: "", zipCode: "", city: "" }],
      documentScans: res.formData?.documentScans || [],
    });
    setForm(nextForm);
    setMode(res.mode || "full_registration");
    setStep(res.mode === "sign_only" ? KIOSK_STEPS.CONSENTS : KIOSK_STEPS.PERSONAL);
    toast.success(res.message);
  };

  const handleVerification = async () => {
    const errors = validateVerificationStep(form);
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    setLoading(true);
    try {
      if (form.isInternationalPatient) {
        const res = await checkKioskDocument({
          documentCountry: form.documentCountry?.trim(),
          documentType: form.documentType?.trim(),
          documentNumber: form.documentNumber?.trim(),
          dateOfBirth: form.dateOfBirth ? String(form.dateOfBirth).slice(0, 10) : undefined,
        });
        applyCheckResponse(res, {
          isInternationalPatient: true,
          pesel: "",
          documentCountry: form.documentCountry?.trim(),
          documentType: form.documentType?.trim(),
          documentNumber: form.documentNumber?.trim(),
          dateOfBirth: form.dateOfBirth,
        });
      } else {
        const normalized = normalizePesel(form.pesel);
        const res = await checkKioskPesel(normalized);
        applyCheckResponse(res, { pesel: normalized, isInternationalPatient: false });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Błąd weryfikacji danych.");
    } finally {
      setLoading(false);
    }
  };

  const handleInternationalToggle = (checked) => {
    setForm((prev) =>
      createDefaultKioskForm({
        ...prev,
        isInternationalPatient: checked,
        pesel: checked ? "" : prev.pesel,
        documentCountry: checked ? prev.documentCountry : "",
        documentType: checked ? prev.documentType : "",
        documentNumber: checked ? prev.documentNumber : "",
        internationalPatientDocumentKey: checked ? prev.internationalPatientDocumentKey : "",
      })
    );
  };

  const goBack = () => {
    if (step === KIOSK_STEPS.PESEL) {
      resetToPin();
      return;
    }
    const idx = flowSteps.indexOf(step);
    if (idx > 0) setStep(flowSteps[idx - 1]);
    else if (mode === "full_registration") setStep(KIOSK_STEPS.PESEL);
  };

  const goNext = () => {
    if (step === KIOSK_STEPS.PERSONAL) {
      const errors = validatePersonalStep(form);
      if (errors.length) {
        toast.error(errors[0]);
        return;
      }
    }
    if (step === KIOSK_STEPS.ADDRESS) {
      const errors = validateAddressStep(form);
      if (errors.length) {
        toast.error(errors[0]);
        return;
      }
    }
    if (step === KIOSK_STEPS.CONTACT) {
      const errors = validateContactStep(form);
      if (errors.length) {
        toast.error(errors[0]);
        return;
      }
    }
    if (step === KIOSK_STEPS.CONSENTS) {
      const errors = validateConsentsStep(form);
      if (errors.length) {
        setConsentErrors(errors);
        toast.error("Uzupełnij wszystkie wymagane zgody.");
        return;
      }
      setConsentErrors([]);
    }
    if (step === KIOSK_STEPS.SIGNATURE) {
      if (!form.signature) {
        toast.error("Podpis jest wymagany.");
        return;
      }
      handleComplete();
      return;
    }

    const idx = flowSteps.indexOf(step);
    if (idx < flowSteps.length - 1) setStep(flowSteps[idx + 1]);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const payload = syncSmsConsentFromHealthcare(form);
      await saveKioskForm(payload);
      const res = await completeKioskRegistration(payload);
      setStep(KIOSK_STEPS.DONE);
      toast.success(res.message || "Rejestracja zakończona.");
      setTimeout(resetToPin, 12000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Nie udało się zakończyć rejestracji.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = flowSteps.indexOf(step);
  const showWizard = flowSteps.includes(step);

  const loadingOverlay =
    loading && step !== KIOSK_STEPS.DONE
      ? {
          [KIOSK_STEPS.PIN]: { title: "Łączenie z sesją…", message: "Weryfikujemy kod PIN." },
          [KIOSK_STEPS.PESEL]: {
            title: "Sprawdzanie danych…",
            message: form.isInternationalPatient
              ? "Weryfikujemy dokument tożsamości."
              : "Weryfikujemy numer PESEL.",
          },
          [KIOSK_STEPS.SIGNATURE]: {
            title: "Kończenie rejestracji…",
            message: "Zapisujemy dane i generujemy dokumenty PDF.",
          },
        }[step] || { title: "Zapisywanie…", message: "Proszę czekać." }
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex flex-col">
      {loadingOverlay && <KioskLoadingOverlay title={loadingOverlay.title} message={loadingOverlay.message} />}

      <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm sticky top-0 z-10">
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
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {step === KIOSK_STEPS.PIN && (
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

          {step === KIOSK_STEPS.PESEL && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <button type="button" onClick={resetToPin} className="text-sm text-teal-700 mb-4 hover:underline">
                ← Wróć do PIN
              </button>
              <KioskVerificationStep
                isInternational={!!form.isInternationalPatient}
                onInternationalChange={handleInternationalToggle}
                pesel={form.pesel}
                onPeselChange={(value) => setForm((prev) => ({ ...prev, pesel: value }))}
                documentCountry={form.documentCountry}
                documentType={form.documentType}
                documentNumber={form.documentNumber}
                dateOfBirth={form.dateOfBirth}
                onDocumentChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
              />
              <button
                type="button"
                onClick={handleVerification}
                disabled={loading}
                className="w-full mt-6 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl"
              >
                {loading ? "Sprawdzanie..." : "Dalej"}
              </button>
            </div>
          )}

          {showWizard && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <KioskStepLayout
                currentStep={step}
                stepIndex={stepIndex}
                totalSteps={flowSteps.length}
                onBack={goBack}
                footer={
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold"
                  >
                    {step === KIOSK_STEPS.SIGNATURE ? "Zakończ rejestrację" : "Dalej"}
                  </button>
                }
              >
                {step === KIOSK_STEPS.PERSONAL && (
                  <KioskPersonalStep form={form} onChange={setForm} readOnly={false} />
                )}
                {step === KIOSK_STEPS.ADDRESS && <KioskAddressStep form={form} onChange={setForm} />}
                {step === KIOSK_STEPS.CONTACT && <KioskContactStep form={form} onChange={setForm} />}
                {step === KIOSK_STEPS.CONSENTS && (
                  <KioskConsentsStep form={form} onChange={setForm} errors={consentErrors} />
                )}
                {step === KIOSK_STEPS.SIGNATURE && <KioskSignatureStep form={form} onChange={setForm} />}
              </KioskStepLayout>
            </div>
          )}

          {step === KIOSK_STEPS.DONE && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Rejestracja zakończona</h2>
              <p className="text-gray-600 mb-8">Dziękujemy. Proszę oddać urządzenie pracownikowi rejestracji.</p>
              <button type="button" onClick={resetToPin} className="text-teal-700 font-medium hover:underline">
                Zamknij
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
