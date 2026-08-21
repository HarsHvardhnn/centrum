import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { refreshAccessToken } from "../../utils/axiosInstance";
import { getAccessToken, getTimeUntilExpiry, formatTimeRemaining } from "../../utils/jwtUtils";
import { setSessionWarningActive } from "../../utils/sessionRefresh";
import { useUser } from "../../context/userContext";
import { toast } from "sonner";

const WARNING_MS = 5 * 60 * 1000;

/**
 * Banking-style session warning: when the access token is near expiry,
 * show a modal so the user can extend the session or log out.
 */
const TokenExpiryPopup = () => {
  const { logout, isAuthenticated } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowPopup(false);
      setSessionWarningActive(false);
      return undefined;
    }

    const checkTokenExpiry = () => {
      const token = getAccessToken();
      if (!token) {
        setShowPopup(false);
        setSessionWarningActive(false);
        return;
      }

      const timeUntilExpiry = getTimeUntilExpiry(token);

      if (timeUntilExpiry === null || timeUntilExpiry <= 0) {
        setShowPopup(true);
        setSessionWarningActive(true);
        setTimeRemaining(0);
      } else if (timeUntilExpiry <= WARNING_MS) {
        setShowPopup(true);
        setSessionWarningActive(true);
        setTimeRemaining(timeUntilExpiry);
      } else {
        setShowPopup(false);
        setSessionWarningActive(false);
        setTimeRemaining(timeUntilExpiry);
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Live countdown while popup is open
  useEffect(() => {
    if (!showPopup) return undefined;

    const updateCountdown = () => {
      const token = getAccessToken();
      if (!token) {
        setTimeRemaining(0);
        return;
      }
      const timeUntilExpiry = getTimeUntilExpiry(token);
      if (timeUntilExpiry === null || timeUntilExpiry <= 0) {
        setTimeRemaining(0);
      } else {
        setTimeRemaining(timeUntilExpiry);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [showPopup]);

  // Auto-logout when countdown hits zero
  useEffect(() => {
    if (!showPopup || timeRemaining === null || timeRemaining > 0) return undefined;

    const logoutTimer = setTimeout(() => {
      setShowPopup(false);
      setSessionWarningActive(false);
      logout();
      window.location.href = "/logowanie";
    }, 800);

    return () => clearTimeout(logoutTimer);
  }, [showPopup, timeRemaining, logout]);

  const handleExtendSession = async () => {
    try {
      setIsRefreshing(true);
      await refreshAccessToken();
      toast.success("Sesja została przedłużona");
      setShowPopup(false);
      setSessionWarningActive(false);
      setTimeRemaining(null);
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Nie udało się przedłużyć sesji. Zostaniesz wylogowany.");
      setTimeout(() => {
        setSessionWarningActive(false);
        logout();
        window.location.href = "/logowanie";
      }, 1500);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setShowPopup(false);
    setSessionWarningActive(false);
    logout();
    window.location.href = "/logowanie";
  };

  if (!showPopup) return null;

  const isExpired = timeRemaining !== null && timeRemaining <= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expiry-title"
      >
        <div className="flex items-start mb-4">
          <div
            className={`rounded-full p-3 mr-4 ${
              isExpired ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <AlertCircle
              className={isExpired ? "text-red-600" : "text-amber-600"}
              size={24}
            />
          </div>
          <div className="flex-1">
            <h3
              id="session-expiry-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              {isExpired ? "Sesja wygasła" : "Sesja wkrótce wygaśnie"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isExpired
                ? "Twoja sesja wygasła. Przedłuż sesję, aby kontynuować pracę, albo wyloguj się."
                : (
                  <>
                    Twoja sesja wygaśnie za{" "}
                    <strong>
                      {formatTimeRemaining(Math.max(0, timeRemaining || 0))}
                    </strong>
                    . Możesz przedłużyć sesję lub wylogować się.
                  </>
                )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExtendSession}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Przedłużanie...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={18} />
                Przedłuż sesję
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            <LogOut className="mr-2" size={18} />
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiryPopup;
