import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import routes from "./routes";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/userContext";
import { LoaderProvider } from "./context/LoaderContext";
import { Toaster } from "sonner"; // 👈 import sonner's Toaster
import { ServicesProvider } from "./context/serviceContext";
import { SpecializationProvider } from "./context/SpecializationContext.jsx";

// Only use StrictMode in development to avoid double renders and hydration issues in production
const AppWrapper = ({ children }) => {
  if (import.meta.env.DEV) {
    return <React.StrictMode>{children}</React.StrictMode>;
  }
  return <>{children}</>;
};

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  const error = event.error || event;
  const errorMessage = error?.message || error?.toString() || '';
  
  // Check if it's React error #300
  if (errorMessage.includes('Minified React error #300') || errorMessage.includes('error #300')) {
    const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
    
    // Auto-refresh for React error #300 (max 2 retries)
    if (retryCount < 2) {
      sessionStorage.setItem('error300_retry', String(retryCount + 1));
      setTimeout(() => {
        sessionStorage.removeItem('error300_retry');
      }, 30000);
      
      // Prevent default error handling and refresh
      event.preventDefault();
      window.location.reload();
      return;
    }
  }
  
  // Log other errors but let ErrorBoundary handle them
  if (import.meta.env.DEV) {
    console.error('Global error:', event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  
  // Check if it's React error #300
  if (reason.includes('Minified React error #300') || reason.includes('error #300')) {
    const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
    
    if (retryCount < 2) {
      sessionStorage.setItem('error300_retry', String(retryCount + 1));
      setTimeout(() => {
        sessionStorage.removeItem('error300_retry');
      }, 30000);
      
      event.preventDefault();
      window.location.reload();
      return;
    }
  }
  
  // Log other errors
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AppWrapper>
    <HelmetProvider>
      <LoaderProvider>
        <UserProvider>
          <ServicesProvider>
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}
            >
              <GoogleReCaptchaProvider
                reCaptchaKey="6Led3nUrAAAAAGbxFJkTZbB-JDzwTQf7kf-PBzGm"
                scriptProps={{
                  async: false,
                  defer: false,
                  appendTo: 'head',
                  nonce: undefined,
                }}
              >
                <SpecializationProvider>
                  <RouterProvider 
                    router={routes}
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  />
                  <Toaster richColors position="top-right" />
                </SpecializationProvider>
              </GoogleReCaptchaProvider>
            </GoogleOAuthProvider>
          </ServicesProvider>
        </UserProvider>
      </LoaderProvider>
    </HelmetProvider>
  </AppWrapper>
);

// Error recovery - if render fails, try to recover
if (import.meta.env.PROD) {
  // In production, add a fallback error handler
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Check for React error #300 and auto-refresh
    if (errorMessage.includes('Minified React error #300') || errorMessage.includes('error #300')) {
      const retryCount = parseInt(sessionStorage.getItem('error300_retry') || '0', 10);
      
      if (retryCount < 2) {
        sessionStorage.setItem('error300_retry', String(retryCount + 1));
        setTimeout(() => {
          sessionStorage.removeItem('error300_retry');
        }, 30000);
        
        // Log to error tracking service
        if (window.gtag) {
          window.gtag('event', 'exception', {
            description: 'React error #300 - Auto-refreshing',
            fatal: false
          });
        }
        
        // Auto-refresh
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
    }
    
    originalConsoleError.apply(console, args);
  };
}
