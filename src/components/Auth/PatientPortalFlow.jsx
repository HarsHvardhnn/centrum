import React, { useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import LogoMark from "/images/new_logo_cm7.png";
import { toast } from "sonner";

const PESEL_LENGTH = 11;
const PESEL_REGEX = /^\d{11}$/;

const PESEL_NOT_FOUND_MESSAGE =
  "Podany numer PESEL nie został znaleziony w naszym systemie. Portal pacjenta jest dostępny tylko dla pacjentów, którzy mieli już wizytę w Centrum Medycznym 7. Proszę skontaktować się z rejestracją pod numerem 797 127 487, aby utworzyć konto.\n\nThe provided PESEL number was not found in our system. The patient portal is available only for patients who have already had a visit at Centrum Medyczne 7. Please contact reception at 797 127 487 to create your account.";

/**
 * Patient Portal flow: PESEL → check-by-pesel → (if found) email → create-account.
 * Supports both success sources: existing_patient (has visited) and pending_visit (PESEL in tempPesel/pendingPesel).
 * Handles 404 "No patient account found", 409 email taken, 409 alreadyHasAccount (redirect to login).
 */
const PatientPortalFlow = ({ onAlreadyHasAccount, onSwitchToStaff }) => {
  const [step, setStep] = useState("pesel"); // "pesel" | "email" | "success"
  const [pesel, setPesel] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState(null); // "existing_patient" | "pending_visit"
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isPeselValid = (value) => value.replace(/\D/g, "").length === PESEL_LENGTH && PESEL_REGEX.test(value.replace(/\D/g, ""));

  const handlePeselSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cleaned = pesel.replace(/\D/g, "");
    if (!isPeselValid(pesel)) {
      setError("Podaj prawidłowy numer PESEL (11 cyfr).");
      return;
    }
    setLoading(true);
    try {
      const response = await apiCaller("POST", "/api/patient-portal/check-by-pesel", {
        pesel: cleaned,
      });
      if (response.data?.found === true) {
        setSource(response.data.source || "existing_patient");
        setPatientId(response.data.patientId ?? null);
        setStep("email");
      } else {
        setError(PESEL_NOT_FOUND_MESSAGE);
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 404 || data?.found === false) {
        setError(PESEL_NOT_FOUND_MESSAGE);
      } else if (status === 400 && data?.message) {
        setError(data.message);
      } else {
        setError(data?.message || "Wystąpił błąd. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Podaj prawidłowy adres e-mail.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiCaller("POST", "/api/patient-portal/create-account", {
        pesel: pesel.replace(/\D/g, ""),
        email: emailTrimmed,
      });
      if (response.data?.success) {
        setSuccessMessage(response.data.message || "Dane logowania zostały wysłane na podany adres e-mail. Sprawdź skrzynkę (oraz folder spam).");
        setStep("success");
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        if (data?.alreadyHasAccount) {
          toast.info("Ten pacjent ma już konto. Zaloguj się przy użyciu adresu e-mail i hasła.");
          if (typeof onAlreadyHasAccount === "function") {
            onAlreadyHasAccount();
          }
          return;
        }
        setError(data?.message || "Ten adres e-mail jest już przypisany do innego konta. Użyj innego adresu e-mail lub skontaktuj się z rejestracją.");
      } else if (status === 404 || data?.found === false) {
        setError(PESEL_NOT_FOUND_MESSAGE);
      } else if (status === 400 && data?.message) {
        setError(data.message);
      } else {
        setError(data?.message || "Wystąpił błąd. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPesel = () => {
    setStep("pesel");
    setError("");
    setEmail("");
    setSource(null);
    setPatientId(null);
  };

  const emailStepSubtext =
    source === "pending_visit"
      ? "Znaleziono wizytę z tym PESEL. Wprowadź adres e-mail, aby utworzyć konto pacjenta i powiązać tę wizytę."
      : "Wprowadź adres e-mail, na który mają zostać wysłane dane logowania.";

  return (
    <div className="w-full px-4 flex flex-col items-center gap-6 py-8">
      <div className="flex items-center justify-center w-full">
        <img src={LogoMark} alt="Centrum Medyczne" className="h-44 w-auto max-w-sm" />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        {step === "pesel" && (
          <>
            <h2 className="text-3xl font-bold text-[#003f78] mb-2 text-center">
              Portal pacjenta
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Zaloguj się lub utwórz konto. Wprowadź numer PESEL (11 cyfr).
            </p>
            <form onSubmit={handlePeselSubmit} className="space-y-6 w-full">
              <div>
                <label htmlFor="pesel" className="block text-[#003f78] font-medium mb-2">
                  PESEL *
                </label>
                <input
                  id="pesel"
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="np. 99010101234"
                  value={pesel}
                  onChange={(e) => setPesel(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-gray-50 ${
                    error ? "border-red-500" : "border-gray-200 focus:border-[#003f78] focus:bg-white"
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">11 cyfr</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !isPeselValid(pesel)}
                className="w-full bg-[#089090] border-2 border-[#003F78] text-white py-3 px-4 rounded-lg hover:bg-[#067a7a] transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sprawdzanie..." : "Dalej"}
              </button>
            </form>
          </>
        )}

        {step === "email" && (
          <>
            <h2 className="text-3xl font-bold text-[#003f78] mb-2 text-center">
              Adres e-mail do konta
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {emailStepSubtext}
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-6 w-full">
              <div>
                <label htmlFor="email" className="block text-[#003f78] font-medium mb-2">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="np. jan.kowalski@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-gray-50 ${
                    error ? "border-red-500" : "border-gray-200 focus:border-[#003f78] focus:bg-white"
                  }`}
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToPesel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Wstecz
                </button>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex-1 bg-[#089090] border-2 border-[#003F78] text-white py-3 px-4 rounded-lg hover:bg-[#067a7a] transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Wysyłanie..." : "Utwórz konto i wyślij dane"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === "success" && (
          <>
            <h2 className="text-3xl font-bold text-[#003f78] mb-2 text-center">
              Konto utworzone
            </h2>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 text-center">{successMessage}</p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Sprawdź skrzynkę odbiorczą oraz folder spam.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAlreadyHasAccount?.()}
              className="w-full bg-[#089090] border-2 border-[#003F78] text-white py-3 px-4 rounded-lg hover:bg-[#067a7a] transition duration-200 font-semibold"
            >
              Przejdź do logowania
            </button>
          </>
        )}

        {onSwitchToStaff && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onSwitchToStaff}
              className="text-sm text-gray-600 hover:text-[#003f78]"
            >
              Masz już konto? Zaloguj się →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortalFlow;
