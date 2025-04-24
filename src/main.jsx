import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import routes from "./routes";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/userContext";
import { LoaderProvider } from "./context/LoaderContext";
import { Toaster } from "sonner"; // 👈 import sonner's Toaster
import { ServicesProvider } from "./context/serviceContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoaderProvider>
      <UserProvider>
        <ServicesProvider>

        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}
          >
          <RouterProvider router={routes} />
          <Toaster richColors position="top-right" /> 
        </GoogleOAuthProvider>
          </ServicesProvider>
      </UserProvider>
    </LoaderProvider>
  </React.StrictMode>
);
