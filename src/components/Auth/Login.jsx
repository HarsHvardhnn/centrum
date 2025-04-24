import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import LogoMark from "../../assets/Logomark.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { useUser } from "../../context/userContext";

const AuthForm = ({ isLogin = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [email, setEmail] = useState("");
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useUser();

  // Initial form values
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "patient", // Default role
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Rest of the component remains the same...

  // OTP form values
  const otpInitialValues = {
    otp: "",
  };

  // Validation schemas
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const signupSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    phone: Yup.string().optional(),
  });

  const otpSchema = Yup.object().shape({
    otp: Yup.string()
      .required("OTP is required")
      .length(6, "OTP must be 6 digits"),
  });

  // Google OAuth handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await apiCaller("POST", "/auth/google", {
        token: credentialResponse.credential,
      });
      toast.success("Google login successful");

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("response.data.user", response.data.user);
      setUser(response.data.user || {});
      if (response.data.user?.role == "doctor") {
        navigate("/doctors");
        return;
      }
      if (response.data.user.role == "patient") {
        navigate("/user");
        return;
      }
      navigate("/admin");
    } catch (error) {
      console.log("error", error);
      toast.error("Google login failed:", error.response.data.message);
    }
  };

  // Login submission handler
  const handleLoginSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await apiCaller("POST", "/auth/login", {
        email: values.email,
        password: values.password,
      });

      console.log("Login successful:", response.data);

      // Store authentication token
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user || {});
      console.log("response.data.user", response.data.user);

      if (response.data.user?.role == "doctor") {
        navigate("/doctors");
        console.log(":doctor");
        return;
      }
      if (response.data.user.role == "patient") {
        navigate("/user");
        console.log(":pattients");

        return;
      }
      navigate("/admin");
      console.log(":nilll");

      // Navigate to home page
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      setErrors({
        submit:
          error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Signup submission handler
  const handleSignupSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await apiCaller("POST", "/auth/signup", {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: "patient", // Default role for signup
        phone: values.phone || "",
      });

      console.log("Signup initiated:", response.data);

      // Store email for OTP verification
      setEmail(values.email);
      setRegistrationData(values);

      // Show OTP verification screen
      setShowOtpScreen(true);
    } catch (error) {
      console.error(
        "Signup failed:",
        error.response?.data?.message || error.message
      );
      setErrors({
        submit:
          error.response?.data?.message || "Signup failed. Please try again.",
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

      console.log("OTP verification successful:", response.data);

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
          "OTP verification failed. Please try again.",
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

      console.log("OTP resent:", response.data);
      alert("OTP resent successfully!");
    } catch (error) {
      console.error(
        "Failed to resend OTP:",
        error.response?.data?.message || error.message
      );
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="w-full px-4 flex flex-col items-center gap-14 py-8">
      <div className="flex items-center justify-center w-full">
        <img src={LogoMark} alt="Centrum Medyczne" className="h-8" />
        <span className="ml-2 text-gray-800 font-bold text-xl">
          Centrum Medyczne
        </span>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        {showOtpScreen ? (
          // OTP Verification Screen
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2 text-center">
              Verify Your Email
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              We've sent a verification code to <strong>{email}</strong>
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
                      Verification Code*
                    </label>
                    <Field
                      type="text"
                      id="otp"
                      name="otp"
                      placeholder="Enter 6-digit code"
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
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-[#80C5C5] hover:underline"
                    >
                      Didn't receive the code? Resend
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
                ? `${t("Sign in to your account")}`
                : "Create an account"}
            </h2>

            {isLogin && (
              <p className="text-gray-500 mb-6 text-lg text-center">
                Welcome back! Please enter your details.
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
                          First Name*
                        </label>
                        <Field
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="John"
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
                          Last Name*
                        </label>
                        <Field
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
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
                      Password*
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
                            // Icon for hide password
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          ) : (
                            // Icon for show password
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
                        Must be at least 8 characters.
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
                        Phone (optional)
                      </label>
                      <Field
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="+1 123 456 7890"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
                      />
                    </div>
                  )}

                  {/* Forgot Password - Only show for login */}
                  {isLogin && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-[#80C5C5] hover:underline"
                      >
                        Forgot password?
                      </button>
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
                        ? "Signing in..."
                        : "Creating account..."
                      : isLogin
                      ? "Sign in"
                      : "Create account"}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Social Login */}
            <div className="mt-6 text-center w-full relative">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-gray-300"></div>
                <div className="absolute bg-white px-4">
                  <span className="text-sm text-gray-500">OR</span>
                </div>
              </div>

              {/* Social Login Buttons Container */}
              <div className="mt-6 flex flex-col items-center space-y-4">
                {/* Google Login Button */}
                <div className="w-full max-w-xs mx-auto">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      console.log("Google Login Failed");
                      alert("Google login failed. Please try again.");
                    }}
                    useOneTap
                    theme="outline"
                    shape="rectangular"
                    text={isLogin ? "sign_in_with" : "signup_with"}
                    locale="en"
                    width="100%"
                  />
                </div>

                {/* Other Social Login Buttons */}
                <div className="flex justify-center space-x-4 w-full max-w-xs mx-auto">
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 h-11 rounded-md hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 h-11 rounded-md hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.47-3.345c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Link */}
            <p className="mt-4 text-center text-sm text-gray-600">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => navigate(isLogin ? "/signup" : "/login")}
                className="text-[#80C5C5] hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
