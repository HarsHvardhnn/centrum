import { useEffect, useRef, useState, useCallback } from "react";
import appointmentConfigService from "../helpers/appointmentConfigHelper";

/**
 * Custom hook to track user inactivity
 * Monitors keyboard, mouse, touch, and scroll events
 */
export const useInactivityTracker = () => {
  const [inactivityTimeout, setInactivityTimeout] = useState(null); // in milliseconds
  const [isInactive, setIsInactive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const lastActivityTime = useRef(Date.now());
  const inactivityTimerRef = useRef(null);
  const popupTimerRef = useRef(null);

  // Fetch inactivity timeout from config
  useEffect(() => {
    const fetchInactivityTimeout = async () => {
      try {
        const response = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
        const timeoutValue = response.data?.value;
        
        if (timeoutValue) {
          // Convert to milliseconds
          // Expected format: "30m", "1h", "2h", etc.
          const timeoutMs = parseTimeToMilliseconds(timeoutValue);
          if (timeoutMs > 0) {
            setInactivityTimeout(timeoutMs);
          }
        }
      } catch (error) {
        console.error("Error fetching inactivity timeout:", error);
        // Default to 30 minutes if config not found
        // Don't set default if config doesn't exist - let it be null so feature is disabled
        // setInactivityTimeout(30 * 60 * 1000);
      }
    };

    fetchInactivityTimeout();
  }, []);

  // Parse time string to milliseconds
  const parseTimeToMilliseconds = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0;
    
    const match = timeString.match(/^(\d+)([mhd])$/);
    if (!match) return 0;
    
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
    lastActivityTime.current = Date.now();
    setIsInactive(false);
    setShowPopup(false);

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    if (!inactivityTimeout) return;

    // Set timer to show popup after inactivity period
    inactivityTimerRef.current = setTimeout(() => {
      setIsInactive(true);
      setShowPopup(true);
      
      // Give user additional time (same as inactivity timeout) to respond
      popupTimerRef.current = setTimeout(() => {
        // Auto logout if no response - this will be handled by the popup component
        setShowPopup(false);
      }, inactivityTimeout);
    }, inactivityTimeout);
  }, [inactivityTimeout]);

  // Activity detection
  useEffect(() => {
    if (!inactivityTimeout) return;

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
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [inactivityTimeout, resetInactivityTimer]);

  const handleStayActive = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  return {
    showPopup,
    inactivityTimeout,
    handleStayActive,
  };
};
