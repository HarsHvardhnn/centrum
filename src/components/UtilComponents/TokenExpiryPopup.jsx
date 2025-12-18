import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, LogOut, X } from "lucide-react";
import { apiCaller, setCookie } from "../../utils/axiosInstance";
import { getAccessToken, getTimeUntilExpiry, formatTimeRemaining } from "../../utils/jwtUtils";
import { useUser } from "../../context/userContext";
import { toast } from "sonner";

const TokenExpiryPopup = () => {
  const { logout } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Check token expiry every 10 seconds
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = getAccessToken();
      if (!token) {
        setShowPopup(false);
        return;
      }

      const timeUntilExpiry = getTimeUntilExpiry(token);
      
      if (timeUntilExpiry === null) {
        // Token already expired
        setShowPopup(true);
        setTimeRemaining(0);
      } else {
        // Show popup when less than 5 minutes remaining
        const fiveMinutes = 5 * 60 * 1000;
        if (timeUntilExpiry <= fiveMinutes) {
          setShowPopup(true);
          setTimeRemaining(timeUntilExpiry);
        } else {
          setShowPopup(false);
        }
      }
    };

    // Initial check
    checkTokenExpiry();

    // Check every 10 seconds
    const interval = setInterval(checkTokenExpiry, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update countdown every second when popup is shown
  useEffect(() => {
    if (!showPopup || !timeRemaining) return;

    const updateCountdown = () => {
      const token = getAccessToken();
      if (!token) {
        setShowPopup(false);
        return;
      }

      const timeUntilExpiry = getTimeUntilExpiry(token);
      if (timeUntilExpiry === null || timeUntilExpiry <= 0) {
        setCountdown(0);
        setTimeRemaining(0);
      } else {
        setCountdown(timeUntilExpiry);
        setTimeRemaining(timeUntilExpiry);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [showPopup, timeRemaining]);

  // Auto-logout when token expires (countdown reaches 0)
  useEffect(() => {
    if (showPopup && (countdown === 0 || timeRemaining === 0)) {
      console.log("[TokenExpiryPopup] Token expired, auto-logging out");
      // Small delay to ensure user sees the expired state
      const logoutTimer = setTimeout(() => {
        setShowPopup(false);
        logout();
        window.location.href = "/logowanie";
      }, 1000);

      return () => clearTimeout(logoutTimer);
    }
  }, [showPopup, countdown, timeRemaining, logout]);

  const handleRefreshToken = async () => {
    try {
      setIsRefreshing(true);

      // Refresh token endpoint doesn't require a body - it uses HTTP-only cookies
      // Pass undefined to skip sending any data
      const response = await apiCaller("POST", "/auth/refresh-token", undefined);

      if (response.data && response.data.token) {
        // Update token in storage
        const newToken = response.data.token;
        localStorage.setItem("authToken", newToken);
        setCookie('authToken', newToken, 7);
        
        // Update user data if provided
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        toast.success("Sesja została odświeżona");
        setShowPopup(false);
        setTimeRemaining(null);
        setCountdown(null);
      } else {
        toast.error("Nie udało się odświeżyć sesji");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Nie udało się odświeżyć sesji. Zostaniesz wylogowany.");
      
      // If refresh fails, logout after a short delay
      setTimeout(() => {
        logout();
        window.location.href = "/logowanie";
      }, 2000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setShowPopup(false);
    logout();
    window.location.href = "/logowanie";
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  const isExpired = countdown === 0 || timeRemaining === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-start mb-4">
          <div className={`rounded-full p-3 mr-4 ${isExpired ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertCircle className={isExpired ? 'text-red-600' : 'text-yellow-600'} size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isExpired ? "Sesja wygasła" : "Sesja wkrótce wygaśnie"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isExpired
                ? "Twoja sesja wygasła. Aby kontynuować pracę, odśwież sesję lub wyloguj się."
                : `Twoja sesja wygaśnie za ${countdown ? formatTimeRemaining(countdown) : formatTimeRemaining(timeRemaining)}. Aby kontynuować pracę, odśwież sesję.`}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Odświeżanie...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={18} />
                Odśwież sesję
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
