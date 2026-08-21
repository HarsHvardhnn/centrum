import React, { useState, useEffect } from "react";
import { Clock, LogOut } from "lucide-react";
import { formatTimeRemaining } from "../../utils/jwtUtils";

const InactivityPopup = ({ inactivityTimeout, onStayActive, onLogout }) => {
  // Use a shorter countdown time for the popup (30 seconds) instead of the full inactivity timeout
  const POPUP_COUNTDOWN_MS = 30 * 1000; // 30 seconds
  const [countdown, setCountdown] = useState(POPUP_COUNTDOWN_MS);
  const [isStaying, setIsStaying] = useState(false);

  // Countdown timer - give user time to respond
  useEffect(() => {
    if (!inactivityTimeout || inactivityTimeout <= 0) {
      return;
    }

    setCountdown(POPUP_COUNTDOWN_MS);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newCountdown = prev - 1000;
        if (newCountdown <= 0) {
          // Time's up, auto logout
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onLogout]);

  const handleStayActive = () => {
    setIsStaying(true);
    onStayActive();
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleStayActive}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start mb-4">
          <div className="rounded-full p-3 mr-4 bg-orange-100">
            <Clock className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Brak aktywności wykryty
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nie wykryto żadnej aktywności przez określony czas. Zostaniesz automatycznie wylogowany za{" "}
              <strong>{formatTimeRemaining(countdown)}</strong>. Aby pozostać w systemie, kliknij "Pozostań aktywny".
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStayActive}
            disabled={isStaying}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="mr-2" size={18} />
            {isStaying ? "Przedłużanie..." : "Pozostań aktywny"}
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

export default InactivityPopup;
