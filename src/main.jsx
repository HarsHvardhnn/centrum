import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import routes from "./routes";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/userContext";
import { LoaderProvider } from "./context/LoaderContext";
import { Toaster } from "sonner"; // 👈 import sonner's Toaster
import { ServicesProvider } from "./context/serviceContext";
import { SpecializationProvider } from "./context/SpecializationContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <LoaderProvider>
        <UserProvider>
          <ServicesProvider>
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}
            >
              <SpecializationProvider>
                <RouterProvider router={routes} />
                <Toaster richColors position="top-right" />
              </SpecializationProvider>
            </GoogleOAuthProvider>
          </ServicesProvider>
        </UserProvider>
      </LoaderProvider>
    </HelmetProvider>
  </React.StrictMode>
);
