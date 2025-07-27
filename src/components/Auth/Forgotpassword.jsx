import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import LogoMark from "../../assets/Logomark.png";
import { apiCaller } from "../../utils/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Proszę wprowadzić adres email");
      return;
    }

    setLoading(true);
    try {
      // Using the apiCaller to make the request
      const response = await apiCaller("POST", "/auth/request-password-reset", {
        email,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Coś poszło nie tak");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      // Using the apiCaller to resend OTP
      await apiCaller("POST", "/auth/resend-otp", {
        email,
        purpose: "password-reset",
      });
      // Show success message if needed
    } catch (err) {
      setError(
        err.response?.data?.message || "Nie udało się ponownie wysłać emaila"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    if (newPassword.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Hasła nie pasują do siebie");
      return;
    }

    if (!otp) {
      setError("Proszę wprowadzić kod OTP z emaila");
      return;
    }

    setLoading(true);
    try {
      // Using the apiCaller to reset password
      await apiCaller("POST", "/auth/reset-password", {
        resetToken: otp, // Using OTP as the reset token
        newPassword,
        email,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Nie udało się zresetować hasła");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 bg-[#E6F4F4] rounded-lg flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 7H7C5.89543 7 5 7.89543 5 9V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V9C19 7.89543 18.1046 7 17 7Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Zapomniałeś hasła?</h1>
            <p className="text-gray-500 text-center mb-6">
              Nie martw się, wyślemy Ci instrukcje resetowania.
            </p>

            <form onSubmit={handleEmailSubmit} className="w-full">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email*
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    placeholder="Wprowadź swój email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#80C5C5] text-white py-2 rounded-md hover:bg-[#6eb6b6] transition-colors mb-4"
              >
                {loading ? "Przetwarzanie..." : "Zresetuj hasło"}
              </button>
            </form>

            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} className="mr-1" /> Zaloguj się
            </button>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 bg-[#E6F4F4] rounded-lg flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Sprawdź swój email</h1>
            <p className="text-gray-500 text-center mb-2">
              Wysłaliśmy kod OTP do resetowania hasła na
            </p>
            <p className="text-[#80C5C5] mb-6">{email}</p>

            <button
              onClick={() => {
                setStep(3);
              }}
              className="w-full bg-[#80C5C5] text-white py-2 rounded-md hover:bg-[#6eb6b6] transition-colors mb-4"
            >
              Otwórz aplikację email
            </button>

            <div className="flex items-center text-gray-500 mb-4">
              <p>Nie otrzymałeś emaila?</p>
              <button
                onClick={handleResendEmail}
                className="ml-1 text-[#80C5C5] hover:underline"
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "wyślij ponownie"}
              </button>
            </div>

            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} className="mr-1" /> Zaloguj się
            </button>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 bg-[#E6F4F4] rounded-lg flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 7H7C5.89543 7 5 7.89543 5 9V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V9C19 7.89543 18.1046 7 17 7Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Ustaw nowe hasło</h1>
            <p className="text-gray-500 text-center mb-6">
              Twoje nowe hasło musi być inne niż wcześniej używane hasła.
            </p>

            <form onSubmit={handlePasswordReset} className="w-full">
              {/* OTP Input Field */}
              <div className="mb-4">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wprowadź kod OTP*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    placeholder="Wprowadź kod OTP z emaila"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wprowadź nowe hasło*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Wprowadź swoje hasło"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Musi mieć co najmniej 6 znaków
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Potwierdź hasło*
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Wprowadź swoje hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#80C5C5] text-white py-2 rounded-md hover:bg-[#6eb6b6] transition-colors mb-4"
              >
                {loading ? "Przetwarzanie..." : "Zresetuj hasło"}
              </button>
            </form>

            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} className="mr-1" /> Zaloguj się
            </button>
          </div>
        );

      case 4:
        return (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 bg-[#E6F4F4] rounded-lg flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 7H7C5.89543 7 5 7.89543 5 9V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V9C19 7.89543 18.1046 7 17 7Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"
                  stroke="#80C5C5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative mb-4">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#80C5C5] rounded-full flex items-center justify-center text-white">
                ✓
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Hasło zresetowane</h1>
            <p className="text-gray-500 text-center mb-6">
              Twoje hasło zostało pomyślnie zresetowane.
            </p>

            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-[#80C5C5] text-white py-2 rounded-md hover:bg-[#6eb6b6] transition-colors mb-4"
            >
              Powrót do logowania
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-20 h-full p-4">
      <div className="flex items-center">
        <img src={LogoMark} alt="Centrum Medyczne" className="h-8" />
        <div className="flex flex-col">
          <span className="ml-2 text-gray-800 font-bold text-xl">Centrum</span>
          <span className="ml-2 text-gray-800 font-bold text-xl">Medyczne</span>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default ForgotPassword;
