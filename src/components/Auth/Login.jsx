import React, { useState ,useEffect} from "react";
import LogoMark from "../../assets/Logomark.png";
import { useTranslation } from "react-i18next";
import { translateText } from "../../utils/translate";
const AuthForm = ({ isLogin = false }) => {
    const {t} = useTranslation()

    useEffect(() => {
        const translate = async () => {
          const result = await translateText("Dog is eating", "fr"); // Translate to French
          console.log('result',result)
          };
    
        translate();
      }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "" : "Invalid email format",
      }));
    }
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          value.length >= 8 ? "" : "Password must be at least 8 characters",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!errors.email && !errors.password) {
      if (isLogin) {
        console.log("Login Data:", {
          email: formData.email,
          password: formData.password
        });
        alert("Login successful!");
      } else {
        console.log("Signup Data:", formData);
        alert("Signup successful!");
      }
    }
  };

  return (
    <div className="w-full px-[140px] flex flex-col items-center py-8">
      <div className="mb-6">
        <div className="flex items-center">
          <img src={LogoMark} alt="Centrum Medyczne" className="h-8" />
          <span className="ml-2 text-gray-800 font-medium">
            Centrum Medyczne
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        {isLogin ? `${t("Sign in to your account")}` : "Create an account"}
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        {isLogin ? "Welcome back! Please enter your details." : "Start your 30-day free trial"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Name Field - Only show for signup */}
        {!isLogin && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Abu Fahim"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#80C5C5]"
            />
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
          <input
            type="email"
            id="email"
            name="email"
            placeholder="hello@fahim.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
              errors.email
                ? "border-red-500"
                : "focus:ring-1 focus:ring-[#80C5C5]"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
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
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.password
                  ? "border-red-500"
                  : "focus:ring-1 focus:ring-[#80C5C5]"
              }`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          {!isLogin && (
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters.
            </p>
          )}
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#80C5C5] text-white py-2 px-4 rounded-md hover:bg-[#66b3b3] transition duration-200 mt-4"
        >
          {isLogin ? "Login" : "Get started"}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-6 text-center w-full relative">
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-300"></div>
          <div className="absolute bg-white px-4">
            <span className="text-sm text-gray-500">OR</span>
          </div>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          {/* Social buttons remain the same */}
          <button className="border border-gray-300 w-28 h-11 rounded-md hover:bg-gray-50 transition duration-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </button>
          <button className="border border-gray-300 w-28 h-11 rounded-md hover:bg-gray-50 transition duration-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
              />
              <path
                fill="#4A90E2"
                d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
              />
              <path
                fill="#FBBC05"
                d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
              />
            </svg>
          </button>
          <button className="border border-gray-300 w-28 h-11 rounded-md hover:bg-gray-50 transition duration-200 flex items-center justify-center">
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

      {/* Toggle Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <a href="#" className="text-[#80C5C5] hover:underline">
          {isLogin ? "Sign up" : "Log in"}
        </a>
      </p>
    </div>
  );
};

export default AuthForm;
