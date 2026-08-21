import { useEffect, useRef, useState, useCallback } from "react";
import appointmentConfigService from "../helpers/appointmentConfigHelper";
import { useUser } from "../context/userContext";
import { getCookie } from "../utils/axiosInstance";
import { maybeRefreshSession } from "../utils/sessionRefresh";

/**
 * Custom hook to track user inactivity
 * Monitors keyboard, mouse, touch, and scroll events
 */
export const useInactivityTracker = () => {
  const [inactivityTimeout, setInactivityTimeout] = useState(null); // in milliseconds
  const [isInactive, setIsInactive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { isAuthenticated } = useUser();
  const lastActivityTime = useRef(Date.now());
  const inactivityTimerRef = useRef(null);
  const popupTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const showPopupRef = useRef(false); // Track popup state in ref for event handlers

  // Parse time string to milliseconds - moved before use to ensure it's available
  const parseTimeToMilliseconds = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      console.warn("[InactivityTracker] parseTimeToMilliseconds: Invalid timeString:", timeString);
      return 0;
    }
    
    // Support: m (minutes), h (hours), d (days), w (weeks)
    const match = timeString.match(/^(\d+)([mhdw])$/);
    if (!match) {
      console.warn("[InactivityTracker] parseTimeToMilliseconds: Invalid format:", timeString);
      return 0;
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 'm':
        return value * 60 * 1000; // minutes to milliseconds
      case 'h':
        return value * 60 * 60 * 1000; // hours to milliseconds
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
      case 'w':
        return value * 7 * 24 * 60 * 60 * 1000; // weeks to milliseconds
      default:
        console.warn("[InactivityTracker] parseTimeToMilliseconds: Unknown unit:", unit);
        return 0;
    }
  };

  // Fetch inactivity timeout from config - only when authenticated
  useEffect(() => {
    console.log("[InactivityTracker] useEffect triggered, isAuthenticated:", isAuthenticated);
    
    // Check if user is authenticated before fetching config
    const token = getCookie('authToken') || localStorage.getItem('authToken');
    console.log("[InactivityTracker] Token check - hasToken:", !!token, "isAuthenticated:", isAuthenticated);
    
    if (!isAuthenticated && !token) {
      console.log("[InactivityTracker] Not authenticated and no token, skipping fetch");
      return; // Don't fetch if not authenticated
    }

    const fetchInactivityTimeout = async (retryAttempt = 0) => {
      console.log(`[InactivityTracker] Fetching config, attempt ${retryAttempt + 1}/${maxRetries + 1}`);
      
      try {
        const response = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
        console.log("[InactivityTracker] Config response received:", response);
        
        const timeoutValue = response.data?.value;
        console.log("[InactivityTracker] Timeout value from config:", timeoutValue, "type:", typeof timeoutValue);
        
        if (timeoutValue !== null && timeoutValue !== undefined && timeoutValue !== '') {
          // Convert to milliseconds
          // Handle both string format ("30m", "1h") and number format (assumed to be minutes)
          let timeoutMs = 0;
          
          if (typeof timeoutValue === 'number') {
            // If it's a number, assume it's minutes
            timeoutMs = timeoutValue * 60 * 1000;
            console.log("[InactivityTracker] Number format detected, converted to ms:", timeoutMs);
          } else if (typeof timeoutValue === 'string') {
            // If it's a string, parse it
            timeoutMs = parseTimeToMilliseconds(timeoutValue);
            console.log("[InactivityTracker] String format detected, parsed to ms:", timeoutMs);
          }
          
          if (timeoutMs > 0) {
            console.log("[InactivityTracker] Setting inactivity timeout to:", timeoutMs, "ms");
            setInactivityTimeout(timeoutMs);
            retryCountRef.current = 0; // Reset retry count on success
          } else {
            console.warn("[InactivityTracker] Timeout value is 0 or invalid, not setting. Value was:", timeoutValue);
          }
        } else {
          console.warn("[InactivityTracker] Timeout value is null/undefined/empty:", timeoutValue);
        }
      } catch (error) {
        console.error("[InactivityTracker] Error fetching inactivity timeout:", error);
        console.error("[InactivityTracker] Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          hasResponse: !!error.response
        });
        
        // Retry logic for network errors or 401s (might be token refresh in progress)
        if (retryAttempt < maxRetries && (error.response?.status === 401 || !error.response)) {
          const delay = (retryAttempt + 1) * 1000; // Exponential backoff: 1s, 2s, 3s
          console.log(`[InactivityTracker] Retrying in ${delay}ms...`);
          setTimeout(() => {
            fetchInactivityTimeout(retryAttempt + 1);
          }, delay);
        } else {
          // If all retries failed or it's a different error, log it
          console.error("[InactivityTracker] Failed to fetch inactivity timeout after retries:", error);
        }
      }
    };

    fetchInactivityTimeout();
  }, [isAuthenticated]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    console.log("[InactivityTracker] resetInactivityTimer called, current timeout:", inactivityTimeout);
    
    lastActivityTime.current = Date.now();
    setIsInactive(false);
    setShowPopup(false);
    showPopupRef.current = false; // Update ref when hiding popup

    // Clear existing timers
    if (inactivityTimerRef.current) {
      console.log("[InactivityTracker] Clearing existing inactivity timer");
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (popupTimerRef.current) {
      console.log("[InactivityTracker] Clearing existing popup timer");
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    if (!inactivityTimeout) {
      console.log("[InactivityTracker] No inactivity timeout, returning early");
      return;
    }

    console.log("[InactivityTracker] Setting new inactivity timer for:", inactivityTimeout, "ms");
    
    // Set timer to show popup after inactivity period
    inactivityTimerRef.current = setTimeout(() => {
      console.log("[InactivityTracker] Inactivity period reached, showing popup");
      setIsInactive(true);
      setShowPopup(true);
      showPopupRef.current = true; // Update ref when showing popup
      
      // Note: Auto-logout is handled by the useEffect that watches showPopup
      // This timer is kept for backwards compatibility but the actual logout
      // is triggered by the useEffect hook
    }, inactivityTimeout);
  }, [inactivityTimeout]);

  // Activity detection
  useEffect(() => {
    console.log("[InactivityTracker] Activity detection effect triggered, inactivityTimeout:", inactivityTimeout);
    
    if (!inactivityTimeout) {
      console.log("[InactivityTracker] No inactivity timeout set, skipping activity detection setup");
      return;
    }

    console.log("[InactivityTracker] Setting up activity detection with timeout:", inactivityTimeout, "ms");

    // List of events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Add event listeners
    const handleActivity = (event) => {
      // While the idle warning is open, only a real click/key extends the session
      // (mousemove would dismiss it immediately).
      if (showPopupRef.current) {
        const extendsSession =
          event.type === "click" ||
          event.type === "keydown" ||
          event.type === "keypress" ||
          event.type === "touchstart";
        if (!extendsSession) return;
      }
      resetInactivityTimer();
      maybeRefreshSession();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      resetInactivityTimer();
      maybeRefreshSession();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    console.log("[InactivityTracker] Event listeners attached for:", events);

    // Initialize timer
    resetInactivityTimer();
    console.log("[InactivityTracker] Initial timer set");

    // Cleanup
    return () => {
      console.log("[InactivityTracker] Cleaning up activity detection");
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;
      }
    };
  }, [inactivityTimeout, resetInactivityTimer]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const events = ["click", "keydown", "touchstart"];
    const handle = () => {
      maybeRefreshSession();
    };
    events.forEach((event) => document.addEventListener(event, handle, true));

    const handleVisibility = () => {
      if (document.visibilityState === "visible") maybeRefreshSession();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((event) => document.removeEventListener(event, handle, true));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated]);

  const handleStayActive = useCallback(() => {
    resetInactivityTimer();
    maybeRefreshSession();
  }, [resetInactivityTimer]);

  // Store logout callback in ref so it can be accessed in timer
  const onLogoutRef = useRef(null);
  
  const setOnLogout = useCallback((callback) => {
    onLogoutRef.current = callback;
  }, []);

  // Update the popup timer to call logout when it expires
  // Use a shorter timeout for the popup (30 seconds) instead of the full inactivity timeout
  useEffect(() => {
    if (showPopup && onLogoutRef.current) {
      const POPUP_COUNTDOWN_MS = 30 * 1000; // 30 seconds for user to respond
      console.log("[InactivityTracker] Setting up auto-logout timer for popup, timeout:", POPUP_COUNTDOWN_MS, "ms");
      // Set up auto-logout timer when popup is shown
      const autoLogoutTimer = setTimeout(() => {
        console.log("[InactivityTracker] Popup timeout reached, calling logout");
        setShowPopup(false);
        showPopupRef.current = false;
        if (onLogoutRef.current) {
          onLogoutRef.current();
        }
      }, POPUP_COUNTDOWN_MS);

      return () => {
        console.log("[InactivityTracker] Cleaning up auto-logout timer");
        clearTimeout(autoLogoutTimer);
      };
    }
  }, [showPopup]);

  return {
    showPopup,
    inactivityTimeout,
    handleStayActive,
    setOnLogout,
  };
};
