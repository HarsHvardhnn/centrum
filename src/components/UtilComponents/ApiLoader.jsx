import React, { useEffect, useState } from "react";
import { Activity, Loader2, HeartPulse } from "lucide-react";

export default function FullScreenLoader({
  type = "medical", // Options: "medical", "circles", "wave"
  message = "Loading...",
  subMessage = "Please wait while we fetch your data",
}) {
  const [progress, setProgress] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 8) + 1;
        return prev + increment > 100 ? 100 : prev + increment;
      });
    }, 400);

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.3 : 1));
    }, 700);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  // Medical theme loader with heart pulse animation
  const renderMedicalLoader = () => (
    <>
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center">
          <div
            className="text-teal-500 transition-transform duration-500 ease-in-out"
            style={{ transform: `scale(${pulseScale})` }}
          >
            <HeartPulse size={40} />
          </div>
        </div>

        {/* Circular progress */}
        <svg
          className="absolute -top-4 -left-4 -right-4 -bottom-4 w-32 h-32"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            transform="rotate(-90 50 50)"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Processing</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              progress > 50 ? "bg-teal-500 animate-pulse" : "bg-gray-200"
            }`}
          ></div>
          <span
            className={`text-sm ${
              progress > 50 ? "text-gray-500" : "text-gray-300"
            }`}
          >
            Analyzing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              progress > 80 ? "bg-teal-500 animate-pulse" : "bg-gray-200"
            }`}
          ></div>
          <span
            className={`text-sm ${
              progress > 80 ? "text-gray-500" : "text-gray-300"
            }`}
          >
            Finalizing
          </span>
        </div>
      </div>
    </>
  );

  // Circles animation loader
  const renderCirclesLoader = () => (
    <div className="relative mb-8">
      <div className="flex space-x-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="w-4 h-4 bg-teal-500 rounded-full"
            style={{
              animation: `bounce 1.4s ease-in-out ${
                index * 0.16
              }s infinite both`,
            }}
          ></div>
        ))}
      </div>

      {/* Percentage indicator */}
      <div className="mt-6 text-4xl font-bold text-teal-500">{progress}%</div>
    </div>
  );

  // Wave animation loader
  const renderWaveLoader = () => (
    <div className="mb-8">
      <div className="flex items-end justify-center space-x-1 h-20 mb-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-teal-500 w-3 rounded-t-md"
            style={{
              height: `${Math.max(
                15,
                Math.sin((i + progress) * 0.5) * 50 + 20
              )}px`,
              transition: "height 0.3s ease",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-60 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center px-4">
        {/* Logo section */}
        <div className="mb-6 flex items-center gap-2">
          <div className="bg-teal-500 rounded-full p-2">
            <div className="text-white">
              <HeartPulse size={20} />
            </div>
          </div>
          <span className="text-teal-600 font-medium">
            Northern Central Clinic
          </span>
        </div>

        {/* Loader variations */}
        {type === "medical" && renderMedicalLoader()}
        {type === "circles" && renderCirclesLoader()}
        {type === "wave" && renderWaveLoader()}

        {/* Message */}
        <h2 className="text-xl font-medium text-gray-800 mb-2">{message}</h2>

        <p className="text-gray-500 mb-6">{subMessage}</p>

        {/* Additional visual elements */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-400">
          System is responding
        </div>

        {/* Background decorations */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-teal-50 rounded-full opacity-50"></div>
        <div className="absolute top-1/4 -left-8 w-32 h-32 bg-teal-50 rounded-full opacity-50"></div>
      </div>
    </div>
  );
}
