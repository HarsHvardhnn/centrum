import React, { useState, useEffect } from "react";
import { Search, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/userContext";

const HEADER_BG = "#2a9d8f";
const TOP_ACCENT = "#4bcad4";
const TEXT_LIGHT = "#89e9f2";

function cleanProfilePictureUrl(url) {
  if (url?.includes("https://lh3.googleusercontent.com/")) {
    return url.split("=")[0];
  }
  return url;
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
  const nameInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <header
      className="w-full flex items-center justify-between px-6 py-3 z-20 shadow-sm"
      style={{
        backgroundColor: HEADER_BG,
        borderTop: `3px solid ${TOP_ACCENT}`,
      }}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate("/lekarze/wizyty")}
        className="font-bold text-lg uppercase tracking-tight shrink-0"
        style={{ color: TEXT_LIGHT }}
      >
        CM7MED
      </button>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Szukaj pacjenta (PESEL / Nazwisko)"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-800 placeholder-gray-400 border-0 focus:ring-2 focus:ring-offset-0 focus:ring-white/50 outline-none"
          />
        </div>
      </form>

      {/* Right section: Session, Notifications, User, Time */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Session */}
        <div className="flex items-center gap-2" style={{ color: TEXT_LIGHT }}>
          <Clock size={20} strokeWidth={2} />
          <span className="text-sm font-medium whitespace-nowrap">
            Sesja: 14:20 min
          </span>
        </div>

        {/* Notifications */}
        <button type="button" className="relative p-1 rounded hover:opacity-90" style={{ color: TEXT_LIGHT }} aria-label="Powiadomienia">
          <Bell size={22} strokeWidth={2} />
          {notificationCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
            >
              {notificationCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          {user?.profilePicture ? (
            <img
              src={cleanProfilePictureUrl(user.profilePicture)}
              alt={user.name}
              className="rounded-full h-10 w-10 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="rounded-full h-10 w-10 flex items-center justify-center font-semibold text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.25)", color: TEXT_LIGHT }}
            >
              {nameInitial}
            </div>
          )}
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold leading-tight" style={{ color: TEXT_LIGHT }}>
              {displayName}
            </span>
            <span className="text-xs leading-tight opacity-90" style={{ color: TEXT_LIGHT }}>
              {specialization}
            </span>
          </div>
        </div>

        {/* Time */}
        <span className="text-sm font-medium tabular-nums" style={{ color: TEXT_LIGHT }}>
          {currentTime}
        </span>
      </div>
    </header>
  );
};

export default PatientDetailsHeader;
