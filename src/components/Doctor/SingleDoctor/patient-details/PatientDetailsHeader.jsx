import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/userContext";
import appointmentHelper from "../../../../helpers/appointmentHelper";

const HEADER_BG = "#2a9d8f";
const SEARCH_DEBOUNCE_MS = 300;
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

const PatientDetailsHeader = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

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
    navigate(`/szczegoly-pacjenta/${patientId}?appointmentId=${appointment._id || appointment.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectAppointment(searchResults[0]);
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

      {/* Search - centered, wide */}
      <form onSubmit={handleSearchSubmit} className="flex-1 flex justify-center min-w-0 max-w-4xl">
        <div ref={searchContainerRef} className="relative w-full">
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
            placeholder="Szukaj pacjenta (PESEL / Nazwisko / telefon / email)"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-800 border border-gray-200 focus:ring-2 focus:ring-offset-0 focus:ring-white/50 outline-none"
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

      {/* Right section: User, Time */}
      <div className="flex items-center gap-5 shrink-0">
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
