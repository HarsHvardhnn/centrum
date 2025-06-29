import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import LogoMark from "../../assets/logo_new.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { apiCaller, setCookie } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { useUser } from "../../context/userContext";

const AuthForm = ({ isLogin = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA States
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [activeTab, setActiveTab] = useState('sms');
  const [codes, setCodes] = useState({
    sms: '',
    email: '',
    backup: ''
  });
  const [resendCooldown, setResendCooldown] = useState(0);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { setUser } = useUser();

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Initial form values
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  };

  // OTP form values
  const otpInitialValues = {
    otp: "",
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation schemas
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Nieprawidłowy format email")
      .required("Email jest wymagany"),
    password: Yup.string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .required("Hasło jest wymagane"),
  });

  const signupSchema = Yup.object().shape({
    firstName: Yup.string().required("Imię jest wymagane"),
    lastName: Yup.string().required("Nazwisko jest wymagane"),
    email: Yup.string()
      .email("Nieprawidłowy format email")
      .required("Email jest wymagany"),
    password: Yup.string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .required("Hasło jest wymagane"),
    phone: Yup.string()
      .matches(/^\d{9}$/, "Numer telefonu musi składać się z dokładnie 9 cyfr")
      .optional(),
  });

  const otpSchema = Yup.object().shape({
    otp: Yup.string()
      .required("Kod weryfikacyjny jest wymagany")
      .length(6, "Kod OTP musi mieć 6 cyfr"),
  });

  // 2FA API Functions
  const verify2FA = async (tempToken, verificationData) => {
    try {
      const response = await apiCaller("POST", "/auth/2fa/verify", {
        tempToken,
        ...verificationData
      });

      if (response.data.success !== false) {
        // Success - store token and redirect
        const userStr = JSON.stringify(response.data.user);
        setCookie('authToken', response.data.token, 7);
        setCookie('user', userStr, 7);
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", userStr);
        setUser(response.data.user || {});

        toast.success("Logowanie zakończone sukcesem!");

        if (response.data.user.role === "patient") {
          navigate("/user");
        } else {
          navigate("/admin");
        }

        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.data.message, 
          attemptsLeft: response.data.attemptsLeft 
        };
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Błąd podczas weryfikacji kodu" 
      };
    }
  };

  const resend2FACode = async (tempToken, method = 'sms') => {
    try {
      const response = await apiCaller("POST", "/auth/2fa/resend", {
        tempToken,
        method
      });

      if (response.data.success !== false) {
        return { success: true, message: response.data.message, method: response.data.method };
      } else {
        return { 
          success: false, 
          error: response.data.message, 
          canResendAt: response.data.canResendAt 
        };
      }
    } catch (error) {
      console.error('Resend code error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Błąd podczas wysyłania kodu" 
      };
    }
  };

  const requestEmailFallback = async (tempToken) => {
    try {
      const response = await apiCaller("POST", "/auth/2fa/email-fallback", {
        tempToken
      });

      if (response.data.success !== false) {
        return { success: true, message: response.data.message, email: response.data.email };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Email fallback error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Błąd podczas wysyłania kodu email" 
      };
    }
  };

  // Google OAuth handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await apiCaller("POST", "/auth/google", {
        token: credentialResponse.credential,
      });
      toast.success("Logowanie przez Google powiodło się");

      const userStr = JSON.stringify(response.data.user);
      setCookie('authToken', response.data.token, 7);
      setCookie('user', userStr, 7);
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", userStr);
      setUser(response.data.user || {});

      if (response.data.user.role === "patient") {
        navigate("/user");
        return;
      }
      navigate("/admin");
    } catch (error) {
      toast.error(
        "Logowanie przez Google nie powiodło się: " + 
        (error.response?.data?.message || error.message)
      );
    }
  };

  // Enhanced login submission handler with 2FA support
  const handleLoginSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await apiCaller("POST", "/auth/login", {
        email: values.email,
        password: values.password,
      });

      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        // Show 2FA verification form with multiple options
        setTwoFactorData({
          tempToken: response.data.tempToken,
          phone: response.data.phone,
          email: response.data.email,
          availableMethods: response.data.availableMethods || ['sms', 'email', 'backup']
        });
        
        // Set default tab based on available methods
        const defaultMethod = response.data.availableMethods?.includes('sms') ? 'sms' : 'email';
        setActiveTab(defaultMethod);
        setShowTwoFactor(true);
        
        toast.info("Kod weryfikacyjny został wysłany");
      } else {
        // Normal login - store token and redirect
        const userStr = JSON.stringify(response.data.user);
        setCookie('authToken', response.data.token, 7);
        setCookie('user', userStr, 7);
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", userStr);
        setUser(response.data.user || {});

        toast.success("Logowanie zakończone sukcesem!");

        if (response.data.user.role === "patient") {
          navigate("/user");
        } else {
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      setErrors({
        submit:
          error.response?.data?.message ||
          "Logowanie nie powiodło się. Spróbuj ponownie.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 2FA verification handler
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTwoFactorError('');

    try {
      let verificationData = {};
      
      switch (activeTab) {
        case 'sms':
          verificationData = { smsCode: codes.sms };
          break;
        case 'email':
          verificationData = { emailCode: codes.email };
          break;
        case 'backup':
          verificationData = { backupCode: codes.backup };
          break;
      }

      const result = await verify2FA(twoFactorData.tempToken, verificationData);
      
      if (!result.success) {
        setTwoFactorError(result.error);
      }
    } catch (error) {
      setTwoFactorError('Błąd podczas weryfikacji kodu');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code handler
  const handleResendCode = async (method) => {
    try {
      const result = await resend2FACode(twoFactorData.tempToken, method);
      
      if (result.success) {
        setResendCooldown(60);
        toast.success(`Kod ${method === 'sms' ? 'SMS' : 'email'} został wysłany ponownie`);
        setTwoFactorError('');
      } else {
        setTwoFactorError(result.error);
      }
    } catch (error) {
      setTwoFactorError('Błąd podczas wysyłania kodu');
    }
  };

  // Email fallback handler
  const handleEmailFallback = async () => {
    try {
      const result = await requestEmailFallback(twoFactorData.tempToken);
      
      if (result.success) {
        setActiveTab('email');
        setTwoFactorError('');
        toast.success('Kod został wysłany na email');
      } else {
        setTwoFactorError(result.error);
      }
    } catch (error) {
      setTwoFactorError('Błąd podczas wysyłania kodu email');
    }
  };

  // Handle code input changes
  const handleCodeChange = (method, value) => {
    setCodes(prev => ({ ...prev, [method]: value }));
  };

  // Signup submission handler
  const handleSignupSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const formattedPhone = values.phone ? `+48${values.phone}` : "";
      
      const response = await apiCaller("POST", "/auth/signup", {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: "patient",
        phone: formattedPhone,
      });

      setEmail(values.email);
      setRegistrationData({...values, phone: formattedPhone});
      setShowOtpScreen(true);
    } catch (error) {
      console.error(
        "Signup failed:",
        error.response?.data?.message || error.message
      );
      setErrors({
        submit:
          error.response?.data?.message ||
          "Rejestracja nie powiodła się. Spróbuj ponownie.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await apiCaller("POST", "/auth/verify-otp", {
        email: email,
        otp: values.otp,
        password: values?.password,
        purpose: "signup",
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        role: "patient",
      });

      localStorage.setItem("authToken", response.data.token);
      navigate("/admin");
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.data?.message || error.message
      );
      setErrors({
        submit:
          error.response?.data?.message ||
          "Weryfikacja kodu OTP nie powiodła się. Spróbuj ponownie.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleResendOTP = async () => {
    try {
      const response = await apiCaller("POST", "/auth/signup", {
        email: email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        role: "patient",
        phone: registrationData.phone || "",
      });

      alert("Kod OTP wysłany ponownie!");
    } catch (error) {
      console.error(
        "Failed to resend OTP:",
        error.response?.data?.message || error.message
      );
      alert("Nie udało się wysłać kodu OTP. Spróbuj ponownie.");
    }
  };

  return (
    <div className="w-full px-4 flex flex-col items-center gap-6 py-8">
      <div className="flex items-center justify-center w-full">
        <img src={LogoMark} alt="Centrum Medyczne" className="h-16" />
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        {showTwoFactor ? (
          // 2FA Verification Screen
          <div className="two-factor-form">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2 text-center">
              Weryfikacja dwuskładnikowa
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Wybierz metodę weryfikacji:
            </p>
            
            {/* Method Tabs */}
            <div className="method-tabs flex mb-6 border-b border-gray-200">
              {twoFactorData?.availableMethods?.includes('sms') && (
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'sms' 
                      ? 'border-[#80C5C5] text-[#80C5C5]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('sms')}
                >
                  SMS ({twoFactorData.phone})
                </button>
              )}
              {twoFactorData?.availableMethods?.includes('email') && (
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'email' 
                      ? 'border-[#80C5C5] text-[#80C5C5]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('email')}
                >
                  Email ({twoFactorData.email})
                </button>
              )}
              {twoFactorData?.availableMethods?.includes('backup') && (
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'backup' 
                      ? 'border-[#80C5C5] text-[#80C5C5]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('backup')}
                >
                  Kod zapasowy
                </button>
              )}
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-6">
              {/* SMS Tab */}
              {activeTab === 'sms' && (
                <div className="tab-content">
                  <p className="text-sm text-gray-600 mb-4">
                    Kod został wysłany na numer {twoFactorData.phone}
                  </p>
                  <input
                    type="text"
                    placeholder="Wprowadź kod SMS"
                    value={codes.sms}
                    onChange={(e) => handleCodeChange('sms', e.target.value)}
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80C5C5] focus:border-transparent"
                    required
                  />
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleResendCode('sms')}
                      disabled={resendCooldown > 0 || isVerifying}
                      className="text-sm text-[#80C5C5] hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Wyślij ponownie (${resendCooldown}s)` : 'Wyślij ponownie SMS'}
                    </button>
                    <button
                      type="button"
                      onClick={handleEmailFallback}
                      disabled={isVerifying}
                      className="text-sm bg-yellow-100 text-yellow-800 py-2 px-3 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      Nie otrzymałem SMS - wyślij email
                    </button>
                  </div>
                </div>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <div className="tab-content">
                  <p className="text-sm text-gray-600 mb-4">
                    Kod został wysłany na adres {twoFactorData.email}
                  </p>
                  <input
                    type="text"
                    placeholder="Wprowadź kod z email"
                    value={codes.email}
                    onChange={(e) => handleCodeChange('email', e.target.value)}
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80C5C5] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleResendCode('email')}
                    disabled={resendCooldown > 0 || isVerifying}
                    className="text-sm text-[#80C5C5] hover:underline disabled:text-gray-400 disabled:no-underline mt-4"
                  >
                    {resendCooldown > 0 ? `Wyślij ponownie (${resendCooldown}s)` : 'Wyślij ponownie email'}
                  </button>
                </div>
              )}

              {/* Backup Code Tab */}
              {activeTab === 'backup' && (
                <div className="tab-content">
                  <p className="text-sm text-gray-600 mb-4">
                    Wprowadź jeden z kodów zapasowych otrzymanych podczas włączania 2FA
                  </p>
                  <input
                    type="text"
                    placeholder="Wprowadź kod zapasowy (np. A1B2C3D4)"
                    value={codes.backup}
                    onChange={(e) => handleCodeChange('backup', e.target.value.toUpperCase())}
                    maxLength="8"
                    className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80C5C5] focus:border-transparent uppercase"
                    required
                  />
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Każdy kod zapasowy można użyć tylko raz
                    </p>
                  </div>
                </div>
              )}

              {twoFactorError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{twoFactorError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Wstecz
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-[#80C5C5] text-white py-2 px-4 rounded-md hover:bg-[#66b3b3] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Weryfikacja...
                    </>
                  ) : (
                    'Zweryfikuj kod'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : showOtpScreen ? (
          // OTP Verification Screen (for registration)
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2 text-center">
              Zweryfikuj swój email
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Wysłaliśmy kod weryfikacyjny na adres <strong>{email}</strong>
            </p>

            <Formik
              initialValues={otpInitialValues}
              validationSchema={otpSchema}
              onSubmit={handleOtpSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6 w-full">
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Kod weryfikacyjny*
                    </label>
                    <Field
                      type="text"
                      id="otp"
                      name="otp"
                      placeholder="Wprowadź 6-cyfrowy kod"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                        errors.otp && touched.otp
                          ? "border-red-500"
                          : "focus:ring-1 focus:ring-[#80C5C5]"
                      }`}
                    />
                    <ErrorMessage
                      name="otp"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {errors.submit && (
                    <div className="text-red-500 text-sm">{errors.submit}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#80C5C5] text-white py-2 px-4 rounded-md hover:bg-[#66b3b3] transition duration-200"
                  >
                    {isSubmitting ? "Weryfikowanie..." : "Zweryfikuj kod"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-[#80C5C5] hover:underline"
                    >
                      Nie otrzymałeś kodu? Wyślij ponownie
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          // Login/Signup Screen
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2 text-center">
              {isLogin
                ? `${t("Zaloguj się do swojego konta")}`
                : "Utwórz konto"}
            </h2>

            {isLogin && (
              <p className="text-gray-500 mb-6 text-lg text-center">
                Witaj ponownie! Wprowadź swoje dane.
              </p>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={isLogin ? loginSchema : signupSchema}
              onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6 w-full">
                  {/* First and Last Name Fields - Only show for signup */}
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Imię*
                        </label>
                        <Field
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="Jan"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                            errors.firstName && touched.firstName
                              ? "border-red-500"
                              : "focus:ring-1 focus:ring-[#80C5C5]"
                          }`}
                        />
                        <ErrorMessage
                          name="firstName"
                          component="p"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-600 mb-1"
                        >
                          Nazwisko*
                        </label>
                        <Field
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Kowalski"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                            errors.lastName && touched.lastName
                              ? "border-red-500"
                              : "focus:ring-1 focus:ring-[#80C5C5]"
                          }`}
                        />
                        <ErrorMessage
                          name="lastName"
                          component="p"
                          className="text-xs text-red-500 mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Email*
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder="hello@example.com"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                        errors.email && touched.email
                          ? "border-red-500"
                          : "focus:ring-1 focus:ring-[#80C5C5]"
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Hasło*
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                          errors.password && touched.password
                            ? "border-red-500"
                            : "focus:ring-1 focus:ring-[#80C5C5]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {showPassword ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          )}
                          {!showPassword && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        Musi mieć co najmniej 8 znaków.
                      </p>
                    )}
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Phone Field - Only show for signup */}
                  {!isLogin && (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-600 mb-1"
                      >
                        Telefon (opcjonalnie)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">+48</span>
                        </div>
                        <Field
                          type="text"
                          id="phone"
                          name="phone"
                          placeholder="123456789"
                          className="w-full pl-12 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                          maxLength={9}
                        />
                      </div>
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-xs text-red-500 mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Wprowadź 9 cyfr bez kierunkowego i spacji.
                      </p>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="text-red-500 text-sm">{errors.submit}</div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#80C5C5] text-white py-2 px-4 rounded-md hover:bg-[#66b3b3] transition duration-200"
                  >
                    {isSubmitting
                      ? isLogin
                        ? "Logowanie..."
                        : "Tworzenie konta..."
                      : isLogin
                      ? "Zaloguj się"
                      : "Utwórz konto"}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Social Login */}
            <div className="mt-6 text-center w-full relative">
              <div className="mt-6 flex flex-col items-center space-y-4">
                {/* Google Login and other social buttons would go here */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
