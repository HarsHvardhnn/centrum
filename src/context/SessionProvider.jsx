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
  resetSessionEnding,
} from "../utils/sessionEvents";
import { setSessionWarningActive } from "../utils/sessionRefresh";
import {
  canUseDocumentCookies,
  isRefreshTokenInvalidError,
  isRefreshTokenMissingError,
  isSecureContext,
} from "../utils/cookieHealth";
import TokenExpiryPopup from "../components/UtilComponents/TokenExpiryPopup";
import InactivityPopup from "../components/UtilComponents/InactivityPopup";
import CookieRequiredModal from "../components/UtilComponents/CookieRequiredModal";
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
  const sessionLive = isAuthenticated || hasClientSession();

  const [idleTimeoutMs, setIdleTimeoutMs] = useState(DEFAULT_IDLE_MS);
  const [phase, setPhase] = useState("active");
  const [jwtRemainingMs, setJwtRemainingMs] = useState(null);
  const [idlePromptRemainingMs, setIdlePromptRemainingMs] = useState(IDLE_PROMPT_MS);
  const [isExtending, setIsExtending] = useState(false);
  const [cookieIssue, setCookieIssue] = useState(null);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const warnSuppressUntilRef = useRef(0);
  const sessionLiveRef = useRef(sessionLive);
  sessionLiveRef.current = sessionLive;
  const cookieProbeDoneRef = useRef(false);

  const openCookiePrompt = useCallback((issue) => {
    setCookieIssue(issue);
    setSessionWarningActive(true);
    setPhase("cookieRequired");
  }, []);

  const clearCookiePrompt = useCallback(() => {
    setCookieIssue(null);
    setSessionWarningActive(false);
    if (phaseRef.current === "cookieRequired") {
      setPhase("active");
    }
  }, []);

  const handleEndSession = useCallback(async (reason = "manual") => {
    if (isSessionEnding() || phaseRef.current === "loggingOut") return;
    setPhase("loggingOut");
    setSessionWarningActive(false);
    await endSession(reason);
  }, []);

  // Fresh login / restored session — clear stale "session ending" flag from partial logout.
  useEffect(() => {
    if (sessionLive) {
      resetSessionEnding();
    }
  }, [sessionLive, isAuthenticated]);

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

  useEffect(() => {
    if (!sessionLive) {
      cookieProbeDoneRef.current = false;
      setCookieIssue(null);
    }
  }, [sessionLive]);

  // Early warning when cookies are disabled or page is not on HTTPS.
  useEffect(() => {
    if (!sessionLive || !isAuthenticated) return undefined;
    if (cookieProbeDoneRef.current) return undefined;
    cookieProbeDoneRef.current = true;

    if (!canUseDocumentCookies()) {
      openCookiePrompt("document_blocked");
      return undefined;
    }
    if (!isSecureContext()) {
      toast.warning(
        "Otwórz aplikację przez HTTPS — bez tego sesja może nie być przedłużana."
      );
    }
    return undefined;
  }, [sessionLive, isAuthenticated, openCookiePrompt]);

  const onPrompt = useCallback(() => {
    if (
      phaseRef.current === "jwtWarning" ||
      phaseRef.current === "cookieRequired" ||
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

  const idlePaused =
    !sessionLive ||
    phase === "loggingOut" ||
    phase === "jwtWarning" ||
    phase === "cookieRequired" ||
    isSessionEnding();

  const { getRemainingTime, activate, reset, pause, start } = useIdleTimer({
    timeout: idleTimeout,
    promptBeforeIdle: promptBeforeIdleMs,
    onPrompt,
    onIdle,
    crossTab: true,
    syncTimers: 200,
    startOnMount: false,
    stopOnIdle: true,
    events: [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "visibilitychange",
    ],
  });

  const getRemainingTimeRef = useRef(getRemainingTime);
  getRemainingTimeRef.current = getRemainingTime;

  // Start / pause idle tracking when session or phase changes.
  useEffect(() => {
    if (idlePaused) {
      pause();
      return undefined;
    }
    start();
    reset();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable idle timer controls
  }, [idlePaused, idleTimeout, isAuthenticated]);

  // JWT remaining poll (1s) — runs whenever a client session exists.
  useEffect(() => {
    if (!sessionLive) {
      setJwtRemainingMs(null);
      setSessionWarningActive(false);
      if (phaseRef.current !== "loggingOut") setPhase("active");
      return undefined;
    }

    const tick = () => {
      if (!sessionLiveRef.current) return;
      if (isSessionEnding() || phaseRef.current === "loggingOut") return;
      if (phaseRef.current === "cookieRequired") return;

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
  }, [sessionLive, isAuthenticated]);

  useEffect(() => {
    if (phase !== "idlePrompt") return undefined;

    const interval = setInterval(() => {
      const remaining = Math.max(0, getRemainingTimeRef.current());
      setIdlePromptRemainingMs(remaining);
      if (remaining <= 0) {
        handleEndSession("idle-prompt");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase, handleEndSession]);

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

  const retryCookieRecovery = useCallback(async () => {
    if (isExtending || isSessionEnding()) return false;

    if (!canUseDocumentCookies()) {
      openCookiePrompt("document_blocked");
      toast.error(
        "Przeglądarka nadal blokuje pliki cookie. Zmień ustawienia i spróbuj ponownie."
      );
      return false;
    }

    setIsExtending(true);
    try {
      await refreshAccessToken();
      clearCookiePrompt();
      warnSuppressUntilRef.current = Date.now() + 2000;
      reset();
      activate();
      const token = getAccessToken();
      setJwtRemainingMs(token ? getMsUntilExpiry(token) : null);
      toast.success("Sesja została przywrócona — pliki cookie działają poprawnie.");
      return true;
    } catch (error) {
      console.error("Cookie recovery refresh failed:", error);
      if (isRefreshTokenMissingError(error)) {
        openCookiePrompt("refresh_missing");
        toast.error(
          "Token odświeżania nadal nie dociera. Sprawdź ustawienia cookie i użyj jednej karty."
        );
        return false;
      }
      if (isRefreshTokenInvalidError(error)) {
        toast.error(
          "Sesja wygasła (token nieaktualny). Zaloguj się ponownie."
        );
        await handleEndSession("extend-failed");
        return false;
      }
      toast.error("Nie udało się przywrócić sesji. Zaloguj się ponownie.");
      await handleEndSession("extend-failed");
      return false;
    } finally {
      setIsExtending(false);
    }
  }, [
    isExtending,
    openCookiePrompt,
    clearCookiePrompt,
    reset,
    activate,
    handleEndSession,
  ]);

  const extendSession = useCallback(async () => {
    if (isExtending || isSessionEnding()) return false;

    if (!canUseDocumentCookies()) {
      openCookiePrompt("document_blocked");
      return false;
    }

    setIsExtending(true);
    try {
      await refreshAccessToken();
      clearCookiePrompt();
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
      if (isRefreshTokenMissingError(error)) {
        openCookiePrompt("refresh_missing");
        return false;
      }
      if (isRefreshTokenInvalidError(error)) {
        toast.error(
          "Sesja wygasła (token odświeżania jest nieaktualny — np. druga karta lub nowe logowanie). Zaloguj się ponownie."
        );
      } else {
        toast.error("Nie udało się przedłużyć sesji. Zostaniesz wylogowany.");
      }
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
      <CookieRequiredModal
        open={phase === "cookieRequired"}
        issue={cookieIssue || "refresh_missing"}
        isSecure={isSecureContext()}
        isRetrying={isExtending}
        onRetry={retryCookieRecovery}
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
