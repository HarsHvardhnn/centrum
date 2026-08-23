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
  onInactivityTimeoutUpdated,
  isSessionEnding,
  resetSessionEnding,
} from "../utils/sessionEvents";
import {
  extractAppointmentConfigValue,
  inactivityMinutesToMs,
  parseInactivityTimeoutMinutes,
} from "../utils/inactivityConfig";
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
  const idlePromptDeadlineRef = useRef(0);
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

  const applyInactivityTimeoutMs = useCallback((ms) => {
    if (Number.isFinite(ms) && ms > 0) {
      setIdleTimeoutMs(ms);
    }
  }, []);

  // Load inactivity timeout from API; re-fetch on tab focus and periodically so
  // admin changes apply without a full page reload.
  useEffect(() => {
    if (!sessionLive) {
      setPhase("active");
      setSessionWarningActive(false);
      setJwtRemainingMs(null);
      return undefined;
    }

    let cancelled = false;

    const loadInactivityTimeout = async () => {
      try {
        const response = await appointmentConfigService.getConfig(
          "INACTIVITY_TIMEOUT"
        );
        const raw = extractAppointmentConfigValue(response);
        const minutes = parseInactivityTimeoutMinutes(raw, 0);
        const ms = inactivityMinutesToMs(minutes);
        if (!cancelled && ms > 0) {
          applyInactivityTimeoutMs(ms);
        }
      } catch {
        /* keep current idleTimeoutMs */
      }
    };

    loadInactivityTimeout();
    const intervalId = setInterval(loadInactivityTimeout, 5 * 60 * 1000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadInactivityTimeout();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionLive, applyInactivityTimeoutMs]);

  useEffect(() => {
    return onInactivityTimeoutUpdated((ms) => {
      applyInactivityTimeoutMs(ms);
    });
  }, [applyInactivityTimeoutMs]);

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

  const idleTimeout = Math.max(idleTimeoutMs || DEFAULT_IDLE_MS, IDLE_PROMPT_MS + 5_000);
  const promptBeforeIdleMs = Math.min(
    IDLE_PROMPT_MS,
    Math.max(5_000, Math.floor(idleTimeout / 2) - 1_000)
  );

  const onPrompt = useCallback(() => {
    if (
      phaseRef.current === "jwtWarning" ||
      phaseRef.current === "cookieRequired" ||
      phaseRef.current === "loggingOut" ||
      phaseRef.current === "idlePrompt" ||
      isSessionEnding()
    ) {
      return;
    }
    idlePromptDeadlineRef.current = Date.now() + promptBeforeIdleMs;
    setIdlePromptRemainingMs(promptBeforeIdleMs);
    setSessionWarningActive(true);
    setPhase("idlePrompt");
  }, [promptBeforeIdleMs]);

  const onIdle = useCallback(() => {
    handleEndSession("idle");
  }, [handleEndSession]);

  const idlePaused =
    !sessionLive ||
    phase === "loggingOut" ||
    phase === "jwtWarning" ||
    phase === "cookieRequired" ||
    phase === "idlePrompt" ||
    isSessionEnding();

  const { activate, reset, pause, start } = useIdleTimer({
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
      if (phaseRef.current === "idlePrompt") return;

      const token = getAccessToken();
      if (!token) {
        setJwtRemainingMs(null);
        return;
      }

      const remaining = getMsUntilExpiry(token);
      setJwtRemainingMs(remaining);

      if (remaining === null) return;

      // After extend / stay-active, ignore stale expiry reads briefly
      if (Date.now() < warnSuppressUntilRef.current) {
        if (phaseRef.current === "jwtWarning") {
          setPhase("active");
          setSessionWarningActive(false);
        }
        return;
      }

      const warningMs = getJwtWarningThresholdMs(token);
      const expired = remaining <= 0;
      const inWarning = remaining <= warningMs;

      if (expired || inWarning) {
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
      const remaining = idlePromptDeadlineRef.current - Date.now();
      setIdlePromptRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) {
        handleEndSession("idle-prompt");
      }
    }, 250);

    return () => clearInterval(interval);
  }, [phase, handleEndSession]);

  useEffect(() => {
    return onAccessTokenRefreshed(() => {
      warnSuppressUntilRef.current = Date.now() + 5000;
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
      warnSuppressUntilRef.current = Date.now() + 5000;
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
      warnSuppressUntilRef.current = Date.now() + 5000;
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
      warnSuppressUntilRef.current = Date.now() + 5000;
      setSessionWarningActive(false);
      setPhase("active");
      idlePromptDeadlineRef.current = 0;
      reset();
      activate();

      try {
        await refreshAccessToken();
      } catch (error) {
        console.warn("Idle stay-active refresh failed:", error);
        if (isRefreshTokenMissingError(error)) {
          openCookiePrompt("refresh_missing");
          return;
        }
        if (isRefreshTokenInvalidError(error)) {
          toast.error(
            "Sesja wygasła — zaloguj się ponownie."
          );
          await handleEndSession("extend-failed");
          return;
        }
      }

      const token = getAccessToken();
      setJwtRemainingMs(token ? getMsUntilExpiry(token) : null);
    } finally {
      setIsExtending(false);
    }
  }, [isExtending, activate, reset, openCookiePrompt, handleEndSession]);

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
