import React, { useState, useEffect } from "react";
import { Search, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/userContext";

const HEADER_BG = "#2a9d8f";
const TOP_ACCENT = "#4bcad4";
const TEXT_PRIMARY = "#89e9f2";   // brand, session, name, time - bright light blue/cyan
const TEXT_SECONDARY = "#6dd5e0"; // profession - slightly darker cyan
const SEARCH_PLACEHOLDER = "#9ca3af"; // light grey for search icon & placeholder

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

const PatientDetailsHeader = ({ onSearchPatient, notificationCount = 3 }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [currentTime, setCurrentTime] = useState("");

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchPatient && searchValue.trim()) {
      onSearchPatient(searchValue.trim());
    }
  };

  const displayName = user?.name ? (user.role === "doctor" ? `Dr ${user.name}` : user.name) : "Użytkownik";
  const specialization = user?.role === "doctor" ? "Lekarz" : user?.role === "admin" ? "Administrator" : "Recepcja";
  const initials = getInitials(user?.name);

  return (
    <header
      className="w-full flex items-center justify-between gap-4 px-6 min-h-[56px] z-20 shadow-sm"
      style={{
        backgroundColor: HEADER_BG,
        borderTop: `3px solid ${TOP_ACCENT}`,
      }}
    >
      {/* Logo - vertically centered */}
      <button
        type="button"
        onClick={() => navigate("/lekarze/wizyty")}
        className="font-bold text-lg uppercase tracking-tight shrink-0 flex items-center"
        style={{ color: TEXT_PRIMARY }}
      >
        CM7MED
      </button>

      {/* Search - centered, aligned */}
      <form onSubmit={handleSearchSubmit} className="flex-1 flex justify-center min-w-0 max-w-xl">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={20}
            strokeWidth={2}
            style={{ color: SEARCH_PLACEHOLDER }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Szukaj pacjenta (PESEL / Nazwisko)"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-800 border border-gray-200 focus:ring-2 focus:ring-offset-0 focus:ring-white/50 outline-none"
            style={{ color: "#1f2937" }}
          />
        </div>
      </form>

      {/* Right section: Session, Notifications, User, Time - all vertically centered */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Session */}
        <div className="flex items-center gap-2 whitespace-nowrap" style={{ color: TEXT_PRIMARY }}>
          <Clock size={20} strokeWidth={2} className="shrink-0" />
          <span className="text-sm font-medium">Sesja: 14:20 min</span>
        </div>

        {/* Notifications */}
        <button type="button" className="relative p-1 rounded hover:opacity-90 flex items-center justify-center" style={{ color: TEXT_PRIMARY }} aria-label="Powiadomienia">
          <Bell size={22} strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User - avatar/placeholder + name block aligned */}
        <div className="flex items-center gap-3 min-w-0">
          {user?.profilePicture ? (
            <img
              src={cleanProfilePictureUrl(user.profilePicture)}
              alt={user.name}
              className="rounded-full h-10 w-10 object-cover shrink-0 border-2 border-white"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="rounded-full h-10 w-10 min-w-[2.5rem] flex items-center justify-center font-semibold text-sm shrink-0 border-2 border-white"
              style={{ backgroundColor: "rgba(255,255,255,0.3)", color: TEXT_PRIMARY }}
            >
              {initials}
            </div>
          )}
          <div className="flex flex-col items-start justify-center min-w-0">
            <span className="text-sm font-semibold leading-tight truncate max-w-[140px]" style={{ color: TEXT_PRIMARY }}>
              {displayName}
            </span>
            <span className="text-xs leading-tight font-normal" style={{ color: TEXT_SECONDARY }}>
              {specialization}
            </span>
          </div>
        </div>

        {/* Time */}
        <span className="text-sm font-medium tabular-nums shrink-0" style={{ color: TEXT_PRIMARY }}>
          {currentTime}
        </span>
      </div>
    </header>
  );
};

export default PatientDetailsHeader;
