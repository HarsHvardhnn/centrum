import React, { useEffect, useState } from "react";
import { HeartPulse, ArrowLeft, Home } from "lucide-react";
import { useNavigation,ROUTES } from "../../utils/useNavigate";

export default function NotFound404() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [animation, setAnimation] = useState(false);

  const { goBack, navigate } = useNavigation();
  useEffect(() => {
    setAnimation(true);

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-teal-100 rounded-full opacity-20"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-teal-200 rounded-full opacity-20"></div>
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 bg-teal-200 rounded-full opacity-30 transition-all duration-1000 ${
            animation ? "transform translate-x-16 translate-y-16" : ""
          }`}
        ></div>
      </div>

      {/* Hospital Logo - Fixed at top */}
      <div className="fixed top-6 left-6 flex items-center z-10">
        <div className="bg-teal-500 rounded-full p-3">
          <div className="text-white">
            <HeartPulse className="h-6 w-6" />
          </div>
        </div>
        <span className="ml-3 text-teal-500 font-medium text-xl">
          Northern Central Clinic
        </span>
      </div>

      {/* Main 404 Content */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center px-6">
        <div
          className="flex flex-col items-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <div className="relative mb-8">
            <svg
              className="w-48 h-48 text-teal-200"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <circle cx="50" cy="50" r="40" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-bold text-teal-600">404</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Page Not Found
          </h1>

          <p className="text-xl text-gray-600 text-center mb-12 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors w-full text-lg"
              onClick={goBack}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>

            <button onClick={() => {
              navigate(ROUTES.DASHBOARD)
            }} className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 transition-colors w-full text-lg">
              <Home className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Help center button */}
        <div className="mt-16 bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-gray-600 text-lg text-center mb-4">
            Need help finding what you need?
          </div>
          <button className="bg-teal-500 text-white rounded-lg px-6 py-3 text-lg w-full hover:bg-teal-600 transition-colors">
            Go to help center
          </button>
        </div>
      </div>
    </div>
  );
}
