import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import routes from "./routes";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/userContext";
import { SessionProvider } from "./context/SessionProvider";
import { LoaderProvider } from "./context/LoaderContext";
import { Toaster } from "sonner"; // 👈 import sonner's Toaster
import { ServicesProvider } from "./context/serviceContext";
import { SpecializationProvider } from "./context/SpecializationContext.jsx";
import { queryClient } from "./lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LoaderProvider>
          <UserProvider>
            <SessionProvider>
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
            </SessionProvider>
          </UserProvider>
        </LoaderProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
