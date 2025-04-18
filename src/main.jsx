import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import here
import routes from "./routes";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/userContext";



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}
      >
        <RouterProvider router={routes} />
      </GoogleOAuthProvider>
    </UserProvider>
  </React.StrictMode>
);
