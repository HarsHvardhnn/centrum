import React from "react";

// Session extension on click lives in useInactivityTracker + maybeRefreshSession.
// This used to block the panel with a logout warning when the access token was
// close to expiry, which raced with the refresh interceptor and logged people out.
export default function TokenExpiryPopup() {
  return null;
}
