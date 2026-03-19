import React, { useState, useEffect, useRef } from "react";
import { Search, MoreHorizontal, User, Settings, LogOut, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/userContext";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import appointmentConfigService from "../../../../helpers/appointmentConfigHelper";
import { stripDoctorTitle } from "../../../../utils/statusHelper";

const SESSION_STORAGE_KEY = "cm7_session_start";

function parseSessionDurationToMs(value) {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return value * 60 * 1000;
  if (typeof value !== "string") return 0;
  const match = value.trim().match(/^(\d+)([mhdw])?$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    const unit = (match[2] || "m").toLowerCase();
    if (unit === "m") return num * 60 * 1000;
    if (unit === "h") return num * 60 * 60 * 1000;
    if (unit === "d") return num * 24 * 60 * 60 * 1000;
    if (unit === "w") return num * 7 * 24 * 60 * 60 * 1000;
  }
  return parseInt(value, 10) * 60 * 1000 || 0;
}

// Header colors: deep teal bar, white text
const HEADER_BG = "#1a7f73";
const SEARCH_DEBOUNCE_MS = 300;
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "rgba(255,255,255,0.9)";
const SEARCH_PLACEHOLDER = "#9ca3af";

function cleanProfilePictureUrl(url) {
  if (url?.includes("https://lh3.googleusercontent.com/")) {
    return url.split("=")[0];
  }
  return url;
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

const PatientDetailsHeader = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const menuRef = useRef(null);

  // Live clock
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    formatTime();
    const t = setInterval(formatTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Debounced search: fetch appointments (search by name, PESEL, phone, email)
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const response = await appointmentHelper.getAllAppointments(
          1,
          15,
          searchValue.trim(),
          {},
          "date",
          "desc"
        );
        const list = response?.data ?? [];
        setSearchResults(Array.isArray(list) ? list : []);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAppointment = (appointment) => {
    const patientId = appointment.patient_id || appointment.patient?._id || appointment.patient?.id;
    if (!patientId) return;
    setSearchValue("");
    setSearchResults([]);
    setShowDropdown(false);
    if (user?.role === "receptionist") {
      navigate(`/administracja/konta?edytujPacjenta=${patientId}&returnUrl=${encodeURIComponent(window.location.pathname)}`);
    } else {
      navigate(`/szczegoly-pacjenta/${patientId}?appointmentId=${appointment._id || appointment.id}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectAppointment(searchResults[0]);
    }
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate("/admin/profile");
  };

  const handleSettings = () => {
    setMenuOpen(false);
    navigate("/ustawienia");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.clear();
    setUser(null);
    window.location.href = "/logowanie";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name ? stripDoctorTitle(user.name) : "Użytkownik";
  const specialization = user?.role === "admin" ? "Administrator" : user?.role === "receptionist" ? "Recepcja" : (user?.specialization || user?.specialty || "");
  const initials = getInitials(user?.name);

  // Session countdown: time remaining until session ends (uses INACTIVITY_TIMEOUT from config)
  const [sessionRemainingMs, setSessionRemainingMs] = useState(null);
  const [sessionDurationMs, setSessionDurationMs] = useState(30 * 60 * 1000); // default 30 min
  const [showSessionExpiryModal, setShowSessionExpiryModal] = useState(false);
  const [sessionTimerReady, setSessionTimerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const initStart = () => {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return parseInt(stored, 10);
      const start = Date.now();
      sessionStorage.setItem(SESSION_STORAGE_KEY, String(start));
      return start;
    };
    initStart(); // ensure key exists

    const fetchDuration = async () => {
      try {
        const res = await appointmentConfigService.getConfig("INACTIVITY_TIMEOUT");
        const raw = res?.data?.value;
        const ms = parseSessionDurationToMs(raw);
        if (ms > 0 && !cancelled) setSessionDurationMs(ms);
      } catch (_) {}
    };
    fetchDuration();

    const update = () => {
      if (cancelled) return;
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const startTime = stored ? parseInt(stored, 10) : Date.now();
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, sessionDurationMs - elapsed);
      setSessionRemainingMs(remaining);
      setSessionTimerReady(true);
    };
    update();
    const t = setInterval(update, 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [sessionDurationMs]);

  // Show "session will expire soon / extend?" modal when remaining reaches 0
  useEffect(() => {
    if (sessionTimerReady && sessionRemainingMs !== null && sessionRemainingMs <= 0) {
      setShowSessionExpiryModal(true);
    }
  }, [sessionTimerReady, sessionRemainingMs]);

  const handleExtendSession = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, String(Date.now()));
    setShowSessionExpiryModal(false);
  };

  const sessionRemainingMin = sessionRemainingMs != null ? Math.ceil(sessionRemainingMs / 60000) : null;
  const sessionLabel =
    sessionRemainingMin != null
      ? sessionRemainingMin <= 0
        ? "Sesja: 0 min"
        : `Pozostało: ${sessionRemainingMin} min`
      : "Sesja: —";

  const notificationCount = 0; // TODO: wire to real notifications API

  return (
    <header
      className="w-full flex items-center justify-between gap-4 py-2.5 px-6 min-h-0 z-20 relative"
      style={{
        backgroundColor: HEADER_BG,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo - vertically centered */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="font-bold text-base uppercase tracking-tight shrink-0 flex items-center"
        style={{ color: TEXT_PRIMARY }}
        title="Odśwież stronę"
      >
        CM7MED
      </button>

      {/* Search - centered, wide, with breathing room */}
      <form onSubmit={handleSearchSubmit} className="flex-1 flex justify-center min-w-0 max-w-4xl mx-4">
        <div ref={searchContainerRef} className="relative w-full max-w-2xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 z-[1]"
            size={20}
            strokeWidth={2}
            style={{ color: SEARCH_PLACEHOLDER }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.trim() && setShowDropdown(true)}
            placeholder="Szukaj pacjenta (PESEL / Nazwisko)"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-200 focus:ring-2 focus:ring-offset-0 focus:ring-white/50 outline-none text-sm"
            style={{ color: "#1f2937" }}
          />
          {showDropdown && searchValue.trim() && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-lg bg-white border border-gray-200 shadow-lg max-h-[320px] overflow-y-auto z-20"
              role="listbox"
            >
              {searchLoading ? (
                <div className="px-4 py-3 text-gray-500 text-sm">Wyszukiwanie…</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">Brak wyników</div>
              ) : (
                searchResults.map((item) => {
                  const p = item.patient;
                  const name = p?.name ?? "—";
                  const idDisplay = p?.patientId ?? p?.govtId ?? item.patient_id ?? "—";
                  return (
                    <button
                      key={item._id || item.id}
                      type="button"
                      role="option"
                      onClick={() => handleSelectAppointment(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="font-medium text-gray-800 block truncate">{name}</span>
                      <span className="text-xs text-gray-500 truncate block">ID: {idDisplay}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </form>

      {/* Right section: Session, Notifications, User, Time */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Session countdown: time remaining until session ends */}
        <div className="flex items-center gap-1 shrink-0" style={{ color: TEXT_PRIMARY }} title="Pozostały czas sesji">
          <Clock size={16} strokeWidth={2} />
          <span className="text-xs font-medium whitespace-nowrap">{sessionLabel}</span>
        </div>

        {/* Notifications */}
        <div className="relative shrink-0">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ color: TEXT_PRIMARY }}
            aria-label="Powiadomienia"
          >
            <Bell size={18} strokeWidth={2} />
          </button>
          {notificationCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1"
              aria-hidden
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </div>

        {/* User - avatar/placeholder + name block aligned */}
        <div className="flex items-center gap-2 min-w-0">
          {user?.profilePicture ? (
            <img
              src={cleanProfilePictureUrl(user.profilePicture)}
              alt={user.name}
              className="rounded-full h-8 w-8 object-cover shrink-0 border-2 border-white"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="rounded-full h-8 w-8 min-w-[2rem] flex items-center justify-center font-semibold text-xs shrink-0 border-2 border-white"
              style={{ backgroundColor: "rgba(255,255,255,0.3)", color: TEXT_PRIMARY }}
            >
              {initials}
            </div>
          )}
          <div className="flex flex-col items-start justify-center min-w-0">
            <span className="text-xs font-semibold leading-tight truncate max-w-[120px]" style={{ color: TEXT_PRIMARY }}>
              {displayName}
            </span>
            <span className="text-[11px] leading-tight font-normal" style={{ color: TEXT_SECONDARY }}>
              {specialization}
            </span>
          </div>
        </div>

        {/* Time */}
        <span className="text-xs font-medium tabular-nums shrink-0" style={{ color: TEXT_PRIMARY }}>
          {currentTime}
        </span>

        {/* Three-dots menu: Zobacz profil, Ustawienia, Wyloguj */}
        <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1.5 rounded-lg border-2 border-white/60 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: TEXT_PRIMARY }}
          aria-label="Opcje"
        >
          <MoreHorizontal size={18} />
        </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              role="menu"
            >
              <button
                type="button"
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <User size={16} className="mr-2" />
                Zobacz profil
              </button>
              <button
                type="button"
                onClick={handleSettings}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Settings size={16} className="mr-2" />
                Ustawienia
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                role="menuitem"
              >
                <LogOut size={16} className="mr-2" />
                Wyloguj
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session expiry modal: when counter is 0 min, ask to extend or logout */}
      {showSessionExpiryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="session-expiry-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 id="session-expiry-title" className="text-lg font-semibold text-gray-900 mb-2">
              Sesja wkrótce wygaśnie
            </h2>
            <p className="text-gray-600 mb-6">
              Czas sesji dobiegł końca. Czy chcesz przedłużyć sesję i pozostać zalogowany?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSessionExpiryModal(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Wyloguj
              </button>
              <button
                type="button"
                onClick={handleExtendSession}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: HEADER_BG }}
              >
                Przedłuż sesję
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PatientDetailsHeader;
