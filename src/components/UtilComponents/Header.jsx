import React from "react";
import {
  MessageSquare,
  ArrowRight,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

const Header = ({ user }) => {
  return (
    <div className="bg-teal-600 text-white py-3 px-6 flex items-center justify-between w-full z-20">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <img
            src="/images/logo_white.png"
            alt="Centrum Medyczne"
            className="h-8 w-8"
          />
          <div className="ml-2">
            <h1 className="font-semibold text-lg">Centrum Medyczne</h1>
            <p className="text-xs text-white/80">
              ul. Powstańców Warszawy 7/15 26-110 Skarżysko-Kamienna
            </p>
          </div>
        </div>
        <button className="ml-1">
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md hover:bg-teal-700">
          <MessageSquare size={20} />
        </button>
        <button className="p-2 rounded-md hover:bg-teal-700">
          <ArrowRight size={20} />
        </button>
        <div className="h-6 w-px bg-teal-400 mx-2"></div>
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 rounded-full h-8 w-8 flex items-center justify-center">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="rounded-full h-8 w-8"
              />
            ) : (
              <span className="text-white font-medium">
                {user?.name?.charAt(0) || "A"}
              </span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-sm">{user?.name || "Abu Fahim"}</p>
            <p className="text-xs text-white/80">
              {user?.email || "hello@fahim.com"}
            </p>
          </div>
        </div>
        <button className="p-2 rounded-md hover:bg-teal-700">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
