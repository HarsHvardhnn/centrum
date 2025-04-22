import React from "react";
import {
  MessageSquare,
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { useUser } from "../../context/userContext";


const Header = () => {
  // Use the useUser hook to access user context data
  const { user } = useUser();
  console.log("user",user.profilePicture)

  const nameInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

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
          <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">N</span>
          </div>
          <div className="ml-3">
            <h1 className="font-semibold text-lg">Northern Central Clinic</h1>
            <p className="text-xs text-white/80">Poland</p>
          </div>
        </div>
        <button className="ml-2 hover:bg-primary rounded-full p-1">
          <ChevronDown size={18} />
        </button>
      </div>

      <div className="flex items-center w-[30%] gap-8 ">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-primary rounded-lg mx-1 border border-white">
            <MessageSquare size={22} />
          </button>
          <button className="p-2 hover:bg-primary rounded-lg mx-1 border border-white">
            <ArrowRight size={22} />
          </button>
        </div>
          <div className="h-8 w-px bg-white mx-3"></div>

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

        <button className="p-2 hover:bg-primary rounded-lg border border-white">
          <MoreHorizontal size={22} />
        </button>
      </div>
    </div>
  );
};

export default Header;
