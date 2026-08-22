import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIdleTimer } from "react-idle-timer";
import { useUser } from "./userContext";
import appointmentConfigService from "../helpers/appointmentConfigHelper";
import { refreshAccessToken } from "../utils/axiosInstance";
import { getAccessToken, getMsUntilExpiry, getJwtWarningThresholdMs } from "../utils/jwtUtils";
import { endSession } from "../utils/sessionLifecycle";
import {
  onAccessTokenRefreshed,
  isSessionEnding,
} from "../utils/sessionEvents";
import { setSessionWarningActive } from "../utils/sessionRefresh";
import TokenExpiryPopup from "../components/UtilComponents/TokenExpiryPopup";
import InactivityPopup from "../components/UtilComponents/InactivityPopup";
import { toast } from "sonner";

const SessionContext = createContext(null);

export const useSession = () => useContext(SessionContext);

const IDLE_PROMPT_MS = 30 * 1000;
const DEFAULT_IDLE_MS = 30 * 60 * 1000;

function parseTimeoutToMs(timeoutValue) {
  if (timeoutValue === null || timeoutValue === undefined || timeoutValue === "") {
    return 0;
  }
  if (typeof timeoutValue === "number") {
    return timeoutValue > 0 ? timeoutValue * 60 * 1000 : 0;
  }
  if (typeof timeoutValue !== "string") return 0;
  const match = timeoutValue.match(/^(\d+)([mhdw])$/);
  if (!match) {
    const asNum = parseInt(timeoutValue, 10);
    return Number.isFinite(asNum) && asNum > 0 ? asNum * 60 * 1000 : 0;
  }
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "w":
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

/**
 * Single coordinator for JWT expiry warning + inactivity prompt.
 * phase: active | jwtWarning | idlePrompt | loggingOut
 */
export function SessionProvider({ children }) {
  const { isAuthenticated } = useUser();
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(null);
  const [phase, setPhase] = useState("active");
  const [jwtRemainingMs, setJwtRemainingMs] = useState(null);
  const [idlePromptRemainingMs, setIdlePromptRemainingMs] = useState(IDLE_PROMPT_MS);
  const [isExtending, setIsExtending] = useState(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  /** After a successful extend, ignore warning until this timestamp (avoids 5m-TTL reopen race). */
  const warnSuppressUntilRef = useRef(0);

  const handleEndSession = useCallback(async (reason = "manual") => {
    if (isSessionEnding() || phaseRef.current === "loggingOut") return;
    setPhase("loggingOut");
    setSessionWarningActive(false);
    await endSession(reason);
  }, []);

  // Load inactivity timeout once when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIdleTimeoutMs(null);
      setPhase("active");
      setSessionWarningActive(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
        const ms = parseTimeoutToMs(response?.data?.value);
        if (!cancelled) {
          setIdleTimeoutMs(ms > 0 ? ms : DEFAULT_IDLE_MS);
        }
      } catch {
        if (!cancelled) setIdleTimeoutMs(DEFAULT_IDLE_MS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const onPrompt = useCallback(() => {
    if (
      phaseRef.current === "jwtWarning" ||
      phaseRef.current === "loggingOut" ||
      isSessionEnding()
    ) {
      return;
    }
    setPhase("idlePrompt");
    setIdlePromptRemainingMs(IDLE_PROMPT_MS);
  }, []);

  const onIdle = useCallback(() => {
    handleEndSession("idle");
  }, [handleEndSession]);

  const idleEnabled =
    !!isAuthenticated &&
    !!idleTimeoutMs &&
    phase !== "loggingOut" &&
    !isSessionEnding();

  const { getRemainingTime, activate, reset, pause, resume } = useIdleTimer({
    timeout: idleTimeoutMs || DEFAULT_IDLE_MS,
    promptBeforeIdle: IDLE_PROMPT_MS,
    onPrompt,
    onIdle,
    crossTab: true,
    syncTimers: 200,
    disabled: !idleEnabled,
    stopOnIdle: true,
  });

  // Pause idle while JWT warning is open (mutual exclusion)
  useEffect(() => {
    if (!idleEnabled) return undefined;
    if (phase === "jwtWarning") {
      pause();
    } else if (phase === "active") {
      resume();
    }
    return undefined;
  }, [phase, idleEnabled, pause, resume]);

  // JWT remaining poll (1s)
  useEffect(() => {
    if (!isAuthenticated) {
      setJwtRemainingMs(null);
      setSessionWarningActive(false);
      if (phaseRef.current !== "loggingOut") setPhase("active");
      return undefined;
    }

    const tick = () => {
      if (isSessionEnding() || phaseRef.current === "loggingOut") return;

      const token = getAccessToken();
      if (!token) {
        setJwtRemainingMs(null);
        return;
      }

      const remaining = getMsUntilExpiry(token);
      setJwtRemainingMs(remaining);

      if (remaining === null) return;

      if (Date.now() < warnSuppressUntilRef.current) {
        if (phaseRef.current === "jwtWarning") {
          setPhase("active");
          setSessionWarningActive(false);
        }
        return;
      }

      const warningMs = getJwtWarningThresholdMs(token);

      if (remaining <= warningMs) {
        // JWT warning wins over idle prompt
        if (phaseRef.current !== "jwtWarning") {
          setPhase("jwtWarning");
        }
        setSessionWarningActive(true);
      } else if (phaseRef.current === "jwtWarning") {
        setPhase("active");
        setSessionWarningActive(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Idle prompt countdown from library remaining time
  useEffect(() => {
    if (phase !== "idlePrompt") return undefined;

    const interval = setInterval(() => {
      const remaining = Math.max(0, getRemainingTime());
      setIdlePromptRemainingMs(remaining);
      if (remaining <= 0) {
        handleEndSession("idle-prompt");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase, getRemainingTime, handleEndSession]);

  // When another tab / axios refreshes the access token, leave JWT warning
  useEffect(() => {
    return onAccessTokenRefreshed(() => {
      warnSuppressUntilRef.current = Date.now() + 2000;
      if (phaseRef.current === "jwtWarning") {
        setPhase("active");
        setSessionWarningActive(false);
      }
      const token = getAccessToken();
      if (token) {
        setJwtRemainingMs(getMsUntilExpiry(token));
      }
    });
  }, []);

  const extendSession = useCallback(async () => {
    if (isExtending || isSessionEnding()) return false;
    setIsExtending(true);
    try {
      await refreshAccessToken();
      toast.success("Sesja została przedłużona");
      warnSuppressUntilRef.current = Date.now() + 2000;
      setSessionWarningActive(false);
      setPhase("active");
      reset();
      activate();
      const token = getAccessToken();
      setJwtRemainingMs(token ? getMsUntilExpiry(token) : null);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Nie udało się przedłużyć sesji. Zostaniesz wylogowany.");
      await handleEndSession("extend-failed");
      return false;
    } finally {
      setIsExtending(false);
    }
  }, [isExtending, reset, activate, handleEndSession]);

  const stayActive = useCallback(async () => {
    if (isExtending || isSessionEnding()) return;
    setIsExtending(true);
    try {
      warnSuppressUntilRef.current = Date.now() + 2000;
      setSessionWarningActive(false);
      setPhase("active");
      activate();
      reset();
      await refreshAccessToken().catch(() => null);
      const token = getAccessToken();
      setJwtRemainingMs(token ? getMsUntilExpiry(token) : null);
    } finally {
      setIsExtending(false);
    }
  }, [isExtending, activate, reset]);

  const value = useMemo(
    () => ({
      phase,
      jwtRemainingMs,
      idlePromptRemainingMs,
      idleTimeoutMs,
      isExtending,
      extendSession,
      stayActive,
      endSession: handleEndSession,
    }),
    [
      phase,
      jwtRemainingMs,
      idlePromptRemainingMs,
      idleTimeoutMs,
      isExtending,
      extendSession,
      stayActive,
      handleEndSession,
    ]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <TokenExpiryPopup />
      <InactivityPopup />
    </SessionContext.Provider>
  );
}

export default SessionProvider;
