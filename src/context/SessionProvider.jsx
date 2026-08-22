import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIdleTimer } from "react-idle-timer";
import { useUser } from "./userContext";
import { SessionContext } from "./sessionContext";
import appointmentConfigService from "../helpers/appointmentConfigHelper";
import { refreshAccessToken, getCookie } from "../utils/axiosInstance";
import {
  getAccessToken,
  getMsUntilExpiry,
  getJwtWarningThresholdMs,
} from "../utils/jwtUtils";
import { endSession } from "../utils/sessionLifecycle";
import {
  onAccessTokenRefreshed,
  isSessionEnding,
} from "../utils/sessionEvents";
import { setSessionWarningActive } from "../utils/sessionRefresh";
import TokenExpiryPopup from "../components/UtilComponents/TokenExpiryPopup";
import InactivityPopup from "../components/UtilComponents/InactivityPopup";
import { toast } from "sonner";

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

function hasClientSession() {
  return !!(getCookie("authToken") || localStorage.getItem("authToken"));
}

/**
 * Single coordinator for JWT expiry warning + inactivity prompt.
 * phase: active | jwtWarning | idlePrompt | loggingOut
 */
export function SessionProvider({ children }) {
  const { isAuthenticated } = useUser();
  // Token presence — header countdown works from token alone; match that here.
  const sessionLive = isAuthenticated || hasClientSession();

  // Start enabled immediately; config fetch may refine the value.
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(DEFAULT_IDLE_MS);
  const [phase, setPhase] = useState("active");
  const [jwtRemainingMs, setJwtRemainingMs] = useState(null);
  const [idlePromptRemainingMs, setIdlePromptRemainingMs] = useState(IDLE_PROMPT_MS);
  const [isExtending, setIsExtending] = useState(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const warnSuppressUntilRef = useRef(0);

  const handleEndSession = useCallback(async (reason = "manual") => {
    if (isSessionEnding() || phaseRef.current === "loggingOut") return;
    setPhase("loggingOut");
    setSessionWarningActive(false);
    await endSession(reason);
  }, []);

  useEffect(() => {
    if (!sessionLive) {
      setPhase("active");
      setSessionWarningActive(false);
      setJwtRemainingMs(null);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await appointmentConfigService.getConfig(
          "INACTIVITY_TIMEOUT"
        );
        const raw =
          response?.data?.value ?? response?.value ?? response?.data?.data?.value;
        const ms = parseTimeoutToMs(raw);
        if (!cancelled && ms > 0) {
          setIdleTimeoutMs(ms);
        }
      } catch {
        /* keep DEFAULT_IDLE_MS */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionLive]);

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

  const idleTimeout = Math.max(idleTimeoutMs || DEFAULT_IDLE_MS, IDLE_PROMPT_MS + 5_000);
  const promptBeforeIdleMs = Math.min(
    IDLE_PROMPT_MS,
    Math.max(5_000, Math.floor(idleTimeout / 2) - 1_000)
  );

  const idleEnabled =
    sessionLive &&
    phase !== "loggingOut" &&
    phase !== "jwtWarning" &&
    !isSessionEnding();

  const { getRemainingTime, activate, reset, pause, resume, start } =
    useIdleTimer({
      timeout: idleTimeout,
      promptBeforeIdle: promptBeforeIdleMs,
      onPrompt,
      onIdle,
      crossTab: true,
      syncTimers: 200,
      disabled: !idleEnabled,
      stopOnIdle: true,
    });

  // When idle becomes enabled (login / leave JWT modal) or timeout changes, restart cleanly.
  // Deliberately omit start/reset/pause from deps — idle-timer may recreate those each render.
  useEffect(() => {
    if (!idleEnabled) {
      pause();
      return undefined;
    }
    start();
    resume();
    reset();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable on idleEnabled/timeout only
  }, [idleEnabled, idleTimeout]);

  // JWT remaining poll (1s) — always when a client token exists
  useEffect(() => {
    if (!sessionLive) {
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

      const warningMs = getJwtWarningThresholdMs(token);
      const expired = remaining <= 0;
      const inWarning = remaining <= warningMs;

      if (expired) {
        if (phaseRef.current !== "jwtWarning") {
          setPhase("jwtWarning");
        }
        setSessionWarningActive(true);
        return;
      }

      // Suppress only blocks re-opening after a successful extend — never when expired.
      if (Date.now() < warnSuppressUntilRef.current) {
        return;
      }

      if (inWarning) {
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
  }, [sessionLive]);

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
      <TokenExpiryPopup
        open={phase === "jwtWarning"}
        jwtRemainingMs={jwtRemainingMs}
        isExtending={isExtending}
        onExtend={extendSession}
        onLogout={() => handleEndSession("manual")}
      />
      <InactivityPopup
        open={phase === "idlePrompt"}
        idlePromptRemainingMs={idlePromptRemainingMs}
        isExtending={isExtending}
        onStayActive={stayActive}
        onLogout={() => handleEndSession("idle-manual")}
      />
    </SessionContext.Provider>
  );
}

export default SessionProvider;

export { useSession } from "./sessionContext";
