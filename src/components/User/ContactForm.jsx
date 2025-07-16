import React, { useState, useEffect, useRef } from "react";
import { apiCaller } from "../../utils/axiosInstance";

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    consent: false,
  });
  
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  
  // reCAPTCHA state
  const [showV2Captcha, setShowV2Captcha] = useState(false);
  const [v2CaptchaResponse, setV2CaptchaResponse] = useState("");
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Get CSRF token from cookie
    const getCsrfToken = () => {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf') {
          return value;
        }
      }
      return '';
    };
    setCsrfToken(getCsrfToken());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear error status when user starts typing
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  };

  const executeRecaptchaV3 = () => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha || !window.grecaptcha.execute) {
        reject(new Error('reCAPTCHA v3 not loaded'));
        return;
      }

      window.grecaptcha.execute('6Led3nUrAAAAAGbxFJkTZbB-JDzwTQf7kf-PBzGm', { action: 'contact_form' })
        .then(token => {
          resolve(token);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  useEffect(() => {
    if (showV2Captcha && recaptchaRef.current) {
      const loadCaptcha = () => {
        if (!window.grecaptcha || !window.grecaptcha.render) {
          setTimeout(loadCaptcha, 100);
          return;
        }
        
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: '6Led3nUrAAAAAGbxFJkTZbB-JDzwTQf7kf-PBzGm',
            callback: (response) => {
              setV2CaptchaResponse(response);
              setStatus({ type: "", message: "" });
            },
            'expired-callback': () => {
              setV2CaptchaResponse("");
              setStatus({ type: "error", message: "CAPTCHA wygasła. Proszę spróbować ponownie." });
            }
          });
        } catch (error) {
          console.warn('Error rendering reCAPTCHA:', error);
        }
      };

      loadCaptcha();
    }
  }, [showV2Captcha]);

  const validateForm = () => {
    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Imię i nazwisko jest wymagane." });
      return false;
    }
    
    if (!form.email.trim()) {
      setStatus({ type: "error", message: "Email jest wymagany." });
      return false;
    }
    
    if (!form.subject.trim()) {
      setStatus({ type: "error", message: "Temat jest wymagany." });
      return false;
    }
    
    if (!form.message.trim()) {
      setStatus({ type: "error", message: "Wiadomość jest wymagana." });
      return false;
    }
    
    if (!form.consent) {
      setStatus({ type: "error", message: "Musisz wyrazić zgodę na przetwarzanie danych osobowych." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let recaptchaToken = "";
      let isV2Fallback = false;

      if (showV2Captcha) {
        // Using v2 fallback
        if (!v2CaptchaResponse) {
          setStatus({ type: "error", message: "Proszę potwierdzić CAPTCHA." });
          setLoading(false);
          return;
        }
        recaptchaToken = v2CaptchaResponse;
        isV2Fallback = true;
      } else {
        // Try v3 first
        try {
          recaptchaToken = await executeRecaptchaV3();
          isV2Fallback = false;
        } catch (error) {
          console.warn('reCAPTCHA v3 failed, falling back to v2');
          setShowV2Captcha(true);
          setLoading(false);
          setStatus({ 
            type: "info", 
            message: "Proszę potwierdzić swoją tożsamość za pomocą CAPTCHA poniżej." 
          });
          return;
        }
      }

      const formData = {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        consent: form.consent,
        _csrf: csrfToken,
        recaptchaToken,
        isV2Fallback
      };

      const response = await apiCaller("POST", "/api/contact", formData);
      
      if (response.data.requiresV2) {
        setShowV2Captcha(true);
        setStatus({ 
          type: "info", 
          message: "Proszę potwierdzić swoją tożsamość za pomocą CAPTCHA poniżej." 
        });
        setLoading(false);
        return;
      }

      // Success
      setStatus({ type: "success", message: "Wiadomość została wysłana pomyślnie!" });
      setForm({ 
        name: "", 
        email: "", 
        subject: "", 
        message: "",
        consent: false,
      });
      
      // Reset CAPTCHA state
      setShowV2Captcha(false);
      setV2CaptchaResponse("");
      
      // Reset v2 CAPTCHA if it was shown
      if (recaptchaRef.current && window.grecaptcha) {
        window.grecaptcha.reset();
      }

    } catch (error) {
      console.error('Contact form error:', error);
      
      if (error.response?.data?.code === 'RECAPTCHA_V2_REQUIRED') {
        setShowV2Captcha(true);
        setStatus({ 
          type: "info", 
          message: "Proszę potwierdzić swoją tożsamość za pomocą CAPTCHA poniżej." 
        });
      } else if (error.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setStatus({ 
          type: "error", 
          message: "Przekroczono limit prób. Proszę spróbować ponownie za godzinę." 
        });
      } else {
        setStatus({ 
          type: "error", 
          message: error.response?.data?.message || "Wystąpił błąd podczas wysyłania wiadomości." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6 w-full h-full flex-1">
      <h3 className="md:text-xl font-bold text-neutral-800 mb-1">SKONTAKTUJ SIĘ Z NAMI</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mb-6">
        Kontakt
      </h2>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="hidden" name="_csrf" value={csrfToken} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Imię i nazwisko"
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <input
          type="text"
          name="subject"
          placeholder="Temat"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
          value={form.subject}
          onChange={handleChange}
          required
        />
        
        <textarea
          name="message"
          placeholder="Wiadomość"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full h-32 resize-none"
          value={form.message}
          onChange={handleChange}
          required
        />
        
        {/* Required Consent Checkbox */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="consent"
            id="consent"
            className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
            checked={form.consent}
            onChange={handleChange}
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-700 leading-5">
            <span className="font-medium text-red-600">*</span> Wyrażam zgodę na przetwarzanie moich danych osobowych przez Centrum Medyczne 7 Sp. z o.o. w celu obsługi zapytania przesłanego za pośrednictwem formularza kontaktowego oraz weryfikacji bezpieczeństwa. Zapoznałem(-am) się z{" "}
            <a 
                              href="/regulamin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Regulaminem
            </a>{" "}
            i{" "}
            <a 
              href="/polityka-prywatnosci" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Polityką Prywatności
            </a>{" "}
            i akceptuję ich postanowienia.
          </label>
        </div>

        {/* reCAPTCHA v2 Fallback */}
        {showV2Captcha && (
          <div className="flex flex-col items-center space-y-3">
            <div className="text-sm text-gray-600 text-center">
              <strong>Weryfikacja bezpieczeństwa</strong><br />
              Proszę potwierdzić, że nie jesteś robotem:
            </div>
            <div ref={recaptchaRef} className="flex justify-center"></div>
          </div>
        )}

        {/* Security Info */}
        <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
          🔒 Ten formularz jest chroniony przez reCAPTCHA. Obowiązują{" "}
          <a 
            href="https://policies.google.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-teal-600 underline"
          >
            Polityka prywatności
          </a>{" "}
          i{" "}
          <a 
            href="https://policies.google.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-teal-600 underline"
          >
            Warunki korzystania
          </a>{" "}
          Google.
        </div>
        
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || !form.consent || (showV2Captcha && !v2CaptchaResponse)}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Wysyłanie...</span>
            </span>
          ) : (
            "Wyślij wiadomość"
          )}
        </button>
        
        {status.message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            status.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : status.type === "info"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {status.type === "success" && (
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{status.message}</span>
              </div>
            )}
            {status.type === "info" && (
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{status.message}</span>
              </div>
            )}
            {status.type === "error" && (
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{status.message}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Rate Limiting Info */}
        <div className="text-xs text-gray-400 text-center">
          Możesz wysłać maksymalnie 10 wiadomości na godzinę.
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
