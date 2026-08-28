import { createContext, useContext } from "react";

/** Isolated module — avoids circular imports with TokenExpiryPopup / InactivityPopup. */
export const SessionContext = createContext(null);

export function useSession() {
  return useContext(SessionContext);
}
