import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut,
} from "lucide-react";
import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  // Use the useUser hook to access user context data
  const { user, setUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const nameInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();

    // Reset user state to null
    setUser(null);

    // Redirect to login page
    window.location.href = "/login";
  };

  const handleViewProfile = () => {
    navigate("/admin/profile");
    setIsDropdownOpen(false);
  };

  function cleanProfilePictureUrl(url) {
    // Check if it's a Google profile image
    if (url?.includes("https://lh3.googleusercontent.com/")) {
      // Remove any `=...` suffix if it exists
      return url.split("=")[0];
    }

    // Otherwise, return original URL (e.g., Cloudinary)
    return url;
  }

  return (
    <div className="bg-primary text-white py-2 px-6 flex items-center justify-between w-full z-20 shadow-md">
      <div className="flex items-center border border-white rounded-xl py-2 px-4">
        <div className="flex items-center cursor-pointer">
          <div className="h-10 w-10 flex items-center justify-center" onClick={()=>window.location.reload()}>
            <img
              src="/images/logo.png"
              alt="Centrum Medyczne"
              className="h-8"
            />
          </div>
          <div className="ml-3">
            <h1 className="font-semibold text-lg">Centrum Medyczne</h1>
            <p className="text-xs text-white/80">Polska</p>
          </div>
        </div>
        {/* <button className="ml-2 hover:bg-primary rounded-full p-1">
          <ChevronDown size={18} />
        </button> */}
      </div>

      <div className="flex items-center gap-4">
        {user?.role === "admin" && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/help-center")}
              className="p-2 hover:bg-primary rounded-lg mx-1 border border-white"
            >
              <MessageSquare size={22} />
            </button>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="h-8 w-px bg-white mx-3"></div>
        )}

        {user ? (
          <div className="flex items-center mr-2">
            {user.profilePicture ? (
              <img
                src={cleanProfilePictureUrl(user.profilePicture)}
                alt={user.name}
                className="rounded-full h-9 w-9 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-purple-600 rounded-full h-9 w-9 flex items-center justify-center">
                <span className="text-white font-medium">{nameInitial}</span>
              </div>
            )}
            <div className="ml-3">
              <p className="font-medium text-sm">{user.name || "User"}</p>
              <p className="text-xs text-white/80">
                {user.email || "No email"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center mr-2">
            <div className="bg-gray-500 rounded-full h-9 w-9 flex items-center justify-center">
              <span className="text-white font-medium">?</span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">Not logged in</p>
              <p className="text-xs text-white/80">Please sign in</p>
            </div>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 hover:bg-primary rounded-lg border border-white"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="More options"
          >
            <MoreHorizontal size={22} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleViewProfile}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User size={16} className="mr-2" />
                Zobacz profil
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Wyloguj 
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
