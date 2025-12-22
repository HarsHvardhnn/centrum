import { useEffect, useRef, useState, useCallback } from "react";
import appointmentConfigService from "../helpers/appointmentConfigHelper";
import { useUser } from "../context/userContext";
import { getCookie } from "../utils/axiosInstance";

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

  // Fetch inactivity timeout from config - only when authenticated
  useEffect(() => {
    // console.log("[InactivityTracker] useEffect triggered, isAuthenticated:", isAuthenticated);
    
    // Check if user is authenticated before fetching config
    const token = getCookie('authToken') || localStorage.getItem('authToken');
    // console.log("[InactivityTracker] Token check - hasToken:", !!token, "isAuthenticated:", isAuthenticated);
    
    if (!isAuthenticated && !token) {
      // console.log("[InactivityTracker] Not authenticated and no token, skipping fetch");
      return; // Don't fetch if not authenticated
    }

    const fetchInactivityTimeout = async (retryAttempt = 0) => {
      // console.log(`[InactivityTracker] Fetching config, attempt ${retryAttempt + 1}/${maxRetries + 1}`);
      
      try {
        const response = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
        // console.log("[InactivityTracker] Config response received:", response);
        
        const timeoutValue = response.data?.value;
        // console.log("[InactivityTracker] Timeout value from config:", timeoutValue, "type:", typeof timeoutValue);
        
        if (timeoutValue !== null && timeoutValue !== undefined && timeoutValue !== '') {
          // Convert to milliseconds
          // Handle both string format ("30m", "1h") and number format (assumed to be minutes)
          let timeoutMs = 0;
          
          if (typeof timeoutValue === 'number') {
            // If it's a number, assume it's minutes
            timeoutMs = timeoutValue * 60 * 1000;
            // console.log("[InactivityTracker] Number format detected, converted to ms:", timeoutMs);
          } else if (typeof timeoutValue === 'string') {
            // If it's a string, parse it
            timeoutMs = parseTimeToMilliseconds(timeoutValue);
            // console.log("[InactivityTracker] String format detected, parsed to ms:", timeoutMs);
          }
          
          if (timeoutMs > 0) {
            // console.log("[InactivityTracker] Setting inactivity timeout to:", timeoutMs, "ms");
            setInactivityTimeout(timeoutMs);
            retryCountRef.current = 0; // Reset retry count on success
          } else {
            // console.warn("[InactivityTracker] Timeout value is 0 or invalid, not setting");
          }
        } else {
          // console.warn("[InactivityTracker] Timeout value is null/undefined/empty:", timeoutValue);
        }
      } catch (error) {
        // console.error("[InactivityTracker] Error fetching inactivity timeout:", error);
        // console.error("[InactivityTracker] Error details:", {
        //   message: error.message,
        //   status: error.response?.status,
        //   statusText: error.response?.statusText,
        //   data: error.response?.data,
        //   hasResponse: !!error.response
        // });
        
        // Retry logic for network errors or 401s (might be token refresh in progress)
        if (retryAttempt < maxRetries && (error.response?.status === 401 || !error.response)) {
          const delay = (retryAttempt + 1) * 1000; // Exponential backoff: 1s, 2s, 3s
          // console.log(`[InactivityTracker] Retrying in ${delay}ms...`);
          setTimeout(() => {
            fetchInactivityTimeout(retryAttempt + 1);
          }, delay);
        } else {
          // If all retries failed or it's a different error, log it
          // console.error("[InactivityTracker] Failed to fetch inactivity timeout after retries:", error);
        }
      }
    };

    fetchInactivityTimeout();
  }, [isAuthenticated]);

  // Parse time string to milliseconds
  const parseTimeToMilliseconds = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return 0;
    }
    
    const match = timeString.match(/^(\d+)([mhd])$/);
    if (!match) {
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
      default:
        return 0;
    }
  };

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // console.log("[InactivityTracker] resetInactivityTimer called, current timeout:", inactivityTimeout);
    
    lastActivityTime.current = Date.now();
    setIsInactive(false);
    setShowPopup(false);
    showPopupRef.current = false; // Update ref when hiding popup

    // Clear existing timers
    if (inactivityTimerRef.current) {
      // console.log("[InactivityTracker] Clearing existing inactivity timer");
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (popupTimerRef.current) {
      // console.log("[InactivityTracker] Clearing existing popup timer");
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    if (!inactivityTimeout) {
      // console.log("[InactivityTracker] No inactivity timeout, returning early");
      return;
    }

    // console.log("[InactivityTracker] Setting new inactivity timer for:", inactivityTimeout, "ms");
    
    // Set timer to show popup after inactivity period
    inactivityTimerRef.current = setTimeout(() => {
      // console.log("[InactivityTracker] Inactivity period reached, showing popup");
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
    // console.log("[InactivityTracker] Activity detection effect triggered, inactivityTimeout:", inactivityTimeout);
    
    if (!inactivityTimeout) {
      // console.log("[InactivityTracker] No inactivity timeout set, skipping activity detection setup");
      return;
    }

    // console.log("[InactivityTracker] Setting up activity detection with timeout:", inactivityTimeout, "ms");

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
    const handleActivity = () => {
      // Don't reset timer if popup is showing - user must click button to stay active
      if (showPopupRef.current) {
        // console.log("[InactivityTracker] Activity detected but popup is showing, ignoring activity");
        return;
      }
      // console.log("[InactivityTracker] Activity detected, resetting timer");
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // console.log("[InactivityTracker] Event listeners attached for:", events);

    // Initialize timer
    resetInactivityTimer();
    // console.log("[InactivityTracker] Initial timer set");

    // Cleanup
    return () => {
      // console.log("[InactivityTracker] Cleaning up activity detection");
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
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

  const handleStayActive = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Store logout callback in ref so it can be accessed in timer
  const onLogoutRef = useRef(null);
  
  const setOnLogout = useCallback((callback) => {
    onLogoutRef.current = callback;
  }, []);

  // Update the popup timer to call logout when it expires
  useEffect(() => {
    if (showPopup && inactivityTimeout && onLogoutRef.current) {
      // console.log("[InactivityTracker] Setting up auto-logout timer for popup, timeout:", inactivityTimeout, "ms");
      // Set up auto-logout timer when popup is shown
      const autoLogoutTimer = setTimeout(() => {
        // console.log("[InactivityTracker] Popup timeout reached, calling logout");
        setShowPopup(false);
        showPopupRef.current = false;
        if (onLogoutRef.current) {
          onLogoutRef.current();
        }
      }, inactivityTimeout);

      return () => {
        // console.log("[InactivityTracker] Cleaning up auto-logout timer");
        clearTimeout(autoLogoutTimer);
      };
    }
  }, [showPopup, inactivityTimeout]);

  return {
    showPopup,
    inactivityTimeout,
    handleStayActive,
    setOnLogout,
  };
};
